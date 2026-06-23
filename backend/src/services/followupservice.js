import cron from 'node-cron';
import { Op } from 'sequelize';
import OfferFollowup from '../../models/OfferFollowup.js';
import ConfiguratorDraft from '../../models/ConfiguratorDraft.js';
import Offer from '../../models/Offer.js';
import FollowupLog from '../../models/FollowupLog.js';
import User from '../../models/User.js';
import Project from '../../models/Project.js';
import * as notificationService from './notificationservice.js';
import models from '../../models/index.js';
import {
    FOLLOWUP_CONTEXTS,
    OFFER_REMINDER_ELIGIBLE_STATUSES,
    getConfiguredFollowupCadenceDays,
    getConfiguredFollowupPattern,
    isSmsFollowupEnabled,
} from '../constants/followup.js';
import { normalizeOfferStatus } from '../constants/offerStatus.js';

function parseBooleanEnv(value, fallback = false) {
    if (value == null || value === '') return fallback;
    return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

function parseReminderIndex(status) {
    const s = String(status || '').toLowerCase();
    const m = s.match(/^(?:reminded|attempted)(?:[_:](\d+))?$/);
    if (!m) return 0;
    const n = m[1] ? parseInt(m[1], 10) : 1;
    return Number.isFinite(n) ? n : 1;
}

function parsePatternDays(pattern) {
    return getConfiguredFollowupCadenceDays(pattern);
}

function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function applyTemplatePlaceholders(template, vars) {
    const repl = (input) =>
        String(input || '').replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? String(vars[key]) : ''));
    return {
        subject: repl(template?.subject),
        body: repl(template?.body),
    };
}

async function resolveTemplate({ channel, step, language }) {
    const lang = (language === 'ro' || language === 'en') ? language : 'en';
    const rows = await models.FollowupTemplate.findAll({
        where: { isActive: true, channel, step },
        order: [['updatedAt', 'DESC']],
    });
    if (!rows?.length) return null;
    const exact = rows.find((row) => row.language === lang);
    return (exact || rows[0]).toJSON ? (exact || rows[0]).toJSON() : (exact || rows[0]);
}

function getDefaultOfferReminderContent({ language, name, offerNumber, offerUrl }) {
    if (language === 'ro') {
        return {
            subject: 'Te asteptam sa finalizezi oferta Smart Home',
            emailBody: `Salut ${name},\n\nOferta ta ${offerNumber} este gata, dar nu a fost inca transformata in comanda. O poti revizui aici: ${offerUrl}\n\nCu stima,\nEchipa Smart Home`,
            smsBody: `Salut ${name}! Oferta ta ${offerNumber} este inca disponibila. Revizuieste aici: ${offerUrl}`,
        };
    }

    return {
        subject: 'Complete your Smart Home offer',
        emailBody: `Hi ${name},\n\nYour offer ${offerNumber} is ready, but it has not yet been converted into an order. You can review it here: ${offerUrl}\n\nBest regards,\nSmart Home Team`,
        smsBody: `Hi ${name}! Your offer ${offerNumber} is still waiting for your decision. Review it here: ${offerUrl}`,
    };
}

function getDefaultDraftReminderContent({ language, name, projectName, configuratorUrl }) {
    if (language === 'ro') {
        return {
            subject: 'Continua configurarea proiectului tau Smart Home',
            emailBody: `Salut ${name},\n\nAi inceput configurarea proiectului ${projectName}, dar nu ai finalizat-o inca. Poti continua de unde ai ramas aici: ${configuratorUrl}\n\nCu stima,\nEchipa Smart Home`,
            smsBody: `Salut ${name}! Configurarea proiectului ${projectName} te asteapta. Continua aici: ${configuratorUrl}`,
        };
    }

    return {
        subject: 'Continue your Smart Home configuration',
        emailBody: `Hi ${name},\n\nYou started configuring ${projectName}, but it has not been finished yet. You can continue where you left off here: ${configuratorUrl}\n\nBest regards,\nSmart Home Team`,
        smsBody: `Hi ${name}! Your Smart Home configuration for ${projectName} is waiting. Continue here: ${configuratorUrl}`,
    };
}

function getLanguage(source) {
    return source === 'ro' ? 'ro' : 'en';
}

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function normalizeProjectId(value) {
    return isUuid(value) ? value : null;
}

function buildLogIdentity({ context, userId, offerId = null, configuratorDraftId = null, cadenceDay, channel }) {
    return {
        context,
        userId,
        ...(offerId ? { offerId } : { offerId: null }),
        ...(configuratorDraftId ? { configuratorDraftId } : { configuratorDraftId: null }),
        cadenceDay,
        channel,
    };
}

function isUniqueConstraintError(error) {
    return error?.name === 'SequelizeUniqueConstraintError' || error?.parent?.code === '23505';
}

async function findExistingFollowupLog(identity) {
    return FollowupLog.findOne({ where: identity, order: [['createdAt', 'ASC']] });
}

async function reserveFollowupLog(entry) {
    const identity = buildLogIdentity(entry);
    const existing = await findExistingFollowupLog(identity);
    if (existing) {
        return { log: existing, created: false, alreadySent: existing.status === 'sent' };
    }

    const payload = {
        ...entry,
        projectId: normalizeProjectId(entry.projectId),
        status: 'skipped',
        reason: entry.reason || null,
        errorMessage: entry.errorMessage || null,
        sentAt: null,
    };

    try {
        const log = await FollowupLog.create(payload);
        return { log, created: true, alreadySent: false };
    } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
        const existing = await findExistingFollowupLog(identity);
        return { log: existing, created: false, alreadySent: existing?.status === 'sent' };
    }
}

function buildDeliveryMeta(delivery) {
    if (!delivery) return null;
    return {
        provider: delivery.provider || null,
        delivered: Boolean(delivery.delivered),
        mocked: Boolean(delivery.mocked),
        externalId: delivery.externalId || null,
        reason: delivery.reason || null,
        to: delivery.to || null,
    };
}

async function updateReservedLog(log, { status, delivery = null, errorMessage = null, reason = null }) {
    if (!log) return;
    await log.update({
        status,
        provider: delivery?.provider || null,
        providerMessageId: delivery?.externalId || null,
        deliveryMeta: buildDeliveryMeta(delivery),
        reason: reason || log.reason || null,
        errorMessage,
        sentAt: status === 'sent' ? new Date() : null,
    });
}

async function skipReminderChannel({ logEntry, message }) {
    const reservation = await reserveFollowupLog({
        ...logEntry,
        status: 'skipped',
        errorMessage: message,
    });
    if (reservation.created && reservation.log) {
        await updateReservedLog(reservation.log, {
            status: 'skipped',
            errorMessage: message,
            reason: logEntry.reason,
        });
    }
    return {
        sent: reservation.alreadySent,
        attempted: true,
        skipped: !reservation.alreadySent,
        duplicate: !reservation.created,
    };
}

async function deliverReminderChannel({
    logEntry,
    enabled,
    missingContactMessage,
    disabledMessage = null,
    send,
}) {
    if (!enabled) {
        return skipReminderChannel({ logEntry, message: disabledMessage || 'Follow-up channel is disabled.' });
    }

    if (!logEntry.target) {
        return skipReminderChannel({ logEntry, message: missingContactMessage });
    }

    const reservation = await reserveFollowupLog(logEntry);
    if (!reservation.created) {
        return {
            sent: reservation.alreadySent,
            attempted: Boolean(reservation.log),
            duplicate: true,
        };
    }

    try {
        const delivery = await send();
        const delivered = Boolean(delivery?.delivered);
        await updateReservedLog(reservation.log, {
            status: delivered ? 'sent' : 'skipped',
            delivery,
            errorMessage: delivered ? null : (delivery?.reason || 'Provider did not report confirmed delivery.'),
            reason: logEntry.reason,
        });
        return { sent: delivered, attempted: true, duplicate: false };
    } catch (error) {
        console.error(`[FOLLOW-UP] ${logEntry.channel.toUpperCase()} reminder channel failed for ${logEntry.target}:`, error.message);
        await updateReservedLog(reservation.log, {
            status: 'failed',
            errorMessage: error?.message || `${logEntry.channel} reminder failed`,
            reason: logEntry.reason,
        });
        return { sent: false, attempted: true, duplicate: false };
    }
}

async function deliverReminderChannels({
    context,
    reason,
    reminderStep,
    cadenceDay,
    projectId = null,
    offerId = null,
    configuratorDraftId = null,
    channelEmail,
    channelSms,
    user,
    subject,
    emailBody,
    smsBody,
    emailTemplate = null,
    smsTemplate = null,
}) {
    let sentAny = false;
    let attemptedAny = false;
    const smsEnabledByEnv = isSmsFollowupEnabled();
    const common = {
        context,
        projectId,
        offerId,
        configuratorDraftId,
        userId: user?.id || null,
        reminderStep,
        cadenceDay,
        reason,
    };

    const emailResult = await deliverReminderChannel({
        logEntry: {
            ...common,
            channel: 'email',
            templateId: emailTemplate?.id || null,
            target: user?.email || null,
            subject,
            body: emailBody,
        },
        enabled: Boolean(channelEmail),
        missingContactMessage: 'Missing customer email for follow-up delivery.',
        send: () => notificationService.sendReminderEmail(user.email, subject, emailBody),
    });
    sentAny = sentAny || emailResult.sent;
    attemptedAny = attemptedAny || emailResult.attempted;

    const shouldRecordSmsSkip = !smsEnabledByEnv && (channelSms || user?.phone);
    if (channelSms || shouldRecordSmsSkip) {
        const smsResult = await deliverReminderChannel({
            logEntry: {
                ...common,
                channel: 'sms',
                templateId: smsTemplate?.id || null,
                target: user?.phone || null,
                subject: null,
                body: smsBody,
            },
            enabled: Boolean(channelSms) && smsEnabledByEnv,
            disabledMessage: smsEnabledByEnv
                ? 'SMS follow-up channel is disabled for this reminder.'
                : 'SMS follow-up is disabled by configuration; set FOLLOWUP_SMS_ENABLED=true to allow Twilio reminders.',
            missingContactMessage: 'Missing customer phone for follow-up delivery.',
            send: () => notificationService.sendReminderSms(user.phone, smsBody),
        });
        sentAny = sentAny || smsResult.sent;
        attemptedAny = attemptedAny || smsResult.attempted;
    }

    return { sentAny, attemptedAny };
}

function computeNextReminderAt(baseDate, patternDays, nextIndex) {
    const nextTargetDay = patternDays[nextIndex] ?? null;
    return nextTargetDay != null ? addDays(baseDate, nextTargetDay) : null;
}

export const initFollowupCron = () => {
    const enabled = parseBooleanEnv(process.env.FOLLOWUP_CRON_ENABLED, true);
    if (!enabled) {
        console.log('[FOLLOW-UP] Cron disabled via FOLLOWUP_CRON_ENABLED.');
        return;
    }

    const schedule = String(process.env.FOLLOWUP_CRON_SCHEDULE || '0 10 * * *').trim();
    const timezone = String(process.env.FOLLOWUP_CRON_TIMEZONE || '').trim() || undefined;

    if (!cron.validate(schedule)) {
        console.error(`[FOLLOW-UP] Invalid FOLLOWUP_CRON_SCHEDULE: "${schedule}". Follow-up cron not started.`);
        return;
    }

    cron.schedule(schedule, async () => {
        console.log('[FOLLOW-UP] Running scheduled follow-up job...');
        await processFollowups();
    }, timezone ? { timezone } : undefined);

    console.log(`[FOLLOW-UP] Cron initialized (${schedule}${timezone ? `, tz=${timezone}` : ''}).`);
};

export async function syncOfferFollowup(offerId, offerStatus, transaction = undefined) {
    const normalizedStatus = normalizeOfferStatus(offerStatus || 'draft');
    const eligible = OFFER_REMINDER_ELIGIBLE_STATUSES.includes(normalizedStatus);
    const followup = await OfferFollowup.findOne({ where: { offerId }, transaction });

    if (!eligible) {
        if (followup) {
            await followup.update({
                enabled: false,
                nextReminderAt: null,
                status: normalizedStatus === 'ordered' || normalizedStatus === 'cancelled' ? 'completed' : followup.status,
                reason: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
            }, { transaction });
        }
        return followup;
    }

    const offer = await Offer.findByPk(offerId, {
        attributes: ['id', 'generatedAt', 'createdAt'],
        transaction,
    });
    const baseDate = offer?.generatedAt
        ? new Date(offer.generatedAt)
        : new Date(offer?.createdAt || Date.now());
    const pattern = getConfiguredFollowupPattern();
    const [firstCadenceDay] = parsePatternDays(pattern);

    const defaults = {
        enabled: true,
        pattern,
        reason: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
        channelEmail: true,
        channelSms: false,
        nextReminderAt: addDays(baseDate, firstCadenceDay),
    };

    if (followup) {
        await followup.update({
            enabled: true,
            pattern: followup.pattern || pattern,
            reason: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
            nextReminderAt: followup.nextReminderAt || defaults.nextReminderAt,
        }, { transaction });
        return followup;
    }

    return OfferFollowup.create({ offerId, ...defaults }, { transaction });
}

async function processOfferFollowups(now) {
    const pendingFollowups = await OfferFollowup.findAll({
        where: {
            enabled: true,
            [Op.or]: [
                { snoozedUntil: null },
                { snoozedUntil: { [Op.lte]: now } },
            ],
            [Op.and]: [{
                [Op.or]: [
                    { status: 'pending' },
                    { status: 'reminded' },
                    { status: 'attempted' },
                    { status: { [Op.like]: 'reminded_%' } },
                    { status: { [Op.like]: 'attempted_%' } },
                ],
            }],
            nextReminderAt: { [Op.lte]: now },
        },
        include: [{
            model: Offer,
            as: 'offer',
            where: { status: { [Op.in]: OFFER_REMINDER_ELIGIBLE_STATUSES } },
            include: [{
                model: Project,
                as: 'project',
                include: [{ model: User, as: 'user' }],
            }],
        }],
    });

    for (const followup of pendingFollowups) {
        const user = followup.offer?.project?.user;
        if (!user) continue;

        const patternDays = parsePatternDays(followup.pattern);
        const alreadySent = parseReminderIndex(followup.status);
        const nextIndex = alreadySent + 1;
        const cadenceDay = patternDays[nextIndex - 1];

        if (nextIndex > patternDays.length) {
            await followup.update({ enabled: false, status: 'completed', nextReminderAt: null });
            continue;
        }

        const language = getLanguage(followup.offer?.calculationSnapshot?.language);
        const offerUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/offers/${followup.offer.id}`;
        const vars = {
            name: user.fullName || 'there',
            offerNumber: followup.offer.offerNumber,
            offerUrl,
        };
        const defaults = getDefaultOfferReminderContent({
            language,
            name: vars.name,
            offerNumber: vars.offerNumber,
            offerUrl,
        });
        const tmplEmail = await resolveTemplate({ channel: 'email', step: nextIndex, language });
        const tmplSms = await resolveTemplate({ channel: 'sms', step: nextIndex, language });
        const resolvedEmail = tmplEmail ? applyTemplatePlaceholders(tmplEmail, vars) : null;
        const resolvedSms = tmplSms ? applyTemplatePlaceholders(tmplSms, vars) : null;

        const subject = resolvedEmail?.subject || defaults.subject;
        const emailBody = resolvedEmail?.body || defaults.emailBody;
        const smsBody = resolvedSms?.body || defaults.smsBody;
        const { sentAny, attemptedAny } = await deliverReminderChannels({
            context: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
            reason: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
            reminderStep: nextIndex,
            cadenceDay,
            projectId: followup.offer.projectId,
            offerId: followup.offer.id,
            configuratorDraftId: null,
            channelEmail: followup.channelEmail,
            channelSms: followup.channelSms,
            user,
            subject,
            emailBody,
            smsBody,
            emailTemplate: tmplEmail,
            smsTemplate: tmplSms,
        });

        if (!attemptedAny) continue;

        const base = followup.offer.generatedAt ? new Date(followup.offer.generatedAt) : new Date(followup.offer.createdAt || Date.now());
        const hasContact = Boolean(user.email || user.phone);
        const nextReminderAt = hasContact ? computeNextReminderAt(base, patternDays, nextIndex) : null;
        await followup.update({
            lastReminderAt: now,
            nextReminderAt,
            status: hasContact
                ? (nextReminderAt ? (sentAny ? `reminded_${nextIndex}` : `attempted_${nextIndex}`) : 'completed')
                : 'no_contact',
            enabled: Boolean(hasContact && nextReminderAt),
            reason: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
        });
    }
}

async function processConfiguratorDraftFollowups(now) {
    const pendingDrafts = await ConfiguratorDraft.findAll({
        where: {
            enabled: true,
            configurationStatus: 'active',
            [Op.or]: [
                { status: 'pending' },
                { status: 'reminded' },
                { status: 'attempted' },
                { status: { [Op.like]: 'reminded_%' } },
                { status: { [Op.like]: 'attempted_%' } },
            ],
            nextReminderAt: { [Op.lte]: now },
        },
        include: [{ model: User, as: 'user' }],
    });

    for (const draft of pendingDrafts) {
        const user = draft.user;
        if (!user) continue;

        const patternDays = parsePatternDays(draft.pattern);
        const alreadySent = parseReminderIndex(draft.status);
        const nextIndex = alreadySent + 1;
        const cadenceDay = patternDays[nextIndex - 1];

        if (nextIndex > patternDays.length) {
            await draft.update({ enabled: false, status: 'completed', nextReminderAt: null });
            continue;
        }

        const snapshot = draft.snapshot || {};
        const projectName = snapshot.projectInfo?.name || 'your smart home project';
        const language = getLanguage(snapshot.language);
        const configuratorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/configurator`;
        const vars = {
            name: user.fullName || 'there',
            projectName,
            configuratorUrl,
        };
        const defaults = getDefaultDraftReminderContent({
            language,
            name: vars.name,
            projectName,
            configuratorUrl,
        });
        const tmplEmail = await resolveTemplate({ channel: 'email', step: nextIndex, language });
        const tmplSms = await resolveTemplate({ channel: 'sms', step: nextIndex, language });
        const resolvedEmail = tmplEmail ? applyTemplatePlaceholders(tmplEmail, vars) : null;
        const resolvedSms = tmplSms ? applyTemplatePlaceholders(tmplSms, vars) : null;

        const subject = resolvedEmail?.subject || defaults.subject;
        const emailBody = resolvedEmail?.body || defaults.emailBody;
        const smsBody = resolvedSms?.body || defaults.smsBody;
        const { sentAny, attemptedAny } = await deliverReminderChannels({
            context: FOLLOWUP_CONTEXTS.UNFINISHED_CONFIGURATION,
            reason: FOLLOWUP_CONTEXTS.UNFINISHED_CONFIGURATION,
            reminderStep: nextIndex,
            cadenceDay,
            projectId: normalizeProjectId(snapshot.currentProjectId),
            offerId: null,
            configuratorDraftId: draft.id,
            channelEmail: draft.channelEmail,
            channelSms: draft.channelSms,
            user,
            subject,
            emailBody,
            smsBody,
            emailTemplate: tmplEmail,
            smsTemplate: tmplSms,
        });

        if (!attemptedAny) continue;

        const base = draft.lastActivityAt ? new Date(draft.lastActivityAt) : new Date(draft.updatedAt || draft.createdAt || Date.now());
        const hasContact = Boolean(user.email || user.phone);
        const nextReminderAt = hasContact ? computeNextReminderAt(base, patternDays, nextIndex) : null;
        await draft.update({
            lastReminderAt: now,
            nextReminderAt,
            status: hasContact
                ? (nextReminderAt ? (sentAny ? `reminded_${nextIndex}` : `attempted_${nextIndex}`) : 'completed')
                : 'no_contact',
            enabled: Boolean(hasContact && nextReminderAt),
            reason: FOLLOWUP_CONTEXTS.UNFINISHED_CONFIGURATION,
        });
    }
}

export const processFollowups = async () => {
    try {
        const now = new Date();
        await processOfferFollowups(now);
        await processConfiguratorDraftFollowups(now);
    } catch (error) {
        console.error('Followup Error:', error.message);
    }
};

function createOfferAccessError() {
    const error = new Error('Offer not found');
    error.statusCode = 404;
    return error;
}

async function assertOfferFollowupAccess(offerId, actor = null) {
    if (!actor) return;
    if (actor.role === 'admin') return;

    const offer = await Offer.findByPk(offerId, {
        include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });

    if (!offer?.project || offer.project.userId !== actor.id) {
        throw createOfferAccessError();
    }
}

export const updateFollowupSettings = async (offerId, data, actor = null) => {
    await assertOfferFollowupAccess(offerId, actor);
    const followup = await OfferFollowup.findOne({ where: { offerId } });
    if (!followup) {
        const error = new Error('Follow-up record not found');
        error.statusCode = 404;
        throw error;
    }
    return followup.update(data);
};

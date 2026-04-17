import cron from 'node-cron';
import { Op } from 'sequelize';
import OfferFollowup from '../../models/OfferFollowup.js';
import ConfiguratorDraft from '../../models/ConfiguratorDraft.js';
import Offer from '../../models/Offer.js';
import User from '../../models/User.js';
import Project from '../../models/Project.js';
import * as notificationService from './notificationservice.js';
import models from '../../models/index.js';
import { DEFAULT_FOLLOWUP_PATTERN, FOLLOWUP_CONTEXTS, OFFER_REMINDER_ELIGIBLE_STATUSES } from '../constants/followup.js';

function parseReminderIndex(status) {
    const s = String(status || '').toLowerCase();
    const m = s.match(/^reminded(?:[_:](\d+))?$/);
    if (!m) return 0;
    const n = m[1] ? parseInt(m[1], 10) : 1;
    return Number.isFinite(n) ? n : 1;
}

function parsePatternDays(pattern) {
    const raw = (pattern && String(pattern).trim()) ? String(pattern) : DEFAULT_FOLLOWUP_PATTERN;
    const days = raw
        .split(',')
        .map((value) => parseInt(String(value).trim(), 10))
        .filter((value) => Number.isFinite(value) && value > 0)
        .slice(0, 10);
    const uniq = Array.from(new Set(days)).sort((a, b) => a - b);
    return uniq.length ? uniq : [7, 14, 30];
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

async function sendReminderChannels({ channelEmail, channelSms, user, subject, emailBody, smsBody }) {
    let sentAny = false;
    let lastError = null;

    if (channelEmail && user?.email) {
        try {
            const result = await notificationService.sendReminderEmail(user.email, subject, emailBody);
            if (result?.delivered) sentAny = true;
        } catch (error) {
            console.error(`[FOLLOW-UP] Email reminder channel failed for ${user.email}:`, error.message);
            lastError = error;
        }
    }

    if (channelSms && user?.phone) {
        try {
            const result = await notificationService.sendReminderSms(user.phone, smsBody);
            if (result?.delivered) sentAny = true;
        } catch (error) {
            console.error(`[FOLLOW-UP] SMS reminder channel failed for ${user.phone}:`, error.message);
            lastError = error;
        }
    }

    if (!sentAny && lastError) {
        throw lastError;
    }

    return sentAny;
}

function computeNextReminderAt(baseDate, patternDays, nextIndex) {
    const nextTargetDay = patternDays[nextIndex] ?? null;
    return nextTargetDay != null ? addDays(baseDate, nextTargetDay) : null;
}

export const initFollowupCron = () => {
    cron.schedule('0 10 * * *', async () => {
        console.log('Running daily follow-up job...');
        await processFollowups();
    });
};

export async function syncOfferFollowup(offerId, offerStatus, transaction = undefined) {
    const normalizedStatus = String(offerStatus || '').toLowerCase();
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

    const defaults = {
        enabled: true,
        pattern: DEFAULT_FOLLOWUP_PATTERN,
        reason: FOLLOWUP_CONTEXTS.OFFER_NOT_ORDERED,
        channelEmail: true,
        channelSms: false,
        nextReminderAt: addDays(new Date(), 7),
    };

    if (followup) {
        await followup.update({
            enabled: true,
            pattern: followup.pattern || DEFAULT_FOLLOWUP_PATTERN,
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
                { status: 'pending' },
                { status: 'reminded' },
                { status: { [Op.like]: 'reminded_%' } },
            ],
            nextReminderAt: { [Op.lte]: now },
            [Op.or]: [
                { snoozedUntil: null },
                { snoozedUntil: { [Op.lte]: now } },
            ],
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

        if (!user.email && !user.phone) {
            await followup.update({ enabled: false, nextReminderAt: null, status: 'no_contact' });
            continue;
        }

        const patternDays = parsePatternDays(followup.pattern);
        const alreadySent = parseReminderIndex(followup.status);
        const nextIndex = alreadySent + 1;

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

        let sentAny = false;
        try {
            sentAny = await sendReminderChannels({
                channelEmail: followup.channelEmail,
                channelSms: followup.channelSms,
                user,
                subject: resolvedEmail?.subject || defaults.subject,
                emailBody: resolvedEmail?.body || defaults.emailBody,
                smsBody: resolvedSms?.body || defaults.smsBody,
            });
        } catch (error) {
            console.error(`[FOLLOW-UP] Offer reminder failed for ${followup.offer.offerNumber}:`, error.message);
            continue;
        }

        if (!sentAny) continue;

        const base = followup.offer.generatedAt ? new Date(followup.offer.generatedAt) : new Date(followup.offer.createdAt || Date.now());
        await followup.update({
            lastReminderAt: now,
            nextReminderAt: computeNextReminderAt(base, patternDays, nextIndex),
            status: `reminded_${nextIndex}`,
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
                { status: { [Op.like]: 'reminded_%' } },
            ],
            nextReminderAt: { [Op.lte]: now },
        },
        include: [{ model: User, as: 'user' }],
    });

    for (const draft of pendingDrafts) {
        const user = draft.user;
        if (!user) continue;

        if (!user.email && !user.phone) {
            await draft.update({ enabled: false, nextReminderAt: null, status: 'no_contact' });
            continue;
        }

        const patternDays = parsePatternDays(draft.pattern);
        const alreadySent = parseReminderIndex(draft.status);
        const nextIndex = alreadySent + 1;

        if (nextIndex > patternDays.length) {
            await draft.update({ enabled: false, status: 'completed', nextReminderAt: null });
            continue;
        }

        const snapshot = draft.snapshot || {};
        const projectName = snapshot.projectInfo?.name || 'your smart home project';
        const language = getLanguage(snapshot.language);
        const configuratorUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/configurator`;
        const defaults = getDefaultDraftReminderContent({
            language,
            name: user.fullName || 'there',
            projectName,
            configuratorUrl,
        });

        let sentAny = false;
        try {
            sentAny = await sendReminderChannels({
                channelEmail: draft.channelEmail,
                channelSms: draft.channelSms,
                user,
                subject: defaults.subject,
                emailBody: defaults.emailBody,
                smsBody: defaults.smsBody,
            });
        } catch (error) {
            console.error(`[FOLLOW-UP] Configurator reminder failed for user ${user.id}:`, error.message);
            continue;
        }

        if (!sentAny) continue;

        const base = draft.lastActivityAt ? new Date(draft.lastActivityAt) : new Date(draft.updatedAt || draft.createdAt || Date.now());
        await draft.update({
            lastReminderAt: now,
            nextReminderAt: computeNextReminderAt(base, patternDays, nextIndex),
            status: `reminded_${nextIndex}`,
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
    if (actor.role === 'admin' || actor.role === 'employee') return;

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

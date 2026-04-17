import { Op } from 'sequelize';
import ConfiguratorDraft from '../../models/ConfiguratorDraft.js';
import User from '../../models/User.js';
import { DEFAULT_FOLLOWUP_PATTERN, FOLLOWUP_CONTEXTS } from '../constants/followup.js';

function addDays(date, days) {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function normalizeStep(value) {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, Math.min(parsed, 9));
}

function normalizeLanguage(value) {
    return String(value || '').toLowerCase().startsWith('ro') ? 'ro' : 'en';
}

function normalizeSnapshot(snapshot = {}) {
    return {
        projectInfo: snapshot.projectInfo || {},
        levels: Array.isArray(snapshot.levels) ? snapshot.levels : [],
        services: Array.isArray(snapshot.services) ? snapshot.services : [],
        range: snapshot.range ?? null,
        color: snapshot.color ?? null,
        customerComments: snapshot.customerComments || null,
        currentOfferId: snapshot.currentOfferId || null,
        currentStep: normalizeStep(snapshot.currentStep),
        language: normalizeLanguage(snapshot.language),
    };
}

function buildIdentifierWhere({ userId, guestSessionId, allowConverted = false }) {
    const where = {
        ...(allowConverted ? {} : { configurationStatus: 'active' }),
    };

    if (userId) where.userId = userId;
    if (!userId && guestSessionId) where.guestSessionId = guestSessionId;
    return where;
}

function hasMeaningfulProgress(snapshot = {}) {
    const projectInfo = snapshot.projectInfo || {};
    const levels = Array.isArray(snapshot.levels) ? snapshot.levels : [];

    return Boolean(
        String(projectInfo.name || '').trim() ||
        String(projectInfo.buildingType || '').trim() ||
        levels.some((level) => Array.isArray(level.rooms) && level.rooms.length > 0) ||
        (Array.isArray(snapshot.services) && snapshot.services.length > 0) ||
        snapshot.range ||
        snapshot.color ||
        String(snapshot.customerComments || '').trim()
    );
}

function toDraftResponse(draft) {
    if (!draft) return null;
    const plain = draft.toJSON ? draft.toJSON() : draft;
    return {
        ...plain,
        snapshot: normalizeSnapshot(plain.snapshot || {}),
    };
}

export async function getCurrentDraft({ userId = null, guestSessionId = null } = {}) {
    if (!userId && !guestSessionId) return null;

    const drafts = await ConfiguratorDraft.findAll({
        where: {
            [Op.or]: [
                userId ? { userId, configurationStatus: 'active' } : null,
                guestSessionId ? { guestSessionId, configurationStatus: 'active' } : null,
            ].filter(Boolean),
        },
        order: [['updatedAt', 'DESC']],
    });

    if (!drafts.length) return null;
    if (drafts.length === 1) return toDraftResponse(drafts[0]);

    // Prefer account-owned drafts, otherwise the most recently updated one.
    const preferred = drafts.find((draft) => draft.userId) || drafts[0];
    return toDraftResponse(preferred);
}

export async function upsertCurrentDraft({ userId = null, guestSessionId = null, snapshotInput = {} } = {}) {
    const snapshot = normalizeSnapshot(snapshotInput);
    if (!hasMeaningfulProgress(snapshot)) {
        return null;
    }

    let user = null;
    if (userId) {
        user = await User.findByPk(userId, { attributes: ['id', 'email', 'phone'] });
        if (!user) throw new Error('User not found');
    }

    if (!userId && !guestSessionId) {
        throw new Error('Guest session is required');
    }

    const now = new Date();
    const nextReminderAt = addDays(now, 7);

    let draft = await ConfiguratorDraft.findOne({
        where: buildIdentifierWhere({ userId, guestSessionId }),
        order: [['updatedAt', 'DESC']],
    });

    const payload = {
        snapshot,
        configurationStatus: 'active',
        convertedOfferId: null,
        enabled: true,
        channelEmail: user ? Boolean(user.email) : false,
        channelSms: user ? Boolean(user.phone) : false,
        lastActivityAt: now,
        lastReminderAt: null,
        nextReminderAt,
        pattern: DEFAULT_FOLLOWUP_PATTERN,
        reason: FOLLOWUP_CONTEXTS.UNFINISHED_CONFIGURATION,
        status: 'pending',
        lastStep: normalizeStep(snapshot.currentStep),
        language: normalizeLanguage(snapshot.language),
        source: userId ? 'account' : 'guest',
        guestSessionId: guestSessionId || draft?.guestSessionId || null,
    };

    if (draft) {
        draft = await draft.update({
            ...payload,
            userId: userId || draft.userId || null,
        });
        return toDraftResponse(draft);
    }

    const created = await ConfiguratorDraft.create({
        userId,
        guestSessionId: guestSessionId || null,
        ...payload,
    });

    return toDraftResponse(created);
}

export async function attachGuestDraftToUser({ userId, guestSessionId }) {
    if (!userId) throw new Error('User is required');
    if (!guestSessionId) return null;

    const user = await User.findByPk(userId, { attributes: ['id', 'email', 'phone'] });
    if (!user) throw new Error('User not found');

    const guestDraft = await ConfiguratorDraft.findOne({
        where: { guestSessionId, configurationStatus: 'active' },
        order: [['updatedAt', 'DESC']],
    });

    if (!guestDraft) return null;

    const existingAccountDraft = await ConfiguratorDraft.findOne({
        where: { userId, configurationStatus: 'active' },
        order: [['updatedAt', 'DESC']],
    });

    if (existingAccountDraft && existingAccountDraft.id !== guestDraft.id) {
        const guestTs = Date.parse(guestDraft.updatedAt || guestDraft.lastActivityAt || '');
        const accountTs = Date.parse(existingAccountDraft.updatedAt || existingAccountDraft.lastActivityAt || '');
        const useGuest = Number.isFinite(guestTs) && (!Number.isFinite(accountTs) || guestTs >= accountTs);

        if (useGuest) {
            await existingAccountDraft.update({
                snapshot: normalizeSnapshot(guestDraft.snapshot || {}),
                lastStep: guestDraft.lastStep || 1,
                language: guestDraft.language || 'en',
                channelEmail: Boolean(user.email),
                channelSms: Boolean(user.phone),
                lastActivityAt: guestDraft.lastActivityAt || new Date(),
                nextReminderAt: guestDraft.nextReminderAt || addDays(new Date(), 7),
                status: 'pending',
                enabled: true,
            });
        }

        await guestDraft.destroy();
        return toDraftResponse(existingAccountDraft);
    }

    await guestDraft.update({
        userId,
        source: 'account',
        channelEmail: Boolean(user.email),
        channelSms: Boolean(user.phone),
    });

    return toDraftResponse(guestDraft);
}

export async function completeCurrentDraft({ userId = null, guestSessionId = null, offerId = null } = {}) {
    const draft = await ConfiguratorDraft.findOne({
        where: buildIdentifierWhere({ userId, guestSessionId }),
        order: [['updatedAt', 'DESC']],
    });

    if (!draft) return null;

    const updated = await draft.update({
        configurationStatus: offerId ? 'converted' : 'completed',
        convertedOfferId: offerId || null,
        enabled: false,
        nextReminderAt: null,
        status: 'completed',
    });

    return toDraftResponse(updated);
}

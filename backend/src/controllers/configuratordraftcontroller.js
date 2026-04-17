import * as configuratorDraftService from '../services/configuratordraftservice.js';
import { sendResponse } from '../utils/apiResponse.js';

function resolveGuestSessionId(req) {
    return req.headers['x-guest-session-id'] || req.query.guestSessionId || req.body?.guestSessionId || null;
}

export const getCurrentDraft = async (req, res, next) => {
    try {
        const draft = await configuratorDraftService.getCurrentDraft({ userId: req.user.id });
        sendResponse(res, 200, true, 'Configurator draft fetched', draft);
    } catch (error) {
        next(error);
    }
};

export const getPublicCurrentDraft = async (req, res, next) => {
    try {
        const draft = await configuratorDraftService.getCurrentDraft({ guestSessionId: resolveGuestSessionId(req) });
        sendResponse(res, 200, true, 'Configurator guest draft fetched', draft);
    } catch (error) {
        next(error);
    }
};

export const upsertCurrentDraft = async (req, res, next) => {
    try {
        const draft = await configuratorDraftService.upsertCurrentDraft({
            userId: req.user.id,
            guestSessionId: resolveGuestSessionId(req),
            snapshotInput: req.body || {},
        });
        sendResponse(res, 200, true, 'Configurator draft synced', draft);
    } catch (error) {
        next(error);
    }
};

export const upsertPublicCurrentDraft = async (req, res, next) => {
    try {
        const guestSessionId = resolveGuestSessionId(req);
        const draft = await configuratorDraftService.upsertCurrentDraft({
            guestSessionId,
            snapshotInput: req.body || {},
        });
        sendResponse(res, 200, true, 'Configurator guest draft synced', draft);
    } catch (error) {
        next(error);
    }
};

export const attachGuestDraft = async (req, res, next) => {
    try {
        const guestSessionId = resolveGuestSessionId(req);
        const draft = await configuratorDraftService.attachGuestDraftToUser({ userId: req.user.id, guestSessionId });
        sendResponse(res, 200, true, 'Configurator guest draft attached', draft);
    } catch (error) {
        next(error);
    }
};

export const completeCurrentDraft = async (req, res, next) => {
    try {
        const draft = await configuratorDraftService.completeCurrentDraft({
            userId: req.user?.id || null,
            guestSessionId: resolveGuestSessionId(req),
            offerId: req.body?.offerId || null,
        });
        sendResponse(res, 200, true, 'Configurator draft completed', draft);
    } catch (error) {
        next(error);
    }
};

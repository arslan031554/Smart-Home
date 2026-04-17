import { Router } from 'express';
import models from '../../models/index.js';
import { normalizeBusinessLanguage, serializeLocalizedEntity } from '../utils/localization.js';
import { serializeRoomTypeForApi } from '../serializers/roomtypeserializer.js';
import { serializeSmartFunctionForApi } from '../serializers/smartfunctionserializer.js';

const router = Router();

function getLanguage(req) {
    return normalizeBusinessLanguage(req.query.lang || req.headers['accept-language']);
}

// Public, customer-safe master data read endpoints for configurator.
// These endpoints are intentionally GET-only.

router.get('/building-types', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.BuildingType.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'description', 'translations'],
            order: [['name', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeLocalizedEntity(row, { language, fields: ['name', 'description'] }));
        res.status(200).json({ success: true, message: 'Building types fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/room-types', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.RoomType.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'description', 'translations'],
            include: [
                { model: models.BuildingType, as: 'buildingTypes', attributes: ['id', 'name', 'description', 'translations'], through: { attributes: [] } }
            ],
            order: [['name', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeRoomTypeForApi(row, { language }));
        res.status(200).json({ success: true, message: 'Room types fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/smart-functions', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.SmartFunction.findAll({
            where: { isActive: true },
            attributes: ['id', 'code', 'name', 'icon', 'description', 'translations', 'channelType', 'sortOrder', 'isActive'],
            include: [
                { model: models.RoomType, as: 'roomTypes', attributes: ['id', 'name', 'description', 'translations'], through: { attributes: [] } }
            ],
            order: [['sortOrder', 'ASC'], ['name', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeSmartFunctionForApi(row, { language }));
        res.status(200).json({ success: true, message: 'Smart functions fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/product-ranges', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.ProductRange.findAll({
            where: { isActive: true, isVisible: true },
            attributes: ['id', 'name', 'description', 'translations', 'imageUrl', 'priceMultiplier', 'isVisible', 'isActive'],
            order: [['name', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeLocalizedEntity(row, { language, fields: ['name', 'description'] }));
        res.status(200).json({ success: true, message: 'Product ranges fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/colors', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.Color.findAll({
            where: { isActive: true, isVisible: true },
            attributes: ['id', 'name', 'description', 'translations', 'imageUrl', 'hex', 'isVisible', 'isActive'],
            order: [['name', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeLocalizedEntity(row, { language, fields: ['name', 'description'] }));
        res.status(200).json({ success: true, message: 'Colors fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/services', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.Service.findAll({
            where: { isActive: true },
            attributes: ['id', 'code', 'name', 'description', 'translations', 'unitPriceEurExVat', 'pricingMode', 'isOptionalForCustomer', 'isActive'],
            order: [['name', 'ASC']]
        });
        const data = (rows || []).map((row) => {
            const localized = serializeLocalizedEntity(row, { language, fields: ['name', 'description'] });
            return {
                ...localized,
                price: localized.unitPriceEurExVat != null && Number.isFinite(Number(localized.unitPriceEurExVat)) ? Number(localized.unitPriceEurExVat) : 0
            };
        });
        res.status(200).json({ success: true, message: 'Services fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/offer-conditions', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.OfferCondition.findAll({
            where: { isActive: true },
            attributes: ['id', 'text', 'translations', 'order', 'isActive'],
            order: [['order', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeLocalizedEntity(row, { language, fields: ['text'] }));
        res.status(200).json({ success: true, message: 'Offer conditions fetched', data });
    } catch (e) {
        next(e);
    }
});

router.get('/disclaimers', async (req, res, next) => {
    try {
        const language = getLanguage(req);
        const rows = await models.Disclaimer.findAll({
            where: { isActive: true },
            attributes: ['id', 'text', 'translations', 'order', 'isActive'],
            order: [['order', 'ASC']]
        });
        const data = (rows || []).map((row) => serializeLocalizedEntity(row, { language, fields: ['text'] }));
        res.status(200).json({ success: true, message: 'Disclaimers fetched', data });
    } catch (e) {
        next(e);
    }
});

export default router;

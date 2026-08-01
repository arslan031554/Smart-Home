import { Router } from 'express';
import models from '../../models/index.js';
import { normalizeBusinessLanguage, serializeLocalizedEntity } from '../utils/localization.js';
import { serializeRoomTypeForApi } from '../serializers/roomtypeserializer.js';
import { serializeSmartFunctionForApi } from '../serializers/smartfunctionserializer.js';

const router = Router();

function getLanguage(req) {
    return normalizeBusinessLanguage(req.query.lang || req.headers['accept-language']);
}

function isMissingRangeColorMappingError(err) {
    const code = err?.parent?.code || err?.original?.code;
    const message = String(err?.parent?.message || err?.original?.message || err?.message || '');
    return code === '42P01' && message.includes('ProductRangeColors');
}

function serializeColorWithRanges(row, productRanges, language) {
    const localized = serializeLocalizedEntity(row, { language, fields: ['name', 'description'] });
    const ranges = Array.isArray(productRanges) ? productRanges : [];

    return {
        ...localized,
        productRanges: ranges.map((range) => (typeof range === 'object' && range?.id ? range.id : range)).filter(Boolean),
        productRangeDetails: ranges
            .map((range) => (typeof range === 'object' && range?.id ? { id: range.id, name: range.name } : null))
            .filter(Boolean)
    };
}

async function getColorsWithoutRangeMapping({ language, rangeId }) {
    const ranges = await models.ProductRange.findAll({
        where: { isActive: true, isVisible: true },
        attributes: ['id', 'name'],
        order: [['name', 'ASC']]
    });
    const selectedRanges = rangeId ? ranges.filter((range) => range.id === rangeId) : ranges;

    if (rangeId && selectedRanges.length === 0) {
        return [];
    }

    const rows = await models.Color.findAll({
        where: { isActive: true, isVisible: true },
        attributes: ['id', 'name', 'description', 'translations', 'imageUrl', 'hex', 'isVisible', 'isActive'],
        order: [['name', 'ASC']]
    });

    return (rows || []).map((row) => serializeColorWithRanges(row, selectedRanges, language));
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
            attributes: [
                'id',
                'code',
                'name',
                'icon',
                'description',
                'translations',
                'channelType',
                'inputChannelCount',
                'outputChannelCount',
                'generalChannelCount',
                'sortOrder',
                'isActive'
            ],
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
        const rangeId = typeof req.query.rangeId === 'string' ? req.query.rangeId.trim() : null;
        let rows = [];

        try {
            rows = await models.Color.findAll({
                where: { isActive: true, isVisible: true },
                attributes: ['id', 'name', 'description', 'translations', 'imageUrl', 'hex', 'isVisible', 'isActive'],
                include: [{
                    model: models.ProductRange,
                    as: 'productRanges',
                    attributes: ['id', 'name'],
                    through: { attributes: [] },
                    ...(rangeId ? { where: { id: rangeId }, required: true } : {})
                }],
                order: [['name', 'ASC']]
            });
        } catch (e) {
            if (!isMissingRangeColorMappingError(e)) throw e;

            const data = await getColorsWithoutRangeMapping({ language, rangeId });
            return res.status(200).json({ success: true, message: 'Colors fetched', data });
        }

        const data = (rows || []).map((row) => {
            const localized = serializeLocalizedEntity(row, { language, fields: ['name', 'description'] });
            return serializeColorWithRanges(row, localized?.productRanges, language);
        });
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
            include: [
                { model: models.SmartFunction, as: 'smartFunctions', attributes: ['id', 'name', 'description', 'translations'], through: { attributes: [] } }
            ],
            order: [['name', 'ASC']]
        });
        const data = (rows || []).map((row) => {
            const localized = serializeLocalizedEntity(row, { language, fields: ['name', 'description'] });
            return {
                ...localized,
                price: localized.unitPriceEurExVat != null && Number.isFinite(Number(localized.unitPriceEurExVat)) ? Number(localized.unitPriceEurExVat) : 0,
                type: localized.pricingMode || 'fixed_project',
                smartFunctions: (Array.isArray(localized.smartFunctions) ? localized.smartFunctions : [])
                    .map((smartFunction) => (typeof smartFunction === 'object' && smartFunction?.id ? smartFunction.id : smartFunction))
                    .filter(Boolean),
                smartFunctionDetails: (Array.isArray(localized.smartFunctions) ? localized.smartFunctions : [])
                    .map((smartFunction) => {
                        if (typeof smartFunction !== 'object') return null;
                        const localizedSmartFunction = serializeLocalizedEntity(smartFunction, {
                            language,
                            fields: ['name', 'description']
                        });
                        return localizedSmartFunction?.id
                            ? { id: localizedSmartFunction.id, name: localizedSmartFunction.name }
                            : null;
                    })
                    .filter(Boolean)
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

import { serializeLocalizedEntity } from '../utils/localization.js';

export function serializeProductForApi(row, options = {}) {
    const po = serializeLocalizedEntity(row, {
        language: options.language,
        fields: ['name', 'description'],
        includeTranslations: true
    });
    if (!po) return po;

    const productRanges = Array.isArray(po.productRanges) ? po.productRanges : [];
    const colors = Array.isArray(po.colors) ? po.colors : [];
    const rawMappings = Array.isArray(po.mappings) ? po.mappings : [];

    const mappings = rawMappings
        .map((m) => {
            const functionId = m?.smartFunctionId ?? m?.functionId ?? null;
            if (!functionId) return null;
            return {
                id: m?.id ?? null,
                functionId,
                smartFunctionId: functionId,
                channelType: m?.channelType ?? 'GENERAL',
                capacity: m?.capacity ?? 1,
                priority: m?.priority ?? 0,
                calculationScope: m?.calculationScope ?? 'room',
                isActive: m?.isActive ?? true
            };
        })
        .filter(Boolean);

    const allowedRanges = productRanges
        .map((r) => (typeof r === 'object' && r?.id ? r.id : r))
        .filter(Boolean);
    const allowedColors = colors
        .map((c) => (typeof c === 'object' && c?.id ? c.id : c))
        .filter(Boolean);

    const price = po.unitPriceEurExVat != null && Number.isFinite(Number(po.unitPriceEurExVat))
        ? Number(po.unitPriceEurExVat)
        : null;

    return {
        id: po.id ?? null,
        code: po.code ?? null,
        name: po.name ?? null,
        description: po.description ?? null,
        translations: po.translations ?? {},
        imageUrl: po.imageUrl ?? null,
        price,
        status: po.isActive === true ? 'Active' : (po.isActive === false ? 'Inactive' : null),
        isActive: po.isActive ?? null,
        allowedRanges,
        allowedColors,
        mappings
    };
}

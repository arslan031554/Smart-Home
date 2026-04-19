import { serializeLocalizedEntity } from '../utils/localization.js';

export function serializeServiceForApi(row, options = {}) {
    const po = serializeLocalizedEntity(row, {
        language: options.language,
        fields: ['name', 'description'],
        includeTranslations: true
    });
    if (!po) return po;

    const rawSmartFunctions = Array.isArray(po.smartFunctions) ? po.smartFunctions : [];
    const smartFunctionDetails = rawSmartFunctions
        .map((smartFunction) => (
            typeof smartFunction === 'object'
                ? serializeLocalizedEntity(smartFunction, {
                    language: options.language,
                    fields: ['name', 'description'],
                    includeTranslations: false
                })
                : null
        ))
        .filter(Boolean)
        .map((smartFunction) => ({ id: smartFunction.id, name: smartFunction.name }));
    const smartFunctions = rawSmartFunctions
        .map((smartFunction) => (typeof smartFunction === 'object' && smartFunction?.id ? smartFunction.id : smartFunction))
        .filter(Boolean);

    const price = po.unitPriceEurExVat != null && Number.isFinite(Number(po.unitPriceEurExVat))
        ? Number(po.unitPriceEurExVat)
        : 0;

    return {
        id: po.id ?? null,
        code: po.code ?? null,
        name: po.name ?? null,
        description: po.description ?? null,
        translations: po.translations ?? {},
        pricingMode: po.pricingMode ?? 'fixed_project',
        type: po.pricingMode ?? 'fixed_project',
        unitPriceEurExVat: price,
        price,
        isOptionalForCustomer: po.isOptionalForCustomer ?? true,
        isActive: po.isActive ?? true,
        smartFunctions,
        smartFunctionDetails
    };
}

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
    const rawRequiredBy = Array.isArray(po.requiredByProducts) ? po.requiredByProducts : [];
    const rawRequiredRelated = Array.isArray(po.requiredRelatedProducts) ? po.requiredRelatedProducts : [];

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

    const dependencies = rawRequiredBy
        .map((dependency) => ({
            id: dependency?.id ?? null,
            mainProductId: dependency?.mainProductId ?? null,
            relatedProductId: dependency?.relatedProductId ?? po.id ?? null,
            quantityPerMainProduct: dependency?.quantityPerMainProduct != null ? Number(dependency.quantityPerMainProduct) : 1,
            mainProduct: dependency?.mainProduct ? {
                id: dependency.mainProduct.id,
                code: dependency.mainProduct.code,
                name: dependency.mainProduct.name,
                productType: dependency.mainProduct.productType,
                isActive: dependency.mainProduct.isActive
            } : null
        }))
        .filter((dependency) => dependency.mainProductId);

    const relatedProductDependencies = rawRequiredRelated
        .map((dependency) => ({
            id: dependency?.id ?? null,
            mainProductId: dependency?.mainProductId ?? po.id ?? null,
            relatedProductId: dependency?.relatedProductId ?? null,
            quantityPerMainProduct: dependency?.quantityPerMainProduct != null ? Number(dependency.quantityPerMainProduct) : 1,
            relatedProduct: dependency?.relatedProduct ? {
                id: dependency.relatedProduct.id,
                code: dependency.relatedProduct.code,
                name: dependency.relatedProduct.name,
                productType: dependency.relatedProduct.productType,
                isActive: dependency.relatedProduct.isActive
            } : null
        }))
        .filter((dependency) => dependency.relatedProductId);

    return {
        id: po.id ?? null,
        code: po.code ?? null,
        name: po.name ?? null,
        description: po.description ?? null,
        translations: po.translations ?? {},
        imageUrl: po.imageUrl ?? null,
        unitPriceEurExVat: price,
        price,
        status: po.isActive === true ? 'Active' : (po.isActive === false ? 'Inactive' : null),
        isActive: po.isActive ?? null,
        productType: po.productType || 'STANDARD',
        allowedRanges,
        allowedColors,
        mappings,
        dependencies,
        mainProducts: dependencies,
        relatedProductDependencies
    };
}

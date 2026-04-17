import { serializeLocalizedEntity } from '../utils/localization.js';

export function serializeRoomTypeForApi(row, options = {}) {
    const po = serializeLocalizedEntity(row, {
        language: options.language,
        fields: ['name', 'description'],
        includeTranslations: true
    });
    if (!po) return po;

    const rawBuildingTypes = Array.isArray(po.buildingTypes) ? po.buildingTypes : [];
    const buildingTypeDetails = rawBuildingTypes
        .map((b) => (typeof b === 'object' ? serializeLocalizedEntity(b, { language: options.language, fields: ['name', 'description'], includeTranslations: false }) : null))
        .filter(Boolean)
        .map((b) => ({ id: b.id, name: b.name }));
    const buildingTypes = rawBuildingTypes
        .map((b) => (typeof b === 'object' && b?.id ? b.id : b))
        .filter(Boolean);

    return {
        id: po.id ?? null,
        name: po.name ?? null,
        description: po.description ?? null,
        translations: po.translations ?? {},
        isActive: po.isActive ?? null,
        buildingTypes,
        buildingTypeDetails
    };
}

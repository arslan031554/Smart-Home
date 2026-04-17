import { serializeLocalizedEntity } from '../utils/localization.js';

export function serializeSmartFunctionForApi(row, options = {}) {
    const po = serializeLocalizedEntity(row, {
        language: options.language,
        fields: ['name', 'description'],
        includeTranslations: true
    });
    if (!po) return po;

    const rawRoomTypes = Array.isArray(po.roomTypes) ? po.roomTypes : [];
    const roomTypeDetails = rawRoomTypes
        .map((r) => (typeof r === 'object' ? serializeLocalizedEntity(r, { language: options.language, fields: ['name', 'description'], includeTranslations: false }) : null))
        .filter(Boolean)
        .map((r) => ({ id: r.id, name: r.name }));
    const roomTypes = rawRoomTypes
        .map((r) => (typeof r === 'object' && r?.id ? r.id : r))
        .filter(Boolean);

    return {
        id: po.id ?? null,
        code: po.code ?? null,
        name: po.name ?? null,
        icon: po.icon ?? null,
        description: po.description ?? null,
        translations: po.translations ?? {},
        channelType: po.channelType ?? null,
        sortOrder: po.sortOrder ?? null,
        isActive: po.isActive ?? null,
        roomTypes,
        roomTypeDetails
    };
}

import { serializeLocalizedEntity } from '../utils/localization.js';

function resolveChannelCounts(entity = {}) {
    const input = Number(entity?.inputChannelCount ?? 0);
    const output = Number(entity?.outputChannelCount ?? 0);
    const general = Number(entity?.generalChannelCount ?? 0);

    if ((input + output + general) > 0) {
        return {
            inputChannelCount: Math.max(0, input),
            outputChannelCount: Math.max(0, output),
            generalChannelCount: Math.max(0, general),
        };
    }

    const channelType = String(entity?.channelType || 'GENERAL').toUpperCase();
    return {
        inputChannelCount: channelType === 'IN' ? 1 : 0,
        outputChannelCount: channelType === 'OUT' ? 1 : 0,
        generalChannelCount: channelType === 'GENERAL' ? 1 : 0,
    };
}

export function serializeSmartFunctionForApi(row, options = {}) {
    const po = serializeLocalizedEntity(row, {
        language: options.language,
        fields: ['name', 'description'],
        includeTranslations: true
    });
    if (!po) return po;
    const channelCounts = resolveChannelCounts(po);

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
        inputChannelCount: channelCounts.inputChannelCount,
        outputChannelCount: channelCounts.outputChannelCount,
        generalChannelCount: channelCounts.generalChannelCount,
        sortOrder: po.sortOrder ?? null,
        isActive: po.isActive ?? null,
        roomTypes,
        roomTypeDetails
    };
}

function getCurrentBusinessLanguage() {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('hsc_lang');
        if (stored === 'ro' || stored === 'en') return stored;
    }
    return 'en';
}

export function normalizeRoomCount(value) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function normalizeFunctionSelection(selection = {}) {
    return {
        ...selection,
        smartFunctionId: selection.smartFunctionId || selection.id || null,
        quantity: normalizeRoomCount(selection.quantity),
    };
}

export function normalizeConfiguratorRoom(room = {}) {
    const roomCount = normalizeRoomCount(room.roomCount ?? room.count);
    return {
        ...room,
        roomCount,
        functions: Array.isArray(room.functions)
            ? room.functions.map(normalizeFunctionSelection)
            : [],
    };
}

export function normalizeConfiguratorLevels(levels = []) {
    return Array.isArray(levels)
        ? levels.map((level) => ({
            ...level,
            rooms: Array.isArray(level.rooms)
                ? level.rooms.map(normalizeConfiguratorRoom)
                : [],
        }))
        : [];
}

export function buildNormalizedOfferPayload(configuratorState = {}) {
    return {
        projectId: configuratorState.currentProjectId || null,
        levels: normalizeConfiguratorLevels(configuratorState.levels || []),
        projectInfo: configuratorState.projectInfo || {},
        rangeId: configuratorState.range ?? null,
        colorId: configuratorState.color ?? null,
        selectedServiceIds: Array.isArray(configuratorState.services) ? configuratorState.services : [],
        multiplicationIndex: configuratorState.projectInfo?.projectMultiplicationIndex ?? 1,
        customerComments: configuratorState.customerComments || null,
        language: getCurrentBusinessLanguage(),
    };
}

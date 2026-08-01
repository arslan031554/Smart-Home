const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidOptionalUuid(value) {
    if (value === null || value === undefined || value === "") {
        return true;
    }
    return UUID_REGEX.test(String(value).trim());
}

export function normalizeUuid(value) {
    if (value === null || value === undefined || value === "") return null;
    const str = String(value).trim();
    return UUID_REGEX.test(str) ? str : null;
}

export function normalizeUuidArray(values) {
    if (!Array.isArray(values)) return [];
    return values.reduce((acc, value) => {
        const normalized = normalizeUuid(value);
        if (normalized) acc.push(normalized);
        return acc;
    }, []);
}

export async function resolveExistingUuidOrNull({ model, value, transaction = null }) {
    const normalized = normalizeUuid(value);
    if (!normalized || !model || typeof model.findByPk !== 'function') return normalized;

    const record = await model.findByPk(normalized, {
        transaction,
        attributes: ['id'],
    });

    return record ? normalized : null;
}

export async function resolveExistingUuidArray({ model, values, transaction = null }) {
    const normalized = normalizeUuidArray(values);
    if (!normalized.length || !model || typeof model.findAll !== 'function') return normalized;

    const records = await model.findAll({
        where: { id: normalized },
        attributes: ['id'],
        transaction,
    });

    const existingIds = new Set((records || []).map((record) => String(record.id)));
    return normalized.filter((id) => existingIds.has(id));
}

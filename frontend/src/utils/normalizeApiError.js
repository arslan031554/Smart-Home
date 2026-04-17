export function normalizeApiError(error) {
    // Returns a stable, UI-friendly shape:
    // { message: string, errors: { [field]: string } | null, status?: number }
    const fallback = { message: 'Request failed. Please try again.', errors: null };
    if (!error) return fallback;

    // RTK rejectWithValue payloads may already be normalized
    if (typeof error === 'object' && error.message && (error.errors || error.errors === null)) {
        return { message: String(error.message), errors: error.errors || null, status: error.status };
    }

    // Axios error
    const status = error?.response?.status;
    const data = error?.response?.data;
    if (data && typeof data === 'object') {
        const message = typeof data.message === 'string' && data.message.trim()
            ? data.message
            : (status === 400 ? 'Validation failed' : fallback.message);

        let errors = null;
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
            errors = {};
            for (const [k, v] of Object.entries(data.errors)) {
                if (v == null) continue;
                errors[k] = typeof v === 'string' ? v : String(v);
            }
            if (!Object.keys(errors).length) errors = null;
        } else if (Array.isArray(data.errors)) {
            // Legacy backend shape: array of {field: msg}
            const merged = {};
            for (const e of data.errors) {
                if (e && typeof e === 'object') {
                    for (const [k, v] of Object.entries(e)) {
                        if (!merged[k]) merged[k] = typeof v === 'string' ? v : String(v);
                    }
                }
            }
            errors = Object.keys(merged).length ? merged : null;
        }

        return { message, errors, status };
    }

    if (typeof error === 'string') return { message: error, errors: null };
    if (typeof error?.message === 'string' && error.message.trim()) return { message: error.message, errors: null, status };
    return { ...fallback, status };
}


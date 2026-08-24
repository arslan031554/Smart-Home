import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import i18n from '../../i18n';
import { buildNormalizedOfferPayload } from '../../utils/configuratorNormalization';
import { normalizeOfferStatus } from '../../constants/offerStatuses';

function sanitizeOfferId(value) {
    if (!value || typeof value !== 'string') return null;
    const normalized = value.trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)
        ? normalized
        : null;
}

function sanitizeOfferIds(values) {
    if (!Array.isArray(values)) return [];
    return values.reduce((acc, value) => {
        const normalized = sanitizeOfferId(value);
        if (normalized) acc.push(normalized);
        return acc;
    }, []);
}

function sanitizeOfferLevels(levels) {
    if (!Array.isArray(levels)) return [];
    return levels.map((level) => ({
        ...level,
        id: sanitizeOfferId(level?.id) || undefined,
        rooms: (Array.isArray(level?.rooms) ? level.rooms : []).map((room) => ({
            ...room,
            id: sanitizeOfferId(room?.id) || undefined,
            type: sanitizeOfferId(room?.type) || null,
            roomTypeId: sanitizeOfferId(room?.roomTypeId || room?.type) || null,
            functions: (Array.isArray(room?.functions) ? room.functions : []).map((selection) => ({
                ...selection,
                id: sanitizeOfferId(selection?.id) || undefined,
                smartFunctionId: sanitizeOfferId(selection?.smartFunctionId || selection?.id) || null,
            })).filter((selection) => selection.smartFunctionId),
        })),
    }));
}

function buildOfferListItem(offer) {
    if (!offer || typeof offer !== 'object') return offer;

    const snapshot = offer.calculationSnapshot || {};
    const levels = Array.isArray(snapshot.levels) ? snapshot.levels : [];
    const follow = offer.followUp || offer.followup || null;
    const projectInfo = snapshot.projectInfo || {};
    const roomsCount = levels.reduce((acc, level) => acc + ((Array.isArray(level.rooms) ? level.rooms.length : 0)), 0);
    const functionsCount = levels.reduce((acc, level) => acc + ((Array.isArray(level.rooms) ? level.rooms.reduce((roomAcc, room) => {
        const selections = Array.isArray(room.functionSelections)
            ? room.functionSelections
            : (Array.isArray(room.functions) ? room.functions : []);
        return roomAcc + selections.filter((selection) => Number(selection?.quantity || 0) > 0).length;
    }, 0) : 0)), 0);

    return {
        id: offer.id,
        offerNumber: offer.offerNumber,
        status: normalizeOfferStatus(offer.status),
        createdAt: offer.createdAt,
        updatedAt: offer.updatedAt,
        projectId: offer.projectId,
        projectName: offer.project?.name || projectInfo.name || offer.projectName || null,
        buildingType: offer.project?.buildingType?.name || projectInfo.buildingTypeName || offer.buildingType || null,
        customerName: offer.project?.user?.fullName || offer.customerName || null,
        customerEmail: offer.project?.user?.email || offer.customerEmail || null,
        totalAmount: offer.grandTotal ?? offer.totalAmount ?? 0,
        roomsCount,
        functionsCount,
        followUp: follow ? {
            enabled: !!follow.enabled,
            status: follow.status || 'pending',
            nextReminderAt: follow.nextReminderAt || null,
            reason: follow.reason || null,
            channels: { email: !!follow.channelEmail, sms: !!follow.channelSms },
        } : { enabled: false },
    };
}

export const fetchOffers = createAsyncThunk('offers/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/offers');
        return (response.data.data || []).map(buildOfferListItem);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
    }
});

export const fetchAdminOffers = createAsyncThunk('offers/fetchAdmin', async (params = {}, { rejectWithValue }) => {
    try {
        const response = await api.get('/admin/offers', {
            params: {
                page: 1,
                limit: 5,
                sort: 'created_at_desc',
                ...params,
            },
        });
        const data = response.data.data || {};
        const items = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
        return items.map(buildOfferListItem);
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin offers');
    }
});

export const fetchOfferById = createAsyncThunk('offers/fetchById', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/offers/${id}`);
        const offer = response.data.data;
        return offer ? { ...offer, status: normalizeOfferStatus(offer.status) } : offer;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch offer details');
    }
});

export const generateOffer = createAsyncThunk('offers/generate', async (offerData, { rejectWithValue }) => {
    try {
        const candidateLang = offerData?.language || i18n?.resolvedLanguage || i18n?.language || (typeof localStorage !== 'undefined' && localStorage.getItem('hsc_lang')) || 'en';
        const language = String(candidateLang).toLowerCase().startsWith('ro') ? 'ro' : 'en';
        const normalized = buildNormalizedOfferPayload({
            projectInfo: offerData.projectInfo || {},
            levels: offerData.levels || [],
            range: offerData.rangeId || offerData.range || null,
            color: offerData.colorId || offerData.color || null,
            services: offerData.serviceIds || offerData.services || [],
            customerComments: offerData.customerComments || null,
            customerCommentsEn: offerData.customerCommentsEn ?? offerData.customerComments ?? '',
            customerCommentsRo: offerData.customerCommentsRo ?? '',
            language,
        });
        const offerId = sanitizeOfferId(offerData.offerId || offerData.id || null);
        const payload = {
            projectId: sanitizeOfferId(offerData.projectId || normalized.projectId || null),
            projectInfo: normalized.projectInfo,
            levels: sanitizeOfferLevels(normalized.levels),
            rangeId: sanitizeOfferId(normalized.rangeId),
            colorId: sanitizeOfferId(normalized.colorId),
            selectedServiceIds: sanitizeOfferIds(normalized.selectedServiceIds),
            customerComments: normalized.customerComments,
            customerCommentsEn: normalized.customerCommentsEn,
            customerCommentsRo: normalized.customerCommentsRo,
            language,
        };
        const response = offerId
            ? await api.put(`/offers/${offerId}/from-config?lang=${language}`, payload)
            : await api.post(`/offers/from-config?lang=${language}`, payload);
        try {
            await api.post('/configurator-drafts/current/complete', { offerId: response.data.data?.id || null });
        } catch {
            // Do not fail offer generation if draft completion sync fails.
        }
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to generate offer');
    }
}, {
    condition: (_, { getState }) => !getState().offers?.isGenerating,
});

export const updateOfferStatus = createAsyncThunk('offers/updateStatus', async ({ id, status }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/offers/${id}/status`, { status });
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
});

export const duplicateOffer = createAsyncThunk('offers/duplicate', async (id, { rejectWithValue }) => {
    try {
        const response = await api.post(`/offers/${id}/duplicate`);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to duplicate offer');
    }
});

export const deleteOffer = createAsyncThunk('offers/delete', async (id, { rejectWithValue }) => {
    try {
        const response = await api.delete(`/offers/${id}`);
        return response.data.data?.id || id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete offer');
    }
});

export const snoozeFollowUp = createAsyncThunk('offers/snoozeFollowUp', async ({ id, days = 7 }, { rejectWithValue }) => {
    try {
        const nextReminderAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        const response = await api.patch(`/offers/${id}/followup`, {
            nextReminderAt,
        });
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to snooze follow-up');
    }
});

export const updateFollowUpSettings = createAsyncThunk('offers/updateFollowUpSettings', async ({ id, ...settings }, { rejectWithValue }) => {
    try {
        const response = await api.patch(`/offers/${id}/followup`, settings);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update follow-up settings');
    }
});

const initialState = {
    generatedOffer: null,
    currentOffer: null,
    isGenerating: false,
    generationError: null,
    offersList: [],
    loading: false,
    error: null,
};

const offersSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        clearGeneratedOffer: (state) => {
            state.generatedOffer = null;
            state.isGenerating = false;
            state.generationError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOffers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOffers.fulfilled, (state, action) => {
                state.loading = false;
                state.offersList = action.payload;
            })
            .addCase(fetchOffers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAdminOffers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminOffers.fulfilled, (state, action) => {
                state.loading = false;
                state.offersList = action.payload;
            })
            .addCase(fetchAdminOffers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchOfferById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentOffer = null;
            })
            .addCase(fetchOfferById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOffer = action.payload;
            })
            .addCase(fetchOfferById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.currentOffer = null;
            })
            .addCase(updateOfferStatus.fulfilled, (state, action) => {
                const updatedOffer = action.payload;
                if (!updatedOffer?.id) return;

                if (state.currentOffer?.id === updatedOffer.id) {
                    state.currentOffer = {
                        ...state.currentOffer,
                        ...updatedOffer,
                        status: normalizeOfferStatus(updatedOffer.status),
                    };
                }

                const listIndex = state.offersList.findIndex((offer) => offer.id === updatedOffer.id);
                if (listIndex !== -1) {
                    state.offersList[listIndex] = {
                        ...state.offersList[listIndex],
                        ...buildOfferListItem(updatedOffer),
                    };
                }
            })
            .addCase(generateOffer.pending, (state) => {
                state.isGenerating = true;
                state.generationError = null;
            })
            .addCase(generateOffer.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.generatedOffer = action.payload;
                state.currentOffer = action.payload;
            })
            .addCase(generateOffer.rejected, (state, action) => {
                state.isGenerating = false;
                state.generationError = action.payload;
            });
    },
});

export const { clearGeneratedOffer } = offersSlice.actions;
export default offersSlice.reducer;

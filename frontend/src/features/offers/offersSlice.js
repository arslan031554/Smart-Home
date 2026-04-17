import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import i18n from '../../i18n';
import { buildNormalizedOfferPayload } from '../../utils/configuratorNormalization';

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
        status: offer.status,
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
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch offers');
    }
});

export const fetchOfferById = createAsyncThunk('offers/fetchById', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/offers/${id}`);
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch offer details');
    }
});

export const generateOffer = createAsyncThunk('offers/generate', async (offerData, { rejectWithValue }) => {
    try {
        const language = (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en';
        const normalized = buildNormalizedOfferPayload({
            projectInfo: offerData.projectInfo || {},
            levels: offerData.levels || [],
            range: offerData.rangeId || offerData.range || null,
            color: offerData.colorId || offerData.color || null,
            services: offerData.serviceIds || offerData.services || [],
            customerComments: offerData.customerComments || null,
        });
        const payload = {
            projectInfo: normalized.projectInfo,
            levels: normalized.levels,
            rangeId: normalized.rangeId,
            colorId: normalized.colorId,
            selectedServiceIds: normalized.selectedServiceIds,
            customerComments: normalized.customerComments,
            language,
        };
        const offerId = offerData.offerId || offerData.id || null;
        const response = offerId
            ? await api.put(`/offers/${offerId}/from-config`, payload)
            : await api.post('/offers/from-config', payload);
        try {
            await api.post('/configurator-drafts/current/complete', { offerId: response.data.data?.id || null });
        } catch (_) {
            // Do not fail offer generation if draft completion sync fails.
        }
        return response.data.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Failed to generate offer');
    }
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
            .addCase(fetchOfferById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOfferById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOffer = action.payload;
            })
            .addCase(fetchOfferById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(generateOffer.pending, (state) => {
                state.isGenerating = true;
                state.generationError = null;
            })
            .addCase(generateOffer.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.generatedOffer = action.payload;
                state.currentOffer = action.payload;
                const listItem = buildOfferListItem(action.payload);
                const index = state.offersList.findIndex((offer) => offer.id === listItem.id);
                if (index >= 0) state.offersList[index] = listItem;
                else state.offersList.unshift(listItem);
            })
            .addCase(generateOffer.rejected, (state, action) => {
                state.isGenerating = false;
                state.generationError = action.payload;
            })
            .addCase(updateOfferStatus.fulfilled, (state, action) => {
                const index = state.offersList.findIndex((offer) => offer.id === action.payload.id);
                if (index !== -1) state.offersList[index] = action.payload;
                if (state.currentOffer?.id === action.payload.id) {
                    state.currentOffer = { ...state.currentOffer, status: action.payload.status };
                }
            })
            .addCase(deleteOffer.fulfilled, (state, action) => {
                state.offersList = state.offersList.filter((offer) => offer.id !== action.payload);
                if (state.currentOffer?.id === action.payload) {
                    state.currentOffer = null;
                }
            })
            .addCase(duplicateOffer.fulfilled, (state, action) => {
                const listItem = buildOfferListItem(action.payload);
                state.offersList.unshift(listItem);
            });
    },
});

export const {
    clearGeneratedOffer,
} = offersSlice.actions;

export default offersSlice.reducer;

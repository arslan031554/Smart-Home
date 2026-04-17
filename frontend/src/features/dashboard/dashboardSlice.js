import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
        }
    }
);

const initialState = {
    user: null,
    stats: {
        activeProjects: 0,
        draftOffers: 0,
        inProgressOffers: 0,
        offerReady: 0,
        waitingOffers: 0,
        orderedOffers: 0,
        cancelledOffers: 0
    },
    recentProjects: [],
    recentOffers: [],
    reminders: [],
    loading: false,
    error: null
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                const payload = action.payload || {};
                state.user = payload.user ?? state.user;
                state.stats = { ...initialState.stats, ...(payload.stats || {}) };
                state.recentProjects = Array.isArray(payload.recentProjects) ? payload.recentProjects : [];
                state.recentOffers = Array.isArray(payload.recentOffers) ? payload.recentOffers : [];
                state.reminders = Array.isArray(payload.reminders) ? payload.reminders : [];
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'errors.dashboardLoadFailed';
            });
    }
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

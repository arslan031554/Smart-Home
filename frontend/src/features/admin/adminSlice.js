import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { normalizeApiError } from '../../utils/normalizeApiError';

export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/admin/stats');
        return response.data.data;
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

// Specific Thunks for Products
export const fetchProducts = createAsyncThunk('admin/fetchProducts', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('products')).unwrap();
});

export const addProduct = createAsyncThunk('admin/addProduct', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'products', data })).unwrap();
});

export const updateProduct = createAsyncThunk('admin/updateProduct', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'products', id, data })).unwrap();
});

export const deleteProduct = createAsyncThunk('admin/deleteProduct', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'products', id })).unwrap();
});

// Specific Thunks for Employees
export const fetchEmployees = createAsyncThunk('admin/fetchEmployees', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('employees')).unwrap();
});

export const addEmployee = createAsyncThunk('admin/addEmployee', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'employees', data })).unwrap();
});

export const updateEmployee = createAsyncThunk('admin/updateEmployee', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'employees', id, data })).unwrap();
});

export const deleteEmployee = createAsyncThunk('admin/deleteEmployee', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'employees', id })).unwrap();
});

// Specific Thunks for Users (read-only)
export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('users')).unwrap();
});

// Specific Thunks for Colors
export const fetchColors = createAsyncThunk('admin/fetchColors', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('colors')).unwrap();
});

export const addColor = createAsyncThunk('admin/addColor', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'colors', data })).unwrap();
});

export const updateColor = createAsyncThunk('admin/updateColor', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'colors', id, data })).unwrap();
});

export const deleteColor = createAsyncThunk('admin/deleteColor', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'colors', id })).unwrap();
});

// Specific Thunks for Building Types
export const fetchBuildingTypes = createAsyncThunk('admin/fetchBuildingTypes', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('building-types')).unwrap();
});

export const addBuildingType = createAsyncThunk('admin/addBuildingType', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'building-types', data })).unwrap();
});

export const updateBuildingType = createAsyncThunk('admin/updateBuildingType', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'building-types', id, data })).unwrap();
});

export const deleteBuildingType = createAsyncThunk('admin/deleteBuildingType', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'building-types', id })).unwrap();
});

// Specific Thunks for Room Types
export const fetchRoomTypes = createAsyncThunk('admin/fetchRoomTypes', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('room-types')).unwrap();
});

export const addRoomType = createAsyncThunk('admin/addRoomType', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'room-types', data })).unwrap();
});

export const updateRoomType = createAsyncThunk('admin/updateRoomType', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'room-types', id, data })).unwrap();
});

export const deleteRoomType = createAsyncThunk('admin/deleteRoomType', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'room-types', id })).unwrap();
});

// Specific Thunks for Smart Functions
export const fetchSmartFunctions = createAsyncThunk('admin/fetchSmartFunctions', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('smart-functions')).unwrap();
});

export const addSmartFunction = createAsyncThunk('admin/addSmartFunction', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'smart-functions', data })).unwrap();
});

export const updateSmartFunction = createAsyncThunk('admin/updateSmartFunction', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'smart-functions', id, data })).unwrap();
});

export const deleteSmartFunction = createAsyncThunk('admin/deleteSmartFunction', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'smart-functions', id })).unwrap();
});

// Specific Thunks for Product Ranges
export const fetchProductRanges = createAsyncThunk('admin/fetchProductRanges', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('product-ranges')).unwrap();
});

export const addProductRange = createAsyncThunk('admin/addProductRange', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'product-ranges', data })).unwrap();
});

export const updateProductRange = createAsyncThunk('admin/updateProductRange', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'product-ranges', id, data })).unwrap();
});

export const deleteProductRange = createAsyncThunk('admin/deleteProductRange', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'product-ranges', id })).unwrap();
});

// Specific Thunks for Services
export const fetchServices = createAsyncThunk('admin/fetchServices', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('services')).unwrap();
});

export const addService = createAsyncThunk('admin/addService', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'services', data })).unwrap();
});

export const updateService = createAsyncThunk('admin/updateService', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'services', id, data })).unwrap();
});

export const deleteService = createAsyncThunk('admin/deleteService', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'services', id })).unwrap();
});

// Specific Thunks for Discounts
export const fetchDiscounts = createAsyncThunk('admin/fetchDiscounts', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('discount-rules')).unwrap();
});

export const addDiscount = createAsyncThunk('admin/addDiscount', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'discount-rules', data })).unwrap();
});

export const updateDiscount = createAsyncThunk('admin/updateDiscount', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'discount-rules', id, data })).unwrap();
});

export const deleteDiscount = createAsyncThunk('admin/deleteDiscount', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'discount-rules', id })).unwrap();
});

// Specific Thunks for Conditions
export const fetchConditions = createAsyncThunk('admin/fetchConditions', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('offer-conditions')).unwrap();
});

export const addCondition = createAsyncThunk('admin/addCondition', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'offer-conditions', data })).unwrap();
});

export const updateCondition = createAsyncThunk('admin/updateCondition', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'offer-conditions', id, data })).unwrap();
});

export const deleteCondition = createAsyncThunk('admin/deleteCondition', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'offer-conditions', id })).unwrap();
});

// Specific Thunks for Disclaimers
export const fetchDisclaimers = createAsyncThunk('admin/fetchDisclaimers', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('disclaimers')).unwrap();
});

export const addDisclaimer = createAsyncThunk('admin/addDisclaimer', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'disclaimers', data })).unwrap();
});

export const updateDisclaimer = createAsyncThunk('admin/updateDisclaimer', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'disclaimers', id, data })).unwrap();
});

export const deleteDisclaimer = createAsyncThunk('admin/deleteDisclaimer', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'disclaimers', id })).unwrap();
});

// Specific Thunks for Follow-up Templates
export const fetchFollowupTemplates = createAsyncThunk('admin/fetchFollowupTemplates', async (_, { dispatch }) => {
    return dispatch(fetchMasterData('followup-templates')).unwrap();
});

export const addFollowupTemplate = createAsyncThunk('admin/addFollowupTemplate', async (data, { dispatch }) => {
    return dispatch(addMasterDataItem({ key: 'followup-templates', data })).unwrap();
});

export const updateFollowupTemplate = createAsyncThunk('admin/updateFollowupTemplate', async ({ id, ...data }, { dispatch }) => {
    return dispatch(updateMasterDataItem({ key: 'followup-templates', id, data })).unwrap();
});

export const deleteFollowupTemplate = createAsyncThunk('admin/deleteFollowupTemplate', async (id, { dispatch }) => {
    return dispatch(deleteMasterDataItem({ key: 'followup-templates', id })).unwrap();
});

export const fetchMasterData = createAsyncThunk('admin/fetchMasterData', async (key, { rejectWithValue }) => {
    try {
        const response = await api.get(`/admin/${key}`);
        return { key, data: response.data.data };
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

// Public, customer-safe master data fetch (used by configurator on direct entry)
export const fetchPublicMasterData = createAsyncThunk('admin/fetchPublicMasterData', async (key, { rejectWithValue }) => {
    try {
        const response = await api.get(`/master-data/${key}`);
        return { key, data: response.data.data };
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const addMasterDataItem = createAsyncThunk('admin/addMasterDataItem', async ({ key, data }, { rejectWithValue }) => {
    try {
        const response = await api.post(`/admin/${key}`, data);
        return { key, item: response.data.data };
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const updateMasterDataItem = createAsyncThunk('admin/updateMasterDataItem', async ({ key, id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/admin/${key}/${id}`, data);
        return { key, item: response.data.data };
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const deleteMasterDataItem = createAsyncThunk('admin/deleteMasterDataItem', async ({ key, id }, { rejectWithValue }) => {
    try {
        await api.delete(`/admin/${key}/${id}`);
        return { key, id };
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

const initialState = {
    stats: {
        totalOffers: 0,
        pendingReview: 0,
        totalRevenue: 0,
        activeEmployees: 0,
    },
    statusModels: {
        product: ['Active', 'Inactive', 'Archived'],
        offer: ['draft', 'in_progress', 'offer_generated', 'ordered', 'cancelled'],
        personnel: ['Active', 'Suspended', 'Offboarded']
    },
    buildingTypes: [],
    roomTypes: [],
    smartFunctions: [],
    productRanges: [],
    colors: [],
    services: [],
    discounts: [],
    conditions: [],
    disclaimers: [],
    followupTemplates: [],
    products: [],
    employees: [],
    users: [],
    loading: false,
    error: null,
    masterDataStatus: {},
    publicProductRanges: [],
    publicColors: [],
    publicServices: [],
};

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {
        clearAdminError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Stats
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Fetch Master Data
            .addCase(fetchMasterData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMasterData.fulfilled, (state, action) => {
                state.loading = false;
                const { key, data } = action.payload;
                const apiKeyToStateKey = { 'discount-rules': 'discounts', 'offer-conditions': 'conditions' };
                let finalKey = apiKeyToStateKey[key] || key.split('-').map((word, index) => index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('');
                if (!finalKey.endsWith('s') && !['stats'].includes(finalKey)) finalKey += 's';
                if (state[finalKey] !== undefined) {
                    state[finalKey] = data;
                } else if (state[finalKey + 'List'] !== undefined) {
                    state[finalKey + 'List'] = data;
                }
            })
            .addCase(fetchMasterData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'errors.requestFailed';
            })
            // Fetch Public Master Data (Configurator preload)
            .addCase(fetchPublicMasterData.pending, (state, action) => {
                const key = action.meta.arg;
                if (!state.masterDataStatus) state.masterDataStatus = {};
                state.masterDataStatus[key] = 'loading';
            })
            .addCase(fetchPublicMasterData.fulfilled, (state, action) => {
                const { key, data } = action.payload;
                if (!state.masterDataStatus) state.masterDataStatus = {};
                state.masterDataStatus[key] = 'succeeded';
                // Keep public ranges/colors separate so admin-loaded hidden items never leak into customer flows.
                if (key === 'product-ranges') {
                    state.publicProductRanges = data;
                    return;
                }
                if (key === 'colors') {
                    state.publicColors = data;
                    return;
                }
                if (key === 'services') {
                    state.publicServices = data;
                    return;
                }

                const apiKeyToStateKey = { 'discount-rules': 'discounts', 'offer-conditions': 'conditions' };
                let finalKey = apiKeyToStateKey[key] || key.split('-').map((word, index) => index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('');
                if (!finalKey.endsWith('s') && !['stats'].includes(finalKey)) finalKey += 's';
                if (state[finalKey] !== undefined) {
                    state[finalKey] = data;
                } else if (state[finalKey + 'List'] !== undefined) {
                    state[finalKey + 'List'] = data;
                }
            })
            .addCase(fetchPublicMasterData.rejected, (state, action) => {
                const key = action.meta.arg;
                if (!state.masterDataStatus) state.masterDataStatus = {};
                state.masterDataStatus[key] = 'failed';
                state.error = action.payload?.message || 'Request failed';
            })
            // Add Item
            .addCase(addMasterDataItem.fulfilled, (state, action) => {
                const { key, item } = action.payload;
                const apiKeyToStateKey = { 'discount-rules': 'discounts', 'offer-conditions': 'conditions' };
                let finalKey = apiKeyToStateKey[key] || key.split('-').map((word, index) => index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('');
                if (!finalKey.endsWith('s')) finalKey += 's';
                if (state[finalKey]) state[finalKey].unshift(item);
            })
            // Update Item
            .addCase(updateMasterDataItem.fulfilled, (state, action) => {
                const { key, item } = action.payload;
                const apiKeyToStateKey = { 'discount-rules': 'discounts', 'offer-conditions': 'conditions' };
                let finalKey = apiKeyToStateKey[key] || key.split('-').map((word, index) => index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('');
                if (!finalKey.endsWith('s')) finalKey += 's';
                if (state[finalKey]) {
                    const index = state[finalKey].findIndex(i => i.id === item.id);
                    if (index !== -1) state[finalKey][index] = item;
                }
            })
            // Delete Item
            .addCase(deleteMasterDataItem.fulfilled, (state, action) => {
                const { key, id } = action.payload;
                const apiKeyToStateKey = { 'discount-rules': 'discounts', 'offer-conditions': 'conditions' };
                let finalKey = apiKeyToStateKey[key] || key.split('-').map((word, index) => index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('');
                if (!finalKey.endsWith('s')) finalKey += 's';
                if (state[finalKey]) {
                    state[finalKey] = state[finalKey].filter(i => i.id !== id);
                }
            });
    }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;

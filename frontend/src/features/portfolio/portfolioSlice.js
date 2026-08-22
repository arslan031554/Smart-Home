import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPortfolioProjects = createAsyncThunk(
    'portfolio/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/portfolio-projects');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio projects');
        }
    }
);

export const fetchAdminPortfolioProjects = createAsyncThunk(
    'portfolio/fetchAdminAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/portfolio-projects');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin portfolio projects');
        }
    }
);

export const addPortfolioProject = createAsyncThunk(
    'portfolio/add',
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await api.post('/admin/portfolio-projects', projectData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add portfolio project');
        }
    }
);

export const updatePortfolioProject = createAsyncThunk(
    'portfolio/update',
    async ({ id, ...projectData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/admin/portfolio-projects/${id}`, projectData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update portfolio project');
        }
    }
);

export const deletePortfolioProject = createAsyncThunk(
    'portfolio/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/portfolio-projects/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete portfolio project');
        }
    }
);

const initialState = {
    projects: [],
    adminProjects: [],
    loading: false,
    error: null,
};

const portfolioSlice = createSlice({
    name: 'portfolio',
    initialState,
    reducers: {
        clearPortfolioError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Public Fetch
            .addCase(fetchPortfolioProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPortfolioProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(fetchPortfolioProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Admin Fetch
            .addCase(fetchAdminPortfolioProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminPortfolioProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.adminProjects = action.payload;
            })
            .addCase(fetchAdminPortfolioProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addPortfolioProject.fulfilled, (state, action) => {
                state.adminProjects.unshift(action.payload);
            })
            // Update
            .addCase(updatePortfolioProject.fulfilled, (state, action) => {
                const index = state.adminProjects.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.adminProjects[index] = action.payload;
                }
            })
            // Delete
            .addCase(deletePortfolioProject.fulfilled, (state, action) => {
                state.adminProjects = state.adminProjects.filter(p => p.id !== action.payload);
            });
    }
});

export const { clearPortfolioError } = portfolioSlice.actions;
export default portfolioSlice.reducer;

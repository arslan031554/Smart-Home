import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { normalizeApiError } from '../../utils/normalizeApiError';

// Async Thunks
export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            return response.data;
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.data?.requiresVerification) {
            return rejectWithValue({
                message: 'verification_required',
                user: error.response.data.data.user,
                availableChannels: error.response.data.data.availableChannels,
                preferredVerificationChannel: error.response.data.data.preferredVerificationChannel,
                verificationReason: error.response.data.data.verificationReason || 'account_verification',
                delivery: error.response.data.data.delivery || null,
            });
        }
        return rejectWithValue(normalizeApiError(error));
    }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
    try {
        // Ensure cookies consent state can be forwarded if present
        const response = await api.post('/auth/register', userData);
        if (response.data.success) {
            return response.data;
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const sendVerificationOtp = createAsyncThunk('auth/sendVerificationOtp', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/send-verification-otp', data);
        return response.data;
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (otpData, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/verify-otp', otpData);
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            return response.data.data;
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const resendOtp = createAsyncThunk('auth/resendOtp', async ({ email, channel }, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/resend-otp', { email, channel });
        return response.data;
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const performPasswordReset = createAsyncThunk('auth/performPasswordReset', async ({ token, newPassword }, { rejectWithValue }) => {
    try {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        return true;
    } catch (error) {
        localStorage.removeItem('token');
        return rejectWithValue(normalizeApiError(error));
    }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
            return response.data.data;
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
    try {
        const response = await api.put('/auth/me', profileData);
        if (response.data.success) {
            return response.data.data.user;
        }
        return rejectWithValue(response.data.message);
    } catch (error) {
        return rejectWithValue(normalizeApiError(error));
    }
});

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isGuest: false,
    isVerifying: false,
    verificationStatus: 'none', 
    verificationReason: null,
    verificationDelivery: null,
    availableChannels: [],
    loading: false,
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        startGuestSession: (state) => {
            state.isGuest = true;
            state.isAuthenticated = false;
            state.user = { id: 'guest-' + Date.now(), role: 'guest', name: 'Guest User' };
        },
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data.user;
                state.token = action.payload.data.token;
                state.isAuthenticated = true;
                state.isGuest = false;
                state.isVerifying = false;
                state.verificationStatus = 'verified';
                state.verificationReason = null;
                state.verificationDelivery = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                if (action.payload?.message === 'verification_required') {
                    state.user = action.payload.user;
                    state.availableChannels = action.payload.availableChannels || [];
                    state.user = { ...(state.user || {}), ...(action.payload.user || {}), preferredVerificationChannel: action.payload.preferredVerificationChannel || action.payload.user?.preferredVerificationChannel };
                    state.isVerifying = true;
                    state.verificationStatus = 'otp_required';
                    state.verificationReason = action.payload.verificationReason || 'account_verification';
                    state.verificationDelivery = action.payload.delivery || null;
                } else {
                    state.error = action.payload?.message || action.payload || 'auth.errors.loginFailed';
                }
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data.user;
                state.availableChannels = action.payload.data.availableChannels || [];
                state.isVerifying = true;
                state.verificationStatus = 'otp_required';
                state.verificationReason = action.payload.data.verificationReason || 'account_verification';
                state.verificationDelivery = action.payload.data.verification?.delivery || null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || 'auth.errors.registrationFailed';
            })
            // Password reset request
            .addCase(requestPasswordReset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestPasswordReset.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(requestPasswordReset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || 'errors.requestFailed';
            })
            // Perform password reset
            .addCase(performPasswordReset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(performPasswordReset.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(performPasswordReset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || 'errors.requestFailed';
            })
            // Verify OTP
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isVerifying = false;
                state.verificationStatus = 'verified';
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.verificationReason = null;
                state.verificationDelivery = null;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isGuest = false;
            })
            .addCase(logout.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                state.isGuest = false;
            })
            // Get Me (bootstrap session on refresh)
            .addCase(getMe.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.token = localStorage.getItem('token');
            })
            .addCase(getMe.rejected, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
                localStorage.removeItem('token');
            })
            // Update profile
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = { ...(state.user || {}), ...(action.payload || {}) };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || 'errors.requestFailed';
            });
    }
});

export const {
    startGuestSession,
    clearError,
    resetAuth
} = authSlice.actions;

export default authSlice.reducer;

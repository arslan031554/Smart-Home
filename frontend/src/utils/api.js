import axios from 'axios';
import { isSessionExpired, clearSession } from './sessionManager';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const SESSION_INVALIDATED_EVENT = 'auth:session-invalidated';

function isProtectedBrowserPath() {
    if (typeof window === 'undefined') return false;

    const { pathname } = window.location;
    return pathname === '/offers'
        || pathname.startsWith('/dashboard')
        || pathname.startsWith('/admin');
}

function invalidateSession() {
    clearSession();
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_INVALIDATED_EVENT));
    }
}

function redirectProtectedPageToLogin() {
    if (typeof window !== 'undefined' && isProtectedBrowserPath()) {
        window.location.assign('/auth/login');
        return true;
    }

    return false;
}

function getCurrentLanguage() {
    const stored = localStorage.getItem('hsc_lang');
    if (stored === 'ro' || stored === 'en') return stored;
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return browser === 'ro' ? 'ro' : 'en';
}

// Request interceptor to add auth token and check session expiration
api.interceptors.request.use(
    (config) => {
        // Skip session expiry check for auth endpoints
        const isAuthEndpoint = config.url && (
            config.url.includes('/auth/login') ||
            config.url.includes('/auth/register') ||
            config.url.includes('/auth/verify-otp') ||
            config.url.includes('/auth/resend-otp') ||
            config.url.includes('/auth/send-verification-otp') ||
            config.url.includes('/auth/forgot-password') ||
            config.url.includes('/auth/reset-password') ||
            config.url.includes('/auth/newsletter-subscribe')
        );

        const token = localStorage.getItem('token');
        if (!isAuthEndpoint && token && isSessionExpired()) {
            invalidateSession();

            if (redirectProtectedPageToLogin()) {
                return Promise.reject(new Error('Session expired'));
            }
        }

        const activeToken = localStorage.getItem('token');
        if (activeToken) {
            config.headers.Authorization = `Bearer ${activeToken}`;
        }
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            if (typeof config.headers?.delete === 'function') {
                config.headers.delete('Content-Type');
            } else if (config.headers) {
                delete config.headers['Content-Type'];
            }
        }
        config.headers['Accept-Language'] = getCurrentLanguage();
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration/logout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const authorization = error.config?.headers?.Authorization
            || error.config?.headers?.authorization;
        const wasAuthenticatedRequest = typeof authorization === 'string'
            && authorization.startsWith('Bearer ');

        if (error.response?.status === 401
            && wasAuthenticatedRequest
            && !error.config?.url?.includes('/auth/login')) {
            invalidateSession();
            redirectProtectedPageToLogin();
        }
        return Promise.reject(error);
    }
);

export default api;

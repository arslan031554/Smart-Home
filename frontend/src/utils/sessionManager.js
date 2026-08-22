/**
 * Session management utilities for 24-hour session expiration.
 *
 * Rule: Every authenticated session must expire after 24 hours.
 * The login timestamp is stored alongside the JWT token in localStorage
 * and checked on protected route access and API calls.
 *
 * Why: JWTs alone don't enforce client-side session lifetime. A timestamp
 * ensures that even with a valid token, the user must re-authenticate
 * after 24 hours of inactivity or elapsed time.
 *
 * How to apply: Call `setSessionTimestamp()` on login/OTP success,
 * `isSessionExpired()` before rendering protected content, and
 * `clearSession()` on logout.
 */

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'sessionLoginAt';
const TOKEN_KEY = 'token';

/**
 * Record the current time as the session start.
 * Call this after successful login or OTP verification.
 */
export function setSessionTimestamp() {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
}

/**
 * Return true if 24 hours have elapsed since the session started.
 * Returns true if no timestamp is stored (treat missing as expired).
 */
export function isSessionExpired() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    const loginAt = Number(stored);
    if (!loginAt || Number.isNaN(loginAt)) return true;
    return Date.now() - loginAt >= SESSION_DURATION_MS;
}

/**
 * Remove both the token and the session timestamp from localStorage.
 * Call this on logout or when a session expires.
 */
export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Return the milliseconds remaining until session expiration,
 * or 0 if the session has already expired.
 */
export function getSessionRemainingMs() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;
    const loginAt = Number(stored);
    if (!loginAt || Number.isNaN(loginAt)) return 0;
    const remaining = SESSION_DURATION_MS - (Date.now() - loginAt);
    return Math.max(0, remaining);
}

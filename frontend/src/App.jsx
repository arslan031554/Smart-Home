import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe, resetAuth } from './features/auth/authSlice';
import AppRouter from './routes/AppRouter';
import { setSessionTimestamp, isSessionExpired } from './utils/sessionManager';

/**
 * Wraps router and runs auth bootstrap: restore session from token on load/refresh.
 */
export default function App() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        const handleSessionInvalidated = () => dispatch(resetAuth());
        window.addEventListener('auth:session-invalidated', handleSessionInvalidated);

        return () => {
            window.removeEventListener('auth:session-invalidated', handleSessionInvalidated);
        };
    }, [dispatch]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            if (token) dispatch(resetAuth());
            return;
        }

        // If we have a token but no session timestamp, initialize it
        // This handles the case where a user had a token from before session management was added
        if (!localStorage.getItem('sessionLoginAt')) {
            setSessionTimestamp();
        }

        // If session is expired, clear everything
        if (isSessionExpired()) {
            dispatch(resetAuth());
            return;
        }

        dispatch(getMe());
    }, [dispatch, token]);

    return <AppRouter />;
}

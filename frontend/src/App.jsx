import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import AppRouter from './routes/AppRouter';

/**
 * Wraps router and runs auth bootstrap: restore session from token on load/refresh.
 */
export default function App() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (token) {
            dispatch(getMe());
        }
    }, [dispatch, token]);

    return <AppRouter />;
}

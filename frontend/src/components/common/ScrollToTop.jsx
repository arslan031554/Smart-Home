import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Use timeout to ensure DOM is ready and override any browser scroll restoration
        const timer = setTimeout(() => {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            // Ensure document element and body are also reset
            document.documentElement.scrollTo(0, 0);
            document.body.scrollTo(0, 0);
        }, 0);

        return () => clearTimeout(timer);
    }, [pathname, search]);

    return null;
}

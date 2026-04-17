import { configureStore } from '@reduxjs/toolkit';
import configuratorReducer from '../features/configurator/configuratorSlice';
import authReducer from '../features/auth/authSlice';
import offersReducer from '../features/offers/offersSlice';
import adminReducer from '../features/admin/adminSlice';
import uiReducer from '../features/ui/uiSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

const SCHEMA_VERSION = '1.2.6'; // Increment to force significant slice resets (like admin master data & UI)

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('hsc_state');
        if (serializedState === null) return undefined;
        
        let parsed = JSON.parse(serializedState);
        const savedVersion = localStorage.getItem('hsc_schema_version');

        // Migration logic: If version mismatch, refresh admin + some UI flags
        if (savedVersion !== SCHEMA_VERSION) {
            console.log(`Schema version mismatch (Old: ${savedVersion}, New: ${SCHEMA_VERSION}). Syncing master data...`);
            
            // Keep user data (configurator, auth, offers) but refresh the admin slice
            // This ensures new categories/functions appear even if user has old localstorage
            if (parsed.admin) {
                console.warn("Resetting admin master data to code defaults due to version upgrade.");
                delete parsed.admin; 
            }

            // Also reset UI consent flags so cookie banner re-evaluates under new logic
            if (parsed.ui) {
                console.warn("Resetting UI slice due to version upgrade.");
                delete parsed.ui;
            }
        }
        
        // Auto-heal localstorage from early loop bugs
        if (parsed?.configurator?.levels && parsed.configurator.levels.length > 50) {
            console.warn("Detected massive broken state segment, auto-healing to sane limits...");
            parsed.configurator.levels = parsed.configurator.levels.slice(0, 50);
            if (parsed.configurator.projectInfo) {
                parsed.configurator.projectInfo.levelsCount = 50;
            }
        }

        // Ensure cookie banner shows again if no consent was given yet
        if (parsed.ui) {
            if (parsed.ui.cookieConsent === undefined || parsed.ui.cookieConsent === false) {
                parsed.ui.showCookieBanner = true;
            }
        }
        
        return parsed;
    } catch (err) {
        console.error("Failed to load state from localStorage:", err);
        localStorage.removeItem('hsc_state');
        return undefined;
    }
};

const saveState = (state) => {
    try {
        const serializedState = JSON.stringify({
            admin: state.admin,
            configurator: state.configurator,
            auth: state.auth,
            offers: state.offers,
            ui: state.ui,
        });
        localStorage.setItem('hsc_state', serializedState);
        localStorage.setItem('hsc_schema_version', SCHEMA_VERSION);
    } catch (err) {
        console.error("Failed to save state to localStorage:", err);
    }
};

const preloadedState = loadState();

export const store = configureStore({
    reducer: {
        configurator: configuratorReducer,
        auth: authReducer,
        offers: offersReducer,
        admin: adminReducer,
        ui: uiReducer,
        dashboard: dashboardReducer,
    },
    preloadedState,
});

let saveTimeout;
store.subscribe(() => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveState(store.getState());
    }, 50); // Aggressive 50ms pulse for real-time persistence
});

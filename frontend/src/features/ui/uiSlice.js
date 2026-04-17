import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cookieConsent: false,
    newsletterConsent: false,
    showCookieBanner: true,
    activeSidebarItem: 'dashboard',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        acceptCookies: (state) => {
            state.cookieConsent = true;
            state.showCookieBanner = false;
        },
        declineCookies: (state) => {
            state.cookieConsent = false;
            state.showCookieBanner = false;
        },
        setNewsletterConsent: (state, action) => {
            state.newsletterConsent = action.payload;
        },
        setSidebarItem: (state, action) => {
            state.activeSidebarItem = action.payload;
        }
    }
});

export const { acceptCookies, declineCookies, setNewsletterConsent, setSidebarItem } = uiSlice.actions;
export default uiSlice.reducer;

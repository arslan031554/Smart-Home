# App Flow

## Guest flow
1. User starts as guest.
2. Configurator state is saved locally and synced to guest draft endpoints.
3. When generating an offer, the UI redirects to register or login.
4. After login or OTP verification, the guest draft is attached to the account.
5. The configurator returns to the saved step.

## Authenticated flow
1. Draft is fetched from backend if present.
2. Configurator changes sync to the authenticated draft endpoint.
3. Offer generation clears the active draft and moves to success.

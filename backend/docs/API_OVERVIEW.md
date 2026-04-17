# API Overview

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-verification-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PUT /api/auth/me`

## Configurator drafts
- `GET /api/configurator-drafts/current/public`
- `PUT /api/configurator-drafts/current/public`
- `GET /api/configurator-drafts/current`
- `PUT /api/configurator-drafts/current`
- `POST /api/configurator-drafts/current/attach`
- `POST /api/configurator-drafts/current/complete`

## Offers
- calculate, create, list, detail, export, follow-up patch

## Admin
- employees, permissions, master data, products, business content, follow-up templates

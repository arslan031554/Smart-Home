# Technical Handoff

## 1. Platform Overview

Smart Building Configurator is an existing full-stack quotation platform for residential/commercial smart-home projects. The system supports:

- customer registration, OTP verification, login, password reset
- guest-start configurator with draft persistence and authenticated handoff
- project definition with levels, rooms, functions, range, color, services, and customer comments
- backend-authoritative product/service calculation and multiplier discounting
- stored offers with PDF and Excel export
- follow-up automation for unfinished authenticated drafts and generated-but-unordered offers
- admin/backoffice CRUD for master data, rules, employees, permissions, and follow-up templates
- English and Romanian language support

## 2. Repository Structure

- `frontend/`: React + Vite SPA for public pages, configurator, customer dashboard, and admin backoffice
- `backend/`: Express API, Sequelize models/migrations, calculation engine, exports, notifications, scheduler
- `backend/models/`: Sequelize models and associations
- `backend/migrations/`: schema history
- `backend/scripts/`: migration/validation/seed helpers
- `docs/`: handoff documentation

## 3. Local Setup

### Prerequisites

- Node.js
- PostgreSQL
- optional live integration credentials for reCAPTCHA, SendGrid, and Twilio

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Environment

- copy `backend/.env.example` to `backend/.env`
- copy `frontend/.env.example` to `frontend/.env`
- for local dev, `frontend/.env.development` and `backend/.env.development` can keep the app on localhost with mock integrations

### Database

```bash
cd backend
npm run db:migrate
npm run seed:master
```

### Run

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## 4. Environment Variables

### Backend

Core:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`
- `FRONTEND_URL`
- `CORS_ORIGIN`

Registration/verification:

- `RECAPTCHA_MODE`
- `RECAPTCHA_SECRET_KEY`

Email/SMS:

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_MOCK_MODE`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_MOCK_MODE`
- `NOTIFICATION_LOG_OTP`

Exports/branding:

- `APP_BRAND_NAME`
- `APP_CURRENCY`
- `APP_LOCALE`

Scheduler:

- `ENABLE_FOLLOWUP_CRON`
- `FOLLOWUP_CRON_SCHEDULE`

### Frontend

- `VITE_API_URL`
- `VITE_RECAPTCHA_SITE_KEY`
- `VITE_RECAPTCHA_MODE`

## 5. Migration and Seed Notes

Recent migrations that must be present in every deployed environment:

- `20260402000000-create-followup-templates.cjs`
- `20260402010000-add-color-hex.cjs`
- `20260402020000-add-configurator-draft-guest-session.cjs`
- `20260402030000-add-followup-logs-and-template-context.cjs`

The master-data seed is idempotent and should be used to create a workable admin baseline, not final client content.

## 6. Architecture and Module Overview

### Frontend

- routing: `frontend/src/routes/AppRouter.jsx`
- configurator state: `frontend/src/features/configurator/configuratorSlice.js`
- auth state: `frontend/src/features/auth/authSlice.js`
- offers/admin state: Redux Toolkit slices under `frontend/src/features`
- API wrapper: `frontend/src/utils/api.js`
- guest draft helpers: `frontend/src/utils/configuratorDraftStorage.js`

### Backend

- app bootstrap: `backend/src/app.js`, `backend/src/server.js`
- auth: `backend/src/controllers/authcontroller.js`, `backend/src/services/authservice.js`
- configurator drafts: `backend/src/controllers/configuratordraftcontroller.js`, `backend/src/services/configuratordraftservice.js`
- offers: `backend/src/controllers/offercontroller.js`, `backend/src/services/offerservice.js`
- calculation: `backend/src/services/calculationservice.js`
- exports: `backend/src/services/exportservice.js`
- notifications: `backend/src/services/notificationservice.js`
- follow-ups: `backend/src/services/followupservice.js`

## 7. Guest-to-Account Flow

- anonymous users get a persisted frontend guest session id
- draft reads/writes go through `/api/configurator-drafts/current` with `X-Guest-Session-Id`
- when the user registers, logs in, or verifies OTP, the backend attaches the newest guest draft to the authenticated account
- final offer generation is blocked for unverified customer accounts
- after a successful offer generation, the active draft is marked completed/converted so reminder processing stops

## 8. Calculation Logic

- `IN` channels are aggregated per room
- `OUT` channels are aggregated per level
- `GENERAL` channels are aggregated per project
- compatible products are selected from active mappings only
- allocation is deterministic and capacity-first:
  - prefer the smallest single product that fully covers the remaining need
  - otherwise allocate the current largest valid capacity and resolve the remainder with smaller valid products
  - if no smaller valid product exists, round up the larger product quantity
- hidden ranges/colors can still be used internally when selected in the mapping path
- missing mappings do not fabricate BOM rows; unmet requirements are returned explicitly
- services are calculated from the stored pricing mode and selected project totals
- multiplier discount is applied after per-project products/services are expanded to the full multiplication index

Validation helper:

```bash
cd backend
npm run calculations:validate
```

## 9. PDF and Excel Exports

### PDF

The PDF is generated on the backend and includes:

- offer number, offer id, creation date
- customer and project data
- functions
- products
- services
- grand total and discount breakdown
- offer conditions
- disclaimer
- customer comments

### Excel

The Excel workbook is generated on the backend and contains:

- `Project Info`
- `Products`
- `Services`
- `Calculation Summary`

The workbook is intended for internal order-processing usage and exposes per-project and multiplied totals.

## 10. Follow-up Workflow

Two reminder contexts exist:

- `unfinished_configuration`
- `offer_not_ordered`

Rules:

- unfinished authenticated drafts: day 7, day 14, day 30
- generated unordered offers: every 7 days until the offer leaves the eligible statuses or staff disables follow-up
- reminder state advances only after confirmed provider delivery on at least one enabled channel
- mock-mode sends are logged but do not advance reminder state
- duplicate sends on the same day are skipped and logged
- send attempts are stored in `FollowupLogs` with `sent`, `skipped`, or `failed`

Template variables:

- offer reminders: `{name}`, `{offerNumber}`, `{offerUrl}`
- unfinished configuration reminders: `{name}`, `{projectName}`, `{configuratorUrl}`

Manual execution:

```bash
cd backend
npm run followups:run-once
```

## 11. Admin Usage Notes

Backoffice staff manage:

- building types, room types, smart functions
- ranges, colors, products, services
- discount rules
- offer conditions and disclaimers
- follow-up templates
- employees and permissions

Operational dependency highlights:

- products require valid function mappings to participate in calculation
- services can be optional or mandatory and may be tied to smart functions
- follow-up templates should be created per context, channel, step, and language

## 12. Deployment Guide

Recommended deployment order:

1. update backend code
2. run `npm install`
3. run `npm run db:migrate`
4. verify backend env values, especially integrations and scheduler ownership
5. run `npm run integrations:check`
6. start or restart the backend
7. build frontend with the correct production `VITE_API_URL`
8. deploy frontend assets
9. run post-deploy smoke checks

Production note:

- only one backend instance should run with `ENABLE_FOLLOWUP_CRON=true` unless external scheduler coordination is added outside this repository

## 13. Troubleshooting

- `502` on OTP send: usually SendGrid/Twilio live config is missing or the backend is still running with production-style envs during local development
- CORS errors from localhost: verify `FRONTEND_URL`, `CORS_ORIGIN`, and restart the backend after env changes
- guest draft not restored: confirm the browser still has the same guest session id and the migration `20260402020000-add-configurator-draft-guest-session.cjs` is applied
- reminder not advancing: check provider delivery status and `FollowupLogs`; mock sends do not count as delivered
- duplicate reminder suspicion: inspect `FollowupLogs` for same-day `skipped` entries with `duplicate_same_day`
- missing product lines: run `npm run calculations:validate` and confirm the required product-function mappings exist in admin

## 14. Known Operational Assumptions

- PostgreSQL is the actual supported database in this codebase
- offer exports intentionally use backend-calculated stored data as the source of truth
- unfinished reminders apply only to authenticated server-known drafts, not anonymous browser-only progress
- product images in PDF export must be reachable by URL or readable from safe local paths under the project/deploy filesystem

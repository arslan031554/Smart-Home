# Smart Home Configurator

Smart Home Configurator is a full-stack customer quotation platform for smart-home projects. Customers can start a configuration, define a building, add rooms and smart functions, select range/color/services, review a calculation-backed summary, and generate a stored offer. Internal staff use the admin backoffice to manage master data, offers, employees, permissions, reminder templates, and commercial settings.

Detailed handoff notes are available in [docs/TECHNICAL_HANDOFF.md](docs/TECHNICAL_HANDOFF.md).

## Repository Structure

- `frontend/` - React + Vite single-page application for the public site, configurator, customer dashboard, and admin backoffice.
- `backend/` - Node.js + Express API, Sequelize models/migrations, calculation engine, PDF/Excel exports, notifications, and follow-up scheduler.
- `backend/models/` - Sequelize models and associations.
- `backend/migrations/` - Full schema history, including recent project/admin/follow-up/multilingual additions.
- `backend/scripts/` - Idempotent seed helpers for master data and test users.

## Implemented Functional Modules

- Customer account registration with reCAPTCHA, OTP verification, login, profile editing, and password reset.
- Guest-start configurator flow with authenticated server-side configurator draft syncing before offer generation.
- Project definition, levels/rooms, smart-function allocation, range/color/service selection, summary, and offer generation.
- Backend-authoritative calculation for products, services, discounts, and totals.
- Offer lifecycle support for create, update-from-config, duplicate, delete, PDF export, and Excel export.
- Admin/backoffice CRUD for building types, room types, smart functions, ranges, colors, products, services, discount rules, offer conditions, disclaimers, follow-up templates, employees, and permissions.
- Daily follow-up automation for unfinished authenticated configurations and issued-but-not-ordered offers using SendGrid/Twilio.
- Multilingual business-content support for English and Romanian, with a translation storage shape that can be extended later.

## Architecture Overview

### Frontend

The frontend is a Vite-built React SPA. It contains:

- public pages and the configurator flow
- authenticated customer dashboard pages for projects, offers, and profile
- authenticated admin pages for master data, offers, employees, permissions, and settings
- UI translations through `react-i18next`
- API access through Axios with bearer-token auth and `Accept-Language` propagation

### Backend API

The backend is an Express application mounted under `/api`. It provides:

- authentication and OTP verification endpoints
- customer dashboard endpoints
- public master-data endpoints for the configurator
- project and offer APIs
- admin/backoffice APIs
- configurator draft persistence for follow-up eligibility
- PDF and Excel export endpoints

### Database

The current codebase is configured for PostgreSQL only. Both `backend/src/config/database.js` and `backend/config/config.cjs` use Sequelize with the `postgres` dialect. Although the original client brief allows PostgreSQL or MySQL, the implemented project currently runs against PostgreSQL in practice.

### Calculation, Exports, and Notifications

- The backend calculation service is the single source of truth for products, services, discounts, and totals.
- Product line items are calculated per project using mapped function/channel capacity, then adjusted by the selected range multiplier.
- Services are calculated per project from the persisted pricing mode (`fixed_project`, `per_room`, `per_level`, `per_product_qty`, `per_function_qty`).
- The multiplication index is applied after per-project products/services are calculated, producing a gross total across all repeated units before discount rules are applied.
- Stored offers persist both the final commercial totals and a calculation breakdown in `calculationSnapshot.calculationBreakdown` so the configurator summary, account offer detail, PDF, and Excel exports stay aligned.
- PDF generation uses `pdf-lib` and can embed configured product images from reachable URLs or readable filesystem paths.
- Excel export uses `exceljs`.
- Email delivery uses SendGrid when credentials are configured; otherwise the notification service stays in mock mode outside production.
- SMS delivery uses Twilio when credentials are configured; otherwise SMS sending stays in mock mode outside production.

### Follow-up Scheduler

`backend/src/server.js` starts the daily follow-up scheduler through `initFollowupCron()`. The scheduler runs inside the backend process and processes:

- unfinished authenticated configurator drafts
- generated offers still in reminder-eligible statuses

The implemented reminder cadence is split by context:

- unfinished authenticated configurator drafts: `7,14,30` days
- generated but unordered offers: every `7` days until the offer becomes ordered, cancelled, expired outside the eligible statuses, or is manually stopped

### Multilingual Business Content

Static UI labels are handled in the frontend i18n layer. Customer-facing business data is language-aware in the backend through localized `translations` JSON fields with deterministic fallback to existing legacy single-language fields.

## Local Development Setup

### Prerequisites

- Node.js installed for both frontend and backend dependency trees
- PostgreSQL database available locally or remotely
- Google reCAPTCHA keys if you want live registration verification
- SendGrid/Twilio credentials if you want live email/SMS delivery

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment files

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`
- Fill values for your database, JWT secret, frontend URL, and optional integrations

### 3. Create the PostgreSQL database

Create the database referenced by `DB_NAME` before running migrations.

### 4. Run database migrations

```bash
cd backend
npm run db:migrate
```

This applies the baseline schema plus recent additions such as:

- `20260331000000-add-project-complexity-to-projects.cjs`
- `20260331010000-add-admin-user-fields.cjs`
- `20260331020000-create-configurator-drafts.cjs`
- `20260331100000-add-business-content-translations.cjs`
- `20260402000000-create-followup-templates.cjs`
- `20260402010000-add-color-hex.cjs`
- `20260402020000-add-configurator-draft-guest-session.cjs`
- `20260402030000-add-followup-logs-and-template-context.cjs`

### 5. Seed master data and test accounts (optional but recommended for local dev)

```bash
cd backend
npm run seed:master
```

This seed script is idempotent and creates core master data plus two local test users:

- `admin@test.com` / `Admin@12345`
- `user@test.com` / `User@12345`

### 6. Start the backend

```bash
cd backend
npm run dev
```

The backend defaults to port `5000` unless `PORT` is set.

### 7. Start the frontend

```bash
cd frontend
npm run dev
```

Vite serves the SPA on its default dev port unless you override it externally. The frontend should point to the backend API using `VITE_API_URL`.

## Environment Variables

### Backend (`backend/.env`)

See [backend/.env.example](D:/arslan/Smart%20Home%20Configurator/backend/.env.example).

Required for startup:

- `DB_NAME` - PostgreSQL database name
- `DB_USER` - PostgreSQL user
- `DB_PASSWORD` - PostgreSQL password
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `JWT_SECRET` - JWT signing secret

Other supported variables used by the codebase:

- `PORT` - backend listen port, defaults to `5000`
- `NODE_ENV` - affects logging/error output and notification mocks
- `CORS_ORIGIN` - allowed frontend origin for credentialed API requests
- `JWT_EXPIRES_IN` - JWT expiry, defaults to `7d`
- `FRONTEND_URL` - absolute frontend base URL used in reset links, reminder links, and emailed offer links
- `OFFER_FILE_STORAGE_PATH` - backend-local directory for persisted generated offer PDFs and Excel exports
- `RECAPTCHA_MODE` - `live` by default; set to `mock` only in non-production if you intentionally want server-side reCAPTCHA bypass for local testing
- `RECAPTCHA_SECRET_KEY` - required whenever `RECAPTCHA_MODE=live`
- `SENDGRID_API_KEY` - required for live SendGrid delivery
- `SENDGRID_FROM_EMAIL` - verified sender address for live SendGrid delivery
- `SENDGRID_MOCK_MODE` - optional non-production override to force email sends into mock mode
- `TWILIO_ACCOUNT_SID` - required for live Twilio delivery
- `TWILIO_AUTH_TOKEN` - required for live Twilio delivery
- `TWILIO_PHONE_NUMBER` - required sender number for live Twilio OTP/reminder sends
- `TWILIO_MOCK_MODE` - optional non-production override to force SMS sends into mock mode
- `NOTIFICATION_LOG_OTP` - optional non-production flag to print OTP codes to the backend console for local testing
- `APP_BRAND_NAME` - export branding label
- `APP_CURRENCY` - export currency label
- `APP_LOCALE` - export locale used in date/number formatting
- `ENABLE_FOLLOWUP_CRON` - set to `false` on backend instances that must not own the scheduler
- `FOLLOWUP_CRON_SCHEDULE` - cron expression for reminder execution, defaults to `0 10 * * *`

### Frontend (`frontend/.env`)

See [frontend/.env.example](D:/arslan/Smart%20Home%20Configurator/frontend/.env.example).

Used variables:

- `VITE_API_URL` - backend API base URL, for example `http://localhost:5000/api`
- `VITE_RECAPTCHA_SITE_KEY` - site key used by the registration page
- `VITE_RECAPTCHA_MODE` - `live` by default; set to `mock` only when the backend is also running in non-production mock mode

## Key Operational Flows

### Registration and OTP verification

- Registration posts to `/api/auth/register`
- The backend verifies reCAPTCHA server-side and now receives the client IP from the API layer when available
- Accounts are created unverified
- OTP can be sent by email or SMS depending on stored contact data
- Login blocks unverified users and returns available OTP channels
- OTP state is rolled back if SendGrid/Twilio delivery fails, so unsent verification codes are not left active in the database

### Guest-to-account configurator handoff

- The configurator can be started without logging in
- Guests keep draft progress in browser storage
- Before final offer generation, the user must authenticate
- Once authenticated, the configurator restores the newest available draft and syncs in-progress state server-side through `/api/configurator-drafts/current`
- Completing offer generation marks the active draft completed/converted so reminders stop

### Offer generation and lifecycle

- Preview calculations use `/api/offers/calculate`
- Final offer creation uses `/api/offers/from-config`
- Editing an existing offer uses `PUT /api/offers/:id/from-config`
- Stored offers can be reopened into the configurator, duplicated, exported, and deleted
- Offer PDF and Excel exports are available from `/api/offers/:id/export/pdf` and `/api/offers/:id/export/excel`

### PDF and Excel exports

- PDF export uses persisted offer data plus localized business content and configured disclaimer/condition text
- Generated PDFs are persisted as offer files and linked back to the offer, project, and customer; downloads reuse the stored file unless regeneration is requested.
- Product images are embedded when the backend can read the configured local path or fetch the configured remote URL
- Excel export is built from the stored offer, calculated products/services, and project snapshot
- Generated Excel exports are persisted for internal users and linked back to the offer, project, and customer; customers cannot download Excel files.
- Excel rows expose both per-project quantities/subtotals and total quantities/subtotals derived from the multiplication index for internal order processing

### Follow-up reminders

- The backend process starts the daily cron job automatically
- Offer reminders apply to reminder-eligible generated offers every 7 days until the offer becomes `ordered`, `cancelled`, or is manually stopped
- Configurator reminders apply only to authenticated, server-known unfinished drafts
- Configurator reminders follow the `7/14/30` cadence from the draft's last activity timestamp
- Reminder records are only advanced after at least one configured delivery channel succeeds; full provider failure leaves the reminder eligible for retry on the next scheduler run
- Reminder templates are context-aware: `offer_not_ordered` and `unfinished_configuration`
- Reminder send attempts are written to `FollowupLogs` as `sent`, `skipped`, or `failed`
- SendGrid/Twilio credentials are required for real delivery; otherwise non-production runs stay in mock mode

## Integration Setup

### Google reCAPTCHA

1. Create a Google reCAPTCHA key pair for the frontend domain.
2. Set `RECAPTCHA_MODE=live` and `RECAPTCHA_SECRET_KEY` in `backend/.env`.
3. Set `VITE_RECAPTCHA_SITE_KEY` and `VITE_RECAPTCHA_MODE=live` in `frontend/.env`.
4. For local-only testing without Google, set `RECAPTCHA_MODE=mock` in the backend and `VITE_RECAPTCHA_MODE=mock` in the frontend. Do not use mock mode in production.

Expected failure behavior:

- Missing token or invalid token returns a safe 400 error and keeps registration blocked.
- Google/network failures return a safe integration error without weakening verification.
- `RECAPTCHA_MODE=mock` in production is treated as a configuration error.

### SendGrid

1. Create or verify a sender address/domain in SendGrid.
2. Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` in `backend/.env`.
3. Leave `SENDGRID_MOCK_MODE=false` for live delivery.
4. In local development, omit credentials or set `SENDGRID_MOCK_MODE=true` to keep email in mock mode.

Expected failure behavior:

- In production, missing SendGrid config fails email delivery explicitly instead of silently no-oping.
- Provider API failures surface back to OTP/reminder callers and are logged server-side.
- Reminder state does not advance on full SendGrid failure.

### Twilio

1. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` in `backend/.env`.
2. Leave `TWILIO_MOCK_MODE=false` for live delivery.
3. In local development, omit credentials or set `TWILIO_MOCK_MODE=true` to keep SMS in mock mode.

Expected failure behavior:

- In production, missing Twilio config fails SMS delivery explicitly instead of silently no-oping.
- Invalid stored phone numbers return a user-safe SMS delivery error.
- Reminder state does not advance on full Twilio failure.

## Integration Testing

### Check configuration

```bash
cd backend
npm run integrations:check
```

This prints the active reCAPTCHA, SendGrid, and Twilio modes and exits non-zero if the integration layer is not production-ready.

### Validate backend calculations

```bash
cd backend
npm run calculations:validate
```

This runs representative validation scenarios for:

- multiplier `= 1`
- multiplier `> 1` with discount
- remainder allocation
- service generation
- hidden/internal mapping handling

### Test OTP email

1. Ensure the backend is running with live SendGrid credentials or with `SENDGRID_MOCK_MODE=true`.
2. If using mock mode, set `NOTIFICATION_LOG_OTP=true` and watch the backend console.
3. Register a user or call `POST /api/auth/send-verification-otp` with `{ "email": "...", "channel": "email" }`.
4. In live mode, confirm the email arrives. In mock mode, confirm the response is successful and read the OTP from backend logs.

### Test OTP SMS

1. Ensure the backend is running with live Twilio credentials or with `TWILIO_MOCK_MODE=true`.
2. If using mock mode, set `NOTIFICATION_LOG_OTP=true` and watch the backend console.
3. Call `POST /api/auth/send-verification-otp` with `{ "email": "...", "channel": "sms" }` for a user with a stored phone number.
4. In live mode, confirm the SMS arrives. In mock mode, confirm the response is successful and read the OTP from backend logs.

### Test reminder sending

1. Create an eligible authenticated draft or generated offer that is due for follow-up.
2. Configure live SendGrid/Twilio credentials or use the relevant mock mode.
3. Run the processor once manually:

```bash
cd backend
npm run followups:run-once
```

4. In live mode, confirm the email/SMS arrives.
5. In mock mode, confirm the processor runs without advancing reminder state, unless a real provider-delivered channel succeeded.

### Admin/backoffice

- Admin routes live under `/api/admin`
- Employee accounts and permissions are stored in the main `Users` table
- Backend admin routes now enforce permission-specific checks, not just generic employee/admin access
- The admin dashboard reads real stats from the backend
- Admin offer monitoring uses real stored offers and filterable list data

### Multilingual business content

- The active UI language is stored in frontend local storage as `hsc_lang`
- API requests send the current language in `Accept-Language`
- Public master-data endpoints and exports resolve Romanian/English business content with fallback to legacy single-language fields

## Production Build and Linux Deployment Handoff

### Backend deployment

On the Linux host:

1. Install Node.js and PostgreSQL client/runtime prerequisites needed for this repo.
2. Place the backend code on the server.
3. Create `backend/.env` with production values.
4. Install dependencies:

```bash
cd backend
npm install
```

5. Run migrations:

```bash
npm run db:migrate
```

6. Start the API process:

```bash
npm start
```

The repository does not ship with Docker, PM2, systemd unit files, or reverse-proxy config. Use your hosting provider's preferred process manager/static hosting setup around the existing Node entrypoint.

### Frontend deployment

1. Create `frontend/.env` with the production API URL and reCAPTCHA site key.
2. Build the SPA:

```bash
cd frontend
npm install
npm run build
```

3. Serve the generated `frontend/dist/` directory with the static web server or WebView host used by your Linux environment.

The frontend is a responsive SPA and can be hosted as a normal web application or embedded in a WebView-capable shell, provided routing is configured to fall back to `index.html`.

Important:

- rebuild `frontend/dist/` every time `frontend/.env` changes
- do not reuse an older `dist/` directory after changing `VITE_API_URL`, `VITE_RECAPTCHA_SITE_KEY`, or `VITE_RECAPTCHA_MODE`

### Scheduler and scaling note

The follow-up scheduler is initialized inside `backend/src/server.js`. Every running backend instance will start the cron job. For production, run only one scheduler-owning backend instance unless you add external coordination outside this repository.

### PDF image/network note

If product images are expected in generated PDFs:

- remote `http/https` image URLs must be reachable from the backend host
- local file paths must be readable by the backend process

## Deployment Prerequisites and Honest Limitations

- PostgreSQL is the implemented database target today; MySQL is not wired in the current code.
- Live registration requires `RECAPTCHA_SECRET_KEY` on the backend and `VITE_RECAPTCHA_SITE_KEY` on the frontend.
- Live email delivery requires SendGrid configuration.
- Live SMS delivery requires Twilio configuration.
- Recent migrations from the completed implementation prompts must be applied before using project complexity, admin employee fields, configurator drafts, and multilingual business content.
- Frontend production builds currently emit a non-blocking Vite chunk-size warning; this does not prevent deployment.

## Post-Deploy Checks

Run these checks after deploying:

1. Call `GET /api/health` and confirm the backend is reachable.
2. Run `npm run integrations:check` on the deployed backend environment.
3. Register a user with reCAPTCHA and verify OTP by the intended live channel.
4. Generate one offer and confirm offer detail, PDF, and Excel totals match.
5. Run `npm run followups:run-once` once in a controlled environment and confirm only successfully delivered reminders advance state.
6. Confirm the served frontend is using the expected production API URL and reCAPTCHA site key by testing the live registration flow.

## Additional Module Notes

- [backend/README.md](D:/arslan/Smart%20Home%20Configurator/backend/README.md) contains backend-specific setup and operations notes.
- [frontend/README.md](D:/arslan/Smart%20Home%20Configurator/frontend/README.md) contains frontend-specific development/build notes.

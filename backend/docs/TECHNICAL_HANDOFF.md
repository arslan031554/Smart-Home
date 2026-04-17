# Technical Handoff

## Stack
- Node.js / Express
- PostgreSQL / Sequelize
- SendGrid / Twilio integrations
- Scheduled follow-up job via cron

## Core API groups
- `/api/auth`
- `/api/projects`
- `/api/offers`
- `/api/configurator-drafts`
- `/api/admin`
- `/api/master-data`

## Important business flows
1. Guest starts configurator and gets a guest session draft.
2. Draft is synced locally and optionally to backend through guest draft endpoints.
3. User logs in or verifies OTP.
4. Guest draft is attached to account.
5. Offer is calculated and generated.
6. PDF is sent and stored; Excel is produced for internal use.
7. Follow-up automation stays in sync with offer status.

# Smart Building Configurator Backend

Express + PostgreSQL API for the Smart Building Configurator.

## Delivered modules
- customer authentication, OTP verification, password reset
- guest and authenticated configurator draft persistence
- project and offer APIs
- calculation engine with diagnostics and discount handling
- PDF offer export and multi-sheet Excel export
- stored offer PDF/Excel files linked to offers, projects, and users
- follow-up automation and template support
- admin/backoffice CRUD for master data and business content

## Start locally
```bash
npm install
npm run db:migrate
npm run seed:master
npm run dev
```

## Useful scripts
- `npm run calculations:validate`
- `npm run followups:run-once`
- `npm run integrations:check`

## Follow-up automation configuration
- `FOLLOWUP_CRON_ENABLED=true|false`
- `FOLLOWUP_CRON_SCHEDULE="0 10 * * *"` (cron expression)
- `FOLLOWUP_CRON_TIMEZONE="Europe/Bucharest"` (optional timezone)
- `FOLLOWUP_CADENCE_DAYS="7,14,30"` (cadence days from draft activity or offer generation)
- `FOLLOWUP_SMS_ENABLED=false` (must be true before follow-up SMS uses Twilio)

Follow-up delivery attempts are persisted in `FollowupLogs` (migrations `20260417010000-create-followup-logs.cjs` and `20260521020000-add-followup-log-cadence-and-project.cjs`) for audit/troubleshooting.

## Offer file storage
- `OFFER_FILE_STORAGE_PATH=storage/offer-files` controls where generated PDF and Excel files are persisted.
- PDF exports are generated and linked when an offer is created or updated, then reused on download unless `regenerate=true` is sent.
- Excel exports are generated on first internal download, linked to the offer/project/user, and reused unless `regenerate=true` is sent.

## Important docs
- `PROJECT_HANDOFF.md`
- `docs/API_OVERVIEW.md`
- `docs/CALCULATION_LOGIC.md`
- `docs/ADMIN_USAGE.md`
- `docs/DEPLOYMENT.md`
- `docs/TROUBLESHOOTING.md`

## Notes
- API base path: `/api`
- health endpoint: `/api/health`
- guest draft migration included: `20260403000000-add-guest-session-to-configurator-drafts.cjs`

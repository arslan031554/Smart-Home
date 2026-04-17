# Smart Home Configurator Backend

Express + PostgreSQL API for the Smart Home Configurator.

## Delivered modules
- customer authentication, OTP verification, password reset
- guest and authenticated configurator draft persistence
- project and offer APIs
- calculation engine with diagnostics and discount handling
- PDF offer export and multi-sheet Excel export
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

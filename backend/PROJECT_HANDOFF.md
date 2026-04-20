# Smart Home Configurator Backend Handoff

## Delivered capability
- authentication, OTP verification, password reset
- guest + account configurator draft recovery
- offer calculation with diagnostics and financial breakdown
- PDF export and multi-sheet Excel export
- follow-up automation for unfinished drafts and unordered offers
- admin APIs for master data, permissions, offers, templates, and business content

## Important migration to run
```bash
npm run db:migrate
```
This package now includes the migration:
- `20260403000000-add-guest-session-to-configurator-drafts.cjs`

## Production checklist
1. set real DB credentials
2. set `NODE_ENV=production`
3. set `RECAPTCHA_MODE=live`
4. set real SendGrid/Twilio credentials and disable mock mode
5. run migrations
6. verify cron execution and PDF/Excel paths on the host

## Live QA still required
- real SendGrid/Twilio delivery
- exact PDF visual approval
- final Excel business approval
- end-to-end hosting validation

## OTP hardening
- signup already requires OTP verification before token issuance
- login already requires OTP verification before token issuance
- set `REQUIRE_REAL_OTP_DELIVERY=true` to reject mocked OTP delivery and require live Twilio/SendGrid delivery
- in production, the server already refuses to boot unless Twilio/SendGrid/reCAPTCHA are live-ready

# Deployment Notes

## Local development
Use `.env` or `.env.development` with `NODE_ENV=development`.
Recommended local settings:
- `RECAPTCHA_MODE=mock`
- `SENDGRID_MOCK_MODE=true`
- `TWILIO_MOCK_MODE=true`

## Production
Before production:
- set `NODE_ENV=production`
- disable mock providers
- provide real SendGrid/Twilio credentials
- run migrations
- verify cron runs in the host environment
- validate CORS and frontend API URL

# Real OTP Delivery Setup

This codebase now supports strict OTP hardening.

## What changed
- Signup requires OTP verification before issuing a token.
- Login requires OTP verification before issuing a token.
- When `REQUIRE_REAL_OTP_DELIVERY=true`, mocked OTP delivery is rejected.
- In production, the backend already requires live-ready reCAPTCHA, Twilio, and SendGrid configuration.

## Required backend environment variables
- `RECAPTCHA_MODE=live`
- `SENDGRID_API_KEY=<real key>`
- `SENDGRID_FROM_EMAIL=<verified sender>`
- `SENDGRID_MOCK_MODE=false`
- `TWILIO_ACCOUNT_SID=<real AC... SID>`
- `TWILIO_AUTH_TOKEN=<real token>`
- `TWILIO_PHONE_NUMBER=<real E.164 number>`
- `TWILIO_MOCK_MODE=false`
- `REQUIRE_REAL_OTP_DELIVERY=true`

## Important limitation
Real delivery still depends on:
- valid live credentials
- verified SendGrid sender/domain
- Twilio SMS capability on the account/number
- reachable phone/email destination
- correct hosting/network environment

Without live credentials and a real end-to-end test, delivery cannot be guaranteed by code alone.

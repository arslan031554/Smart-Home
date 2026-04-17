# Troubleshooting

## Register fails
- confirm migrations are up to date
- confirm reCAPTCHA mode matches environment
- confirm email is not already registered

## OTP not delivered
- in local dev use mock mode and `NOTIFICATION_LOG_OTP=true`
- in production confirm verified sender/domain and Twilio number

## PDF or Excel issues
- verify product images/paths
- confirm calculation snapshot exists on the offer

## Follow-up issues
- confirm cron is running
- confirm follow-up records are enabled and status allows reminders

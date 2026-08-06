# SMS and Email Delivery Configuration Guide

## Overview

The Smart Building Configurator supports OTP delivery via **SMS (Twilio)** and **Email (SendGrid)**. Users can choose their preferred method during login and signup.

---

## Current Configuration Status

### From `.env.development`:
```
TWILIO_PHONE_NUMBER=+40746133833        ✅ Fixed (correct E.164 format)
TWILIO_MOCK_MODE=false                  (Real delivery enabled)
SENDGRID_MOCK_MODE=false                (Real delivery enabled)
REQUIRE_REAL_OTP_DELIVERY=true           (Strict: only real delivery accepted)
```

### Issue Fixed ✅
- **Phone number format** was invalid: `+40 746 133 833` (with spaces)
- **Fixed to**: `+40746133833` (E.164 format, no spaces)
- **Frontend error display** now shows channel-specific errors instead of generic ones

---

## How to Set Up Real SMS Delivery (Twilio)

### Step 1: Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com) and sign up for free
2. Verify your identity and phone number
3. You'll get $15 free credit

### Step 2: Get Credentials
1. Go to Twilio Console → Account
2. Find: **Account SID** (starts with `AC`)
3. Find: **Auth Token** (under API credentials)
4. Go to Phone Numbers → Manage Numbers
5. Get or purchase a phone number (format: `+1234567890`)

### Step 3: Update `.env.development`
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_MOCK_MODE=false
```

### Step 4: Test SMS Delivery
```bash
# Login as admin@test.com
# Click "SMS" option
# Check backend logs for: "[Twilio] SMS sent to +40..."
# You should receive SMS with 6-digit OTP code
```

---

## How to Set Up Real Email Delivery (SendGrid)

### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com) and sign up (free tier available)
2. Verify your email address
3. Complete account setup

### Step 2: Get Credentials
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it `Smart Building Configurator Dev`
4. Copy the generated key (format: `SG.xxx.yyy`)

### Step 3: Verify Sender Email
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Use: `noreply@yourdomain.com` (or personal email for testing)
4. Verify the email address

### Step 4: Update `.env.development`
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_MOCK_MODE=false
```

### Step 5: Test Email Delivery
```bash
# Login as admin@test.com
# Click "Email" option
# Check backend logs for: "[SendGrid] Email sent to..."
# You should receive email with 6-digit OTP code
```

---

## Development Mode (Recommended for Testing)

For development, use **mock mode** to avoid API charges:

```bash
# .env.development
SENDGRID_MOCK_MODE=true              # Email: logged to console
TWILIO_MOCK_MODE=true                # SMS: logged to console
REQUIRE_REAL_OTP_DELIVERY=false       # Accept mocked delivery
NOTIFICATION_LOG_OTP=true              # Log OTP codes to console
```

**Console Output Example:**
```
[OTP][email] mocked sent to admin@test.com: 123456
[OTP][sms] mocked sent to +40746133833: 123456
```

---

## Troubleshooting

### SMS Not Sending

**Error:** "SMS delivery is temporarily unavailable..."

**Causes & Solutions:**
1. **Invalid phone number format**
   - ❌ Wrong: `+40 746 133 833` (has spaces)
   - ✅ Correct: `+40746133833` (E.164 format)
   - **Fix:** Update `TWILIO_PHONE_NUMBER` in `.env.development`

2. **Invalid Twilio credentials**
   - **Check:** Does Account SID start with `AC`?
   - **Check:** Is Auth Token a valid long string?
   - **Fix:** Update credentials in `.env.development`

3. **Twilio account issue**
   - **Check:** Is account verified?
   - **Check:** Do you have available balance/credit?
   - **Check:** Is SMS enabled for your account?
   - **Fix:** Log in to Twilio dashboard and verify account status

4. **User phone number issue**
   - **Check:** Did user enter phone in correct format?
   - **Check:** Is country code correct (e.g., +40 for Romania)?
   - **Fix:** Ask user to update phone number during login

### Email Not Sending

**Error:** "Email delivery is temporarily unavailable..."

**Causes & Solutions:**
1. **Invalid SendGrid API key**
   - **Check:** Does key start with `SG.`?
   - **Check:** Is it a valid live key (not expired)?
   - **Fix:** Generate new API key in SendGrid dashboard

2. **Sender email not verified**
   - **Check:** Have you verified the sender in SendGrid?
   - **Fix:** Go to SendGrid → Settings → Sender Authentication → Verify

3. **Invalid sender email format**
   - ❌ Wrong: `noreply` (no domain)
   - ✅ Correct: `noreply@yourdomain.com`
   - **Fix:** Update `SENDGRID_FROM_EMAIL`

4. **SendGrid quota exceeded**
   - **Check:** Have you exceeded free tier limits?
   - **Fix:** Upgrade SendGrid plan or wait for monthly reset

### Both SMS and Email Failing

**Symptom:** User sees both Email and SMS options, but both fail

**Solutions:**
1. **Check `.env.development` exists**
   ```bash
   # Run this in backend directory
   cat .env.development
   ```

2. **Restart backend server**
   ```bash
   npm run dev
   ```

3. **Check if in mock mode**
   - If `SENDGRID_MOCK_MODE=true` and `TWILIO_MOCK_MODE=true`
   - OTP codes appear in console, not delivered
   - This is OK for development!

4. **Check backend logs for errors**
   ```
   [SendGrid] Email delivery failed: ...
   [Twilio] SMS delivery failed: ...
   ```

---

## Email vs SMS - Decision Matrix

| Scenario | Recommended | Why |
|----------|-------------|-----|
| **Development** | SMS (Twilio) with real credentials | Faster, cheaper, works reliably |
| **Testing** | Email (SendGrid) for user acceptance | More familiar to users |
| **Production** | Both available | User choice improves UX |
| **Budget constrained** | SMS (Twilio) | Free tier covers moderate volume |

---

## Configuration Checklist

- [ ] `TWILIO_ACCOUNT_SID` is valid (starts with `AC`)
- [ ] `TWILIO_AUTH_TOKEN` is a real token
- [ ] `TWILIO_PHONE_NUMBER` is in E.164 format (e.g., `+40746133833`, no spaces)
- [ ] `TWILIO_MOCK_MODE=false` (for real delivery)
- [ ] `SENDGRID_API_KEY` is valid (starts with `SG.`)
- [ ] `SENDGRID_FROM_EMAIL` is verified in SendGrid
- [ ] `SENDGRID_MOCK_MODE=false` (for real delivery)
- [ ] Backend server restarted after `.env.development` changes
- [ ] Tested login → SMS → Check console for OTP
- [ ] Tested login → Email → Check inbox for OTP

---

## Testing Scenarios

### ✅ Happy Path: Both Channels Work
```
1. Login → admin@test.com + password
2. Choose SMS → OTP arrives via SMS
3. Enter 6-digit code → Login succeeds
```

### ✅ Fallback: Primary Channel Fails
```
1. Login → email delivery fails (but SMS works)
2. User sees both SMS and Email options
3. Select SMS → OTP sent via SMS
4. Login succeeds with fallback channel
```

### ✅ Alternative: User Prefers Different Channel
```
1. Login → SMS is preferred
2. But user wants Email instead
3. Select Email option → OTP sent via Email
4. Login succeeds with chosen channel
```

---

## Production Deployment

For production (`.env.production`):

```bash
# Must use REAL credentials, never mock mode
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=verified-sender@yourdomain.com
SENDGRID_MOCK_MODE=false

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
TWILIO_MOCK_MODE=false

REQUIRE_REAL_OTP_DELIVERY=true
NOTIFICATION_LOG_OTP=false
```

**Validation:**
- Backend startup will fail if credentials are invalid
- All real delivery errors will be caught and logged
- User sees helpful error messages

---

## Support

If SMS/Email delivery still doesn't work:

1. **Check backend logs** for error messages
2. **Verify credentials** against provider dashboard
3. **Test providers independently** (e.g., Twilio CLI)
4. **Check firewall/network** if self-hosted
5. **Review provider documentation** for rate limits

---

## Cost Estimates (as of 2026)

| Provider | Free Tier | Cost |
|----------|-----------|------|
| **Twilio SMS** | $15 credit | $0.0075-0.02 per SMS |
| **SendGrid Email** | 100/day | $0.10-0.20 per 1000 emails |
| **Both combined** | Good for testing | ~$0.25-0.40 per user signup |

---

## Summary of Recent Fix

### What Was Wrong
- Twilio phone number had spaces: `+40 746 133 833`
- Frontend showed generic errors instead of channel-specific ones
- User saw email error when trying SMS

### What Was Fixed
1. ✅ Phone number format corrected to `+40746133833`
2. ✅ Frontend now clears old errors when selecting new channel
3. ✅ Error messages now prefixed with channel name (SMS: ..., Email: ...)
4. ✅ Only new errors from current attempt are shown

### Next Steps
1. Test SMS delivery with the corrected phone number
2. If SMS fails, check Twilio account status and credits
3. For Email, verify SendGrid sender email
4. Check backend logs for detailed error messages

---

**Last Updated:** April 20, 2026  
**Status:** Configuration documented and errors fixed

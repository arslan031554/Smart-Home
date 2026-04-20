# OTP Verification - Quick Testing Guide

## 🎯 What Changed
**Every login and signup (admin + user) now REQUIRES OTP verification**

Previously, dev admin (`admin@test.com`) could bypass OTP. This has been removed.

---

## 🧪 How to Test

### Test Case 1: Admin Login with OTP
```
Step 1: Navigate to /auth/login
Step 2: Enter email: admin@test.com
Step 3: Enter password: (admin password)
Step 4: Click "Login"

Expected Result:
  ✅ Should see "Two-factor verification required" message
  ✅ Should redirect to /auth/choose-verification
  ✅ Should see "Email" and "SMS" options (if phone is set)
  ✅ Select Email → See verification code in console or email
  ✅ Redirect to /auth/verify-otp
  ✅ Enter 6-digit code
  ✅ Should log in to dashboard (/)
```

### Test Case 2: Customer Login with OTP
```
Step 1: Create a test customer account first (or use existing)
Step 2: Navigate to /auth/login
Step 3: Enter customer email + password
Step 4: Click "Login"

Expected Result:
  ✅ Should see "Two-factor verification required" message
  ✅ Should redirect to /auth/choose-verification
  ✅ Select SMS or Email channel
  ✅ Receive OTP code
  ✅ Redirect to /auth/verify-otp
  ✅ Enter 6-digit code
  ✅ Should log in to dashboard
```

### Test Case 3: New User Signup with OTP
```
Step 1: Navigate to /auth/register
Step 2: Fill signup form (name, email, password, phone, accept terms)
Step 3: Select verification method (Email or SMS)
Step 4: Click "Create Account"

Expected Result:
  ✅ Should see "Registration successful. Verification required."
  ✅ Should redirect to /auth/verify-otp (or choose-verification if not pre-selected)
  ✅ Receive OTP code
  ✅ Enter 6-digit code
  ✅ Should log in and redirect to dashboard
```

### Test Case 4: OTP Channel Switching
```
Step 1: Start login process and get OTP sent to email
Step 2: On /auth/choose-verification page, select different channel (SMS)
Step 3: Click "Send via SMS"

Expected Result:
  ✅ Should resend OTP to SMS
  ✅ Should show new delivery information
  ✅ Previous email OTP should be invalidated
  ✅ Only SMS OTP should work for verification
```

### Test Case 5: OTP Expiry
```
Step 1: Start login and receive OTP code
Step 2: Wait 10+ minutes
Step 3: Try entering the old OTP code

Expected Result:
  ✅ Should show "OTP expired" error
  ✅ Should allow "Resend OTP" button
  ✅ New OTP can be requested and used
```

---

## 📋 Environment Setup

### For Development Testing (with Mock OTP)
```bash
# In .env.development:
SENDGRID_MOCK_MODE=true
TWILIO_MOCK_MODE=true
REQUIRE_REAL_OTP_DELIVERY=false
OTP_EXPIRY_MINUTES=10
OTP_LENGTH=6
```

With mock mode, OTP codes will be logged to console:
```
[OTP Delivery] Mocked email to: user@example.com, code: 123456
[OTP Delivery] Mocked SMS to: +40712345678, code: 123456
```

### For Production Testing (with Real OTP)
```bash
# In .env.production:
SENDGRID_MOCK_MODE=false
TWILIO_MOCK_MODE=false
REQUIRE_REAL_OTP_DELIVERY=true
SENDGRID_API_KEY=your_real_key
TWILIO_ACCOUNT_SID=your_real_sid
TWILIO_AUTH_TOKEN=your_real_token
```

---

## 🔄 Complete Flow Diagram

```
LOGIN/SIGNUP FLOW (ALL USERS)
│
├─ Enter Credentials
│  ├─ signup: email, password, name, phone, etc.
│  └─ login: email, password
│
├─ Backend Validates
│  ├─ For signup: Create user account (not verified yet)
│  └─ For login: Check email/password match
│
├─ Generate & Send OTP
│  ├─ Create 6-digit random code
│  ├─ Save to user.otpCode (expires in 10 mins)
│  └─ Send via Email or SMS
│
├─ Return 403 (For Login) / 201 (For Signup)
│  └─ { requiresVerification: true, availableChannels: [...] }
│
├─ Frontend Routes to Verification
│  ├─ /auth/choose-verification (select email or SMS)
│  └─ /auth/verify-otp (enter 6-digit code)
│
├─ User Enters OTP Code
│  └─ Frontend sends to /api/auth/verify-otp
│
├─ Backend Verifies OTP
│  ├─ Code matches? ✓
│  ├─ Not expired? ✓
│  ├─ Channel matches? ✓
│  └─ All checks pass → Generate JWT token
│
└─ Login Complete
   ├─ Token stored in localStorage
   ├─ Frontend redirects to dashboard
   └─ User fully authenticated
```

---

## 📊 Expected HTTP Responses

### Login Request (with credentials)
**Request:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (OTP Required):**
```json
Status: 403 Forbidden
{
  "success": false,
  "message": "Two-factor verification required",
  "data": {
    "requiresVerification": true,
    "verificationReason": "login_2fa",
    "availableChannels": ["email", "sms"],
    "preferredVerificationChannel": "email",
    "delivery": {
      "provider": "sendgrid",
      "mocked": false,
      "delivered": true
    },
    "user": {
      "id": 123,
      "email": "user@example.com",
      "phone": "+40712345678"
    }
  }
}
```

### OTP Verification Request
**Request:**
```json
POST /api/auth/verify-otp
{
  "email": "user@example.com",
  "otpCode": "123456",
  "channel": "email"
}
```

**Response (Success):**
```json
Status: 200 OK
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "admin",
      "isVerified": true,
      ...
    }
  }
}
```

---

## ✅ Verification Checklist

After making the changes, verify:

- [x] Backend code compiles without errors
- [ ] Admin can login with OTP verification (not bypassed)
- [ ] Customer can login with OTP verification
- [ ] New signups require OTP verification
- [ ] OTP codes expire after 10 minutes
- [ ] Can resend OTP to different channel
- [ ] Invalid OTP shows error message
- [ ] Valid OTP logs user in completely
- [ ] Guest draft attaches after OTP verification
- [ ] Admin routes to correct dashboard (/)
- [ ] Customer routes to correct dashboard
- [ ] Works with mock mode (dev)
- [ ] Works with real SendGrid/Twilio (prod)

---

## 🐛 Troubleshooting

### Issue: "OTP always returns 403, won't verify"
**Solution:**
- Check OTP code matches exactly (case-sensitive for mocked mode)
- Check OTP hasn't expired (10 minute window)
- Check channel matches (email vs SMS)
- Check email spelling is correct

### Issue: "OTP not received (mock mode)"
**Solution:**
- Check console logs for OTP message
- Ensure mock mode is enabled: `SENDGRID_MOCK_MODE=true`
- Check browser console for any errors

### Issue: "Redirects to login instead of showing OTP page"
**Solution:**
- Backend must return 403 status with requiresVerification flag
- Check network response in browser DevTools
- Verify authService.login is throwing the error with 403 status

### Issue: "Still getting token without OTP"
**Solution:**
- This was the old dev admin bypass - make sure it's removed
- Restart backend server
- Check file: `backend/src/services/authservice.js`
- Verify the bypass code is deleted (lines ~260-268 should not exist)

---

## 📞 Support

For questions or issues:
1. Check the OTP_ENFORCEMENT_IMPLEMENTATION.md document
2. Review the HTTP responses above
3. Check browser DevTools Network tab for API responses
4. Review server logs for error messages

---

**Last Updated:** April 20, 2026  
**OTP Enforcement Status:** ✅ ACTIVE

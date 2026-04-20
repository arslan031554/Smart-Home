# Smart Home Configurator - Implementation & Launch Checklist

**Last Updated:** April 20, 2026  
**Status:** Development → Staging → Production

---

## PHASE 1: QUALITY ASSURANCE & TESTING (2-3 weeks)

### Unit Tests (High Priority)
```
Task: Create comprehensive test suite for calculation engine
Files to test:
  - backend/src/services/CalculationService.js
  - backend/src/services/ProductAllocationService.js
  - backend/src/services/DiscountService.js
Acceptance Criteria:
  - [ ] 80%+ code coverage on calculation logic
  - [ ] All calculation edge cases covered
  - [ ] Product allocation algorithm verified
  - [ ] Discount rules evaluation tested
Timeline: 3-5 days
Responsible: Backend Developer
```

### Integration Testing
```
Task: Test external provider integrations
Tests required:
  - [ ] SendGrid email delivery (real account)
  - [ ] Twilio SMS delivery (real account)
  - [ ] reCAPTCHA validation (live mode)
  - [ ] Follow-up automation (end-to-end)
  - [ ] PDF generation with images
  - [ ] Excel export calculations
  - [ ] OTP flow (email + SMS)
Timeline: 2-3 days
Responsible: QA Engineer + Backend Developer
```

### User Acceptance Testing
```
Task: Validate business logic with stakeholders
Test scenarios:
  - [ ] Customer account creation flow
  - [ ] Project definition with all building types
  - [ ] Smart function configuration (all types)
  - [ ] Offer calculation with various multipliers
  - [ ] Offer generation (PDF + Excel)
  - [ ] Admin master data management
  - [ ] Follow-up email sending
  - [ ] Permission enforcement
Timeline: 3-5 days
Responsible: Product Manager + Client Representative
```

### Performance Testing
```
Task: Validate system performance under load
Tests:
  - [ ] Concurrent user registration
  - [ ] Offer calculation with 100+ functions
  - [ ] Large file export (100+ products)
  - [ ] Follow-up processing (1000+ offers)
  - [ ] API response times (target: <500ms)
Tools: Apache JMeter or similar
Timeline: 2-3 days
Responsible: DevOps + Backend Developer
```

### Security Testing
```
Task: Validate security implementation
Checks:
  - [ ] CORS configuration properly enforced
  - [ ] JWT token validation on all endpoints
  - [ ] Permission checks on admin endpoints
  - [ ] SQL injection prevention (Sequelize parameterized)
  - [ ] XSS protection in PDF/Excel generation
  - [ ] Rate limiting enforcement
  - [ ] Password hashing verification
  - [ ] OTP secret management
Timeline: 2 days
Responsible: Security Specialist
```

### Cross-browser & Mobile Testing
```
Task: Validate UI across browsers and devices
Browsers:
  - [ ] Chrome (desktop)
  - [ ] Firefox (desktop)
  - [ ] Safari (desktop & iOS)
  - [ ] Edge (desktop)
  - [ ] Chrome Mobile (Android)
  - [ ] Safari Mobile (iOS)
Pages to test:
  - [ ] Customer configurator pages
  - [ ] Admin dashboard
  - [ ] Master data management pages
Timeline: 2-3 days
Responsible: QA Engineer
```

---

## PHASE 2: DOCUMENTATION & API SPEC (1 week)

### API Documentation (Swagger/OpenAPI)
```
Task: Generate comprehensive API specification
Deliverables:
  - [ ] Swagger 3.0 spec file
  - [ ] All endpoints documented with:
    - Method, path, description
    - Request/response schemas
    - Error codes and messages
    - Authentication requirements
    - Permission requirements
  - [ ] Hosted Swagger UI at /api-docs
Tools: swagger-jsdoc or similar
Timeline: 2-3 days
Responsible: Backend Developer
```

### Deployment Runbook
```
Task: Create step-by-step deployment procedure
Contents:
  - [ ] Prerequisites (hardware, software, services)
  - [ ] Environment setup (all variables explained)
  - [ ] Database initialization
  - [ ] Service startup procedures
  - [ ] Health checks
  - [ ] Rollback procedures
  - [ ] Monitoring setup
Timeline: 1-2 days
Responsible: DevOps Engineer
```

### Admin User Manual
```
Task: Create comprehensive admin guide
Sections:
  - [ ] Dashboard overview
  - [ ] Master data management (11 entity types)
  - [ ] Employee management
  - [ ] Permission system
  - [ ] Offer management & filtering
  - [ ] Report generation
  - [ ] Troubleshooting
Timeline: 2-3 days
Responsible: Technical Writer + Product Manager
```

### Calculation Logic Documentation
```
Task: Document the sophisticated calculation algorithm
Contents:
  - [ ] Channel aggregation rules (IN/OUT/GENERAL)
  - [ ] Product allocation algorithm flowchart
  - [ ] Service pricing modes explanation
  - [ ] Discount calculation logic
  - [ ] Multiplication index application
  - [ ] Example calculations (step-by-step)
Timeline: 1-2 days
Responsible: Backend Developer
```

### Client Training Materials
```
Task: Create materials for customer success
Deliverables:
  - [ ] Quick start guide (account creation → offer)
  - [ ] Video tutorials (5-10 minutes each)
  - [ ] FAQ document
  - [ ] Troubleshooting guide
  - [ ] Support contact information
Timeline: 2-3 days
Responsible: Customer Success Team
```

---

## PHASE 3: ENVIRONMENT & DEPLOYMENT (1 week)

### Staging Environment Setup
```
Task: Prepare staging environment (production-like)
Actions:
  - [ ] Provision staging server (hardware spec matching production)
  - [ ] Configure PostgreSQL (separate staging database)
  - [ ] Set up environment variables (separate .env.staging)
  - [ ] Install SSL certificates (staging domain)
  - [ ] Configure reverse proxy (nginx)
  - [ ] Set up backups/restore procedures
  - [ ] Create monitoring/alerting dashboards
  - [ ] Test disaster recovery procedures
Timeline: 2-3 days
Responsible: DevOps Engineer
```

### Environment Variables Configuration

#### Development (.env.development - Already set)
```
✓ LOCAL: PostgreSQL @ localhost
✓ LOCAL: JWT secret (placeholder OK)
✓ LIVE: SendGrid API key
✓ LIVE: Twilio credentials
✓ LIVE: reCAPTCHA keys
✓ CORS: localhost:5173-5175
✓ Note: See REAL_OTP_SETUP.md for details
```

#### Staging (.env.staging - To create)
```
Tasks:
  - [ ] Create .env.staging file
  - [ ] DB_HOST: staging-db.example.com
  - [ ] DB_NAME: smart_home_configurator_staging
  - [ ] DB_USER: (secure credential)
  - [ ] DB_PASSWORD: (secure credential, use secrets manager)
  - [ ] JWT_SECRET: (generate 32+ char random string)
  - [ ] FRONTEND_URL: https://staging.example.com
  - [ ] CORS_ORIGIN: https://staging.example.com
  - [ ] RECAPTCHA_MODE: test (or live staging keys)
  - [ ] TWILIO_MOCK_MODE: false (use real staging account)
  - [ ] SENDGRID_MOCK_MODE: false (use real staging account)
  - [ ] FOLLOWUP_CRON_ENABLED: true (but only on one instance)
  - [ ] All other: same as development
```

#### Production (.env.production - To create)
```
Tasks:
  - [ ] Create .env.production file
  - [ ] DB_HOST: production-db.example.com
  - [ ] DB_NAME: smart_home_configurator
  - [ ] DB_USER: (secure credential)
  - [ ] DB_PASSWORD: (secure credential, use secrets manager)
  - [ ] JWT_SECRET: (generate 32+ char random string, VERY SECURE)
  - [ ] JWT_EXPIRES_IN: 7d (or your preference)
  - [ ] FRONTEND_URL: https://configurator.example.com
  - [ ] CORS_ORIGIN: https://configurator.example.com
  - [ ] APP_URL: https://api.configurator.example.com
  - [ ] RECAPTCHA_MODE: live (with production keys from Google)
  - [ ] RECAPTCHA_SECRET_KEY: (production key from Google)
  - [ ] TWILIO_ACCOUNT_SID: (production account)
  - [ ] TWILIO_AUTH_TOKEN: (production token)
  - [ ] TWILIO_PHONE_NUMBER: (production verified number)
  - [ ] TWILIO_MOCK_MODE: false
  - [ ] SENDGRID_API_KEY: (production key)
  - [ ] SENDGRID_FROM_EMAIL: (production verified email)
  - [ ] SENDGRID_MOCK_MODE: false
  - [ ] FOLLOWUP_CRON_ENABLED: true (on single instance)
  - [ ] FOLLOWUP_CRON_SCHEDULE: 0 9 * * * (9 AM UTC, or adjust)
  - [ ] NODE_ENV: production
  
CRITICAL: Use environment variables/secrets manager, NOT .env file in production!
```

### Database Preparation
```
Task: Prepare and test database for production
Actions:
  - [ ] Create production PostgreSQL instance
  - [ ] Test connection from app server
  - [ ] Run migrations: npm run db:migrate
  - [ ] Seed master data (building types, functions, etc.)
  - [ ] Configure automated backups
  - [ ] Test backup/restore procedure
  - [ ] Set up connection pooling
  - [ ] Configure query logging (for performance)
  - [ ] Test high-availability setup (if required)
Timeline: 2-3 days
Responsible: Database Administrator + DevOps
```

### SSL & HTTPS
```
Task: Configure SSL/TLS certificates
Actions:
  - [ ] Obtain SSL certificate (Let's Encrypt or commercial)
  - [ ] Configure certificate in reverse proxy (nginx)
  - [ ] Set up certificate auto-renewal
  - [ ] Test HTTPS with A+ rating on SSL Labs
  - [ ] Configure HSTS headers
  - [ ] Test redirect from HTTP → HTTPS
Timeline: 1 day
Responsible: DevOps Engineer
```

### Reverse Proxy & File Serving
```
Task: Configure nginx for production traffic
Requirements:
  - [ ] Proxy API requests to backend (Node.js)
  - [ ] Serve static frontend files (/public, /assets)
  - [ ] Serve uploads directory (/uploads)
  - [ ] Configure caching headers (static files: 1 year, index: no-cache)
  - [ ] Rate limiting (protect against abuse)
  - [ ] Request logging for audit trail
  - [ ] Gzip compression enabled
  - [ ] Security headers (Content-Security-Policy, X-Frame-Options, etc.)
Timeline: 1 day
Responsible: DevOps Engineer
```

### Backup & Disaster Recovery
```
Task: Set up backup strategy
Actions:
  - [ ] Daily full database backups
  - [ ] Hourly incremental backups (optional)
  - [ ] Off-site backup storage (separate location)
  - [ ] Test restore procedure (monthly)
  - [ ] Document RTO/RPO (recovery time/point objectives)
  - [ ] Create runbook for data restoration
  - [ ] Configure backup alerts
Timeline: 1-2 days
Responsible: Database Administrator
```

---

## PHASE 4: PRE-LAUNCH VALIDATION (3-5 days)

### Health Checks (Run before go-live)
```bash
# 1. Database connectivity
npm run db:check

# 2. Integration health
npm run integrations:check

# 3. Calculation validation
npm run calculations:validate

# 4. API health endpoint
curl https://api.example.com/api/health

# 5. Frontend build verification
npm run build (in frontend/)

# 6. SSL/HTTPS verification
openssl s_client -connect api.example.com:443

# 7. CORS validation
curl -H "Origin: https://configurator.example.com" \
     -H "Access-Control-Request-Method: GET" \
     https://api.example.com/api/test

# 8. Rate limiting test
# Send 150 requests from same IP in 15 mins, verify 100+ are blocked

# 9. Permission enforcement test
# Test unauthorized endpoints without JWT token

# 10. Follow-up cron trigger
npm run followups:run-once
```

### Smoke Test Scenarios
```
Critical paths to verify on production:
  - [ ] Customer registration → login → OTP
  - [ ] Project creation → function selection
  - [ ] Offer generation → PDF download → email sent
  - [ ] Admin login → create employee → assign permissions
  - [ ] Master data CRUD (one example from each entity type)
  - [ ] Follow-up automation (manually trigger, verify logs)
  - [ ] Export to Excel → verify calculations
  - [ ] Multilingual content (EN & RO) → verify translations
```

### Production Validation Checklist
```
Before opening to public:
  - [ ] All environment variables configured correctly
  - [ ] Database migrations completed successfully
  - [ ] SSL/HTTPS working on all endpoints
  - [ ] CORS properly restricted to production domain
  - [ ] API rate limiting active
  - [ ] Monitoring/alerting configured and tested
  - [ ] Log aggregation collecting logs
  - [ ] Backup procedures verified
  - [ ] SendGrid confirmed as sender (not in spam)
  - [ ] Twilio number verified and tested
  - [ ] reCAPTCHA live mode activated
  - [ ] Admin dashboard accessible to staff
  - [ ] Follow-up cron running on designated instance
  - [ ] Performance metrics acceptable (response time, throughput)
  - [ ] Security scan completed (OWASP Top 10 check)
```

---

## PHASE 5: LAUNCH EXECUTION (1 day)

### Launch Timeline
```
T-24 hours:
  - [ ] Final health checks on staging
  - [ ] Team briefing on rollback procedures
  - [ ] Production environment ready, tested, monitored
  - [ ] Support team trained and on standby

T-0 (Launch):
  - [ ] Database backup taken
  - [ ] Monitoring dashboards displayed on screen
  - [ ] Support team in chat channel
  - [ ] Frontend DNS points to production
  - [ ] Backend API operational
  - [ ] Test first customer registration
  - [ ] Test first offer generation

T+1 hour:
  - [ ] Announce to early users / pilot group
  - [ ] Monitor error logs closely
  - [ ] Verify follow-up system working
  - [ ] Check database performance

T+4 hours:
  - [ ] Public launch announcement (if successful)
  - [ ] Monitor for any issues

T+24 hours:
  - [ ] Retrospective meeting
  - [ ] Document any issues encountered
  - [ ] Plan post-launch improvements
```

---

## PHASE 6: POST-LAUNCH (Week 1-2)

### Monitoring & Alerts
```
Set up alerts for:
  - [ ] API response time > 1000ms
  - [ ] Error rate > 1%
  - [ ] Database connection pool exhaustion
  - [ ] Disk space < 10%
  - [ ] Follow-up job failures
  - [ ] SendGrid delivery failures
  - [ ] Twilio delivery failures
  - [ ] SSL certificate expiry (30 days before)
```

### Performance Optimization
```
Tasks (if needed):
  - [ ] Profile slow endpoints
  - [ ] Add database indexes for common queries
  - [ ] Implement caching for master data
  - [ ] Optimize PDF generation performance
  - [ ] Review and optimize N+1 queries
```

### Bug Fixes & Enhancements
```
Priority queue:
  - [ ] Critical bugs (security, data loss)
  - [ ] High priority bugs (broken features)
  - [ ] Medium priority (UX issues, performance)
  - [ ] Low priority (nice-to-haves, Polish)
```

---

## SECURITY CHECKLIST (Critical)

### Before Production
- [ ] All hardcoded secrets removed from code repository
- [ ] Environment variables used for all sensitive data
- [ ] Database credentials stored securely (never in .env files)
- [ ] API keys rotated and stored in secrets manager
- [ ] CORS origins restricted to production domain only
- [ ] CSRF protection enabled (if applicable)
- [ ] SQL injection prevention verified (Sequelize parameterized queries)
- [ ] XSS protection in all user input fields
- [ ] Rate limiting configured (prevent brute force attacks)
- [ ] JWT secret is cryptographically secure (32+ characters)
- [ ] OTP timeout is reasonable (10 minutes default)
- [ ] Password requirements enforced (minimum strength)
- [ ] HTTPS enforced on all endpoints (redirect HTTP → HTTPS)
- [ ] Security headers configured (Content-Security-Policy, etc.)
- [ ] API authentication on all endpoints (except public pages)
- [ ] Permission enforcement on all sensitive endpoints
- [ ] Audit logging enabled for sensitive operations
- [ ] Server firewall configured (whitelist necessary ports)
- [ ] DDoS protection configured (if applicable)
- [ ] Regular security updates scheduled (OS, dependencies)

---

## DEPENDENCIES CHECK

### Critical Dependencies to Verify
```
Backend:
  - express@5.2.1 (web framework)
  - sequelize@6.37.8 (ORM)
  - pg@8.20.0 (PostgreSQL driver)
  - bcryptjs@3.0.3 (password hashing)
  - jsonwebtoken@9.0.3 (JWT)
  - pdf-lib@1.17.1 (PDF generation)
  - exceljs@4.4.0 (Excel export)
  - @sendgrid/mail@8.1.6 (Email)
  - twilio@5.13.0 (SMS)
  - node-cron@4.2.1 (Scheduling)
  - helmet@8.1.0 (Security headers)
  - cors@2.8.6 (CORS)

Frontend:
  - react@19.2.0 (UI framework)
  - react-router-dom@7.13.1 (Routing)
  - @reduxjs/toolkit@2.11.2 (State management)
  - axios@1.13.6 (HTTP client)
  - i18next@25.8.18 (Localization)
  - tailwindcss@4.2.1 (CSS framework)
  - react-google-recaptcha@3.1.0 (reCAPTCHA)

All versions: [ ] Audit for vulnerabilities (npm audit)
All licenses: [ ] Verify compatibility (no GPL for commercial use)
```

---

## SIGN-OFF

### Development Team Sign-off
- [ ] Code review completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] No known critical bugs

### QA Team Sign-off
- [ ] All test scenarios passing
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Cross-browser compatibility verified

### Product Manager Sign-off
- [ ] All requirements met
- [ ] UX/UI acceptable
- [ ] Business logic correct
- [ ] Ready for customer use

### Client/Stakeholder Sign-off
- [ ] Platform review completed
- [ ] Requirements satisfaction confirmed
- [ ] Ready for launch
- [ ] Sign-off date: ___________

---

## POST-LAUNCH ROADMAP

### Week 1-2 (Stabilization)
- [ ] Monitor production metrics closely
- [ ] Fix any critical production bugs
- [ ] Customer support on standby
- [ ] Daily team standups

### Week 3-4 (Optimization)
- [ ] Performance optimization if needed
- [ ] Advanced analytics implementation
- [ ] Enhanced filtering on offers
- [ ] Mobile admin UI optimization
- [ ] Comprehensive audit logging

### Month 2 (Enhancements)
- [ ] Unit test coverage expansion
- [ ] API documentation completion
- [ ] Offer versioning implementation
- [ ] Advanced reporting features
- [ ] CRM integration hooks

### Month 3+ (Future Features)
- [ ] Webhook system
- [ ] Invoice generation
- [ ] Bulk operations
- [ ] Advanced search
- [ ] Native mobile apps

---

## CONTACT & ESCALATION

```
Production Issues:
  - Primary:    [Lead Developer]
  - Secondary:  [DevOps Engineer]
  - Escalation: [Technical Lead]
  - Manager:    [Project Manager]

Business Issues:
  - Primary:    [Account Manager]
  - Escalation: [Sales Manager]
  - Client:     [Client Contact]
```

---

**Document Version:** 1.0  
**Last Updated:** April 20, 2026  
**Next Review:** After Phase 1 completion

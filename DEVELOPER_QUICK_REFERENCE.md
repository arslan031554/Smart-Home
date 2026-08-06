# Smart Building Configurator - Developer Quick Reference Guide

**For:** Development Team  
**Updated:** April 20, 2026  
**Purpose:** Quick reference for remaining work & how to implement it

---

## 🚀 QUICK STATUS

- ✅ **Core Platform:** 100% Complete
- ⚠️ **Testing:** Not Started
- ⚠️ **Documentation:** Partial (API docs missing)
- ⚠️ **Deployment:** Configuration templates provided

**Estimated Time to Launch:** 8-12 days (with full testing)

---

## 🎯 TOP 5 PRIORITIES (This Week)

### Priority 1: Complete Testing (2-3 days) ⏰ CRITICAL
```
What: Full end-to-end testing with real providers
Where: Test scripts in /backend/tests/ or new /tests/ folder
Why: Verify calculations, email delivery, SMS delivery
Actions:
  1. Test customer registration + OTP (email + SMS)
  2. Test project creation → offer generation
  3. Test PDF export (verify images embedded)
  4. Test Excel export (verify calculations)
  5. Test follow-up automation (SendGrid + Twilio)
  6. Test all admin features
  7. Test mobile browser compatibility
Timeline: 2-3 days
```

### Priority 2: API Documentation (2-3 days) 🔧 HIGH
```
What: Generate Swagger/OpenAPI specification
Where: Create /backend/swagger.js or /backend/docs/
How:
  npm install swagger-jsdoc swagger-ui-express --save
  
Steps:
  1. Install dependencies ✓
  2. Create swagger.config.js
  3. Add JSDoc comments to all route handlers
  4. Mount Swagger UI at /api-docs
  5. Generate spec file for CI/CD
  
Example JSDoc format:
  /**
   * @swagger
   * /api/projects:
   *   get:
   *     summary: Get all projects
   *     tags: [Projects]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Project list
   */

Timeline: 2-3 days
Tools: swagger-jsdoc, swagger-ui-express
```

### Priority 3: Unit Tests (3-5 days) ✅ HIGH
```
What: Test suite for calculation engine (most critical)
Where: /backend/tests/calculation.test.js
Why: Catch bugs in offer calculations
Scope:
  1. Product allocation algorithm
  2. Channel aggregation (IN/OUT/GENERAL)
  3. Service pricing modes (5 types)
  4. Discount calculation
  5. Multiplication index application
  
Framework: Jest or Mocha + Chai
Setup:
  npm install --save-dev jest

Test cases needed:
  ✓ Simple project (1 level, 1 room, 1 function)
  ✓ Complex project (3 levels, 10 rooms, 8 functions)
  ✓ High multiplier (index=15, verify discount=5%)
  ✓ Multiple services (verify all pricing modes)
  ✓ Edge case: No matching products (verify unmet requirements)
  ✓ Edge case: Very large quantities
  ✓ Currency precision (no floating-point errors)

Timeline: 3-5 days
Coverage target: 80%+
```

### Priority 4: Staging Deployment (1-2 days) 🚀 HIGH
```
What: Deploy to staging environment for full validation
Actions:
  1. Create staging PostgreSQL database
  2. Create .env.staging (see template below)
  3. Install dependencies: npm install
  4. Run migrations: npm run db:migrate
  5. Seed test data
  6. Deploy frontend + backend
  7. Verify all endpoints accessible
  8. Test with real SendGrid/Twilio accounts
  
Template .env.staging:
  PORT=5000
  NODE_ENV=staging
  DB_HOST=staging-db.example.com
  DB_PORT=5432
  DB_NAME=smart_home_staging
  DB_USER=postgres_staging
  DB_PASSWORD=<secure-password>
  JWT_SECRET=<32-char-random-string>
  JWT_EXPIRES_IN=7d
  FRONTEND_URL=https://staging.configurator.example.com
  CORS_ORIGIN=https://staging.configurator.example.com
  APP_URL=https://api-staging.configurator.example.com
  RECAPTCHA_MODE=test
  RECAPTCHA_SECRET_KEY=<staging-key>
  TWILIO_ACCOUNT_SID=<staging-sid>
  TWILIO_AUTH_TOKEN=<staging-token>
  TWILIO_PHONE_NUMBER=+40XXXXXXXXX
  TWILIO_MOCK_MODE=false
  SENDGRID_API_KEY=<staging-key>
  SENDGRID_FROM_EMAIL=staging@example.com
  SENDGRID_MOCK_MODE=false
  FOLLOWUP_CRON_ENABLED=true
  FOLLOWUP_CRON_SCHEDULE=0 10 * * *
  FOLLOWUP_CRON_TIMEZONE=Europe/Bucharest

Timeline: 1-2 days
```

### Priority 5: Deployment Documentation (1-2 days) 📚 MEDIUM
```
What: Step-by-step runbook for going live
File: /docs/DEPLOYMENT_GUIDE.md
Sections:
  1. Prerequisites (server specs, OS)
  2. Database setup (PostgreSQL installation)
  3. Application setup (Node.js, dependencies)
  4. Configuration (all .env variables with explanations)
  5. SSL/HTTPS setup
  6. Reverse proxy configuration (nginx)
  7. Service startup procedures
  8. Health checks
  9. Monitoring setup
  10. Backup procedures
  11. Rollback procedures
  
Template structure:
  # Deployment Guide
  
  ## Prerequisites
  - CentOS 7+ or Ubuntu 20.04+
  - Node.js 18+
  - PostgreSQL 12+
  - nginx
  - SSL certificate (Let's Encrypt or other)
  
  ## Step 1: Database Setup
  $ createdb smart_home_configurator
  $ psql -d smart_home_configurator < schema.sql
  $ npm run db:migrate
  
  ## Step 2: Application Setup
  $ npm install
  $ npm run build (frontend)
  
  ## Step 3: Environment Configuration
  $ cp .env.production.example .env.production
  $ # Edit .env.production with production values
  
  ## Step 4: Start Application
  $ npm start (or pm2 start app.js)
  
  ## Step 5: Verify
  $ curl https://api.example.com/api/health
  
  ... (continue with full procedures)

Timeline: 1-2 days
```

---

## 📋 REMAINING TASKS MATRIX

| Task | Priority | Effort | Status | Owner | Notes |
|------|----------|--------|--------|-------|-------|
| **Testing Suite** | 🔴 Critical | 3 days | Not Started | QA | Required before launch |
| **API Documentation** | 🟠 High | 2 days | Not Started | Dev | Swagger/OpenAPI spec |
| **Unit Tests** | 🟠 High | 4 days | Not Started | Dev | Calculation engine priority |
| **Staging Deploy** | 🟠 High | 2 days | Not Started | DevOps | Full validation |
| **Deployment Guide** | 🟠 High | 1 day | Partial | DevOps | Production runbook |
| **Admin Dashboard KPIs** | 🟡 Medium | 2 days | Post-Launch | Dev | Analytics enhancement |
| **Advanced Filtering** | 🟡 Medium | 1 day | Post-Launch | Dev | Offer list improvement |
| **Mobile UI Testing** | 🟡 Medium | 1 day | Post-Launch | QA | Admin responsiveness |
| **Audit Logging** | 🟡 Medium | 2 days | Post-Launch | Dev | Compliance tracking |

---

## 🔧 HOW TO IMPLEMENT MISSING PIECES

### Add Unit Tests (Step-by-Step)

#### Step 1: Install Jest
```bash
cd backend
npm install --save-dev jest @testing-library/node
npm init jest
# (answer prompts, or use defaults)
```

#### Step 2: Create test file
File: `backend/src/services/__tests__/CalculationService.test.js`

```javascript
const CalculationService = require('../CalculationService');

describe('CalculationService', () => {
  
  describe('calculateProductQuantities', () => {
    
    it('should calculate quantities for simple project', () => {
      const input = {
        functions: [
          { id: 1, totalRequired: 10 }
        ],
        products: [
          { id: 1, functionId: 1, outChannels: 16, inChannels: 0, generalChannels: 0, unitPrice: 100 }
        ]
      };
      
      const result = CalculationService.calculateProductQuantities(input);
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].quantity).toBe(1); // 10/16 = 0.6 -> rounds to 1
    });
    
    it('should apply discount for high multiplier', () => {
      const input = {
        projectMultiplier: 15,
        subtotal: 1000
      };
      
      const discount = CalculationService.applyDiscount(input);
      
      expect(discount.discountPercent).toBe(0.05); // 5% for multiplier >= 15
      expect(discount.discountAmount).toBe(50);
      expect(discount.grandTotal).toBe(950);
    });
    
    // Add more test cases...
  });
});
```

#### Step 3: Run tests
```bash
npm test
# Watch mode: npm test -- --watch
```

#### Step 4: Add to package.json scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### Generate API Documentation (Step-by-Step)

#### Step 1: Install dependencies
```bash
npm install swagger-jsdoc swagger-ui-express
```

#### Step 2: Create swagger config
File: `backend/config/swagger.js`

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Building Configurator API',
      version: '1.0.0',
      description: 'API for smart home configuration and offer generation'
    },
    servers: [
      {
        url: process.env.APP_URL || 'http://localhost:5000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js']
};

module.exports = swaggerJsdoc(options);
```

#### Step 3: Add JSDoc comments to routes
File: `backend/src/routes/projects.js`

```javascript
/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all user projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of projects to return
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProjectInput'
 *     responses:
 *       201:
 *         description: Project created
 */
router.get('/', authMiddleware, ProjectController.list);
router.post('/', authMiddleware, ProjectController.create);
```

#### Step 4: Mount Swagger UI in app.js
```javascript
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

#### Step 5: Access documentation
```
Browser: http://localhost:5000/api-docs
```

---

### Setup Staging Environment (Step-by-Step)

#### Step 1: Provision staging server
```bash
# On staging server
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm postgresql nginx

# Check versions
node --version  # Should be v18+
npm --version   # Should be v8+
psql --version  # Should be 12+
```

#### Step 2: Create database
```bash
sudo -u postgres psql
CREATE DATABASE smart_home_configurator_staging;
CREATE USER staging_user WITH PASSWORD 'secure_password_here';
ALTER ROLE staging_user SET client_encoding TO 'utf8';
ALTER ROLE staging_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE staging_user SET default_transaction_deferrable TO on;
ALTER ROLE staging_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE smart_home_configurator_staging TO staging_user;
\q
```

#### Step 3: Clone & setup application
```bash
cd /opt
git clone <repo-url> smart-home-configurator
cd smart-home-configurator/backend

# Create .env.staging
cp .env.development .env.staging
# Edit .env.staging with staging values

# Install dependencies
npm install
npm install -g pm2
```

#### Step 4: Run migrations
```bash
npm run db:migrate
npm run db:seed (if needed)
```

#### Step 5: Start with PM2
```bash
pm2 start app.js --name "smart-home-api"
pm2 save
pm2 startup
```

#### Step 6: Configure nginx
File: `/etc/nginx/sites-available/smart-home-staging`

```nginx
upstream smart_home_backend {
  server 127.0.0.1:5000;
}

server {
  listen 443 ssl http2;
  server_name api-staging.example.com;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://smart_home_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  location /uploads {
    alias /opt/smart-home-configurator/backend/uploads;
  }
}

server {
  listen 80;
  server_name api-staging.example.com;
  return 301 https://$server_name$request_uri;
}
```

#### Step 7: Enable site & restart nginx
```bash
sudo ln -s /etc/nginx/sites-available/smart-home-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Verify
```bash
# Test API
curl https://api-staging.example.com/api/health

# Check logs
pm2 logs smart-home-api
```

---

## 🐛 DEBUGGING TIPS

### Database Issues
```bash
# Check connection
npm run db:check

# List tables
npm run db:tables

# Run specific migration
npm run db:migrate:specific -- migration-file.cjs

# Rollback last migration
npm run db:migrate:undo
```

### Calculation Issues
```bash
# Validate calculations
npm run calculations:validate

# Debug offer calculation
console.log('calculationSnapshot:', offer.calculationSnapshot);
```

### Follow-up Issues
```bash
# Test follow-up manually
npm run followups:run-once

# Check follow-up logs
SELECT * FROM followup_logs ORDER BY created_at DESC LIMIT 20;
```

### OTP Issues
```bash
# Check OTP settings
cat backend/.env.development | grep OTP

# Test OTP manually
npm run otp:test -- +40712345678

# Mock mode vs real mode
SENDGRID_MOCK_MODE=true (for development)
TWILIO_MOCK_MODE=true (for development)
```

---

## 📚 HELPFUL COMMANDS

```bash
# Development
npm run dev                    # Start dev server with hot reload
npm run db:seed              # Seed sample data
npm run db:reset             # Reset database (dev only)

# Testing
npm test                      # Run tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Production
npm run build                 # Build frontend
npm start                     # Start production server
npm run db:migrate           # Run migrations
npm run integrations:check   # Verify integrations

# Monitoring
npm run logs:tail            # Tail application logs
pm2 logs                      # PM2 process logs
npm run db:check             # Database health
```

---

## ✅ PRE-LAUNCH VALIDATION CHECKLIST

```bash
# 1. Database
[ ] npm run db:migrate
[ ] npm run db:check
[ ] Backup created

# 2. Integrations
[ ] npm run integrations:check
[ ] SendGrid working
[ ] Twilio working
[ ] reCAPTCHA configured

# 3. Calculations
[ ] npm run calculations:validate
[ ] All scenarios passing
[ ] Edge cases tested

# 4. API
[ ] npm run build (frontend)
[ ] npm start (backend)
[ ] curl http://localhost:5000/api/health ✓

# 5. Follow-up
[ ] npm run followups:run-once
[ ] Check logs for successful execution
[ ] Email logs show delivery attempts

# 6. Security
[ ] npm audit (no critical issues)
[ ] JWT_SECRET is strong
[ ] Credentials not in code
[ ] CORS properly configured

# 7. Documentation
[ ] API docs generated
[ ] Deployment runbook ready
[ ] Admin manual prepared
```

---

## 🆘 COMMON ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot connect to database" | Wrong credentials or DB offline | Check .env values, verify PostgreSQL running |
| "JWT verification failed" | Token expired or invalid secret | Check JWT_SECRET in .env, ensure consistent across instances |
| "Email not sending" | SendGrid API key invalid | Verify SENDGRID_API_KEY, check SendGrid dashboard |
| "SMS not sending" | Twilio credentials wrong | Verify TWILIO_ACCOUNT_SID and AUTH_TOKEN |
| "PDF images not showing" | Image URL unreachable | Verify product image URLs, check uploads directory permissions |
| "Calculation incorrect" | Product mapping missing | Check ProductFunctionMapping table, verify product allocation logic |
| "Offer filtering not working" | Missing query parameters | Check filter implementation, verify API endpoint query handling |

---

## 📞 ESCALATION PATH

**Bug found?**
1. Check logs: `npm run logs:tail` or `pm2 logs`
2. Debug locally: reproduce in development environment
3. Check database: verify data integrity
4. Report with: error message, steps to reproduce, environment

**Performance issue?**
1. Check logs for slow queries
2. Run database explain plan
3. Monitor server resources (CPU, memory, disk)
4. Check network latency

**Security issue?**
1. Stop production immediately
2. Notify security team
3. Check logs for breach indicators
4. Plan remediation before restart

---

**Document Version:** 1.0  
**Last Updated:** April 20, 2026  
**For Questions:** Contact [Development Lead]

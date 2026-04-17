import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getRecaptchaDiagnostics } from '../src/security/recaptcha.js';
import { getNotificationIntegrationStatus } from '../src/services/notificationservice.js';

dotenv.config();

function readFrontendEnvDiagnostics() {
    const frontendEnvPath = path.resolve(process.cwd(), '..', 'frontend', '.env');
    const result = {
        envFileFound: fs.existsSync(frontendEnvPath),
        recaptchaMode: null,
        recaptchaSiteKeyConfigured: false,
        productionBuild: process.env.NODE_ENV === 'production',
    };

    if (!result.envFileFound) {
        return result;
    }

    const raw = fs.readFileSync(frontendEnvPath, 'utf8');
    const pairs = dotenv.parse(raw);
    result.recaptchaMode = String(pairs.VITE_RECAPTCHA_MODE || 'live').trim().toLowerCase();
    result.recaptchaSiteKeyConfigured = Boolean(String(pairs.VITE_RECAPTCHA_SITE_KEY || '').trim());
    return result;
}

const recaptcha = getRecaptchaDiagnostics();
const notifications = getNotificationIntegrationStatus();
const frontend = readFrontendEnvDiagnostics();

const report = {
    recaptcha,
    notifications,
    frontend,
};

console.log(JSON.stringify(report, null, 2));

const strictMode = ['1', 'true', 'yes', 'on'].includes(String(process.env.STRICT_INTEGRATION_CHECK || '').trim().toLowerCase());
const productionLike = recaptcha.production || process.env.NODE_ENV === 'production';
const issues = [];
const warnings = [];
if (recaptcha.production && !recaptcha.productionReady) {
    issues.push('reCAPTCHA is not production-ready.');
}
if (recaptcha.activeMode === 'live' && !frontend.recaptchaSiteKeyConfigured) {
    const message = 'Frontend reCAPTCHA site key is missing while backend reCAPTCHA is live.';
    if (strictMode || productionLike) issues.push(message);
    else warnings.push(message);
}
if (frontend.recaptchaMode && frontend.recaptchaMode !== recaptcha.activeMode) {
    const message = `Frontend/backend reCAPTCHA mode mismatch: frontend=${frontend.recaptchaMode}, backend=${recaptcha.activeMode}.`;
    if (strictMode || productionLike) issues.push(message);
    else warnings.push(message);
}
if (frontend.productionBuild && frontend.recaptchaMode === 'mock') {
    issues.push('Frontend reCAPTCHA mock mode is not allowed for production builds.');
}
if (notifications.email.mode === 'invalid' || notifications.email.mode === 'misconfigured') {
    issues.push(`Email integration issue: ${notifications.email.reason}`);
}
if (notifications.sms.mode === 'invalid' || notifications.sms.mode === 'misconfigured') {
    issues.push(`SMS integration issue: ${notifications.sms.reason}`);
}

if (warnings.length) {
    console.warn('\nIntegration warnings:');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
}

if (issues.length) {
    console.error('\nIntegration check failed:');
    issues.forEach((issue) => console.error(`- ${issue}`));
    process.exit(1);
}

console.log('\nIntegration check passed.');

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, ArrowRight, ShieldAlert, Globe, Sparkles, FileText, Receipt } from 'lucide-react';
import { Button, Input, Checkbox, Card, Alert, Badge } from '../components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { startGuestSession, registerUser, clearError } from '../features/auth/authSlice';
import { resetConfigurator } from '../features/configurator/configuratorSlice';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import { normalizeApiError } from '../utils/normalizeApiError';

const sectionCardClass = 'rounded-[1.9rem] p-6 sm:p-7';

export default function RegisterPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    const { cookieConsent } = useSelector((state) => state.ui);
    const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
    const recaptchaMode = String(import.meta.env.VITE_RECAPTCHA_MODE || 'live').trim().toLowerCase();
    const isRecaptchaMock = recaptchaMode === 'mock';
    const invalidProductionRecaptchaConfig = import.meta.env.PROD && isRecaptchaMock;
    const isReturningToConfigurator = location.state?.returnTo === '/configurator';
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        companyName: '',
        invoiceName: '',
        invoiceVat: '',
        invoiceAddress: '',
        agreeTerms: false,
        newsletter: false,
        recaptchaToken: '',
        verificationChannel: 'email',
    });
    const [recaptchaError, setRecaptchaError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleGuestStart = () => {
        dispatch(startGuestSession());
        dispatch(resetConfigurator());
        navigate('/configurator', { state: { freshConfigurator: true } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!String(formData.fullName || '').trim()) errs.fullName = t('auth.errors.fieldRequired');
        if (!String(formData.email || '').trim()) errs.email = t('auth.errors.fieldRequired');
        if (!String(formData.phone || '').trim()) errs.phone = t('auth.errors.fieldRequired');
        if (!String(formData.password || '').trim()) errs.password = t('auth.errors.fieldRequired');
        if (String(formData.password || '').trim() && formData.password.length < 6) errs.password = t('auth.errors.passwordTooShort');
        if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.errors.passwordsDontMatch');
        if (!formData.agreeTerms) errs.agreeTerms = t('auth.errors.mustAcceptTerms');
        setFormErrors(errs);
        if (Object.keys(errs).length) return;

        if (invalidProductionRecaptchaConfig) {
            setRecaptchaError('Frontend reCAPTCHA mock mode is not allowed in production.');
            return;
        }
        if (!isRecaptchaMock && !recaptchaSiteKey) {
            setRecaptchaError('Missing VITE_RECAPTCHA_SITE_KEY');
            return;
        }
        if (!isRecaptchaMock && !formData.recaptchaToken) {
            setRecaptchaError(t('auth.recaptchaRequired'));
            return;
        }

        dispatch(clearError());
        setRecaptchaError(null);
        const payload = {
            ...formData,
            company: formData.companyName,
            verificationChannel: formData.verificationChannel,
            preferredLanguage: (i18n.resolvedLanguage || i18n.language || 'en').startsWith('ro') ? 'ro' : 'en',
            recaptchaToken: isRecaptchaMock ? (formData.recaptchaToken || 'mock-token') : formData.recaptchaToken,
            cookiesAccepted: Boolean(cookieConsent),
        };
        const resultAction = await dispatch(registerUser(payload));
        if (registerUser.fulfilled.match(resultAction)) {
            const { data } = resultAction.payload;
            const deliveryError = data?.verification?.error || data?.deliveryError || null;

            navigate('/auth/verify-otp', {
                state: {
                    email: data.user.email,
                    channel: formData.verificationChannel,
                    availableChannels: [formData.verificationChannel],
                    verificationReason: 'account_verification',
                    deliveryError,
                    message: deliveryError ? null : t('auth.errors.otpSent', { channel: formData.verificationChannel === 'email' ? 'Email' : 'Phone' }),
                    ...(location.state?.returnTo != null && { returnTo: location.state.returnTo, returnStep: location.state.returnStep }),
                },
            });
        } else {
            const ne = normalizeApiError(resultAction.payload);
            if (ne.errors?.recaptchaToken) {
                setRecaptchaError(ne.errors.recaptchaToken);
            } else if (/recaptcha|security verification/i.test(String(ne.message || ''))) {
                setRecaptchaError(ne.message);
            }
            if (ne.errors) setFormErrors((p) => ({ ...p, ...ne.errors }));
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-10 animate-fade-in">
            <div className="space-y-4 text-center animate-slide-up" style={{ animationDelay: '0.08s' }}>
                <Badge variant="info" className="mx-auto gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('auth.createAccountBadge')}
                </Badge>
                <div className="space-y-3">
                    <h3 className="font-heading text-5xl font-semibold leading-none text-textPrimary">{t('auth.createAccount')}</h3>
                    <p className="mx-auto max-w-2xl text-sm leading-relaxed text-textSecondary">{t('auth.createAccountSubtitle')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: '0.16s' }}>
                {error ? (
                    <div className="rounded-2xl border border-red-500/18 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {t(error)}
                    </div>
                ) : null}

                {isReturningToConfigurator ? (
                    <Alert variant="info" icon={ShieldAlert}>
                        <div className="space-y-1">
                            <p className="font-semibold text-textPrimary">
                                {t('auth.activationCheckpointTitle', { defaultValue: 'Complete the customer account to continue' })}
                            </p>
                            <p>
                                {t('auth.activationCheckpointBody', { defaultValue: 'Your guest configuration is already saved. Finish reCAPTCHA and the email OTP verification here, and we will send you back to the configurator with the saved steps attached to the real account.' })}
                            </p>
                        </div>
                    </Alert>
                ) : null}

                <Card className={sectionCardClass}>
                    <div className="space-y-6">
                        <SectionBlock
                            title={t('auth.personalData', 'Personal Data')}
                            subtitle={t('auth.personalDataDesc', 'Enter the contact details required to create and verify your customer account.')}
                        />
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Input label={t('auth.fullName')} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" icon={User} required error={formErrors.fullName} />
                            <Input label={t('auth.email')} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" icon={Mail} required error={formErrors.email} />
                            <Input label={t('auth.phone')} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" icon={Phone} required error={formErrors.phone} />
                        </div>

                        <div className="space-y-3">
                            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                                {t('auth.verificationMethod', 'Verification Method')}
                            </label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        id="verify-email"
                                        name="verificationChannel"
                                        value="email"
                                        checked={formData.verificationChannel === 'email'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary-300 focus:ring-primary-300"
                                    />
                                    <label htmlFor="verify-email" className="flex items-center gap-2 text-sm text-textPrimary">
                                        <Mail className="h-4 w-4" />
                                        {t('auth.verifyByEmail', 'Verify by Email')}
                                    </label>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        id="verify-sms"
                                        name="verificationChannel"
                                        value="sms"
                                        checked={formData.verificationChannel === 'sms'}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-primary-300 focus:ring-primary-300"
                                    />
                                    <label htmlFor="verify-sms" className="flex items-center gap-2 text-sm text-textPrimary">
                                        <Phone className="h-4 w-4" />
                                        {t('auth.verifyByPhone', 'Verify by Phone')}
                                    </label>
                                </div>
                            </div>
                            <Alert variant="info" icon={formData.verificationChannel === 'email' ? Mail : Phone}>
                                <div className="space-y-1">
                                    <p className="font-semibold text-textPrimary">
                                        {formData.verificationChannel === 'email' ? t('auth.verifyByEmail') : t('auth.verifyByPhone')}
                                    </p>
                                    <p>
                                        {formData.verificationChannel === 'email'
                                            ? (formData.email
                                                ? t('auth.registrationEmailOtpOnlyAddress', {
                                                    email: formData.email,
                                                    defaultValue: `After signup, we will send the 6-digit code to ${formData.email}.`,
                                                })
                                                : t('auth.registrationEmailOtpOnlyHint', 'Enter your email above and we will send the 6-digit code there after signup.'))
                                            : (formData.phone
                                                ? t('auth.registrationPhoneOtpOnlyAddress', {
                                                    phone: formData.phone,
                                                    defaultValue: `After signup, we will send the 6-digit code to ${formData.phone}.`,
                                                })
                                                : t('auth.registrationPhoneOtpOnlyHint', 'Enter your phone above and we will send the 6-digit code there after signup.'))}
                                    </p>
                                </div>
                            </Alert>
                        </div>
                    </div>
                </Card>

                <Card className={sectionCardClass}>
                    <div className="space-y-6">
                        <SectionBlock
                            title={t('auth.companyData', 'Company Data')}
                            subtitle={t('auth.companyDataDesc', 'Optional business information stored on the customer account and reused in project and offer records.')}
                        />
                        <Input label={t('auth.company')} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Electronics" icon={Building2} error={formErrors.companyName} />
                    </div>
                </Card>

                <Card className={sectionCardClass}>
                    <div className="space-y-6">
                        <SectionBlock
                            title={t('auth.invoiceData', 'Invoice Data')}
                            subtitle={t('auth.invoiceDataDesc', 'If you already know your billing details, add them now. You can also complete them later in your profile.')}
                        />
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Input label={t('auth.invoiceName', 'Invoice Name')} name="invoiceName" value={formData.invoiceName} onChange={handleChange} placeholder={t('auth.invoiceNamePlaceholder', 'Name shown on the invoice')} icon={FileText} error={formErrors.invoiceName} />
                            <Input label={t('auth.invoiceVat', 'VAT / Tax ID')} name="invoiceVat" value={formData.invoiceVat} onChange={handleChange} placeholder={t('auth.invoiceVatPlaceholder', 'Optional company tax identifier')} icon={Receipt} error={formErrors.invoiceVat} />
                            <div className="md:col-span-2">
                                <Input label={t('auth.invoiceAddress', 'Invoice Address')} name="invoiceAddress" value={formData.invoiceAddress} onChange={handleChange} placeholder={t('auth.invoiceAddressPlaceholder', 'Street, city, postal code')} icon={Building2} error={formErrors.invoiceAddress} />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className={sectionCardClass}>
                    <div className="space-y-6">
                        <SectionBlock
                            title={t('auth.password')}
                            subtitle={t('auth.resetSubtitle', 'Choose a strong password with at least 8 characters.')}
                        />
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <Input label={t('auth.password')} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="........" icon={Lock} required error={formErrors.password} />
                            <Input label={t('auth.confirmPassword')} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="........" icon={Lock} required error={formErrors.confirmPassword} />
                        </div>

                        <Alert variant="info" icon={ShieldAlert}>
                            <div className="space-y-1">
                                <p className="font-semibold text-textPrimary">{t('auth.verificationRequiredTitle', 'Account verification is required')}</p>
                                <p>{t('auth.verificationRequiredDesc', 'After registration, your account is activated through the email OTP verification flow before you can finalize and store offers.')}</p>
                            </div>
                        </Alert>

                        <div className="space-y-4">
                            <Checkbox label={t('auth.agreeTerms')} name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required error={formErrors.agreeTerms} />
                            <Checkbox label={t('auth.newsletter')} name="newsletter" checked={formData.newsletter} onChange={handleChange} />
                        </div>
                    </div>
                </Card>

                <Card className={sectionCardClass}>
                    <div className="space-y-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-primary-300">
                            <ShieldAlert className="h-4.5 w-4.5" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">{t('auth.securityVerification')}</span>
                        </div>

                        {invalidProductionRecaptchaConfig ? (
                            <div className="rounded-2xl border border-red-500/18 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                Frontend reCAPTCHA mock mode is not allowed in production. Signup is disabled until corrected.
                            </div>
                        ) : isRecaptchaMock ? (
                            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-textSecondary">
                                {t('auth.recaptchaMockMode', 'reCAPTCHA mock mode is enabled for this non-production environment.')}
                            </div>
                        ) : recaptchaSiteKey ? (
                            <div className="flex justify-center">
                                <ReCAPTCHA
                                    sitekey={recaptchaSiteKey}
                                    onChange={(token) => {
                                        setRecaptchaError(null);
                                        setFormData((prev) => ({ ...prev, recaptchaToken: token || '' }));
                                    }}
                                    onExpired={() => setFormData((prev) => ({ ...prev, recaptchaToken: '' }))}
                                    onErrored={() => setRecaptchaError(t('auth.recaptchaUnavailable', 'Security verification is unavailable. Please refresh and try again.'))}
                                />
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-textSecondary">
                                {t('auth.recaptchaMissingPrefix', { defaultValue: 'Missing' })} <span className="font-mono font-semibold text-textPrimary">VITE_RECAPTCHA_SITE_KEY</span>. {t('auth.recaptchaMissingSuffix', { defaultValue: 'Signup is disabled until configured.' })}
                            </div>
                        )}

                        {recaptchaError ? <div className="text-sm text-red-200">{recaptchaError}</div> : null}
                    </div>
                </Card>

                <div className="space-y-4 pt-2">
                    <Button type="submit" size="lg" className="w-full gap-2" loading={loading} disabled={invalidProductionRecaptchaConfig}>
                        {t('auth.createAccount')}
                        <ArrowRight className="h-4.5 w-4.5" />
                    </Button>

                    <Button type="button" variant="secondary" onClick={handleGuestStart} className="w-full gap-2">
                        <Globe className="h-4.5 w-4.5" />
                        {t('auth.continueAsGuest')}
                    </Button>
                </div>
            </form>

            <div className="flex items-center justify-center gap-2 border-t border-white/8 pt-6 text-sm text-textSecondary animate-slide-up" style={{ animationDelay: '0.24s' }}>
                <span>{t('auth.alreadyHaveAccount')}</span>
                <Link to="/auth/login" className="font-semibold text-primary-300 transition-colors hover:text-primary-200">
                    {t('nav.login')}
                </Link>
            </div>
        </div>
    );
}
function SectionBlock({ title, subtitle }) {
    return (
        <div>
            <h4 className="text-lg font-semibold text-textPrimary">{title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-textSecondary">{subtitle}</p>
        </div>
    );
}


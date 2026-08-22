import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, ArrowRight, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Checkbox, Alert } from '../components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import { normalizeApiError } from '../utils/normalizeApiError';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
        agreeTerms: false,
        newsletter: false,
        recaptchaToken: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [recaptchaError, setRecaptchaError] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setFormErrors((prev) => {
            if (!prev[name]) return prev;
            const next = { ...prev };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        const trimmedEmail = String(formData.email || '').trim();
        if (!String(formData.fullName || '').trim()) errs.fullName = t('auth.errors.fieldRequired');
        if (!trimmedEmail) errs.email = t('auth.errors.fieldRequired');
        else if (!EMAIL_PATTERN.test(trimmedEmail)) errs.email = t('auth.errors.invalidEmail');
        if (!String(formData.phone || '').trim()) errs.phone = t('auth.errors.fieldRequired');
        if (!String(formData.password || '').trim()) errs.password = t('auth.errors.fieldRequired');
        if (String(formData.password || '').trim() && formData.password.length < 6) errs.password = t('auth.errors.passwordTooShort');
        if (!String(formData.confirmPassword || '').trim()) errs.confirmPassword = t('auth.errors.fieldRequired');
        else if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.errors.passwordsDontMatch');
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
            email: trimmedEmail,
            company: formData.companyName,
            verificationChannel: 'email',
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
                    channel: 'email',
                    availableChannels: ['email'],
                    verificationReason: 'account_verification',
                    deliveryError,
                    message: deliveryError ? null : t('auth.errors.otpSent', { channel: 'Email' }),
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
        <div className="w-full max-w-lg animate-fade-in py-4">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <h2 className="text-center font-heading text-3xl font-semibold text-textPrimary">
                    {t('auth.createAccount')}
                </h2>

                {error ? (
                    <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                        {t(error)}
                    </div>
                ) : null}

                {isReturningToConfigurator ? (
                    <Alert variant="info" icon={ShieldAlert} className="rounded-md">
                        {t('auth.activationCheckpointTitle', { defaultValue: 'Complete the customer account to continue' })}
                    </Alert>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label={t('auth.fullName')} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" icon={User} required error={formErrors.fullName} className="rounded-md bg-fog" />
                    <Input label={t('auth.email')} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@email.com" icon={Mail} required error={formErrors.email} className="rounded-md bg-fog" />
                    <Input label={t('auth.phone')} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" icon={Phone} required error={formErrors.phone} className="rounded-md bg-fog" />
                    <Input label={t('auth.company')} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company" icon={Building2} error={formErrors.companyName} className="rounded-md bg-fog" />
                    <Input
                        label={t('auth.password')}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="........"
                        icon={Lock}
                        trailingIcon={(
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-textSecondary transition-colors hover:text-textPrimary focus:outline-none"
                                aria-label={showPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                            >
                                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        )}
                        required
                        error={formErrors.password}
                        className="rounded-md bg-fog"
                    />
                    <Input
                        label={t('auth.confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="........"
                        icon={Lock}
                        trailingIcon={(
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-textSecondary transition-colors hover:text-textPrimary focus:outline-none"
                                aria-label={showConfirmPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        )}
                        required
                        error={formErrors.confirmPassword}
                        className="rounded-md bg-fog"
                    />
                </div>

                {/* <Alert variant="info" icon={Mail} className="rounded-md">
                    {formData.email
                        ? t('auth.registrationEmailOtpOnlyAddress', { email: formData.email, defaultValue: `After signup, we will send the 6-digit code to ${formData.email}.` })
                        : t('auth.registrationEmailOtpOnlyHint', 'Enter your email above and we will send the 6-digit code there after signup.')}
                </Alert> */}

                <div className="space-y-3">
                    <Checkbox label={t('auth.agreeTerms')} name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} required error={formErrors.agreeTerms} />
                    <Checkbox label={t('auth.newsletter')} name="newsletter" checked={formData.newsletter} onChange={handleChange} />
                </div>

                <div className="space-y-3">
                    {invalidProductionRecaptchaConfig ? (
                        <div className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                            Frontend reCAPTCHA mock mode is not allowed in production. Signup is disabled until corrected.
                        </div>
                    ) : isRecaptchaMock ? (
                        <div className="rounded-md border border-emerald/12 bg-emerald/10 px-4 py-3 text-sm text-textSecondary">
                            {t('auth.recaptchaMockMode', 'reCAPTCHA mock mode is enabled for this non-production environment.')}
                        </div>
                    ) : recaptchaSiteKey ? (
                        <div className="flex justify-left">
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
                        <div className="rounded-md border border-emerald/12 bg-emerald/10 px-4 py-3 text-sm text-textSecondary">
                            {t('auth.recaptchaMissingPrefix', { defaultValue: 'Missing' })} <span className="font-mono font-semibold text-textPrimary">VITE_RECAPTCHA_SITE_KEY</span>. {t('auth.recaptchaMissingSuffix', { defaultValue: 'Signup is disabled until configured.' })}
                        </div>
                    )}
                    {recaptchaError ? <div className="text-sm font-medium text-red-600">{recaptchaError}</div> : null}
                </div>

                <Button type="submit" size="lg" className="w-full rounded-md" loading={loading} disabled={invalidProductionRecaptchaConfig}>
                    {t('auth.createAccount')}
                    <ArrowRight className="h-4.5 w-4.5" />
                </Button>

                <div className="text-center text-sm text-textSecondary">
                    {t('auth.haveAccountPrompt', { defaultValue: 'Already have an account?' })}{' '}
                    <Link to="/auth/login" className="font-semibold text-primary-500 transition-colors hover:text-primary-700">
                        {t('nav.login')}
                    </Link>
                </div>
            </form>
        </div>
    );
}
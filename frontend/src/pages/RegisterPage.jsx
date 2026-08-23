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
        if (!String(formData.fullName || '').trim()) errs.fullName = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        if (!trimmedEmail) errs.email = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        else if (!EMAIL_PATTERN.test(trimmedEmail)) errs.email = t('auth.errors.invalidEmail', { defaultValue: 'Please enter a valid email address.' });
        if (!String(formData.phone || '').trim()) errs.phone = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        if (!String(formData.password || '').trim()) errs.password = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        if (String(formData.password || '').trim() && formData.password.length < 6) errs.password = t('auth.errors.passwordTooShort', { defaultValue: 'Password must be at least 6 characters long.' });
        if (!String(formData.confirmPassword || '').trim()) errs.confirmPassword = t('auth.errors.fieldRequired', { defaultValue: 'Please fill in this field.' });
        else if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.errors.passwordsDontMatch', { defaultValue: 'The passwords do not match.' });
        if (!formData.agreeTerms) errs.agreeTerms = t('auth.errors.mustAcceptTerms', { defaultValue: 'You must accept the Terms and Conditions.' });
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
            setRecaptchaError(t('auth.recaptchaRequired', { defaultValue: 'Please complete the security verification.' }));
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
                    message: deliveryError ? null : t('auth.errors.otpSent', { channel: 'Email', defaultValue: 'Verification code sent to your email.' }),
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
        <div className="w-full max-w-xl mx-auto animate-fade-in">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                        {t('auth.createAccount', { defaultValue: 'Create an Account' })}
                    </h1>
                    <p className="text-sm font-medium text-textSecondary">
                        {t('auth.createAccountSubtitle', { defaultValue: 'Join us to unlock professional smart home design tools and lifecycle management.' })}
                    </p>
                </div>

                {error ? (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                        {t(error, { defaultValue: error })}
                    </div>
                ) : null}

                {isReturningToConfigurator ? (
                    <Alert variant="info" icon={ShieldAlert} className="rounded-xl">
                        {t('auth.activationCheckpointTitle', { defaultValue: 'Complete the customer account to continue' })}
                    </Alert>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                        label={t('auth.fullName', { defaultValue: 'Full Name' })}
                        name="fullName"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        icon={User}
                        required
                        error={formErrors.fullName}
                        className="rounded-xl bg-fog/80"
                    />
                    <Input
                        label={t('auth.email', { defaultValue: 'Email Address' })}
                        type="email"
                        name="email"
                        autoComplete="email"
                        inputMode="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@email.com"
                        icon={Mail}
                        required
                        error={formErrors.email}
                        className="rounded-xl bg-fog/80"
                    />
                    <Input
                        label={t('auth.phone', { defaultValue: 'Phone Number' })}
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        inputMode="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        icon={Phone}
                        required
                        error={formErrors.phone}
                        className="rounded-xl bg-fog/80"
                    />
                    <Input
                        label={t('auth.company', { defaultValue: 'Company Name' })}
                        name="companyName"
                        autoComplete="organization"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Company"
                        icon={Building2}
                        error={formErrors.companyName}
                        className="rounded-xl bg-fog/80"
                    />
                    <Input
                        label={t('auth.password', { defaultValue: 'Password' })}
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        icon={Lock}
                        trailingIcon={(
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-emerald/10 hover:text-emerald focus:outline-none"
                                aria-label={showPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                            >
                                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        )}
                        required
                        error={formErrors.password}
                        className="rounded-xl bg-fog/80"
                    />
                    <Input
                        label={t('auth.confirmPassword', { defaultValue: 'Confirm Password' })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        icon={Lock}
                        trailingIcon={(
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-emerald/10 hover:text-emerald focus:outline-none"
                                aria-label={showConfirmPassword ? t('auth.hidePassword', { defaultValue: 'Hide password' }) : t('auth.showPassword', { defaultValue: 'Show password' })}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                            </button>
                        )}
                        required
                        error={formErrors.confirmPassword}
                        className="rounded-xl bg-fog/80"
                    />
                </div>

                <div className="space-y-3 pt-1">
                    <Checkbox
                        label={t('auth.agreeTerms', { defaultValue: 'I agree to the Terms and Conditions' })}
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        required
                        error={formErrors.agreeTerms}
                    />
                    <Checkbox
                        label={t('auth.newsletter', { defaultValue: 'Keep me updated with smart home innovations and special offers' })}
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-3">
                    {invalidProductionRecaptchaConfig ? (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                            Frontend reCAPTCHA mock mode is not allowed in production. Signup is disabled until corrected.
                        </div>
                    ) : isRecaptchaMock ? (
                        <div className="rounded-xl border border-emerald/15 bg-emerald/10 px-4 py-3 text-sm text-textSecondary">
                            {t('auth.recaptchaMockMode', { defaultValue: 'reCAPTCHA mock mode is enabled for this non-production environment.' })}
                        </div>
                    ) : recaptchaSiteKey ? (
                        <div className="flex w-full justify-start overflow-x-auto py-1">
                            <div className="max-w-full origin-top-left transform scale-[0.88] xs:scale-95 sm:scale-100 transition-transform">
                                <ReCAPTCHA
                                    sitekey={recaptchaSiteKey}
                                    onChange={(token) => {
                                        setRecaptchaError(null);
                                        setFormData((prev) => ({ ...prev, recaptchaToken: token || '' }));
                                    }}
                                    onExpired={() => setFormData((prev) => ({ ...prev, recaptchaToken: '' }))}
                                    onErrored={() => setRecaptchaError(t('auth.recaptchaUnavailable', { defaultValue: 'Security verification is unavailable. Please refresh and try again.' }))}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald/15 bg-emerald/10 px-4 py-3 text-sm text-textSecondary">
                            {t('auth.recaptchaMissingPrefix', { defaultValue: 'Missing' })} <span className="font-mono font-semibold text-textPrimary">VITE_RECAPTCHA_SITE_KEY</span>. {t('auth.recaptchaMissingSuffix', { defaultValue: 'Signup is disabled until configured.' })}
                        </div>
                    )}
                    {recaptchaError ? <div className="text-sm font-medium text-red-600">{recaptchaError}</div> : null}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider"
                    loading={loading}
                    disabled={invalidProductionRecaptchaConfig}
                >
                    {t('auth.createAccount', { defaultValue: 'Create an Account' })}
                    <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="pt-2 text-center text-sm text-textSecondary">
                    {t('auth.haveAccountPrompt', { defaultValue: 'Already have an account?' })}{' '}
                    <Link
                        to="/auth/login"
                        className="font-bold text-emerald transition-colors hover:text-emerald-700 hover:underline"
                    >
                        {t('nav.login', { defaultValue: 'Log In' })}
                    </Link>
                </div>
            </form>
        </div>
    );
}
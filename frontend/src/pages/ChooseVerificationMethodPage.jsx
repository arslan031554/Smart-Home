import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, MessageSquare, Shield, ChevronRight } from 'lucide-react';
import { Alert, Card, Badge, AnimatedPageWrapper } from '../components/common/UIComponents';
import { sendVerificationOtp, clearError } from '../features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '../utils/normalizeApiError';
import { clsx } from 'clsx';

export default function ChooseVerificationMethodPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const { user, loading, error, availableChannels: reduxChannels, verificationReason: reduxVerificationReason } = useSelector((state) => state.auth);
    const { t } = useTranslation();
    const [localError, setLocalError] = useState(null);

    const email = location.state?.email || user?.email;
    const verificationReason = location.state?.verificationReason || reduxVerificationReason || 'account_verification';
    const deliveryError = location.state?.deliveryError || null;
    const initialDelivery = location.state?.delivery || null;
    const sentChannel = location.state?.sentChannel || null;
    const availableChannels = (location.state?.availableChannels?.length > 0)
        ? location.state.availableChannels
        : reduxChannels;

    useEffect(() => {
        if (!email) {
            navigate('/auth/login');
        }
        // Clear Redux error state on component mount to prevent old login error from showing
        if (error) {
            dispatch(clearError());
        }
    }, [email, navigate, dispatch, error]);

    const handleSelectMethod = async (channel) => {
        setLocalError(null); // Clear any previous errors when trying a new channel
        const canUseExistingCode = sentChannel === channel && initialDelivery && !deliveryError;
        if (canUseExistingCode) {
            navigate('/auth/verify-otp', {
                state: {
                    email,
                    channel,
                    availableChannels,
                    message: t('auth.errors.otpSent', { channel: channel.toUpperCase() }),
                    verificationReason,
                    ...(location.state?.returnTo != null && { returnTo: location.state.returnTo, returnStep: location.state.returnStep }),
                },
            });
            return;
        }

        try {
            const resultAction = await dispatch(sendVerificationOtp({ email, channel }));
            if (sendVerificationOtp.fulfilled.match(resultAction)) {
                navigate('/auth/verify-otp', {
                    state: {
                        email,
                        channel,
                        availableChannels,
                        message: t('auth.errors.otpSent', { channel: channel.toUpperCase() }),
                        verificationReason,
                        ...(location.state?.returnTo != null && { returnTo: location.state.returnTo, returnStep: location.state.returnStep }),
                    },
                });
            } else {
                const error = normalizeApiError(resultAction.payload);
                const errorMessage = error.message || t('auth.errors.otpSendFailed');
                
                // Set channel-specific error message
                if (channel === 'sms') {
                    setLocalError(`SMS: ${errorMessage}`);
                } else if (channel === 'email') {
                    setLocalError(`Email: ${errorMessage}`);
                } else {
                    setLocalError(errorMessage);
                }
            }
        } catch (_err) {
            setLocalError(t('errors.requestFailed'));
        }
    };

    if (!email) return null;

    const options = [
        {
            key: 'email',
            title: t('auth.verifyByEmail'),
            detail: email,
            icon: Mail,
            tone: 'text-primary-300',
            enabled: availableChannels.includes('email'),
        },
        {
            key: 'sms',
            title: t('auth.verifyBySms'),
            detail: user?.phone || t('auth.linkedPhone'),
            icon: MessageSquare,
            tone: 'text-emerald-300',
            enabled: availableChannels.includes('sms'),
        },
    ]; // Show all channels, even if there was a delivery error

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="space-y-6">
                <div className="space-y-2 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald shadow-sm">
                        <Shield className="h-5 w-5" />
                    </div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
                        {verificationReason === 'login_2fa' ? t('auth.twoFactorTitle', 'Two-Factor Verification') : t('auth.verifyTitle')}
                    </h1>
                    <p className="mx-auto max-w-sm text-sm font-medium text-textSecondary">
                        {verificationReason === 'login_2fa'
                            ? t('auth.twoFactorSubtitle', 'Choose where to receive your login security code.')
                            : t('auth.verifySubtitle')}
                    </p>
                </div>

                {(error || localError || deliveryError) ? (
                    <Alert variant="warning" className="rounded-xl">
                        {localError && <p className="text-sm font-semibold">{localError}</p>}
                        {!localError && deliveryError && (
                            <>
                                <p className="text-sm font-semibold">{deliveryError}</p>
                                <p className="mt-1 text-xs text-textSecondary">{t('auth.tryAlternativeChannel', 'Try using an alternative verification method below.')}</p>
                            </>
                        )}
                        {!localError && !deliveryError && error && <p className="text-sm">{error}</p>}
                    </Alert>
                ) : null}

                <div className="space-y-3">
                    {options.filter(o => o.enabled).map((option) => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.key}
                                onClick={() => handleSelectMethod(option.key)}
                                disabled={loading}
                                className={clsx(
                                    'w-full rounded-2xl border border-emerald/18 bg-fog/80 p-4 sm:p-5 text-left transition-all duration-300',
                                    'hover:border-emerald/40 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60',
                                )}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/10 text-emerald shadow-sm">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-textPrimary">{option.title}</p>
                                            <p className="mt-0.5 text-xs text-textSecondary">{option.detail}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-emerald" />
                                </div>
                            </button>
                        );
                    })}

                    {options.filter(o => !o.enabled).length > 0 ? (
                        <div className="rounded-2xl border border-emerald/12 bg-fog/60 p-4 text-left">
                            <p className="text-xs text-textSecondary">{t('auth.noChannels', 'No verification channels available. Please ensure your account has an email and/or phone number.')}</p>
                        </div>
                    ) : null}
                </div>

                <div className="pt-2 text-center">
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="inline-flex min-h-[36px] items-center text-sm font-bold text-textSecondary transition-colors hover:text-emerald"
                    >
                        {t('nav.login')}
                    </button>
                </div>
            </div>
        </div>
    );
}

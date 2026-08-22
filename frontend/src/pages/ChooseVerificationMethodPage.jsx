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
        } catch {
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
        <AnimatedPageWrapper>
            <div className="flex min-h-[70vh] items-center justify-center py-6">
                <Card className="w-full max-w-xl rounded-[2rem] p-7 sm:p-8">
                    <div className="space-y-6">
                        <div className="space-y-4 text-center">
                            <Badge variant="info" className="mx-auto gap-2">
                                <Shield className="h-3.5 w-3.5" />
                                {t('auth.verifyTitle')}
                            </Badge>
                            <div className="space-y-2">
                                <h3 className="font-heading text-4xl font-semibold text-textPrimary">
                                    {verificationReason === 'login_2fa' ? t('auth.twoFactorTitle', 'Two-Factor Verification') : t('auth.verifyTitle')}
                                </h3>
                                <p className="mx-auto max-w-md text-sm leading-relaxed text-textSecondary">
                                    {verificationReason === 'login_2fa'
                                        ? t('auth.twoFactorSubtitle', 'Choose where to receive your login security code.')
                                        : t('auth.verifySubtitle')}
                                </p>
                            </div>
                        </div>

                        {(error || localError || deliveryError) ? (
                            <Alert variant="warning">
                                {localError && <p className="text-sm font-semibold">{localError}</p>}
                                {!localError && deliveryError && (
                                    <>
                                        <p className="text-sm font-semibold">{deliveryError}</p>
                                        <p className="mt-2 text-xs text-textSecondary">{t('auth.tryAlternativeChannel', 'Try using an alternative verification method below.')}</p>
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
                                            'w-full rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-left transition-all duration-300',
                                            'hover:border-primary-500/18 hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60',
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={clsx('flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-[#1d1d1d]', option.tone)}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-textPrimary">{option.title}</p>
                                                    <p className="mt-1 text-xs text-textSecondary">{option.detail}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4.5 w-4.5 text-textSecondary" />
                                        </div>
                                    </button>
                                );
                            })}

                            {options.filter(o => !o.enabled).length > 0 ? (
                                <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-left">
                                    <p className="text-xs text-textSecondary">{t('auth.noChannels', 'No verification channels available. Please ensure your account has an email and/or phone number.')}</p>
                                </div>
                            ) : null}
                        </div>

                        <div className="pt-2 text-center">
                            <button onClick={() => navigate('/auth/login')} className="text-sm font-semibold text-textSecondary transition-colors hover:text-primary-300">
                                {t('nav.login')}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </AnimatedPageWrapper>
    );
}

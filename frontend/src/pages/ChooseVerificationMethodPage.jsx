import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, MessageSquare, Shield, ChevronRight } from 'lucide-react';
import { Alert, Card, Badge, AnimatedPageWrapper } from '../components/common/UIComponents';
import { sendVerificationOtp } from '../features/auth/authSlice';
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
    const availableChannels = (location.state?.availableChannels?.length > 0)
        ? location.state.availableChannels
        : reduxChannels;

    useEffect(() => {
        if (!email) {
            navigate('/auth/login');
        }
    }, [email, navigate]);

    const handleSelectMethod = async (channel) => {
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
                setLocalError(normalizeApiError(resultAction.payload).message || t('auth.errors.otpSendFailed'));
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
    ].filter((item) => item.enabled);

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

                        {(error || localError) ? <Alert variant="error">{localError || error}</Alert> : null}

                        <div className="space-y-3">
                            {options.map((option) => {
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

                            {!options.length ? (
                                <p className="text-center text-sm text-textSecondary">{t('auth.noChannels')}</p>
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

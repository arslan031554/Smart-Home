import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, Badge } from '@/components/common/UIComponents';
import { useDispatch, useSelector } from 'react-redux';
import { performPasswordReset, clearError } from '@/features/auth/authSlice';
import { useTranslation } from 'react-i18next';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { loading, error } = useSelector((state) => state.auth);

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/auth/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        dispatch(clearError());

        if (!password || !confirmPassword) {
            setLocalError(t('auth.errors.fieldRequired'));
            return;
        }
        if (password !== confirmPassword) {
            setLocalError(t('auth.errors.passwordsDontMatch'));
            return;
        }

        const result = await dispatch(performPasswordReset({ token, newPassword: password }));
        if (performPasswordReset.fulfilled.match(result)) {
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div className="space-y-8 py-8 text-center animate-fade-in">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                    <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('auth.resetSuccessTitle', 'Password Reset!')}</h3>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-textSecondary">{t('auth.resetSuccessBody', 'Your password has been successfully updated. You can now use your new password to sign in.')}</p>
                </div>
                <Button className="w-full gap-2" onClick={() => window.location.href = '/auth/login'}>
                    {t('nav.login')}
                    <ArrowRight className="h-4.5 w-4.5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4 text-center">
                <Badge variant="info" className="mx-auto">{t('auth.resetTitle', 'Set New Password')}</Badge>
                <div className="space-y-2">
                    <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('auth.resetTitle', 'Set New Password')}</h3>
                    <p className="text-sm text-textSecondary">{t('auth.resetSubtitle', 'Choose a strong password with at least 8 characters.')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {(localError || error) ? (
                    <div className="rounded-2xl border border-red-500/18 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {localError || t(error)}
                    </div>
                ) : null}

                <div className="space-y-2">
                    <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('auth.password')}</label>
                    <div className="group relative flex items-center">
                        <Lock className="pointer-events-none absolute left-4 h-4.5 w-4.5 text-textSecondary transition-colors group-focus-within:text-primary-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="........"
                            className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] py-3.5 pl-12 pr-4 text-sm font-medium text-textPrimary placeholder:text-[#9d958a] transition-all duration-300 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">{t('auth.confirmPassword')}</label>
                    <div className="group relative flex items-center">
                        <ShieldCheck className="pointer-events-none absolute left-4 h-4.5 w-4.5 text-textSecondary transition-colors group-focus-within:text-primary-400" />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="........"
                            className="w-full rounded-2xl border border-white/10 bg-[#1f1f1f] py-3.5 pl-12 pr-4 text-sm font-medium text-textPrimary placeholder:text-[#9d958a] transition-all duration-300 focus:border-primary-500/50 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                    {t('auth.resetSubmit', 'Update Password')}
                </Button>
            </form>
        </div>
    );
}

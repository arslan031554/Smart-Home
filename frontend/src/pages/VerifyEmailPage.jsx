import { useState, useRef } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/components/common/UIComponents';
import { useTranslation } from 'react-i18next';

export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const inputs = useRef([]);
    const [isVerified, setIsVerified] = useState(false);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 4) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        console.log('Verifying code:', code);
        setIsVerified(true);
    };

    if (isVerified) {
        return (
            <div className="mx-auto max-w-md space-y-6 py-6 text-center animate-fade-in">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald/10 text-emerald shadow-sm">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">{t('verifyEmail.successTitle', { defaultValue: 'Verified Successfully!' })}</h2>
                    <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-textSecondary">{t('verifyEmail.successBody', { defaultValue: 'Your email has been verified. You can now access all features.' })}</p>
                </div>
                <Button className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider gap-2" onClick={() => window.location.href = '/dashboard'}>
                    {t('verifyEmail.dashboard', { defaultValue: 'Go to Dashboard' })}
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto animate-fade-in">
            <div className="space-y-2 text-center mb-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald/10 text-emerald shadow-sm">
                    <Mail className="h-5 w-5" />
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">{t('verifyEmail.title', { defaultValue: 'Verify Your Email' })}</h1>
                <p className="text-sm font-medium text-textSecondary">{t('verifyEmail.body', { defaultValue: "We've sent a code to your email. Enter it below." })}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="h-12 w-11 sm:h-14 sm:w-12 rounded-xl border border-emerald/20 bg-fog/80 text-center text-xl sm:text-2xl font-bold text-textPrimary shadow-sm transition-all focus:border-emerald focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald/12"
                            required
                        />
                    ))}
                </div>

                <div className="space-y-3 pt-2 text-center">
                    <Button type="submit" size="lg" className="w-full min-h-[46px] rounded-full text-xs font-black tracking-wider">
                        {t('verifyEmail.verifyNow', { defaultValue: 'Verify Now' })}
                    </Button>
                    <div className="pt-2 text-sm text-textSecondary">
                        <span>{t('verifyEmail.noCode', { defaultValue: "Didn't receive code?" })}</span>
                        <button type="button" className="ml-2 font-bold text-emerald transition-colors hover:text-emerald-700">{t('verifyEmail.resend', { defaultValue: 'Resend Code' })}</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

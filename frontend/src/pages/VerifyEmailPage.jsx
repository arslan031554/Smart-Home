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
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1].focus();
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
            <div className="space-y-8 py-8 text-center animate-fade-in">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-primary-500/18 bg-primary-500/12 text-primary-300 shadow-glow">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <div className="space-y-3">
                    <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('verifyEmail.successTitle', { defaultValue: 'Verified Successfully!' })}</h3>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-textSecondary">{t('verifyEmail.successBody', { defaultValue: 'Your email has been verified. You can now access all features.' })}</p>
                </div>
                <Button className="w-full gap-2" onClick={() => window.location.href = '/dashboard'}>
                    {t('verifyEmail.dashboard', { defaultValue: 'Go to Dashboard' })}
                    <ArrowRight className="h-4.5 w-4.5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="space-y-4 text-center">
                <Badge variant="info" className="mx-auto gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    {t('verifyEmail.title', { defaultValue: 'Verify Your Email' })}
                </Badge>
                <div className="space-y-2">
                    <h3 className="font-heading text-4xl font-semibold text-textPrimary">{t('verifyEmail.title', { defaultValue: 'Verify Your Email' })}</h3>
                    <p className="text-sm text-textSecondary">{t('verifyEmail.body', { defaultValue: "We've sent a code to your email. Enter it below." })}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputs.current[index] = el)}
                            type="text"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="h-16 w-14 rounded-2xl border border-white/10 bg-[#1f1f1f] text-center text-2xl font-semibold text-textPrimary transition-all duration-300 focus:border-primary-500/45 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                            required
                        />
                    ))}
                </div>

                <div className="space-y-4 text-center">
                    <Button type="submit" className="w-full">
                        {t('verifyEmail.verifyNow', { defaultValue: 'Verify Now' })}
                    </Button>
                    <div className="text-sm text-textSecondary">
                        <span>{t('verifyEmail.noCode', { defaultValue: "Didn't receive code?" })}</span>
                        <button type="button" className="ml-2 font-semibold text-primary-300 transition-colors hover:text-primary-200">{t('verifyEmail.resend', { defaultValue: 'Resend Code' })}</button>
                    </div>
                </div>
            </form>
        </div>
    );
}

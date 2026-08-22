import { useEffect, useMemo, useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Building2,
    FileText,
    Receipt,
    Shield,
    ArrowLeft,
    Save,
    LogOut,
    CheckCircle2,
    CircleAlert,
    Sparkles,
} from 'lucide-react';
import {
    Button,
    Badge,
    Alert,
    Card,
    SectionTitle,
    Input,
    AnimatedPageWrapper,
} from '@/components/common/UIComponents';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, logout, updateProfile } from '@/features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { normalizeApiError } from '@/utils/normalizeApiError';

const buildFormData = (user) => ({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || user?.company || '',
    invoiceName: user?.invoiceName || '',
    invoiceVat: user?.invoiceVat || '',
    invoiceAddress: user?.invoiceAddress || '',
    newsletterSubscribed: user?.newsletterSubscribed ?? false,
});

export default function ProfilePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);
    const { t } = useTranslation();
    const [formData, setFormData] = useState(() => buildFormData(user));
    const [formErrors, setFormErrors] = useState({});
    const [saveSuccess, setSaveSuccess] = useState(null);

    useEffect(() => {
        setFormData(buildFormData(user));
    }, [user]);

    useEffect(() => () => {
        dispatch(clearError());
    }, [dispatch]);

    const verificationChannels = useMemo(() => {
        const channels = [];
        if (user?.email) channels.push(t('auth.verifyByEmail', 'Verify by Email'));
        if (user?.phone) channels.push(t('auth.verifyBySms', 'Verify by SMS'));
        return channels;
    }, [t, user?.email, user?.phone]);

    const handleBack = () => navigate(-1);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSaveSuccess(null);
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSave = async () => {
        const errs = {};
        if (!String(formData.fullName || '').trim()) errs.fullName = t('auth.errors.fieldRequired');
        if (!String(formData.phone || '').trim()) errs.phone = t('auth.errors.fieldRequired');
        setFormErrors(errs);
        if (Object.keys(errs).length) return;

        setSaveSuccess(null);
        dispatch(clearError());
        const resultAction = await dispatch(updateProfile({
            fullName: formData.fullName,
            phone: formData.phone,
            companyName: formData.companyName,
            invoiceName: formData.invoiceName,
            invoiceVat: formData.invoiceVat,
            invoiceAddress: formData.invoiceAddress,
            newsletterSubscribed: formData.newsletterSubscribed,
        }));

        if (updateProfile.fulfilled.match(resultAction)) {
            setFormErrors({});
            setSaveSuccess(t('auth.profileSaved', 'Your account profile has been updated.'));
        } else {
            const normalized = normalizeApiError(resultAction.payload);
            if (normalized.errors) setFormErrors(normalized.errors);
        }
    };

    const handleSignOut = async () => {
        await dispatch(logout());
        navigate('/auth/login');
    };

    const displayName = formData.fullName || user?.fullName || user?.email || t('nav.profile');

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl pb-12 px-2 sm:px-4 lg:px-6 mt-4">
            <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md relative rounded-sm p-4 sm:p-5 lg:p-6 transition-all duration-700 group/bg space-y-8">
            <div className="bg-primary-600/5 border border-primary-500/10 overflow-hidden rounded-sm px-5 py-6 sm:px-6 relative">
                <div className="absolute -right-24 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="primary" className="gap-2">
                                <Sparkles className="h-3.5 w-3.5" />
                                {t('nav.profile')}
                            </Badge>
                            <Badge variant={user?.isVerified !== false ? 'success' : 'warning'}>
                                {user?.isVerified !== false
                                    ? t('auth.verifiedAccount', 'Your account is verified.')
                                    : t('auth.unverifiedAccount', 'Your account still needs verification.')}
                            </Badge>
                        </div>

                        <SectionTitle
                            title={displayName}
                            subtitle={t('auth.profileSubtitle', 'Review and update your personal, company, billing, and consent details from your real customer account record.')}
                            badge={user?.email || t('auth.account', 'Account')}
                            className="mb-0"
                        />

                        <div className="flex flex-wrap gap-3">
                            {user?.phone ? <Badge variant="neutral" className="!rounded-sm !py-1 !px-2.5 shadow-sm">{user.phone}</Badge> : null}
                            {formData.companyName ? <Badge variant="neutral" className="!rounded-sm !py-1 !px-2.5 shadow-sm">{formData.companyName}</Badge> : null}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="secondary" size="lg" className="gap-2 !rounded-sm" onClick={handleBack}>
                            <ArrowLeft className="h-4.5 w-4.5" />
                            {t('configurator.goBack')}
                        </Button>
                        <Button size="lg" className="gap-2 !rounded-sm" onClick={handleSave} loading={loading}>
                            <Save className="h-4.5 w-4.5" />
                            {t('adminPages.masterData.modal.save')}
                        </Button>
                    </div>
                </div>
            </div>

            {(error || saveSuccess) ? (
                <Alert variant={error ? 'error' : 'success'}>
                    {error ? t(error) : saveSuccess}
                </Alert>
            ) : null}

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.3fr_0.85fr]">
                <div className="space-y-8">
                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm [&_h3]:!text-white [&_p]:!text-primary-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('auth.personalData', 'Personal Data')}</h3>
                                    <p className="text-sm text-textSecondary">{t('auth.personalDataSubtitle', 'Keep your personal and contact details up to date.')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Input
                                    label={t('auth.fullName')}
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    icon={User}
                                    error={formErrors.fullName}
                                />
                                <Input
                                    label={t('auth.email')}
                                    name="email"
                                    value={formData.email}
                                    icon={Mail}
                                    readOnly
                                    className="cursor-not-allowed opacity-70"
                                />
                                <Input
                                    label={t('auth.phone')}
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    icon={Phone}
                                    error={formErrors.phone}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm [&_h3]:!text-white [&_p]:!text-primary-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('auth.companyData', 'Company Data')}</h3>
                                    <p className="text-sm text-textSecondary">{t('auth.companySubtitle', 'Optional company information used for your project and offer records.')}</p>
                                </div>
                            </div>

                            <Input
                                label={t('auth.company')}
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                icon={Building2}
                                error={formErrors.companyName}
                            />
                        </div>
                    </Card>

                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm [&_h3]:!text-white [&_p]:!text-primary-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('auth.invoiceData', 'Invoice Data')}</h3>
                                    <p className="text-sm text-textSecondary">{t('auth.invoiceSubtitle', 'Billing information used for generated offers and account administration.')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Input
                                    label={t('auth.invoiceName', 'Invoice Name')}
                                    name="invoiceName"
                                    value={formData.invoiceName}
                                    onChange={handleChange}
                                    icon={FileText}
                                    error={formErrors.invoiceName}
                                />
                                <Input
                                    label={t('auth.invoiceVat', 'VAT / Tax ID')}
                                    name="invoiceVat"
                                    value={formData.invoiceVat}
                                    onChange={handleChange}
                                    icon={Receipt}
                                    error={formErrors.invoiceVat}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label={t('auth.invoiceAddress', 'Invoice Address')}
                                        name="invoiceAddress"
                                        value={formData.invoiceAddress}
                                        onChange={handleChange}
                                        icon={Building2}
                                        error={formErrors.invoiceAddress}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm [&_h3]:!text-white [&_p]:!text-primary-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('auth.accountOverview', 'Account Overview')}</h3>
                                    <p className="text-sm text-textSecondary">{t('auth.accountOverviewSubtitle', 'A quick snapshot of the profile currently attached to your smart-home workspace.')}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { label: t('auth.email'), value: formData.email || '-' },
                                    { label: t('auth.phone'), value: formData.phone || '-' },
                                    { label: t('auth.company'), value: formData.companyName || '-' },
                                ].map((item) => (
                                    <div key={item.label} className="rounded-sm border border-gray-100 bg-gray-50 px-4 py-4">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{item.label}</p>
                                        <p className="mt-2 text-sm font-medium text-textPrimary">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm [&_h3]:!text-white [&_p]:!text-primary-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('auth.preferencesAndConsents', 'Preferences and Consents')}</h3>
                                    <p className="text-sm text-textSecondary">{t('auth.preferencesSubtitle', 'Control communications and review accepted account policies.')}</p>
                                </div>
                            </div>

                            <label className="flex items-center justify-between gap-4 rounded-sm border border-gray-100 bg-gray-50 px-5 py-4">
                                <div>
                                    <p className="text-sm font-medium text-textPrimary">{t('auth.newsletter')}</p>
                                    <p className="mt-1 text-xs text-textSecondary">{t('auth.newsletterDesc', 'Choose whether you want to receive product and offer updates by email.')}</p>
                                </div>
                                <input
                                    type="checkbox"
                                    name="newsletterSubscribed"
                                    checked={formData.newsletterSubscribed}
                                    onChange={handleChange}
                                    className="h-5 w-5 rounded border-gray-200 bg-white text-primary-500 focus:ring-primary-500/30"
                                />
                            </label>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-gray-50 px-4 py-4">
                                    <span className="text-sm font-medium text-textPrimary">{t('footer.termsOfService')}</span>
                                    <Badge variant={user?.termsAccepted ? 'success' : 'neutral'}>
                                        {user?.termsAccepted ? t('auth.accepted', 'Accepted') : t('auth.notAccepted', 'Not accepted')}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between rounded-sm border border-gray-100 bg-gray-50 px-4 py-4">
                                    <span className="text-sm font-medium text-textPrimary">{t('cookies.title')}</span>
                                    <Badge variant={user?.cookiesAccepted ? 'success' : 'neutral'}>
                                        {user?.cookiesAccepted ? t('auth.accepted', 'Accepted') : t('auth.notAccepted', 'Not accepted')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3 rounded-sm bg-primary-600 px-4 py-3 text-white shadow-sm [&_h3]:!text-white [&_p]:!text-primary-100">
                                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50/50 text-primary-500">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-textPrimary">{t('auth.verificationStatus', 'Verification Status')}</h3>
                                    <p className="text-sm text-textSecondary">{t('auth.verificationStatusBody', 'The platform currently verifies customer accounts with the implemented OTP flow by email or SMS when available.')}</p>
                                </div>
                            </div>

                            <Alert variant={user?.isVerified !== false ? 'success' : 'warning'} icon={user?.isVerified !== false ? CheckCircle2 : CircleAlert}>
                                <div className="space-y-1">
                                    <p className="font-medium text-textPrimary">
                                        {user?.isVerified !== false
                                            ? t('auth.verifiedAccount', 'Your account is verified.')
                                            : t('auth.unverifiedAccount', 'Your account still needs verification.')}
                                    </p>
                                </div>
                            </Alert>

                            <div className="flex flex-wrap gap-2">
                                {verificationChannels.length ? verificationChannels.map((channel) => (
                                    <Badge key={channel} variant="neutral">{channel}</Badge>
                                )) : (
                                    <Badge variant="neutral">
                                        {t('auth.noChannels', 'No verification channels available. Please contact support.')}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card hover className="rounded-sm p-6 bg-white border border-gray-100 shadow-sm">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-textPrimary">{t('auth.accountActions', 'Account Actions')}</h3>
                            <Button variant="secondary" className="w-full justify-center gap-2 border border-red-500/20 text-red-500 hover:bg-red-50 hover:text-red-600 bg-white" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4" />
                                {t('nav.logout')}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
            </div>
        </AnimatedPageWrapper>
    );
}

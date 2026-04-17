import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatedPageWrapper, Card, SectionTitle, Button } from '../components/common/UIComponents';

export default function CookiesPolicyPage() {
    const { t } = useTranslation();
    const paragraphs = [
        t('legal.cookies.paragraphs.0'),
        t('legal.cookies.paragraphs.1'),
        t('legal.cookies.paragraphs.2'),
    ];

    return (
        <AnimatedPageWrapper className="mx-auto max-w-4xl space-y-8 pb-16">
            <div className="flex items-center justify-between">
                <SectionTitle
                    title={t('cookies.title')}
                    subtitle={t('legal.cookies.subtitle')}
                    badge={t('legal.badge')}
                    className="mb-0"
                />
                <Link to="/">
                    <Button variant="secondary" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        {t('configurator.goBack')}
                    </Button>
                </Link>
            </div>

            <Card className="rounded-[2rem] p-8">
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/12 text-primary-300">
                        <Cookie className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-medium text-textPrimary">{t('cookies.title')}</h3>
                </div>

                <div className="space-y-5 text-sm leading-relaxed text-textSecondary">
                    {paragraphs.map((paragraph, index) => (
                        <p key={`cookies-paragraph-${index + 1}`}>{paragraph}</p>
                    ))}
                </div>
            </Card>
        </AnimatedPageWrapper>
    );
}

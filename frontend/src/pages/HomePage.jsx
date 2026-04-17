import React from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Zap, Shield, Cpu, ArrowRight, Sparkles,
    CheckCircle, Star, Globe, MousePointer2, Home, Activity,
} from 'lucide-react';
import { Button, Badge, Card } from '@/components/common/UIComponents';
import HeroCarousel from '@/components/home/HeroCarousel';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
    const { t } = useTranslation();

    const features = [
        {
            title: t('home.features.smartAutomation.title'),
            description: t('home.features.smartAutomation.desc'),
            icon: Cpu,
        },
        {
            title: t('home.features.energySavings.title'),
            description: t('home.features.energySavings.desc'),
            icon: Zap,
        },
        {
            title: t('home.features.advancedSecurity.title'),
            description: t('home.features.advancedSecurity.desc'),
            icon: Shield,
        },
        {
            title: t('home.features.unifiedDashboard.title'),
            description: t('home.features.unifiedDashboard.desc'),
            icon: LayoutDashboard,
        },
    ];

    const featureStrip = [
        { label: t('home.features.smartAutomation.title', { defaultValue: 'Automation' }), icon: Cpu },
        { label: t('home.features.advancedSecurity.title', { defaultValue: 'Security' }), icon: Shield },
        { label: t('home.features.energySavings.title', { defaultValue: 'Energy' }), icon: Zap },
        { label: t('home.hero.badges.setupFast', { defaultValue: 'Comfort' }), icon: Home },
        { label: t('home.features.unifiedDashboard.title', { defaultValue: 'Monitoring' }), icon: Activity },
    ];

    const stats = [
        { value: '5,400+', label: t('home.stats.activeHomes') },
        { value: '99.9%', label: t('home.stats.uptime') },
        { value: '30%', label: t('home.stats.energySaved') },
        { value: '4.9+', label: t('home.stats.userRating') },
    ];

    const testimonials = [
        {
            quote: t('home.testimonials.0.quote'),
            name: t('home.testimonials.0.name'),
            role: t('home.testimonials.0.role'),
            avatar: 'SM',
        },
        {
            quote: t('home.testimonials.1.quote'),
            name: t('home.testimonials.1.name'),
            role: t('home.testimonials.1.role'),
            avatar: 'JT',
        },
        {
            quote: t('home.testimonials.2.quote'),
            name: t('home.testimonials.2.name'),
            role: t('home.testimonials.2.role'),
            avatar: 'ER',
        },
    ];

    return (
        <div className="flex flex-col items-center text-textPrimary">
            <section className="relative w-full overflow-hidden px-0 py-8 sm:py-12 lg:py-16">
                <div className="container-custom px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center animate-fade-in">
                        {/* Left Side - Text Content */}
                        <div className="space-y-7 animate-slide-in-left">
                            <div className="flex flex-wrap items-start gap-3 animate-slide-in-down" style={{animationDelay: '100ms'}}>
                                <div className="chip hover:scale-105 transition-transform duration-300">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    <span>{t('home.hero.badge')}</span>
                                </div>
                                <Badge variant="neutral" className="bg-primary-500/20 text-primary-300 border-primary-500/30 hover:scale-105 transition-transform duration-300">
                                    {t('home.cta.ribbon')}
                                </Badge>
                            </div>

                            <div className="space-y-5 animate-slide-in-down" style={{animationDelay: '200ms'}}>
                                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-textPrimary">
                                    {t('home.hero.title.part1')}{' '}
                                    <span className="text-green-700">{t('home.hero.title.highlight')}</span>
                                </h1>
                                <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-textSecondary">
                                    {t('home.hero.subtitle')}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-down" style={{animationDelay: '300ms'}}>
                                <Link to="/auth/register" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full gap-2 sm:w-auto hover:scale-105 hover:shadow-lg transition-all duration-300">
                                        {t('home.hero.ctaPrimary')}
                                        <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/auth/login" className="w-full sm:w-auto">
                                    <Button variant="secondary" size="lg" className="w-full sm:w-auto hover:scale-105 hover:shadow-lg transition-all duration-300">
                                        {t('home.hero.ctaSecondary')}
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 text-xs sm:text-sm text-textSecondary">
                                {[t('home.hero.badges.noCard'), t('home.hero.badges.setupFast'), t('home.hero.badges.trial')].map((label) => (
                                    <span key={label} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary-300 flex-shrink-0" />
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Right Side - Carousel */}
                        <div className="animate-slide-in-right" style={{animationDelay: '400ms'}}>
                            <HeroCarousel />
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Strip Section */}
            <section className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10 animate-fade-in">
                <div className="container-custom">
                    <div className="grid gap-3 md:grid-cols-5">
                        {featureStrip.map((item, idx) => (
                            <div key={item.label} className="premium-card-muted flex items-center gap-3 rounded-[1.35rem] px-4 py-4 hover:shadow-card-hover hover:scale-105 transition-all duration-300 cursor-pointer" style={{animationDelay: `${idx * 50}ms`}}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary-500/18 bg-primary-500/10 text-primary-300">
                                    <item.icon className="h-4.5 w-4.5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textSecondary">Service</p>
                                    <p className="mt-1 text-sm font-semibold text-textPrimary">{item.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12 animate-fade-in">
                <div className="container-custom">
                    <div className="grid gap-4 md:grid-cols-4">
                        {stats.map((item, idx) => (
                            <div key={item.label} className="premium-card-muted rounded-[1.35rem] px-5 py-5 text-center hover:shadow-card-hover hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
                                <p className="font-heading text-4xl font-semibold leading-none text-primary-300">{item.value}</p>
                                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-textSecondary">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full px-4 py-10 sm:px-6 lg:px-8 lg:py-16 animate-fade-in">
                <div className="container-custom">
                    <SectionHeader
                        badge={t('home.features.badge')}
                        title={
                            <>
                                {t('home.features.title.part1')}{' '}
                                <span className="text-gradient-brand">{t('home.features.title.highlight')}</span>{' '}
                                {t('home.features.title.part2')}
                            </>
                        }
                        subtitle={t('home.features.subtitle')}
                    />

                    <div className="grid gap-6 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <Card key={feature.title} hover className="h-full rounded-[1.9rem] p-6 hover:shadow-premium-hover hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex h-full flex-col gap-5">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-primary-500/18 bg-primary-500/10 text-primary-300 hover:scale-110 transition-transform duration-300">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-semibold text-textPrimary">{feature.title}</h3>
                                        <p className="text-sm leading-relaxed text-textSecondary">{feature.description}</p>
                                    </div>
                                    <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-primary-300 hover:gap-3 transition-all duration-300">
                                        {t('home.features.learnMore')}
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full border-y border-white/8 bg-black/10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16 animate-fade-in">
                <div className="container-custom">
                    <SectionHeader
                        badge={t('home.testimonials.badge')}
                        title={
                            <>
                                {t('home.testimonials.title.part1')}{' '}
                                <span className="text-gradient-brand">{t('home.testimonials.title.highlight')}</span>
                            </>
                        }
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                        {testimonials.map((item, idx) => (
                            <Card key={item.name} className="rounded-[1.9rem] p-6 hover:shadow-premium-hover hover:scale-105 transition-all duration-300 animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
                                <div className="flex h-full flex-col gap-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, idx) => (
                                                <Star key={idx} className="h-4 w-4 fill-primary-400 text-primary-400 hover:scale-110 transition-transform" />
                                            ))}
                                        </div>
                                        <span className="font-heading text-5xl leading-none text-white/10">&quot;</span>
                                    </div>

                                    <p className="flex-grow text-sm leading-relaxed text-textSecondary">&quot;{item.quote}&quot;</p>

                                    <div className="flex items-center gap-3 border-t border-white/8 pt-5">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-500/18 bg-primary-500/12 text-sm font-semibold text-primary-200 hover:scale-110 transition-transform duration-300">
                                            {item.avatar}
                                        </div>
                                        <div>
                                            <p className="text-base font-semibold text-textPrimary">{item.name}</p>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-textSecondary">{item.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full px-4 py-12 sm:px-6 lg:px-8 lg:py-16 animate-fade-in">
                <div className="container-custom">
                    <div className="hero-frame relative overflow-hidden rounded-[2.25rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 hover:shadow-premium-hover transition-all duration-300">
                        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between animate-slide-in-left">
                            <div className="space-y-4">
                                <div className="chip w-fit hover:scale-105 transition-transform duration-300">
                                    <Globe className="h-3.5 w-3.5" />
                                    <span>{t('home.cta.ribbon')}</span>
                                </div>
                                <h2 className="max-w-2xl font-heading text-4xl font-semibold leading-none text-textPrimary sm:text-5xl">
                                    {t('home.cta.title.part1')}{' '}
                                    <span className="text-primary-400 hover:text-primary-500 transition-colors duration-300">{t('home.cta.title.highlight')}</span>
                                </h2>
                                <p className="max-w-xl text-sm leading-relaxed text-textSecondary sm:text-base">
                                    {t('home.cta.subtitle')}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row animate-slide-in-right">
                                <Link to="/auth/register">
                                    <Button size="lg" className="gap-2 hover:scale-105 hover:shadow-lg transition-all duration-300">
                                        {t('home.cta.ctaPrimary')}
                                        <MousePointer2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </Link>
                                <Link to="/auth/login">
                                    <Button variant="secondary" size="lg" className="hover:scale-105 hover:shadow-lg transition-all duration-300">
                                        {t('home.cta.ctaSecondary')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function SectionHeader({ badge, title, subtitle }) {
    return (
        <div className="mb-10 space-y-4 text-center">
            {badge ? <div className="chip mx-auto">{badge}</div> : null}
            <h2 className="font-heading text-4xl font-semibold leading-none text-textPrimary sm:text-5xl">{title}</h2>
            {subtitle ? <p className="mx-auto max-w-2xl text-sm leading-relaxed text-textSecondary sm:text-base">{subtitle}</p> : null}
        </div>
    );
}

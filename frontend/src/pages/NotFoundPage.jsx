import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Home,
    ArrowLeft,
    Search,
    Activity,
    ShieldAlert,
    Monitor,
    LifeBuoy,
    Sparkles,
    Compass,
} from 'lucide-react';
import { Button, Card, SectionTitle } from '@/components/common/UIComponents';

const quickLinks = [
    {
        icon: Search,
        title: 'Search Site',
        subtitle: 'Find what you need faster',
        accent: 'group-hover:text-sky-600 group-hover:bg-sky-50',
        iconWrap: 'group-hover:bg-sky-50',
    },
    {
        icon: Activity,
        title: 'System Status',
        subtitle: 'All systems operating normally',
        accent: 'group-hover:text-emerald-600 group-hover:bg-emerald-50',
        iconWrap: 'group-hover:bg-emerald-50',
    },
    {
        icon: LifeBuoy,
        title: 'Need Help?',
        subtitle: 'Reach support anytime',
        accent: 'group-hover:text-violet-600 group-hover:bg-violet-50',
        iconWrap: 'group-hover:bg-violet-50',
    },
];

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.20),transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] text-slate-900">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_28%)]" />
                <div
                    className="absolute inset-0 opacity-[0.12]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
                        backgroundSize: '42px 42px',
                        maskImage: 'radial-gradient(circle at center, black 45%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 90%)',
                    }}
                />

                <div className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-500/30 blur-3xl animate-pulse" />
                <div className="absolute left-1/4 top-24 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl animate-bounce" />
                <div className="absolute right-1/4 top-32 h-28 w-28 rounded-full border border-white/15 bg-white/5 backdrop-blur-xl" />
                <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16 sm:px-10 lg:px-16">
                <div className="relative w-full max-w-6xl">
                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/20 via-white/5 to-white/10 blur-2xl" />

                    <Card className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/75 p-8 shadow-2xl backdrop-blur-2xl sm:p-12 lg:p-16">
                        {/* Decorative layers */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                        <div className="absolute right-8 top-8 hidden h-32 w-32 rounded-full border border-slate-200/60 lg:block" />
                        <div className="absolute right-14 top-14 hidden h-20 w-20 rounded-full border border-slate-200/70 lg:block" />
                        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-100/60 blur-2xl" />

                        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                            {/* Left content */}
                            <div className="space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-3 rounded-full border border-red-200 bg-red-50 px-5 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-red-600 shadow-sm">
                                    <ShieldAlert className="h-4 w-4" />
                                    Page Not Found
                                </div>

                                <div className="space-y-5">
                                    <div className="relative inline-block">
                                        <div className="relative">
                                            <div className="absolute inset-0 translate-y-3 scale-105 bg-gradient-to-r from-fuchsia-500/25 via-cyan-400/25 to-indigo-500/25 blur-3xl" />
                                            <h1 className="relative bg-gradient-to-br from-white via-fuchsia-100 to-cyan-200 bg-clip-text text-8xl font-black tracking-[-0.1em] text-transparent drop-shadow-[0_10px_30px_rgba(168,85,247,0.35)] sm:text-[8rem] lg:text-[10rem]">
                                                404
                                            </h1>
                                        </div>
                                        <div className="absolute inset-x-6 bottom-2 h-5 rounded-full bg-fuchsia-400/20 blur-2xl" />
                                    </div>

                                    <SectionTitle
                                        title="Oops — this page vanished into the void"
                                        subtitle="The destination you tried to reach has moved, expired, or never existed. Let’s get you back somewhere useful."
                                        align="left"
                                        badge="HTTP Error"
                                    />
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row lg:justify-start">
                                    <Link to="/" className="w-full sm:w-auto">
                                        <Button
                                            size="lg"
                                            className="group w-full rounded-2xl bg-slate-950 px-8 py-6 text-base font-black uppercase italic tracking-wide text-white shadow-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:scale-[0.98]"
                                        >
                                            <Home className="mr-3 h-5 w-5 text-cyan-300 transition-transform duration-300 group-hover:scale-110" />
                                            Return Home
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => navigate(-1)}
                                        className="group w-full rounded-2xl border-slate-200 bg-white/80 px-8 py-6 text-base font-black uppercase italic tracking-wide text-slate-700 shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] sm:w-auto"
                                    >
                                        <ArrowLeft className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                                        Go Back
                                    </Button>
                                </div>

                                <div className="flex items-center justify-center gap-3 text-sm text-slate-500 lg:justify-start">
                                    <Sparkles className="h-4 w-4 text-fuchsia-500" />
                                    <p>
                                        Try checking the URL or use the site navigation to get back on track.
                                    </p>
                                </div>
                            </div>

                            {/* Right visual panel */}
                            <div className="relative">
                                <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.12)]">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_28%)]" />

                                    <div className="relative space-y-5">
                                        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                                                    <Compass className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">
                                                        Navigation
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        Route could not be resolved
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
                                                Safe State
                                            </span>
                                        </div>

                                        <div className="grid gap-4">
                                            {quickLinks.map((item) => {
                                                const Icon = item.icon;

                                                return (
                                                    <div
                                                        key={item.title}
                                                        className={`group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${item.accent}`}
                                                    >
                                                        <div
                                                            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-colors duration-300 ${item.iconWrap}`}
                                                        >
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
                                                                {item.title}
                                                            </p>
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {item.subtitle}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

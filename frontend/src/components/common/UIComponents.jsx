/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, AlertTriangle, CheckCircle2, Info, AlertCircle, Loader2, Check, ChevronDown,
} from 'lucide-react';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const AnimatedPageWrapper = ({ children, className }) => (
    <div className={cn('w-full h-full animate-fade-in', className)}>
        {children}
    </div>
);

export const AnimatedCard = ({ children, className, hover = true, delay = 0, ...props }) => (
    <div
        className={cn(
            'premium-card rounded-lg border border-surface-border text-textPrimary transition-all duration-300 animate-slide-up',
            hover && 'hover:-translate-y-1 hover:border-emerald/35 hover:shadow-card-hover',
            className,
        )}
        style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}
        {...props}
    >
        {children}
    </div>
);

export const DashboardStatsCard = ({ title, value, icon: Icon, trend, trendLabel, delay = 0 }) => (
    <AnimatedCard hover delay={delay} className="p-6 relative overflow-hidden group">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald/55 to-transparent" />
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl transition-transform duration-700 group-hover:scale-125" />
        <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-textSecondary">{title}</span>
                <div className="space-y-2">
                    <span className="block font-heading text-4xl font-black leading-none text-textPrimary">{value}</span>
                    {trend != null && (
                        <span className={cn('text-xs font-semibold', trend > 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {trend > 0 ? '+' : ''}{trend}%
                            {trendLabel ? <span className="ml-2 text-textSecondary">{trendLabel}</span> : null}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald/20 bg-emerald/10 text-emerald shadow-soft">
                <Icon className="h-5 w-5" />
            </div>
        </div>
    </AnimatedCard>
);

export const SectionTitle = ({ title, subtitle, badge, align = 'left', className }) => (
    <div className={cn('space-y-4 mb-8 animate-fade-in', align === 'center' && 'text-center', className)}>
        {badge ? (
            <Badge variant="info" className={cn('mb-2', align === 'center' && 'mx-auto')}>
                {badge}
            </Badge>
        ) : null}
        <h2 className="text-2xl font-heading font-black uppercase leading-tight tracking-normal text-textPrimary sm:text-3xl lg:text-4xl">{title}</h2>
        {subtitle ? (
            <p className={cn('text-sm md:text-base text-textSecondary leading-relaxed max-w-3xl', align === 'center' && 'mx-auto')}>
                {subtitle}
            </p>
        ) : null}
    </div>
);

export const PremiumTableWrapper = ({ children, className }) => (
    <div className={cn('premium-card overflow-hidden rounded-lg border border-surface-border', className)}>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">{children}</table>
        </div>
    </div>
);

export const Button = React.forwardRef(({
    className, variant = 'primary', size = 'md', loading = false, children, ...props
}, ref) => {
    const variants = {
        primary: 'bg-orange text-white shadow-soft hover:bg-emerald',
        secondary: 'bg-white text-graphite border border-emerald/25 shadow-emerald/10 hover:border-emerald hover:bg-emerald/10 hover:text-emerald',
        accent: 'bg-emerald text-white shadow-glow hover:bg-orange',
        outline: 'bg-transparent text-emerald border border-emerald/45 hover:bg-emerald/10 hover:border-emerald',
        ghost: 'bg-transparent text-textSecondary hover:bg-emerald/10 hover:text-emerald',
        danger: 'bg-red-500 text-white shadow-soft hover:bg-red-600',
        gradient: 'bg-gradient-brand text-white shadow-glow hover:brightness-105',
    };

    const sizes = {
        sm: 'min-h-8 px-3 py-1.5 text-[11px] rounded-full',
        md: 'min-h-9 px-4 py-2 text-[11px] rounded-full',
        lg: 'min-h-10 px-5 py-2.5 text-xs rounded-full',
    };

    return (
        <button
            ref={ref}
            disabled={loading || props.disabled}
            className={cn(
                'inline-flex min-w-0 items-center justify-center gap-2 text-center font-black uppercase tracking-[0.08em] transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20',
                'disabled:pointer-events-none disabled:opacity-55',
                'leading-tight hover:-translate-y-0.5 active:translate-y-0',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {children}
        </button>
    );
});
Button.displayName = 'Button';

export const Input = React.forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => (
    <div className="w-full space-y-2">
        {label ? (
            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                {label}
            </label>
        ) : null}
        <div className="group relative flex items-center">
            {Icon ? <Icon className="pointer-events-none absolute left-4 h-4.5 w-4.5 text-emerald transition-colors group-focus-within:text-orange" /> : null}
            <input
                ref={ref}
                className={cn(
                    'w-full min-h-10 rounded-lg border border-emerald/18 bg-white/95 py-2.5 text-sm font-medium text-textPrimary shadow-soft transition-all duration-300',
                    'placeholder:text-textSecondary focus:border-emerald/45 focus:outline-none focus:ring-4 focus:ring-emerald/12',
                    Icon ? 'pl-10 pr-3.5' : 'px-3.5',
                    error && 'border-red-400/60 focus:border-red-400 focus:ring-red-400/10',
                    className,
                )}
                {...props}
            />
        </div>
        {error ? <p className="ml-1 text-xs font-medium text-red-300">{error}</p> : null}
    </div>
));
Input.displayName = 'Input';

export const Badge = ({ children, variant = 'info', className }) => {
    const variants = {
        info: 'bg-emerald/10 text-emerald border-emerald/25',
        primary: 'bg-emerald/12 text-emerald border-emerald/30',
        success: 'bg-emerald/12 text-emerald border-emerald/25',
        warning: 'bg-amber-500/12 text-amber-200 border-amber-500/20',
        error: 'bg-red-500/12 text-red-300 border-red-500/20',
        neutral: 'bg-fog text-textSecondary border-emerald/12',
        cyan: 'bg-sky-500/12 text-sky-300 border-sky-500/20',
    };

    return (
        <span className={cn(
            'inline-flex items-center rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.16em]',
            variants[variant],
            className,
        )}>
            {children}
        </span>
    );
};

export const Card = ({ children, className, hover = false, ...props }) => (
    <AnimatedCard hover={hover} className={className} {...props}>
        {children}
    </AnimatedCard>
);

export const Checkbox = React.forwardRef(({ label, error, className, ...props }, ref) => (
    <div className="flex w-fit flex-col items-start gap-1.5">
        <label className={cn('inline-flex cursor-pointer items-center gap-3', className)}>
            <div className="relative flex-shrink-0">
                <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
                <div className="h-5 w-5 rounded-md border border-emerald/20 bg-white transition-all duration-200 peer-checked:border-emerald peer-checked:bg-emerald/15" />
                <Check className="absolute inset-0 h-5 w-5 scale-0 text-emerald transition-transform duration-200 peer-checked:scale-90" />
            </div>
            {label ? <span className="text-sm text-textSecondary transition-colors hover:text-textPrimary">{label}</span> : null}
        </label>
        {error ? <p className="ml-8 text-xs font-medium text-red-300">{error}</p> : null}
    </div>
));
Checkbox.displayName = 'Checkbox';

export const Switch = React.forwardRef(({ label, className, ...props }, ref) => (
    <label className={cn('inline-flex cursor-pointer items-center gap-4', className)}>
        <div className="relative flex-shrink-0">
            <input type="checkbox" ref={ref} className="peer sr-only" {...props} />
            <div className="h-6 w-12 rounded-full border border-emerald/18 bg-fog transition-colors duration-300 peer-checked:border-emerald/35 peer-checked:bg-emerald/25" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform duration-300 peer-checked:translate-x-6" />
        </div>
        {label ? <span className="text-sm text-textSecondary">{label}</span> : null}
    </label>
));
Switch.displayName = 'Switch';

export const Tooltip = ({ children, content }) => (
    <div className="group relative inline-block">
        {children}
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-lg border border-white/10 dark-surface px-4 py-2 text-[11px] font-semibold text-textPrimary opacity-0 shadow-premium transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            {content}
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-[#14532D]" />
        </div>
    </div>
);

export const Progress = ({ value, max = 100, className, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-gradient-brand',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
    };

    return (
        <div className={cn('h-2 w-full overflow-hidden rounded-full bg-emerald/10', className)}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', variants[variant])}
            />
        </div>
    );
};

export const Avatar = ({ src, name, size = 'md', className }) => {
    const sizes = { sm: 'w-8 h-8 text-[10px]', md: 'w-11 h-11 text-xs', lg: 'w-16 h-16 text-sm' };

    return (
        <div className={cn(
            'flex items-center justify-center overflow-hidden rounded-full border border-emerald/18 bg-emerald/12 font-semibold text-emerald shadow-soft',
            sizes[size],
            className,
        )}>
            {src
                ? <img src={src} alt={name} className="h-full w-full object-cover" />
                : name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
        </div>
    );
};

export const Alert = ({ children, variant = 'info', className, icon }) => {
    const variants = {
        info: 'border-primary-500/18 bg-primary-500/10 text-textPrimary',
        success: 'border-emerald-500/18 bg-emerald-500/10 text-textPrimary',
        warning: 'border-amber-500/18 bg-amber-500/10 text-textPrimary',
        error: 'border-red-500/18 bg-red-500/10 text-textPrimary',
    };
    const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle };
    const Icon = icon || icons[variant];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-start gap-4 rounded-2xl border px-5 py-4', variants[variant], className)}
        >
            {Icon ? <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" /> : null}
            <div className="text-sm leading-relaxed text-textSecondary">{children}</div>
        </motion.div>
    );
};

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-xl' }) => {
    React.useEffect(() => {
        if (!isOpen || typeof document === 'undefined') return undefined;
        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const modal = (
        <AnimatePresence>
            {isOpen ? (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center overflow-x-hidden px-3 py-3 sm:px-6 sm:py-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -10 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={typeof title === 'string' ? title : undefined}
                        className={cn(
                            'premium-panel relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-lg border border-emerald/15 sm:max-h-[calc(100dvh-3rem)]',
                            maxWidth
                        )}
                    >
                        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between gap-4 border-b border-emerald/12 bg-inherit px-5 py-4 sm:px-8 sm:py-6">
                            <h3 className="min-w-0 break-words text-xl font-heading font-black uppercase leading-tight text-textPrimary sm:text-2xl">{title}</h3>
                            <button type="button" onClick={onClose} className="shrink-0 rounded-full border border-emerald/12 p-2 text-textSecondary transition-colors hover:border-emerald/30 hover:text-emerald">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 text-textSecondary sm:px-8 sm:py-7">{children}</div>
                        {footer ? <div className="sticky bottom-0 z-10 flex flex-shrink-0 items-center justify-end gap-3 border-t border-emerald/12 bg-inherit px-5 py-4 sm:px-8 sm:py-5">{footer}</div> : null}
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );

    if (typeof document === 'undefined') return modal;
    return createPortal(modal, document.body);
};
export const Skeleton = ({ className, repeat = 1 }) => (
    <>
        {Array.from({ length: repeat }).map((_, i) => (
            <motion.div
                key={i}
                className={cn('rounded-lg bg-emerald/10', className)}
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
        ))}
    </>
);

export const EmptyState = ({ title, description, icon: Icon, action }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center space-y-6 py-20 text-center"
    >
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald/18 bg-emerald/10 text-emerald shadow-soft">
            {Icon ? <Icon className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
        </div>
        <div className="max-w-sm space-y-2">
            <h3 className="text-2xl font-heading font-black uppercase text-textPrimary">{title}</h3>
            <p className="text-sm leading-relaxed text-textSecondary">{description}</p>
        </div>
        {action || null}
    </motion.div>
);

export const Select = React.forwardRef(({ label, error, className, children, ...props }, ref) => (
    <div className="w-full space-y-2">
        {label ? (
            <label className="ml-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-textSecondary">
                {label}
            </label>
        ) : null}
        <div className="relative">
            <select
                ref={ref}
                className={cn(
                    'w-full min-h-10 appearance-none rounded-lg border border-emerald/18 bg-white/95 px-3.5 py-2.5 pr-10 text-sm font-medium text-textPrimary shadow-soft transition-all duration-300',
                    'focus:border-emerald/45 focus:outline-none focus:ring-4 focus:ring-emerald/12',
                    error && 'border-red-400/60 focus:border-red-400 focus:ring-red-400/10',
                    className,
                )}
                {...props}
            >
                {children}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald" />
        </div>
        {error ? <p className="ml-1 text-xs font-medium text-red-300">{error}</p> : null}
    </div>
));
Select.displayName = 'Select';

export const Table = ({ children, className }) => (
    <PremiumTableWrapper className={className}>{children}</PremiumTableWrapper>
);

export const PageHeader = ({ title, subtitle, badge, actions, className }) => (
    <div className={cn('hero-frame overflow-hidden rounded-lg px-5 py-7 sm:px-7', className)}>
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle title={title} subtitle={subtitle} badge={badge} className="mb-0" />
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
    </div>
);

export const Section = ({ children, className }) => (
    <section className={cn('space-y-5', className)}>{children}</section>
);

export const LoadingState = ({ label = 'Loading...', className }) => (
    <AnimatedPageWrapper className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-4', className)}>
        <Loader2 className="h-10 w-10 animate-spin text-emerald" />
        <p className="text-sm font-black uppercase tracking-[0.18em] text-textSecondary">{label}</p>
    </AnimatedPageWrapper>
);

export const ErrorState = ({ title = 'Something went wrong', description, action, className }) => (
    <Card className={cn('rounded-lg p-8 text-center', className)}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/18 bg-red-500/10 text-red-300">
            <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-heading font-black uppercase text-textPrimary">{title}</h3>
        {description ? <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-textSecondary">{description}</p> : null}
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
);



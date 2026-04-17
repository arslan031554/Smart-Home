import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Button({
    className,
    variant = 'primary',
    size = 'md',
    asChild = false,
    ...props
}) {
    const variants = {
        primary: 'bg-primary-700 text-white shadow-glow hover:bg-primary-800',
        secondary: 'bg-[#ffffff] text-primary-700 border border-primary-700 hover:bg-primary-50 hover:border-primary-800 shadow-soft',
        outline: 'bg-transparent border border-primary-700/45 text-primary-700 hover:bg-primary-50',
        ghost: 'bg-transparent text-textSecondary hover:bg-white/5 hover:text-textPrimary',
    };

    const sizes = {
        sm: 'h-10 px-4 text-xs',
        md: 'h-12 px-6 text-sm',
        lg: 'h-14 px-8 text-base',
    };

    const baseClasses = 'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5';

    return (
        <button
            className={cn(baseClasses, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function Button({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}) {
    const variants = {
        primary: 'bg-orange text-white shadow-soft hover:bg-emerald',
        secondary: 'bg-white text-graphite border border-emerald/25 hover:bg-emerald/10 hover:border-emerald shadow-soft',
        outline: 'bg-transparent border border-emerald/45 text-emerald hover:bg-emerald/10',
        ghost: 'bg-transparent text-textSecondary hover:bg-emerald/10 hover:text-emerald',
    };

    const sizes = {
        sm: 'min-h-8 px-3 py-1.5 text-[11px]',
        md: 'min-h-9 px-4 py-2 text-[11px]',
        lg: 'min-h-10 px-5 py-2.5 text-xs',
    };

    const baseClasses = 'inline-flex min-w-0 items-center justify-center rounded-md text-center font-black uppercase tracking-[0.08em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald/20 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-0.5';

    return (
        <button
            className={cn(baseClasses, variants[variant], sizes[size], className)}
            {...props}
        />
    );
}



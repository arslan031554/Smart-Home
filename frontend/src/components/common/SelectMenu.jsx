import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createPortal } from 'react-dom';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function normalizeOption(option) {
    if (Array.isArray(option)) {
        return {
            value: option[0],
            label: option[1] ?? String(option[0] ?? ''),
            description: option[2] ?? null,
        };
    }

    if (option && typeof option === 'object') {
        const value = option.value ?? option.id ?? option.code ?? '';
        return {
            value,
            label: option.label ?? option.name ?? String(value ?? ''),
            description: option.description ?? null,
        };
    }

    return {
        value: option,
        label: String(option ?? ''),
        description: null,
    };
}

function valuesEqual(left, right) {
    return String(left ?? '') === String(right ?? '');
}

const SIZE_STYLES = {
    compact: {
        button: 'min-h-[38px] rounded-full px-3 py-2 bg-white backdrop-blur-xl',
        trigger: 'text-[10px] font-black uppercase tracking-[0.14em]',
        menu: 'min-w-[156px] rounded-lg',
        option: 'px-2.5 py-2 rounded-md',
        optionLabel: 'text-[11px] font-bold',
        icon: 'h-3.5 w-3.5',
    },
    field: {
        button: 'min-h-12 rounded-lg px-4 py-3 bg-white',
        trigger: 'text-sm font-semibold',
        menu: 'w-full rounded-lg',
        option: 'px-3 py-2.5 rounded-md',
        optionLabel: 'text-sm font-semibold',
        icon: 'h-4 w-4',
    },
    fieldDense: {
        button: 'min-h-11 rounded-lg px-4 py-2.5 bg-white',
        trigger: 'text-[11px] font-black uppercase tracking-[0.12em]',
        menu: 'w-full rounded-lg',
        option: 'px-3 py-2 rounded-md',
        optionLabel: 'text-[11px] font-bold',
        icon: 'h-3.5 w-3.5',
    },
};

export default function SelectMenu({
    value,
    onChange,
    options = [],
    placeholder = null,
    icon: Icon = null,
    ariaLabel,
    className,
    buttonClassName,
    menuClassName,
    optionClassName,
    triggerLabelClassName,
    optionLabelClassName,
    align = 'left',
    size = 'field',
    fullWidth = true,
    disabled = false,
    error = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState(null);
    const styles = SIZE_STYLES[size] || SIZE_STYLES.field;

    const normalizedOptions = useMemo(() => {
        const mapped = (Array.isArray(options) ? options : []).map(normalizeOption);
        return placeholder != null ? [{ value: '', label: placeholder, description: null }, ...mapped] : mapped;
    }, [options, placeholder]);

    const selectedOption = normalizedOptions.find((option) => valuesEqual(option.value, value));
    const triggerLabel = selectedOption?.label ?? placeholder ?? '';

    useEffect(() => {
        if (!isOpen) return undefined;

        const updateMenuPosition = () => {
            const trigger = buttonRef.current;
            if (!trigger) return;

            const rect = trigger.getBoundingClientRect();
            const viewportPadding = 8;
            const desiredWidth = size === 'compact'
                ? Math.max(Math.round(rect.width), 156)
                : Math.round(rect.width);
            const maxLeft = Math.max(viewportPadding, window.innerWidth - desiredWidth - viewportPadding);
            const proposedLeft = align === 'right'
                ? rect.right - desiredWidth
                : rect.left;
            const left = Math.min(Math.max(proposedLeft, viewportPadding), maxLeft);

            setMenuStyle({
                position: 'fixed',
                top: rect.bottom + 8,
                left,
                width: desiredWidth,
                zIndex: 9999,
            });
        };

        updateMenuPosition();

        const handlePointerDown = (event) => {
            const target = event.target;
            if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [align, isOpen, size]);

    const handleSelect = (nextValue) => {
        onChange?.(nextValue);
        setIsOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={cn('relative', fullWidth && 'w-full', className)}
        >
            <button
                ref={buttonRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'group flex items-center justify-between gap-3 border border-emerald/16 text-left text-textPrimary shadow-soft transition-all duration-300',
                    'hover:border-emerald/35 hover:bg-emerald/10 focus-visible:outline-none focus-visible:ring-4',
                    fullWidth && 'w-full',
                    !error && 'focus-visible:ring-emerald/12',
                    error && 'border-red-400/60 focus-visible:ring-red-400/10',
                    disabled && 'pointer-events-none opacity-55',
                    styles.button,
                    buttonClassName,
                )}
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    {Icon ? <Icon className={cn('shrink-0 text-emerald', styles.icon)} /> : null}
                    <span
                        className={cn(
                            'truncate',
                            selectedOption ? 'text-textPrimary' : 'text-textSecondary',
                            styles.trigger,
                            triggerLabelClassName,
                        )}
                    >
                        {triggerLabel}
                    </span>
                </div>
                <ChevronDown
                    className={cn(
                        'shrink-0 text-emerald transition-transform duration-300',
                        styles.icon,
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {isOpen && menuStyle && typeof document !== 'undefined'
                ? createPortal(
                    <div
                        ref={menuRef}
                        style={menuStyle}
                        className={cn(
                            'overflow-hidden border border-emerald/18 bg-white p-1.5 shadow-2xl shadow-emerald/15 backdrop-blur-2xl',
                            styles.menu,
                            menuClassName,
                        )}
                    >
                        <div role="listbox" aria-label={ariaLabel} className="space-y-1">
                            {normalizedOptions.map((option) => {
                                const isActive = valuesEqual(option.value, value);

                                return (
                                    <button
                                        key={`${String(option.value)}-${option.label}`}
                                        type="button"
                                        role="option"
                                        aria-selected={isActive}
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            'flex w-full items-center justify-between border text-left transition-all duration-200',
                                            isActive
                                                ? 'border-emerald/24 bg-emerald/12 text-textPrimary'
                                                : 'border-transparent bg-white/0 text-textSecondary hover:border-emerald/16 hover:bg-emerald/8 hover:text-emerald',
                                            styles.option,
                                            optionClassName,
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <p className={cn('truncate', styles.optionLabel, optionLabelClassName)}>
                                                {option.label}
                                            </p>
                                            {option.description ? (
                                                <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.14em] text-textSecondary">
                                                    {option.description}
                                                </p>
                                            ) : null}
                                        </div>
                                        {isActive ? <Check className={cn('shrink-0 text-emerald', styles.icon)} /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>,
                    document.body,
                )
                : null}
        </div>
    );
}

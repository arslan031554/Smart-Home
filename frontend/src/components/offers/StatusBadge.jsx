import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

export const StatusBadge = ({ status, className }) => {
    const { t } = useTranslation();
    const statusConfig = {
        draft: { label: t('offers.statuses.draft'), color: 'bg-white/5 text-textSecondary border-white/10' },
        in_progress: { label: t('offers.statuses.inProgress'), color: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
        offer_ready: { label: t('offers.statuses.offerGenerated', 'Offer Generated'), color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
        waiting: { label: t('offers.statuses.waiting'), color: 'bg-amber-500/10 text-amber-200 border-amber-500/20' },
        ordered: { label: t('offers.statuses.ordered'), color: 'bg-primary-500/12 text-primary-200 border-primary-500/22' },
        cancelled: { label: t('offers.statuses.cancelled'), color: 'bg-red-500/10 text-red-300 border-red-500/20' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-white/5 text-textSecondary border-white/10' };

    return (
        <span className={clsx(
            'inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]',
            config.color,
            className
        )}>
            {config.label}
        </span>
    );
};

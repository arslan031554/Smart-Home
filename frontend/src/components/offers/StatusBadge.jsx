import React from 'react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { normalizeOfferStatus } from '@/constants/offerStatuses';

export const StatusBadge = ({ status, className }) => {
    const { t } = useTranslation();
    const statusConfig = {
        draft: { label: t('offers.statuses.draft'), color: 'bg-fog text-textSecondary border-emerald/12' },
        in_progress: { label: t('offers.statuses.inProgress'), color: 'bg-sky-500/10 text-sky-300 border-sky-500/20' },
        offer_generated: { label: t('offers.statuses.offerGenerated', { defaultValue: 'Offer Generated' }), color: 'bg-emerald/10 text-emerald border-emerald/24' },
        ordered: { label: t('offers.statuses.ordered'), color: 'bg-orange/12 text-orange border-orange/25' },
        cancelled: { label: t('offers.statuses.cancelled'), color: 'bg-red-500/10 text-red-300 border-red-500/20' },
    };

    const normalizedStatus = normalizeOfferStatus(status);
    const config = statusConfig[normalizedStatus] || { label: normalizedStatus, color: 'bg-fog text-textSecondary border-emerald/12' };

    return (
        <span className={clsx(
            'inline-flex max-w-full items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] leading-snug',
            config.color,
            className
        )}>
            {config.label}
        </span>
    );
};

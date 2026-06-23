import React from 'react';
import { useSelector } from 'react-redux';
import { SectionTitle, Badge, AnimatedPageWrapper } from '../../common/UIComponents';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

import DocumentsSection from './DocumentsSection';
import NotificationsStatus from './NotificationsStatus';
import OfferActions from './OfferActions';
import OfferStatusTimeline from './OfferStatusTimeline';
import { normalizeOfferStatus } from '@/constants/offerStatuses';

export default function OfferSuccessScreen() {
    const configuratorState = useSelector((state) => state.configurator);
    const { generatedOffer } = useSelector((state) => state.offers);

    const offer = generatedOffer || {};
    const offerId = offer.id ?? null;
    const offerNumber = offer.offerNumber ?? (offerId ? `Offer ${offerId.slice(0, 8)}` : '-');
    const status = normalizeOfferStatus(offer.status ?? 'offer_generated');
    const grandTotal = offer.grandTotal != null && !Number.isNaN(Number(offer.grandTotal)) ? Number(offer.grandTotal) : 0;
    const projectName = offer.project?.name ?? configuratorState.projectInfo?.name ?? 'Untitled';
    const emailSent = offer.notifications?.email ?? false;
    const smsSent = offer.notifications?.sms ?? false;

    return (
        <AnimatedPageWrapper className="mx-auto max-w-7xl space-y-14 py-10">
            <div className="space-y-6 text-center">
                <div className="relative inline-block">
                    <div className="relative z-10 mx-auto flex h-28 w-28 items-center justify-center rounded-[3rem] border-4 border-white bg-emerald-50 shadow-premium">
                        <CheckCircle2 className="h-14 w-14 text-emerald-500" />
                    </div>
                    <div className="absolute -inset-4 -z-10 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
                </div>

                <SectionTitle
                    title="Offer Generated Successfully"
                    subtitle={`Project "${projectName}" - offer compiled and ready for download.`}
                    badge="Step 08: Offer Generated"
                    className="flex flex-col items-center"
                />

                <div className="mt-4 flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap">
                    <KpiBlock label="Offer ID" value={offerNumber} mono />
                    <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                    <KpiBlock label="Record ID" value={offerId || '-'} mono />
                    <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                    <KpiBlock label="Status">
                        <Badge variant="cyan" className="border-none bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-700">
                            {status === 'draft' ? 'Draft' : status === 'offer_generated' ? 'Offer Generated' : status.replace(/_/g, ' ')}
                        </Badge>
                    </KpiBlock>
                    <div className="hidden h-10 w-px bg-slate-200 sm:block" />
                    <KpiBlock label="Grand Total (excl. VAT)">
                        <span className="text-lg font-black text-emerald-700">
                            EUR {grandTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </KpiBlock>
                </div>
            </div>

            <OfferStatusTimeline currentStatus={status} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <DocumentsSection offerId={offerId} />
                <NotificationsStatus emailSent={emailSent} smsSent={smsSent} />
            </div>

            {!offerId ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
                    If you do not see download buttons, the offer may still be saving. Open <strong>My Offers</strong> from the dashboard to view and export your offers.
                </p>
            ) : null}

            <OfferActions offerId={offerId} config={{ configuratorState }} />

            <div className="flex items-center justify-center gap-2 pt-6 text-xs font-medium uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-4 w-4" /> Secure - Offer saved to your account
            </div>
        </AnimatedPageWrapper>
    );
}

function KpiBlock({ label, value, mono, children }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            {children || (
                <span className={`max-w-[20rem] break-all rounded-xl border border-slate-200 bg-white px-5 py-2 text-center text-sm font-bold text-slate-900 shadow-sm ${mono ? 'font-mono tracking-widest' : ''}`}>
                    {value}
                </span>
            )}
        </div>
    );
}

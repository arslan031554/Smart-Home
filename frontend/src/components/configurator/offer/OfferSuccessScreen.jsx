import React from 'react';
import { useSelector } from 'react-redux';
import { SectionTitle, Badge, AnimatedPageWrapper } from '../../common/UIComponents';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

import DocumentsSection from './DocumentsSection';
import NotificationsStatus from './NotificationsStatus';
import OfferActions from './OfferActions';
import OfferStatusTimeline from './OfferStatusTimeline';

export default function OfferSuccessScreen() {
    const configuratorState = useSelector(state => state.configurator);
    const { generatedOffer } = useSelector(state => state.offers);

    const offer = generatedOffer || {};
    const offerId = offer.id ?? null;
    const offerNumber = offer.offerNumber ?? (offerId ? `Offer ${offerId.slice(0, 8)}` : '—');
    const status = offer.status ?? 'offer_ready';
    const grandTotal = offer.grandTotal != null && !Number.isNaN(Number(offer.grandTotal)) ? Number(offer.grandTotal) : 0;
    const projectName = offer.project?.name ?? configuratorState.projectInfo?.name ?? 'Untitled';
    const emailSent = offer.notifications?.email ?? false;
    const smsSent = offer.notifications?.sms ?? false;

    return (
        <AnimatedPageWrapper className="space-y-14 max-w-7xl mx-auto py-10">

            <div className="text-center space-y-6">
                <div className="relative inline-block">
                    <div className="w-28 h-28 rounded-[3rem] bg-emerald-50 border-4 border-white shadow-premium flex items-center justify-center mx-auto relative z-10">
                        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                    </div>
                    <div className="absolute -inset-4 bg-emerald-400/10 blur-3xl rounded-full -z-10 animate-pulse" />
                </div>

                <SectionTitle
                    title="Offer Generated Successfully"
                    subtitle={`Project "${projectName}" — offer compiled and ready for download.`}
                    badge="Step 08: Offer Ready"
                    className="flex flex-col items-center"
                />

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
                    <KpiBlock label="Offer" value={offerNumber} mono />
                    <div className="hidden sm:block h-10 w-px bg-slate-200" />
                    <KpiBlock label="Status">
                        <Badge variant="cyan" className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border-none">
                            {status === 'draft' ? 'Draft' : status === 'offer_ready' ? 'Offer Ready' : status.replace(/_/g, ' ')}
                        </Badge>
                    </KpiBlock>
                    <div className="hidden sm:block h-10 w-px bg-slate-200" />
                    <KpiBlock label="Grand Total (excl. VAT)">
                        <span className="text-lg font-black text-emerald-700">€{grandTotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </KpiBlock>
                </div>
            </div>

            <OfferStatusTimeline currentStatus={status} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DocumentsSection offerId={offerId} />
                <NotificationsStatus emailSent={emailSent} smsSent={smsSent} />
            </div>

            {!offerId && (
                <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    If you don’t see download buttons, the offer may still be saving. Open <strong>My Offers</strong> from the dashboard to view and export your offers.
                </p>
            )}
            <OfferActions offerId={offerId} config={{ configuratorState }} />

            <div className="flex items-center justify-center gap-2 pt-6 text-slate-400 font-medium text-xs uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" /> Secure — Offer saved to your account
            </div>
        </AnimatedPageWrapper>
    );
}

function KpiBlock({ label, value, mono, children }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            {children || (
                <span className={`text-sm font-bold text-slate-900 bg-white px-5 py-2 rounded-xl border border-slate-200 shadow-sm ${mono ? 'font-mono tracking-widest' : ''}`}>
                    {value}
                </span>
            )}
        </div>
    );
}

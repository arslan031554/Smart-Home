import React, { useState } from 'react';
import { Button } from '../../common/UIComponents';
import { FileDown, Table2, ExternalLink, LayoutDashboard, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetConfigurator } from '../../../features/configurator/configuratorSlice';
import { clearGeneratedOffer } from '../../../features/offers/offersSlice';
import api from '../../../utils/api';
import { clearStoredConfiguratorSnapshot } from '@/utils/configuratorDraftStorage';
import { useTranslation } from 'react-i18next';

export default function OfferActions({ offerId }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [exporting, setExporting] = useState(null);

    const downloadExport = async (format) => {
        if (!offerId) return;
        setExporting(format);
        try {
            const res = await api.get(`/offers/${offerId}/export/${format}`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `offer-${offerId}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } finally {
            setExporting(null);
        }
    };

    const handleViewOffer = () => {
        if (offerId) navigate(`/dashboard/offers/${offerId}`);
    };

    const handleDashboard = () => {
        dispatch(resetConfigurator());
        dispatch(clearGeneratedOffer());
        navigate('/dashboard');
    };

    const handleStartNewConfigurator = () => {
        clearStoredConfiguratorSnapshot({ keepGuestSession: true });
        dispatch(resetConfigurator());
        dispatch(clearGeneratedOffer());
        navigate('/configurator', { replace: true, state: { freshConfigurator: true } });
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 pt-12 border-t border-slate-100 mt-8">
            <Button
                onClick={() => downloadExport('pdf')}
                variant="outline"
                size="lg"
                disabled={!offerId || exporting === 'pdf'}
                className="w-full sm:w-auto h-14 px-8 gap-3 border-rose-100 text-rose-700 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs uppercase tracking-widest shadow-sm rounded-2xl transition-all"
            >
                {exporting === 'pdf' ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
                {t('offerSuccess.actions.exportPdf', { defaultValue: 'Export Proposal (PDF)' })}
            </Button>

            <Button
                onClick={() => downloadExport('excel')}
                variant="outline"
                size="lg"
                disabled={!offerId || exporting === 'excel'}
                className="w-full sm:w-auto h-14 px-8 gap-3 border-emerald-100 text-emerald-700 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300 font-bold text-xs uppercase tracking-widest shadow-sm rounded-2xl transition-all"
            >
                {exporting === 'excel' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Table2 className="w-5 h-5" />}
                {t('offerSuccess.actions.exportExcel', { defaultValue: 'Technical Export (XLSX)' })}
            </Button>

            <Button
                onClick={handleViewOffer}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 gap-3 border-primary-100 text-primary-700 bg-primary-50/30 hover:bg-primary-100 hover:border-primary-300 font-bold text-xs uppercase tracking-widest shadow-sm rounded-2xl transition-all"
            >
                <ExternalLink className="w-5 h-5" />
                {t('offerSuccess.actions.reviewOffer', { defaultValue: 'Review Offer Record' })}
            </Button>

            <Button
                size="lg"
                variant="outline"
                onClick={handleStartNewConfigurator}
                className="w-full sm:w-auto h-14 px-8 gap-3 border-sky-100 text-sky-700 bg-sky-50/30 hover:bg-sky-50 hover:border-sky-300 font-bold text-xs uppercase tracking-widest shadow-sm rounded-2xl transition-all"
            >
                <RotateCcw className="w-5 h-5" />
                {t('offerSuccess.actions.startNewConfigurator', { defaultValue: 'Start New Configurator' })}
            </Button>

            <div className="hidden lg:block h-10 w-px bg-slate-200 mx-2" />

            <Button
                size="lg"
                onClick={handleDashboard}
                className="w-full sm:w-auto h-14 px-10 gap-3 bg-slate-900 text-white hover:bg-primary-950 font-bold text-xs uppercase tracking-widest shadow-lg rounded-2xl transition-all group"
            >
                <LayoutDashboard className="w-5 h-5" />
                {t('offerSuccess.actions.returnDashboard', { defaultValue: 'Return to Dashboard' })}
                <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-black text-primary-400" />
            </Button>
        </div>
    );
}

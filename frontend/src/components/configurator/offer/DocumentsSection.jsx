import React, { useState } from 'react';
import { Card, Button } from '../../common/UIComponents';
import { FileText, Layers, Loader2 } from 'lucide-react';
import api from '../../../utils/api';
import { useTranslation } from 'react-i18next';

export default function DocumentsSection({ offerId }) {
    const { t, i18n } = useTranslation();
    const [downloading, setDownloading] = useState(null);

    const downloadExport = async (format) => {
        if (!offerId) return;
        setDownloading(format);
        try {
            const lang = (i18n?.resolvedLanguage || i18n?.language || 'en').startsWith('ro') ? 'ro' : 'en';
            const res = await api.get(`/offers/${offerId}/export/${format}?lang=${lang}`, { responseType: 'blob' });
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
            setDownloading(null);
        }
    };

    const documents = [
        { id: 'pdf', name: t('offerSuccess.documents.pdf', { defaultValue: 'Formal PDF Proposal' }), icon: FileText, type: t('offerSuccess.documents.pdfType', { defaultValue: 'Client-Facing Documentation' }), format: 'pdf', tone: 'rose' },
        { id: 'excel', name: t('offerSuccess.documents.excel', { defaultValue: 'Hardware Manifest' }), icon: Layers, type: t('offerSuccess.documents.excelType', { defaultValue: 'Technical Inventory (XLSX)' }), format: 'excel', tone: 'emerald' }
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-1">
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest">{t('offerSuccess.documents.title', { defaultValue: 'Generated Documentation' })}</h3>
                <p className="text-xs sm:text-sm text-textSecondary">{t('offerSuccess.documents.help', { defaultValue: 'Download the final proposal and the technical manifest for your records.' })}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {documents.map((doc) => (
                    <Card key={doc.id} className="p-5 sm:p-6 h-full border border-slate-200/90 shadow-soft flex flex-col justify-between rounded-2xl bg-white">
                        <div>
                            <div className="flex items-center justify-between gap-3">
                                <div className={`inline-flex items-center justify-center rounded-xl p-3 ${doc.tone === 'rose' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-primary-50 text-primary-700 border border-primary-100'}`}>
                                    <doc.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${doc.tone === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-primary-50 text-primary-700'}`}>
                                    {doc.format.toUpperCase()}
                                </span>
                            </div>
                            <h4 className="mt-3.5 text-sm sm:text-base font-bold text-textPrimary">{doc.name}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-textSecondary">{doc.type}</p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100">
                            <Button
                                size="md"
                                variant="primary"
                                onClick={() => downloadExport(doc.format)}
                                disabled={!offerId || downloading === doc.format}
                                className="w-full gap-2 rounded-xl text-xs font-bold"
                            >
                                {downloading === doc.format ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {t('offerSuccess.documents.download', { defaultValue: 'Download' })}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

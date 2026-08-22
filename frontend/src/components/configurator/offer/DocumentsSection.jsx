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
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('offerSuccess.documents.title', { defaultValue: 'Generated Documentation' })}</h3>
                <p className="mt-3 text-sm text-slate-500">{t('offerSuccess.documents.help', { defaultValue: 'Download the final proposal and the technical manifest for your records.' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                    <Card key={doc.id} className="p-8 h-full border border-slate-100 shadow-sm flex flex-col justify-between rounded-[2.5rem] bg-white">
                        <div>
                            <div className={`inline-flex items-center justify-center rounded-3xl p-4 ${doc.tone === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                <doc.icon className="w-7 h-7" />
                            </div>
                            <h4 className="mt-6 text-xl font-black text-slate-900 uppercase tracking-tight">{doc.name}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">{doc.type}</p>
                        </div>

                        <div className="mt-8">
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={() => downloadExport(doc.format)}
                                disabled={!offerId || downloading === doc.format}
                                className="w-full h-14 gap-3"
                            >
                                {downloading === doc.format ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                {t('offerSuccess.documents.download', { defaultValue: 'Download' })}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

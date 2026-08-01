import React, { useState } from 'react';
import { Card, Button } from '../../common/UIComponents';
import { FileText, Layers, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../../../utils/api';
import { useTranslation } from 'react-i18next';

export default function DocumentsSection({ offerId }) {
    const { t } = useTranslation();
    const [downloading, setDownloading] = useState(null);

    const downloadExport = async (format) => {
        if (!offerId) return;
        setDownloading(format);
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
        } catch {
            setDownloading(null);
        } finally {
            setDownloading(null);
        }
    };

    const documents = [
        { id: 'pdf', name: t('offerSuccess.documents.pdf', { defaultValue: 'Formal PDF Proposal' }), icon: FileText, type: t('offerSuccess.documents.pdfType', { defaultValue: 'Client-Facing Documentation' }), status: t('offerSuccess.documents.ready', { defaultValue: 'Ready' }), color: 'text-rose-500', bg: 'bg-rose-50', format: 'pdf' },
        { id: 'excel', name: t('offerSuccess.documents.excel', { defaultValue: 'Hardware Manifest' }), icon: Layers, type: t('offerSuccess.documents.excelType', { defaultValue: 'Technical Inventory (XLSX)' }), status: t('offerSuccess.documents.ready', { defaultValue: 'Ready' }), color: 'text-emerald-500', bg: 'bg-emerald-50', format: 'excel' }
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3 ml-2">
                <FileText className="w-5 h-5 text-primary-500" /> {t('offerSuccess.documents.title', { defaultValue: 'Generated Documentation' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documents.map((doc) => (
                    <Card key={doc.id} className="p-8 h-full border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-premium transition-all duration-300 flex flex-col justify-between rounded-[2.5rem] bg-white">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${doc.bg} rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-150 transition-transform duration-700`} />
                        <div className="relative z-10">
                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                                <div className={`p-4 ${doc.bg} rounded-2xl border border-white ${doc.color} shadow-sm transition-transform group-hover:scale-110`}>
                                    <doc.icon className="w-7 h-7" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">{doc.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{doc.type}</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{t('offerSuccess.documents.backendExport', { defaultValue: 'Backend export' })}</span>
                            <div className="flex items-center gap-2">
                                {offerId && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        disabled={downloading === doc.format}
                                        onClick={() => downloadExport(doc.format)}
                                    >
                                        {downloading === doc.format ? <Loader2 className="w-4 h-4 animate-spin" /> : t('offerSuccess.documents.download', { defaultValue: 'Download' })}
                                    </Button>
                                )}
                                <div className={`flex items-center gap-2 px-4 py-1.5 ${doc.bg} rounded-xl border border-white shadow-sm`}>
                                    <ShieldCheck className={`w-4 h-4 ${doc.color}`} />
                                    <span className={`text-[10px] font-black ${doc.color} uppercase tracking-widest leading-none`}>{doc.status}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

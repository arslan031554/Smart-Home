import React from 'react';
import { Card } from '../../common/UIComponents';
import { Mail, MessageSquare, CheckCircle2, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotificationsStatus({ emailSent, smsSent }) {
    const { t } = useTranslation();
    const notifications = [
        { id: 'email', name: t('offerSuccess.notifications.email', { defaultValue: 'Email Confirmation' }), icon: Mail, type: t('offerSuccess.notifications.emailType', { defaultValue: 'Electronic Specification Copy' }), sent: emailSent },
        { id: 'sms', name: t('offerSuccess.notifications.sms', { defaultValue: 'Mobile Link' }), icon: MessageSquare, type: t('offerSuccess.notifications.smsType', { defaultValue: 'Portable Documentation Access' }), sent: smsSent },
    ];

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-3 ml-2">
                <Activity className="w-5 h-5 text-primary-500" /> {t('offerSuccess.notifications.title', { defaultValue: 'Digital Transmission Status' })}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notifications.map((notif) => (
                    <Card key={notif.id} className="p-8 h-full border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-premium transition-all duration-300 rounded-[2.5rem] bg-white">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all border border-slate-100 shadow-sm">
                                    <notif.icon className="w-7 h-7" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-lg font-black text-slate-900 leading-tight mb-1 uppercase tracking-tight">{notif.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{notif.type}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{t('offerSuccess.notifications.service', { defaultValue: 'Transmission Service' })}</span>
                            {notif.sent ? (
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-xl border border-white shadow-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">{t('offerSuccess.notifications.dispatched', { defaultValue: 'Dispatched' })}</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-xl border border-white shadow-sm">
                                    <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">{t('offerSuccess.notifications.queued', { defaultValue: 'Queued' })}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

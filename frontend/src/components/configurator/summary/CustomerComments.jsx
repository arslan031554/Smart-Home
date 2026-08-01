import React from 'react';
import { useDispatch } from 'react-redux';
import { setComments } from '../../../features/configurator/configuratorSlice';
import { Card } from '../../common/UIComponents';
import { MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CustomerComments({ comments }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <Card className="p-5 border-none shadow-premium-sm rounded-[1.25rem] bg-white sm:p-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                    <MessageSquareText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{t('offers.detail.customerCommentsTitle')}</h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">{t('configurator.summary.customerCommentsHelp')}</p>
                </div>
            </div>

            <textarea
                value={comments || ''}
                onChange={(e) => dispatch(setComments(e.target.value))}
                rows={4}
                placeholder={t('configurator.summary.customerCommentsPlaceholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-5 py-4 text-sm text-slate-700 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all resize-none shadow-inner"
            />

            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest text-center">{t('configurator.summary.customerCommentsFooter')}</p>
        </Card>
    );
}

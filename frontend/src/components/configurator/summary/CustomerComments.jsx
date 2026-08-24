import React from 'react';
import { useDispatch } from 'react-redux';
import { setComments } from '../../../features/configurator/configuratorSlice';
import { Card } from '../../common/UIComponents';
import { MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CustomerComments({ comments, commentsEn, commentsRo }) {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                    <MessageSquareText className="w-4 h-4" />
                </div>
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('offers.detail.customerCommentsTitle', { defaultValue: 'Customer Comments' })}</h3>
                    <p className="text-[11px] text-textSecondary mt-0.5">{t('configurator.summary.customerCommentsHelp', { defaultValue: 'These comments are stored with the offer and included in the generated document.' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                    { language: 'en', value: commentsEn ?? comments ?? '' },
                    { language: 'ro', value: commentsRo ?? '' },
                ].map((field) => (
                    <label key={field.language} className="space-y-1.5">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                            {t('configurator.summary.customerCommentsLanguage', {
                                language: t(`language.${field.language}`),
                                defaultValue: 'Customer Comments ({{language}})',
                            })}
                        </span>
                        <textarea
                            value={field.value}
                            onChange={(e) => dispatch(setComments({ language: field.language, value: e.target.value }))}
                            rows={4}
                            placeholder={t(`configurator.summary.customerCommentsPlaceholder${field.language === 'ro' ? 'Ro' : ''}`, {
                                defaultValue: field.language === 'ro'
                                    ? 'Introdu comentariile clientului în limba română...'
                                    : 'Enter any customer comments to include in the offer...',
                            })}
                            className="w-full bg-[#f9faf6] border border-slate-200/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none shadow-xs"
                        />
                    </label>
                ))}
            </div>

            <p className="text-[10px] text-textSecondary mt-2 uppercase tracking-wider text-center">{t('configurator.summary.customerCommentsFooter', { defaultValue: 'The current value above will be saved into the final offer record.' })}</p>
        </Card>
    );
}

import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfferConditions() {
    const { t } = useTranslation();
    const conditions = useSelector(state => state.admin.conditions) || [];

    if (conditions.length === 0) return null;

    return (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-xs">
                    <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-textPrimary">{t('offers.detail.offerConditionsTitle', { defaultValue: 'Offer Conditions' })}</h3>
            </div>

            <div className="space-y-3">
                {conditions.map((condition, idx) => (
                    <div key={condition.id} className="flex items-start gap-3 p-3 bg-[#f9faf6] rounded-xl border border-slate-200/80">
                        <div className="w-6 h-6 rounded-md bg-primary-50 text-primary-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary-200">
                            {idx + 1}
                        </div>
                        <div>
                            <p className="text-xs sm:text-[13px] text-textSecondary leading-relaxed">{condition.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

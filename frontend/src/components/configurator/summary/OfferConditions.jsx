import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { FileText } from 'lucide-react';

export default function OfferConditions() {
    const conditions = useSelector(state => state.admin.conditions) || [];

    if (conditions.length === 0) return null;

    return (
        <Card className="p-6 border-none shadow-premium-sm">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    <FileText className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Offer Conditions</h3>
            </div>

            <div className="space-y-4">
                {conditions.map((condition, idx) => (
                    <div key={condition.id} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 leading-relaxed">{condition.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

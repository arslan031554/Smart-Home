import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '../../common/UIComponents';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerSection() {
    const disclaimers = useSelector((state) => state.admin.disclaimers) || [];

    if (disclaimers.length === 0) return null;

    return (
        <Card className="p-6 border border-amber-100 bg-amber-50/50 shadow-none rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                    <AlertCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">DISCLAIMER</h3>
            </div>

            <div className="space-y-3">
                {disclaimers.map((disclaimer) => (
                    <p key={disclaimer.id} className="text-xs text-amber-800/80 leading-relaxed">
                        {disclaimer.text}
                    </p>
                ))}
            </div>
        </Card>
    );
}

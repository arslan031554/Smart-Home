import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Modal } from '../../common/UIComponents';
import { AlertCircle, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DisclaimerSection() {
    const { t } = useTranslation();
    const disclaimers = useSelector((state) => state.admin.disclaimers) || [];
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) triggerRef.current?.focus?.();
    }, [isOpen]);

    if (disclaimers.length === 0) return null;

    const fullText = disclaimers.map((disclaimer) => disclaimer.text).filter(Boolean).join('\n\n');
    const preview = fullText.length > 420 ? `${fullText.slice(0, 420).trim()}...` : fullText;

    return (
        <>
            <Card className="p-6 border border-amber-100 bg-amber-50/50 shadow-none rounded-2xl">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-700"><AlertCircle className="w-4 h-4" /></div>
                        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider">{t('configurator.summary.disclaimer.title', { defaultValue: 'Disclaimer' })}</h3>
                    </div>
                    <Button ref={triggerRef} type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)} className="shrink-0 gap-2">
                        <BookOpen className="h-4 w-4" /> {t('configurator.summary.disclaimer.readFull', { defaultValue: 'Read Full Disclaimer' })}
                    </Button>
                </div>
                <p className="line-clamp-5 whitespace-pre-line text-xs text-amber-800/80 leading-relaxed">
                    {preview}
                </p>
            </Card>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={t('configurator.summary.disclaimer.title', { defaultValue: 'Disclaimer' })}
                maxWidth="max-w-3xl"
                footer={<Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>{t('common.close', { defaultValue: 'Close' })}</Button>}
            >
                <div className="max-h-[65dvh] space-y-4 overflow-y-auto whitespace-pre-line rounded-2xl bg-amber-50/60 p-5 text-sm leading-7 text-amber-950">
                    {fullText}
                </div>
            </Modal>
        </>
    );
}
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { clsx } from 'clsx';

export default function OfferStatusTimeline({ currentStatus }) {
    const timeline = [
        { id: 'draft', name: 'Specification Initialised' },
        { id: 'in_progress', name: 'Configuration Pending' },
        { id: 'offer_ready', name: 'Proposal Generated' },
        { id: 'waiting', name: 'Client Review' },
        { id: 'ordered', name: 'Procurement Active' },
    ];

    const getStatusIndex = (status) => timeline.findIndex(step => step.id === status);
    const currentIndex = getStatusIndex(currentStatus);

    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-6 bg-white rounded-[3rem] shadow-premium-sm border border-slate-50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center mb-12">Project Lifecycle Stage</h3>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center">
                {/* Horizontal Rule Background */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1.5 bg-slate-50 -translate-y-1/2 rounded-full" />

                {/* Vertical Rule Background (Mobile) */}
                <div className="block md:hidden absolute top-0 bottom-0 left-[15px] w-1.5 bg-slate-50 rounded-full" />

                {timeline.map((step, index) => {
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex md:flex-col items-center gap-6 md:gap-4 group mb-10 md:mb-0 w-full md:w-auto px-2">
                            {/* Connector Highlight Horizontal */}
                            {index > 0 && isCompleted && (
                                <div className="hidden md:block absolute top-1/2 right-[50%] w-[200%] h-1.5 bg-primary-600 -translate-y-1/2 rounded-full origin-left -z-10" />
                            )}
                            {/* Connector Highlight Horizontal (Active) */}
                            {index > 0 && isActive && (
                                <div className="hidden md:block absolute top-1/2 right-[50%] w-[100%] h-1.5 bg-primary-600 -translate-y-1/2 rounded-full origin-left -z-10" />
                            )}
                            
                            {/* Connector Highlight Vertical (Mobile) */}
                            {index > 0 && isCompleted && (
                                <div className="block md:hidden absolute bottom-[50%] left-[15px] h-[200%] w-1.5 bg-primary-600 -translate-x-1/2 rounded-full origin-top -z-10" />
                            )}
                            {index > 0 && isActive && (
                                <div className="block md:hidden absolute bottom-[50%] left-[15px] h-[100%] w-1.5 bg-primary-600 -translate-x-1/2 rounded-full origin-top -z-10" />
                            )}

                            <div className={clsx(
                                "w-10 h-10 rounded-2xl flex items-center justify-center border-4 bg-white transition-all duration-500 relative shrink-0",
                                isCompleted ? "border-primary-600 text-primary-600 shadow-md" 
                                    : isActive ? "border-primary-600 text-primary-600 scale-125 shadow-xl ring-8 ring-primary-600/5" 
                                        : "border-slate-100 text-slate-200"
                            )}>
                                {isCompleted || isActive ? (
                                    <CheckCircle2 className="w-5 h-5 font-black" />
                                ) : (
                                    <Circle className="w-3 h-3 text-slate-100 fill-slate-50" />
                                )}
                            </div>
                            <div className="flex flex-col md:items-center">
                                <span className={clsx(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                                    isCompleted ? "text-slate-500" : isActive ? "text-primary-600" : "text-slate-300"
                                )}>
                                    {step.name}
                                </span>
                                {isActive && <span className="text-[8px] font-bold text-primary-400 uppercase tracking-tighter mt-1 animate-pulse">Current Phase</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

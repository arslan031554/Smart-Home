import React from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from './UIComponents';
import i18n from '../../i18n';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical Runtime Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                    <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[2.5rem] shadow-premium border border-slate-100">
                        <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto animate-pulse">
                            <AlertTriangle className="w-12 h-12" />
                        </div>
                        
                        <div className="space-y-4">
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{i18n.t('errors.systemTitle', { defaultValue: 'System Interruption' })}</h1>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                {i18n.t('errors.systemBody', { defaultValue: 'A critical error occurred while processing the application logic. Our engineers have been notified.' })}
                            </p>
                            {import.meta.env.DEV && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left overflow-auto max-h-40">
                                    <p className="text-[10px] font-mono text-red-600 break-all">
                                        {this.state.error?.toString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button 
                                variant="primary" 
                                className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" /> 
                                {i18n.t('errors.recover', { defaultValue: 'Attempt Recovery' })}
                            </Button>
                            <Button 
                                variant="ghost" 
                                className="w-full text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900"
                                onClick={() => window.location.href = '/'}
                            >
                                <Home className="w-4 h-4 mr-2" /> 
                                {i18n.t('errors.returnHome', { defaultValue: 'Return Home' })}
                            </Button>
                        </div>

                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            {i18n.t('errors.logReference', { reference: `ERR_${Math.random().toString(36).substr(2, 9).toUpperCase()}`, defaultValue: 'Error Log Ref: {{reference}}' })}
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

/**
 * Functional component for React Router's errorElement
 */
export function RootErrorPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
             <div className="max-w-md w-full text-center space-y-8 bg-white p-12 rounded-[2.5rem] shadow-premium border border-slate-100">
                <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto">
                    <AlertTriangle className="w-12 h-12" />
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{i18n.t('errors.accessTitle', { defaultValue: 'Access Error' })}</h1>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        {i18n.t('errors.accessBody', { defaultValue: 'The requested path could not be resolved or encountered a routing failure.' })}
                    </p>
                </div>

                <Button 
                    variant="primary" 
                    className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
                    onClick={() => window.location.href = '/'}
                >
                    <Home className="w-4 h-4 mr-2" /> 
                    {i18n.t('errors.secureArea', { defaultValue: 'Back to Secure Area' })}
                </Button>
            </div>
        </div>
    );
}

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNewsletterSubscribers } from '../features/admin/adminSlice';
import { AnimatedPageWrapper, Card, SectionTitle, Badge } from '../components/common/UIComponents';
import { Mail, Calendar, Search, Loader2 } from 'lucide-react';

export default function NewsletterManagement() {
    const dispatch = useDispatch();
    const { newsletterSubscribers, loading, error } = useSelector((state) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchNewsletterSubscribers());
    }, [dispatch]);

    const filteredSubscribers = (newsletterSubscribers || []).filter((sub) =>
        String(sub.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AnimatedPageWrapper className="space-y-8 pb-20">
            <div className="bg-white border border-gray-200 shadow-sm relative rounded-sm p-5 sm:p-6 mb-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="!rounded-sm !text-[10px] !py-1 !px-2.5 uppercase font-bold tracking-widest text-primary-600 bg-primary-50">
                                    Admin Directory
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                                Newsletter Subscriptions
                            </h1>
                            <p className="text-sm leading-relaxed text-textSecondary mt-1.5">
                                Monitor newsletter subscribers collected from public site forms.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 mb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full xl:w-[32rem]">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-sm border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors duration-200 shadow-sm"
                        />
                    </div>
                    <Badge variant="neutral" className="!rounded-sm bg-gray-100 border-gray-200 text-gray-700 shadow-sm">
                        {filteredSubscribers.length} subscribers
                    </Badge>
                </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-sm mb-6">
                {loading ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                        <p className="text-sm font-bold uppercase tracking-[0.22em] text-textSecondary">Loading subscribers...</p>
                    </div>
                ) : error ? (
                    <div className="border border-red-200 bg-red-50 p-5 text-center text-sm font-medium text-red-600">
                        {error}
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-primary-500/20 bg-primary-50 text-primary-600 shadow-sm">
                            <Mail className="h-5 w-5" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800">No subscribers found</h3>
                        <p className="mt-2 max-w-sm text-sm text-gray-500">Newsletter signups will appear here when users subscribe.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">Email</th>
                                    <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">Source</th>
                                    <th className="px-5 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-textSecondary">Subscribed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSubscribers.map((sub, index) => (
                                    <tr key={`${sub.email || 'subscriber'}-${index}`} className="transition-colors hover:bg-gray-50">
                                        <td className="px-5 py-4 font-bold text-gray-800">
                                            {sub.email || 'N/A'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <Badge variant={sub.source === 'footer' ? 'success' : 'info'} className="!rounded-sm shadow-sm">
                                                {sub.source || 'Website'}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-4 text-right text-gray-600 font-medium">
                                            <span className="inline-flex items-center justify-end gap-2">
                                                <Calendar size={14} className="text-primary-500" />
                                                {formatDate(sub.subscribedAt)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AnimatedPageWrapper>
    );
}

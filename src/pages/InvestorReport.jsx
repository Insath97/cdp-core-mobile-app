import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    TrendingUp,
    Users,
    Printer,
    BarChart3,
    Calendar,
    ArrowUpRight,
    DollarSign,
    Target,
    Briefcase,
    Loader,
    ShieldCheck,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    Download,
    Building2
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useReport } from '../context/ReportContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const InvestorReport = () => {
    const {
        investorMaturityData,
        investorMaturityPagination,
        isLoading,
        getInvestorMaturityReport
    } = useReport();

    const [searchTerm, setSearchTerm] = useState('');
    const [periodKey, setPeriodKey] = useState(new Date().toISOString().slice(0, 7));
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    useEffect(() => {
        getInvestorMaturityReport({
            search: searchTerm,
            period: periodKey,
            page: 1
        });
    }, [periodKey]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getInvestorMaturityReport({
                search: searchTerm,
                period: periodKey,
                page: 1
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Helper function to format currency for CSV (same logic as formatCurrency)
    const formatCurrencyForCSV = (amount) => {
        if (amount === null || amount === undefined) return '';
        const num = parseFloat(amount || 0);
        // Same logic: if not integer, use Math.ceil
        const finalNum = num % 1 !== 0 ? Math.ceil(num) : num;
        return finalNum.toString();
    };

    const handleExportCSV = async () => {
        setIsGenerating(true);
        try {
            // First fetch ALL matching data using a high per_page value
            const response = await axiosInstance.get('/reports/investor-maturity', {
                params: {
                    search: searchTerm,
                    period: periodKey,
                    per_page: 10000 // High limit to ignore pagination for the export
                }
            });

            const allData = response.data?.data?.data || [];
            if (allData.length === 0) {
                toast.error('No data to export');
                return;
            }

            // Find maximum number of payout schedule years across all investments
            const maxPayouts = Math.max(
                ...allData.map(inv => inv.payout_schedule?.length || 0)
            );

            // Build headers
            const baseHeaders = [
                'Investor Name',
                'Policy Number',
                'Plan',
                'Investment Date',
                'Investment Amount (Rs)',
                'Duration (Months)',
                'Monthly Maturity (Rs)',
                'Total Interest (Rs)',
                'Total Maturity (Rs)',
                'Branch',
                'Status'
            ];

            // Add payout headers for each year/period
            const payoutHeaders = [];
            for (let i = 1; i <= maxPayouts; i++) {
                payoutHeaders.push(
                    `Payout ${i} Year`,
                    `Payout ${i} Monthly Amount (Rs)`,
                    `Payout ${i} Yearly Total (Rs)`,
                    `Payout ${i} Duration (Months)`
                );
            }

            const headers = [...baseHeaders, ...payoutHeaders];

            // Build rows
            const rows = [headers.join(',')];

            allData.forEach(inv => {
                // Base data
                const baseData = [
                    `"${inv.customer_name || ''}"`,
                    `"${inv.policy_number || ''}"`,
                    `"${inv.plan || ''}"`,
                    inv.invest_date || '',
                    formatCurrencyForCSV(inv.investment_amount),
                    inv.duration_months || '',
                    formatCurrencyForCSV(inv.monthly_maturity),
                    formatCurrencyForCSV(inv.total_interest),
                    formatCurrencyForCSV(inv.total_maturity),
                    `"${inv.branch || ''}"`,
                    `"${inv.status || ''}"`
                ];

                // Add payout data
                const payouts = inv.payout_schedule || [];
                const payoutData = [];

                for (let i = 0; i < maxPayouts; i++) {
                    if (i < payouts.length) {
                        payoutData.push(
                            payouts[i].year || '',
                            formatCurrencyForCSV(payouts[i].monthly_payout),
                            formatCurrencyForCSV(payouts[i].yearly_total),
                            payouts[i].duration_months || ''
                        );
                    } else {
                        payoutData.push('', '', '', '');
                    }
                }

                rows.push([...baseData, ...payoutData].join(','));
            });

            // Create and download CSV
            const csvContent = rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Investor_Maturity_Report_${periodKey}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Report exported successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handlePageChange = (page) => {
        getInvestorMaturityReport({
            search: searchTerm,
            period: periodKey,
            page
        });
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Investor Maturity Report</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                        View paying amounts and investor maturity analytics
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={investorMaturityData.length === 0 || isGenerating}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Download size={16} />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center gap-4 text-left">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by investor name, ID or plan..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full sm:w-64 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                    <input
                        type="month"
                        className="w-full pl-11 pr-4 py-3 bg-primary-50/50 dark:bg-primary-900/10 text-primary-600 border border-primary-100/50 dark:border-primary-900/20 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                        value={periodKey}
                        onChange={(e) => setPeriodKey(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Building2 size={24} className="text-primary-600 animate-pulse" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="w-10 px-4 py-4"></th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Investor & Policy</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Investment Plan</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Investment Amount(Rs.)</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Total Maturity</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {investorMaturityData.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <BarChart3 size={24} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">No Data Found</h3>
                                            <p className="text-xs text-gray-500">No report records matched your query.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                investorMaturityData.map((inv) => (
                                    <React.Fragment key={inv.id}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer" onClick={() => toggleRow(inv.id)}>
                                            <td className="px-4 py-4 text-center">
                                                {expandedRows.has(inv.id) ? (
                                                    <ChevronUp size={16} className="text-primary-600" />
                                                ) : (
                                                    <ChevronDown size={16} className="text-gray-400 group-hover:text-primary-600" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                                                        <Users size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                                                            {inv.customer_name}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <ShieldCheck size={10} className="text-primary-500" />
                                                            {inv.policy_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                    {inv.plan}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-medium">
                                                    Inv: {inv.invest_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(inv.investment_amount)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-black text-gray-900 dark:text-white">
                                                    {formatCurrency(inv.total_maturity)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                                                    inv.status === 'approved' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                                                        inv.status === 'pending' ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20" :
                                                            "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                                                )}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedRows.has(inv.id) && (
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 animate-in slide-in-from-top-2 duration-300">
                                                <td colSpan={6} className="px-10 py-6">
                                                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                                                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays size={14} className="text-primary-600" />
                                                                <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Payout Schedule ({inv.plan})</span>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                Total Interest: {formatCurrency(inv.total_interest)}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-gray-100 dark:divide-gray-800">
                                                            {inv.payout_schedule?.map((item, idx) => (
                                                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center text-[10px] font-black">
                                                                            {item.year === 0 ? 'M' : `Y${item.year}`}
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs font-bold text-gray-900 dark:text-white uppercase">
                                                                                {item.year === 0 ? 'Monthly Payout' : `Year ${item.year} Payout`}
                                                                            </div>
                                                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                                                {item.duration_months} Months
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-[10px] font-bold text-gray-400 uppercase">Monthly</div>
                                                                        <div className="text-sm font-bold text-emerald-600">
                                                                            {formatCurrency(item.monthly_payout)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {investorMaturityPagination && investorMaturityPagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-b-2xl border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                            Displaying <span className="text-primary-600 font-bold">{investorMaturityData.length}</span> of <span className="text-primary-600 font-bold">{investorMaturityPagination.total}</span> Records
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto justify-center sm:justify-end">
                            {investorMaturityPagination.links?.map((link, idx) => {
                                const isPrev = link.label.includes('Previous');
                                const isNext = link.label.includes('Next');
                                const isEllipsis = link.label === '...';

                                let label = link.label;
                                if (isPrev) label = '&laquo; Previous';
                                if (isNext) label = 'Next &raquo;';

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (isPrev) handlePageChange(investorMaturityPagination.current_page - 1);
                                            else if (isNext) handlePageChange(investorMaturityPagination.current_page + 1);
                                            else if (!isEllipsis) handlePageChange(parseInt(link.label));
                                        }}
                                        disabled={!link.url || link.active || isEllipsis}
                                        className={cn(
                                            "px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                            link.active
                                                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                                                : !link.url || isEllipsis
                                                    ? "text-gray-200 cursor-not-allowed"
                                                    : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvestorReport;
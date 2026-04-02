import React, { useState, useEffect } from 'react';
import {
    Search,
    Users,
    Printer,
    BarChart3,
    Calendar,
    Loader,
    ShieldCheck,
    ArrowRight,
    ChevronDown,
    ChevronUp,
    CalendarDays,
    DollarSign,
    TrendingUp,
    Download,
    Building2
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useReport } from '../context/ReportContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const InvestmentMaturityReport = () => {
    const {
        investmentMaturityData,
        investmentMaturityPagination,
        isLoading,
        getInvestmentMaturityReport
    } = useReport();

    const [searchTerm, setSearchTerm] = useState('');
    const [periodKey, setPeriodKey] = useState(new Date().toISOString().slice(0, 7));
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        getInvestmentMaturityReport({
            search: searchTerm,
            period: periodKey,
            page: 1
        });
    }, [periodKey]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            getInvestmentMaturityReport({
                search: searchTerm,
                period: periodKey,
                page: 1
            });
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Helper function to format currency for CSV (same logic as formatCurrency but without Rs symbol and spaces)
    const formatCurrencyForCSV = (amount) => {
        if (amount === null || amount === undefined) return '';
        const num = parseFloat(amount || 0);
        // Same logic: if not integer, use Math.ceil
        const finalNum = num % 1 !== 0 ? Math.ceil(num) : num;
        // Return as string without thousand separators for CSV
        return finalNum.toString();
    };

    // Helper function to format date to short format (YYYY-MM-DD)
    const formatDateForCSV = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            // Format as YYYY-MM-DD
            return date.toISOString().split('T')[0];
        } catch (error) {
            return dateString;
        }
    };

    const handleExportCSV = async () => {
        setIsGenerating(true);
        try {
            // First fetch ALL matching data using a high per_page value
            const response = await axiosInstance.get('/investments/maturity-report', {
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

            // Find maximum number of payouts across all investments
            const maxPayouts = Math.max(
                ...allData.map(inv => inv.detailed_payout_schedule?.length || 0)
            );

            // Build headers dynamically
            const baseHeaders = [
                'Investor Name', 'Policy Number', 'Plan', 'Investment Date', 'Investment Amount (Rs)',
                'Duration (Months)', 'Monthly Maturity (Rs)', 'Total Interest (Rs)', 'Total Maturity (Rs)', 'Branch', 'Status'
            ];

            // Add payout headers for each payout
            const payoutHeaders = [];
            for (let i = 1; i <= maxPayouts; i++) {
                payoutHeaders.push(`Payout ${i} Month`, `Payout ${i} Year`, `Payout ${i} Amount (Rs)`, `Payout ${i} Date`);
            }

            const headers = [...baseHeaders, ...payoutHeaders];
            const rows = [headers.join(',')];

            allData.forEach(inv => {
                const formatNumber = (value) => {
                    if (!value && value !== 0) return '';
                    const num = parseFloat(value);
                    const finalNum = num % 1 !== 0 ? Math.ceil(num) : num;
                    return finalNum.toString();
                };

                const rowData = [
                    `"${inv.customer_name || ''}"`, `"${inv.policy_number || ''}"`, `"${inv.plan || ''}"`,
                    inv.invest_date || '', formatNumber(inv.investment_amount), inv.duration_months || '',
                    formatNumber(inv.monthly_maturity), formatNumber(inv.total_interest), formatNumber(inv.total_maturity),
                    `"${inv.branch || ''}"`, `"${inv.status || ''}"`
                ];

                const payouts = inv.detailed_payout_schedule || [];
                for (let i = 0; i < maxPayouts; i++) {
                    if (i < payouts.length) {
                        rowData.push(`"${payouts[i].month || ''}"`, payouts[i].year || '', formatNumber(payouts[i].payout_amount), payouts[i].date || '');
                    } else {
                        rowData.push('', '', '', '');
                    }
                }
                rows.push(rowData.join(','));
            });

            const csvContent = rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Maturity_Report_${periodKey}.csv`);
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

    const handlePageChange = (page) => {
        getInvestmentMaturityReport({
            search: searchTerm,
            period: periodKey,
            page
        });
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Maturity Payout Report</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                        Detailed investment maturity and monthly payout schedules
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        disabled={investmentMaturityData.length === 0 || isGenerating}
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
                        placeholder="Search by investor name, ID or policy..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
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
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Plan & Duration</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Investment</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Monthly Payout</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {investmentMaturityData.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <BarChart3 size={32} className="mb-2 opacity-20" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                investmentMaturityData.map((inv) => (
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
                                                <div className="text-[10px] text-gray-400 font-medium tracking-tight">
                                                    {inv.duration_months} Months • Started {inv.invest_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(inv.investment_amount)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                    Principal
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm font-bold text-primary-600">
                                                    {formatCurrency(inv.monthly_maturity)}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                    Monthly
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
                                            <tr className="bg-white dark:bg-gray-950">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays size={14} className="text-primary-600" />
                                                                <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Detailed Payout Schedule</span>
                                                            </div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                Total: Rs {formatCurrency(inv.total_maturity)} Maturity
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y divide-gray-100 dark:divide-gray-800">
                                                            {inv.detailed_payout_schedule?.map((item, idx) => (
                                                                <div key={idx} className="p-4 flex flex-col gap-1 hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase">{item.month} {item.year}</span>
                                                                        <span className="text-[9px] font-bold text-gray-400 uppercase">#{idx + 1}</span>
                                                                    </div>
                                                                    <div className="text-sm font-black text-primary-600">
                                                                        Rs {formatCurrency(item.payout_amount)}
                                                                    </div>
                                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                                                        Due: {item.date}
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
                {investmentMaturityPagination && investmentMaturityPagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-b-2xl border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                            Displaying <span className="text-primary-600 font-bold">{investmentMaturityData.length}</span> of <span className="text-primary-600 font-bold">{investmentMaturityPagination.total}</span> Records
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto justify-center sm:justify-end">
                            {investmentMaturityPagination.links?.map((link, idx) => {
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
                                            if (isPrev) handlePageChange(investmentMaturityPagination.current_page - 1);
                                            else if (isNext) handlePageChange(investmentMaturityPagination.current_page + 1);
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

export default InvestmentMaturityReport;
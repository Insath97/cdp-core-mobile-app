import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    TrendingUp,
    Users,
    FileText,
    Calendar,
    ChevronDown,
    Printer,
    Target,
    Award,
    PieChart,
    ArrowUpRight,
    Search as SearchIcon,
    Briefcase,
    Building2,
    Clock,
    Loader2,
    Download,
    ShieldCheck
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useReport } from '../context/ReportContext';
import { useInvestment } from '../context/InvestmentContext';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const UsersReport = () => {
    const {
        agentPerformanceData,
        agentPerformancePagination: pagination,
        isLoading,
        getAgentPerformanceReport
    } = useReport();

    const { investments } = useInvestment();

    const [periodKey, setPeriodKey] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const periodKeys = useMemo(() => {
        const periods = [];
        const date = new Date();
        for (let i = 0; i < 24; i++) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            periods.push({
                value: key,
                label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }
        return periods;
    }, []);

    const fetchReport = (page = 1) => {
        getAgentPerformanceReport({
            period_key: periodKey,
            search: searchTerm,
            page
        });
    };

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        fetchReport(page);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReport(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [periodKey, searchTerm]);

    // Helper function to format currency for CSV (same logic as formatCurrency)
    const formatCurrencyForCSV = (amount) => {
        if (amount === null || amount === undefined) return '';
        const num = parseFloat(amount || 0);
        const finalNum = num % 1 !== 0 ? Math.ceil(num) : num;
        return finalNum.toString();
    };

    const handleExportCSV = async () => {
        setIsGenerating(true);
        try {
            // First fetch ALL matching data using a high per_page value
            const response = await axiosInstance.get('/reports/agent-performance', {
                params: {
                    period_key: periodKey,
                    search: searchTerm,
                    per_page: 10000 // High limit to ignore pagination for the export
                }
            });

            const allData = response.data?.data;

            if (!allData) {
                toast.error('No data to export');
                return;
            }

            const agentInfo = allData.agent_info || {};
            const customers = allData.customer_details || [];

            // Create rows array for CSV
            const rows = [];

            // Add header row - removed Monthly Maturity and Monthly BR
            const headers = [
                'Agent Name',
                'Agent ID',
                'Branch',
                'Target Amount (Rs)',
                'Achieved Amount (Rs)',
                'Achievement Percentage (%)',
                'Total Commission (Rs)',
                'Customer Name',
                'Investment Date',
                'Plan',
                'Period (Months)',
                'Investment Amount (Rs)',
                'Total Maturity (Rs)'
            ];
            rows.push(headers.join(','));

            // If no customers, still show agent summary with empty customer fields
            if (customers.length === 0) {
                const row = [
                    `"${agentInfo.name || 'N/A'}"`,
                    `"${agentInfo.id_number || 'N/A'}"`,
                    `"${agentInfo.branch || 'N/A'}"`,
                    formatCurrencyForCSV(agentInfo.target_amount),
                    formatCurrencyForCSV(agentInfo.achieved_amount),
                    agentInfo.achievement_percentage || 0,
                    formatCurrencyForCSV(agentInfo.total_commission),
                    '', '', '', '', '', ''
                ];
                rows.push(row.join(','));
            } else {
                // Create a row for each customer with agent details repeated
                customers.forEach(customer => {
                    const row = [
                        `"${agentInfo.name || 'N/A'}"`,
                        `"${agentInfo.id_number || 'N/A'}"`,
                        `"${agentInfo.branch || 'N/A'}"`,
                        formatCurrencyForCSV(agentInfo.target_amount),
                        formatCurrencyForCSV(agentInfo.achieved_amount),
                        agentInfo.achievement_percentage || 0,
                        formatCurrencyForCSV(agentInfo.total_commission),
                        `"${customer.customer_name || ''}"`,
                        customer.invest_date || '',
                        `"${customer.plan || ''}"`,
                        customer.period || '',
                        formatCurrencyForCSV(customer.investment_amount),
                        formatCurrencyForCSV(customer.total_maturity)
                    ];
                    rows.push(row.join(','));
                });
            }

            // Create and download CSV
            const csvContent = rows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Agent_Performance_Report_${periodKey}.csv`);
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

    const agentInfo = agentPerformanceData?.agent_info;
    const customerDetails = agentPerformanceData?.customer_details || [];
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="animate-in fade-in duration-500 space-y-8 pb-10 text-left">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Agent Performance report</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Detailed breakdown of quotas and achievements</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={!agentPerformanceData || isGenerating}
                    className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Download size={16} />
                    )}
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-end gap-4 text-left">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-black tracking-widest ml-1 text-gray-400 uppercase">Search Agent</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search by agent name..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-xl text-sm font-bold transition-all outline-none dark:text-white placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full md:w-64 space-y-2">
                    <label className="text-[10px] font-black tracking-widest ml-1 text-gray-400 uppercase">Target Period</label>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={16} />
                        <select
                            value={periodKey}
                            onChange={(e) => setPeriodKey(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-primary-50/30 dark:bg-primary-900/10 text-primary-600 border border-primary-100 dark:border-primary-900/20 rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none cursor-pointer uppercase"
                        >
                            {periodKeys.map(key => (
                                <option key={key.value} value={key.value}>{key.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-600 pointer-events-none" size={14} />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 size={24} className="text-primary-600 animate-pulse" />
                        </div>
                    </div>
                </div>
            ) : agentInfo ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                    <th className="w-10 px-4 py-4"></th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Agent Details</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center whitespace-nowrap">Branch</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Target</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Achieved</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Progress</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Commission</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <tr
                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-pointer"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    <td className="px-4 py-4 text-center">
                                        {isExpanded ? (
                                            <ChevronDown size={16} className="text-primary-600 rotate-180 transition-transform" />
                                        ) : (
                                            <ChevronDown size={16} className="text-gray-400 group-hover:text-primary-600 transition-transform" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                                                <Users size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-tight">
                                                    {agentInfo.name}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                                    ID: {agentInfo.id_number}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <div className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                <Building2 size={10} />
                                                {agentInfo.branch}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-xs font-black text-gray-900 dark:text-white">
                                            {formatCurrency(agentInfo.target_amount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-xs font-black text-emerald-600">
                                            {formatCurrency(agentInfo.achieved_amount)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1.5">
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-xs font-black text-gray-900 dark:text-white">{agentInfo.achievement_percentage}</span>
                                                <span className="text-[9px] font-bold text-gray-400">%</span>
                                            </div>
                                            <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min(parseFloat(agentInfo.achievement_percentage), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg text-xs font-black inline-block">
                                            {formatCurrency(agentInfo.total_commission)}
                                        </div>
                                    </td>
                                </tr>

                                {/* Expandable Region */}
                                {isExpanded && (
                                    <tr className="bg-gray-50/30 dark:bg-gray-800/10 animate-in slide-in-from-top-2 duration-300">
                                        <td colSpan={7} className="px-8 py-6">
                                            <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                                <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                                            <Briefcase size={16} />
                                                        </div>
                                                        <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">Investment Portfolio Breakdown</h3>
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {customerDetails.length} Investments
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="bg-gray-50/30 dark:bg-gray-800/20">
                                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Invest Date</th>
                                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Period</th>
                                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Investment</th>
                                                                <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Total Maturity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                                            {customerDetails.map((row, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                                                    <td className="px-6 py-4">
                                                                        <div className="text-xs font-bold text-gray-900 dark:text-white uppercase leading-tight">{row.customer_name}</div>
                                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                                                            <ShieldCheck size={10} className="text-primary-500" />
                                                                            {row.policy_number}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{row.invest_date}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4">
                                                                        <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">{row.plan}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <span className="text-[10px] font-bold text-gray-900 dark:text-white">{row.period}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right font-bold text-xs text-gray-900 dark:text-white">
                                                                        {formatCurrency(row.investment_amount)}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right font-bold text-xs text-emerald-600">
                                                                        {formatCurrency(row.total_maturity)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {customerDetails.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 border-t border-gray-100 dark:border-gray-800">
                            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300 mb-4 transition-colors">
                                <FileText size={48} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                            <p className="text-sm text-gray-500 max-w-[250px] mt-2 text-center uppercase font-bold">No investment logs found for this agent in the selected period.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <SearchIcon size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Search for Agent Performance</h3>
                    <p className="text-sm text-gray-500 max-w-[300px] mt-2 text-center font-bold uppercase">Enter an agent name or ID number to retrieve their detailed monthly performance metrics.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Displaying <span className="text-primary-600 font-bold">{customerDetails.length}</span> of <span className="text-primary-600 font-bold">{pagination.total}</span> Investments
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto justify-center sm:justify-end">
                        {pagination.links?.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePageChange(link.url)}
                                disabled={!link.url || link.active}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                    link.active
                                        ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                                        : !link.url
                                            ? "text-gray-200 cursor-not-allowed"
                                            : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersReport;
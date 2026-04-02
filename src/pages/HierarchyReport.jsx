import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    BarChart3,
    Calendar,
    Printer,
    Download,
    TrendingUp,
    FileText,
    Users,
    ChevronDown,
    Target,
    Building2
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';
import { useReport } from '../context/ReportContext';
import axiosInstance from '../api/axiosInstance';

const HierarchyReport = () => {
    const { hierarchyReportData: reportData, hierarchyPagination: pagination, isLoading, getHierarchyReport } = useReport();

    // Current month/year default
    const [periodKey, setPeriodKey] = useState(new Date().toISOString().slice(0, 7));
    const [searchTerm, setSearchTerm] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getHierarchyReport({
            period_key: periodKey,
            search: searchTerm,
            page
        });
    };

    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            getHierarchyReport({
                period_key: periodKey,
                search: searchTerm,
                page: 1 // Reset to page 1 when search or period changes
            });
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, periodKey]);

    const handlePrint = async () => {
        setIsGenerating(true);
        try {
            // Fetch ALL data for the current filters
            const response = await axiosInstance.get('/reports/hierarchy', {
                params: {
                    period_key: periodKey,
                    search: searchTerm,
                    per_page: 5000 // Large number to get all records
                }
            });

            const allData = response.data?.data?.data || [];

            // Debug: Log the first item to see its structure
            if (allData.length > 0) {
                console.log('First item structure:', allData[0]);
                console.log('All keys in first item:', Object.keys(allData[0]));
            }

            if (allData.length === 0) {
                toast.error('No data to print');
                return;
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                toast.error('Please allow pop-ups to print');
                return;
            }

            printWindow.document.title = `Hierarchy-Report-${periodKey}`;

            const reportRowsHTML = allData.map((row, index) => {
                // Try multiple possible property names for ID info
                const idType = row.id_type || row.idType || row.id_type_name || row.id_type_label || '';
                const idNumber = row.id_number || row.idNumber || row.id_no || row.idNo || row.id_number_value || '';

                // Also check if ID info is nested in another object
                let finalIdType = idType;
                let finalIdNumber = idNumber;

                // If row has a 'user' or 'consultant' object, check there too
                if (row.user) {
                    finalIdType = finalIdType || row.user.id_type || row.user.idType || '';
                    finalIdNumber = finalIdNumber || row.user.id_number || row.user.idNumber || '';
                }
                if (row.consultant) {
                    finalIdType = finalIdType || row.consultant.id_type || row.consultant.idType || '';
                    finalIdNumber = finalIdNumber || row.consultant.id_number || row.consultant.idNumber || '';
                }

                // Format ID display
                let idDisplay = '';
                if (finalIdType && finalIdNumber) {
                    idDisplay = `
                        <div style="margin-bottom: 4px;">
                            <span style="display: inline-block; background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #374151;">
                                ${finalIdType.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div style="font-size: 11px; font-weight: 500; color: #1F2937;">
                            ${finalIdNumber}
                        </div>
                    `;
                } else if (finalIdType) {
                    idDisplay = `
                        <div style="margin-bottom: 4px;">
                            <span style="display: inline-block; background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #374151;">
                                ${finalIdType.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <div style="font-size: 11px; color: #9CA3AF;">
                            Not provided
                        </div>
                    `;
                } else if (finalIdNumber) {
                    idDisplay = `
                        <div style="margin-bottom: 4px;">
                            <span style="display: inline-block; background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #374151;">
                                ID
                            </span>
                        </div>
                        <div style="font-size: 11px; font-weight: 500; color: #1F2937;">
                            ${finalIdNumber}
                        </div>
                    `;
                } else {
                    idDisplay = `
                        <div style="color: #9CA3AF; font-size: 11px; font-style: italic;">
                            No ID information
                        </div>
                    `;
                }

                // Get name and username from possible locations
                const name = row.name || row.full_name || row.user?.name || row.consultant?.name || row.username || 'N/A';
                const username = row.username || row.user?.username || row.consultant?.username || '';

                return `
                    <tr>
                        <td style="text-align: left; padding: 12px 10px; border: 1px solid #E5E7EB;">
                            <div style="font-weight: bold; font-size: 13px; color: #111827;">${name}</div>
                            ${username ? `<div style="font-size: 10px; color: #6B7280; margin-top: 2px;">${username}</div>` : ''}
                        </td>
                        <td style="text-align: left; padding: 12px 10px; border: 1px solid #E5E7EB;">
                            ${idDisplay}
                        </td>
                        <td style="text-align: right; padding: 12px 10px; border: 1px solid #E5E7EB; font-weight: 500;">${formatCurrency(row.target_amount || row.target || 0)}</td>
                        <td style="text-align: right; padding: 12px 10px; border: 1px solid #E5E7EB; font-weight: 500;">${formatCurrency(row.achieved_amount || row.achieved || row.achievement || 0)}</td>
                        <td style="text-align: center; padding: 12px 10px; border: 1px solid #E5E7EB; color: #01562B; font-weight: bold;">${Number(row.achievement_percentage || row.percentage || 0).toFixed(2)}%</td>
                        <td style="text-align: right; padding: 12px 10px; border: 1px solid #E5E7EB; color: #01562B; font-weight: bold;">${formatCurrency(row.total_commission || row.commission || 0)}</td>
                    </tr>
                `;
            }).join('');

            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Hierarchy Report - ${periodKey}</title>
                    <script src="https://unpkg.com/lucide@latest"></script>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: Arial, 'Times New Roman', serif;
                            background: white; 
                            color: black;
                            line-height: 1.4; 
                            font-size: 14px;
                            padding: 20px;
                        }
                        @media print {
                            body { 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact;
                                padding: 0;
                            }
                            @page { 
                                margin: 15mm; 
                                size: A4 portrait; 
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                            }
                            thead { 
                                display: table-header-group; 
                            }
                            tfoot { 
                                display: table-footer-group; 
                            }
                            tr { 
                                page-break-inside: avoid; 
                            }
                        }
                        .page {
                            width: 100%;
                            margin: 0 auto;
                            position: relative;
                        }
                        .header-content {
                            border-bottom: 3px solid #01562B;
                            margin-bottom: 20px;
                            padding-bottom: 15px;
                        }
                        .header-top {
                            display: flex;
                            align-items: flex-end;
                            justify-content: space-between;
                            margin-bottom: 15px;
                            flex-wrap: wrap;
                            gap: 15px;
                        }
                        .logo { 
                            width: 160px; 
                            max-width: 100%; 
                            height: auto; 
                            display: block; 
                        }
                        .contact-section { 
                            text-align: right; 
                            color: #4B5563; 
                            font-size: 12px; 
                            font-weight: 500; 
                        }
                        .contact-item { 
                            display: flex; 
                            align-items: center; 
                            justify-content: flex-end; 
                            gap: 8px; 
                            margin-bottom: 4px; 
                        }
                        .align-top { 
                            align-items: flex-start; 
                        }
                        .contact-icon { 
                            color: #01562B; 
                            display: inline-flex; 
                            align-items: center; 
                            justify-content: center; 
                        }
                        .contact-icon svg { 
                            width: 14px; 
                            height: 14px; 
                        }
                        
                        .title-section { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-end; 
                            border-top: 1px solid #E5E7EB; 
                            padding-top: 15px;
                            flex-wrap: wrap;
                            gap: 15px;
                        }
                        .report-title { 
                            font-size: 22px; 
                            font-weight: 900; 
                            color: #01562B; 
                            letter-spacing: -0.5px; 
                            margin: 0;
                        }
                        .subtitle { 
                            color: #6B7280; 
                            font-weight: bold; 
                            text-transform: uppercase; 
                            letter-spacing: 1px; 
                            font-size: 9px; 
                            margin: 0;
                        }
                        
                        .report-table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            font-family: Arial, 'Times New Roman', serif; 
                            font-size: 12px; 
                            margin-top: 20px;
                        }
                        .report-table th { 
                            background-color: #F9FAFB; 
                            padding: 12px 10px; 
                            font-size: 11px; 
                            font-weight: 900; 
                            text-transform: uppercase; 
                            color: #374151; 
                            border: 1px solid #E5E7EB; 
                            text-align: center; 
                        }
                        .watermark { 
                            position: fixed; 
                            top: 50%; 
                            left: 50%; 
                            transform: translate(-50%, -50%); 
                            opacity: 0.1; 
                            width: 70%; 
                            max-width: 500px; 
                            z-index: -1; 
                            pointer-events: none; 
                        }
                        
                        .footer {
                            background-color: #01562B; 
                            color: white; 
                            text-align: center; 
                            padding: 8px; 
                            font-size: 11px; 
                            font-weight: 500;
                            margin-top: 20px;
                        }
                        
                        @media print {
                            .watermark {
                                opacity: 0.05;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="page">
                        <img src="/logo_no_white.png" class="watermark" onerror="this.style.display='none'" />
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th colspan="6" style="border: none; padding: 0;">
                                        <div class="header-content">
                                            <div class="header-top">
                                                <div class="logo-section">
                                                    <img src="/logo_no_white.png" alt="CDP Logo" class="logo" onerror="this.style.display='none'" />
                                                </div>
                                                <div class="contact-section">
                                                    <div class="contact-item"><span>https://cdp.lk</span><span class="contact-icon"><i data-lucide="globe"></i></span></div>
                                                    <div class="contact-item"><span>info@cdp.lk</span><span class="contact-icon"><i data-lucide="mail"></i></span></div>
                                                    <div class="contact-item"><span>+94 11 310 1008</span><span class="contact-icon"><i data-lucide="phone"></i></span></div>
                                                    <div class="contact-item align-top">
                                                        <span>No.82-B/2, Bauddhaloka Mawatha,<br/>Colombo 04, Sri Lanka</span>
                                                        <span class="contact-icon"><i data-lucide="map-pin"></i></span>
                                                    </div>
                                                    <div style="font-size: 12px; font-weight: bold; margin-top: 6px; color: #111827;">Reg No : PV 00345763</div>
                                                </div>
                                            </div>
                                            <div class="title-section">
                                                <div style="text-align: left;">
                                                    <h2 class="report-title">HIERARCHY REPORT</h2>
                                                    <p class="subtitle">Target & Commission Analysis</p>
                                                </div>
                                                <div style="text-align: right;">
                                                    <p style="font-size: 14px; font-weight: bold; color: #111827; margin: 0;">Period: ${new Date(periodKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                                    ${searchTerm ? `<p style="font-size: 11px; color: #6B7280; margin-top: 5px;">Search: ${searchTerm}</p>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                                <tr>
                                    <th style="text-align: left; width: 25%;">Consultant Name</th>
                                    <th style="text-align: left; width: 20%;">ID Info</th>
                                    <th style="width: 15%;">Target Amount</th>
                                    <th style="width: 15%;">Achieved Amount</th>
                                    <th style="width: 10%;">Progress</th>
                                    <th style="width: 15%;">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reportRowsHTML}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="6" style="border: none; padding: 0;">
                                        <div class="footer">
                                            This is a computer generated report. Generated on ${new Date().toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <script>
                        setTimeout(() => {
                            if (typeof lucide !== 'undefined') { 
                                lucide.createIcons(); 
                            }
                            window.print();
                        }, 1000);
                    </script>
                </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            toast.error('Failed to generate report: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Hierarchy Report</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                        View targets and commissions by period
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        disabled={reportData.length === 0 || isGenerating}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Printer size={16} />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row items-center gap-4 text-left">
                <div className="flex-1 w-full relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or username..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full sm:w-auto min-w-[200px] relative">
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
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Consultant</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">ID Info</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Target</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Achieved</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Progress</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Commission</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {reportData.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                                <BarChart3 size={24} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1">NO RESULTS AVAILABLE</h3>
                                            <p className="text-xs text-gray-500">No report records matched your query.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                                                        {row.name}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {row.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.id_type ? (
                                                <div>
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold whitespace-nowrap uppercase tracking-wider mb-1 inline-block">
                                                        {row.id_type.replace('_', ' ')}
                                                    </span>
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                                                        {row.id_number}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(row.target_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-bold text-primary-600">
                                                {formatCurrency(row.achieved_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5 font-bold text-sm text-emerald-600">
                                                <TrendingUp size={14} />
                                                {Number(row.achievement_percentage || 0).toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-lg inline-block">
                                                {formatCurrency(row.total_commission)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Displaying <span className="text-primary-600 font-bold">{reportData.length}</span> of <span className="text-primary-600 font-bold">{pagination.total}</span> Results
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

export default HierarchyReport;

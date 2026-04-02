import React, { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Search,
    FileText,
    ChevronRight,
    Filter,
    Calendar,
    DollarSign,
    User,
    ArrowUpRight,
    ArrowLeft,
    Edit2,
    Trash2,
    X,
    Printer,
    Download,
    Building2,
    Briefcase,
    Sprout,
    ShieldCheck,
    CreditCard,
    Users,
    Info,
    Check,
    TrendingUp,
    ChevronLeft,
    AlertCircle,
    Table
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getInvestmentById } from '../redux/slices/investmentSlice';
import { cn, toTitleCase, formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useQuotations } from '../context/QuotationContext';
import toast from 'react-hot-toast';
import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';

const Quotation = () => {
    const {
        quotations,
        deleteQuotation,
        getQuotations,
        getQuotationById,
        pagination,
        isLoading
    } = useQuotations();

    const dispatch = useDispatch();
    const { currentInvestment } = useSelector(state => state.investment);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [quotationToDelete, setQuotationToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        getQuotations(currentPage);
    }, [currentPage, getQuotations]);

    const filteredQuotations = useMemo(() => {
        return (quotations || []).filter(item => {
            const fullName = String(item.customer?.full_name || item.full_name || '').toLowerCase();
            const idNumber = String(item.customer?.id_number || item.id_number || '').toLowerCase();
            const qNumber = String(item.quotation_number || '').toLowerCase();
            const searchLower = searchTerm.toLowerCase();

            return fullName.includes(searchLower) ||
                idNumber.includes(searchLower) ||
                qNumber.includes(searchLower);
        });
    }, [searchTerm, quotations]);

    const StatusBadge = ({ status }) => (
        <span className={cn(
            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
            status === 'approved' || status === 'Approved'
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50"
                : status === 'draft' || status === 'Draft'
                    ? "bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700"
                    : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50"
        )}>
            {status}
        </span>
    );

    const SectionTitle = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800 print:mb-2 print:border-gray-300">
            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 print:bg-transparent print:p-0 print:text-black">
                <Icon size={18} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider print:text-black print:text-xs">{title}</h3>
        </div>
    );

    const DisplayField = ({ label, value }) => (
        <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest print:text-black print:text-[8px]">{label}</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white print:text-black">{value}</span>
        </div>
    );

    const handleViewReceipt = async (quo) => {
        try {
            // Fetch the full quotation details
            const fullQuo = await getQuotationById(quo.id);
            const actualQuo = fullQuo.data || fullQuo;

            setSelectedQuotation(actualQuo);

            // Also fetch the investment product details for percentages/breakdowns
            const invProductId = actualQuo.investment_product_id || actualQuo.investment_product?.id;
            if (invProductId) {
                dispatch(getInvestmentById(invProductId));
            }

            setIsReceiptModalOpen(true);
        } catch (error) {
            toast.error('Failed to load quotation details');
            console.error('Error fetching quotation:', error);
        }
    };

    const handleDeleteClick = (e, quo) => {
        e.stopPropagation();
        setQuotationToDelete(quo);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!quotationToDelete) return;
        try {
            await deleteQuotation(quotationToDelete.id).unwrap();
            toast.success('Quotation deleted successfully');
            setIsDeleteModalOpen(false);
            setQuotationToDelete(null);
        } catch (err) {
            toast.error(err || 'Failed to delete quotation');
        }
    };

    const handlePrint = () => {
        if (!selectedQuotation) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow pop-ups to print');
            return;
        }

        printWindow.document.title = `Quotation-${selectedQuotation.quotation_number}`;

        // Helper function to safely get values
        const getValue = (obj, path, defaultValue = '') => {
            try {
                return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
            } catch {
                return defaultValue;
            }
        };

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Quotation - ${selectedQuotation.quotation_number}</title>
                <script src="https://unpkg.com/lucide@latest"></script>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Times New Roman', serif;
                        background: white;
                        color: black;
                        line-height: 1.4;
                        font-size: 14px;
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Print styles */
                    @media print {
                        body { 
                            -webkit-print-color-adjust: exact; 
                            print-color-adjust: exact; 
                            padding: 0;
                            margin: 0;
                        }
                        
                        @page { 
                            margin: 0;
                            size: A4; 
                        }
                        
                        /* Table header repetition */
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
                    
                    /* Page Layout */
                    .page {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 10mm 15mm 10mm 15mm;
                        margin: 0 auto;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        box-sizing: border-box;
                    }
                    
                    .page-body {
                        flex: 1;
                    }
                    
                    /* Header Styles */
                    .header {
                        display: flex;
                        align-items: flex-end;
                        justify-content: space-between;
                        margin-bottom: 15px;
                        padding-bottom: 0px;
                        border-bottom: 3px solid #01562B; /* Exact Logo Green */
                    }
                    
                    .logo {
                        width: 160px;
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin-bottom: -5px; /* Minimal offset */
                    }
                    
                    .contact-section {
                        text-align: right;
                        color: #4B5563;
                        font-size: 13px;
                        font-weight: 500;
                        margin-bottom: 5px; /* Add slight push up */
                    }
                    
                    .contact-item {
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                        gap: 8px;
                        margin-bottom: 8px;
                    }
                    
                    .align-top {
                        align-items: flex-start;
                    }
                    
                    .contact-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #01562B; /* Exact Logo Green */
                    }
                    
                    .contact-icon svg {
                        width: 18px;
                        height: 18px;
                        stroke-width: 2.5;
                    }
                    
                    .address-icon svg {
                        width: 24px;
                        height: 24px;
                        margin-top: 2px;
                    }
                    
                    /* Footer Styles - Same on both pages */
                    .footer {
                        margin-top: auto;
                        padding-top: 15px;
                        border-top: 2px solid #E5E7EB;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .footer-left {
                        font-size: 10px;
                        color: #6B7280;
                    }
                    
                    .footer-right {
                        font-size: 10px;
                        color: #6B7280;
                        font-weight: 500;
                    }
                    
                    .page-number {
                        font-size: 10px;
                        color: #6B7280;
                    }
                    
                    .cdp-empire-text {
                        font-weight: 600;
                        color: #01562B; /* Exact Logo Green */
                    }
                    
                    /* Title Section */
                    .title-section {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        margin-bottom: 15px;
                    }
                    
                    .quotation-title {
                        font-size: 28px;
                        font-weight: 900;
                        color: #01562B; /* Exact Logo Green */
                        letter-spacing: -0.5px;
                        margin-bottom: 2px;
                    }
                    
                    .subtitle {
                        color: #6B7280;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        font-size: 9px;
                    }
                    
                    .date-section {
                        text-align: right;
                    }
                    
                    .date-text {
                        font-size: 16px;
                        font-weight: bold;
                        color: #111827;
                    }
                    
                    .validity {
                        font-size: 10px;
                        color: #6B7280;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-top: 6px;
                    }
                    
                    /* Section Title Component */
                    .section-title-component {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        margin-bottom: 12px;
                        padding-bottom: 5px;
                        border-bottom: 2px solid #E5E7EB;
                    }
                    
                    .section-icon-box {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 6px;
                        border-radius: 6px;
                        background-color: transparent;
                        color: #01562B; /* Exact Logo Green */
                        width: 30px;
                        height: 30px;
                    }
                    
                    .section-icon-box i {
                        width: 20px;
                        height: 20px;
                    }
                    
                    .section-heading {
                        font-size: 14px;
                        font-weight: bold;
                        color: #111827;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    }
                    
                    /* Grid Layouts */
                    .grid-2 {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 30px;
                        margin-bottom: 25px;
                    }
                    
                    /* Table Styles */
                    .table-container {
                        margin: 10px 0;
                        overflow-x: auto;
                    }
                    
                    .investment-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: 'Times New Roman', serif;
                        font-size: 13px;
                    }
                    
                    .investment-table th {
                        background-color: transparent;
                        padding: 8px 10px;
                        font-size: 11px;
                        font-weight: 900;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: #374151;
                        border: 1px solid #E5E7EB;
                        text-align: center;
                    }
                    
                    .investment-table td {
                        padding: 6px 10px;
                        font-size: 12px;
                        border: 1px solid #E5E7EB;
                        text-align: right;
                        font-weight: 500;
                    }
                    
                    .investment-table td:first-child {
                        text-align: left;
                        font-weight: 600;
                        background-color: transparent;
                    }
                    
                    .investment-table .total-row {
                        background-color: transparent;
                        font-weight: 900;
                    }
                    
                    .investment-table .total-row td {
                        font-weight: 900;
                        background-color: transparent;
                        font-size: 13px;
                    }
                    
                    /* Field Styles */
                    .field {
                        display: flex;
                        flex-direction: column;
                        gap: 6px;
                    }
                    
                    .field-label {
                        font-size: 12px;
                        font-weight: bold;
                        color: #6B7280;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        width: 130px; /* Fixed width for alignment */
                        flex-shrink: 0;
                    }
                    
                    .field-value {
                        font-size: 14px;
                        font-weight: bold;
                        color: #111827;
                    }
                    
                    .company-name {
                        font-size: 18px;
                        font-weight: 900;
                        color: #111827;
                        margin-bottom: 6px;
                    }
                    
                    .company-address {
                        font-size: 14px;
                        color: #4B5563;
                        line-height: 1.6;
                    }
                    
                    .notes-card {
                        margin-top: 20px;
                        background: transparent;
                        padding: 25px;
                        border-radius: 12px;
                        border: 1px solid #E5E7EB;
                    }
                    
                    /* Signature - placed after breakdown, not in footer */
                    .signature-section {
                        margin-top: 50px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        padding-top: 20px;
                        border-top: 1px solid #E5E7EB;
                    }
                    
                    .secure-tag {
                        font-family: 'Times New Roman', serif;
                        font-style: italic;
                    }

                    .keep-together {
                        page-break-inside: avoid;
                    }
                    
                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.1;
                        width: 70%;
                        max-width: 500px;
                        z-index: -1;
                        pointer-events: none;
                    }
                </style>
            </head>

            <body>
                <!-- ==================== PAGE 1 ==================== -->
                <div class="page">
                    <img src="/logo_no_white.png" class="watermark" />
                    <!-- Header (same on both pages) -->
                    <div class="header">
                        <div class="logo-section">
                            <img src="/logo_no_white.png" alt="Ceylon Development Plantation Empire" class="logo" />
                        </div>
                        <div class="contact-section">
                            <div class="contact-item">
                                <span>https://cdp.lk</span>
                                <span class="contact-icon"><i data-lucide="globe"></i></span>
                            </div>
                            <div class="contact-item">
                                <span>info@cdp.lk</span>
                                <span class="contact-icon"><i data-lucide="mail"></i></span>
                            </div>
                            <div class="contact-item">
                                <span>+94 11 310 1008</span>
                                <span class="contact-icon"><i data-lucide="phone"></i></span>
                            </div>
                            <div class="contact-item align-top">
                                <span>No.82-B/2, Bauddhaloka Mawatha,<br/>Colombo 04, Sri Lanka</span>
                                <span class="contact-icon address-icon"><i data-lucide="map-pin"></i></span>
                            </div>
                            <div style="font-size: 13px; font-weight: bold; margin-top: 8px; color: #111827; letter-spacing: 0.5px; text-align: right;">
                                Reg No : PV 00345763
                            </div>
                        </div>
                    </div>
                    
                    <!-- Page Body -->
                    <div class="page-body">
                        <!-- Quotation Title -->
                        <div class="title-section">
                            <div class="text-left">
                                <h2 class="quotation-title">QUOTATION</h2>
                                <p class="subtitle">CDP Investment Plan</p>
                            </div>
                            <div class="date-section" style="text-align: right;">
                                <p class="date-text" style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">Quotation Number: ${selectedQuotation.quotation_number}</p>
                            </div>
                        </div>
                        
                        <!-- Customer & Consultant Details -->
                        <div class="keep-together" style="margin-bottom: 25px;">
                            <div class="grid-2" style="gap: 8px 40px; margin-bottom: 0;">
                                <!-- Left Side -->
                                <div>
                                    <div class="section-title-component">
                                        <div class="section-icon-box">
                                            <i data-lucide="user"></i>
                                        </div>
                                        <h3 class="section-heading">Customer Information</h3>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="field" style="flex-direction: row; align-items: center;">
                                            <span class="field-label" style="width: 110px;">Customer</span>
                                            <span style="margin-right: 15px; font-weight: bold; color: #6B7280;">:</span>
                                            <span class="field-value">${toTitleCase(selectedQuotation.customer?.full_name || selectedQuotation.full_name || 'N/A')}</span>
                                        </div>
                                        <div class="field" style="flex-direction: row; align-items: center;">
                                            <span class="field-label" style="width: 110px;">NIC/Passport</span>
                                            <span style="margin-right: 15px; font-weight: bold; color: #6B7280;">:</span>
                                            <span class="field-value">${selectedQuotation.customer?.id_number || selectedQuotation.id_number || 'N/A'}</span>
                                        </div>
                                        <div class="field" style="flex-direction: row; align-items: center;">
                                            <span class="field-label" style="width: 110px;">Contact No</span>
                                            <span style="margin-right: 15px; font-weight: bold; color: #6B7280;">:</span>
                                            <span class="field-value">${selectedQuotation.customer?.phone_primary || selectedQuotation.phone_primary || selectedQuotation.customer?.phone || selectedQuotation.phone || selectedQuotation.customer?.contact_number || selectedQuotation.contact_number || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Right Side -->
                                <div>
                                    <div class="section-title-component">
                                        <div class="section-icon-box">
                                            <i data-lucide="building-2"></i>
                                        </div>
                                        <h3 class="section-heading">Consultant Information</h3>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="field" style="flex-direction: row; align-items: center;">
                                            <span class="field-label" style="width: 130px;">Branch Code</span>
                                            <span style="margin-right: 15px; font-weight: bold; color: #6B7280;">:</span>
                                            <span class="field-value">${selectedQuotation.branch?.branch_code || selectedQuotation.branch?.code || '-'}</span>
                                        </div>
                                        <div class="field" style="flex-direction: row; align-items: center;">
                                            <span class="field-label" style="width: 130px;">Consultant</span>
                                            <span style="margin-right: 15px; font-weight: bold; color: #6B7280;">:</span>
                                            <span class="field-value">${selectedQuotation.creator?.name || selectedQuotation.creator?.name || '-'}</span>
                                        </div>
                                        <div class="field" style="flex-direction: row; align-items: center;">
                                            <span class="field-label" style="width: 130px;">Date</span>
                                            <span style="margin-right: 15px; font-weight: bold; color: #6B7280;">:</span>
                                            <span class="field-value">${new Date(selectedQuotation.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Quotation Details Table -->
                        <div>
                            <div class="section-title-component" style="margin-top: 25px;">
                                <div class="section-icon-box">
                                    <i data-lucide="layers"></i>
                                </div>
                                <h3 class="section-heading">Investment Product Details</h3>
                            </div>
                            
                            <div class="table-container">
                                <table class="investment-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 40%;">Investment Plan</th>
                                            <th style="width: 30%;">Investment Amount</th>
                                            
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="text-align: left; font-weight: bold;">${selectedQuotation.investment_product?.name || 'N/A'}</td>
                                            <td style="text-align: right; font-weight: bold;">Rs ${formatCurrency(selectedQuotation.investment_amount)}</td>
                                            
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- ROI Breakdowns Table -->
                        <div>
                            <div class="section-title-component" style="margin-top: 20px;">
                                <div class="section-icon-box">
                                    <i data-lucide="trending-up"></i>
                                </div>
                                <h3 class="section-heading">Return on Investment (ROI)</h3>
                            </div>
                            
                            <div class="table-container">
                                <table class="investment-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 45%;">Time Period / Description</th>
                                            <th style="width: 25%; text-align: center;">Monthly Harvest Return(Rs)</th>
                                            <th style="width: 30%; text-align: center;">Annual Harvest Return(Rs)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${selectedQuotation.yearly_breakdown?.map(item => `
                                            <tr>
                                                <td>
                                                    ${item.duration_months === 6 ? '6 Months' :
                item.year === 1 ? '1st Year' :
                    item.year === 2 ? '2nd Year' :
                        item.year === 3 ? '3rd Year' :
                            item.year === 4 ? '4th Year' :
                                item.year === 5 ? '5th Year' : `${item.year}th Year`}
                                                </td>
                                                <td style="text-align: right;">${formatCurrency(item.monthly_payout)}</td>
                                                <td style="text-align: right;">${formatCurrency(item.yearly_total)}</td>
                                            </tr>
                                        `).join('') || ''}
                                        <tr class="total-row" style="background-color: #F9FAFB;">
                                            <td><strong>Total Maturity Appreciation</strong></td>
                                            <td></td>
                                            <td style="text-align: right;"><strong style="color: #01562B;">${formatCurrency(selectedQuotation.maturity_amount)}</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        
                        ${selectedQuotation.notes ? `
                        <div class="notes-card keep-together" style="margin-top: 15px; padding: 15px;">
                            <div class="field">
                                <span class="field-label">Notes</span>
                                <span class="field-value">${selectedQuotation.notes}</span>
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- Authorized Signature Section -->
                        <div class="signature-section" style="margin-top: 40px;">
                            <div class="secure-tag" style="text-align: left;">
                                
                            </div>
                            <div class="signature-wrapper" style="text-align: right; margin-top: 30px;">
                                <div class="signature-line" style="width: 200px; height: 1px; background: #9CA3AF; margin-bottom: 8px; margin-left: auto;"></div>
                                <p class="signature-label" style="font-size: 11px; font-weight: 900; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <p style="font-size: 10px; font-weight: 500;">The <span style="text-transform: uppercase; font-size: 10px;"><b>return amount</b></span> may be withdrawn <b>either <span style="text-transform: uppercase; font-size: 10px;">monthly</span> or at the <span style="text-transform: uppercase; font-size: 10px;">end of the investment term</span></b>, depending on the <b>investor's preference.</b></p>
                    
                    <div style="background-color: #01562B; color: white; text-align: center; padding: 6px; font-size: 11px; margin-top: 4px; font-weight: 500;">
                        Note: This is a computer generated "Quotation". This is valid only for 14 days from the date of issue
                    </div>
                </div>
                
                <script>
                    // Small delay to ensure DOM is ready
                    setTimeout(() => {
                        if (typeof lucide !== 'undefined') {
                            lucide.createIcons();
                        }
                        window.print();
                    }, 100);
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination?.lastPage || 1)) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Quotation Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">View and manage professional quotations for your clients.</p>
                </div>
                <PermissionGate permission={PERMISSIONS.QUOTATION_CREATE}>
                    <button
                        onClick={() => navigate('/quotation/add')}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        New Quotation
                    </button>
                </PermissionGate>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative w-full md:w-[500px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, NIC or quotation number..."
                        className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <Filter size={14} />
                    Total Quotations: <span className="text-primary-600 ml-1">{pagination?.total || filteredQuotations.length}</span>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse">
                            <div className="flex justify-between mb-6">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                                <div className="w-20 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredQuotations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 text-gray-400">
                        <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs text-center font-medium mb-8">
                        We couldn't find any data matching your criteria.
                    </p>
                    <button
                        onClick={() => navigate('/quotation/add')}
                        className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        Create New Quotation
                    </button>
                </div>
            )}

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {!isLoading && filteredQuotations.map((quo) => (
                    <div
                        key={quo.id}
                        className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary-500/20 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col h-full"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-600/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary-600/10 transition-colors"></div>

                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors shadow-sm">
                                <FileText size={20} />
                            </div>
                            <StatusBadge status={quo.status} />
                        </div>

                        <div className="space-y-4 flex-1 text-left">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Quotation Number</p>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{quo.quotation_number}</h3>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Client Name</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                        <User size={12} className="text-gray-400" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase truncate">{quo.customer?.full_name || quo.full_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                <div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <DollarSign size={8} /> Inv. Amount
                                    </p>
                                    <p className="text-[11px] font-bold text-emerald-600">Rs. {formatCurrency(quo.investment_amount)}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                        <Sprout size={8} /> Inv. Plan
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{quo.investment_product?.name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between group/btn">
                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                {new Date(quo.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                {/* <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/quotation/edit/${quo.id}`);
                                    }}
                                    className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                    title="Edit"
                                >
                                    <Edit2 size={14} />
                                </div> */}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewReceipt(quo);
                                    }}
                                    className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm"
                                    title="View Receipt"
                                >
                                    <ArrowUpRight size={14} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary-600 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-1">
                        {[...Array(pagination.lastPage)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm",
                                    currentPage === i + 1
                                        ? "bg-primary-600 text-white shadow-primary-600/20"
                                        : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary-600"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.lastPage}
                        className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary-600 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
                        >
                            <div className="p-8 text-center text-left">
                                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Trash2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Delete Quotation</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
                                    Are you sure you want to delete <span className="text-gray-900 dark:text-white font-bold">{quotationToDelete?.quotation_number}</span>? This action cannot be undone.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Receipt Modal */}
            <AnimatePresence>
                {isReceiptModalOpen && selectedQuotation && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsReceiptModalOpen(false)}
                            className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg md:p-2.5 md:rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                                        <FileText size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white tracking-tight uppercase">Quotation Receipt</h2>
                                        <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{selectedQuotation.quotation_number} — {new Date(selectedQuotation.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrint}
                                        className="p-2 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-xl text-gray-400 hover:text-primary-600 transition-all"
                                        title="Print Document"
                                    >
                                        <Printer size={18} className="md:w-5 md:h-5" />
                                    </button>
                                    <button
                                        onClick={() => setIsReceiptModalOpen(false)}
                                        className="p-2 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-xl text-gray-400 hover:text-red-600 transition-all"
                                    >
                                        <X size={18} className="md:w-5 md:h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content / Receipt Document */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                                <div id="quotation-receipt-content" className="bg-white dark:bg-transparent text-left font-serif">
                                    {/* New Header Design */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-green-700">
                                        <div className="flex items-center">
                                            <img src="/logo_no_white.png" alt="Ceylon Development Plantation Empire" className="h-24 md:h-32 w-auto" />
                                        </div>

                                        {/* Right Contact Section */}
                                        <div className="text-right space-y-1 md:space-y-1.5 text-gray-500 text-[10px] md:text-xs">
                                            <div className="flex items-center justify-end gap-2">
                                                <span>No.82-B/2, Bauddhaloka Mawatha, Colombo 04, Sri Lanka</span>
                                                <span className="text-green-600 text-sm md:text-lg">🏠</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <span>info@cdp.lk</span>
                                                <span className="text-green-600 text-sm md:text-lg">✉️</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <span>https://cdp.lk</span>
                                                <span className="text-green-600 text-sm md:text-lg">🌐</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <span>+94 11 310 1008</span>
                                                <span className="text-green-600 text-sm md:text-lg">📞</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mb-8">
                                        <div className="text-left">
                                            <h2 className="text-2xl md:text-4xl font-black text-primary-600 tracking-tight mb-1">QUOTATION</h2>
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[8px] md:text-xs">CDP Investment Plan</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] md:text-sm font-bold text-gray-900 dark:text-gray-200">Quotation Number: {selectedQuotation.quotation_number}</p>

                                        </div>
                                    </div>

                                    {/* Client and Consultant Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-left">
                                        <div className="space-y-4">
                                            <SectionTitle icon={User} title="Customer Information" />
                                            <div className="space-y-3">
                                                <DisplayField label="Customer" value={toTitleCase(selectedQuotation.customer?.full_name || selectedQuotation.full_name || 'N/A')} />
                                                <DisplayField label="NIC/Passport" value={selectedQuotation.customer?.id_number || selectedQuotation.id_number || 'N/A'} />
                                                <DisplayField label="Contact No" value={selectedQuotation.customer?.phone_primary || selectedQuotation.phone_primary || selectedQuotation.customer?.phone || selectedQuotation.phone || 'N/A'} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <SectionTitle icon={Building2} title="Consultant Information" />
                                            <div className="space-y-3">
                                                <DisplayField label="Branch Code" value={selectedQuotation.branch?.branch_code || selectedQuotation.branch?.code || '-'} />
                                                <DisplayField label="Consultant" value={selectedQuotation.creator?.name || selectedQuotation.creator?.name || '-'} />
                                                {/* <DisplayField label="Consultant Phone" value={selectedQuotation.creator?.phone_primary || selectedQuotation.creator?.phone || '-'} /> */}
                                                <DisplayField label="Date" value={new Date(selectedQuotation.created_at).toLocaleDateString()} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quotation Details Table */}
                                    <div className="mb-8">
                                        <SectionTitle icon={Sprout} title="Investment Product Details" />
                                        <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl md:rounded-2xl">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                        <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Investment Plan</th>
                                                        <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">Investment Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="py-5 px-6 text-sm font-bold text-gray-900 dark:text-white">{selectedQuotation.investment_product?.name || 'N/A'}</td>
                                                        <td className="py-5 px-6 text-sm font-bold text-primary-600">Rs {formatCurrency(selectedQuotation.investment_amount)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* ROI Breakdowns Table */}
                                    <div className="mb-10 text-left">
                                        <SectionTitle icon={TrendingUp} title="Return on Investment (ROI)" />
                                        <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl md:rounded-2xl">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-800">Time Period / Description</th>
                                                        <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-center">Monthly Harvest Return(Rs)</th>
                                                        <th className="py-4 px-6 border-b border-gray-100 dark:border-gray-800 text-center">Annual Harvest Return(Rs)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {selectedQuotation.yearly_breakdown?.map((item, idx) => (
                                                        <tr key={idx} className="border-b border-gray-50 dark:border-gray-800">
                                                            <td className="py-4 px-6 font-medium text-gray-600 dark:text-gray-400">
                                                                {item.duration_months === 6 ? '6 Months' :
                                                                    item.year === 1 ? '1st Year' :
                                                                        item.year === 2 ? '2nd Year' :
                                                                            item.year === 3 ? '3rd Year' :
                                                                                item.year === 4 ? '4th Year' :
                                                                                    item.year === 5 ? '5th Year' : `${item.year}th Year`}
                                                            </td>
                                                            <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(item.monthly_payout)}
                                                            </td>
                                                            <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(item.yearly_total)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-primary-50 dark:bg-primary-900/10">
                                                        <td className="py-5 px-6 font-black text-primary-600 uppercase tracking-wide">Total Maturity Appreciation</td>
                                                        <td className="py-4 px-6 text-center font-bold text-gray-900 dark:text-white"></td>
                                                        <td className="py-5 px-6 text-right font-black text-primary-600 text-lg">
                                                            {formatCurrency(selectedQuotation.maturity_amount)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {selectedQuotation.notes && (
                                        <div className="mb-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 text-left">
                                            <DisplayField label="Terms & Special Notes" value={selectedQuotation.notes} />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-end pt-10 border-t border-gray-100 dark:border-gray-800 print:pt-6">
                                        <div className="space-y-1 text-left">

                                        </div>
                                        <div className="text-right">
                                            <div className="w-48 h-1 bg-gray-900 dark:bg-white mb-3 mt-3 ml-auto opacity-20"></div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-end gap-3">
                                <button
                                    onClick={() => setIsReceiptModalOpen(false)}
                                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                >
                                    Close View
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="w-full sm:w-auto bg-primary-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Printer size={18} /> Print Document
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @media print {
                    body { visibility: hidden !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    #quotation-receipt-content { visibility: visible !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; display: block !important; margin: 0 !important; padding: 0 !important; }
                    #quotation-receipt-content * { visibility: visible !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 1cm; size: A4; }
                }

                .truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `}</style>
        </div >
    );
};

export default Quotation;
import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Clock,
    ChevronRight,
    Filter,
    Plus,
    X,
    Check,
    Edit2,
    Trash2,
    Calendar,
    PlayCircle,
    Unlock,
    AlertCircle,
    DollarSign,
    Percent,
    ArrowUpRight
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useInvestment } from '../context/InvestmentContext';
import toast from 'react-hot-toast';
import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';

const InvestmentPeriod = () => {
    const {
        investments,
        pagination,
        isLoading,
        error,
        getInvestments,
        createInvestment,
        updateInvestment,
        deleteInvestment
    } = useInvestment();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [touched, setTouched] = useState({});

    // Initial Form State
    const initialFormState = {
        name: '',
        code: '',
        duration_months: '',
        roi_percentage: '',
        unit_head_commission_pct: '',
        parent_commission_pct: '',
        is_active: true,
        is_progressive: false,
        tiered_rates: [] // array of { year, percentage }
    };

    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        getInvestments(currentPage);
    }, [currentPage, getInvestments]);

    const filteredInvestments = useMemo(() => {
        if (!investments) return [];
        return investments.filter(inv =>
            (inv.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.code || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [investments, searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenDrawer = (investment = null) => {
        if (investment) {
            setSelectedInvestment(investment);

            // Map backend annual_rates to frontend tiered_rates format
            let tieredValues = investment.annual_rates || [];
            if (tieredValues.length > 0) {
                tieredValues = tieredValues.map(t => ({
                    year: t.year,
                    percentage: t.roi_percentage
                }));
            } else if (investment.tiered_rates) {
                // Legacy fallback
                let legacy = investment.tiered_rates;
                if (typeof legacy === 'string') {
                    try { legacy = JSON.parse(legacy); } catch (e) { }
                }
                if (Array.isArray(legacy)) {
                    tieredValues = legacy;
                }
            }

            setFormData({
                name: investment.name,
                code: investment.code,
                duration_months: investment.duration_months,
                roi_percentage: investment.roi_percentage || '',
                unit_head_commission_pct: investment.unit_head_commission_pct,
                parent_commission_pct: investment.parent_commission_pct,
                is_active: investment.is_active,
                is_progressive: investment.is_variable_roi || investment.is_progressive || (tieredValues.length > 0),
                tiered_rates: tieredValues
            });
        } else {
            setSelectedInvestment(null);
            setFormData(initialFormState);
        }
        setTouched({});
        setIsDrawerOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setTouched({});
        document.body.style.overflow = 'auto';
        setIsSaving(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Recalculate default tiers if duration changes and progressive is active
            if (name === 'duration_months' && updated.is_progressive) {
                const years = Math.ceil(Number(value || 0) / 12);
                updated.tiered_rates = Array.from({ length: years }, (_, i) => ({
                    year: i + 1,
                    percentage: prev.tiered_rates[i]?.percentage || ''
                }));
            }

            return updated;
        });
    };

    const handleTierChange = (index, value) => {
        setFormData(prev => {
            const newTiers = [...prev.tiered_rates];
            newTiers[index] = { ...newTiers[index], percentage: value };
            return { ...prev, tiered_rates: newTiers };
        });
    };

    const toggleProgressive = (checked) => {
        setFormData(prev => {
            const years = Math.ceil(Number(prev.duration_months || 0) / 12) || 1;
            return {
                ...prev,
                is_progressive: checked,
                tiered_rates: checked
                    ? Array.from({ length: years }, (_, i) => ({
                        year: i + 1,
                        percentage: prev.tiered_rates[i]?.percentage || ''
                    }))
                    : []
            };
        });
    };

    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    // Validation function for individual fields
    const getFieldError = (fieldName) => {
        const value = formData[fieldName];

        switch (fieldName) {
            case 'name':
                return !value?.trim() ? 'Cycle nomenclature is required' : null;
            case 'code':
                return !value?.trim() ? 'System code is required' : null;
            case 'duration_months':
                if (!value) return 'Duration months is required';
                if (Number(value) <= 0) return 'Must be greater than 0';
                if (!Number.isInteger(Number(value))) return 'Must be a whole number';
                return null;
            case 'roi_percentage':
                if (formData.is_progressive) return null; // Skip main ROI validation if progressive
                if (!value) return 'ROI percentage is required';
                if (Number(value) <= 0) return 'Must be greater than 0';
                if (Number(value) > 1000) return 'ROI seems too high (max 1000%)';
                return null;
            case 'unit_head_commission_pct':
                if (!value) return 'Unit Head Commission is required';
                return null;
            case 'parent_commission_pct':
                if (!value) return 'Parent Commission is required';
                return null;
            default:
                return null;
        }
    };

    // Check if form is valid
    const isFormValid = () => {
        // Check required fields
        const requiredFields = ['name', 'code', 'duration_months', 'roi_percentage', 'unit_head_commission_pct', 'parent_commission_pct'];
        for (const field of requiredFields) {
            if (!formData[field]?.toString().trim()) {
                return false;
            }
        }



        // Numeric Value Validations
        const duration = Number(formData.duration_months);
        const roi = Number(formData.roi_percentage);
        const minAmount = Number(formData.unit_head_commission_pct);
        const maxAmount = Number(formData.parent_commission_pct);

        if (duration <= 0 || minAmount <= 0) {
            return false;
        }

        if (!formData.is_progressive && roi <= 0) {
            return false;
        }

        if (formData.is_progressive) {
            const hasInvalidTier = formData.tiered_rates.some(t => !t.percentage || Number(t.percentage) <= 0);
            if (hasInvalidTier) return false;
        }

        // Check for field-specific errors
        const fieldsToValidate = ['name', 'code', 'duration_months', 'unit_head_commission_pct'];
        if (!formData.is_progressive) fieldsToValidate.push('roi_percentage');

        if (formData.parent_commission_pct) {
            fieldsToValidate.push('parent_commission_pct');
        }

        return !fieldsToValidate.some(field => getFieldError(field) !== null);
    };

    const handleSave = async () => {
        // Required Field Validation
        const requiredFields = [
            { field: 'name', message: 'Cycle nomenclature is required' },
            { field: 'code', message: 'System code is required' },
            { field: 'duration_months', message: 'Duration months is required' },
            { field: 'unit_head_commission_pct', message: 'Unit Head Commission is required' },
            { field: 'parent_commission_pct', message: 'Parent Commission is required' },
        ];

        if (!formData.is_progressive) {
            requiredFields.push({ field: 'roi_percentage', message: 'ROI percentage is required' });
        }

        for (const { field, message } of requiredFields) {
            if (!formData[field]?.toString().trim()) {
                toast.error(message);
                // Mark field as touched to show error
                setTouched(prev => ({ ...prev, [field]: true }));
                return;
            }
        }



        // Numeric Value Validations
        const duration = Number(formData.duration_months);
        const roi = Number(formData.roi_percentage);
        const minAmount = Number(formData.unit_head_commission_pct);
        const maxAmount = formData.parent_commission_pct ? Number(formData.parent_commission_pct) : null;

        // Validate positive numbers
        if (duration <= 0) {
            toast.error('Duration months must be greater than 0');
            setTouched(prev => ({ ...prev, duration_months: true }));
            return;
        }

        if (!Number.isInteger(duration)) {
            toast.error('Duration months must be a whole number');
            setTouched(prev => ({ ...prev, duration_months: true }));
            return;
        }

        if (!formData.is_progressive) {
            if (roi <= 0) {
                toast.error('ROI percentage must be greater than 0');
                setTouched(prev => ({ ...prev, roi_percentage: true }));
                return;
            }

            if (roi > 1000) {
                toast.error('ROI percentage seems too high (max 1000%)');
                setTouched(prev => ({ ...prev, roi_percentage: true }));
                return;
            }
        } else {
            const hasInvalidTier = formData.tiered_rates.some(t => !t.percentage || Number(t.percentage) <= 0);
            if (hasInvalidTier) {
                toast.error('All progressive tier percentages must be greater than 0');
                return;
            }
        }

        if (minAmount <= 0) {
            toast.error('Unit Head Commission must be greater than 0');
            setTouched(prev => ({ ...prev, unit_head_commission_pct: true }));
            return;
        }


        // Maximum amount validation (if provided)
        if (maxAmount <= 0) {
            toast.error('Parent Commission must be greater than 0');
            setTouched(prev => ({ ...prev, parent_commission_pct: true }));
            return;
        }


        setIsSaving(true);
        try {
            // Build the payload mapping frontend fields to backend expected format
            const payload = {
                ...formData,
                is_variable_roi: formData.is_progressive ? 1 : 0,
            };

            if (formData.is_progressive) {
                payload.rates = formData.tiered_rates.map(t => ({
                    year: t.year,
                    roi_percentage: t.percentage
                }));

                // Backend still requires a base roi_percentage even if progressive
                if (!payload.roi_percentage && payload.rates.length > 0) {
                    payload.roi_percentage = payload.rates[0].roi_percentage;
                }
            } else {
                payload.rates = [];
            }

            if (selectedInvestment) {
                await updateInvestment(selectedInvestment.id, payload);
                toast.success('Investment period updated successfully');
            } else {
                await createInvestment(payload);
                toast.success('Investment period created successfully');
            }
            handleCloseDrawer();
            getInvestments(currentPage);
        } catch (error) {
            console.error("Failed to save investment:", error);
            toast.error(error.response?.data?.message || 'Failed to save investment period');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (investment) => {
        setDeleteConfirm({ show: true, id: investment.id, name: investment.name });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, id: null, name: '' });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            try {
                await deleteInvestment(deleteConfirm.id);
                toast.success('Investment period deleted successfully');
                getInvestments(currentPage);
                handleDeleteCancel();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete investment period');
            }
        }
    };

    return (
        <div className="relative min-h-screen">
            <div className="animate-in fade-in duration-500 pb-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Investment Period</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Configure and manage available investment plans and their operational states.</p>
                    </div>
                    <PermissionGate permission={PERMISSIONS.INVESTMENT_PRODUCT_CREATE}>
                        <button
                            onClick={() => handleOpenDrawer()}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                        >
                            <Plus size={18} />
                            New Investment Plan
                        </button>
                    </PermissionGate>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Tactical Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative w-full md:w-[600px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search investment plans..."
                            className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Data Layer */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        {/* <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Syncing Temporal Data...</p> */}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left w-1/4">Investment Plan Name</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Duration</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Commissions (%)</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">ROI (%)</th>

                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredInvestments.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:scale-105 transition-all duration-300 border border-primary-100 dark:border-primary-900/20">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight block">{inv.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{inv.code}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{inv.duration_months} Months</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                    <span className="w-12 text-gray-400">U. Head:</span>
                                                    <span className="text-gray-900 dark:text-white">{inv.unit_head_commission_pct}%</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                                    <span className="w-12 text-gray-400">Parent:</span>
                                                    <span className="text-gray-900 dark:text-white">{inv.parent_commission_pct}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 w-fit">
                                                {!(inv.is_progressive || inv.is_variable_roi) ? (
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600">
                                                        <ArrowUpRight size={14} />
                                                        <span className="text-xs font-black tracking-tight">{Number(inv.roi_percentage).toFixed(2)}%</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1.5 items-start">
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600">
                                                            <ArrowUpRight size={14} />
                                                            <span className="text-xs font-black tracking-tight">
                                                                {inv.annual_rates?.length > 0
                                                                    ? `${Math.min(...inv.annual_rates.map(r => Number(r.roi_percentage))).toFixed(2)}% - ${Math.max(...inv.annual_rates.map(r => Number(r.roi_percentage))).toFixed(2)}%`
                                                                    : `${Number(inv.roi_percentage).toFixed(2)}%`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20 text-purple-600">
                                                            <Percent size={14} />
                                                            <span className="text-[10px] font-black tracking-tight uppercase">Progressive Tiers</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <PermissionGate permission={PERMISSIONS.INVESTMENT_PRODUCT_UPDATE}>
                                                    <button
                                                        onClick={() => handleOpenDrawer(inv)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission={PERMISSIONS.INVESTMENT_PRODUCT_DELETE}>
                                                    <button
                                                        onClick={() => handleDeleteClick(inv)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </PermissionGate>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredInvestments.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300 mb-4 transition-colors">
                                    <Clock size={48} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                                <p className="text-sm text-gray-500 max-w-[250px] mt-2">No investment plans match your active search filter.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                            Configured Plans: <span className="text-primary-600">{pagination.total}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className={cn(
                                    "p-2 rounded-lg border border-gray-100 dark:border-gray-800 transition-all",
                                    pagination.currentPage === 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                            >
                                <ChevronRight size={16} className="rotate-180" />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(pagination.lastPage)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                            pagination.currentPage === i + 1
                                                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                                                : "text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.lastPage}
                                className={cn(
                                    "p-2 rounded-lg border border-gray-100 dark:border-gray-800 transition-all",
                                    pagination.currentPage === pagination.lastPage ? "text-gray-200 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[10000] overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleDeleteCancel} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-50 duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Eliminate Plan</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete this investment plan?
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Target: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This process is irreversible. Ensure no active portfolios are bound to this temporal cycle before proceeding.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeleteCancel}
                                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Cancel Operation
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Confirm Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Off-Canvas Drawer */}
            <div
                className={cn(
                    "fixed inset-0 z-[9999] transition-all duration-500 ease-in-out",
                    isDrawerOpen ? "visible" : "invisible"
                )}
            >
                {/* Backdrop */}
                <div
                    className={cn(
                        "absolute inset-0 bg-gray-950/40 backdrop-blur-sm transition-opacity duration-500",
                        isDrawerOpen ? "opacity-100" : "opacity-0"
                    )}
                    onClick={handleCloseDrawer}
                ></div>

                <div
                    className={cn(
                        "absolute inset-y-0 right-0 max-w-[480px] w-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-500 flex flex-col",
                        isDrawerOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 text-left">
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                {selectedInvestment ? 'Edit Investment Plan' : 'New Investment Plan'}
                            </h2>
                        </div>
                        <button
                            onClick={handleCloseDrawer}
                            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-left lowercase-labels">
                        {/* Name & Code */}
                        <div className="space-y-5">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 leading-tight">
                                    Investment Plan Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g., 6 Month Growth Plan"
                                    className={cn(
                                        "w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                        touched.name && getFieldError('name')
                                            ? "border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                                            : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('name')}
                                    required
                                />
                                {touched.name && getFieldError('name') && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                        {getFieldError('name')}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 leading-tight">
                                        Investment Plan Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="e.g., INV-06M"
                                        className={cn(
                                            "w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white uppercase",
                                            touched.code && getFieldError('code')
                                                ? "border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                                                : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('code')}
                                        required
                                    />
                                    {touched.code && getFieldError('code') && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                            {getFieldError('code')}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 leading-tight">
                                        Duration (Months) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="number"
                                            name="duration_months"
                                            placeholder="6"
                                            className={cn(
                                                "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                                touched.duration_months && getFieldError('duration_months')
                                                    ? "border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                                                    : "border-transparent focus:border-primary-500/20"
                                            )}
                                            value={formData.duration_months}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('duration_months')}
                                            min="1"
                                            step="1"
                                            required
                                        />
                                    </div>
                                    {touched.duration_months && getFieldError('duration_months') && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                            {getFieldError('duration_months')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Commission Percentages */}
                        <div className="space-y-5 pt-4 border-t border-gray-100 dark:border-gray-800">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 leading-normal">
                                        Unit Head Commission<br />
                                        Percentage <span className="text-[9px] font-bold text-primary-600/50 tracking-normal normal-case">(%)</span> <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="unit_head_commission_pct"
                                        placeholder="3%"
                                        className={cn(
                                            "w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                            touched.unit_head_commission_pct && getFieldError('unit_head_commission_pct')
                                                ? "border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                                                : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.unit_head_commission_pct}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\s/g, '');
                                            if (!isNaN(value) || value === '') {
                                                setFormData({ ...formData, unit_head_commission_pct: value });
                                            }
                                        }}
                                        onBlur={() => handleBlur('unit_head_commission_pct')}
                                        required
                                    />
                                    {touched.unit_head_commission_pct && getFieldError('unit_head_commission_pct') && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                            {getFieldError('unit_head_commission_pct')}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1 leading-normal">
                                        Parent Commission<br />
                                        Percentage <span className="text-[9px] font-bold text-primary-600/50 tracking-normal normal-case">(%)</span> <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="parent_commission_pct"
                                        placeholder="2%"
                                        className={cn(
                                            "w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                            touched.parent_commission_pct && getFieldError('parent_commission_pct')
                                                ? "border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                                                : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.parent_commission_pct}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\s/g, '');
                                            if (!isNaN(value) || value === '') {
                                                setFormData({ ...formData, parent_commission_pct: value });
                                            }
                                        }}
                                        onBlur={() => handleBlur('parent_commission_pct')}
                                        required
                                    />
                                    {touched.parent_commission_pct && getFieldError('parent_commission_pct') && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                            {getFieldError('parent_commission_pct')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group border border-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            formData.is_progressive ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            {formData.is_progressive ? <Percent size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-1">
                                                Progressive Tier Rates
                                            </div>
                                            <div className="text-[10px] font-medium text-gray-400">Configure increasing ROI percentages per year</div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                                        formData.is_progressive ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                                    )}>
                                        <div className={cn(
                                            "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                                            formData.is_progressive ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.is_progressive}
                                        onChange={(e) => toggleProgressive(e.target.checked)}
                                    />
                                </label>

                                {!formData.is_progressive ? (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            Return on Investment (%) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="number"
                                                name="roi_percentage"
                                                placeholder="18.00"
                                                step="0.01"
                                                min="0.01"
                                                max="1000"
                                                className={cn(
                                                    "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                                    touched.roi_percentage && getFieldError('roi_percentage')
                                                        ? "border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-900/10"
                                                        : "border-transparent focus:border-primary-500/20"
                                                )}
                                                value={formData.roi_percentage}
                                                onChange={handleInputChange}
                                                onBlur={() => handleBlur('roi_percentage')}
                                                required={!formData.is_progressive}
                                            />
                                        </div>
                                        {touched.roi_percentage && getFieldError('roi_percentage') && (
                                            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">
                                                {getFieldError('roi_percentage')}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">
                                                Yearly ROI Progression
                                            </label>
                                            <span className="text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full uppercase">
                                                Based on {formData.duration_months || 0} Months
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {formData.tiered_rates.map((tier, index) => (
                                                <div key={index} className="space-y-1">
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                                        Year {tier.year} <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            min="0.01"
                                                            className={cn(
                                                                "w-full pl-8 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 rounded-xl text-xs font-bold transition-all outline-none dark:text-white border-gray-100 dark:border-gray-700 focus:border-purple-500/30",
                                                                // Highlight if empty or 0 when saving attempted
                                                                (isSaving || touched.duration_months) && (!tier.percentage || Number(tier.percentage) <= 0) && "border-red-300 focus:border-red-500"
                                                            )}
                                                            value={tier.percentage}
                                                            onChange={(e) => handleTierChange(index, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {formData.tiered_rates.length === 0 && (
                                            <div className="text-center py-4">
                                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest">Please enter Duration (Months) first</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md sticky bottom-0 z-10 flex gap-3">
                        <button
                            onClick={handleCloseDrawer}
                            className="flex-1 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={cn(
                                "flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group",
                                (isSaving) && "opacity-50 cursor-not-allowed hover:bg-primary-600 active:scale-100"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Check size={18} className="group-hover:scale-125 transition-transform" />
                                    {selectedInvestment ? 'Update Plan' : 'Save New Plan'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestmentPeriod;
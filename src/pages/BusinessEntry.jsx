import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    LayoutGrid,
    List,
    Search,
    Wallet,
    Eye,
    Edit2,
    Trash2,
    ChevronRight,
    X,
    Check,
    ChevronDown,
    ArrowLeft,
    Filter,
    User,
    Building2,
    Target,
    TrendingUp,
    ShieldCheck,
    Briefcase,
    Calendar,
    MapPin,
    DollarSign,
    PieChart,
    AlertCircle,
    Info,
    CreditCard,
    Heart,
    Banknote,
    Upload,
    FileCheck,
    Paperclip,
    Download
} from 'lucide-react';
import { printReceipt } from '../utils/printReceipt';
import { printCertificate } from '../utils/printCertificate';
import { cn, formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvestment } from '../context/InvestmentContext';
import { useCustomer } from '../context/CustomerContext';
import { useUser } from '../context/UserContext';
import { useBranch } from '../context/BranchContext';
import toast from 'react-hot-toast';


const BANKS = ['HNB', 'Sampath', 'Commercial Bank', 'People\'s Bank', 'NSB', 'Other'];
const PAYMENT_TYPES = [
    { value: 'full_payment', label: 'Full Payment' },
    // { value: 'monthly', label: 'Monthly' }
];
const ID_TYPES = [
    { value: 'nic', label: 'NIC' },
    { value: 'passport', label: 'Passport' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'other', label: 'Other' }
];
const PAYMENT_METHODS = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'cash', label: 'Cash' }
];

const ITEMS_PER_PAGE = 10;

const BusinessEntry = () => {
    // Contexts
    const [approvingId, setApprovingId] = useState(null);
    const {
        businessEntries,
        investments: products,
        businessPagination,
        isLoading,
        error: investmentError,
        getBusinessEntries,
        createBusinessEntry,
        getInvestments: getProducts,
        getBusinessEntryById,
        currentBusinessEntry,
        updateBusinessEntry,
        approveBusinessEntry
    } = useInvestment();

    const { customers, getCustomers } = useCustomer();
    const { users, getUsers } = useUser();
    const { branches, getBranches } = useBranch();

    // State
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('all');
    const [isAddingBusiness, setIsAddingBusiness] = useState(false);
    const [viewDetailBusiness, setViewDetailBusiness] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [formSearchTerm, setFormSearchTerm] = useState('');
    const [showFormResults, setShowFormResults] = useState(false);
    const [errors, setErrors] = useState({});
    const [paymentProofFile, setPaymentProofFile] = useState(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [selectedProof, setSelectedProof] = useState(null);
    const fileInputRef = useRef(null);

    // Initial form state
    const initialFormState = {
        // Customer Details (Existing)
        fullName: '',
        nameWithInitials: '',
        nic: '',
        contactNumber: '',

        // Investment Details
        // application_number: '',
        // sales_code: '',
        reservation_date: new Date().toISOString().split('T')[0],
        customer_id: '',
        branch_id: '',
        investment_product_id: '',
        investment_amount: '',
        bank: '',
        notes: '',

        // Payment Details
        payment_type: 'full_payment',
        payment_description: '',
        initial_payment: '',
        initial_payment_date: new Date().toISOString().split('T')[0],
        // monthly_payment_amount: '',
        // monthly_payment_date: '',

        // Beneficiary Details
        beneficiary: {
            full_name: '',
            name_with_initials: '',
            id_type: 'nic',
            id_number: '',
            phone_primary: '',
            relationship: '',
            share_percentage: 100
        },

        // Bank Details
        bank_detail: {
            bank_name: '',
            branch_name: '',
            account_number: '',
            payment_method: 'bank_transfer'
        }
    };

    const [formData, setFormData] = useState(initialFormState);

    // Filter businesses based on search and branch
    const filteredBusiness = useMemo(() => {
        if (!businessEntries) return [];

        return businessEntries.filter(item => {
            const customerName = item.customer?.full_name || '';
            const policyNumber = item.policy_number || '';
            const matchesSearch = searchTerm === '' ||
                customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                policyNumber.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesBranch = branchFilter === 'all' || item.branch_id?.toString() === branchFilter.toString();
            return matchesSearch && matchesBranch;
        });
    }, [searchTerm, branchFilter, businessEntries]);

    const filteredCustomersForForm = useMemo(() => {
        if (!formSearchTerm) return [];
        return (customers || []).filter(c =>
            (c?.full_name || '').toLowerCase().includes(formSearchTerm.toLowerCase()) ||
            (c?.id_number || c?.nic || '').toLowerCase().includes(formSearchTerm.toLowerCase())
        );
    }, [formSearchTerm, customers]);

    // Pagination
    const totalPages = businessPagination?.lastPage || 1;
    const currentItems = useMemo(() => {
        if (!filteredBusiness) return [];
        return filteredBusiness;
    }, [filteredBusiness]);

    // Data Fetching
    useEffect(() => {
        getBusinessEntries(currentPage);
        getProducts(1);
        getCustomers(1);
        getUsers(1);
        getBranches(1);
    }, [currentPage, getBusinessEntries, getProducts, getCustomers, getUsers, getBranches]);

    useEffect(() => {
        if (viewDetailBusiness?.id) {
            getBusinessEntryById(viewDetailBusiness.id);
        }
    }, [viewDetailBusiness?.id, getBusinessEntryById]);

    const handleApprove = async (e, id) => {
        e.stopPropagation();
        setApprovingId(id);
        try {
            const result = await approveBusinessEntry(id);

            // Log the full response for debugging
            console.log('Approval response:', result);

            // Check different possible response structures
            if (result?.payload?.status === 'success') {
                toast.success(result.payload.message || 'Investment approved successfully', {
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });

                // Refresh data
                await getBusinessEntries(currentPage);
                if (viewDetailBusiness?.id === id) {
                    await getBusinessEntryById(id);
                }
            } else if (result?.payload?.data?.policy_number) {
                // If response has policy_number but different structure
                toast.success('Investment approved successfully', {
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
                await getBusinessEntries(currentPage);
            } else {
                // If response doesn't match expected format
                throw new Error(result?.payload?.message || 'Failed to approve investment');
            }
        } catch (err) {
            // Handle error from the thunk
            const errorResponse = err?.payload || err;
            const errorMessage = errorResponse?.message ||
                errorResponse?.data?.message ||
                'Failed to approve investment';

            toast.error(errorMessage, {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        } finally {
            setApprovingId(null);
        }
    };

    const handleCloseFullPageForm = () => {
        setIsAddingBusiness(false);
        setFormData(initialFormState);
        setFormSearchTerm('');
        setShowFormResults(false);
        setErrors({});
        setPaymentProofFile(null);
        setIsDraggingOver(false);
    };

    const handleOpenFullPageForm = () => {
        setFormData(initialFormState);
        setIsAddingBusiness(true);
        setErrors({});
    };

    // Auto-fill initial payment for full payments
    useEffect(() => {
        if (formData.payment_type === 'full_payment' && formData.investment_amount) {
            setFormData(prev => ({
                ...prev,
                initial_payment: prev.investment_amount
            }));
        }
    }, [formData.payment_type, formData.investment_amount]);

    const validateForm = () => {
        const newErrors = {};

        // Main Fields
        if (!formData.reservation_date) newErrors.reservation_date = 'Reservation date is required';
        if (!formData.customer_id) newErrors.customer_id = 'Customer selection is required';
        if (!formData.investment_product_id) newErrors.investment_product_id = 'Product selection is required';
        if (!formData.investment_amount || formData.investment_amount <= 0) newErrors.investment_amount = 'Investment amount must be greater than 0';
        if (!formData.bank) newErrors.bank = 'Bank selection is required';
        if (!formData.payment_type) newErrors.payment_type = 'Payment type is required';
        if (formData.initial_payment === '' || formData.initial_payment < 0) newErrors.initial_payment = 'Initial payment is required and cannot be negative';
        if (!formData.unit_head_id) newErrors.unit_head_id = 'Unit head is required';

        // if (formData.payment_type === 'monthly_installment') {
        //     if (!formData.monthly_payment_amount || formData.monthly_payment_amount <= 0) {
        //         newErrors.monthly_payment_amount = 'Monthly amount is required';
        //     }
        //     if (!formData.monthly_payment_date) {
        //         newErrors.monthly_payment_date = 'Monthly date is required';
        //     }
        // }

        // Beneficiary Validation
        // Only check text fields that have NO default value (exclude id_type which defaults to 'nic')
        const beneficiaryTextFields = ['full_name', 'id_number', 'phone_primary', 'relationship'];
        const hasBeneficiaryData = beneficiaryTextFields.some(field => formData.beneficiary[field] !== '');

        // if (hasBeneficiaryData) {
            if (!formData.beneficiary.full_name) newErrors['beneficiary.full_name'] = 'Full name is required';
            if (!formData.beneficiary.id_type) newErrors['beneficiary.id_type'] = 'ID type is required';
            if (!formData.beneficiary.id_number) newErrors['beneficiary.id_number'] = 'ID number is required';
            if (!formData.beneficiary.phone_primary) newErrors['beneficiary.phone_primary'] = 'Phone number is required';
            if (!formData.beneficiary.relationship) newErrors['beneficiary.relationship'] = 'Relationship is required';
            if (formData.beneficiary.share_percentage === '' || formData.beneficiary.share_percentage < 0 || formData.beneficiary.share_percentage > 100) {
                newErrors['beneficiary.share_percentage'] = 'Share percentage must be 0-100';
            }
        // }

        // Bank Detail Validation
        const bankDetailFields = ['bank_name', 'branch_name', 'account_number'];
        const hasBankDetailData = bankDetailFields.some(field => formData.bank_detail[field] !== '');

        // if (hasBankDetailData) {
            if (!formData.bank_detail.bank_name) newErrors['bank_detail.bank_name'] = 'Bank name is required';
            if (!formData.bank_detail.branch_name) newErrors['bank_detail.branch_name'] = 'Branch name is required';
            if (!formData.bank_detail.account_number) newErrors['bank_detail.account_number'] = 'Account number is required';
            if (!formData.bank_detail.payment_method) newErrors['bank_detail.payment_method'] = 'Payment method is required';
        // }

        // Payment Proof Validation
        if (!paymentProofFile) {
            newErrors.payment_proof = 'Payment proof is required';
        } else if (paymentProofFile.size > 15 * 1024 * 1024) {
            newErrors.payment_proof = 'Payment proof must not exceed 15 MB';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fill the required fields form before saving');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            // Build FormData to support file upload (payment_proof)
            const fd = new FormData();

            // Scalar fields
            fd.append('reservation_date', formData.reservation_date);
            fd.append('customer_id', parseInt(formData.customer_id));
            if (formData.branch_id) fd.append('branch_id', parseInt(formData.branch_id));
            fd.append('investment_product_id', parseInt(formData.investment_product_id));
            fd.append('investment_amount', parseFloat(formData.investment_amount));
            fd.append('bank', formData.bank === "People's Bank" ? "Peoples Bank" : formData.bank);
            fd.append('payment_type', formData.payment_type);
            if (formData.payment_description) fd.append('payment_description', formData.payment_description);
            fd.append('initial_payment', parseFloat(formData.initial_payment || 0));
            if (formData.initial_payment_date) fd.append('initial_payment_date', formData.initial_payment_date);
            // if (formData.monthly_payment_amount) fd.append('monthly_payment_amount', parseFloat(formData.monthly_payment_amount));
            // if (formData.monthly_payment_date) fd.append('monthly_payment_date', formData.monthly_payment_date);
            if (formData.unit_head_id) fd.append('unit_head_id', parseInt(formData.unit_head_id));
            if (formData.notes) fd.append('notes', formData.notes);

            // Nested objects – Laravel expects bracket notation for multipart/form-data
            // e.g. beneficiary[full_name], bank_detail[bank_name]
            fd.append('beneficiary[full_name]', formData.beneficiary.full_name);
            fd.append('beneficiary[name_with_initials]', formData.beneficiary.name_with_initials || '');
            fd.append('beneficiary[id_type]', formData.beneficiary.id_type);
            fd.append('beneficiary[id_number]', formData.beneficiary.id_number);
            fd.append('beneficiary[phone_primary]', formData.beneficiary.phone_primary);
            fd.append('beneficiary[relationship]', formData.beneficiary.relationship);
            fd.append('beneficiary[share_percentage]', parseFloat(formData.beneficiary.share_percentage || 0));

            fd.append('bank_detail[bank_name]', formData.bank_detail.bank_name);
            fd.append('bank_detail[branch_name]', formData.bank_detail.branch_name);
            fd.append('bank_detail[account_number]', formData.bank_detail.account_number);
            fd.append('bank_detail[payment_method]', formData.bank_detail.payment_method);

            // Payment proof file (optional)
            if (paymentProofFile) {
                fd.append('payment_proof', paymentProofFile);
            }

            const result = await createBusinessEntry(fd).unwrap();

            if (result) {
                toast.success('Investment created successfully');
                handleCloseFullPageForm();
                getBusinessEntries(1); // Refresh the list
            }
        } catch (error) {
            toast.error(error || 'Failed to create investment');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'investment_amount' || name === 'initial_payment') {
            // Remove all non-numeric characters for raw value
            const rawValue = value.replace(/\D/g, '');
            setFormData(prev => ({
                ...prev,
                [name]: rawValue
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ---- Drag & Drop handlers for payment_proof ----
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) {
                toast.error('File exceeds 15 MB limit. Please upload a smaller file.', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
                setErrors(prev => ({ ...prev, payment_proof: 'Payment proof must not exceed 15 MB' }));
                return;
            }
            setPaymentProofFile(file);
            setErrors(prev => ({ ...prev, payment_proof: undefined }));
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 15 * 1024 * 1024) {
                toast.error('File exceeds 15 MB limit. Please upload a smaller file.', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
                setErrors(prev => ({ ...prev, payment_proof: 'Payment proof must not exceed 15 MB' }));
                e.target.value = '';
                return;
            }
            setPaymentProofFile(file);
            setErrors(prev => ({ ...prev, payment_proof: undefined }));
        }
    };

    const handleRemoveFile = () => {
        setPaymentProofFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleBeneficiaryChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            beneficiary: {
                ...prev.beneficiary,
                [field]: value
            }
        }));
    };

    const handleBankDetailChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            bank_detail: {
                ...prev.bank_detail,
                [field]: value
            }
        }));
    };

    const handleSelectCustomer = (customer) => {
        setFormData(prev => ({
            ...prev,
            customer_id: customer.id,
            fullName: customer.full_name || customer.fullName || '',
            nameWithInitials: customer.name_with_initials || customer.nameWithInitials || '',
            nic: customer.id_number || customer.nic || '',
            contactNumber: customer.phone_primary || customer.primary_phone || customer.contact_number || '',
            beneficiary: {
                ...prev.beneficiary,
                full_name: customer.beneficiary_name || prev.beneficiary.full_name || '',
                id_number: customer.beneficiary_nic || prev.beneficiary.id_number || '',
            }
        }));
        setFormSearchTerm(customer.full_name || customer.fullName);
        setShowFormResults(false);
        // toast.success('Customer selected and details auto-filled');
    };

    const ErrorMessage = ({ error }) => {
        if (!error) return null;
        return (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[9px] font-bold text-red-500 mt-1 ml-1 flex items-center gap-1 uppercase tracking-tight"
            >
                <AlertCircle size={10} /> {error}
            </motion.p>
        );
    };

    const renderFullPageForm = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-left pb-20 px-4 sm:px-0">
            <div className="mb-8">


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left border-b border-gray-100 dark:border-gray-800 pb-6">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">New Investment</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Asset allocation and investment onboarding.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCloseFullPageForm}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-primary-600 font-bold transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                                <ArrowLeft size={14} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider">Back to Investment</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-full mx-auto space-y-6">
                {/* Form Details */}
                <div className="space-y-4">
                    {/* Customer Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                    <User size={14} />
                                </div>
                                <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Customer Details</h3>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">Section 01</span>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Search Customer Profile</label>
                                <div className="relative mt-2">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Enter Customer Name or NIC to search..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500/30 rounded-xl text-sm font-bold focus:ring-8 focus:ring-primary-500/5 transition-all outline-none dark:text-white shadow-inner"
                                        value={formSearchTerm}
                                        onChange={(e) => {
                                            setFormSearchTerm(e.target.value);
                                            setShowFormResults(true);
                                        }}
                                        onFocus={() => setShowFormResults(true)}
                                        autoComplete="off"
                                    />

                                    <AnimatePresence>
                                        {showFormResults && formSearchTerm && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl overflow-y-auto max-h-[260px] custom-scrollbar"
                                            >
                                                {filteredCustomersForForm.length > 0 ? (
                                                    filteredCustomersForForm.map(customer => (
                                                        <div
                                                            key={customer.id}
                                                            className="px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                            onClick={() => handleSelectCustomer(customer)}
                                                        >
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{customer.full_name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{customer.id_number || customer.nic} — {customer.city || customer.address}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-6 text-center">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No customers found</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Full Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                        autoComplete="off"
                                        required
                                    />
                                    <ErrorMessage error={errors.fullName} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name with Initials</label>
                                    <input
                                        type="text"
                                        name="nameWithInitials"
                                        value={formData.nameWithInitials}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        NIC Number
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="nic"
                                        value={formData.nic}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                        autoComplete="off"
                                        required
                                    />
                                    <ErrorMessage error={errors.nic} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact</label>
                                    <input
                                        type="text"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                        autoComplete="off"
                                    />
                                    <ErrorMessage error={errors.contactNumber} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Investment Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-emerald-50/10 dark:bg-emerald-900/10">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Investment</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Reservation Date
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="reservation_date"
                                        value={formData.reservation_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors.reservation_date} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Branch
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="branch_id"
                                        value={formData.branch_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    >
                                        <option value="">Select Branch</option>
                                        {branches?.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                    <ErrorMessage error={errors.branch_id} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Investment Plan
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="investment_product_id"
                                        value={formData.investment_product_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    >
                                        <option value="">Select Plan</option>
                                        {products?.map(product => (
                                            <option key={product.id} value={product.id}>{product.name}</option>
                                        ))}
                                    </select>
                                    <ErrorMessage error={errors.investment_product_id} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1 relative">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Amount
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-sm font-bold text-gray-400">Rs.</span>
                                        <input
                                            type="text"
                                            name="investment_amount"
                                            value={formData.investment_amount ? formatCurrency(formData.investment_amount, 0) : ''}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                            placeholder="0"
                                            required
                                        />
                                    </div>
                                    <ErrorMessage error={errors.investment_amount} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Unit Head
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="unit_head_id"
                                        value={formData.unit_head_id}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    >
                                        <option value="">Select Unit Head</option>
                                        {users?.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                    <ErrorMessage error={errors.unit_head_id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-blue-50/10 dark:bg-blue-900/10">
                            <DollarSign size={14} className="text-blue-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Payment</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Type
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="payment_type"
                                        value={formData.payment_type}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    >
                                        {PAYMENT_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    <ErrorMessage error={errors.payment_type} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Bank
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="bank"
                                        value={formData.bank}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    >
                                        <option value="">Select Bank</option>
                                        {BANKS.map(bank => (
                                            <option key={bank} value={bank}>{bank}</option>
                                        ))}
                                    </select>
                                    <ErrorMessage error={errors.bank} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Initial Payment
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-sm font-bold text-gray-400">Rs.</span>
                                        <input
                                            type="text"
                                            name="initial_payment"
                                            value={formData.initial_payment ? formatCurrency(formData.initial_payment, 0) : ''}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                    <ErrorMessage error={errors.initial_payment} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Payment Date</label>
                                    <input
                                        type="date"
                                        name="initial_payment_date"
                                        value={formData.initial_payment_date}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors.initial_payment_date} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <input
                                        type="text"
                                        name="payment_description"
                                        value={formData.payment_description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors.payment_description} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Payment Proof – Drag & Drop */}
                                <div className="space-y-1 col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        <Paperclip size={9} /> Payment Proof <span className="text-red-500">*</span>
                                    </label>

                                    {paymentProofFile ? (
                                        <div className="flex items-center gap-2 px-3 py-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700/40 rounded-xl min-h-[58px]">
                                            <FileCheck size={14} className="text-primary-600 shrink-0" />
                                            <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 truncate flex-1">
                                                {paymentProofFile.name}
                                            </span>
                                            <span className="text-[9px] text-gray-400 shrink-0">
                                                {(paymentProofFile.size / 1024).toFixed(1)} KB
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`cursor-pointer flex flex-col items-center justify-center gap-1 px-3 py-4 rounded-xl border-2 border-dashed transition-all min-h-[58px] ${isDraggingOver
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-primary-400 hover:bg-primary-50/40 dark:hover:bg-primary-900/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Upload size={14} className={`${isDraggingOver ? 'text-primary-600' : 'text-gray-400'} transition-colors`} />
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider text-center">
                                                    {isDraggingOver ? 'Drop file here' : 'Drag & drop or click to upload'}
                                                </p>
                                            </div>
                                            <p className="text-[8px] text-gray-300 dark:text-gray-600">PNG, JPG, PDF – max 15 MB</p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        className="hidden"
                                        onChange={handleFileInputChange}
                                    />
                                    <ErrorMessage error={errors.payment_proof} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Beneficiary Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-orange-50/10 dark:bg-orange-900/10">
                            <ShieldCheck size={14} className="text-orange-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Beneficiary Details</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.beneficiary.full_name}
                                        onChange={(e) => handleBeneficiaryChange('full_name', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors['beneficiary.full_name']} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Type</label>
                                    <select
                                        value={formData.beneficiary.id_type}
                                        onChange={(e) => handleBeneficiaryChange('id_type', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    >
                                        {ID_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    <ErrorMessage error={errors['beneficiary.id_type']} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Number<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.beneficiary.id_number}
                                        onChange={(e) => handleBeneficiaryChange('id_number', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors['beneficiary.id_number']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Share %<span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={formData.beneficiary.share_percentage}
                                        onChange={(e) => handleBeneficiaryChange('share_percentage', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                        min="0"
                                        max="100"
                                    />
                                    <ErrorMessage error={errors['beneficiary.share_percentage']} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Phone<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.beneficiary.phone_primary}
                                        onChange={(e) => handleBeneficiaryChange('phone_primary', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors['beneficiary.phone_primary']} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Relationship<span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.beneficiary.relationship}
                                        onChange={(e) => handleBeneficiaryChange('relationship', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    />
                                    <ErrorMessage error={errors['beneficiary.relationship']} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-purple-50/10 dark:bg-purple-900/10">
                            <Building2 size={14} className="text-purple-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Bank Assignment</h3>
                        </div>
                        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bank Name<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.bank_detail.bank_name}
                                    onChange={(e) => handleBankDetailChange('bank_name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                />
                                <ErrorMessage error={errors['bank_detail.bank_name']} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.bank_detail.branch_name}
                                    onChange={(e) => handleBankDetailChange('branch_name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                />
                                <ErrorMessage error={errors['bank_detail.branch_name']} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">A/C Number<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.bank_detail.account_number}
                                    onChange={(e) => handleBankDetailChange('account_number', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm font-mono"
                                />
                                <ErrorMessage error={errors['bank_detail.account_number']} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Method<span className="text-red-500">*</span></label>
                                <select
                                    value={formData.bank_detail.payment_method}
                                    onChange={(e) => handleBankDetailChange('payment_method', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                >
                                    <option value="">Select Method</option>
                                    {PAYMENT_METHODS.map(method => (
                                        <option key={method.value} value={method.value}>{method.label}</option>
                                    ))}
                                </select>
                                <ErrorMessage error={errors['bank_detail.payment_method']} />
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-visible text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-gray-50/30 dark:bg-gray-800/20">
                            <Info size={14} className="text-gray-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Additional Notes</h3>
                        </div>
                        <div className="p-4">
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                placeholder="Enter any additional notes or comments..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            onClick={handleCloseFullPageForm}
                            className="px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={14} /> Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDetailView = () => {
        // Use currentBusinessEntry from context instead of viewDetailBusiness
        const item = currentBusinessEntry;

        if (!item) {
            return (
                <div className="flex items-center justify-center py-32">
                    <div className="w-16 h-16 border-[6px] border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        // console.log('Rendering with currentBusinessEntry:', item);
        // console.log('Beneficiary from item:', item.beneficiary);
        // console.log('Bank Detail from item:', item.bank_detail);

        // Safely access nested properties with fallbacks
        const customer = item.customer || {};
        const beneficiary = item.beneficiary || {};
        const bankDetail = item.bank_detail || {};
        const investmentProduct = item.investment_product || {};
        const branch = item.branch || {};
        const unitHead = item.unit_head || {};

        // Format date helper
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            try {
                return new Date(dateString).toLocaleDateString();
            } catch {
                return 'N/A';
            }
        };


        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-left pb-20">
                <button
                    onClick={() => setViewDetailBusiness(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-bold mb-6 transition-colors group"
                >
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                        <ArrowLeft size={18} />
                    </div>
                    Back to Investment Page
                </button>

                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Header Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center border border-primary-100 dark:border-primary-800 shadow-inner">
                                    <User size={40} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                                        {customer.full_name || 'N/A'}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {customer.id_number && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                                                NIC: {customer.id_number}
                                            </span>
                                        )}
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                                            Policy: {item.policy_number || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                <button
                                    onClick={(e) => !approvingId && item.status?.toLowerCase() !== 'approved' && handleApprove(e, item.id)}
                                    className={cn(
                                        "w-full md:w-fit flex items-center justify-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 border shadow-sm group/toggleDetail cursor-pointer",
                                        item.status?.toLowerCase() === 'approved'
                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20 shadow-lg"
                                            : "bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-primary-600/20 shadow-lg active:scale-95",
                                        approvingId === item.id && "opacity-70 cursor-wait"
                                    )}
                                >
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">
                                        {approvingId === item.id ? 'syncing...' : (item.status?.toLowerCase() === 'approved' ? 'approved' : 'approve business')}
                                    </span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full shadow-sm transition-all duration-300 flex items-center justify-center",
                                        item.status?.toLowerCase() === 'approved' ? "bg-white" : "bg-white/20"
                                    )}>
                                        {approvingId === item.id ? (
                                            <div className="w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            item.status?.toLowerCase() === 'approved' ? (
                                                <Check size={14} className="text-emerald-500 stroke-[4px]" />
                                            ) : (
                                                <Check size={14} className="text-white opacity-40" />
                                            )
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Column 1: Core Investment Details */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp size={16} className="text-emerald-600" />
                                        <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Investment Summary</h3>
                                    </div>
                                    {item.application_number && (
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
                                            #{item.application_number}
                                        </span>
                                    )}
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary investment amount</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xs font-bold text-emerald-600 uppercase">LKR</span>
                                                    <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
                                                        {formatCurrency(item.investment_amount)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Initial Pmt</p>
                                                    <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                                                        Rs. {formatCurrency(item.initial_payment)}
                                                    </p>
                                                </div>
                                                {/* <div className="p-4 rounded-2xl bg-primary-50/30 dark:bg-primary-900/10 border border-primary-100/50 dark:border-primary-800/50">
                                                    <p className="text-[9px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">Monthly Pmt</p>
                                                    <p className="text-sm font-black text-primary-700 dark:text-primary-300 tracking-tight">
                                                        Rs. {formatCurrency(item.monthly_payment_amount)}
                                                    </p>
                                                </div> */}
                                            </div>

                                            {/* Payment Proof */}
                                            {item.payment_proof && (() => {
                                                const fileUrl = `${import.meta.env.VITE_FILE_URL || 'http://127.0.0.1:8000'}/${item.payment_proof}`;
                                                const isPdf = item.payment_proof.toLowerCase().endsWith('.pdf');
                                                return (
                                                    <div className="mt-2">
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                            <Paperclip size={9} /> Payment Proof
                                                        </p>
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); setSelectedProof({ url: fileUrl, isPdf }); }}
                                                            className="flex w-full items-center gap-3 p-3 text-left rounded-xl border border-primary-100 dark:border-primary-800/50 bg-primary-50/40 dark:bg-primary-900/10 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                                                        >
                                                            {isPdf ? (
                                                                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                                                                    <span className="text-[8px] font-black text-red-600 uppercase">PDF</span>
                                                                </div>
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800">
                                                                    <img src={fileUrl} alt="payment proof" className="w-full h-full object-cover" />
                                                                </div>
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-[10px] font-bold text-primary-700 dark:text-primary-300 truncate group-hover:underline">
                                                                    {item.payment_proof.split('/').pop()}
                                                                </p>
                                                                <p className="text-[8px] text-gray-400 uppercase tracking-wider">Click to open</p>
                                                            </div>
                                                            <Eye size={12} className="text-primary-400 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-800">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product</span>
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase">
                                                        {investmentProduct.name || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-800">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</span>
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase">
                                                        {item.payment_type ? item.payment_type.replace('_', ' ') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-800">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reserved On</span>
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-200">
                                                        {formatDate(item.reservation_date)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-800">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales Code</span>
                                                    <span className="text-xs font-black text-primary-600">{item.sales_code || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-1.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branch Profile</span>
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-tighter">
                                                        {branch.name || 'LOCAL HQ'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                                    <Building2 size={16} className="text-blue-600" />
                                    <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Settlement Information</h3>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Designated Bank</span>
                                                <span className="text-sm font-black text-gray-800 dark:text-gray-100">
                                                    {bankDetail.bank_name || item.bank || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Account Structure</span>
                                                <span className="text-sm font-black text-gray-600 dark:text-gray-300 font-mono tracking-tighter">
                                                    {bankDetail.account_number || 'PENDING ASSIGNMENT'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Settlement Method</span>
                                                <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg text-[10px] font-bold uppercase tracking-wider w-fit border border-primary-100 dark:border-primary-800">
                                                    {bankDetail.payment_method ? bankDetail.payment_method.replace('_', ' ') : 'Manual'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Branch Identity</span>
                                                <span className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase italic">
                                                    {bankDetail.branch_name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Beneficiary & System Context */}
                        <div className="space-y-6">

                            {/* Action Buttons for Approved Entries */}
                            {item.status?.toLowerCase() === 'approved' && (
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <button
                                        onClick={() => printReceipt(item)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm"
                                    >
                                        <Download size={14} /> Receipt
                                    </button>
                                    <button
                                        onClick={() => printCertificate(item)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all shadow-sm"
                                    >
                                        <Download size={14} /> Certificate
                                    </button>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                                    <ShieldCheck size={16} className="text-orange-600" />
                                    <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Beneficiary</h3>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/20 dark:bg-orange-900/10 border border-orange-100/50 dark:border-orange-800/30">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-800/30 text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-orange-600/70 uppercase tracking-widest leading-none mb-1">Appointed nominee</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white leading-tight uppercase">
                                                {beneficiary.full_name || 'NOT ASSIGNED'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 px-1">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Relationship</span>
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-200">
                                                {beneficiary.relationship || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-800">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID Identity</span>
                                            <span className="text-xs font-black text-gray-700 dark:text-gray-200 font-mono tracking-tight uppercase">
                                                {beneficiary.id_number || 'N/A'} {beneficiary.id_type && `(${beneficiary.id_type})`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-6 bg-gray-900 dark:bg-black rounded-2xl p-4 shadow-xl">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Share Percentage</span>
                                            <span className="text-2xl font-black text-white tracking-tighter">
                                                {parseFloat(beneficiary.share_percentage || 0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                                    <PieChart size={16} className="text-purple-600" />
                                    <h3 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">Internal Context</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    {item.notes ?
                                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 min-h-[80px] border border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                                {item.notes || 'No specialized directives or internal notes provided for this transaction.'}
                                            </p>
                                        </div> : ""
                                    }


                                    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm text-primary-600 font-black text-[10px]">
                                                UH
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Unit Head</p>
                                                <p className="text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase">
                                                    {unitHead.name || 'ADMINISTRATIVE OVERSEE'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMainView = () => (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Investment Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Strategic investment tracking overview.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleOpenFullPageForm}
                        className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        New Investment
                    </button>
                </div>
            </div>

            {/* Tactical Control Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white dark:bg-gray-950 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm items-center">
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Scan for policy signals or client identities..."
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="flex items-center gap-2 px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-[11px] font-bold text-gray-400 uppercase tracking-widest border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all cursor-pointer">
                    <Building2 size={16} />
                    <span className="whitespace-nowrap">Node:</span>
                    <select
                        className="bg-transparent border-none p-0 text-gray-900 dark:text-white focus:ring-0 cursor-pointer text-[11px] font-black uppercase"
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                    >
                        <option value="all">Global Matrix</option>
                        {branches?.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-end gap-1.5 p-1.5 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "flex-1 p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            viewMode === 'grid' ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm" : "text-gray-400"
                        )}
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "flex-1 p-3 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            viewMode === 'list' ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm" : "text-gray-400"
                        )}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Loading / Error States */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-16 h-16 border-[6px] border-primary-600 border-t-transparent rounded-full animate-spin mb-6 shadow-lg shadow-primary-600/20"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Ledger Data...</p>
                </div>
            )}

            {investmentError && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-3xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-bold">Error loading data: {investmentError}</p>
                </div>
            )}

            {!isLoading && !investmentError && filteredBusiness.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-200 mb-6">
                        <Briefcase size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">No active business entries detected in the current operational scope.</p>
                </div>
            )}

            {/* Content */}
            {!isLoading && !investmentError && filteredBusiness.length > 0 && (
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {currentItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -4 }}
                                    onClick={() => setViewDetailBusiness(item)}
                                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group p-6 relative overflow-hidden"
                                >
                                    <div
                                        onClick={(e) => !approvingId && item.status?.toLowerCase() !== 'approved' && handleApprove(e, item.id)}
                                        className="absolute top-4 right-4 z-20"
                                    >
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 border shadow-sm group/toggle cursor-pointer",
                                                item.status?.toLowerCase() === 'approved'
                                                    ? "bg-emerald-500 text-white border-emerald-400"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-primary-500",
                                                approvingId === item.id && "opacity-70 cursor-wait"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-[0.1em]",
                                                item.status?.toLowerCase() === 'approved' ? "text-white" : "text-gray-400 group-hover/toggle:text-primary-600"
                                            )}>
                                                {approvingId === item.id ? 'syncing...' : (item.status?.toLowerCase() === 'approved' ? 'approved' : 'approve')}
                                            </span>
                                            <motion.div
                                                layout
                                                className={cn(
                                                    "w-4 h-4 rounded-full shadow-sm flex items-center justify-center",
                                                    item.status?.toLowerCase() === 'approved'
                                                        ? "bg-white"
                                                        : "bg-gray-300 dark:bg-gray-600"
                                                )}
                                            >
                                                {approvingId === item.id ? (
                                                    <div className="w-2.5 h-2.5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    item.status?.toLowerCase() === 'approved' && <Check size={10} className="text-emerald-500 stroke-[4px]" />
                                                )}
                                            </motion.div>
                                        </motion.div>
                                    </div>

                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-600/10 transition-colors"></div>

                                    <div className="flex items-center gap-4 mb-4 relative z-10 pr-20">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                                            <User size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                                {item.customer?.full_name || item.fullName}
                                            </h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {item.customer?.nic || item.nic}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4 relative z-10">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-400 font-bold">Policy</span>
                                            <span className="font-mono font-bold text-primary-600">{item.policy_number || 'PENDING'}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-400 font-bold">Amount</span>
                                            <span className="font-black text-emerald-600">Rs. {formatCurrency(item.investment_amount)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <span className="text-[9px] font-bold text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                        <button className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar"
                        >
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Indicator</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Policy Token</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">State</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operational Node</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Investment Scale</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {currentItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => setViewDetailBusiness(item)}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-all cursor-pointer group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 flex items-center justify-center group-hover:rotate-6 transition-all border border-emerald-100 dark:border-emerald-900/20 shadow-sm">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight block truncate max-w-[200px]">
                                                            {item.customer?.full_name || item.fullName}
                                                        </span>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                            {item.customer?.nic || item.nic}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/10 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border border-primary-100 dark:border-primary-900/20">
                                                    {item.policy_number || 'SIGNAL PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div
                                                    onClick={(e) => !approvingId && item.status?.toLowerCase() !== 'approved' && handleApprove(e, item.id)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 border w-fit group/toggleList cursor-pointer",
                                                        item.status?.toLowerCase() === 'approved'
                                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-sm"
                                                            : "bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary-500",
                                                        approvingId === item.id && "opacity-70"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase tracking-[0.1em] min-w-[70px] text-center",
                                                        item.status?.toLowerCase() === 'approved' ? "text-white" : "text-gray-400 group-hover/toggleList:text-primary-600"
                                                    )}>
                                                        {approvingId === item.id ? 'syncing' : (item.status?.toLowerCase() === 'approved' ? 'approved' : 'approve')}
                                                    </span>
                                                    <motion.div
                                                        layout
                                                        className={cn(
                                                            "w-5 h-5 rounded-full shadow-sm flex items-center justify-center",
                                                            item.status?.toLowerCase() === 'approved'
                                                                ? "bg-white rotate-0 scale-110"
                                                                : "bg-gray-300 dark:bg-gray-600 -rotate-90 scale-100"
                                                        )}
                                                    >
                                                        {approvingId === item.id ? (
                                                            <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            item.status?.toLowerCase() === 'approved' && <Check size={12} className="text-emerald-500 stroke-[4px]" />
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-1">Unit Head</span>
                                                    <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase">
                                                        {item.unit_head?.name || 'CENTRAL SYSTEM'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-emerald-600">Rs. {formatCurrency(item.investment_amount)}</span>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Settled Transaction</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setViewDetailBusiness(item); }}
                                                        className="p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-200"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-200">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            )
            }

            {/* Pagination */}
            {
                businessPagination && businessPagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Displaying <span className="text-primary-600">{filteredBusiness.length}</span> of <span className="text-primary-600">{businessPagination.total}</span> Business Records
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-bold"
                            >
                                <ChevronRight size={18} className="rotate-180" />
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-10 h-10 flex-shrink-0 rounded-xl text-xs font-black transition-all flex items-center justify-center border",
                                            currentPage === i + 1
                                                ? "bg-primary-600 text-white shadow-xl shadow-primary-600/30 border-primary-600"
                                                : "bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 border-gray-100 dark:border-gray-800"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900 transition-all font-bold"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )
            }
        </div>
    );

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="container mx-auto px-4 pb-8">
                {isAddingBusiness ? renderFullPageForm() : (viewDetailBusiness ? renderDetailView() : renderMainView())}
            </div>

            <AnimatePresence>
                {selectedProof && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedProof(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-white/5 rounded-3xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedProof(null)}
                                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-colors shadow-lg"
                            >
                                <X size={20} />
                            </button>

                            {selectedProof.isPdf ? (
                                <iframe
                                    src={selectedProof.url}
                                    className="w-full h-[85vh] rounded-2xl bg-white shadow-2xl"
                                    title="Payment Proof PDF"
                                />
                            ) : (
                                <img
                                    src={selectedProof.url}
                                    alt="Payment Proof"
                                    className="w-auto max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BusinessEntry;
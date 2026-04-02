import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    ArrowLeft,
    Download,
    FileText,
    Building2,
    Briefcase,
    Sprout,
    ShieldCheck,
    CreditCard,
    Users,
    Info,
    DollarSign,
    User,
    Search,
    Trash2,
    Printer,
    X,
    Check,
    TrendingUp,
    Target,
    ChevronRight,
    Home,
    Layers,
    Calendar,
    Phone,
    Mail,
    Globe,
    MapPin,
    ChevronDown,
    Loader,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn, formatCurrency } from '../lib/utils';
import { useQuotation } from '../context/QuotationContext';
import { useCustomer } from '../context/CustomerContext';
import { useBranch } from '../context/BranchContext';
import { useInvestment } from '../context/InvestmentContext';
import toast from 'react-hot-toast';

// Constants moved outside component
const initialData = {
    customer_id: '',
    investment_product_id: '',
    branch_id: '',
    fullName: '',
    nameWithInitials: '',
    nic: '',
    address: '',
    beneficiary: '(Not Mentioned)',
    loanAmount: '500000',
    term: '5 Years',
    investmentAmount: '',
    branch: '',
    description: '',
    validDate: new Date().toISOString().split('T')[0],
    payingTerm: 'Single',
    modeOfPayment: 'Full Payment',
    monthlyInterest: '9167',
    inflationAdjustment: '4167',
    totalMonthlyPayment: '13334',
    expectedLand: '5 Perch',
    vanillaPlants: '60',
    landReservation: '500000',
    year1: '13334',
    year2: '13334',
    year3: '13334',
    year4: '13334',
    year5: '13334',
    cdpPercentage: '05Y - 48% per annum',
    contactNumber: '',
    id_type: 'NIC',
    firstName: '',
    lastName: '',
    email: '',
    idNumber: '',
    isExistingCustomer: false // Track if customer is existing or new
};

// Helper Components moved outside to prevent focus loss issues
const SectionTitle = ({ icon: Icon, title, sectionNumber, bgColor = "bg-primary-50/10", iconColor = "text-primary-600" }) => (
    <div className={cn("px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between print:hidden", bgColor)}>
        <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-lg dark:bg-opacity-20", bgColor.replace('/10', '/20'), iconColor)}>
                <Icon size={14} />
            </div>
            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
        </div>
        {sectionNumber && (
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">
                Section {sectionNumber}
            </span>
        )}
    </div>
);

const FormField = ({ label, name, value, onChange, onBlur, type = "text", placeholder, prefix, options, error, touched, className, disabled, noUppercase, required }) => {
    const hasError = error && touched;
    return (
        <div className={cn("space-y-2 print:space-y-0 text-left", className)}>
            <label className={cn(
                "text-[10px] font-black tracking-widest ml-1 print:text-black print:text-[10px] flex items-center gap-1",
                !noUppercase && "uppercase",
                hasError ? "text-red-500" : "text-gray-400"
            )}>
                {label}
                {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            <div className="relative group">
                {prefix && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[12px] font-bold group-focus-within:text-primary-600 transition-colors z-10 print:hidden">
                        {prefix}
                    </div>
                )}
                {type === 'select' ? (
                    <>
                        <select
                            name={name}
                            value={value || ''}
                            onChange={onChange}
                            onBlur={onBlur}
                            disabled={disabled}
                            className={cn(
                                "w-full pr-10 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white appearance-none cursor-pointer font-mono border-transparent focus:border-primary-500/20",
                                !noUppercase && "uppercase",
                                prefix ? "pl-10" : "pl-4",
                                disabled && "opacity-50 cursor-not-allowed",
                                hasError ? "border-red-500 focus:border-red-500/20" : "",
                                "print:bg-transparent print:border-none print:px-0 print:py-0 print:text-sm print:font-bold print:dark:text-black"
                            )}
                        >
                            <option value="" disabled>Select {label}</option>
                            {options && options.map(opt => (
                                <option key={typeof opt === 'string' ? opt : opt.id || opt.branch_id} value={typeof opt === 'string' ? opt : opt.id || opt.branch_id}>
                                    {typeof opt === 'string' ? opt : opt.name || opt.branch_name || opt.product_name || opt.title || opt.id}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-primary-600 transition-colors" />
                    </>
                ) : type === 'textarea' ? (
                    <textarea
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        rows={3}
                        disabled={disabled}
                        autoComplete="off"
                        className={cn(
                            "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono border-transparent focus:border-primary-500/20 resize-none shadow-sm",
                            !noUppercase && "uppercase",
                            disabled && "opacity-50 cursor-not-allowed",
                            hasError ? "border-red-500 focus:border-red-500/20" : "",
                            "print:bg-transparent print:border-none print:px-0 print:py-0 print:text-sm print:font-bold print:dark:text-black"
                        )}
                    />
                ) : (
                    <input
                        type={type}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        autoComplete="off"
                        className={cn(
                            "w-full pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono border-transparent focus:border-primary-500/20 shadow-sm",
                            !noUppercase && "uppercase",
                            disabled && "opacity-50 cursor-not-allowed",
                            prefix ? "pl-10" : "pl-4",
                            hasError ? "border-red-500 focus:border-red-500/20" : "",
                            "print:bg-transparent print:border-none print:px-0 print:py-0 print:text-sm print:font-bold print:dark:text-black"
                        )}
                    />
                )}
                {hasError && type !== 'textarea' && type !== 'select' && (
                    <AlertCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none" />
                )}
            </div>
            {hasError && (
                <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 tracking-wider print:hidden">{error}</p>
            )}
        </div>
    );
};

const DisplayField = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest print:text-black print:text-[8px]">{label}</span>
        <span className="text-[11px] font-bold text-gray-900 dark:text-white print:text-black">{value}</span>
    </div>
);

const AddQuotation = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { createQuotation, updateQuotation, getQuotationById, currentQuotation } = useQuotation();
    const { customers, getCustomers } = useCustomer();
    const { branches, getBranches } = useBranch();
    const { investments, getInvestments } = useInvestment();
    const isEdit = !!id;

    const [formData, setFormData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getCustomers();
        getBranches();
        getInvestments();
    }, []);

    // Auto-generate full name when first name or last name changes (for new customers)
    useEffect(() => {
        if (!formData.isExistingCustomer) {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            setFormData(prev => ({
                ...prev,
                fullName: fullName || prev.fullName
            }));
        }
    }, [formData.firstName, formData.lastName, formData.isExistingCustomer]);

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return [];
        return (customers || []).filter(c =>
            (c?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c?.id_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, customers]);

    const handleSelectCustomer = (customer) => {
        // Extract first name and last name from customer data
        // Try different possible field names for first name
        const firstName = customer.first_name || customer.f_name || customer.firstName || '';
        const lastName = customer.last_name || customer.l_name || customer.lastName || '';

        setFormData(prev => ({
            ...prev,
            isExistingCustomer: true,
            customer_id: customer.id,
            firstName: firstName,
            lastName: lastName,
            fullName: customer.full_name || customer.fullName || `${firstName} ${lastName}`.trim(),
            nameWithInitials: customer.name_with_initials || customer.nameWithInitials || '',
            nic: customer.id_number || customer.nic || '',
            address: customer.address ||
                `${customer.address_line_1 || ''}${customer.address_line_2 ? ', ' + customer.address_line_2 : ''}${customer.city ? ', ' + customer.city : ''}`.trim(),
            beneficiary: customer.beneficiary || customer.beneficiary_name || '(Not Mentioned)',
            contactNumber: customer.primary_phone || customer.contact_number || customer.phone_primary || customer.contactNumber || '',
            id_type: (customer.id_type || 'NIC').charAt(0).toUpperCase() + (customer.id_type || 'nic').slice(1).toLowerCase(),
            email: customer.email || '',
            idNumber: customer.id_number || ''
        }));
        setSearchTerm(customer.full_name || customer.fullName || `${firstName} ${lastName}`.trim());
        setShowResults(false);
        setErrors(prev => ({ ...prev, customer_id: null }));
    };

    const handleClearCustomer = () => {
        setFormData(prev => ({
            ...prev,
            isExistingCustomer: false,
            customer_id: '',
            fullName: '',
            nameWithInitials: '',
            nic: '',
            address: '',
            beneficiary: '(Not Mentioned)',
            contactNumber: '',
            id_type: 'NIC',
            firstName: '',
            lastName: '',
            email: '',
            idNumber: ''
        }));
        setSearchTerm('');
    };

    useEffect(() => {
        if (id) {
            getQuotationById(id);
        }
    }, [id]);

    useEffect(() => {
        if (id && currentQuotation) {
            const customer = currentQuotation.customer || {};

            // Extract first name and last name from customer data
            const firstName = customer.first_name || customer.f_name || customer.firstName || '';
            const lastName = customer.last_name || customer.l_name || customer.lastName || '';

            setFormData(prev => ({
                ...prev,
                ...currentQuotation,
                isExistingCustomer: true,
                customer_id: currentQuotation.customer_id,
                investment_product_id: currentQuotation.investment_product_id,
                branch_id: currentQuotation.branch_id,
                firstName: firstName,
                lastName: lastName,
                fullName: customer.full_name || customer.fullName || `${firstName} ${lastName}`.trim(),
                nameWithInitials: customer.name_with_initials || customer.nameWithInitials || '',
                nic: customer.id_number || customer.nic || '',
                contactNumber: customer.primary_phone || customer.contact_number || customer.phone_primary || customer.contactNumber || '',
                id_type: (customer.id_type || currentQuotation.id_type || 'NIC').charAt(0).toUpperCase() +
                    (customer.id_type || currentQuotation.id_type || 'nic').slice(1).toLowerCase(),
                email: customer.email || '',
                idNumber: currentQuotation.id_number || customer.id_number || '',
                investmentAmount: String(currentQuotation.investment_amount || ''),
                description: currentQuotation.notes || '',
                validDate: currentQuotation.valid_until ? currentQuotation.valid_until.split('T')[0] :
                    (currentQuotation.created_at ? currentQuotation.created_at.split('T')[0] : prev.validDate)
            }));
            setSearchTerm(customer.full_name || customer.fullName || `${firstName} ${lastName}`.trim() || '');
        }
    }, [id, currentQuotation]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'investmentAmount') {
            // Remove all non-numeric characters for raw value
            const rawValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: rawValue }));
            if (errors.investmentAmount) {
                setErrors(prev => ({ ...prev, investmentAmount: null }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleClear = () => {
        setFormData(initialData);
        setSearchTerm('');
        setShowResults(false);
        setTouched({});
        setErrors({});
    };

    const handlePrint = () => {
        window.print();
    };

    const validateForm = () => {
        const newErrors = {};

        // For new customers, validate required customer fields
        if (!formData.isExistingCustomer) {
            if (!formData.firstName) newErrors.firstName = 'First name is required for new customer';
            if (!formData.lastName) newErrors.lastName = 'Last name is required for new customer';
            if (!formData.id_type) newErrors.id_type = 'ID type is required';
            if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
            if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
        } else {
            // For existing customers, just need customer_id
            if (!formData.customer_id) newErrors.customer_id = 'Customer is required';
        }

        if (!formData.branch_id) newErrors.branch_id = 'Branch is required';
        if (!formData.investment_product_id) newErrors.investment_product_id = 'Investment product is required';
        if (!formData.investmentAmount) {
            newErrors.investmentAmount = 'Investment amount is required';
        } else if (isNaN(formData.investmentAmount) || Number(formData.investmentAmount) < 0) {
            newErrors.investmentAmount = 'Investment amount must be a positive number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (validateForm()) {
            await confirmSave(false);
        } else {
            const allTouched = {};
            Object.keys(formData).forEach(key => allTouched[key] = true);
            setTouched(allTouched);

            toast.error('Please fill all required fields before saving', {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        }
    };

    const confirmSave = async (shouldPrint = false) => {
        let payload;

        if (formData.isExistingCustomer) {
            // Payload for existing customer
            payload = {
                customer_id: Number(formData.customer_id),
                id_number: formData.idNumber,
                branch_id: Number(formData.branch_id),
                investment_product_id: Number(formData.investment_product_id),
                investment_amount: Number(formData.investmentAmount),
                notes: formData.description || ''
            };

            // Only add valid_until if it's provided and not empty
            if (formData.validDate) {
                payload.valid_until = formData.validDate;
            }
        } else {
            // Payload for new customer
            payload = {
                f_name: formData.firstName,
                l_name: formData.lastName,
                full_name: formData.fullName || `${formData.firstName} ${formData.lastName}`.trim(),
                id_type: formData.id_type.toLowerCase(),
                id_number: formData.idNumber,
                phone_primary: formData.contactNumber,
                email: formData.email || undefined, // Only include if provided
                address: formData.address || undefined, // Only include if provided
                branch_id: Number(formData.branch_id),
                investment_product_id: Number(formData.investment_product_id),
                investment_amount: Number(formData.investmentAmount)
            };

            // Only add notes if provided
            if (formData.description) {
                payload.notes = formData.description;
            }

            // Only add valid_until if provided
            if (formData.validDate) {
                payload.valid_until = formData.validDate;
            }
        }

        setIsSaving(true);
        try {
            if (isEdit) {
                await updateQuotation(id, payload);
                toast.success('Quotation updated successfully!');
            } else {
                await createQuotation(payload);
                toast.success('Quotation created successfully!');
            }

            if (shouldPrint) {
                setTimeout(() => window.print(), 500);
            }

            setIsSaveModalOpen(false);
            navigate('/quotation');
        } catch (error) {
            console.error("Failed to save quotation:", error);

            // Handle backend validation errors
            if (error?.response?.data?.errors) {
                const backendErrors = {};
                Object.keys(error.response.data.errors).forEach(key => {
                    backendErrors[key] = error.response.data.errors[key][0];
                });
                setErrors(backendErrors);

                const allTouched = {};
                Object.keys(formData).forEach(key => allTouched[key] = true);
                setTouched(allTouched);

                toast.error('Please check the form for errors', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
                setIsSaveModalOpen(false); // Close modal to show errors
            } else {
                toast.error(typeof error === 'string' ? error : 'Failed to save quotation. Please check your inputs.', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        deleteQuotation(id);
        setIsDeleteModalOpen(false);
        navigate('/quotation');
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                            {isEdit ? 'Quotation Update' : 'New Quotation'}
                        </h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                            {isEdit ? 'Modify existing quotation details and parameters.' : 'Generate a new professional quotation for a client.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/quotation')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-primary-600 font-bold transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                                <ArrowLeft size={14} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider">Back to Quotation</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Form Input Section */}
                <div className="grid grid-cols-1 gap-4 print:hidden">
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <SectionTitle icon={Users} title="Customer" sectionNumber="01" />

                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">Search Existing Customer</label>
                                    {formData.isExistingCustomer && (
                                        <button
                                            onClick={handleClearCustomer}
                                            className="text-[8px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wider flex items-center gap-1"
                                        >
                                            <X size={12} />
                                            Clear Selection
                                        </button>
                                    )}
                                </div>
                                <div className="relative mt-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search by NIC, Name, First Name or Last Name..."
                                        className={cn(
                                            "w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:border-primary-500/30 rounded-lg text-[11px] font-bold outline-none dark:text-white uppercase transition-all shadow-sm",
                                            errors.customer_id ? "border-red-500/50" : "",
                                            formData.isExistingCustomer && "bg-gray-100 dark:bg-gray-700"
                                        )}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowResults(true);
                                        }}
                                        onFocus={() => setShowResults(true)}
                                        disabled={formData.isExistingCustomer}
                                        autoComplete="off"
                                    />
                                    {errors.customer_id && !formData.isExistingCustomer && touched.customer_id && (
                                        <p className="text-[8px] font-bold text-red-500 ml-1 mt-1">{errors.customer_id}</p>
                                    )}
                                    {showResults && searchTerm && !formData.isExistingCustomer && (
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map(customer => {
                                                    const firstName = customer.first_name || customer.f_name || customer.firstName || '';
                                                    const lastName = customer.last_name || customer.l_name || customer.lastName || '';
                                                    const fullName = customer.full_name || customer.fullName || `${firstName} ${lastName}`.trim();

                                                    return (
                                                        <div
                                                            key={customer.id}
                                                            className="px-3 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                                                            onClick={() => handleSelectCustomer(customer)}
                                                        >
                                                            <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase italic">{fullName}</p>
                                                            <div className="flex items-center gap-2 text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                                                                <span>{customer.id_number || 'N/A'}</span>
                                                                <span>•</span>
                                                                <span>{firstName} {lastName}</span>
                                                                {customer.city && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{customer.city}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="px-3 py-4 text-center">
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">No customers found. Fill the form below to create new.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 my-4 pt-4">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                    {formData.isExistingCustomer ? 'Customer Details' : 'New Customer Details'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                {!formData.isExistingCustomer && (
                                    <>
                                        <FormField
                                            label="First Name"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.firstName}
                                            touched={touched.firstName}
                                            required={!formData.isExistingCustomer}
                                        />
                                        <FormField
                                            label="Last Name"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.lastName}
                                            touched={touched.lastName}
                                            required={!formData.isExistingCustomer}
                                        />
                                    </>
                                )}
                                <FormField
                                    label="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled
                                    className={cn(formData.isExistingCustomer && "md:col-span-3")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                                <FormField
                                    label="Contact Number"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.contactNumber}
                                    touched={touched.contactNumber}
                                    disabled={formData.isExistingCustomer}
                                    required={!formData.isExistingCustomer}
                                />
                                <FormField
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    touched={touched.email}
                                    noUppercase
                                    disabled={formData.isExistingCustomer}
                                />
                                <FormField
                                    label="ID Type"
                                    name="id_type"
                                    type="select"
                                    options={['NIC', 'Passport', 'Driving License']}
                                    value={formData.id_type}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.id_type}
                                    touched={touched.id_type}
                                    disabled={formData.isExistingCustomer}
                                    required={!formData.isExistingCustomer}
                                />
                                <FormField
                                    label="ID Number"
                                    name="idNumber"
                                    value={formData.idNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.idNumber}
                                    touched={touched.idNumber}
                                    disabled={formData.isExistingCustomer}
                                    required={!formData.isExistingCustomer}
                                />
                            </div>

                            {/* {formData.address && (
                                <div className="mt-2">
                                    <FormField
                                        label="Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        disabled={formData.isExistingCustomer}
                                        type="textarea"
                                        rows={2}
                                    />
                                </div>
                            )} */}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <SectionTitle icon={Sprout} title="Investment" sectionNumber="02" bgColor="bg-emerald-50/10" iconColor="text-emerald-500" />

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <FormField
                                    label="Branch"
                                    name="branch_id"
                                    type="select"
                                    options={branches}
                                    value={formData.branch_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.branch_id}
                                    touched={touched.branch_id}
                                    required={true}
                                />
                                <FormField
                                    label="Investment Plan"
                                    name="investment_product_id"
                                    type="select"
                                    options={investments}
                                    value={formData.investment_product_id}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.investment_product_id}
                                    touched={touched.investment_product_id}
                                    required={true}
                                />
                                <FormField
                                    label="Investment Amount"
                                    name="investmentAmount"
                                    value={formData.investmentAmount ? formatCurrency(formData.investmentAmount, 0) : ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    prefix="Rs"
                                    error={errors.investmentAmount}
                                    touched={touched.investmentAmount}
                                    required={true}
                                />
                                <FormField
                                    label="Valid Until"
                                    name="validDate"
                                    type="date"
                                    value={formData.validDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.validDate}
                                    touched={touched.validDate}
                                />
                                <div className="md:col-span-4 mt-2">
                                    <FormField
                                        label="Notes"
                                        name="description"
                                        type="textarea"
                                        value={formData.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="Enter additional notes..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/quotation')}
                            className="px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader size={14} className="animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            {isEdit ? 'Update Quotation' : 'Save Quote'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Print Preview Area - Keep as is */}
            <div id="quotation-print-area" className="hidden print:block bg-white text-left font-serif p-8 w-full">
                {/* ... existing print preview code ... */}
            </div>



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
                                    Are you sure you want to delete this quotation? This action cannot be undone.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmDelete}
                                        className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
                                    >
                                        Delete Permanent
                                    </button>
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

            <style>{`
                @media print {
                    body { visibility: hidden; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    #quotation-print-area { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
                    #quotation-print-area * { visibility: visible; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 1cm; size: A4; }
                }
            `}</style>
        </div>
    );
};

export default AddQuotation;
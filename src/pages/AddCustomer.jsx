import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Save,
    User,
    Briefcase,
    Phone,
    Building2,
    Store,
    MessageSquare,
    Globe,
    XCircle,
    ArrowLeft,
    Loader,
    Home,
    ChevronRight,
    Users,
    Search,
    ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCustomer } from '../context/CustomerContext';
import toast from 'react-hot-toast';

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

const FormField = ({ label, name, value, onChange, onBlur, type = "text", placeholder, prefix, options, error, touched, className, disabled, required, max, min }) => {
    const hasError = error && touched;
    return (
        <div className={cn("space-y-1 print:space-y-0", className)}>
            <label className={cn(
                "text-[8px] font-bold uppercase tracking-widest ml-1 print:text-black print:text-[8px] flex items-center gap-1",
                hasError ? "text-red-500" : "text-gray-400"
            )}>
                {label}
                {required && <span className="text-red-500 text-xs">*</span>}
            </label>
            <div className="relative">
                {prefix && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold print:hidden">
                        {prefix}
                    </div>
                )}
                {type === 'select' ? (
                    <select
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={cn(
                            "w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:border-primary-500/30 rounded-lg text-[11px] font-bold outline-none dark:text-white uppercase transition-all",
                            hasError ? "border-red-500/50" : "",
                            disabled && "opacity-50 cursor-not-allowed",
                            "print:bg-transparent print:border-none print:px-0 print:py-0 print:text-sm print:font-bold print:dark:text-black"
                        )}
                    >
                        <option value="" disabled>Select {label}</option>
                        {options && options.map(opt => (
                            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                                {typeof opt === 'string' ? opt : opt.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={3}
                        autoComplete="off"
                        className={cn(
                            "w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:border-primary-500/30 rounded-lg text-[11px] font-bold outline-none dark:text-white transition-all resize-none shadow-sm",
                            hasError ? "border-red-500/50" : "",
                            disabled && "opacity-50 cursor-not-allowed",
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
                        max={max}
                        min={min}
                        autoComplete="off"
                        className={cn(
                            "w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:border-primary-500/30 rounded-lg text-[11px] font-bold outline-none dark:text-white transition-all shadow-sm",
                            prefix && "pl-8",
                            hasError ? "border-red-500/50" : "",
                            disabled && "opacity-50 cursor-not-allowed",
                            "print:bg-transparent print:border-none print:px-0 print:py-0 print:text-sm print:font-bold print:dark:text-black"
                        )}
                    />
                )}
            </div>
            {hasError && (
                <p className="text-[8px] font-bold text-red-500 ml-1">{error}</p>
            )}
        </div>
    );
};

const AddCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { createCustomer, updateCustomer, getCustomerById } = useCustomer();
    const isEditMode = Boolean(id);

    const initialFormState = {
        // Core Identity
        full_name: '',
        name_with_initials: '',
        // customer_code: '',
        id_type: '',
        id_number: '',
        date_of_birth: '',
        preferred_language: '',

        // Geographic
        address_line_1: '',
        address_line_2: '',
        landmark: '',
        city: '',
        state: '',
        country: 'Sri Lanka',
        postal_code: '',

        // Communication
        phone_primary: '',
        phone_secondary: '',
        have_whatsapp: false,
        whatsapp_number: '',
        email: '',

        // Employment
        employment_status: '',
        occupation: '',
        employer_name: '',
        employer_address_line1: '',
        employer_address_line2: '',
        employer_city: '',
        employer_state: '',
        employer_country: '',
        employer_postal_code: '',
        employer_phone: '',
        employer_email: '',

        // Business
        business_name: '',
        business_registration_number: '',
        business_nature: '',
        business_address_line1: '',
        business_address_line2: '',
        business_city: '',
        business_state: '',
        business_country: '',
        business_postal_code: '',
        business_phone: '',
        business_email: '',

        // Status
        is_active: true
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Fetch customer data if in edit mode
    useEffect(() => {
        if (isEditMode && id && !initialLoadDone) {
            const fetchCustomer = async () => {
                try {
                    setIsLoading(true);
                    const response = await getCustomerById(id);

                    if (response?.payload?.data) {
                        const customerData = response.payload.data;

                        // Format the date properly
                        const formattedData = {
                            ...customerData,
                            date_of_birth: customerData.date_of_birth
                                ? new Date(customerData.date_of_birth).toISOString().split('T')[0]
                                : '',
                            have_whatsapp: Boolean(customerData.have_whatsapp)
                        };

                        setFormData(formData => ({
                            ...formData,
                            ...formattedData
                        }));

                        setInitialLoadDone(true);
                    }
                } catch (error) {
                    console.error('Error fetching customer:', error);
                    toast.error('Failed to load customer data', {
                        icon: '⚠️',
                        style: { borderRadius: '12px', background: '#333', color: '#fff' }
                    });
                    navigate('/customers');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchCustomer();
        }
    }, [id, isEditMode, getCustomerById, navigate, initialLoadDone]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.full_name?.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.name_with_initials?.trim()) newErrors.name_with_initials = 'Name with initials is required';
        // if (!formData.customer_code?.trim()) newErrors.customer_code = 'Customer code is required';
        if (!formData.id_type) newErrors.id_type = 'ID type is required';
        if (!formData.id_number?.trim()) newErrors.id_number = 'ID number is required';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.preferred_language) newErrors.preferred_language = 'Preferred language is required';
        if (!formData.employment_status) newErrors.employment_status = 'Employment status is required';
        if (!formData.phone_primary?.trim()) newErrors.phone_primary = 'Primary phone is required';
        if (!formData.address_line_1?.trim()) newErrors.address_line_1 = 'Address line 1 is required';
        if (!formData.city?.trim()) newErrors.city = 'City is required';
        if (!formData.state?.trim()) newErrors.state = 'Province is required';
        if (!formData.country?.trim()) newErrors.country = 'Country is required';

        // Conditional WhatsApp validation
        if (formData.have_whatsapp && !formData.whatsapp_number?.trim()) {
            newErrors.whatsapp_number = 'WhatsApp number is required when WhatsApp is enabled';
        }

        // Email validations if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (formData.employer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employer_email)) {
            newErrors.employer_email = 'Invalid employer email format';
        }
        if (formData.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
            newErrors.business_email = 'Invalid business email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill all required fields', {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });

            // Mark all fields as touched to show errors
            const allTouched = {};
            Object.keys(formData).forEach(key => allTouched[key] = true);
            setTouched(allTouched);

            return;
        }

        setIsSaving(true);
        try {
            // Prepare data for API - remove empty strings and null values
            const submitData = Object.fromEntries(
                Object.entries(formData).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            );

            // Ensure boolean fields are properly formatted
            submitData.have_whatsapp = Boolean(formData.have_whatsapp);
            submitData.is_active = Boolean(formData.is_active);

            console.log('Submitting - isEditMode:', isEditMode, 'id:', id); // Debug log

            if (isEditMode) {
                // Make sure id is a string/number, not an object
                const customerId = id; // id from useParams is already a string
                console.log('Calling updateCustomer with:', customerId, submitData); // Debug log
                await updateCustomer(customerId, submitData); // Pass as separate arguments, not an object
                toast.success('Investor record updated successfully');
            } else {
                await createCustomer(submitData);
                toast.success('New Investor onboarded successfully');
            }
            navigate('/customers');
        } catch (error) {
            console.error('Submission error:', error);

            // Handle validation errors from backend
            if (error?.errors) {
                const backendErrors = {};

                if (Array.isArray(error.errors)) {
                    // Handle array format: [{ field: 'email', messages: ['...'] }]
                    error.errors.forEach(err => {
                        if (err.field && err.messages && err.messages.length > 0) {
                            backendErrors[err.field] = err.messages[0];
                        }
                    });
                } else {
                    // Handle object format: { email: ['...'] }
                    Object.keys(error.errors).forEach(key => {
                        if (Array.isArray(error.errors[key]) && error.errors[key].length > 0) {
                            backendErrors[key] = error.errors[key][0];
                        } else {
                            backendErrors[key] = error.errors[key];
                        }
                    });
                }

                setErrors(backendErrors);

                // Mark all fields as touched to show errors
                const allTouched = {};
                Object.keys(formData).forEach(key => allTouched[key] = true);
                setTouched(allTouched);

                toast.error('Please check the form for errors', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            } else {
                toast.error(error?.message || 'Transaction failed', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/customers');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                    Loading Investor Data...
                </p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                            {isEditMode ? 'Investor Update' : 'New Investor'}
                        </h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                            {isEditMode ? 'Modify existing investor profile information.' : 'Onboard a new investor into the system registry.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/customers')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-primary-600 font-bold transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                                <ArrowLeft size={14} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider">Back to Investor</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                        {/* Section: Core Identity */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                            <SectionTitle icon={User} title="Primary Identity" sectionNumber="01" />

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    <FormField
                                        label="Full Name"
                                        name="full_name"
                                        placeholder="Enter full name"
                                        value={formData.full_name}
                                        error={errors.full_name}
                                        touched={touched.full_name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                    <FormField
                                        label="Name with Initials"
                                        name="name_with_initials"
                                        placeholder="e.g., A.B.C. Perera"
                                        value={formData.name_with_initials}
                                        error={errors.name_with_initials}
                                        touched={touched.name_with_initials}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    {/* <FormField
                                        label="Customer Code"
                                        name="customer_code"
                                        placeholder="e.g., CUST-001"
                                        value={formData.customer_code}
                                        error={errors.customer_code}
                                        touched={touched.customer_code}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={isEditMode}
                                    /> */}
                                    <FormField
                                        label="ID Type"
                                        name="id_type"
                                        type="select"
                                        options={[
                                            { value: 'nic', label: 'NIC' },
                                            { value: 'passport', label: 'Passport' },
                                            { value: 'driving_license', label: 'Driving License' },
                                            { value: 'other', label: 'Other' }
                                        ]}
                                        value={formData.id_type}
                                        error={errors.id_type}
                                        touched={touched.id_type}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                    <FormField
                                        label="ID Number"
                                        name="id_number"
                                        placeholder="Enter ID number"
                                        value={formData.id_number}
                                        error={errors.id_number}
                                        touched={touched.id_number}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    <FormField
                                        label="Date of Birth"
                                        name="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        error={errors.date_of_birth}
                                        touched={touched.date_of_birth}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                        max={new Date().toISOString().split("T")[0]}
                                    />
                                    <FormField
                                        label="Preferred Language"
                                        name="preferred_language"
                                        type="select"
                                        options={[
                                            { value: 'english', label: 'English' },
                                            { value: 'sinhala', label: 'Sinhala' },
                                            { value: 'tamil', label: 'Tamil' }
                                        ]}
                                        value={formData.preferred_language}
                                        error={errors.preferred_language}
                                        touched={touched.preferred_language}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Geographic Hub */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                            <SectionTitle icon={Globe} title="Address Details" sectionNumber="02" bgColor="bg-emerald-50/10" iconColor="text-emerald-500" />

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    <FormField
                                        label="Address Line 1"
                                        name="address_line_1"
                                        placeholder="Street address"
                                        value={formData.address_line_1}
                                        error={errors.address_line_1}
                                        touched={touched.address_line_1}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                    <FormField
                                        label="Address Line 2"
                                        name="address_line_2"
                                        placeholder="Apartment, suite, etc."
                                        value={formData.address_line_2}
                                        error={errors.address_line_2}
                                        touched={touched.address_line_2}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                    <FormField
                                        label="Landmark"
                                        name="landmark"
                                        placeholder="Nearby landmark"
                                        value={formData.landmark}
                                        error={errors.landmark}
                                        touched={touched.landmark}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <FormField
                                        label="City"
                                        name="city"
                                        placeholder="City / Town"
                                        value={formData.city}
                                        error={errors.city}
                                        touched={touched.city}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                    <FormField
                                        label="Province"
                                        name="state"
                                        placeholder="Province"
                                        value={formData.state}
                                        error={errors.state}
                                        touched={touched.state}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    <FormField
                                        label="Country"
                                        name="country"
                                        placeholder="Country"
                                        value={formData.country}
                                        error={errors.country}
                                        touched={touched.country}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                    <FormField
                                        label="Postal Code"
                                        name="postal_code"
                                        placeholder="Postal code"
                                        value={formData.postal_code}
                                        error={errors.postal_code}
                                        touched={touched.postal_code}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Telemetry */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                            <SectionTitle icon={Phone} title="Contact Details" sectionNumber="03" bgColor="bg-primary-50/10" iconColor="text-primary-600" />

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                    <FormField
                                        label="Primary Phone"
                                        name="phone_primary"
                                        placeholder="+94 77 123 4567"
                                        value={formData.phone_primary}
                                        error={errors.phone_primary}
                                        touched={touched.phone_primary}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required={true}
                                    />
                                    <FormField
                                        label="Secondary Phone"
                                        name="phone_secondary"
                                        placeholder="+94 77 123 4567"
                                        value={formData.phone_secondary}
                                        error={errors.phone_secondary}
                                        touched={touched.phone_secondary}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    <FormField
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        placeholder="investor@example.com"
                                        value={formData.email}
                                        error={errors.email}
                                        touched={touched.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "p-2 rounded-lg transition-all",
                                                formData.have_whatsapp ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400 dark:bg-gray-800"
                                            )}>
                                                <MessageSquare size={14} />
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-900 dark:text-white uppercase">WhatsApp Available</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="have_whatsapp"
                                                className="sr-only peer"
                                                checked={formData.have_whatsapp}
                                                onChange={handleChange}
                                            />
                                            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>

                                    {formData.have_whatsapp && (
                                        <div className="animate-in slide-in-from-top-1 duration-200 pt-2">
                                            <FormField
                                                label="WhatsApp Number"
                                                name="whatsapp_number"
                                                placeholder="+94 77 123 4567"
                                                value={formData.whatsapp_number}
                                                error={errors.whatsapp_number}
                                                touched={touched.whatsapp_number}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required={formData.have_whatsapp}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section: Operational Sector */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                            <SectionTitle icon={Briefcase} title="Employment Details" sectionNumber="04" bgColor="bg-primary-50/10" iconColor="text-primary-600" />

                            <div className="p-4 space-y-4">
                                <FormField
                                    label="Employment Status"
                                    name="employment_status"
                                    type="select"
                                    options={[
                                        { value: 'employed', label: 'Employed' },
                                        { value: 'self_employed', label: 'Self Employed' },
                                        { value: 'business', label: 'Business Owner' },
                                        { value: 'unemployed', label: 'Unemployed' },
                                        { value: 'retired', label: 'Retired' },
                                        { value: 'student', label: 'Student' }
                                    ]}
                                    value={formData.employment_status}
                                    error={errors.employment_status}
                                    touched={touched.employment_status}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required={true}
                                />

                                {/* Employment Details */}
                                {formData.employment_status === 'employed' && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-4 bg-primary-50/20 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100/50">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-primary-600" />
                                            <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest">Employment Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <FormField
                                                label="Occupation"
                                                name="occupation"
                                                placeholder="Job title"
                                                value={formData.occupation}
                                                error={errors.occupation}
                                                touched={touched.occupation}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <FormField
                                                label="Employer Name"
                                                name="employer_name"
                                                placeholder="Company name"
                                                value={formData.employer_name}
                                                error={errors.employer_name}
                                                touched={touched.employer_name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                        <FormField
                                            label="Employer Address"
                                            name="employer_address_line1"
                                            placeholder="Employer address"
                                            value={formData.employer_address_line1}
                                            error={errors.employer_address_line1}
                                            touched={touched.employer_address_line1}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                            <FormField
                                                label="Employer City"
                                                name="employer_city"
                                                placeholder="Employer city"
                                                value={formData.employer_city}
                                                error={errors.employer_city}
                                                touched={touched.employer_city}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <FormField
                                                label="Employer Phone"
                                                name="employer_phone"
                                                placeholder="+94 77 123 4567"
                                                value={formData.employer_phone}
                                                error={errors.employer_phone}
                                                touched={touched.employer_phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <FormField
                                                label="Employer Email"
                                                name="employer_email"
                                                type="email"
                                                placeholder="hr@company.com"
                                                value={formData.employer_email}
                                                error={errors.employer_email}
                                                touched={touched.employer_email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Business Details */}
                                {(formData.employment_status === 'business' || formData.employment_status === 'self_employed') && (
                                    <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-4 bg-emerald-50/20 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100/50">
                                        <div className="flex items-center gap-2">
                                            <Store size={14} className="text-emerald-600" />
                                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Business Details</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <FormField
                                                label="Business Name"
                                                name="business_name"
                                                placeholder="Business name"
                                                value={formData.business_name}
                                                error={errors.business_name}
                                                touched={touched.business_name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <FormField
                                                label="Registration Number"
                                                name="business_registration_number"
                                                placeholder="BR number"
                                                value={formData.business_registration_number}
                                                error={errors.business_registration_number}
                                                touched={touched.business_registration_number}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                        <FormField
                                            label="Nature of Business"
                                            name="business_nature"
                                            placeholder="e.g., Retail, Services"
                                            value={formData.business_nature}
                                            error={errors.business_nature}
                                            touched={touched.business_nature}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <FormField
                                                label="Business Phone"
                                                name="business_phone"
                                                placeholder="+94 77 123 4567"
                                                value={formData.business_phone}
                                                error={errors.business_phone}
                                                touched={touched.business_phone}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                            <FormField
                                                label="Business Email"
                                                name="business_email"
                                                type="email"
                                                placeholder="info@business.com"
                                                value={formData.business_email}
                                                error={errors.business_email}
                                                touched={touched.business_email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/customers')}
                                className="px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSaving}
                                className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader size={14} className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={14} /> {isEditMode ? 'Update Investor' : 'Save'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCustomer;
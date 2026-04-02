import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit2,
    User,
    Briefcase,
    Phone,
    Building2,
    Store,
    MessageSquare,
    Globe,
    Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCustomer } from '../context/CustomerContext';
import Breadcrumb from '../components/common/Breadcrumbs';

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

const FormField = ({ label, value, type = "text", prefix, options, className }) => {
    return (
        <div className={cn("space-y-1 print:space-y-0", className)}>
            <label className="text-[8px] font-bold uppercase tracking-widest ml-1 print:text-black print:text-[8px] flex items-center gap-1 text-gray-500">
                {label}
            </label>
            <div className="relative">
                {prefix && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold print:hidden">
                        {prefix}
                    </div>
                )}
                {type === 'select' ? (
                    <select
                        value={value || ''}
                        disabled
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[11px] font-bold outline-none dark:text-white uppercase opacity-80 cursor-default"
                    >
                        <option value="" disabled>NOT SPECIFIED</option>
                        {options && options.map(opt => (
                            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
                                {typeof opt === 'string' ? opt : opt.label}
                            </option>
                        ))}
                    </select>
                ) : type === 'textarea' ? (
                    <textarea
                        value={value || ''}
                        disabled
                        rows={3}
                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[11px] font-bold outline-none dark:text-white resize-none shadow-sm opacity-80 cursor-default"
                    />
                ) : (
                    <input
                        type={type}
                        value={value || ''}
                        disabled
                        className={cn(
                            "w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[11px] font-bold outline-none dark:text-white shadow-sm opacity-80 cursor-default",
                            prefix && "pl-8"
                        )}
                    />
                )}
            </div>
        </div>
    );
};

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getCustomerById, deleteCustomer } = useCustomer();
    const [customer, setCustomer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setIsLoading(true);
                const response = await getCustomerById(id);

                const customerData = response?.payload?.data || response?.data?.data || response;

                if (customerData) {
                    const formattedData = {
                        ...customerData,
                        date_of_birth: customerData.date_of_birth
                            ? new Date(customerData.date_of_birth).toISOString().split('T')[0]
                            : '',
                        created_at: customerData.created_at
                            ? new Date(customerData.created_at).toLocaleDateString('en-US')
                            : 'NOT SPECIFIED',
                        have_whatsapp: Boolean(customerData.have_whatsapp)
                    };
                    setCustomer(formattedData);
                }
            } catch (error) {
                console.error("Failed to fetch customer details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchCustomer();
        }
    }, [id, getCustomerById]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCustomer(id);
            navigate('/customers');
        } catch (error) {
            console.error('Failed to delete customer:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.4em] animate-pulse">Accessing Intelligence Node...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="max-w-[1000px] mx-auto p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <User size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Target not found in registry</p>
                <button
                    onClick={() => navigate('/customers')}
                    className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                >
                    Return to Hub
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                            Investor Details
                        </h1>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                            Detailed profile information for: {customer.full_name || 'Unknown'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/customers')}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-primary-600 font-bold transition-colors group mr-2"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                                <ArrowLeft size={14} />
                            </div>
                            <span className="text-[10px] uppercase tracking-wider">Back to Investor</span>
                        </button>
                        <button
                            onClick={() => navigate(`/customers/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-xl text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm active:scale-95"
                        >
                            <Edit2 size={14} />
                            Update Investor
                        </button>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 rounded-xl text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm active:scale-95"
                        >
                            <Trash2 size={14} />
                            Delete Investor
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-6">
                    {/* Section: Core Identity */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <SectionTitle icon={User} title="Primary Identity" sectionNumber="01" />

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <FormField
                                    label="Full Name"
                                    value={customer.full_name}
                                />
                                <FormField
                                    label="Name with Initials"
                                    value={customer.name_with_initials}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <FormField
                                    label="ID Type"
                                    type="select"
                                    options={[
                                        { value: 'nic', label: 'NIC' },
                                        { value: 'passport', label: 'Passport' },
                                        { value: 'driving_license', label: 'Driving License' },
                                        { value: 'other', label: 'Other' }
                                    ]}
                                    value={customer.id_type}
                                />
                                <FormField
                                    label="ID Number"
                                    value={customer.id_number}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <FormField
                                    label="Date of Birth"
                                    type="date"
                                    value={customer.date_of_birth}
                                />
                                <FormField
                                    label="Preferred Language"
                                    type="select"
                                    options={[
                                        { value: 'english', label: 'English' },
                                        { value: 'sinhala', label: 'Sinhala' },
                                        { value: 'tamil', label: 'Tamil' }
                                    ]}
                                    value={customer.preferred_language}
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
                                    value={customer.address_line_1}
                                />
                                <FormField
                                    label="Address Line 2"
                                    value={customer.address_line_2}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                <FormField
                                    label="Landmark"
                                    value={customer.landmark}
                                />
                                <FormField
                                    label="City"
                                    value={customer.city}
                                />
                                <FormField
                                    label="Province"
                                    value={customer.state}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                <FormField
                                    label="Country"
                                    value={customer.country}
                                />
                                <FormField
                                    label="Postal Code"
                                    value={customer.postal_code}
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
                                    value={customer.phone_primary}
                                />
                                <FormField
                                    label="Secondary Phone"
                                    value={customer.phone_secondary}
                                />
                                <FormField
                                    label="Email Address"
                                    type="email"
                                    value={customer.email}
                                />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "p-2 rounded-lg transition-all",
                                            customer.have_whatsapp ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400 dark:bg-gray-800"
                                        )}>
                                            <MessageSquare size={14} />
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-900 dark:text-white uppercase">WhatsApp Available</span>
                                    </div>
                                    <label className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={customer.have_whatsapp}
                                            disabled
                                        />
                                        <div className="w-10 h-5 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500 opacity-80 cursor-default"></div>
                                    </label>
                                </div>

                                {customer.have_whatsapp && (
                                    <div className="animate-in slide-in-from-top-1 duration-200 pt-2">
                                        <FormField
                                            label="WhatsApp Number"
                                            value={customer.whatsapp_number}
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
                                type="select"
                                options={[
                                    { value: 'employed', label: 'Employed' },
                                    { value: 'self_employed', label: 'Self Employed' },
                                    { value: 'business', label: 'Business Owner' },
                                    { value: 'unemployed', label: 'Unemployed' },
                                    { value: 'retired', label: 'Retired' },
                                    { value: 'student', label: 'Student' }
                                ]}
                                value={customer.employment_status}
                            />

                            {/* Employment Details */}
                            {customer.employment_status === 'employed' && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-4 bg-primary-50/20 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100/50">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={14} className="text-primary-600" />
                                        <span className="text-[9px] font-bold text-primary-600 uppercase tracking-widest">Employment Details</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        <FormField
                                            label="Occupation"
                                            value={customer.occupation}
                                        />
                                        <FormField
                                            label="Employer Name"
                                            value={customer.employer_name}
                                        />
                                    </div>
                                    <FormField
                                        label="Employer Address"
                                        value={customer.employer_address_line1}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                        <FormField
                                            label="Employer City"
                                            value={customer.employer_city}
                                        />
                                        <FormField
                                            label="Employer Phone"
                                            value={customer.employer_phone}
                                        />
                                        <FormField
                                            label="Employer Email"
                                            type="email"
                                            value={customer.employer_email}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Business Details */}
                            {(customer.employment_status === 'business' || customer.employment_status === 'self_employed') && (
                                <div className="animate-in fade-in slide-in-from-top-1 duration-200 space-y-4 bg-emerald-50/20 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100/50">
                                    <div className="flex items-center gap-2">
                                        <Store size={14} className="text-emerald-600" />
                                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Business Details</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        <FormField
                                            label="Business Name"
                                            value={customer.business_name}
                                        />
                                        <FormField
                                            label="Registration Number"
                                            value={customer.business_registration_number}
                                        />
                                    </div>
                                    <FormField
                                        label="Nature of Business"
                                        value={customer.business_nature}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        <FormField
                                            label="Business Phone"
                                            value={customer.business_phone}
                                        />
                                        <FormField
                                            label="Business Email"
                                            type="email"
                                            value={customer.business_email}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center mx-auto">
                            <Trash2 size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Delete Investor</h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                This action will permanently remove <span className="text-red-500">{customer.full_name}</span> from the central database.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-100 dark:border-gray-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all"
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetails;
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Save,
    Target,
    ChevronDown,
    CheckCircle,
    Calendar,
    ArrowLeft,
    Home,
    ChevronRight,
    Layers,
    XCircle
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useTarget } from '../context/TargetContext';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Custom FormInput to match original styling
const FormInput = ({
    label,
    name,
    type = "text",
    placeholder,
    options,
    required,
    value,
    error,
    touched,
    onChange,
    onBlur,
    disabled = false
}) => {
    const hasError = error && touched;

    return (
        <div className="space-y-2 text-left">
            <label className={cn(
                "text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1",
                hasError ? "text-red-500" : "text-gray-400"
            )}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {type === 'select' ? (
                <div className="relative">
                    <select
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        onBlur={onBlur}
                        disabled={disabled}
                        className={cn(
                            "w-full pl-6 pr-10 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white appearance-none cursor-pointer",
                            hasError
                                ? "border-red-300 focus:border-red-500"
                                : "border-transparent focus:border-primary-500/20"
                        )}
                    >
                        <option value="">Select {label}</option>
                        {options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        "w-full px-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white",
                        hasError
                            ? "border-red-300 focus:border-red-500"
                            : "border-transparent focus:border-primary-500/20"
                    )}
                    autoComplete="off"
                />
            )}

            {hasError && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                    <XCircle size={12} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

const TargetForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const {
        createTarget,
        updateTarget,
        getTargetById,
        currentTarget,
        isLoading: targetsLoading,
        validationErrors,
        resetError,
        resetCurrentTarget
    } = useTarget();
    const { users, getUsers, isLoading: usersLoading } = useUser();
    const { user: currentUser } = useAuth();

    console.log("CurrentUser: ", currentUser);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const initialFormState = {
        user_id: '',
        period_type: 'month',
        period_key: currentMonth,
        target_amount: '',
        status: 'active'
    };

    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Fetch users on mount
    useEffect(() => {
        getUsers({ page: 1, per_page: 1000 });

        // Reset current target when component unmounts
        return () => {
            resetCurrentTarget();
        };
    }, []);

    // Filter users locally based on hierarchy
    const filteredUsers = React.useMemo(() => {
        if (!users || !users.length) return [];
        
        // Admins and Super Admins can see everyone
        const isAdmin = currentUser?.user_type === 'admin' || 
                        currentUser?.roles?.some(r => r.name.toLowerCase().includes('admin'));
                        
        if (isAdmin) {
            return users;
        }

        // For other users: display users whose parent id is the same as the logged user
        return users.filter(u => u.parent_user_id === currentUser?.id);
    }, [users, currentUser]);

    // Fetch target data if in edit mode
    useEffect(() => {
        if (isEdit && id && !initialLoadDone) {
            const fetchTarget = async () => {
                try {
                    setIsLoading(true);
                    const response = await getTargetById(id);

                    if (response?.payload?.data) {
                        const targetData = response.payload.data;
                        setFormData({
                            user_id: targetData.user_id?.toString() || '',
                            period_type: targetData.period_type || 'month',
                            period_key: targetData.period_key || '',
                            target_amount: targetData.target_amount || '',
                            status: targetData.status || 'active'
                        });
                        setInitialLoadDone(true);
                    }
                } catch (error) {
                    console.error('Error fetching target:', error);
                    toast.error('Failed to load target data');
                    navigate('/targets-config');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchTarget();
        }
    }, [id, isEdit, getTargetById, navigate, initialLoadDone]);

    // Handle validation errors from API
    useEffect(() => {
        if (validationErrors) {
            const backendErrors = {};
            Object.keys(validationErrors).forEach(key => {
                backendErrors[key] = Array.isArray(validationErrors[key])
                    ? validationErrors[key][0]
                    : validationErrors[key];
            });
            setErrors(backendErrors);

            // Mark all fields as touched to show errors
            const allTouched = {};
            Object.keys(formData).forEach(key => allTouched[key] = true);
            setTouched(allTouched);
        }
    }, [validationErrors]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;

        let processedValue = value;
        if (name === 'target_amount') {
            // Remove non-numeric characters except decimal point
            processedValue = value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = processedValue.split('.');
            processedValue = parts.length > 2
                ? parts[0] + '.' + parts.slice(1).join('')
                : processedValue;
        } else if (type === 'checkbox') {
            processedValue = checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
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
        if (!formData.user_id) newErrors.user_id = 'User is required';
        if (!formData.period_type) newErrors.period_type = 'Period type is required';

        // Period key validation
        if (!formData.period_key?.trim()) {
            newErrors.period_key = 'Period key is required';
        } else {
            // Validate period key format based on period type
            if (formData.period_type === 'month') {
                if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(formData.period_key)) {
                    newErrors.period_key = 'Period key must be in YYYY-MM format';
                }
            } else if (formData.period_type === 'quarter') {
                if (!/^\d{4}-Q[1-4]$/.test(formData.period_key)) {
                    newErrors.period_key = 'Period key must be in YYYY-QX format';
                }
            } else if (formData.period_type === 'year') {
                if (!/^\d{4}$/.test(formData.period_key)) {
                    newErrors.period_key = 'Period key must be in YYYY format';
                }
            }
        }

        // Target amount validation
        if (!formData.target_amount?.trim()) {
            newErrors.target_amount = 'Target amount is required';
        } else {
            const amount = parseFloat(formData.target_amount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.target_amount = 'Target amount must be greater than 0';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill all required fields');

            // Mark all fields as touched to show errors
            const allTouched = {};
            Object.keys(formData).forEach(key => allTouched[key] = true);
            setTouched(allTouched);

            return;
        }

        setIsSaving(true);
        try {
            // Prepare data for API
            const submitData = {
                user_id: parseInt(formData.user_id),
                period_type: formData.period_type,
                period_key: formData.period_key,
                target_amount: parseFloat(formData.target_amount),
                status: formData.status
            };

            let response;
            if (isEdit) {
                response = await updateTarget(id, submitData);
            } else {
                response = await createTarget(submitData);
            }

            // Check if the response has an error payload
            if (response?.error) {
                // Handle the specific period_key duplicate error
                if (response.payload?.errors) {
                    const periodKeyError = response.payload.errors.find(
                        err => err.field === 'period_key'
                    );

                    if (periodKeyError) {
                        toast.error('Target already exists for this user in the selected period', {
                            icon: '⚠️',
                            style: { borderRadius: '12px', background: '#333', color: '#fff' }
                        });

                        // Set field error for period_key
                        setErrors(prev => ({
                            ...prev,
                            period_key: 'Target already exists for this user in this period'
                        }));
                        setTouched(prev => ({ ...prev, period_key: true }));
                    } else {
                        // Handle other validation errors
                        toast.error('Please check the form for errors');
                    }
                } else {
                    toast.error(response.payload?.message || 'Failed to save target');
                }
                return;
            }

            // Only show success and navigate if there's no error
            if (isEdit) {
                toast.success('Target updated successfully', {
                    icon: '✓',
                    style: { borderRadius: '12px', background: '#10b981', color: '#fff' }
                });
            } else {
                toast.success('New target created successfully', {
                    icon: '✓',
                    style: { borderRadius: '12px', background: '#10b981', color: '#fff' }
                });
            }
            navigate('/targets-config');

        } catch (error) {
            console.error('Submission error:', error);

            // Handle different error formats
            if (error.response?.data) {
                const errorData = error.response.data;

                // Check for the specific period_key duplicate error format
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const periodKeyError = errorData.errors.find(
                        err => err.field === 'period_key'
                    );

                    if (periodKeyError) {
                        toast.error('Target already exists for this user in the selected period', {
                            icon: '⚠️',
                            style: { borderRadius: '12px', background: '#333', color: '#fff' }
                        });

                        // Set field error for period_key
                        setErrors(prev => ({
                            ...prev,
                            period_key: 'Target already exists for this user in this period'
                        }));
                        setTouched(prev => ({ ...prev, period_key: true }));
                    } else {
                        // Handle other validation errors
                        const backendErrors = {};
                        errorData.errors.forEach(err => {
                            if (err.field && err.messages && err.messages[0]) {
                                backendErrors[err.field] = err.messages[0];
                            }
                        });

                        setErrors(backendErrors);

                        // Mark all fields as touched to show errors
                        const allTouched = {};
                        Object.keys(formData).forEach(key => allTouched[key] = true);
                        setTouched(allTouched);

                        toast.error(errorData.message || 'Please check the form for errors', {
                            icon: '⚠️',
                            style: { borderRadius: '12px', background: '#333', color: '#fff' }
                        });
                    }
                } else if (errorData.errors && typeof errorData.errors === 'object') {
                    // Handle object format errors
                    const backendErrors = {};
                    Object.keys(errorData.errors).forEach(key => {
                        backendErrors[key] = Array.isArray(errorData.errors[key])
                            ? errorData.errors[key][0]
                            : errorData.errors[key];
                    });
                    setErrors(backendErrors);

                    // Mark all fields as touched to show errors
                    const allTouched = {};
                    Object.keys(formData).forEach(key => allTouched[key] = true);
                    setTouched(allTouched);

                    toast.error(errorData.message || 'Please check the form for errors', {
                        icon: '⚠️',
                        style: { borderRadius: '12px', background: '#333', color: '#fff' }
                    });
                } else {
                    toast.error(errorData.message || 'Failed to save target', {
                        icon: '⚠️',
                        style: { borderRadius: '12px', background: '#333', color: '#fff' }
                    });
                }
            } else {
                toast.error(error?.message || 'Failed to save target', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || usersLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Target Data...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                        {isEdit ? 'Target Modification' : 'New Target'}
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        {isEdit ? 'Update existing performance objectives.' : 'Define new performance targets for team members.'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/targets-config')}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-primary-600 font-bold transition-colors group"
                >
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                        <ArrowLeft size={14} />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider">Back to Matrix</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Assignment Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-gray-50/30 dark:bg-gray-800/20">
                            <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                <Layers size={14} />
                            </div>
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">User Assignment</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <FormInput
                                label="User"
                                name="user_id"
                                type="select"
                                required
                                options={filteredUsers?.map(user => ({
                                    value: user.id,
                                    label: `${user.name} (${user.email})`
                                }))}
                                value={formData.user_id}
                                error={errors.user_id}
                                touched={touched.user_id}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </div>
                    </div>

                    {/* Period & Amount Section */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-gray-50/30 dark:bg-gray-800/20">
                            <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                <Calendar size={14} />
                            </div>
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Timeframe & Capital</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Period Type"
                                    name="period_type"
                                    type="select"
                                    required
                                    options={[
                                        { value: 'month', label: 'Monthly' },
                                        { value: 'quarter', label: 'Quarterly' },
                                        { value: 'year', label: 'Annual' }
                                    ]}
                                    value={formData.period_type}
                                    error={errors.period_type}
                                    touched={touched.period_type}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />

                                <FormInput
                                    label="Period Key"
                                    name="period_key"
                                    required
                                    placeholder={formData.period_type === 'month' ? 'YYYY-MM' : formData.period_type === 'quarter' ? 'YYYY-QX' : 'YYYY'}
                                    value={formData.period_key}
                                    error={errors.period_key}
                                    touched={touched.period_key}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>

                            <FormInput
                                label="Target Amount (LKR)"
                                name="target_amount"
                                required
                                placeholder="e.g. 1,000,000"
                                value={formData.target_amount ? formatCurrency(formData.target_amount, 0) : ''}
                                error={errors.target_amount}
                                touched={touched.target_amount}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                        <div className="flex items-center justify-between p-2 cursor-pointer group"
                            onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    formData.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400"
                                )}>
                                    <CheckCircle size={20} className={cn(formData.status === 'active' && "animate-pulse")} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Deployment Status</div>
                                    <div className="text-[10px] font-medium text-gray-400 group-hover:text-gray-500">
                                        {formData.status === 'active' ? 'Objective is currently active' : 'Objective is temporarily disabled'}
                                    </div>
                                </div>
                            </div>
                            <div className={cn(
                                "w-12 h-6 rounded-full p-1 transition-colors duration-300",
                                formData.status === 'active' ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                            )}>
                                <div className={cn(
                                    "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
                                    formData.status === 'active' ? "translate-x-6" : "translate-x-0"
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/targets-config')}
                            className="px-8 py-3 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 hover:bg-red-50/50 transition-all ml-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {isEdit ? 'Update Protocol' : 'save '}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TargetForm;
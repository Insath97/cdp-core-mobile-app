import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ChevronRight,
    Home,
    Building2,
    Save,
    X,
    ShieldCheck,
    MapPin,
    User,
    Check,
    Phone,
    Mail,
    Globe,
    Layers,
    Calendar,
    Target,
    ArrowLeft,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

// Contexts
import { useBranch } from '../context/BranchContext';
import { useZone } from '../context/ZoneContext';
import { useRegion } from '../context/RegionContext';
import { useProvince } from '../context/ProvinceContext';

const BranchForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    // Context Data
    const { createBranch, updateBranch, getBranchById, currentBranch, isLoading: branchLoading } = useBranch();
    const { zones, getZones } = useZone();
    const { regions, getRegions } = useRegion();
    const { provinces, getProvinces } = useProvince();

    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address_line1: '',
        address_line2: '',
        city: '',
        postal_code: '',
        zone_id: '',
        region_id: '',
        province_id: '',
        phone_primary: '',
        phone_secondary: '',
        email: '',
        fax: '',
        opening_date: '',
        branch_type: 'city',
        latitude: '',
        longitude: '',
        is_active: true,
        is_head_office: false
    });

    // Initial Data Fetch
    useEffect(() => {
        getZones();
        getRegions();
        getProvinces();
        if (isEdit) {
            getBranchById(id);
        }
    }, [id, isEdit]);

    // Populate form if editing
    useEffect(() => {
        if (isEdit && currentBranch) {
            setFormData({
                name: currentBranch.name || '',
                code: currentBranch.code || '',
                address_line1: currentBranch.address_line1 || '',
                address_line2: currentBranch.address_line2 || '',
                city: currentBranch.city || '',
                postal_code: currentBranch.postal_code || '',
                zone_id: currentBranch.zone_id || currentBranch.zone?.id || '',
                region_id: currentBranch.region_id || currentBranch.region?.id || '',
                province_id: currentBranch.province_id || currentBranch.province?.id || '',
                phone_primary: currentBranch.phone_primary || '',
                phone_secondary: currentBranch.phone_secondary || '',
                email: currentBranch.email || '',
                fax: currentBranch.fax || '',
                opening_date: currentBranch.opening_date ? currentBranch.opening_date.split('T')[0] : '',
                branch_type: currentBranch.branch_type || 'city',
                latitude: currentBranch.latitude || '',
                longitude: currentBranch.longitude || '',
                is_active: currentBranch.is_active ?? true,
                is_head_office: currentBranch.is_head_office ?? false
            });
        }
    }, [currentBranch, isEdit]);

    // Dependent Dropdown Logic for Province → Zone → Region
    const availableZones = useMemo(() => {
        if (!formData.province_id) return [];
        // Filter zones by selected province
        // Note: This assumes zones have a province_id field
        return zones.filter(z => z.province_id == formData.province_id);
    }, [zones, formData.province_id]);

    const availableRegions = useMemo(() => {
        if (!formData.zone_id) return [];
        // Filter regions by selected zone
        // Note: This assumes regions have a zone_id field
        return regions.filter(r => r.zone_id == formData.zone_id);
    }, [regions, formData.zone_id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing or changing selection
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const errors = {};
        if (!formData.name?.trim()) errors.name = 'Branch Name is required';
        if (!formData.code?.trim()) errors.code = 'Branch Code is required';
        if (!formData.address_line1?.trim()) errors.address_line1 = 'Address Line 1 is required';
        if (!formData.city?.trim()) errors.city = 'City is required';
        if (!formData.province_id) errors.province_id = 'Province is required';
        if (!formData.zone_id) errors.zone_id = 'Zone is required';
        if (!formData.region_id) errors.region_id = 'Region is required';
        if (!formData.phone_primary?.trim()) errors.phone_primary = 'Primary Phone is required';
        if (!formData.opening_date) errors.opening_date = 'Opening Date is required';
        if (!formData.branch_type) errors.branch_type = 'Branch Type is required';

        // Basic Regex for Email
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid Email Address';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Please correct the highlighted errors');
            return;
        }

        const loadingToast = toast.loading(isEdit ? 'Updating unit...' : 'Saving branch...');

        try {
            if (isEdit) {
                await updateBranch(id, formData);
            } else {
                await createBranch(formData);
            }
            toast.success(isEdit ? 'Branch updated successfully' : 'Branch created successfully', { id: loadingToast });
            navigate('/branches');
        } catch (error) {
            console.error("Failed to save branch:", error);
            // Handle backend validation errors
            if (error.response?.data?.errors) {
                const backendErrors = {};
                Object.keys(error.response.data.errors).forEach(key => {
                    backendErrors[key] = error.response.data.errors[key][0];
                });
                setFormErrors(backendErrors);
                toast.error('Validation failed. Please check the fields.', { id: loadingToast });
            } else {
                toast.error(error.message || 'Failed to save branch', { id: loadingToast });
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                        {isEdit ? 'Branch Update' : 'New Branch'}
                    </h1>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        {isEdit ? 'Modify existing branch parameters and settings.' : 'Add a new branch to the network.'}
                    </p>
                </div>
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate('/branches')}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-primary-600 font-bold transition-colors group"
                    >
                        <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                            <ArrowLeft size={14} />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider">Back to Branch Management</span>
                    </button>
                </div>
            </div>

            <div className="space-y-6 relative">
                {branchLoading && isEdit && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm rounded-3xl py-40 space-y-4">
                        <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                            Syncing Tactical Data...
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* General Information */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                    <Layers size={14} />
                                </div>
                                <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">General Information</h3>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-100 dark:border-gray-700">Section 01</span>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={cn(
                                            "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                            formErrors.name ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        placeholder="e.g. KANDY CITY"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                    />
                                    {formErrors.name && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle size={10} /> {formErrors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Code</label>
                                    <input
                                        type="text"
                                        name="code"
                                        className={cn(
                                            "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                            formErrors.code ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        placeholder="e.g. BR001"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                    />
                                    {formErrors.code && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle size={10} /> {formErrors.code}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch Type</label>
                                    <select
                                        name="branch_type"
                                        className={cn(
                                            "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                            formErrors.branch_type ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.branch_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="main">Main Branch</option>
                                        <option value="city">City Branch</option>
                                        <option value="satellite">Satellite Branch</option>
                                        <option value="mobile">Mobile Branch</option>
                                    </select>
                                    {formErrors.branch_type && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle size={10} /> {formErrors.branch_type}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Opening Date</label>
                                    <input
                                        type="date"
                                        name="opening_date"
                                        className={cn(
                                            "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                            formErrors.opening_date ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.opening_date}
                                        onChange={handleInputChange}
                                        min="1901-01-01"
                                        max="2100-12-31"
                                    />
                                    {formErrors.opening_date && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle size={10} /> {formErrors.opening_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-50 dark:border-gray-800">
                                <div
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => setFormData(p => ({ ...p, is_head_office: !p.is_head_office }))}
                                >
                                    <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center transition-all", formData.is_head_office ? "bg-primary-600 border-primary-600 text-white" : "border-gray-200 dark:border-gray-700")}>
                                        {formData.is_head_office && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-primary-600 transition-colors">Head Office</span>
                                </div>

                                <div
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                                >
                                    <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center transition-all", formData.is_active ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-200 dark:border-gray-700")}>
                                        {formData.is_active && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Unit Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-blue-50/10 dark:bg-blue-900/10">
                            <MapPin size={14} className="text-blue-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Location</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="space-y-1 lg:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 1</label>
                                <input
                                    type="text"
                                    name="address_line1"
                                    placeholder="No, Street Name"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                        formErrors.address_line1 ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.address_line1}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                                {formErrors.address_line1 && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.address_line1}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1 lg:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    name="address_line2"
                                    placeholder="Apartment, suite, etc."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    value={formData.address_line2}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                        formErrors.city ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                                {formErrors.city && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.city}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code</label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    placeholder="e.g. 6.9271"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    value={formData.latitude}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    placeholder="e.g. 79.8612"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    value={formData.longitude}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-emerald-50/10 dark:bg-emerald-900/10">
                            <Phone size={14} className="text-emerald-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Contact</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Phone</label>
                                <input
                                    type="text"
                                    name="phone_primary"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono shadow-sm",
                                        formErrors.phone_primary ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.phone_primary}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                                {formErrors.phone_primary && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.phone_primary}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secondary Phone</label>
                                <input
                                    type="text"
                                    name="phone_secondary"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    value={formData.phone_secondary}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white font-mono shadow-sm",
                                        formErrors.email ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                                {formErrors.email && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fax</label>
                                <input
                                    type="text"
                                    name="fax"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm"
                                    value={formData.fax}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Geographical Hierarchy */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-purple-50/10 dark:bg-purple-900/10">
                            <Layers size={14} className="text-purple-500" />
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hierarchy Support</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Province - First Level */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Province</label>
                                <select
                                    name="province_id"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm",
                                        formErrors.province_id ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.province_id}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        // Reset zone and region when province changes
                                        setFormData(prev => ({ ...prev, zone_id: '', region_id: '' }));
                                    }}
                                >
                                    <option value="">Select Province</option>
                                    {provinces.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {formErrors.province_id && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.province_id}
                                    </p>
                                )}
                            </div>

                            {/* Zone - Second Level (depends on Province) */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Zone</label>
                                <select
                                    name="zone_id"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm disabled:opacity-50",
                                        formErrors.zone_id ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.zone_id}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        // Reset region when zone changes
                                        setFormData(prev => ({ ...prev, region_id: '' }));
                                    }}
                                    disabled={!formData.province_id}
                                >
                                    <option value="">Select Zone</option>
                                    {availableZones.map(z => (
                                        <option key={z.id} value={z.id}>{z.name}</option>
                                    ))}
                                </select>
                                {formErrors.zone_id && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.zone_id}
                                    </p>
                                )}
                            </div>

                            {/* Region - Third Level (depends on Zone) */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Region</label>
                                <select
                                    name="region_id"
                                    className={cn(
                                        "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono shadow-sm disabled:opacity-50",
                                        formErrors.region_id ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.region_id}
                                    onChange={handleInputChange}
                                    disabled={!formData.zone_id}
                                >
                                    <option value="">Select Region</option>
                                    {availableRegions.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                                {formErrors.region_id && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={10} /> {formErrors.region_id}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/branches')}
                            className="px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={branchLoading}
                            className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {branchLoading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            {isEdit ? 'Update Unit' : 'Save Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;
import React, { useEffect, useState } from 'react';
import {
    Layers,
    Plus,
    X,
    Check,
    Search,
    Filter,
    Edit2,
    Trash2,
    Binary,
    MapPin,
    ChevronDown,
    AlignCenter,
    AlertCircle,
    Eye,
    LayoutDashboard,
    History,
    Calendar,
    Settings,
    UserCheck,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

import { useZone } from '../context/ZoneContext';
import { useProvince } from '../context/ProvinceContext';

const ZoneSetup = () => {
    const { zones, pagination, isLoading, error, getZones, createZone, updateZone, deleteZone, getZoneById, currentZone } = useZone();
    const { provinces, getProvinces } = useProvince();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [formErrors, setFormErrors] = useState({});
    const [isFetchingItem, setIsFetchingItem] = useState(false);


    // Form states
    const [formData, setFormData] = useState({
        name: '',
        province_id: '',
        code: ''
    });

    useEffect(() => {
        getZones();
        getProvinces(); // Fetch provinces for dropdown
    }, []);

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getZones(page);
    };

    const filteredData = zones.filter(item =>
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDrawer = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                province_id: item.province_id || '',
                code: item.code || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                province_id: '',
                code: ''
            });
        }
        setFormErrors({});
        setIsDrawerOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingItem(null);
        setFormErrors({});
        document.body.style.overflow = 'auto';
    };

    const handleView = async (item) => {
        setIsFetchingItem(true);
        try {
            await getZoneById(item.id);
            setIsViewDrawerOpen(true);
        } catch (error) {
            console.error("Failed to fetch zone details:", error);
            toast.error("Failed to load zone details");
        } finally {
            setIsFetchingItem(false);
        }
    };

    const handleCloseViewDrawer = () => {
        setIsViewDrawerOpen(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing or changing selection
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSave = async () => {
        // Validation
        const errors = {};
        if (!formData.province_id) {
            errors.province_id = 'Province is required';
        }
        if (!formData.name?.trim()) {
            errors.name = 'Zone Name is required';
        }
        if (!formData.code?.trim()) {
            errors.code = 'Zone Code is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Please correct the highlighted errors');
            return;
        }

        const loadingToast = toast.loading(editingItem ? 'Updating zone...' : 'Creating zone...');

        try {
            if (editingItem) {
                await updateZone(editingItem.id, formData);
            } else {
                await createZone(formData);
            }
            toast.success(editingItem ? 'Zone updated successfully' : 'Zone created successfully', { id: loadingToast });
            handleCloseDrawer();
            getZones(pagination.currentPage);
        } catch (error) {
            console.error("Failed to save zone:", error);
            // Handle backend validation errors
            if (error.response?.data?.errors) {
                const backendErrors = {};
                error.response.data.errors.forEach(err => {
                    backendErrors[err.field] = err.messages[0];
                });
                setFormErrors(backendErrors);
                toast.error('Validation failed. Please check the fields.', { id: loadingToast });
            } else {
                toast.error(error.message || 'Failed to save zone', { id: loadingToast });
            }
        }
    };

    const handleDelete = (item) => {
        setDeleteConfirm({ show: true, id: item.id, name: item.name });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, id: null, name: '' });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            const loadingToast = toast.loading('Deleting zone...');
            try {
                await deleteZone(deleteConfirm.id);
                toast.success('Zone deleted successfully', { id: loadingToast });
                getZones(pagination.currentPage);
                handleDeleteCancel();
            } catch (error) {
                console.error("Failed to delete zone:", error);
                toast.error(error.message || 'Failed to delete zone', { id: loadingToast });
            }
        }
    };

    // Helper to get province name
    const getProvinceName = (item) => {
        if (item.province && item.province.name) return item.province.name;
        const r = provinces.find(r => r.id == item.province_id);
        return r ? r.name : 'Unknown';
    };

    return (
        <>
            <div className="animate-in fade-in duration-500 pb-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Zone Setup</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Manage granular geographic zones.</p>
                    </div>

                    <button
                        onClick={() => handleOpenDrawer()}
                        className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95 group h-fit"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        CREATE ZONE
                    </button>
                </div>

                {/* Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative w-full md:max-w-[600px] flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by zone name or code..."
                            className="w-full pl-10 pr-6 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Filter size={14} className="text-primary-500" />
                        Level: Zone
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-1/4">Zone Name</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Province</th>
                                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group text-left">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-primary-100 dark:border-primary-900/20 shadow-sm">
                                                <Layers size={16} />
                                            </div>
                                            <span
                                                onClick={() => handleOpenDrawer(item)}
                                                className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight cursor-pointer hover:text-primary-600 transition-colors"
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest font-mono">{item.code}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">{getProvinceName(item)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleView(item)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-110"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDrawer(item)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-110"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredData.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Layers size={48} className="mb-4 text-gray-200 dark:text-gray-700" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                            <p className="text-sm text-gray-500 max-w-[250px] mt-2">No zones match your active search filter.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                            Displaying <span className="text-primary-600 font-bold">{zones.length}</span> of <span className="text-primary-600 font-bold">{pagination.total}</span> Zones
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto justify-center sm:justify-end">
                            {pagination.links?.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(link.url)}
                                    disabled={!link.url || link.active}
                                    className={cn(
                                        "px-3 py-2 rounded-xl text-xs font-bold transition-all min-w-[32px] flex items-center justify-center",
                                        link.active
                                            ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-105"
                                            : "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105",
                                        !link.url && "opacity-40 cursor-not-allowed grayscale"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}

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
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Zone</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Are you sure you want to delete this zone?
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Zone: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            This action cannot be undone. This will permanently remove the zone entity.
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleDeleteCancel}
                                            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Form Drawer (Full Height) */}
            <div className={cn("fixed inset-0 z-[9999] transition-all duration-500 ease-in-out", isDrawerOpen ? "visible" : "invisible")}>
                <div className={cn("absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={handleCloseDrawer}></div>

                <div className={cn("absolute inset-x-0 bottom-0 top-0 md:inset-y-0 md:right-0 md:left-auto md:max-w-[520px] w-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
                    <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-20">
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-2xl bg-primary-600/10 text-primary-600">
                                    <Layers size={24} />
                                </div>
                                <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em]">Zone Config</span>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                {editingItem ? 'Modify' : 'New'} <span className="text-primary-600">Zone</span>
                            </h2>
                        </div>
                        <button onClick={handleCloseDrawer} className="w-12 h-12 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar text-left lowercase-labels">
                        <div className="space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                    Parent Province
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                    <select
                                        name="province_id"
                                        className={cn(
                                            "w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white appearance-none cursor-pointer uppercase font-mono",
                                            formErrors.province_id ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.province_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">SELECT PROVINCE</option>
                                        {provinces.map(province => (
                                            <option key={province.id} value={province.id}>{province.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                {formErrors.province_id && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.province_id}</p>
                                )}
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Zone Name
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <AlignCenter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="e.g., COLOMBO 07"
                                            className={cn(
                                                "w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono",
                                                formErrors.name ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                            )}
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formErrors.name && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                        Zone Code
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <Binary size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                        <input
                                            type="text"
                                            name="code"
                                            placeholder="e.g., Z-007"
                                            className={cn(
                                                "w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono",
                                                formErrors.code ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                            )}
                                            value={formData.code}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {formErrors.code && (
                                        <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.code}</p>
                                    )}
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md sticky bottom-0 z-10 flex gap-4">
                        <button onClick={handleCloseDrawer} className="flex-1 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel</button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            <Check size={18} className="group-hover:scale-125 transition-transform" />
                            {editingItem ? 'UPDATE ZONE' : 'SAVE ZONE'}
                        </button>
                    </div>
                </div>
            </div>
            {/* View Drawer */}
            <div className={cn("fixed inset-0 z-[9999] transition-all duration-500 ease-in-out", isViewDrawerOpen ? "visible" : "invisible")}>
                <div className={cn("absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500", isViewDrawerOpen ? "opacity-100" : "opacity-0")} onClick={handleCloseViewDrawer}></div>

                <div className={cn("absolute inset-x-0 bottom-0 top-0 md:inset-y-0 md:right-0 md:left-auto md:max-w-[500px] w-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col", isViewDrawerOpen ? "translate-x-0" : "translate-x-full")}>
                    {/* Header */}
                    <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl z-20">
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-2xl bg-primary-600/10 text-primary-600">
                                    <Layers size={24} />
                                </div>
                                <span className="text-[11px] font-black text-primary-600 uppercase tracking-[0.3em]">Zone Profile</span>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                {currentZone?.name || 'Zone'} <span className="text-primary-600">Details</span>
                            </h2>
                        </div>
                        <button onClick={handleCloseViewDrawer} className="w-12 h-12 rounded-2xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center active:scale-90">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="space-y-6 text-left">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2 block">Zone Name</label>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase font-mono">{currentZone?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2 block">Zone Code</label>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase font-mono">{currentZone?.code || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2 block">Affiliated Province</label>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase font-mono">{currentZone?.province?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2 block">Entity Status</label>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 sticky bottom-0 z-10 flex gap-4">
                        <button
                            onClick={() => {
                                handleCloseViewDrawer();
                                handleOpenDrawer(currentZone);
                            }}
                            className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            <Edit2 size={16} className="group-hover:scale-125 transition-transform text-left" />
                            Modify Protocol
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ZoneSetup;

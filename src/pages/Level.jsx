import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Shield,
    ChevronRight,
    Filter,
    Plus,
    ShieldCheck,
    AlertCircle,
    X,
    Check,
    Edit2,
    Trash2,
    Layers,
    Binary,
    AlignCenter,
    Users,
    User,
    Tag,
    Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useLevel } from '../context/LevelContext';
import { toast } from 'react-hot-toast';
import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';


const Level = () => {
    // Context Data
    const { levels, pagination, isLoading, getLevels, createLevel, updateLevel, deleteLevel } = useLevel();

    // Local State
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [formErrors, setFormErrors] = useState({});


    // Initial Data Fetch
    useEffect(() => {
        getLevels();
    }, []);

    // Form State
    const initialFormState = {
        level_name: '',
        code: '',
        tire_level: '',
        category: 'executive',
        isActive: true,
        is_single_user: false
    };
    const [formData, setFormData] = useState(initialFormState);

    // Filter Levels (Client-side)
    const filteredLevels = useMemo(() => {
        if (!levels) return [];
        return levels.filter(level =>
            (level.level_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (level.code || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [levels, searchTerm]);

    // Handlers
    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getLevels(page);
    };

    const handleOpenDrawer = (level = null) => {
        if (level) {
            setEditingLevel(level);
            setFormData({
                level_name: level.level_name || '',
                code: level.code || '',
                tire_level: level.tire_level?.toString() || '',
                category: level.category || 'executive',
                isActive: level.isActive ?? true,
                is_single_user: level.is_single_user ?? false
            });
        } else {
            setEditingLevel(null);
            setFormData(initialFormState);
        }
        setFormErrors({});
        setIsDrawerOpen(true);

        document.body.style.overflow = 'hidden';
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingLevel(null);
        setFormData(initialFormState);
        setFormErrors({});
        document.body.style.overflow = 'auto';
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
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
        if (!formData.level_name?.trim()) {
            errors.level_name = 'Level Name is required';
        }
        if (!formData.code?.trim()) {
            errors.code = 'Level Code is required';
        }
        if (formData.tire_level === '' || formData.tire_level === null) {
            errors.tire_level = 'Tier Level is required';
        } else {
            const tire = parseInt(formData.tire_level);
            if (isNaN(tire) || tire < 0 || tire > 20) {
                errors.tire_level = 'Tier Level must be a number between 0 and 20';
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Please correct the highlighted errors');
            return;
        }

        const payload = {
            ...formData,
            tire_level: parseInt(formData.tire_level)
        };

        const loadingToast = toast.loading(editingLevel ? 'Updating level...' : 'Creating level...');

        try {
            let result;
            if (editingLevel) {
                result = await updateLevel(editingLevel.id, payload);
            } else {
                result = await createLevel(payload);
            }

            // Check if thunk was rejected
            if (result.error) {
                throw new Error(result.payload || result.error.message || 'Failed to save level');
            }

            toast.success(editingLevel ? 'Level updated successfully' : 'Level created successfully', { id: loadingToast });
            handleCloseDrawer();
            getLevels(pagination.currentPage);
        } catch (error) {
            console.error("Failed to save level:", error);
            // Handle backend field validation errors if they exist
            if (error.response?.data?.errors) {
                const backendErrors = {};
                error.response.data.errors.forEach(err => {
                    backendErrors[err.field] = err.messages[0];
                });
                setFormErrors(backendErrors);
                toast.error('Validation failed. Please check the fields.', { id: loadingToast });
            } else {
                toast.error(error.message || 'Failed to save level', { id: loadingToast });
            }
        }
    };

    const handleDeleteClick = (level) => {
        setDeleteConfirm({ show: true, id: level.id, name: level.level_name });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            const loadingToast = toast.loading('Deleting level...');
            try {
                const result = await deleteLevel(deleteConfirm.id);
                if (result.error) {
                    throw new Error(result.payload || result.error.message || 'Failed to delete level');
                }
                toast.success('Level deleted successfully', { id: loadingToast });
                getLevels(pagination.currentPage);
                setDeleteConfirm({ show: false, id: null, name: '' });
            } catch (error) {
                console.error("Failed to delete level:", error);
                toast.error(error.message || 'Failed to delete level', { id: loadingToast });
            }
        }
    };

    return (
        <div className="relative min-h-screen">
            <div className="animate-in fade-in duration-500 pb-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Level Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Define and manage organizational structure levels and structural logic.</p>
                    </div>
                    <PermissionGate permission={PERMISSIONS.LEVEL_CREATE}>
                        <button
                            onClick={() => handleOpenDrawer()}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                        >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                            New Level Entity
                        </button>
                    </PermissionGate>
                </div>

                {/* Tactical Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative w-full md:max-w-[600px] flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search level name or nomenclature code..."
                            className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[11px] font-bold text-gray-400 uppercase tracking-wider border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                        <Filter size={14} />
                        Scope: <span className="text-gray-900 dark:text-white ml-1">Structural</span>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto min-h-[500px]">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Level Nomenclature</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Code</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Category</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Config</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredLevels.map((level) => (
                                <tr key={level.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-default">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-primary-100 dark:border-primary-900/20">
                                                <Layers size={16} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight block">{level.level_name}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-400"></div>
                                                    <p className="text-[9px] font-medium text-gray-400 uppercase tracking-widest">TIER: {level.tire_level}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Binary size={12} className="text-gray-400" />
                                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{level.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                            {level.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                            {level.is_single_user ? (
                                                <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 dark:bg-purple-900/10 px-2 py-1 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                                    <User size={12} />
                                                    <span className="text-[9px] uppercase font-bold">Single</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                                    <Users size={12} />
                                                    <span className="text-[9px] uppercase font-bold">Multiple</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {level.isActive ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                <span className="text-[10px] font-bold text-red-600 dark:text-red-500 uppercase tracking-widest">Inactive</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <PermissionGate permission={PERMISSIONS.LEVEL_UPDATE}>
                                                <button
                                                    onClick={() => handleOpenDrawer(level)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </PermissionGate>
                                            <PermissionGate permission={PERMISSIONS.LEVEL_DELETE}>
                                                <button
                                                    onClick={() => handleDeleteClick(level)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
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

                    {filteredLevels.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300 mb-4 transition-colors">
                                <Shield size={48} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                            <p className="text-sm text-gray-500 max-w-[250px] mt-2">No level definitions match your active search filter.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                            Displaying <span className="text-primary-600 font-bold">{filteredLevels.length}</span> of <span className="text-primary-600 font-bold">{pagination.total}</span> Levels
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
            </div>

            {/* Off-Canvas Drawer (Full Height) */}
            <div className={cn("fixed inset-0 z-[9999] transition-all duration-500 ease-in-out", isDrawerOpen ? "visible" : "invisible")}>
                <div className={cn("absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-500", isDrawerOpen ? "opacity-100" : "opacity-0")} onClick={handleCloseDrawer}></div>

                <div className={cn("absolute inset-x-0 bottom-0 top-0 md:inset-y-0 md:right-0 md:left-auto md:max-w-[480px] w-full bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 text-left">
                        <div className="text-left">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                    <Layers size={20} />
                                </div>
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Structural Entry</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                {editingLevel ? 'Modify Structural Level' : 'Register New Level'}
                            </h2>
                        </div>
                        <button
                            onClick={handleCloseDrawer}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drawer Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-left lowercase-labels">
                        {/* level Name */}
                        <div className="space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Level Nomenclature</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <AlignCenter size={18} />
                                </div>
                                <input
                                    type="text"
                                    name="level_name"
                                    placeholder="e.g., General Manager"
                                    className={cn(
                                        "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                        formErrors.level_name ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                    )}
                                    value={formData.level_name}
                                    onChange={handleInputChange}
                                    autoComplete="off"
                                />
                            </div>
                            {formErrors.level_name && (
                                <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.level_name}</p>
                            )}
                        </div>

                        {/* level Code */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomenclature Code</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                        <Binary size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="code"
                                        placeholder="e.g., GM001"
                                        className={cn(
                                            "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white uppercase",
                                            formErrors.code ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                    />
                                </div>
                                {formErrors.code && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.code}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">TIER Level (0-20)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                        <Tag size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        name="tire_level"
                                        min="0"
                                        max="20"
                                        placeholder="0-20"
                                        className={cn(
                                            "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                            formErrors.tire_level ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                        )}
                                        value={formData.tire_level}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {formErrors.tire_level && (
                                    <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.tire_level}</p>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category Classification</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                    <Briefcase size={18} />
                                </div>
                                <select
                                    name="category"
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary-500/20 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white uppercase appearance-none"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    <option value="executive">Executive</option>
                                    <option value="management">Management</option>
                                    <option value="branch">Branch</option>
                                    <option value="agency">Agency</option>
                                </select>
                            </div>
                        </div>

                        {/* Level Control Toggles */}
                        <div className="space-y-3">
                            {/* level Status Toggle */}
                            <div
                                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-transparent hover:border-primary-500/10 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                        formData.isActive
                                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                    )}>
                                        <ShieldCheck size={20} className={cn(formData.isActive && "animate-pulse")} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                            {formData.isActive ? 'Operational' : 'Deactivated'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                            {formData.isActive ? 'Entity is visible & functional' : 'Entity is restricted'}
                                        </p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-all duration-300",
                                    formData.isActive ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                        formData.isActive ? "right-1" : "left-1"
                                    )} />
                                </div>
                            </div>

                            {/* User mode Toggle */}
                            <div
                                onClick={() => setFormData(prev => ({ ...prev, is_single_user: !prev.is_single_user }))}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-transparent hover:border-primary-500/10 transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                        !formData.is_single_user
                                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                            : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                    )}>
                                        {!formData.is_single_user ? <Users size={20} /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                            {!formData.is_single_user ? 'Multiple Users' : 'Single User Only'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                            {!formData.is_single_user ? 'Unlimited accounts per level' : 'Strict one-account constraint'}
                                        </p>
                                    </div>
                                </div>

                                <div className={cn(
                                    "w-12 h-6 rounded-full relative transition-all duration-300",
                                    !formData.is_single_user ? "bg-primary-600" : "bg-primary-400"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm",
                                        !formData.is_single_user ? "right-1" : "left-1"
                                    )} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md sticky bottom-0 z-10 flex gap-4">
                        <button onClick={handleCloseDrawer} className="flex-1 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel</button>
                        <button
                            onClick={handleSave}
                            className="flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                        >
                            <Check size={18} className="group-hover:scale-125 transition-transform" />
                            {editingLevel ? 'Synchronize Entity' : 'SAVE'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 z-[10000] overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })} />
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-50 duration-300 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Level</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete this level?
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Level: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This action cannot be undone.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
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
    );
};

export default Level;

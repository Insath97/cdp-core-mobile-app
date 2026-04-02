import React, { useState, useMemo, useEffect } from 'react';
import {
    Search,
    Shield,
    ChevronRight,
    Filter,
    Clock,
    Tag,
    Lock,
    ArrowLeft,
    Plus,
    ShieldCheck,
    AlertCircle,
    X,
    Check,
    Edit2,
    Trash2,
    Settings
} from 'lucide-react';
import { usePermission } from '../context/PermissionContext';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';



const PermissionsManagement = () => {
    const {
        permissions,
        currentPermission,
        pagination,
        isLoading,
        error,
        getPermissions,
        getPermissionById,
        updatePermission,
        createPermission,
        deletePermission
    } = usePermission();
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPerm, setSelectedPerm] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingPermission, setIsLoadingPermission] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [formErrors, setFormErrors] = useState({});


    // Form State
    const [permName, setPermName] = useState('');
    const [permGroup, setPermGroup] = useState('');
    const [permGuard, setPermGuard] = useState('api');

    const navigate = useNavigate();

    useEffect(() => {
        getPermissions();
    }, []);

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getPermissions(page);
    };

    const filteredPermissions = useMemo(() => {
        if (!permissions) return [];
        return permissions.filter(p =>
            (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.group_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [permissions, searchTerm]);

    const handleOpenDrawer = async (perm = null) => {
        if (perm) {
            // Fetch the latest data from API
            setIsLoadingPermission(true);
            setIsDrawerOpen(true);
            document.body.style.overflow = 'hidden';

            try {
                await getPermissionById(perm.id);
                // currentPermission will be updated by Redux
                // We'll use useEffect to populate the form when currentPermission changes
                setSelectedPerm(perm);
            } catch (err) {
                console.error('Failed to fetch permission details:', err);
                // Fallback to the data we already have
                setSelectedPerm(perm);
                setPermName(perm.name);
                setPermGroup(perm.group_name);
                setPermGuard(perm.guard_name || 'api');
            } finally {
                setIsLoadingPermission(false);
            }
        } else {
            setSelectedPerm(null);
            setPermName('');
            setPermGroup('');
            setPermGuard('api');
            setFormErrors({});
            setIsDrawerOpen(true);
            document.body.style.overflow = 'hidden';
        }
    };

    // Update form when currentPermission changes (after API fetch)
    useEffect(() => {
        if (currentPermission && selectedPerm) {
            setPermName(currentPermission.name || '');
            setPermGroup(currentPermission.group_name || '');
            setPermGuard(currentPermission.guard_name || 'api');
        }
    }, [currentPermission, selectedPerm]);

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setFormErrors({});
        document.body.style.overflow = 'auto';
    };

    const handleSavePermission = async () => {
        // Validation
        const errors = {};
        if (!permName.trim()) {
            errors.name = 'Permission Name is required';
        }
        if (!permGroup.trim()) {
            errors.group_name = 'Group Name is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Please correct the highlighted errors');
            return;
        }

        const loadingToast = toast.loading(selectedPerm ? 'Updating permission...' : 'Creating permission...');
        setIsSaving(true);

        try {
            const data = {
                name: permName.trim(),
                group_name: permGroup.trim(),
            };

            if (selectedPerm) {
                // Update existing permission
                await updatePermission(selectedPerm.id, data);
            } else {
                // Create new permission
                await createPermission(data);
            }

            // Refresh the list
            await getPermissions(pagination.currentPage);

            // Close drawer and reset form
            handleCloseDrawer();
            toast.success(selectedPerm ? 'Permission updated successfully' : 'Permission created successfully', { id: loadingToast });
        } catch (err) {
            console.error('Failed to save permission:', err);
            // Handle backend field validation errors
            if (err.response?.data?.errors) {
                const backendErrors = {};
                err.response.data.errors.forEach(e => {
                    backendErrors[e.field] = e.messages[0];
                });
                setFormErrors(backendErrors);
                toast.error('Validation failed. Please check the fields.', { id: loadingToast });
            } else {
                toast.error(err.message || 'Failed to save permission', { id: loadingToast });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (perm) => {
        setDeleteConfirm({
            show: true,
            id: perm.id,
            name: perm.name
        });
    };

    const handleDeleteConfirm = async () => {
        const loadingToast = toast.loading('Deleting permission...');
        try {
            await deletePermission(deleteConfirm.id);
            // Refresh the list to ensure consistency
            await getPermissions(pagination.currentPage);
            toast.success('Permission deleted successfully', { id: loadingToast });
            // Close the confirmation modal
            setDeleteConfirm({ show: false, id: null, name: '' });
        } catch (err) {
            console.error('Failed to delete permission:', err);
            toast.error(err.message || 'Failed to delete permission', { id: loadingToast });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, id: null, name: '' });
    };

    return (
        <div className="relative min-h-screen">
            <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Permissions Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Review permissions and manage access points.</p>
                    </div>
                    <button
                        onClick={() => handleOpenDrawer()}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                    >
                        <Plus size={18} />
                        Create Permission
                    </button>
                </div>

                {/* Tactical Control Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="relative w-full md:w-[600px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search hook name or functional group..."
                            className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[11px] font-bold text-gray-400 uppercase tracking-wider border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                        <Filter size={14} />
                        Scope: <span className="text-gray-900 dark:text-white ml-1">Universal</span>
                    </div>
                </div>

                {/* Permissions Table - Fixed View Pattern */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[500px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-1/3 text-left">Capability Hook</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Group Segment</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Protocol Guard</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">System State</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4" colSpan={5}>
                                            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-red-500">
                                            <AlertCircle size={32} />
                                            <p className="font-bold uppercase tracking-widest text-xs">{error}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPermissions.map((perm, idx) => (
                                <tr key={perm.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-default">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-primary-100 dark:border-primary-900/20">
                                                <Lock size={16} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{perm.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Tag size={12} className="text-gray-400" />
                                            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{perm.group_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-[9px] font-bold uppercase tracking-wider">{perm.guard_name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Operational</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenDrawer(perm)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(perm)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading && !error && filteredPermissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300 mb-4 transition-colors">
                                <Shield size={48} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                            <p className="text-sm text-gray-500 max-w-[250px] mt-2">No capability definitions match your active search filter.</p>
                        </div>
                    )}
                </div>

                {/* Strategic Pagination */}
                {pagination && pagination.total > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                            Hooks: <span className="text-primary-600">{pagination.total}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            Page: <span className="text-primary-600">{pagination.currentPage} of {pagination.lastPage}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            {pagination.links && pagination.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handlePageChange(link.url)}
                                    disabled={!link.url}
                                    className={cn(
                                        "px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                                        link.active
                                            ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                                            : !link.url
                                                ? "text-gray-200 cursor-not-allowed"
                                                : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Permission</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete this permission?
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Permission: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This action cannot be undone. This will permanently remove the permission and may affect users who have this permission assigned.
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

            {/* Off-Canvas Drawer (Full Height) */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-[9999] overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCloseDrawer} />

                    <div className="absolute inset-y-0 right-0 max-w-[480px] w-full bg-white dark:bg-gray-900 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 text-left">
                            <div className="text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                        <Lock size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Create Permission</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                    {selectedPerm ? 'Modify Definition' : 'Register New Permission'}
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
                            {isLoadingPermission ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold text-gray-500">Loading permission details...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Group Name */}
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Group Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                                <Tag size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g., Dashboard Management"
                                                className={cn(
                                                    "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                                    formErrors.group_name ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                                )}
                                                value={permGroup}
                                                onChange={(e) => {
                                                    setPermGroup(e.target.value);
                                                    if (formErrors.group_name) {
                                                        setFormErrors(prev => {
                                                            const next = { ...prev };
                                                            delete next.group_name;
                                                            return next;
                                                        });
                                                    }
                                                }}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {formErrors.group_name && (
                                            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.group_name}</p>
                                        )}
                                    </div>


                                    {/* Permission Name */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Permission Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                                                <Shield size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="e.g., view_analytics"
                                                className={cn(
                                                    "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-2xl text-sm font-bold transition-all outline-none dark:text-white",
                                                    formErrors.name ? "border-red-500 focus:border-red-500/20" : "border-transparent focus:border-primary-500/20"
                                                )}
                                                value={permName}
                                                onChange={(e) => {
                                                    setPermName(e.target.value);
                                                    if (formErrors.name) {
                                                        setFormErrors(prev => {
                                                            const next = { ...prev };
                                                            delete next.name;
                                                            return next;
                                                        });
                                                    }
                                                }}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {formErrors.name && (
                                            <p className="text-[10px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-wider">{formErrors.name}</p>
                                        )}
                                    </div>


                                    {/* Select Guard */}
                                    {/* <div className="space-y-4 text-left">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Guard</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'api', label: 'API Guard', icon: Settings },
                                                { id: 'web', label: 'Web Guard', icon: ShieldCheck }
                                            ].map((guard) => (
                                                <button
                                                    key={guard.id}
                                                    onClick={() => setPermGuard(guard.id)}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 transition-all text-left group relative overflow-hidden",
                                                        permGuard === guard.id
                                                            ? "border-primary-600 bg-primary-50/30 dark:bg-primary-900/10"
                                                            : "border-gray-100 dark:border-gray-800 bg-transparent hover:border-gray-200 dark:hover:border-700"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
                                                        permGuard === guard.id ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                                                    )}>
                                                        <guard.icon size={20} />
                                                    </div>
                                                    <p className={cn("text-xs font-black uppercase tracking-wider", permGuard === guard.id ? "text-primary-700 dark:text-primary-400" : "text-gray-900 dark:text-white")}>{guard.label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div> */}
                                </>
                            )}
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md sticky bottom-0 z-10">
                            <button
                                onClick={handleSavePermission}
                                disabled={isSaving || isLoading}
                                className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} className="group-hover:scale-125 transition-transform" />
                                        {selectedPerm ? 'Update' : 'Submit'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionsManagement;
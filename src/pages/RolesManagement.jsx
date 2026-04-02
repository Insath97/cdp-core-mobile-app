import React, { useState, useMemo } from 'react';
import {
    Plus,
    LayoutGrid,
    List,
    Search,
    Shield,
    Eye,
    Edit2,
    Trash2,
    ChevronRight,
    X,
    Check,
    ChevronDown,
    ArrowLeft,
    Filter,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { usePermission } from '../context/PermissionContext';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';

const RolesManagement = () => {
    const { roles, pagination, isLoading, error, getRoles, createRole, updateRole, deleteRole } = useRole();
    const { allPermissions, getAllPermissions } = usePermission();

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [viewDetailRole, setViewDetailRole] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [roleName, setRoleName] = useState('');
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [formErrors, setFormErrors] = useState({});

    // Inline error message component (matches AddCustomer / BusinessEntry style)
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

    const validateRole = () => {
        const newErrors = {};
        if (!roleName.trim()) newErrors.roleName = 'Role name is required';
        if (selectedPermissionIds.length === 0) newErrors.permissions = 'At least one permission must be selected';

        // Dependent permissions validation
        if (allPermissions && selectedPermissionIds.length > 0) {
            const selectedPermNames = selectedPermissionIds.map(id =>
                allPermissions.find(p => p.id === id)?.name
            ).filter(Boolean);

            const missingIndexPerms = [];

            selectedPermNames.forEach(permName => {
                if (!permName.endsWith('Index') && !permName.includes('Dashboard')) {
                    const actionWords = ['Create', 'Update', 'Delete', 'Toggle Status', 'Restore', 'Force Delete', 'Approve', 'Certificate'];
                    let isAction = false;
                    let baseName = '';

                    for (const word of actionWords) {
                        if (permName.endsWith(` ${word}`)) {
                            isAction = true;
                            baseName = permName.substring(0, permName.length - word.length - 1);
                            break;
                        }
                    }

                    if (isAction && baseName) {
                        const requiredIndexPerm = `${baseName} Index`;
                        const indexExistsInAll = allPermissions.some(p => p.name === requiredIndexPerm);
                        if (indexExistsInAll && !selectedPermNames.includes(requiredIndexPerm)) {
                            if (!missingIndexPerms.includes(requiredIndexPerm)) {
                                missingIndexPerms.push(requiredIndexPerm);
                            }
                        }
                    }
                }
            });

            if (missingIndexPerms.length > 0) {
                newErrors.permissions = `Missing required Index permissions to access actions: ${missingIndexPerms.join(', ')}`;
            }
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        getRoles();
        getAllPermissions();
    }, []);

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getRoles(page);
    };

    const filteredRoles = useMemo(() => {
        if (!roles) return [];
        return roles.filter(role =>
            (role.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [roles, searchTerm]);

    const groupedPermissions = useMemo(() => {
        if (!allPermissions) return [];

        const groups = {};
        allPermissions.forEach(perm => {
            const groupName = perm.group_name || 'General';
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(perm);
        });

        return Object.entries(groups).map(([group, perms]) => ({ group, permissions: perms }));
    }, [allPermissions]);

    const handleOpenDrawer = (role = null) => {
        setFormErrors({});
        if (role) {
            setSelectedRole(role);
            setRoleName(role.name);
            // Map existing permissions to their IDs
            const rolePermIds = role.permissions ? role.permissions.map(p => typeof p === 'object' ? p.id : null).filter(Boolean) : [];
            setSelectedPermissionIds(rolePermIds);
        } else {
            setSelectedRole(null);
            setRoleName('');
            setSelectedPermissionIds([]);
        }
        setIsDrawerOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        document.body.style.overflow = 'auto';
        setIsSaving(false);
        setFormErrors({});
    };

    const handleSaveRole = async () => {
        if (!validateRole()) {
            toast.error('Please fill all required fields', {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: roleName,
                permissions: selectedPermissionIds
            };

            if (selectedRole) {
                await updateRole(selectedRole.id, payload);
            } else {
                await createRole(payload);
            }
            handleCloseDrawer();
            getRoles(pagination.currentPage); // Refresh list
        } catch (err) {
            console.error("Failed to save role:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRole = (role) => {
        setDeleteConfirm({ show: true, id: role.id, name: role.name });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, id: null, name: '' });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            await deleteRole(deleteConfirm.id);
            getRoles(pagination.currentPage);
            handleDeleteCancel();
        }
    };

    const togglePermission = (permId) => {
        setSelectedPermissionIds(prev =>
            prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
        );
    };

    const toggleGroup = (groupPerms) => {
        const groupPermIds = groupPerms.map(p => p.id);
        const allSelected = groupPermIds.every(id => selectedPermissionIds.includes(id));

        if (allSelected) {
            setSelectedPermissionIds(prev => prev.filter(id => !groupPermIds.includes(id)));
        } else {
            // Add any IDs from this group that aren't already selected
            const newIds = groupPermIds.filter(id => !selectedPermissionIds.includes(id));
            setSelectedPermissionIds(prev => [...prev, ...newIds]);
        }
    };

    const selectAll = () => {
        if (!allPermissions) return;
        const allIds = allPermissions.map(p => p.id);

        if (selectedPermissionIds.length === allIds.length) {
            setSelectedPermissionIds([]);
        } else {
            setSelectedPermissionIds(allIds);
        }
    };

    const renderDetailView = () => {
        // Filter groups to only include permissions present in the current role
        const activeGroups = groupedPermissions.map(group => ({
            ...group,
            permissions: group.permissions.filter(perm =>
                viewDetailRole.permissions?.some(p =>
                    (typeof p === 'string' ? p === perm.name : p.id === perm.id)
                )
            )
        })).filter(group => group.permissions.length > 0);

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                    onClick={() => setViewDetailRole(null)}
                    className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-bold mb-6 transition-colors group"
                >
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                        <ArrowLeft size={18} />
                    </div>
                    Back to Roles Management
                </button>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                    <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between text-left">
                        <div className="text-left">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">{viewDetailRole.name}</h1>
                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Security Policy Layer</p>
                                </div>
                            </div>
                            {/* <p className="text-xs font-bold ml-16 flex items-center gap-2 text-gray-400">
                                Guard: <span className="text-gray-900 dark:text-gray-300">{viewDetailRole.guard_name}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                Deployed: {new Date(viewDetailRole.created_at).toLocaleDateString()}
                            </p> */}
                        </div>
                        <PermissionGate permission={PERMISSIONS.ROLE_UPDATE}>
                            <button
                                onClick={() => {
                                    handleOpenDrawer(viewDetailRole);
                                    setViewDetailRole(null);
                                }}
                                className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                            >
                                <Edit2 size={16} />
                                Modify Protocol
                            </button>
                        </PermissionGate>
                    </div>

                    <div className="p-8 bg-gray-50/30 dark:bg-gray-800/10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight uppercase">Capability Matrix</h2>
                                <p className="text-xs text-gray-500 font-bold mt-1">Direct functional access points.</p>
                            </div>
                            <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {viewDetailRole.permissions ? viewDetailRole.permissions.length : 0} Active Permissions
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {activeGroups.length > 0 ? (
                                activeGroups.map((group) => (
                                    <div key={group.group} className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                            {group.group}
                                        </h3>
                                        <div className="space-y-2">
                                            {group.permissions.map(perm => (
                                                <div key={perm.id} className={cn(
                                                    "flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left",
                                                    "bg-white dark:bg-gray-900 border-primary-100 dark:border-primary-800 text-primary-600 shadow-sm"
                                                )}>
                                                    <ShieldCheck size={16} />
                                                    <span className="text-xs font-bold uppercase tracking-tight">{perm.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    No capability Permissions assigned.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMainView = () => (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Roles Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Manage user roles and systemic access levels.</p>
                </div>
                <PermissionGate permission={PERMISSIONS.ROLE_CREATE}>
                    <button
                        onClick={() => handleOpenDrawer()}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Add New Role
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
                        placeholder="Search roles..."
                        className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                            viewMode === 'grid' ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm" : "text-gray-400"
                        )}
                    >
                        <LayoutGrid size={16} />
                        Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                            viewMode === 'list' ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm" : "text-gray-400"
                        )}
                    >
                        <List size={16} />
                        List
                    </button>
                </div>
            </div>

            {/* Data Layer */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Querying System Layers...</p>
                </div>
            )}
            {!isLoading && viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredRoles.map((role) => (
                        <div
                            key={role.id}
                            onClick={() => setViewDetailRole(role)}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 group cursor-pointer hover:shadow-lg hover:border-primary-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-600/10 transition-colors"></div>

                            <div className="aspect-square bg-primary-50 dark:bg-primary-900/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-all duration-500 group-hover:scale-95">
                                <Shield size={36} className="text-primary-600 dark:text-primary-400 transform group-hover:rotate-12 transition-transform duration-500" />
                            </div>

                            <div className="px-1">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-none tracking-tight mb-2 truncate">{role.name}</h3>
                                {/* <div className="flex items-center gap-1.5 mb-4">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{role.guard_name}</span>
                                </div> */}

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Permissions</span>
                                        <span className="text-[10px] font-bold text-gray-900 dark:text-white">{role.permissions?.length || 0} Pts</span>
                                    </div>
                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setViewDetailRole(role)}
                                            className="p-1.5 rounded-lg text-gray-300 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <PermissionGate permission={PERMISSIONS.ROLE_UPDATE}>
                                            <button
                                                onClick={() => handleOpenDrawer(role)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </PermissionGate>
                                        <PermissionGate permission={PERMISSIONS.ROLE_DELETE}>
                                            <button
                                                onClick={() => handleDeleteRole(role)}
                                                className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </PermissionGate>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && viewMode === 'grid' && filteredRoles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                </div>
            )}

            {!isLoading && viewMode === 'list' && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol</th>
                                {/* <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Context</th> */}
                                {/* <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deployment</th> */}
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredRoles.map((role) => (
                                <tr
                                    key={role.id}
                                    onClick={() => setViewDetailRole(role)}
                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:rotate-6 transition-all duration-300 border border-primary-100 dark:border-primary-900/20">
                                                <Shield size={18} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{role.name}</span>
                                                <p className="text-[9px] font-medium text-gray-400">{role.permissions?.length} Permissions</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-[9px] font-bold uppercase tracking-wider">{role.guard_name}</span>
                                    </td> */}
                                    {/* <td className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">{new Date(role.created_at).toLocaleDateString()}</td> */}
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => setViewDetailRole(role)}
                                                className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <PermissionGate permission={PERMISSIONS.ROLE_UPDATE}>
                                                <button
                                                    onClick={() => handleOpenDrawer(role)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </PermissionGate>
                                            <PermissionGate permission={PERMISSIONS.ROLE_DELETE}>
                                                <button onClick={() => handleDeleteRole(role)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </PermissionGate>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredRoles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                        </div>
                    )}
                </div>
            )}

            {/* System Pagination */}
            {pagination && pagination.total > 0 && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                        Displaying <span className="text-primary-600">{roles.length}</span> of <span className="text-primary-600">{pagination.total}</span> Roles
                    </p>
                    <div className="flex items-center gap-1">
                        {pagination.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url || link.active}
                                onClick={() => handlePageChange(link.url)}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-xs font-bold transition-all",
                                    link.active
                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                                        : "bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700",
                                    !link.url && "opacity-30 cursor-not-allowed"
                                )}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="relative">
            {viewDetailRole ? renderDetailView() : renderMainView()}

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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Role</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete this role?
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This action cannot be undone. This will permanently remove the role and affect users assigned to it.
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

            {/* Off-Canvas Drawer (Create/Edit) */}
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

                {/* Drawer Panel */}
                <div
                    className={cn(
                        "absolute top-0 right-0 h-full w-full max-w-[480px] bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col",
                        isDrawerOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-20">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <div className="p-2.5 rounded-xl bg-primary-600 text-white">
                                    <ShieldCheck size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                                    {selectedRole ? 'Update Role' : 'New Role'}
                                </h2>
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Establish capability points.</p>
                        </div>
                        <button
                            onClick={handleCloseDrawer}
                            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Drawer Body - Explicitly scrollable and flex-1 */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {/* Name Control */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary-600 rounded-full"></span>
                                Identity Label
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. CORE.ADMIN"
                                className={cn(
                                    "w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-2 rounded-2xl text-lg font-bold focus:ring-8 focus:ring-primary-500/5 placeholder:text-gray-300 dark:text-white transition-all shadow-inner uppercase tracking-tight",
                                    formErrors.roleName
                                        ? "border-red-400/60 focus:border-red-400/60"
                                        : "border-transparent focus:border-primary-500/30"
                                )}
                                value={roleName}
                                onChange={(e) => {
                                    setRoleName(e.target.value);
                                    if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, roleName: undefined }));
                                }}
                                autoComplete="off"
                            />
                            <ErrorMessage error={formErrors.roleName} />
                        </div>

                        {/* Capability Matrix Control */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight uppercase">Capability Matrix</h3>
                                    <ErrorMessage error={formErrors.permissions} />
                                </div>
                                <button
                                    onClick={() => {
                                        selectAll();
                                        setFormErrors(prev => ({ ...prev, permissions: undefined }));
                                    }}
                                    className="text-[9px] font-bold text-primary-600 uppercase tracking-widest hover:underline px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                                >
                                    {selectedPermissionIds.length === (allPermissions?.length || 0) ? 'Reset' : 'Select All'}
                                </button>
                            </div>

                            <div className="space-y-6">
                                {groupedPermissions.map((group) => {
                                    const allGroupSelected = group.permissions.every(p => selectedPermissionIds.includes(p.id));
                                    return (
                                        <div key={group.group} className="space-y-4 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-[10px] font-bold text-primary-600/60 uppercase tracking-widest">{group.group}</h4>
                                                <div
                                                    onClick={() => toggleGroup(group.permissions)}
                                                    className={cn(
                                                        "w-10 h-5 rounded-full transition-all cursor-pointer relative",
                                                        allGroupSelected ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-800"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                                        allGroupSelected ? "left-6" : "left-1"
                                                    )}></div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2">
                                                {group.permissions.map(perm => {
                                                    const isActive = selectedPermissionIds.includes(perm.id);
                                                    return (
                                                        <label
                                                            key={perm.id}
                                                            className={cn(
                                                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2",
                                                                isActive
                                                                    ? "bg-white dark:bg-gray-950 border-primary-500/10 shadow-sm text-primary-600"
                                                                    : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all",
                                                                isActive
                                                                    ? "bg-primary-600 border-primary-600"
                                                                    : "border-gray-200 dark:border-gray-700"
                                                            )}>
                                                                {isActive && <Check size={10} className="text-white" strokeWidth={5} />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={isActive}
                                                                onChange={() => togglePermission(perm.id)}
                                                            />
                                                            <span className="text-[11px] font-bold tracking-tight uppercase leading-none">{perm.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Drawer Footer - Sticky Bottom */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 sticky bottom-0 z-20">
                        <button
                            onClick={handleCloseDrawer}
                            className="flex-1 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-[2] bg-primary-600 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSaveRole}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={16} />
                                    Save Layer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolesManagement;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    LayoutGrid,
    List,
    Search,
    Building2,
    Eye,
    Edit2,
    Trash2,
    X,
    Check,
    ChevronDown,
    ArrowLeft,
    Filter,
    MapPin,
    User,
    Calendar,
    Target,
    TrendingUp,
    ShieldCheck,
    History,
    Users,
    Phone,
    Mail,
    Globe,
    AlertCircle,
    Layers,
    PlayCircle,
    Unlock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';

// Contexts
import { useBranch } from '../context/BranchContext';
import { useZone } from '../context/ZoneContext';
import { useRegion } from '../context/RegionContext';
import { useProvince } from '../context/ProvinceContext';

const Branches = () => {
    // Context Data
    const { branches, pagination, isLoading, getBranches, createBranch, updateBranch, deleteBranch } = useBranch();
    const { zones, getZones } = useZone();
    const { regions, getRegions } = useRegion();
    const { provinces, getProvinces } = useProvince();

    const navigate = useNavigate();

    // Local State
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });

    // Helper for pagination
    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getBranches(page);
    };

    // Navigation Handlers
    const handleOpenForm = (branch = null) => {
        if (branch) {
            navigate(`/branches/${branch.id}/edit`);
        } else {
            navigate('/branches/create');
        }
    };




    // Initial Data Fetch
    useEffect(() => {
        getBranches();
        getZones();
        getRegions();
        getProvinces();
    }, []);

    // Filter Branches (Client-side search)
    const filteredBranches = useMemo(() => {
        if (!branches) return [];
        return branches.filter(branch =>
            (branch.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (branch.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (branch.city || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [branches, searchTerm]);


    const handleDeleteClick = (branch) => {
        setDeleteConfirm({ show: true, id: branch.id, name: branch.name });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            await deleteBranch(deleteConfirm.id);
            getBranches(pagination?.currentPage);
            setDeleteConfirm({ show: false, id: null, name: '' });
        }
    };


    const renderMainView = () => (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Branch Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Branch operations and performance management.</p>
                </div>
                <PermissionGate permission={PERMISSIONS.BRANCH_CREATE}>
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Create Branch
                    </button>
                </PermissionGate>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative w-full md:max-w-[600px] flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search branches..."
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

            {/* Branch List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                    {/* <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                        Syncing Tactical Data...
                    </p> */}
                </div>
            ) : filteredBranches.length > 0 ? (
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                        >
                            {filteredBranches.map((branch) => (
                                <div
                                    key={branch.id}
                                    onClick={() => navigate(`/branches/${branch.id}`)}
                                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 group cursor-pointer hover:shadow-lg hover:border-primary-500/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden text-left"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-600/10 transition-colors"></div>

                                    <div className="aspect-square bg-primary-50 dark:bg-primary-900/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-all duration-500 group-hover:scale-95 text-primary-600">
                                        <Building2 size={36} className="transform group-hover:rotate-12 transition-transform duration-500" />
                                    </div>

                                    <div className="px-1 text-left">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-none tracking-tight truncate flex-1">{branch.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-4">
                                            <div className={cn("w-1 h-1 rounded-full", branch.is_active ? "bg-emerald-500" : "bg-red-500")}></div>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{branch.code}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{branch.city}</span>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => navigate(`/branches/${branch.id}`)}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <PermissionGate permission={PERMISSIONS.BRANCH_UPDATE}>
                                                    <button
                                                        onClick={() => handleOpenForm(branch)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
                                                        title="Modify Unit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission={PERMISSIONS.BRANCH_DELETE}>
                                                    <button
                                                        onClick={() => handleDeleteClick(branch)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                                        title="Delete Unit"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </PermissionGate>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar"
                        >
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branch Name</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredBranches.map((branch) => (
                                        <tr
                                            key={branch.id}
                                            onClick={() => navigate(`/branches/${branch.id}`)}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all cursor-pointer group"
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center group-hover:rotate-6 transition-all duration-300 border border-primary-100 dark:border-primary-900/20 shadow-sm">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight block">{branch.name}</span>
                                                        <p className="text-[9px] font-black text-primary-600">{branch.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{branch.city}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase">{branch.province?.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{branch.branch_type}</span>
                                            </td>
                                            <td className="px-6 py-3">
                                                {branch.is_active ? (
                                                    <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                        Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                                        Inactive
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => navigate(`/branches/${branch.id}`)} className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"><Eye size={16} /></button>
                                                    <PermissionGate permission={PERMISSIONS.BRANCH_UPDATE}>
                                                        <button onClick={() => handleOpenForm(branch)} className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Edit2 size={16} /></button>
                                                    </PermissionGate>
                                                    <PermissionGate permission={PERMISSIONS.BRANCH_DELETE}>
                                                        <button onClick={() => handleDeleteClick(branch)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                                                    </PermissionGate>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="p-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-200 mb-6">
                        <Building2 size={64} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        NO RESULTS AVAILABLE
                    </h3>
                    <p className="text-sm text-gray-500 font-bold max-w-sm mt-2 uppercase tracking-widest opacity-60">
                        The tactical registry is currently void of any operational units matching your query.
                    </p>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Displaying <span className="text-primary-600 font-bold">{branches?.length || 0}</span> of <span className="text-primary-600 font-bold">{pagination.total}</span> Branches
                    </p>
                    <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-center sm:justify-end">
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
    );

    return (
        <div className="relative">
            {renderMainView()}

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm.show && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 text-left">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                            className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative z-10 border border-gray-100 dark:border-gray-800 text-left"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Delete Branch</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Security Clearance Required</p>
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">
                                Are you certain you want to remove <span className="text-red-600 font-bold underline decoration-2 underline-offset-4">{deleteConfirm.name}</span>? This action is irreversible.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                                    className="flex-1 px-6 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 px-6 py-3.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 hover:-translate-y-1 active:scale-95 transition-all"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Branches;
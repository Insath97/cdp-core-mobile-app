import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Save,
    AlertCircle,
    ChevronDown,
    Calendar,
    CheckCircle,
    Info,
    Trash2,
    Edit2,
    Building2,
    Plus,
    X,
    Filter,
    Target,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn, formatCurrency } from '../lib/utils';
import { useTarget } from '../context/TargetContext';
import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';
import toast from 'react-hot-toast';

const TargetAssignment = () => {
    const { user: authUser } = useAuth();
    const { targets, pagination, isLoading, getTargets, deleteTarget } = useTarget();
    const navigate = useNavigate();

    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        getTargets(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.lastPage) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenForm = (target = null) => {
        if (target) {
            navigate(`/targets-config/${target.id}/edit`);
        } else {
            navigate('/targets-config/create');
        }
    };


    const handleDeleteClick = (target) => {
        setDeleteConfirm({
            show: true,
            id: target.id,
            name: target.user?.name ? `${target.user.name} (${target.period_key})` : `Target #${target.id}`
        });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, id: null, name: '' });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            setIsDeleting(true);
            try {
                await deleteTarget(deleteConfirm.id);
                toast.success('Target deleted successfully', {
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
                getTargets(currentPage);
                handleDeleteCancel();
            } catch (error) {
                console.error("Failed to delete target:", error);
                toast.error(error || 'Failed to delete target', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const filteredTargets = useMemo(() => {
        if (!targets) return [];
        return targets.filter(t =>
            (t.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.period_key || '').includes(searchTerm) ||
            (t.period_type || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [targets, searchTerm]);

    // Generate pagination range
    const getPaginationRange = () => {
        const delta = 2;
        const range = [];
        const left = currentPage - delta;
        const right = currentPage + delta;

        for (let i = 1; i <= pagination.lastPage; i++) {
            if (i === 1 || i === pagination.lastPage || (i >= left && i <= right)) {
                range.push(i);
            }
        }
        return range;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Target Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Assign and monitor performance objectives for users.</p>
                </div>
                <PermissionGate permission={PERMISSIONS.TARGET_CREATE}>
                    <button
                        onClick={() => handleOpenForm()}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                    >
                        <Plus size={18} />
                        New Target
                    </button>
                </PermissionGate>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative w-full md:w-[400px] group">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by user or period..."
                        className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[11px] font-bold text-gray-400 uppercase tracking-wider border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer">
                    <Filter size={14} />
                    Filter: <span className="text-gray-900 dark:text-white ml-1">Active</span>
                </div>
            </div>

            {/* Target List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calibrating Objectives...</p>
                </div>
            ) : (
                <>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">User</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Period</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Target (LKR)</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Achieved</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Progress</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredTargets.map((target) => (
                                    <tr key={target.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all group cursor-default">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs uppercase">
                                                    {target.user?.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                        {target.user?.name || 'Unknown User'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {target.user?.email || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">
                                                    {target.period_key}
                                                </span>
                                                <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                                    {target.period_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
                                                {formatCurrency(target.target_amount)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                                                {formatCurrency(target.achieved_amount || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            parseFloat(target.achievement_percentage) >= 100
                                                                ? "bg-emerald-500"
                                                                : parseFloat(target.achievement_percentage) >= 70
                                                                    ? "bg-primary-500"
                                                                    : "bg-amber-500"
                                                        )}
                                                        style={{ width: `${Math.min(parseFloat(target.achievement_percentage), 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-500">
                                                    {parseFloat(target.achievement_percentage).toFixed(2)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const currentStatus = parseFloat(target.achievement_percentage) >= 100 ? 'achieved' : 'active';

                                                return (
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit border transition-all",
                                                        currentStatus === 'active'
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20"
                                                            : currentStatus === 'achieved'
                                                                ? "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20"
                                                                : "bg-gray-50 text-gray-400 border-gray-100 dark:bg-gray-800/30 dark:border-gray-800"
                                                    )}>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            currentStatus === 'active' ? "bg-emerald-500" :
                                                                currentStatus === 'achieved' ? "bg-blue-500" : "bg-gray-400"
                                                        )}></span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">{currentStatus}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <PermissionGate permission={PERMISSIONS.TARGET_UPDATE}>
                                                    <button
                                                        onClick={() => handleOpenForm(target)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </PermissionGate>
                                                <PermissionGate permission={PERMISSIONS.TARGET_DELETE}>
                                                    <button
                                                        onClick={() => handleDeleteClick(target)}
                                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
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
                        {filteredTargets.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-300 mb-4 transition-colors">
                                    <Target size={48} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">NO RESULTS AVAILABLE</h3>
                                <p className="text-sm text-gray-500 max-w-[250px] mt-2">No active targets found for the selected criteria.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.lastPage > 1 && (
                        <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} entries
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        currentPage === 1
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    )}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {getPaginationRange().map((page, index, array) => (
                                    <React.Fragment key={page}>
                                        {index > 0 && array[index - 1] !== page - 1 && (
                                            <span className="text-gray-400 px-2">...</span>
                                        )}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={cn(
                                                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                currentPage === page
                                                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                                                    : "text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    </React.Fragment>
                                ))}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.lastPage}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        currentPage === pagination.lastPage
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    )}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Target</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete this target assignment?
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Assignment: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        This will remove the performance objective for this period. Historical data may be affected.
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
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                        {isDeleting ? 'Deleting...' : 'Delete'}
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

export default TargetAssignment;
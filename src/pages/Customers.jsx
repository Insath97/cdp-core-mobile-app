// Customers.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    LayoutGrid,
    List,
    Search,
    UserCircle,
    Edit2,
    Trash2,
    ChevronRight,
    Building2,
    Phone,
    Globe,
    AlertCircle,
    Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { useBranch } from '../context/BranchContext';
import toast from 'react-hot-toast';

import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';

const Customers = () => {
    const navigate = useNavigate();
    const {
        customers,
        pagination,
        isLoading,
        getCustomers,
        deleteCustomer
    } = useCustomer();

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const { branches, getBranches } = useBranch();
    const [branchFilter, setBranchFilter] = useState('all');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            await Promise.all([
                getCustomers(),
                getBranches()
            ]);
        } catch (error) {
            toast.error('Failed to load initial data', {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        }
    };

    const handlePageChange = (url) => {
        if (!url) return;
        const page = new URL(url).searchParams.get('page');
        getCustomers(page);
    };

    const handleDeleteClick = (customer) => {
        setDeleteConfirm({ show: true, id: customer.id, name: customer.full_name });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.id) {
            try {
                await deleteCustomer(deleteConfirm.id);
                toast.success('Customer removed successfully', {
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
                setDeleteConfirm({ show: false, id: null, name: '' });
                getCustomers(pagination.currentPage);
            } catch (error) {
                toast.error(typeof error === 'string' ? error : 'Failed to delete customer', {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            }
        }
    };

    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        return customers.filter(customer => {
            const matchesSearch =
                (customer.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.customer_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.id_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (customer.phone_primary || '').toLowerCase().includes(searchTerm.toLowerCase());

            const matchesBranch = branchFilter === 'all' || customer.branch_id?.toString() === branchFilter.toString();

            return matchesSearch && matchesBranch;
        });
    }, [customers, searchTerm, branchFilter]);

    return (
        <div className="relative min-h-screen">
            <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">Investor Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Investor management and onboarding.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <PermissionGate permission={PERMISSIONS.Investor_CREATE}>
                            <button
                                onClick={() => navigate('/customers/add')}
                                className="flex-1 sm:flex-none justify-center bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center gap-2 group active:scale-95"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                                Create Investor
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Tactical Control Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300">
                    <div className="relative w-full lg:max-w-[400px] xl:max-w-[500px] flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search investors by name, nic or identifier..."
                            className="w-full pl-10 pr-6 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[11px] font-bold text-gray-400 uppercase tracking-wider border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer flex-1 sm:flex-none">
                            <Building2 size={14} />
                            <span className="whitespace-nowrap">Branch:</span>
                            <select
                                className="bg-transparent border-none p-0 text-gray-900 dark:text-white focus:ring-0 cursor-pointer text-[11px] font-bold outline-none"
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                            >
                                <option value="all">ALL UNITS</option>
                                {branches?.map(b => (
                                    <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-gray-100 dark:bg-gray-800 mx-1"></div>

                        <div className="flex items-center gap-1.5 p-1 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl flex-1 sm:flex-none justify-center sm:justify-start">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "flex-1 sm:flex-none p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                                    viewMode === 'grid' ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm" : "text-gray-400"
                                )}
                            >
                                <LayoutGrid size={16} />
                                Grid
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "flex-1 sm:flex-none p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider",
                                    viewMode === 'list' ? "bg-white dark:bg-gray-900 text-primary-600 shadow-sm" : "text-gray-400"
                                )}
                            >
                                <List size={16} />
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid/List View Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                        {/* <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                            Syncing Tactical Data...
                        </p> */}
                    </div>
                ) : filteredCustomers.length > 0 ? (
                    <AnimatePresence mode="wait">
                        {viewMode === 'grid' ? (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                            >
                                {filteredCustomers.map((customer) => (
                                    <CustomerCard
                                        key={customer.id}
                                        customer={customer}
                                        onViewDetails={() => navigate(`/customers/${customer.id}`)}
                                        onEdit={() => navigate(`/customers/${customer.id}/edit`)}
                                        onDelete={() => handleDeleteClick(customer)}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left min-w-[1000px]">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                                    Name
                                                </th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                                    ID Info
                                                </th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                                    Contact
                                                </th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                                                    Operational Status
                                                </th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {filteredCustomers.map((customer) => (
                                                <tr
                                                    key={customer.id}
                                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                                    className="hover:bg-primary-50/10 dark:hover:bg-primary-900/5 transition-all cursor-pointer group"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                                                                <UserCircle size={24} />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-black text-gray-900 dark:text-white uppercase truncate block max-w-[200px]">
                                                                    {customer.full_name}
                                                                </span>
                                                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-0.5">
                                                                    {customer.customer_code}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase">
                                                                {customer.id_type?.toUpperCase()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-tight">
                                                                {customer.id_number}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                                                                <Phone size={12} className="text-gray-400" />
                                                                {customer.phone_primary}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                                                                <Globe size={12} className="text-gray-400" />
                                                                {customer.city || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-left">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                                {customer.employment_status?.replace('_', ' ') || 'N/A'}
                                                            </span>
                                                            {customer.is_active ? (
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                                        Active
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                                                        Limited
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                            <PermissionGate permission={PERMISSIONS.Investor_UPDATE}>
                                                                <button
                                                                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                                                                    className="p-3 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all border border-transparent hover:border-primary-100"
                                                                    aria-label="Edit Investor"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                            </PermissionGate>
                                                            <PermissionGate permission={PERMISSIONS.Investor_DELETE}>
                                                                <button
                                                                    onClick={() => handleDeleteClick(customer)}
                                                                    className="p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-100"
                                                                    aria-label="Delete Investor"
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
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="p-8 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-200 mb-6">
                            <Users size={64} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            NO RESULTS AVAILABLE
                        </h3>
                        <p className="text-sm text-gray-500 font-bold max-w-sm mt-2 uppercase tracking-widest opacity-60">
                            The tactical registry is currently void of any high-value assets matching your query.
                        </p>
                    </div>
                )}

                {/* Pagination */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Managed Records: <span className="text-primary-600">{filteredCustomers.length}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={!pagination.prev}
                            onClick={() => handlePageChange(pagination.prev)}
                            className="p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-bold"
                        >
                            <ChevronRight size={16} className="rotate-180" />
                        </button>

                        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none px-2 custom-scrollbar pb-1 sm:pb-0">
                            {pagination.links && pagination.links.map((link, i) => {
                                if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') return null;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(link.url)}
                                        className={cn(
                                            "w-8 h-8 flex-shrink-0 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                                            link.active
                                                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                                                : "bg-transparent text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        {link.label}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            disabled={!pagination.next}
                            onClick={() => handlePageChange(pagination.next)}
                            className="p-2 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-bold"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <DeleteModal
                    show={deleteConfirm.show}
                    name={deleteConfirm.name}
                    onCancel={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                    onConfirm={confirmDelete}
                />
            </div>
        </div>
    );
};

const CustomerCard = ({ customer, onViewDetails, onEdit, onDelete }) => (
    <div
        onClick={onViewDetails}
        className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary-500/20 transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                <UserCircle size={20} />
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-bold text-primary-600 uppercase tracking-wider">
                    {customer.customer_code}
                </span>
                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border",
                    customer.is_active
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-red-50 text-red-600 border-red-100"
                )}>
                    {customer.is_active ? 'Active' : 'Limited'}
                </div>
            </div>
        </div>

        <div className="space-y-3 flex-1 text-left">
            <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors line-clamp-1">
                    {customer.full_name}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                    {customer.id_type?.toUpperCase()}: {customer.id_number}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", customer.is_active ? "bg-emerald-500" : "bg-red-400")}></div>
                        <span className="text-[9px] font-bold uppercase text-gray-700 dark:text-gray-300">
                            {customer.is_active ? 'Active' : 'Limited'}
                        </span>
                    </div>
                </div>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-2.5 rounded-xl">
                    <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">City</p>
                    <span className="text-[9px] font-bold uppercase text-gray-700 dark:text-gray-300 truncate block">
                        {customer.city || 'N/A'}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2 mt-5 relative z-10 w-full">
            <PermissionGate permission={PERMISSIONS.Investor_UPDATE}>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Edit
                </button>
            </PermissionGate>
            <PermissionGate permission={PERMISSIONS.Investor_DELETE}>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2.5 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all hover:scale-[1.05]"
                    aria-label="Delete Investor"
                >
                    <Trash2 size={14} />
                </button>
            </PermissionGate>
        </div>
    </div>
);

const DeleteModal = ({ show, name, onCancel, onConfirm }) => (
    <AnimatePresence>
        {show && (
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                    onClick={onCancel}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 relative z-10 border border-gray-100 dark:border-gray-800 text-center"
                >
                    <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                        Confirm Eradication
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8 opacity-70">
                        You are about to permanently purge <span className="text-red-500 font-bold">"{name}"</span> from the central registry.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all"
                        >
                            Confirm
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default Customers;
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBranch } from '../context/BranchContext';
import {
    MapPin,
    Target,
    Edit2,
    ArrowLeft,
    Phone,
    Layers,
    Globe,
    Check,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const BranchDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentBranch: branch, getBranchById, isLoading } = useBranch();

    useEffect(() => {
        if (id) {
            getBranchById(id);
        }
    }, [id, getBranchById]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                {/* <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                    Syncing Tactical Data...
                </p> */}
            </div>
        );
    }

    if (!branch) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Branch Node Not Found</h2>
                <p className="text-gray-500 mt-2 font-medium">The requested branch data is unavailable or has been decommissioned.</p>
                <button
                    onClick={() => navigate('/branches')}
                    className="mt-8 bg-primary-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 mx-auto hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                >
                    <ArrowLeft size={18} />
                    Back to Operations
                </button>
            </div>
        );
    }

    const DetailItem = ({ label, value }) => (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
            <div className={cn(
                "w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/20 border-2 rounded-xl text-sm font-bold text-gray-900 dark:text-white font-mono border-transparent shadow-sm",
                label !== "Email Address" && "uppercase"
            )}>
                {value || '-'}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <button
                onClick={() => navigate('/branches')}
                className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-bold mb-6 transition-colors group"
            >
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                    <ArrowLeft size={18} />
                </div>
                Back to Branches
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                        Branch: {branch?.name}
                    </h1>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        onClick={() => navigate(`/branches/${id}/edit`)}
                        className="bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-gray-800 transition-all shadow-2xl shadow-gray-400/10 active:scale-95 group"
                    >
                        <Edit2 size={16} className="group-hover:rotate-12 transition-transform" />
                        Update Branch
                    </button>
                </div>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            <DetailItem label="Branch Name" value={branch.name} />
                            <DetailItem label="Access Code" value={branch.code} />
                            <DetailItem label="Branch Type" value={branch.branch_type} />
                            <DetailItem label="Opening Date" value={branch.opening_date ? new Date(branch.opening_date).toLocaleDateString() : ''} />
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-50 dark:border-gray-800 mt-4">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center", branch.is_head_office ? "bg-primary-600 border-primary-600 text-white" : "bg-gray-100 border-gray-200 text-gray-400")}>
                                    {branch.is_head_office ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
                                </div>
                                <span className={cn("text-xs font-bold uppercase tracking-wider", branch.is_head_office ? "text-primary-600" : "text-gray-400")}>Head Office</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center", branch.is_active ? "bg-emerald-500 border-emerald-500 text-white" : "bg-gray-100 border-gray-200 text-gray-400")}>
                                    {branch.is_active ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
                                </div>
                                <span className={cn("text-xs font-bold uppercase tracking-wider", branch.is_active ? "text-emerald-600" : "text-gray-400")}>Unit Active</span>
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
                        <div className="lg:col-span-2">
                            <DetailItem label="Address Line 1" value={branch.address_line1} />
                        </div>
                        <DetailItem label="City" value={branch.city} />
                        <DetailItem label="Postal Code" value={branch.postal_code} />
                        {branch.latitude && branch.longitude && (
                            <div className="lg:col-span-4 mt-2">
                                <DetailItem label="Coordinates" value={`${branch.latitude}, ${branch.longitude}`} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                    <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-emerald-50/10 dark:bg-emerald-900/10">
                        <Phone size={14} className="text-emerald-500" />
                        <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Contact</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <DetailItem label="Primary Line" value={branch.phone_primary} />
                        <DetailItem label="Secondary Line" value={branch.phone_secondary} />
                        <DetailItem label="Email Address" value={branch.email} />
                        <DetailItem label="Fax" value={branch.fax} />
                    </div>
                </div>

                {/* Geographical Hierarchy */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                    <div className="px-4 py-2.5 border-b border-gray-50 dark:border-gray-800 flex items-center gap-2 bg-purple-50/10 dark:bg-purple-900/10">
                        <Globe size={14} className="text-purple-500" />
                        <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Geographical Hierarchy</h3>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <DetailItem label="Country" value={branch.region?.zone?.province?.country?.name} />
                        <DetailItem label="Province" value={branch.region?.zone?.province?.name} />
                        <DetailItem label="Zone" value={branch.region?.zone?.name} />
                        <DetailItem label="Region" value={branch.region?.name} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BranchDetails;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import {
    User,
    Mail,
    Shield,
    CheckCircle2,
    Calendar,
    Hash,
    MapPin,
    AlertCircle,
    Activity,
    ArrowLeft,
    Globe,
    Map,
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    X,
    Loader2,
    Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Contexts
import { useBranch } from '../context/BranchContext';
import { useZone } from '../context/ZoneContext';
import { useRegion } from '../context/RegionContext';
import { useProvince } from '../context/ProvinceContext';
import { useUser } from '../context/UserContext';

const Profile = () => {
    const { user, getProfile, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const navigate = useNavigate();

    // Data from Slices
    const { branches, getBranches } = useBranch();
    const { zones, getZones } = useZone();
    const { regions, getRegions } = useRegion();
    const { provinces, getProvinces } = useProvince();
    const { users, getUsers } = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Only set local loading if we really need to fetch something
                const needsProfile = !user;
                const needsMetadata = branches.length === 0 || zones.length === 0 || regions.length === 0 || provinces.length === 0 || users.length === 0;

                if (needsProfile || needsMetadata) {
                    setLoading(true);
                }

                // fetch profile if missing
                if (needsProfile) {
                    await getProfile();
                }

                // Fetch metadata collections in parallel for efficiency
                const metadataPromises = [];
                if (branches.length === 0) metadataPromises.push(getBranches());
                if (zones.length === 0) metadataPromises.push(getZones());
                if (regions.length === 0) metadataPromises.push(getRegions());
                if (provinces.length === 0) metadataPromises.push(getProvinces());
                if (users.length === 0) metadataPromises.push(getUsers());

                if (metadataPromises.length > 0) {
                    await Promise.all(metadataPromises);
                }

            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError(err.response?.data?.message || 'An error occurred while loading profile information');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, branches.length, zones.length, regions.length, provinces.length, users.length, getProfile, getBranches, getZones, getRegions, getProvinces, getUsers]);


    const handleOpenPasswordModal = () => {
        setIsPasswordModalOpen(true);
    };

    if (loading || (authLoading && !user)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-pulse">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-8">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 mb-4">
                    <AlertCircle size={48} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Profile Error</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-8 py-2.5 bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Mapping Helpers
    const getZoneName = () => {
        const zoneId = user?.zone_id;
        const zone = zones.find(z => String(z.id) === String(zoneId));
        return zone?.name || user?.zone?.name || 'N/A';
    };

    const getRegionName = () => {
        const regionId = user?.region_id;
        const region = regions.find(r => String(r.id) === String(regionId));
        return region?.name || user?.region?.name || 'N/A';
    };

    const getProvinceName = () => {
        const provinceId = user?.province_id;
        const province = provinces.find(p => String(p.id) === String(provinceId));
        return province?.name || user?.province?.name || 'N/A';
    };

    const getBranchName = () => {
        const branchId = user?.branch_id;
        const branch = branches.find(b => String(b.id) === String(branchId));
        return branch?.name || user?.branch?.name || 'N/A';
    };

    const getParentUserName = () => {
        const parentId = user?.parent_user_id;
        if (!parentId) return 'No Parent Assigned';
        const parent = users.find(u => String(u.id) === String(parentId));
        return parent?.name || 'Unknown User';
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-2 pb-10">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 text-gray-500 hover:text-primary-600 hover:bg-white dark:hover:bg-gray-800 font-bold transition-all duration-300 group border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:shadow-sm"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dashboard</span>
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenPasswordModal}
                        className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-orange-50/50 dark:bg-orange-900/20 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-800 font-bold transition-all duration-300 group border border-orange-100 dark:border-orange-800/50 hover:shadow-sm"
                    >
                        <Lock size={18} className="group-hover:rotate-12 transition-transform" />
                        <span>Change Password</span>
                    </button>
                    <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        user?.is_active
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                            : "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20"
                    )}>
                        {user?.is_active ? 'Account Active' : 'Account Inactive'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Overview Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center relative overflow-hidden group text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:bg-primary-500/10 animate-float"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-500/5 rounded-full -ml-12 -mb-12 transition-all group-hover:bg-primary-500/10 animate-float" style={{ animationDelay: '-3s' }}></div>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
                            <img
                                src={user?.profile_image && user.profile_image !== "/image"
                                    ? user.profile_image
                                    : `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=298c77&color=fff&size=256&bold=true`}
                                alt={user?.name}
                                className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-[6px] border-white dark:border-gray-800 shadow-2xl object-cover z-10 hover:scale-[1.02] transition-transform duration-500"
                            />
                            <div className="absolute -bottom-1 -right-1 p-2.5 bg-emerald-500 text-white rounded-2xl border-4 border-white dark:border-gray-900 shadow-xl z-20 animate-bounce-subtle">
                                <CheckCircle2 size={22} />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight">{user?.name}</h1>
                            <div className="mt-3 inline-flex items-center px-4 py-1.5 bg-primary-500/10 dark:bg-primary-400/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary-500/20">
                                {user?.user_type}
                            </div>
                        </div>

                        <div className="w-full mt-10 space-y-4 relative z-10">
                            <div className="flex items-center gap-2 text-left mb-2">
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned Role</span>
                                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                {user?.roles?.map(role => (
                                    <span key={role.id} className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-[11px] font-bold rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                                        {role.name}
                                    </span>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>

                {/* Detailed Information Grid */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden flex-1">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>

                        <div className="flex items-center gap-4 mb-12 relative z-10">
                            <div className="p-4 bg-primary-600 text-white rounded-[1.25rem] shadow-xl shadow-primary-600/20">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">Account Registry</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Full database synchronization for the current identity.</p>
                            </div>
                        </div>

                        <div className="space-y-12 relative z-10">
                            {/* Identity Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-primary-500 rounded-full"></div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Personal Identity</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DetailItem label="Full Name" value={user?.name} icon={User} />
                                    <DetailItem label="Access Username" value={user?.username} icon={Hash} />
                                    <DetailItem label="Email Address" value={user?.email} icon={Mail} />
                                    <DetailItem label="Parent User" value={getParentUserName()} icon={User} highlight />
                                </div>
                            </section>

                            {/* Geographic & Regional Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-amber-500 rounded-full"></div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Operational Mapping</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <DetailItem label="Zone" value={getZoneName()} icon={Globe} />
                                    <DetailItem label="Region" value={getRegionName()} icon={Map} />
                                    <DetailItem label="Province" value={getProvinceName()} icon={MapPin} />
                                    <DetailItem label="Primary Branch" value={getBranchName()} icon={Building2} />
                                </div>
                            </section>

                            {/* Security & Lifecycle */}
                            {/* <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
                                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">System Details</h3>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Created On</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{formatDate(user?.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-gray-400">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Updated At</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{formatDate(user?.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </section> */}
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

const DetailItem = ({ label, value, icon: Icon, highlight }) => (
    <div className="group">
        <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] ml-1">{label}</label>
        <div className={cn(
            "mt-1.5 flex items-center gap-3 p-4 rounded-[1.25rem] transition-all duration-300 border border-transparent",
            "bg-gray-50/50 dark:bg-gray-800/30 group-hover:bg-white dark:group-hover:bg-gray-800",
            "group-hover:border-primary-100 dark:group-hover:border-primary-900 group-hover:shadow-2xl group-hover:shadow-primary-600/5"
        )}>
            <div className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                highlight
                    ? "bg-primary-100 dark:bg-primary-900 text-primary-600"
                    : "bg-white dark:bg-gray-900 text-gray-400 group-hover:text-primary-600 group-hover:scale-110 shadow-sm"
            )}>
                <Icon size={18} />
            </div>
            <span className={cn(
                "text-sm font-black tracking-tight transition-colors duration-300",
                highlight ? "text-primary-600 dark:text-primary-400" : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
            )}>
                {value || 'Not Defined'}
            </span>
        </div>
    </div>
);

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const { changePassword } = useAuth();
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.new_password !== formData.new_password_confirmation) {
            toast.error('New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(formData);
            toast.success('Password changed successfully!', {
                icon: '🔐',
                style: { borderRadius: '12px', background: '#10b981', color: '#fff' }
            });
            onClose();
            setFormData({
                current_password: '',
                new_password: '',
                new_password_confirmation: ''
            });
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to change password', {
                style: { borderRadius: '12px', background: '#ef4444', color: '#fff' }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl max-w-md w-full relative z-10 border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                        <div className="p-8 sm:p-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl">
                                        <Lock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                            Update Security
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                            Modify access credentials
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                    <div className="relative group">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="current_password"
                                            autoComplete="current-password"
                                            required
                                            value={formData.current_password}
                                            onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 p-4 rounded-2xl transition-all outline-none text-sm font-bold text-gray-900 dark:text-white pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                    <div className="relative group">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="new_password"
                                            autoComplete="new-password"
                                            required
                                            value={formData.new_password}
                                            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 p-4 rounded-2xl transition-all outline-none text-sm font-bold text-gray-900 dark:text-white pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <input
                                            type={showPasswords.confirm ? "text" : "password"}
                                            name="new_password_confirmation"
                                            autoComplete="new-password"
                                            required
                                            value={formData.new_password_confirmation}
                                            onChange={(e) => setFormData({ ...formData, new_password_confirmation: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 p-4 rounded-2xl transition-all outline-none text-sm font-bold text-gray-900 dark:text-white pr-12"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-4 px-6 rounded-2xl border border-gray-100 dark:border-gray-800 text-[11px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-[2] bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 px-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-gray-900/10 dark:hover:shadow-white/10 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <span>Update Password</span>
                                                <ShieldCheck size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Profile;

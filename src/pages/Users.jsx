import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    LayoutGrid,
    List,
    Search,
    User,
    Eye,
    Edit2,
    Trash2,
    ChevronRight,
    X,
    Check,
    ChevronDown,
    ArrowLeft,
    Shield,
    Mail,
    Phone,
    Lock,
    UserCircle,
    Building2,
    ShieldCheck,
    Target,
    TrendingUp,
    MapPin,
    AlertCircle,
    UserX
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Contexts
import { useUser } from '../context/UserContext';
import { useBranch } from '../context/BranchContext';
import { useLevel } from '../context/LevelContext';
import { useZone } from '../context/ZoneContext';
import { useRegion } from '../context/RegionContext';
import { useProvince } from '../context/ProvinceContext';
import { useRole } from '../context/RoleContext';

import PermissionGate from '../components/PermissionGate';
import { PERMISSIONS } from '../constants/permissions';

const UsersPage = () => {
    const dispatch = useDispatch();

    // Context Data
    const { users, allUsers, pagination, isLoading, getUsers, getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } = useUser();
    const { branches, getBranches } = useBranch();
    const { levels, getLevels } = useLevel();
    const { zones, getZones } = useZone();
    const { regions, getRegions } = useRegion();
    const { provinces, getProvinces } = useProvince();
    const { roles, getRoles } = useRole();

    // Local State
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [viewDetailUser, setViewDetailUser] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    // Reset errors when drawer opens/closes
    useEffect(() => {
        if (!isDrawerOpen) {
            setFieldErrors({});
        }
    }, [isDrawerOpen]);

    // Form State
    const initialFormState = {
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_type: 'hierarchy', // admin, hierarchy, customer
        role: '',
        is_active: true,
        can_login: true,
        profile_image: '',
        // Hierarchy specific
        level_id: '',
        parent_user_id: '',
        branch_id: '',
        zone_id: '',
        region_id: '',
        province_id: '',
        id_type: '',
        id_number: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    // Initial Data Fetch
    useEffect(() => {
        getUsers();
        getAllUsers();
        getRoles();
        getBranches();
        getLevels();
        getZones();
        getRegions();
        getProvinces();
    }, [dispatch]);

    const handlePageChange = (url) => {
        if (!url) return;
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const page = urlParams.get('page');
        getUsers(page);
    };

    // Filter Users (Client-side search on current page data - ideally server side but mixed approach for now)
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        return users.filter(item => {
            const matchesSearch =
                (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (item.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [users, searchTerm]);

    // Form Handlers
    const handleOpenDrawer = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name || '',
                username: user.username || '',
                email: user.email || '',
                password: '', // Don't populate password on edit
                password_confirmation: '',
                user_type: user.user_type || 'hierarchy',
                // Assuming roles is an array in user object, pick the first one's name or id
                role: user.roles && user.roles.length > 0 ? user.roles[0].name : '',
                is_active: user.is_active ?? true,
                can_login: user.can_login ?? true,
                profile_image: user.profile_image || '',
                level_id: user.level_id || user.level?.id || '',
                parent_user_id: user.parent_user_id || user.parent?.id || '',
                branch_id: user.branch_id || user.branch?.id || '',
                zone_id: user.zone_id || user.zone?.id || '',
                region_id: user.region_id || user.region?.id || '',
                province_id: user.province_id || user.province?.id || '',
                id_type: user.id_type || '',
                id_number: user.id_number || ''
            });
        } else {
            setEditingUser(null);
            setFormData(initialFormState);
        }
        setIsDrawerOpen(true);
    };

    const handleToggleStatus = async (user) => {
        try {
            // Using unwrap() ensures we catch the actual error from the thunk
            await toggleUserStatus(user.id).unwrap();

            toast.success(`User status updated to ${!user.is_active ? 'Active' : 'Inactive'}`, {
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        } catch (err) {
            console.error("Toggle error:", err);
            // If the error message is an object (validation error), extract the message
            const errorMessage = typeof err === 'string' ? err : (err.message || "Failed to update status");
            toast.error(errorMessage, {
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        }
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setEditingUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        let updatedData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        };

        // Auto-select location fields when branch is selected
        if (name === 'branch_id' && value) {
            const selectedBranch = branches.find(b => b.id.toString() === value.toString());
            if (selectedBranch) {
                updatedData = {
                    ...updatedData,
                    zone_id: selectedBranch.zone_id || '',
                    region_id: selectedBranch.region_id || '',
                    province_id: selectedBranch.province_id || '',
                };
            }
        }

        setFormData(updatedData);

        // Premium: Clear error state for THIS specific field as soon as the user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSave = async () => {
        setFieldErrors({});

        // Basic frontend validation for required fields
        const requiredFields = ['username', 'name', 'email'];
        if (!editingUser) requiredFields.push('password', 'password_confirmation');

        if (formData.user_type === 'admin' || formData.user_type === 'hierarchy') {
            requiredFields.push('id_type', 'id_number');
        }

        if (formData.user_type === 'hierarchy' || formData.user_type === 'customer') {
            // branch_id is not required
        }

        const newFieldErrors = {};
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newFieldErrors[field] = [`The ${field.replace('_', ' ')} is required.`];
            }
        });

        // Password confirmation and strength check
        if (!editingUser || (editingUser && formData.password)) {
            if (formData.password && formData.password !== formData.password_confirmation) {
                newFieldErrors.password_confirmation = ['The password confirmation does not match.'];
            }
            if (formData.password && formData.password.length < 8) {
                newFieldErrors.password = ['The password must be at least 8 characters.'];
            }
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            toast.error('Please fill the required fields.', {
                icon: '⚠️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
            return;
        }

        const payload = { ...formData };

        // Clean up payload based on user_type
        if (payload.user_type === 'admin') {
            payload.level_id = null;
            payload.parent_user_id = null;
            payload.branch_id = null;
            payload.zone_id = null;
            payload.region_id = null;
            payload.province_id = null;
        } else if (payload.user_type === 'customer') {
            payload.level_id = null;
            payload.parent_user_id = null;
            // keep branch_id
        }

        // If password is empty during update, remove it
        if (editingUser && !payload.password) {
            delete payload.password;
            delete payload.password_confirmation;
        }

        try {
            if (editingUser) {
                await updateUser(editingUser.id, payload).unwrap();
                toast.success('User updated successfully!', {
                    icon: '✨',
                    duration: 4000,
                    style: { borderRadius: '12px', background: '#10b981', color: '#fff' }
                });
            } else {
                await createUser(payload).unwrap();
                toast.success('User created successfully!', {
                    icon: '🚀',
                    duration: 5000,
                    style: { borderRadius: '12px', background: '#059669', color: '#fff' }
                });
            }
            handleCloseDrawer();
            getUsers(editingUser ? pagination.currentPage : 1);
        } catch (error) {
            console.error("DEBUG: handleSave caught error:", error);

            // Premium: Surgical error mapping
            if (error && typeof error === 'object' && error.isValidationError) {
                setFieldErrors(error.errors || {});

                // Show a clean toast for the first identified error or a generic one
                // Ensure we only toast STRINGS to avoid React render crashes
                const errorsList = error.errors ? Object.values(error.errors).flat() : [];
                const firstError = errorsList.find(e => typeof e === 'string') ||
                    (errorsList[0] ? JSON.stringify(errorsList[0]) : null);

                toast.error(firstError || error.message || 'Validation failed. Please check the fields.', {
                    icon: '⚠️',
                    duration: 4000,
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            } else {
                const displayMessage = typeof error === 'string'
                    ? error
                    : (error?.message || JSON.stringify(error) || 'An unexpected error occurred');
                toast.error(displayMessage, {
                    icon: '⚠️',
                    style: { borderRadius: '12px', background: '#333', color: '#fff' }
                });
            }
        }
    };

    // Helper to render error messages
    const FieldError = ({ name }) => (
        <AnimatePresence mode="wait">
            {fieldErrors[name] && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[10px] font-bold text-red-500 mt-1.5 ml-1 flex items-center gap-1.5"
                >
                    <AlertCircle size={10} />
                    {(() => {
                        const err = fieldErrors[name];
                        if (Array.isArray(err)) return String(err[0]);
                        if (typeof err === 'object') return JSON.stringify(err);
                        return String(err);
                    })()}
                </motion.p>
            )}
        </AnimatePresence>
    );

    // Helper for input class name
    const getInputClass = (name, baseClass) => cn(
        baseClass,
        fieldErrors[name] && "border-red-500/50 bg-red-50/10 focus:border-red-500 rounded-xl"
    );

    const handleDeleteClick = (user) => {
        setDeleteConfirm({ show: true, id: user.id, name: user.name });
    };

    const handleDeleteConfirm = async () => {
        if (deleteConfirm.id) {
            await deleteUser(deleteConfirm.id);
            getUsers(pagination.currentPage);
            setDeleteConfirm({ show: false, id: null, name: '' });
        }
    };

    // Render Helpers
    const getRoleName = (user) => {
        if (user.roles && user.roles.length > 0) return user.roles.map(r => r.name).join(', ');
        return 'No Role';
    };

    const renderDetailView = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-left">
            <button
                onClick={() => setViewDetailUser(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-bold mb-6 transition-colors group"
            >
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                    <ArrowLeft size={18} />
                </div>
                <span className="text-[11px] uppercase tracking-wider">Back to User Registry</span>
            </button>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between text-left">
                    <div className="text-left flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 text-2xl font-bold uppercase">
                                {viewDetailUser.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-1 bg-primary-600 text-white rounded-lg shadow-lg">
                                <ShieldCheck size={14} />
                            </div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">{viewDetailUser.name}</h1>
                            <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest leading-none mt-1">{viewDetailUser.user_type}</p>
                            <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-gray-400">
                                <span className="flex items-center gap-1.5 uppercase tracking-wider"><Mail size={12} className="text-primary-600" /> {viewDetailUser.email}</span>
                            </div>
                        </div>
                    </div>
                    <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
                        <button
                            onClick={() => {
                                handleOpenDrawer(viewDetailUser);
                                setViewDetailUser(null);
                            }}
                            className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group"
                        >
                            <Edit2 size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                            Modify Profile
                        </button>
                    </PermissionGate>
                </div>

                <div className="p-8 bg-gray-50/30 dark:bg-gray-800/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4 text-left">
                            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                Access Control
                            </h3>
                            <div className="space-y-2">
                                <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Username</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.username}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Role</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white capitalize">{getRoleName(viewDetailUser)}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Identity</p>
                                    <p className="text-xs font-black text-gray-900 dark:text-white capitalize">
                                        {viewDetailUser.id_type ? `${viewDetailUser.id_type.replace('_', ' ')} - ${viewDetailUser.id_number}` : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {viewDetailUser.user_type === 'hierarchy' && (
                            <div className="space-y-4 text-left">
                                <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                    Hierarchy Info
                                </h3>
                                <div className="space-y-2">
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Level</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.level?.level_name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Reporting Officer</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.parent?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Branch</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.branch?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewDetailUser.zone && (
                            <div className="space-y-4 text-left">
                                <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                                    Geographical Info
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Country</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.zone.region?.province?.country?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Province</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.zone.region?.province?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Zone</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.zone.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Region</p>
                                        <p className="text-xs font-black text-gray-900 dark:text-white">{viewDetailUser.zone.region?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFullPageForm = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-left pb-20 px-4 sm:px-0">
            <div className="max-w-[1400px] mx-auto">
                <button
                    onClick={handleCloseDrawer}
                    className="flex items-center gap-2 text-gray-400 hover:text-primary-600 font-bold mb-4 transition-colors group"
                >
                    <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-[11px] uppercase tracking-wider">Back to User Registry</span>
                </button>

                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden text-left">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-600/20">
                                    <UserCircle size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight uppercase">{editingUser ? 'Modify User' : 'Create New User'}</h2>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 bg-white dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">Section 01</span>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">User Type</label>
                                    <select
                                        name="user_type"
                                        className={getInputClass('user_type', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                        value={formData.user_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="admin">ADMIN</option>
                                        <option value="hierarchy">HIERARCHY</option>
                                        <option value="customer">CUSTOMER</option>
                                    </select>
                                    <FieldError name="user_type" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. ARSHAD KHAN"
                                        className={getInputClass('name', "w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-primary-500/30 rounded-xl text-[11px] font-bold placeholder:text-gray-300 dark:text-white transition-all uppercase")}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        autoComplete="off"
                                    />
                                    <FieldError name="name" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="username"
                                            className={getInputClass('username', "w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-primary-500/30 rounded-xl text-[11px] font-bold transition-all outline-none dark:text-white uppercase")}
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            autoComplete="username"
                                        />
                                    </div>
                                    <FieldError name="username" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="email@example.com"
                                            className={getInputClass('email', "w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-primary-500/30 rounded-xl text-[11px] font-bold transition-all outline-none dark:text-white")}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <FieldError name="email" />
                                </div>
                            </div>

                            {(formData.user_type === 'admin' || formData.user_type === 'hierarchy') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Type</label>
                                        <select
                                            name="id_type"
                                            className={getInputClass('id_type', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                            value={formData.id_type}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">SELECT ID TYPE</option>
                                            <option value="nic">NIC</option>
                                            <option value="passport">Passport</option>
                                            <option value="driving_license">Driving License</option>
                                            <option value="other">Other</option>
                                        </select>
                                        <FieldError name="id_type" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ID Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="id_number"
                                                placeholder="e.g. 199012345678"
                                                className={getInputClass('id_number', "w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-primary-500/30 rounded-xl text-[11px] font-bold transition-all outline-none dark:text-white uppercase")}
                                                value={formData.id_number}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <FieldError name="id_number" />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            className={getInputClass('password', "w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-primary-500/30 rounded-xl text-[11px] font-bold transition-all outline-none dark:text-white")}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <FieldError name="password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            placeholder="RE-ENTER PASSWORD"
                                            className={getInputClass('password_confirmation', "w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:border-primary-500/30 rounded-xl text-[11px] font-bold transition-all outline-none dark:text-white")}
                                            value={formData.password_confirmation}
                                            onChange={handleInputChange}
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <FieldError name="password_confirmation" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                                <select
                                    name="role"
                                    className={getInputClass('role', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                    value={formData.role}
                                    onChange={handleInputChange}
                                >
                                    <option value="">SELECT ROLE</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.name}>{role.name}</option>
                                    ))}
                                </select>
                                <FieldError name="role" />
                            </div>

                            {formData.user_type === 'hierarchy' && (
                                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-primary-600" />
                                        <h3 className="text-[9px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hierarchy Config</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Level</label>
                                            <select
                                                name="level_id"
                                                className={getInputClass('level_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                                value={formData.level_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">SELECT LEVEL</option>
                                                {levels.map(l => (
                                                    <option key={l.id} value={l.id}>{l.level_name}</option>
                                                ))}
                                            </select>
                                            <FieldError name="level_id" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reporting Officer</label>
                                            <select
                                                name="parent_user_id"
                                                className={getInputClass('parent_user_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                                value={formData.parent_user_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">SELECT PARENT</option>
                                                {allUsers.filter(u => !editingUser || u.id !== editingUser.id).map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
                                                ))}
                                            </select>
                                            <FieldError name="parent_user_id" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                                            <select
                                                name="branch_id"
                                                className={getInputClass('branch_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                                value={formData.branch_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">SELECT BRANCH</option>
                                                {branches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Zone</label>
                                            <select
                                                name="zone_id"
                                                className={getInputClass('zone_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                                value={formData.zone_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">SELECT ZONE</option>
                                                {zones.map(z => (
                                                    <option key={z.id} value={z.id}>{z.name}</option>
                                                ))}
                                            </select>
                                            <FieldError name="zone_id" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Region</label>
                                            <select
                                                name="region_id"
                                                className={getInputClass('region_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                                value={formData.region_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">SELECT REGION</option>
                                                {regions.map(r => (
                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                ))}
                                            </select>
                                            <FieldError name="region_id" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Province</label>
                                            <select
                                                name="province_id"
                                                className={getInputClass('province_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                                value={formData.province_id}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">SELECT PROVINCE</option>
                                                {provinces.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <FieldError name="province_id" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.user_type === 'customer' && (
                                <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Branch</label>
                                        <select
                                            name="branch_id"
                                            className={getInputClass('branch_id', "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-2 rounded-xl text-sm font-bold transition-all outline-none dark:text-white uppercase font-mono border-transparent focus:border-primary-500/20 shadow-sm")}
                                            value={formData.branch_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">SELECT BRANCH</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4">
                            <button onClick={handleCloseDrawer} className="px-6 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors">Cancel</button>
                            <button
                                className={cn(
                                    "px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 group",
                                    isLoading
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                        : "bg-primary-600 text-white shadow-primary-600/30 hover:bg-primary-700 active:scale-[0.98]"
                                )}
                                onClick={handleSave}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                ) : (
                                    <ShieldCheck size={14} />
                                )}
                                {isLoading ? 'Processing...' : (editingUser ? 'Update Profile' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMainView = () => (
        <div className="animate-in fade-in duration-500 space-y-6 text-left pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">User Registry</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Strategic user management and access control.</p>
                </div>
                <PermissionGate permission={PERMISSIONS.USER_CREATE}>
                    <button
                        onClick={() => handleOpenDrawer()}
                        className="bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] group h-fit"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Create New User
                    </button>
                </PermissionGate>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="relative w-full md:max-w-[500px] flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input
                        type="search"
                        name="user-registry-search"
                        placeholder="Search by name, email or username..."
                        className="w-full pl-10 pr-6 py-2 bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none dark:text-white placeholder:text-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoComplete="one-time-code"
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

            {/* User List */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 space-y-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-primary-600/10 border-t-primary-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Building2 className="text-primary-600 animate-pulse" size={24} />
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                                    Syncing User Registry...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {filteredUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => setViewDetailUser(user)}
                                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 group cursor-pointer hover:shadow-xl hover:border-primary-500/20 transition-all duration-300 relative overflow-hidden flex flex-col hover:-translate-y-1"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-600/10 transition-colors"></div>

                                            <div className="aspect-square bg-primary-50 dark:bg-primary-900/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 transition-all duration-500 group-hover:scale-95 shrink-0">
                                                <div className="text-primary-600 dark:text-primary-400 font-black text-2xl uppercase transform group-hover:rotate-12 transition-transform duration-500">
                                                    {user.name.charAt(0)}
                                                </div>
                                            </div>

                                            <div className="px-1 flex-1 flex flex-col min-w-0">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-none tracking-tight mb-2 truncate" title={user.name}>
                                                    {user.name}
                                                </h3>

                                                <div className="space-y-1.5 mb-4 text-left">
                                                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none truncate">{user.user_type}</p>

                                                    <div className="flex flex-col gap-1 mt-1">
                                                        {user.branch?.name && (
                                                            <div className="flex items-center gap-1">
                                                                <Building2 size={10} className="text-gray-400 shrink-0" />
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase truncate">Branch: {user.branch.name}</span>
                                                            </div>
                                                        )}
                                                        {user.zone?.name && (
                                                            <div className="flex items-center gap-1">
                                                                <MapPin size={10} className="text-gray-400 shrink-0" />
                                                                <span className="text-[9px] font-bold text-gray-400 uppercase truncate">
                                                                    {user.zone.name} | {user.zone.region?.name} | {user.zone.region?.province?.name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
{/* 
                                                    <div className="flex items-center justify-between pt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={cn(
                                                                "w-1 h-1 rounded-full",
                                                                user.is_active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                                                            )}></div>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                {user.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                        <div
                                                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }}
                                                            className={cn(
                                                                "w-10 h-5 rounded-full transition-all cursor-pointer relative shrink-0",
                                                                user.is_active ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-800"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                                                user.is_active ? "left-6" : "left-1"
                                                            )}></div>
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800 mt-auto" onClick={e => e.stopPropagation()}>
                                                <div className="flex flex-col min-w-0 pr-2">
                                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1 text-left">Role</span>
                                                    <span className="text-[10px] font-bold text-gray-900 dark:text-white truncate text-left uppercase">{getRoleName(user) || 'User'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => setViewDetailUser(user)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                                                        title="View"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
                                                        <button
                                                            onClick={() => handleOpenDrawer(user)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                    </PermissionGate>
                                                    <PermissionGate permission={PERMISSIONS.USER_DELETE}>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </PermissionGate>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Branch / Zone Information</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                                {/* <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th> */}
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ops</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {filteredUsers.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    onClick={() => setViewDetailUser(user)}
                                                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all cursor-pointer group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 font-bold uppercase">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div className="text-left">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight block">{user.name}</span>
                                                                <span className="text-[11px] text-gray-400">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/10 px-2.5 py-1 rounded-lg border border-primary-100 dark:border-primary-900/30 uppercase tracking-widest text-left">{user.user_type}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1 text-left">
                                                            {user.branch?.name && (
                                                                <div className="flex items-center gap-1">
                                                                    <Building2 size={12} className="text-primary-600/60" />
                                                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight">{user.branch.name}</span>
                                                                </div>
                                                            )}
                                                            {user.zone?.name && (
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin size={12} className="text-primary-600/60" />
                                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                                                                        {user.zone.name} / {user.zone.region?.name} / {user.zone.region?.province?.name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 text-left uppercase">{getRoleName(user)}</span>
                                                    </td>
                                                    {/* <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                                            <div
                                                                onClick={() => handleToggleStatus(user)}
                                                                className={cn(
                                                                    "w-10 h-5 rounded-full transition-all cursor-pointer relative shrink-0",
                                                                    user.is_active ? "bg-emerald-600 shadow-md shadow-emerald-500/20" : "bg-gray-200 dark:bg-gray-800"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                                                    user.is_active ? "left-6" : "left-1"
                                                                )}></div>
                                                            </div>
                                                            <span className={cn(
                                                                "text-[9px] font-black uppercase tracking-[0.2em]",
                                                                user.is_active ? "text-emerald-600" : "text-gray-400"
                                                            )}>
                                                                {user.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </td> */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                            <button onClick={() => setViewDetailUser(user)} className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"><Eye size={16} /></button>
                                                            <PermissionGate permission={PERMISSIONS.USER_UPDATE}>
                                                                <button onClick={() => handleOpenDrawer(user)} className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Edit2 size={16} /></button>
                                                            </PermissionGate>
                                                            <PermissionGate permission={PERMISSIONS.USER_DELETE}>
                                                                <button onClick={() => handleDeleteClick(user)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                                                            </PermissionGate>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </AnimatePresence >

                {filteredUsers.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                        <UserX size={48} className="mb-4 text-gray-200 dark:text-gray-700" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase">User Not Found</h3>
                        <p className="text-sm text-gray-500 max-w-[250px] mt-2">No users match your active search filter.</p>
                    </div>
                )}
            </div >

            {/* Pagination Controls */}
            {pagination && pagination.total > 0 && (
                <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
                        Displaying <span className="text-primary-600 font-bold">{filteredUsers.length}</span> of <span className="text-primary-600 font-bold">{pagination.total}</span> Users
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar w-full sm:w-auto justify-center sm:justify-end">
                        {pagination.links?.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePageChange(link.url)}
                                disabled={!link.url || link.active}
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
        </div >
    );

    return (
        <div className="relative">
            {viewDetailUser ? renderDetailView() : (isDrawerOpen ? renderFullPageForm() : renderMainView())}

            {/* Delete Confirmation Modal */}

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
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete User</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Are you sure you want to delete this user?
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        User: <span className="font-bold text-primary-600 dark:text-primary-400">{deleteConfirm.name}</span>
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

export default UsersPage;

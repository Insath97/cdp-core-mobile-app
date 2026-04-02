import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLES } from '../../lib/navigation';
import { Bell, Search, Menu, ChevronDown, LogOut, User, Settings, Sun, Moon, Plus, FilePlus, UserPlus, Wallet, Users, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
    const { user, switchRole, logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [profileOpen, setProfileOpen] = React.useState(false);
    const [quickCreateOpen, setQuickCreateOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        // Passing username in the body as requested by API logic
        logout({ username: user?.username || user?.email, password: '' });
        navigate('/login');
    };

    return (
        <header className={cn(
            "h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 right-0 z-50 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 shadow-sm shadow-gray-100/50 dark:shadow-none",
            isSidebarOpen ? "md:left-[260px] left-0" : "md:left-20 left-0"
        )}>
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg md:hidden"
                >
                    <Menu size={20} className={cn("transition-transform", isSidebarOpen && "rotate-90")} />
                </button>

                <div className="relative group">
                    <button
                        onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                        className={cn(
                            "flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 group",
                            quickCreateOpen
                                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                                : "bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40"
                        )}
                    >
                        <Plus size={16} className={cn("transition-transform duration-300", quickCreateOpen && "rotate-45")} />
                        <span className="hidden sm:inline">Quick Create</span>
                        <ChevronDown size={14} className={cn("transition-transform duration-200", quickCreateOpen && "rotate-180")} />
                    </button>

                    {quickCreateOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setQuickCreateOpen(false)}></div>
                            <div className="absolute left-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700/50 mb-1">Create New</p>

                                <button
                                    onClick={() => { navigate('/quotation/add'); setQuickCreateOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors uppercase tracking-wider text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                                        <FilePlus size={16} />
                                    </div>
                                    Quotation
                                </button>

                                <button
                                    onClick={() => { navigate('/customers/add'); setQuickCreateOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors uppercase tracking-wider text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                                        <UserPlus size={16} />
                                    </div>
                                    Investor
                                </button>

                                <button
                                    onClick={() => { navigate('/my-business'); setQuickCreateOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors uppercase tracking-wider text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                                        <Wallet size={16} />
                                    </div>
                                    Investment
                                </button>

                                <div className="h-px bg-gray-50 dark:bg-gray-700 my-1 mx-2"></div>

                                <button
                                    onClick={() => { navigate('/users'); setQuickCreateOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors uppercase tracking-wider text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                                        <Users size={16} />
                                    </div>
                                    System User
                                </button>

                                <button
                                    onClick={() => { navigate('/branches/create'); setQuickCreateOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors uppercase tracking-wider text-left"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 flex items-center justify-center">
                                        <Building2 size={16} />
                                    </div>
                                    Branch
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Role Switcher (For Demo) */}
                {/* <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">View Mode</span>
                    <select
                        className="text-[11px] border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/20 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        value={user?.user_type || user?.role || ''}
                        onChange={(e) => switchRole(e.target.value)}
                    >
                        {Object.values(ROLES).map(role => (
                            <option key={role} value={role}>{role.toUpperCase()}</option>
                        ))}
                    </select>
                </div> */}

                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden md:block"></div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="relative p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all overflow-hidden group"
                >
                    <div className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                        {isDarkMode ? (
                            <Moon size={20} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                        ) : (
                            <Sun size={20} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Notification Bell (Commented for Phase 1) */}
                {/* <button className="relative p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </button> */}

                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className={cn(
                            "flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl transition-all border",
                            profileOpen
                                ? "border-primary-200 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-800"
                                : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                        )}
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter mt-1">{user?.user_type || user?.role}</p>
                        </div>
                        <img
                            src={user?.profile_image || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                            alt={user?.name}
                            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 object-cover shadow-sm"
                        />
                        <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-200", profileOpen && "rotate-180")} />
                    </button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)}></div>
                            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700 sm:hidden">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name}</p>
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter mt-1">{user?.user_type || user?.role}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium text-left"
                                >
                                    <User size={18} className="text-gray-400" />
                                    Profile Settings
                                </button>
                                {/* <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium text-left">
                                    <Settings size={18} className="text-gray-400" />
                                    Preferences
                                </button> */}

                                {/* Mobile Role Switcher */}
                                {/* <div className="px-4 py-2 sm:hidden border-t border-gray-50 dark:border-gray-700 mt-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Switch View</p>
                                    <div className="grid grid-cols-1 gap-1">
                                        {Object.values(ROLES).map(role => (
                                            <button
                                                key={role}
                                                onClick={() => {
                                                    switchRole(role);
                                                    setProfileOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold uppercase tracking-wider transition-all",
                                                    user.role === role
                                                        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20"
                                                        : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                )}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div> */}

                                <div className="h-px bg-gray-50 dark:bg-gray-700 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-left"
                                >
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

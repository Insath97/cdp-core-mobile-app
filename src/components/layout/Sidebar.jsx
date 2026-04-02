import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLE_NAVIGATION } from '../../lib/navigation';
import { cn } from '../../lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    LayoutGrid,
    ChevronDown,
    LogOut,
    Sun,
    Moon,
    Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import logo from '../../assets/logo.jpg';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout, hasPermission, hasAnyPermission } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    // Get base navigation for role
    const baseNavigation = ROLE_NAVIGATION[user?.user_type || user?.role] || [];

    // Filter navigation based on permissions
    const navigation = baseNavigation.map(section => {
        const filteredItems = section.items.filter(item => {
            // If no permission defined, show it
            if (!item.permission) return true;

            // Handle array of permissions (hasAny)
            if (Array.isArray(item.permission)) {
                return hasAnyPermission(item.permission);
            }

            // Handle single permission
            return hasPermission(item.permission);
        }).map(item => {
            // Filter subItems if they exist
            if (item.subItems) {
                return {
                    ...item,
                    subItems: item.subItems.filter(sub => {
                        if (!sub.permission) return true;
                        return hasPermission(sub.permission);
                    })
                };
            }
            return item;
        });

        return {
            ...section,
            items: filteredItems
        };
    }).filter(section => section.items.length > 0); // Only show sections that have at least one visible item

    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleLogout = () => {
        // Passing username in the body as requested by API logic
        logout({ username: user?.username || user?.email, password: '' });
        navigate('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
                    isOpen ? "w-[260px] translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
                )}
            >
                {/* Logo Area */}
                <div className="h-28 flex items-center px-6 border-b border-gray-50 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm border border-gray-100",
                            isOpen ? "w-16 h-16" : "w-10 h-10"
                        )}>
                            <img src={logo} alt="CDP Logo" className="w-full h-full object-contain" />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">CDP</span>
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Core</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Sections */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                    {navigation.map((section) => (
                        <div key={section.group} className="space-y-2">
                            {isOpen && (
                                <h3 className="px-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                                    {section.group}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const hasSubItems = item.subItems && item.subItems.length > 0;
                                    const isMenuOpen = openMenus[item.name];

                                    return (
                                        <div key={item.name} className="space-y-0.5">
                                            <NavLink
                                                to={hasSubItems ? '#' : item.path}
                                                onClick={(e) => {
                                                    if (hasSubItems) {
                                                        e.preventDefault();
                                                        toggleMenu(item.name);
                                                    }
                                                }}
                                                className={({ isActive }) => cn(
                                                    "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative",
                                                    isActive && !hasSubItems
                                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                                                    !isOpen && "justify-center px-0 h-12 w-12 mx-auto"
                                                )}
                                            >
                                                <item.icon size={20} className={cn(
                                                    "shrink-0 transition-transform group-hover:scale-110",
                                                    !isOpen && "mx-auto"
                                                )} />

                                                {isOpen && (
                                                    <>
                                                        <span className="flex-1 truncate">{item.name}</span>
                                                        {hasSubItems && (
                                                            <ChevronDown
                                                                size={14}
                                                                className={cn(
                                                                    "text-gray-400 transition-transform duration-300",
                                                                    isMenuOpen && "rotate-180"
                                                                )}
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>

                                            {/* Sub Items */}
                                            <AnimatePresence>
                                                {isOpen && hasSubItems && isMenuOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/50 rounded-xl ml-2"
                                                    >
                                                        <div className="py-1 pl-3 border-l-2 border-gray-100 dark:border-gray-700 ml-4 my-1 space-y-0.5">
                                                            {item.subItems.map(sub => (
                                                                <NavLink
                                                                    key={sub.name}
                                                                    to={sub.path}
                                                                    className={({ isActive }) => cn(
                                                                        "block py-1.5 px-3 rounded-lg text-[13px] font-semibold transition-all truncate",
                                                                        isActive
                                                                            ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm border border-gray-100 dark:border-gray-600"
                                                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                                                    )}
                                                                >
                                                                    {sub.name}
                                                                </NavLink>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="p-3 space-y-3 border-t border-gray-50 dark:border-gray-800">
                    {/* User Card */}
                    {/* <div className={cn(
                        "bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl flex items-center transition-all border border-gray-100 dark:border-gray-700/50 shadow-sm",
                        !isOpen && "justify-center p-1.5"
                    )}>
                        <div className="relative shrink-0">
                            <img
                                src={user?.profile_image || user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm"
                            />
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>
                        {isOpen && (
                            <div className="ml-2.5 flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate tracking-tight">{user?.name}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate font-medium">{user?.email || 'dev@nexus.com'}</p>
                            </div>
                        )}
                        {isOpen && (
                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div> */}

                    {/* Theme Toggle (Moved to Header) */}
                    {/* <button
                        onClick={toggleDarkMode}
                        className={cn(
                            "w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold text-[13px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm",
                            !isOpen && "justify-center"
                        )}
                    >
                        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        {isOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button> */}

                    {/* Collapse Toggle (Desktop) */}
                    <button
                        onClick={toggleSidebar}
                        className="hidden md:flex w-full items-center justify-center py-1 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    >
                        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
// context/AuthContext.jsx
import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    login as loginThunk,
    logout as logoutThunk,
    getProfile as getProfileThunk,
    changePassword as changePasswordThunk,
    setUser
} from '../redux/slices/authSlice';
import { MOCK_USERS } from '../lib/mockData';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

    const login = useCallback(async (credentials) => {
        try {
            const result = await dispatch(loginThunk(credentials)).unwrap();

            // Show success toast with longer duration
            toast.success('Login successful! Welcome back.', {
                icon: '👋',
                duration: 4000, // Increased duration
                position: 'bottom-right',
                style: {
                    background: '#10b981',
                    color: '#fff',
                    fontWeight: '500',
                },
            });

            return result;
        } catch (error) {
            // Show error toast with longer duration
            toast.error(error || 'Invalid email or password. Please try again.', {
                icon: '❌',
                duration: 5000, // Increased duration for error messages
                position: 'bottom-right',
                style: {
                    background: '#ef4444',
                    color: '#fff',
                    fontWeight: '500',
                },
            });
            throw error;
        }
    }, [dispatch]);

    const logout = useCallback(async (credentials) => {
        try {
            await dispatch(logoutThunk(credentials)).unwrap();
            toast.success('Logged out successfully', {
                icon: '👋',
                duration: 3000,
                position: 'bottom-right',
            });
        } catch (error) {
            toast.error('Logout failed', {
                icon: '⚠️',
                duration: 3000,
                position: 'bottom-right',
            });
        }
    }, [dispatch]);

    const switchRole = useCallback((roleType) => {
        const newUser = MOCK_USERS.find(u => u.user_type === roleType) || MOCK_USERS[0];
        dispatch(setUser(newUser));
        toast.success(`Switched to ${roleType} role`, {
            icon: '🔄',
            duration: 2000,
            position: 'bottom-right',
        });
    }, [dispatch]);

    const getProfile = useCallback(async () => {
        try {
            return await dispatch(getProfileThunk()).unwrap();
        } catch (error) {
            toast.error(error || 'Failed to fetch profile', {
                duration: 3000,
                position: 'bottom-right',
            });
            throw error;
        }
    }, [dispatch]);

    const changePassword = useCallback(async (passwordData) => {
        try {
            return await dispatch(changePasswordThunk(passwordData)).unwrap();
        } catch (error) {
            // Error toast is handled by components for more specific messages, 
            // but we can provide a fallback here if needed.
            throw error;
        }
    }, [dispatch]);

    const switchUser = useCallback((userId) => {
        const newUser = MOCK_USERS.find(u => u.id === userId);
        if (newUser) {
            dispatch(setUser(newUser));
            toast.success(`Switched to user: ${newUser.name}`, {
                icon: '👤',
                duration: 2000,
                position: 'bottom-right',
            });
        }
    }, [dispatch]);

    /**
     * Helper to extract all permission names from user roles
     * @returns {string[]}
     */
    const getUserPermissions = useCallback(() => {
        if (!user || !user.roles) return [];

        // Flatten all permissions from all roles and get their names
        const allPerms = user.roles.reduce((acc, role) => {
            if (role.permissions && Array.isArray(role.permissions)) {
                const rolePerms = role.permissions.map(p => typeof p === 'string' ? p : p.name);
                return [...acc, ...rolePerms];
            }
            return acc;
        }, []);

        // Return unique permissions
        return [...new Set(allPerms)];
    }, [user]);

    /**
     * Check if user has a specific permission
     * @param {string} permissionName - The permission string to check
     * @returns {boolean}
     */
    const hasPermission = useCallback((permissionName) => {
        if (!user) return false;

        // If it's a super admin, they have all permissions
        // Checking both user_type and role name for robustness
        const isSuperAdmin = user.user_type === 'admin' ||
            user.roles?.some(r => r.name === 'Super Admin');

        if (isSuperAdmin) return true;

        const permissions = getUserPermissions();
        return permissions.includes(permissionName);
    }, [user, getUserPermissions]);

    /**
     * Check if user has any of the listed permissions
     * @param {string[]} permissionNames - Array of permission strings
     * @returns {boolean}
     */
    const hasAnyPermission = useCallback((permissionNames) => {
        if (!user) return false;

        const isSuperAdmin = user.user_type === 'admin' ||
            user.roles?.some(r => r.name === 'Super Admin');

        if (isSuperAdmin) return true;

        const permissions = getUserPermissions();
        return permissionNames.some(p => permissions.includes(p));
    }, [user, getUserPermissions]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoading,
            error,
            login,
            logout,
            getProfile,
            changePassword,
            switchRole,
            switchUser,
            hasPermission,
            hasAnyPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * 
 * @param {Object} props
 * @param {string|string[]} props.permission - A single permission string or an array of permission strings
 * @param {string} [props.mode='all'] - 'all' (must have all permissions) or 'any' (must have at least one)
 * @param {React.ReactNode} props.children - Content to render if authorized
 * @param {React.ReactNode} [props.fallback=null] - Content to render if not authorized
 */
const PermissionGate = ({
    permission,
    mode = 'any',
    children,
    fallback = null
}) => {
    const { hasPermission, hasAnyPermission } = useAuth();

    if (!permission) return <>{children}</>;

    const isAuthorized = Array.isArray(permission)
        ? (mode === 'any' ? hasAnyPermission(permission) : permission.every(p => hasPermission(p)))
        : hasPermission(permission);

    if (!isAuthorized) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default PermissionGate;

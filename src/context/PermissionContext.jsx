import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getPermissions as getPermissionsThunk,
    getAllPermissions as getAllPermissionsThunk,
    getPermissionById as getPermissionByIdThunk,
    updatePermission as updatePermissionThunk,
    createPermission as createPermissionThunk,
    deletePermission as deletePermissionThunk
} from '../redux/slices/permissionSlice';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { permissions, allPermissions, currentPermission, pagination, isLoading, error } = useSelector((state) => state.permission);

    const getPermissions = async (page = 1) => {
        return dispatch(getPermissionsThunk(page));
    };

    const getAllPermissions = async () => {
        return dispatch(getAllPermissionsThunk());
    };

    const getPermissionById = async (id) => {
        return dispatch(getPermissionByIdThunk(id));
    };

    const updatePermission = async (id, data) => {
        return dispatch(updatePermissionThunk({ id, data }));
    };

    const createPermission = async (data) => {
        return dispatch(createPermissionThunk(data));
    };

    const deletePermission = async (id) => {
        return dispatch(deletePermissionThunk(id));
    };

    return (
        <PermissionContext.Provider value={{
            permissions,
            allPermissions,
            currentPermission,
            pagination,
            isLoading,
            error,
            getPermissions,
            getAllPermissions,
            getPermissionById,
            updatePermission,
            createPermission,
            deletePermission,
        }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermission = () => useContext(PermissionContext);

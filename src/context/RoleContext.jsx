import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getRoles as getRolesThunk,
    createRole as createRoleThunk,
    updateRole as updateRoleThunk,
    deleteRole as deleteRoleThunk,
    getRoleById as getRoleByIdThunk
} from '../redux/slices/roleSlice';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { roles, currentRole, pagination, isLoading, error } = useSelector((state) => state.role);

    const getRoles = async (page = 1) => {
        return dispatch(getRolesThunk(page));
    };

    const createRole = async (data) => {
        return dispatch(createRoleThunk(data));
    };

    const updateRole = async (id, data) => {
        return dispatch(updateRoleThunk({ id, data }));
    };

    const deleteRole = async (id) => {
        return dispatch(deleteRoleThunk(id));
    };

    const getRoleById = async (id) => {
        return dispatch(getRoleByIdThunk(id));
    };

    return (
        <RoleContext.Provider value={{
            roles,
            currentRole,
            pagination,
            isLoading,
            error,
            getRoles,
            createRole,
            updateRole,
            deleteRole,
            getRoleById
        }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => useContext(RoleContext);

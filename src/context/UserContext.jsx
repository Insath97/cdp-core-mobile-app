import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getUsers as getUsersThunk,
    createUser as createUserThunk,
    updateUser as updateUserThunk,
    deleteUser as deleteUserThunk,
    getUserById as getUserByIdThunk,
    getAllUsers as getAllUsersThunk,
    toggleUserStatus as toggleUserStatusThunk
} from '../redux/slices/userSlice';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { users, allUsers, currentUser, pagination, isLoading, error } = useSelector((state) => state.user);

    const getUsers = useCallback((params = 1) => {
        return dispatch(getUsersThunk(params));
    }, [dispatch]);

    const createUser = useCallback((data) => {
        return dispatch(createUserThunk(data));
    }, [dispatch]);

    const updateUser = useCallback((id, data) => {
        return dispatch(updateUserThunk({ id, data }));
    }, [dispatch]);

    const deleteUser = useCallback((id) => {
        return dispatch(deleteUserThunk(id));
    }, [dispatch]);

    const getUserById = useCallback((id) => {
        return dispatch(getUserByIdThunk(id));
    }, [dispatch]);

    const getAllUsers = useCallback(() => {
        return dispatch(getAllUsersThunk());
    }, [dispatch]);

    const toggleUserStatus = useCallback((id) => {
        return dispatch(toggleUserStatusThunk(id));
    }, [dispatch]);

    return (
        <UserContext.Provider value={{
            users,
            currentUser,
            pagination,
            isLoading,
            error,
            getUsers,
            createUser,
            updateUser,
            deleteUser,
            getUserById,
            allUsers,
            getAllUsers,
            toggleUserStatus
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

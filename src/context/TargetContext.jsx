import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getTargets as getTargetsThunk,
    createTarget as createTargetThunk,
    updateTarget as updateTargetThunk,
    deleteTarget as deleteTargetThunk,
    getTargetById as getTargetByIdThunk,
    clearError,
    clearCurrentTarget
} from '../redux/slices/targetSlice';

const TargetContext = createContext();

export const TargetProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { targets, currentTarget, pagination, isLoading, error, validationErrors } = useSelector((state) => state.target);

    const getTargets = useCallback((page = 1) => {
        return dispatch(getTargetsThunk(page));
    }, [dispatch]);

    const createTarget = useCallback((data) => {
        return dispatch(createTargetThunk(data));
    }, [dispatch]);

    const updateTarget = useCallback((id, data) => {
        return dispatch(updateTargetThunk({ id, data }));
    }, [dispatch]);

    const deleteTarget = useCallback((id) => {
        return dispatch(deleteTargetThunk(id)).unwrap();
    }, [dispatch]);

    const getTargetById = useCallback((id) => {
        return dispatch(getTargetByIdThunk(id));
    }, [dispatch]);

    const resetError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const resetCurrentTarget = useCallback(() => {
        dispatch(clearCurrentTarget());
    }, [dispatch]);

    return (
        <TargetContext.Provider value={{
            targets,
            currentTarget,
            pagination,
            isLoading,
            error,
            validationErrors,
            getTargets,
            createTarget,
            updateTarget,
            deleteTarget,
            getTargetById,
            resetError,
            resetCurrentTarget
        }}>
            {children}
        </TargetContext.Provider>
    );
};

export const useTarget = () => {
    const context = useContext(TargetContext);
    if (!context) {
        throw new Error('useTarget must be used within a TargetProvider');
    }
    return context;
};
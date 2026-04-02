import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getBranches as getBranchesThunk,
    createBranch as createBranchThunk,
    updateBranch as updateBranchThunk,
    deleteBranch as deleteBranchThunk,
    getBranchById as getBranchByIdThunk
} from '../redux/slices/branchSlice';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { branches, currentBranch, pagination, isLoading, error } = useSelector((state) => state.branch);

    const getBranches = useCallback((page = 1) => {
        return dispatch(getBranchesThunk(page));
    }, [dispatch]);

    const createBranch = useCallback((data) => {
        return dispatch(createBranchThunk(data));
    }, [dispatch]);

    const updateBranch = useCallback((id, data) => {
        return dispatch(updateBranchThunk({ id, data }));
    }, [dispatch]);

    const deleteBranch = useCallback((id) => {
        return dispatch(deleteBranchThunk(id));
    }, [dispatch]);

    const getBranchById = useCallback((id) => {
        return dispatch(getBranchByIdThunk(id));
    }, [dispatch]);

    return (
        <BranchContext.Provider value={{
            branches,
            currentBranch,
            pagination,
            isLoading,
            error,
            getBranches,
            createBranch,
            updateBranch,
            deleteBranch,
            getBranchById
        }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => useContext(BranchContext);

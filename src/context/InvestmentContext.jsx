import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getInvestments as getInvestmentsThunk,
    createInvestment as createInvestmentThunk,
    updateInvestment as updateInvestmentThunk,
    deleteInvestment as deleteInvestmentThunk,
    getInvestmentById as getInvestmentByIdThunk,
    getBusinessEntries as getBusinessEntriesThunk,
    createBusinessEntry as createBusinessEntryThunk,
    getBusinessEntryById as getBusinessEntryByIdThunk,
    updateBusinessEntry as updateBusinessEntryThunk,
    approveBusinessEntry as approveBusinessEntryThunk
} from '../redux/slices/investmentSlice';

const InvestmentContext = createContext();

export const InvestmentProvider = ({ children }) => {
    const dispatch = useDispatch();
    const {
        investments,
        currentInvestment,
        businessEntries,
        currentBusinessEntry,
        pagination,
        businessPagination,
        isLoading,
        error
    } = useSelector((state) => state.investment);

    // Investment Product Functions
    const getInvestments = useCallback((page = 1) => {
        return dispatch(getInvestmentsThunk(page));
    }, [dispatch]);

    const createInvestment = useCallback((data) => {
        return dispatch(createInvestmentThunk(data));
    }, [dispatch]);

    const updateInvestment = useCallback((id, data) => {
        return dispatch(updateInvestmentThunk({ id, data }));
    }, [dispatch]);

    const deleteInvestment = useCallback((id) => {
        return dispatch(deleteInvestmentThunk(id));
    }, [dispatch]);

    const getInvestmentById = useCallback((id) => {
        return dispatch(getInvestmentByIdThunk(id));
    }, [dispatch]);

    // Business Entry Functions
    const getBusinessEntries = useCallback((page = 1) => {
        return dispatch(getBusinessEntriesThunk(page));
    }, [dispatch]);

    const createBusinessEntry = useCallback((data) => {
        return dispatch(createBusinessEntryThunk(data));
    }, [dispatch]);

    const getBusinessEntryById = useCallback((id) => {
        return dispatch(getBusinessEntryByIdThunk(id));
    }, [dispatch]);

    const updateBusinessEntry = useCallback((id, data) => {
        return dispatch(updateBusinessEntryThunk({ id, data }));
    }, [dispatch]);

    const approveBusinessEntry = useCallback((id) => {
        return dispatch(approveBusinessEntryThunk(id));
    }, [dispatch]);

    return (
        <InvestmentContext.Provider value={{
            // State
            investments,
            currentInvestment,
            businessEntries,
            currentBusinessEntry,
            pagination,
            businessPagination,
            isLoading,
            error,
            
            // Investment Product Functions
            getInvestments,
            createInvestment,
            updateInvestment,
            deleteInvestment,
            getInvestmentById,
            
            // Business Entry Functions
            getBusinessEntries,
            createBusinessEntry,
            getBusinessEntryById,
            updateBusinessEntry,
            approveBusinessEntry
        }}>
            {children}
        </InvestmentContext.Provider>
    );
};

export const useInvestment = () => {
    const context = useContext(InvestmentContext);
    if (!context) {
        throw new Error('useInvestment must be used within an InvestmentProvider');
    }
    return context;
};
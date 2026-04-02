import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getQuotations as getQuotationsThunk,
    createQuotation as createQuotationThunk,
    updateQuotation as updateQuotationThunk,
    deleteQuotation as deleteQuotationThunk,
    getQuotationById as getQuotationByIdThunk
} from '../redux/slices/quotationSlice';

const QuotationContext = createContext();

export const QuotationProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { quotations, currentQuotation, pagination, isLoading, error } = useSelector((state) => state.quotation);

    const getQuotations = useCallback(async (page = 1) => {
        return dispatch(getQuotationsThunk(page)).unwrap();
    }, [dispatch]);

    const createQuotation = async (data) => {
        return dispatch(createQuotationThunk(data)).unwrap();
    };

    const updateQuotation = async (id, data) => {
        return dispatch(updateQuotationThunk({ id, data })).unwrap();
    };

    const deleteQuotation = async (id) => {
        return dispatch(deleteQuotationThunk(id)).unwrap();
    };

    const getQuotationById = async (id) => {
        return dispatch(getQuotationByIdThunk(id)).unwrap();
    };

    return (
        <QuotationContext.Provider value={{
            quotations,
            currentQuotation,
            pagination,
            isLoading,
            error,
            getQuotations,
            createQuotation,
            updateQuotation,
            deleteQuotation,
            getQuotationById
        }}>
            {children}
        </QuotationContext.Provider>
    );
};

export const useQuotations = () => {
    const context = useContext(QuotationContext);
    if (!context) {
        throw new Error('useQuotations must be used within a QuotationProvider');
    }
    return context;
};

export const useQuotation = useQuotations;

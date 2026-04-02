import React, { createContext, useContext } from 'react';
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

    const getQuotations = async (page = 1) => {
        return dispatch(getQuotationsThunk(page));
    };

    const createQuotation = async (data) => {
        return dispatch(createQuotationThunk(data));
    };

    const updateQuotation = async (id, data) => {
        return dispatch(updateQuotationThunk({ id, data }));
    };

    const deleteQuotation = async (id) => {
        return dispatch(deleteQuotationThunk(id));
    };

    const getQuotationById = async (id) => {
        return dispatch(getQuotationByIdThunk(id));
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

export const useQuotation = () => useContext(QuotationContext);

export const QuotationProvider1 = QuotationProvider;


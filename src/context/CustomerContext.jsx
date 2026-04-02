import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getCustomers as getCustomersThunk,
    createCustomer as createCustomerThunk,
    updateCustomer as updateCustomerThunk,
    deleteCustomer as deleteCustomerThunk,
    getCustomerById as getCustomerByIdThunk
} from '../redux/slices/customerSlice';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { customers, currentCustomer, pagination, isLoading, error } = useSelector((state) => state.customer);

    const getCustomers = useCallback((page = 1) => {
        return dispatch(getCustomersThunk(page));
    }, [dispatch]);

    const createCustomer = useCallback((data) => {
        return dispatch(createCustomerThunk(data)).unwrap();
    }, [dispatch]);

    const updateCustomer = useCallback((id, data) => {
        console.log('updateCustomer called with id:', id, 'data:', data); // Debug log
        return dispatch(updateCustomerThunk({ id, data })).unwrap();
    }, [dispatch]);

    const deleteCustomer = useCallback((id) => {
        return dispatch(deleteCustomerThunk(id));
    }, [dispatch]);

    const getCustomerById = useCallback((id) => {
        return dispatch(getCustomerByIdThunk(id));
    }, [dispatch]);

    return (
        <CustomerContext.Provider value={{
            customers,
            currentCustomer,
            pagination,
            isLoading,
            error,
            getCustomers,
            createCustomer,
            updateCustomer,
            deleteCustomer,
            getCustomerById
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => useContext(CustomerContext);

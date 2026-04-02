import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboardData as getDashboardDataThunk, clearDashboardError as clearDashboardErrorAction } from '../redux/slices/dashboardSlice';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { dashboardData, isLoading, error } = useSelector((state) => state.dashboard);

    const getDashboardData = useCallback(async (periodKey = null) => {
        return dispatch(getDashboardDataThunk(periodKey));
    }, [dispatch]);

    const clearDashboardError = useCallback(() => {
        dispatch(clearDashboardErrorAction());
    }, [dispatch]);

    return (
        <DashboardContext.Provider value={{
            dashboardData,
            isLoading,
            error,
            getDashboardData,
            clearDashboardError
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);

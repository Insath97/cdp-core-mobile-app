import React, { createContext, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getHierarchyReport as getHierarchyReportThunk,
    getHierarchyById as getHierarchyByIdThunk,
    getInvestorMaturityReport as getInvestorMaturityReportThunk,
    getInvestmentMaturityReport as getInvestmentMaturityReportThunk,
    getAgentPerformanceReport as getAgentPerformanceReportThunk,
    resetReport as resetReportAction,
    clearError as clearErrorAction
} from '../redux/slices/reportSlice';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
    const dispatch = useDispatch();
    const {
        hierarchyReportData,
        hierarchyPagination,
        investorMaturityData,
        investorMaturityPagination,
        investmentMaturityData,
        investmentMaturityPagination,
        currentHierarchy,
        agentPerformanceData,
        isLoading,
        error
    } = useSelector((state) => state.report);

    const getHierarchyReport = useCallback((params) => {
        return dispatch(getHierarchyReportThunk(params));
    }, [dispatch]);

    const getHierarchyById = useCallback((id) => {
        return dispatch(getHierarchyByIdThunk(id));
    }, [dispatch]);

    const getInvestorMaturityReport = useCallback((params) => {
        return dispatch(getInvestorMaturityReportThunk(params));
    }, [dispatch]);

    const getInvestmentMaturityReport = useCallback((params) => {
        return dispatch(getInvestmentMaturityReportThunk(params));
    }, [dispatch]);

    const getAgentPerformanceReport = useCallback((params) => {
        return dispatch(getAgentPerformanceReportThunk(params));
    }, [dispatch]);

    const resetReport = useCallback(() => {
        dispatch(resetReportAction());
    }, [dispatch]);

    const clearError = useCallback(() => {
        dispatch(clearErrorAction());
    }, [dispatch]);

    return (
        <ReportContext.Provider value={{
            hierarchyReportData,
            hierarchyPagination,
            investorMaturityData,
            investorMaturityPagination,
            investmentMaturityData,
            investmentMaturityPagination,
            currentHierarchy,
            agentPerformanceData,
            isLoading,
            error,
            getHierarchyReport,
            getHierarchyById,
            getInvestorMaturityReport,
            getInvestmentMaturityReport,
            getAgentPerformanceReport,
            resetReport,
            clearError
        }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReport = () => useContext(ReportContext);

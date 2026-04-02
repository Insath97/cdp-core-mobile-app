import React, { createContext, useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getHierarchies as getHierarchiesThunk,
    createHierarchy as createHierarchyThunk,
    updateHierarchy as updateHierarchyThunk,
    deleteHierarchy as deleteHierarchyThunk,
    getHierarchyById as getHierarchyByIdThunk
} from '../redux/slices/hierarchySlice';
import {
    getLevels as getLevelsThunk
} from '../redux/slices/levelSlice';

const HierarchyContext = createContext();

export const HierarchyProvider = ({ children }) => {
    const dispatch = useDispatch();

    // Get hierarchy state
    const hierarchyState = useSelector((state) => state.hierarchy || {});
    const {
        targets = [],
        commissions = [],
        total_commission = 0,
        currentHierarchy = null,
        isLoading: hierarchyLoading = false,
        error: hierarchyError = null
    } = hierarchyState;

    // Get levels state
    const levelState = useSelector((state) => state.level || {});
    const {
        levels = [],
        isLoading: levelsLoading = false,
        error: levelsError = null
    } = levelState;

    // Get auth state to prevent infinite 401 loops on login page
    const { isAuthenticated } = useSelector((state) => state.auth || {});

    // Fetch levels on mount
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getLevelsThunk());
        }
    }, [dispatch, isAuthenticated]);

    const getHierarchies = async () => {
        return dispatch(getHierarchiesThunk());
    };

    const createHierarchy = async (data) => {
        return dispatch(createHierarchyThunk(data));
    };

    const updateHierarchy = async (id, data) => {
        return dispatch(updateHierarchyThunk({ id, data }));
    };

    const deleteHierarchy = async (id) => {
        return dispatch(deleteHierarchyThunk(id));
    };

    const getHierarchyById = async (id) => {
        return dispatch(getHierarchyByIdThunk(id));
    };

    // Create a map of levels for easy lookup
    const levelMap = React.useMemo(() => {
        const map = new Map();
        levels.forEach(level => {
            map.set(level.tire_level, level);
        });
        return map;
    }, [levels]);

    // Sort levels by tire_level
    const sortedLevels = React.useMemo(() => {
        return [...levels].sort((a, b) => a.tire_level - b.tire_level);
    }, [levels]);

    return (
        <HierarchyContext.Provider value={{
            // Hierarchy data
            targets,
            commissions,
            total_commission,
            currentHierarchy,
            isLoading: hierarchyLoading || levelsLoading,
            error: hierarchyError || levelsError,
            getHierarchies,
            createHierarchy,
            updateHierarchy,
            deleteHierarchy,
            getHierarchyById,

            // Level data
            levels,
            levelMap,
            sortedLevels
        }}>
            {children}
        </HierarchyContext.Provider>
    );
};

export const useHierarchy = () => {
    const context = useContext(HierarchyContext);
    if (!context) {
        throw new Error('useHierarchy must be used within a HierarchyProvider');
    }
    return context;
};
import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getRegions as getRegionsThunk,
    createRegion as createRegionThunk,
    updateRegion as updateRegionThunk,
    deleteRegion as deleteRegionThunk,
    getRegionById as getRegionByIdThunk
} from '../redux/slices/regionSlice';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { regions, currentRegion, pagination, isLoading, error } = useSelector((state) => state.region);

    const getRegions = React.useCallback(async (page = 1) => {
        return dispatch(getRegionsThunk(page));
    }, [dispatch]);

    const createRegion = React.useCallback(async (data) => {
        return dispatch(createRegionThunk(data));
    }, [dispatch]);

    const updateRegion = React.useCallback(async (id, data) => {
        return dispatch(updateRegionThunk({ id, data }));
    }, [dispatch]);

    const deleteRegion = React.useCallback(async (id) => {
        return dispatch(deleteRegionThunk(id));
    }, [dispatch]);

    const getRegionById = React.useCallback(async (id) => {
        return dispatch(getRegionByIdThunk(id));
    }, [dispatch]);


    return (
        <RegionContext.Provider value={{
            regions,
            currentRegion,
            pagination,
            isLoading,
            error,
            getRegions,
            createRegion,
            updateRegion,
            deleteRegion,
            getRegionById
        }}>
            {children}
        </RegionContext.Provider>
    );
};

export const useRegion = () => useContext(RegionContext);

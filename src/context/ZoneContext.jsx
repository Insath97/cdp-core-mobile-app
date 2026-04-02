import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getZones as getZonesThunk,
    createZone as createZoneThunk,
    updateZone as updateZoneThunk,
    deleteZone as deleteZoneThunk,
    getZoneById as getZoneByIdThunk
} from '../redux/slices/zoneSlice';

const ZoneContext = createContext();

export const ZoneProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { zones, currentZone, pagination, isLoading, error } = useSelector((state) => state.zone);

    const getZones = React.useCallback(async (page = 1) => {
        return dispatch(getZonesThunk(page));
    }, [dispatch]);

    const createZone = React.useCallback(async (data) => {
        return dispatch(createZoneThunk(data));
    }, [dispatch]);

    const updateZone = React.useCallback(async (id, data) => {
        return dispatch(updateZoneThunk({ id, data }));
    }, [dispatch]);

    const deleteZone = React.useCallback(async (id) => {
        return dispatch(deleteZoneThunk(id));
    }, [dispatch]);

    const getZoneById = React.useCallback(async (id) => {
        return dispatch(getZoneByIdThunk(id));
    }, [dispatch]);


    return (
        <ZoneContext.Provider value={{
            zones,
            currentZone,
            pagination,
            isLoading,
            error,
            getZones,
            createZone,
            updateZone,
            deleteZone,
            getZoneById
        }}>
            {children}
        </ZoneContext.Provider>
    );
};

export const useZone = () => useContext(ZoneContext);

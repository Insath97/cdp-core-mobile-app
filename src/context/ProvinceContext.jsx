import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    getProvinces as getProvincesThunk,
    createProvince as createProvinceThunk,
    updateProvince as updateProvinceThunk,
    deleteProvince as deleteProvinceThunk,
    getProvinceById as getProvinceByIdThunk
} from '../redux/slices/provinceSlice';

const ProvinceContext = createContext();

export const ProvinceProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { provinces, currentProvince, pagination, isLoading, error } = useSelector((state) => state.province);

    const getProvinces = React.useCallback(async (page = 1) => {
        return dispatch(getProvincesThunk(page));
    }, [dispatch]);

    const createProvince = React.useCallback(async (data) => {
        return dispatch(createProvinceThunk(data));
    }, [dispatch]);

    const updateProvince = React.useCallback(async (id, data) => {
        return dispatch(updateProvinceThunk({ id, data }));
    }, [dispatch]);

    const deleteProvince = React.useCallback(async (id) => {
        return dispatch(deleteProvinceThunk(id));
    }, [dispatch]);

    const getProvinceById = React.useCallback(async (id) => {
        return dispatch(getProvinceByIdThunk(id));
    }, [dispatch]);


    return (
        <ProvinceContext.Provider value={{
            provinces,
            currentProvince,
            pagination,
            isLoading,
            error,
            getProvinces,
            createProvince,
            updateProvince,
            deleteProvince,
            getProvinceById
        }}>
            {children}
        </ProvinceContext.Provider>
    );
};

export const useProvince = () => useContext(ProvinceContext);

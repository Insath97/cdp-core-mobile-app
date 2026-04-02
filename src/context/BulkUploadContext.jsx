import React, { createContext, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    uploadCsvFile as uploadCsvFileThunk,
    getList as getListThunk,
    resetBulkUpload as resetBulkUploadAction,
} from '../redux/slices/bulkUploadSlice';

const BulkUploadContext = createContext();

export const BulkUploadProvider = ({ children }) => {
    const dispatch = useDispatch();
    const { tableList, tableListLoading, isLoading, result, error } = useSelector((state) => state.bulkUpload);

    const getList = useCallback(() => {
        return dispatch(getListThunk());
    }, [dispatch]);

    const uploadCsvFile = useCallback((tableId, file) => {
        return dispatch(uploadCsvFileThunk({ tableId, file }));
    }, [dispatch]);

    const resetBulkUpload = useCallback(() => {
        dispatch(resetBulkUploadAction());
    }, [dispatch]);

    return (
        <BulkUploadContext.Provider value={{
            tableList,
            tableListLoading,
            isLoading,
            result,
            error,
            getList,
            uploadCsvFile,
            resetBulkUpload,
        }}>
            {children}
        </BulkUploadContext.Provider>
    );
};

export const useBulkUpload = () => useContext(BulkUploadContext);

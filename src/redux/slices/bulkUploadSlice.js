import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getList = createAsyncThunk(
    'bulkUpload/getList',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/imports/tables/list`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch list');
        }
    }
);

export const uploadCsvFile = createAsyncThunk(
    'bulkUpload/uploadCsvFile',
    async ({ tableId, file }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post(`/imports/${tableId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = response.data;
            return {
                inserted: data.inserted ?? data.created ?? data.success_count ?? null,
                failed: data.failed ?? data.error_count ?? 0,
                errors: data.errors ?? data.failed_rows ?? [],
                message: data.message ?? 'Upload completed successfully.',
            };
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Upload failed.';
            const errors = error.response?.data?.errors ?? [];
            return rejectWithValue({ message: msg, errors });
        }
    }
);

// ─── Initial State ─────────────────────────────────────────────────────────────
const initialState = {
    tableList: [],
    tableListLoading: false,
    isLoading: false,
    result: null,   // { inserted, failed, errors[], message }
    error: null,    // { message, errors[] }
};

// ─── Slice ─────────────────────────────────────────────────────────────────────
const bulkUploadSlice = createSlice({
    name: 'bulkUpload',
    initialState,
    reducers: {
        resetBulkUpload: (state) => {
            state.isLoading = false;
            state.result = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getList.pending, (state) => {
                state.tableListLoading = true;
            })
            .addCase(getList.fulfilled, (state, action) => {
                state.tableListLoading = false;
                state.tableList = action.payload || [];
            })
            .addCase(getList.rejected, (state) => {
                state.tableListLoading = false;
            })
            .addCase(uploadCsvFile.pending, (state) => {
                state.isLoading = true;
                state.result = null;
                state.error = null;
            })
            .addCase(uploadCsvFile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.result = action.payload;
                state.error = null;
            })
            .addCase(uploadCsvFile.rejected, (state, action) => {
                state.isLoading = false;
                state.result = null;
                state.error = action.payload;
            });
    },
});

export const { resetBulkUpload } = bulkUploadSlice.actions;
export default bulkUploadSlice.reducer;

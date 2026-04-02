import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getProvinces = createAsyncThunk(
    'province/getProvinces',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/provinces?page=${page}`);
            // axiosInstance already has baseURL, so /countries?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch countries');
        }
    }
);

export const updateProvince = createAsyncThunk(
    'province/updateProvince',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/provinces/${id}`, data);
            return response.data; // Expecting the updated province object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update province');
        }
    }
);

export const getProvinceById = createAsyncThunk(
    'province/getProvinceById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/provinces/${id}`);
            return response.data; // Expecting the province object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch province');
        }
    }
);

export const createProvince = createAsyncThunk(
    'province/createProvince',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/provinces', data);
            return response.data; // Expecting the created province object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create province');
        }
    }
);

export const deleteProvince = createAsyncThunk(
    'province/deleteProvince',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/provinces/${id}`);
            return response.data; // Expecting the province object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete province');
        }
    }
);

const initialState = {
    provinces: [],
    currentProvince: null, // For storing a single province fetched by ID
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
        links: []
    },
    isLoading: false,
    error: null,
};

const provinceSlice = createSlice({
    name: 'province',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProvinces.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProvinces.fulfilled, (state, action) => {
                state.isLoading = false;
                state.provinces = action.payload.data; // The array of provinces
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getProvinces.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.provinces = [];
            })
            .addCase(updateProvince.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProvince.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated province in the state if returned
                if (action.payload.data) {
                    const idx = state.provinces.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.provinces[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateProvince.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createProvince.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createProvince.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new province to the state if returned
                if (action.payload.data) {
                    state.provinces.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createProvince.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getProvinceById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProvinceById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentProvince = action.payload.data || action.payload;
            })
            .addCase(getProvinceById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentProvince = null;
            })
            .addCase(deleteProvince.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProvince.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted province from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.provinces = state.provinces.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteProvince.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = provinceSlice.actions;
export default provinceSlice.reducer;

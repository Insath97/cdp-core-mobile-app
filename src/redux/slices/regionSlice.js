import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getRegions = createAsyncThunk(
    'region/getRegions',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/regions?page=${page}`);
            // axiosInstance already has baseURL, so /regions?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch regions');
        }
    }
);

export const updateRegion = createAsyncThunk(
    'region/updateRegion',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/regions/${id}`, data);
            return response.data; // Expecting the updated region object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update region');
        }
    }
);

export const getRegionById = createAsyncThunk(
    'region/getRegionById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/regions/${id}`);
            return response.data; // Expecting the region object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch region');
        }
    }
);

export const createRegion = createAsyncThunk(
    'region/createRegion',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/regions', data);
            return response.data; // Expecting the created region object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create region');
        }
    }
);

export const deleteRegion = createAsyncThunk(
    'region/deleteRegion',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/regions/${id}`);
            return response.data; // Expecting the region object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete region');
        }
    }
);

const initialState = {
    regions: [],
    currentRegion: null, // For storing a single region fetched by ID
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

const regionSlice = createSlice({
    name: 'region',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRegions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRegions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.regions = action.payload.data; // The array of regions
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getRegions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.regions = [];
            })
            .addCase(updateRegion.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRegion.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated region in the state if returned
                if (action.payload.data) {
                    const idx = state.regions.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.regions[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateRegion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createRegion.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createRegion.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new region to the state if returned
                if (action.payload.data) {
                    state.regions.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createRegion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getRegionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRegionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentRegion = action.payload.data || action.payload;
            })
            .addCase(getRegionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentRegion = null;
            })
            .addCase(deleteRegion.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteRegion.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted region from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.regions = state.regions.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteRegion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = regionSlice.actions;
export default regionSlice.reducer;

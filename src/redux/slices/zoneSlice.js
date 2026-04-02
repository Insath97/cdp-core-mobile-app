import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getZones = createAsyncThunk(
    'zone/getZones',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/zones?page=${page}`);
            // axiosInstance already has baseURL, so /zones?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch zones');
        }
    }
);

export const updateZone = createAsyncThunk(
    'zone/updateZone',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/zones/${id}`, data);
            return response.data; // Expecting the updated zone object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update zone');
        }
    }
);

export const getZoneById = createAsyncThunk(
    'zone/getZoneById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/zones/${id}`);
            return response.data; // Expecting the zone object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch zone');
        }
    }
);

export const createZone = createAsyncThunk(
    'zone/createZone',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/zones', data);
            return response.data; // Expecting the created zone object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create zone');
        }
    }
);

export const deleteZone = createAsyncThunk(
    'zone/deleteZone',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/zones/${id}`);
            return response.data; // Expecting the zone object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete zone');
        }
    }
);

const initialState = {
    zones: [],
    currentZone: null, // For storing a single zone fetched by ID
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

const zoneSlice = createSlice({
    name: 'zone',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getZones.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getZones.fulfilled, (state, action) => {
                state.isLoading = false;
                state.zones = action.payload.data; // The array of zones
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getZones.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.zones = [];
            })
            .addCase(updateZone.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateZone.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated zone in the state if returned
                if (action.payload.data) {
                    const idx = state.zones.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.zones[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateZone.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createZone.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createZone.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new  zones to the state if returned
                if (action.payload.data) {
                    state.zones.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createZone.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getZoneById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getZoneById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentZone = action.payload.data || action.payload;
            })
            .addCase(getZoneById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentZone = null;
            })
            .addCase(deleteZone.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteZone.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted zones from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.zones = state.zones.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteZone.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = zoneSlice.actions;
export default zoneSlice.reducer;

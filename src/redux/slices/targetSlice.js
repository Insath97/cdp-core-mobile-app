import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getTargets = createAsyncThunk(
    'target/getTargets',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/targets?page=${page}`);
            // The API returns data in response.data.data structure
            return response.data; // Return the whole response to access data and pagination
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch targets');
        }
    }
);

// In your targetSlice.js
export const createTarget = createAsyncThunk(
    'target/createTarget',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/targets', data);
            return response.data; // Returns { status, message, data }
        } catch (error) {
            // Handle validation errors with the new format
            if (error.response?.status === 422) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ 
                message: error.response?.data?.message || 'Failed to create target' 
            });
        }
    }
);

export const updateTarget = createAsyncThunk(
    'target/updateTarget',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/targets/${id}`, data);
            return response.data;
        } catch (error) {
            // Handle validation errors with the new format
            if (error.response?.status === 422) {
                return rejectWithValue(error.response.data);
            }
            return rejectWithValue({ 
                message: error.response?.data?.message || 'Failed to update target' 
            });
        }
    }
);

export const getTargetById = createAsyncThunk(
    'target/getTargetById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/targets/${id}`);
            return response.data; // Returns { status, message, data }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch target');
        }
    }
);

export const deleteTarget = createAsyncThunk(
    'target/deleteTarget',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/targets/${id}`);
            return response.data; // Returns { status, message, data }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete target');
        }
    }
);

const initialState = {
    targets: [],
    currentTarget: null,
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
        links: []
    },
    isLoading: false,
    error: null,
    validationErrors: null, // For storing validation errors from create/update
};

const targetSlice = createSlice({
    name: 'target',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.validationErrors = null;
        },
        clearCurrentTarget: (state) => {
            state.currentTarget = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Targets
            .addCase(getTargets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTargets.fulfilled, (state, action) => {
                state.isLoading = false;
                // Access the nested data structure
                const responseData = action.payload.data;
                state.targets = responseData.data; // The array of targets
                state.pagination = {
                    currentPage: responseData.current_page,
                    lastPage: responseData.last_page,
                    total: responseData.total,
                    perPage: responseData.per_page,
                    links: responseData.links || []
                };
            })
            .addCase(getTargets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.targets = [];
            })

            // Get Target By Id
            .addCase(getTargetById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTargetById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentTarget = action.payload.data; // The target object is in data property
            })
            .addCase(getTargetById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentTarget = null;
            })

            // Create Target
            .addCase(createTarget.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.validationErrors = null;
            })
            .addCase(createTarget.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new target to the state if returned
                if (action.payload.data) {
                    state.targets.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createTarget.rejected, (state, action) => {
                state.isLoading = false;
                // Check if it's validation errors (422 response)
                if (action.payload && typeof action.payload === 'object') {
                    state.validationErrors = action.payload;
                } else {
                    state.error = action.payload;
                }
            })

            // Update Target
            .addCase(updateTarget.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.validationErrors = null;
            })
            .addCase(updateTarget.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated target in the state if returned
                if (action.payload.data) {
                    const idx = state.targets.findIndex(t => t.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.targets[idx] = action.payload.data;
                    }
                    // Also update currentTarget if it's the same
                    if (state.currentTarget?.id === action.payload.data.id) {
                        state.currentTarget = action.payload.data;
                    }
                }
            })
            .addCase(updateTarget.rejected, (state, action) => {
                state.isLoading = false;
                // Check if it's validation errors (422 response)
                if (action.payload && typeof action.payload === 'object') {
                    state.validationErrors = action.payload;
                } else {
                    state.error = action.payload;
                }
            })

            // Delete Target
            .addCase(deleteTarget.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteTarget.fulfilled, (state, action) => {
                state.isLoading = false;
                const deletedId = action.meta.arg;
                state.targets = state.targets.filter(t => t.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
                // Clear currentTarget if it was deleted
                if (state.currentTarget?.id === deletedId) {
                    state.currentTarget = null;
                }
            })
            .addCase(deleteTarget.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearCurrentTarget } = targetSlice.actions;
export default targetSlice.reducer;
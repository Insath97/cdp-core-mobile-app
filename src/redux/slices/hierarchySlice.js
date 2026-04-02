import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getHierarchies = createAsyncThunk(
    'hierarchy/getHierarchies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/target-progress`);
            return response.data; // Return the full response
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch target-progress');
        }
    }
);

export const updateHierarchy = createAsyncThunk(
    'hierarchy/updateHierarchy',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/target-progress/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update target-progress');
        }
    }
);

export const getHierarchyById = createAsyncThunk(
    'hierarchy/getHierarchyById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/target-progress/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch target-progress');
        }
    }
);

export const createHierarchy = createAsyncThunk(
    'hierarchy/createHierarchy',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/target-progress', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create target-progress');
        }
    }
);

export const deleteHierarchy = createAsyncThunk(
    'hierarchy/deleteHierarchy',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/target-progress/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete target-progress');
        }
    }
);

const initialState = {
    targets: [],
    commissions: [],
    total_commission: 0,
    currentHierarchy: null,
    isLoading: false,
    error: null,
};

const hierarchySlice = createSlice({
    name: 'hierarchy',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Hierarchies
            .addCase(getHierarchies.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getHierarchies.fulfilled, (state, action) => {
                state.isLoading = false;
                // Store the data from the response
                if (action.payload?.data) {
                    state.targets = action.payload.data.targets || [];
                    state.commissions = action.payload.data.commissions || [];
                    state.total_commission = action.payload.data.total_commission || 0;
                }
            })
            .addCase(getHierarchies.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.targets = [];
                state.commissions = [];
                state.total_commission = 0;
            })

            // Update Hierarchy
            .addCase(updateHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                // Handle update logic if needed
                console.log('Update successful:', action.payload);
            })
            .addCase(updateHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Create Hierarchy
            .addCase(createHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                console.log('Create successful:', action.payload);
            })
            .addCase(createHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Get Hierarchy By ID
            .addCase(getHierarchyById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getHierarchyById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentHierarchy = action.payload.data || action.payload;
            })
            .addCase(getHierarchyById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentHierarchy = null;
            })

            // Delete Hierarchy
            .addCase(deleteHierarchy.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteHierarchy.fulfilled, (state, action) => {
                state.isLoading = false;
                console.log('Delete successful:', action.payload);
            })
            .addCase(deleteHierarchy.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = hierarchySlice.actions;
export default hierarchySlice.reducer;
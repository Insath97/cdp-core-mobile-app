import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getBranches = createAsyncThunk(
    'branch/getBranches',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/branches?page=${page}`);
            // axiosInstance already has baseURL, so /branches?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches');
        }
    }
);

export const updateBranch = createAsyncThunk(
    'branch/updateBranch',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/branches/${id}`, data);
            return response.data; // Expecting the updated branch object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update branch');
        }
    }
);

export const getBranchById = createAsyncThunk(
    'branch/getBranchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/branches/${id}`);
            return response.data; // Expecting the branch object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch branch');
        }
    }
);

export const createBranch = createAsyncThunk(
    'branch/createBranch',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/branches', data);
            return response.data; // Expecting the created branch object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create branch');
        }
    }
);

export const deleteBranch = createAsyncThunk(
    'branch/deleteBranch',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/branches/${id}`);
            return response.data; // Expecting the deleted branch object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete branch');
        }
    }
);

const initialState = {
    branches: [],
    currentBranch: null, // For storing a single branch fetched by ID
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

const branchSlice = createSlice({
    name: 'branch',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getBranches.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBranches.fulfilled, (state, action) => {
                state.isLoading = false;
                state.branches = action.payload.data; // The array of branches
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getBranches.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.branches = [];
            })
            .addCase(updateBranch.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateBranch.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated branch in the state if returned
                if (action.payload.data) {
                    const idx = state.branches.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.branches[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateBranch.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createBranch.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBranch.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new branch to the state if returned
                if (action.payload.data) {
                    state.branches.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createBranch.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getBranchById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBranchById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentBranch = action.payload.data || action.payload;
            })
            .addCase(getBranchById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentBranch = null;
            })
            .addCase(deleteBranch.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteBranch.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted branch from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.branches = state.branches.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteBranch.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = branchSlice.actions;
export default branchSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getRoles = createAsyncThunk(
    'role/getRoles',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/roles?page=${page}`);
            // axiosInstance already has baseURL, so /roles?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
        }
    }
);

export const updateRole = createAsyncThunk(
    'role/updateRole',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/roles/${id}`, data);
            return response.data; // Expecting the updated role object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update role');
        }
    }
);

export const getRoleById = createAsyncThunk(
    'role/getRoleById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/roles/${id}`);
            return response.data; // Expecting the role object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch role');
        }
    }
);

export const createRole = createAsyncThunk(
    'role/createRole',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/roles', data);
            return response.data; // Expecting the created role object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create role');
        }
    }
);

export const deleteRole = createAsyncThunk(
    'role/deleteRole',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/roles/${id}`);
            return response.data; // Expecting the role object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete role');
        }
    }
);

const initialState = {
    roles: [],
    currentRole: null, // For storing a single role fetched by ID
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

const roleSlice = createSlice({
    name: 'role',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload.data; // The array of roles
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.roles = [];
            })
            .addCase(updateRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated role in the state if returned
                if (action.payload.data) {
                    const idx = state.roles.findIndex(r => r.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.roles[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new role to the state if returned
                if (action.payload.data) {
                    state.roles.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getRoleById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRoleById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentRole = action.payload.data || action.payload;
            })
            .addCase(getRoleById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentRole = null;
            })
            .addCase(deleteRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted role from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.roles = state.roles.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = roleSlice.actions;
export default roleSlice.reducer;

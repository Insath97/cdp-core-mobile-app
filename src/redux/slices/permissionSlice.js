import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getPermissions = createAsyncThunk(
    'permission/getPermissions',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/permissions?page=${page}`);
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch permissions');
        }
    }
);

export const getAllPermissions = createAsyncThunk(
    'permission/getAllPermissions',
    async (_, { rejectWithValue }) => {
        try {
            // Use a large per_page value to fetch all available permissions for matrix views
            const response = await axiosInstance.get(`/permissions?per_page=1000`);
            return response.data.data.data; // The backend returns paginated shape, we extract the array
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all permissions');
        }
    }
);

export const updatePermission = createAsyncThunk(
    'permission/updatePermission',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/permissions/${id}`, data);
            return response.data; // Expecting the updated permission object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update permission');
        }
    }
);

export const getPermissionById = createAsyncThunk(
    'permission/getPermissionById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/permissions/${id}`);
            return response.data; // Expecting the permission object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch permission');
        }
    }
);

export const createPermission = createAsyncThunk(
    'permission/createPermission',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/permissions', data);
            return response.data; // Expecting the created permission object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create permission');
        }
    }
);

export const deletePermission = createAsyncThunk(
    'permission/deletePermission',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/permissions/${id}`);
            return response.data; // Expecting the permission object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete permission');
        }
    }
);

const initialState = {
    permissions: [],
    allPermissions: [], // For storing the complete unpaginated list
    currentPermission: null, // For storing a single permission fetched by ID
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

const permissionSlice = createSlice({
    name: 'permission',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.permissions = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getPermissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.permissions = [];
            })
            // Get all permissions (unpaginated)
            .addCase(getAllPermissions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllPermissions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allPermissions = action.payload || [];
            })
            .addCase(getAllPermissions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.allPermissions = [];
            })
            .addCase(updatePermission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updatePermission.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated permission in the state if returned
                if (action.payload.data) {
                    const idx = state.permissions.findIndex(p => p.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.permissions[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updatePermission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createPermission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPermission.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new permission to the state if returned
                if (action.payload.data) {
                    state.permissions.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createPermission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getPermissionById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPermissionById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPermission = action.payload.data || action.payload;
            })
            .addCase(getPermissionById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentPermission = null;
            })
            .addCase(deletePermission.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deletePermission.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted permission from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.permissions = state.permissions.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deletePermission.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = permissionSlice.actions;
export default permissionSlice.reducer;

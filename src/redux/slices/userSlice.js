import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
const parseError = (error, defaultMessage) => {
    if (!error.response?.data) return error.message || defaultMessage;
    const data = error.response.data;

    // If it's a 422 validation error, we return the whole structure 
    // so the component can map specific field errors
    if (error.response.status === 422) {
        // Some backends return errors in a nested 'errors' object, some return them flat in 'data'
        let validationErrors = data.errors || (data.message ? {} : data);

        // Normalize: If it's an array of objects like [{field: 'name', messages: [...]}]
        // convert it to a standard keyed object: { name: 'First Message' }
        if (Array.isArray(validationErrors)) {
            const normalized = {};
            validationErrors.forEach(err => {
                const fieldName = err.field || err.name;
                const message = Array.isArray(err.messages) ? err.messages[0] : (err.message || JSON.stringify(err));
                if (fieldName) {
                    normalized[fieldName] = message;
                }
            });
            validationErrors = normalized;
        } else if (typeof validationErrors === 'object' && validationErrors !== null) {
            // Ensure all values are strings (not arrays) for easy rendering
            const normalized = {};
            Object.keys(validationErrors).forEach(key => {
                const val = validationErrors[key];
                normalized[key] = Array.isArray(val) ? val[0] : (typeof val === 'string' ? val : JSON.stringify(val));
            });
            validationErrors = normalized;
        }

        return {
            isValidationError: true,
            message: data.message || defaultMessage,
            errors: validationErrors
        };
    }

    if (data.errors) {
        // Handle various error structures (object of arrays, array of objects, etc.)
        return Object.values(data.errors)
            .flat()
            .map(e => {
                if (typeof e === 'string') return e;
                if (typeof e === 'object' && e !== null) {
                    // Try to extract messages from nested objects (e.g., Laravel sub-errors)
                    return Object.values(e).flat().join(', ');
                }
                return JSON.stringify(e);
            })
            .join(' | ');
    }

    return data.message || error.message || defaultMessage;
};

export const getUsers = createAsyncThunk(
    'user/getUsers',
    async (params = { page: 1 }, { rejectWithValue }) => {
        try {
            // Backward compatibility for calls passing just page number
            const options = typeof params === 'object' ? params : { page: params };

            const queryParams = new URLSearchParams();
            if (options.page) queryParams.append('page', options.page);
            if (options.hierarchy) queryParams.append('hierarchy', options.hierarchy);
            if (options.per_page) queryParams.append('per_page', options.per_page);

            const response = await axiosInstance.get(`/users?${queryParams.toString()}`);
            // axiosInstance already has baseURL, so /users?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(parseError(error, 'Failed to fetch users'));
        }
    }
);

export const getAllUsers = createAsyncThunk(
    'user/getAllUsers',
    async (_, { rejectWithValue }) => {
        try {
            // Fetch a large enough number to cover all users for dropdowns
            const response = await axiosInstance.get('/users?per_page=1000');
            return response.data.data.data; // Just the array of users
        } catch (error) {
            return rejectWithValue(parseError(error, 'Failed to fetch all users'));
        }
    }
);

export const updateUser = createAsyncThunk(
    'user/updateUser',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/users/${id}`, data);
            return response.data; // Expecting the updated user object or a success message
        } catch (error) {
            return rejectWithValue(parseError(error, 'Failed to update user'));
        }
    }
);

export const getUserById = createAsyncThunk(
    'user/getUserById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/users/${id}`);
            return response.data; // Expecting the user object
        } catch (error) {
            return rejectWithValue(parseError(error, 'Failed to fetch user'));
        }
    }
);

export const createUser = createAsyncThunk(
    'user/createUser',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/users', data);
            return response.data; // Expecting the created user object or a success message
        } catch (error) {
            return rejectWithValue(parseError(error, 'Failed to create user'));
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    'user/toggleUserStatus',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/users/${id}/toggle-status`);
            return response.data; // Expecting the updated user object
        } catch (error) {
            return rejectWithValue(parseError(error, 'Failed to toggle user status'));
        }
    }
);

export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/users/${id}`);
            return response.data; // Expecting the deleted user object
        } catch (error) {
            const message = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join(', ')
                : (error.response?.data?.message || 'Failed to delete user');
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    users: [],
    currentUser: null, // For storing a single user fetched by ID
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
        links: []
    },
    allUsers: [],
    isLoading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.data; // The array of users
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.users = [];
            })
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated user in the state if returned
                const updatedUser = action.payload.data || action.payload;
                if (updatedUser && updatedUser.id) {
                    const idx = state.users.findIndex(c => c.id === updatedUser.id);
                    if (idx !== -1) {
                        state.users[idx] = updatedUser;
                    }
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new user to the state if returned
                const newUser = action.payload.data || action.payload;
                if (newUser && newUser.id) {
                    state.users.unshift(newUser);
                    state.pagination.total += 1;
                }
            })
            .addCase(createUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getUserById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = action.payload.data || action.payload;
            })
            .addCase(getUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentUser = null;
            })
            .addCase(deleteUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted user from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.users = state.users.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getAllUsers.pending, (state) => {
                state.error = null;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.allUsers = action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(toggleUserStatus.fulfilled, (state, action) => {
                const updatedUser = action.payload.data || action.payload;
                if (updatedUser && updatedUser.id) {
                    const idx = state.users.findIndex(c => c.id === updatedUser.id);
                    if (idx !== -1) {
                        // Create a new array to avoid direct mutation which can cause blank screens/no re-renders
                        const newUsers = [...state.users];
                        newUsers[idx] = { ...newUsers[idx], ...updatedUser };
                        state.users = newUsers;
                    }
                }
            });
    },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;

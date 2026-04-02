import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getLevels = createAsyncThunk(
    'level/getLevels',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/levels?page=${page}`);
            // axiosInstance already has baseURL, so /levels?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch levels');
        }
    }
);

export const updateLevel = createAsyncThunk(
    'level/updateLevel',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/levels/${id}`, data);
            return response.data; // Expecting the updated level object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update level');
        }
    }
);

export const getLevelById = createAsyncThunk(
    'level/getLevelById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/levels/${id}`);
            return response.data; // Expecting the level object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch level');
        }
    }
);

export const createLevel = createAsyncThunk(
    'level/createLevel',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/levels', data);
            return response.data; // Expecting the created level object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create level');
        }
    }
);

export const deleteLevel = createAsyncThunk(
    'level/deleteLevel',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/levels/${id}`);
            return response.data; // Expecting the deleted level object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete level');
        }
    }
);

const initialState = {
    levels: [],
    currentLevel: null, // For storing a single level fetched by ID
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

const levelSlice = createSlice({
    name: 'level',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getLevels.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getLevels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.levels = action.payload.data; // The array of levels
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getLevels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.levels = [];
            })
            .addCase(updateLevel.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateLevel.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated level in the state if returned
                if (action.payload.data) {
                    const idx = state.levels.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.levels[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateLevel.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createLevel.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createLevel.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new level to the state if returned
                if (action.payload.data) {
                    state.levels.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createLevel.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getLevelById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getLevelById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentLevel = action.payload.data || action.payload;
            })
            .addCase(getLevelById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentLevel = null;
            })
            .addCase(deleteLevel.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteLevel.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted level from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.levels = state.levels.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteLevel.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = levelSlice.actions;
export default levelSlice.reducer;

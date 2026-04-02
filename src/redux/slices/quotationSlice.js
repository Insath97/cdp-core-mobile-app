import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getQuotations = createAsyncThunk(
    'quotation/getQuotations',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/quotations?page=${page}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotations');
        }
    }
);

export const updateQuotation = createAsyncThunk(
    'quotation/updateQuotation',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/quotations/${id}`, data);
            return response.data; // Expecting the updated quotation object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update quotation');
        }
    }
);

export const getQuotationById = createAsyncThunk(
    'quotation/getQuotationById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/quotations/${id}`);
            return response.data; // Expecting the quotation object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotation');
        }
    }
);

export const createQuotation = createAsyncThunk(
    'quotation/createQuotation',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/quotations', data);
            return response.data; // Expecting the created quotation object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create quotation');
        }
    }
);

export const deleteQuotation = createAsyncThunk(
    'quotation/deleteQuotation',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/quotations/${id}`);
            return response.data; // Expecting the deleted quotation object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete quotation');
        }
    }
);

const initialState = {
    quotations: [],
    currentQuotation: null, // For storing a single quotation fetched by ID
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

const quotationSlice = createSlice({
    name: 'quotation',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getQuotations.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getQuotations.fulfilled, (state, action) => {
                state.isLoading = false;
                // Handle both paginated and non-paginated responses
                if (Array.isArray(action.payload)) {
                    state.quotations = action.payload;
                    state.pagination = {
                        currentPage: 1,
                        lastPage: 1,
                        total: action.payload.length,
                        perPage: action.payload.length,
                        links: []
                    };
                } else if (action.payload && action.payload.data) {
                    state.quotations = action.payload.data;
                    state.pagination = {
                        currentPage: action.payload.current_page || 1,
                        lastPage: action.payload.last_page || 1,
                        total: action.payload.total || 0,
                        perPage: action.payload.per_page || 15,
                        links: action.payload.links || []
                    };
                } else {
                    state.quotations = [];
                }
            })
            .addCase(getQuotations.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.quotations = [];
            })
            .addCase(updateQuotation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateQuotation.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated quotation in the state if returned
                const updatedQuo = action.payload.data || (action.payload.id ? action.payload : null);
                if (updatedQuo && updatedQuo.id) {
                    const idx = state.quotations.findIndex(c => c.id === updatedQuo.id);
                    if (idx !== -1) {
                        state.quotations[idx] = updatedQuo;
                    }
                }
            })
            .addCase(updateQuotation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createQuotation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createQuotation.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new quotation to the state if returned
                const newQuo = action.payload.data || (action.payload.id ? action.payload : null);
                if (newQuo && newQuo.id) {
                    state.quotations.unshift(newQuo);
                    state.pagination.total += 1;
                }
            })
            .addCase(createQuotation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getQuotationById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getQuotationById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentQuotation = action.payload.data || action.payload;
            })
            .addCase(getQuotationById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentQuotation = null;
            })
            .addCase(deleteQuotation.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteQuotation.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted quotation from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.quotations = state.quotations.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteQuotation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = quotationSlice.actions;
export default quotationSlice.reducer;

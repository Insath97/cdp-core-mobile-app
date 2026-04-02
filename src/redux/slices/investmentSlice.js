import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Investment Product Thunks
export const getInvestments = createAsyncThunk(
    'investment/getInvestments',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/investment-products?page=${page}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch investments');
        }
    }
);

export const updateInvestment = createAsyncThunk(
    'investment/updateInvestment',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/investment-products/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update investment');
        }
    }
);

export const getInvestmentById = createAsyncThunk(
    'investment/getInvestmentById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/investment-products/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch investment');
        }
    }
);

export const createInvestment = createAsyncThunk(
    'investment/createInvestment',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/investment-products', data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create investment');
        }
    }
);

export const deleteInvestment = createAsyncThunk(
    'investment/deleteInvestment',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/investment-products/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete investment');
        }
    }
);

// Business Entry Thunks
export const getBusinessEntries = createAsyncThunk(
    'investment/getBusinessEntries',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/investments?page=${page}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch business entries');
        }
    }
);

export const createBusinessEntry = createAsyncThunk(
    'investment/createBusinessEntry',
    async (data, { rejectWithValue }) => {
        try {
            const isFormData = data instanceof FormData;
            const response = await axiosInstance.post('/investments', data, {
                headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create investment');
        }
    }
);

export const getBusinessEntryById = createAsyncThunk(
    'investment/getBusinessEntryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/investments/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch investment');
        }
    }
);

// Update Business Entry (General update)
export const updateBusinessEntry = createAsyncThunk(
    'investment/updateBusinessEntry',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/investments/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update investment');
        }
    }
);

// Approve Business Entry (Specific approve endpoint)
export const approveBusinessEntry = createAsyncThunk(
    'investment/approveBusinessEntry',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/investments/${id}/approve`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to approve investment');
        }
    }
);

const initialState = {
    investments: [], // These are products
    currentInvestment: null, // For storing a single investment product fetched by ID
    businessEntries: [], // These are actual business entries
    currentBusinessEntry: null, // For storing a single business entry
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
        links: []
    },
    businessPagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 15,
        links: []
    },
    isLoading: false,
    error: null,
};

const investmentSlice = createSlice({
    name: 'investment',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Investment Product Reducers
            .addCase(getInvestments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInvestments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.investments = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getInvestments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.investments = [];
            })
            .addCase(updateInvestment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateInvestment.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.data) {
                    const idx = state.investments.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.investments[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateInvestment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createInvestment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createInvestment.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.data) {
                    state.investments.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createInvestment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getInvestmentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInvestmentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentInvestment = action.payload.data || action.payload;
            })
            .addCase(getInvestmentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentInvestment = null;
            })
            .addCase(deleteInvestment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteInvestment.fulfilled, (state, action) => {
                state.isLoading = false;
                const deletedId = action.meta.arg;
                state.investments = state.investments.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteInvestment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Business Entry Reducers
            .addCase(getBusinessEntries.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBusinessEntries.fulfilled, (state, action) => {
                state.isLoading = false;
                state.businessEntries = action.payload.data;
                state.businessPagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getBusinessEntries.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createBusinessEntry.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createBusinessEntry.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.data) {
                    state.businessEntries.unshift(action.payload.data);
                    state.businessPagination.total += 1;
                }
            })
            .addCase(createBusinessEntry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getBusinessEntryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBusinessEntryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentBusinessEntry = action.payload.data || action.payload;
            })
            .addCase(getBusinessEntryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentBusinessEntry = null;
            })

            // Update Business Entry
            .addCase(updateBusinessEntry.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateBusinessEntry.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedEntry = action.payload.data || action.payload;
                if (updatedEntry && updatedEntry.id) {
                    const idx = state.businessEntries.findIndex(e => e.id === updatedEntry.id);
                    if (idx !== -1) {
                        state.businessEntries[idx] = updatedEntry;
                    }
                    if (state.currentBusinessEntry?.id === updatedEntry.id) {
                        state.currentBusinessEntry = updatedEntry;
                    }
                }
            })
            .addCase(updateBusinessEntry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Approve Business Entry
            .addCase(approveBusinessEntry.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(approveBusinessEntry.fulfilled, (state, action) => {
                state.isLoading = false;
                const approvedEntry = action.payload.data || action.payload;
                if (approvedEntry && approvedEntry.id) {
                    const idx = state.businessEntries.findIndex(e => e.id === approvedEntry.id);
                    if (idx !== -1) {
                        state.businessEntries[idx] = approvedEntry;
                    }
                    if (state.currentBusinessEntry?.id === approvedEntry.id) {
                        state.currentBusinessEntry = approvedEntry;
                    }
                }
            })
            .addCase(approveBusinessEntry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = investmentSlice.actions;
export default investmentSlice.reducer;
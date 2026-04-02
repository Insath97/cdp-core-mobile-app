import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getCustomers = createAsyncThunk(
    'customer/getCustomers',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/customers?page=${page}`);
            // axiosInstance already has baseURL, so /customers?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
        }
    }
);

export const updateCustomer = createAsyncThunk(
    'customer/updateCustomer',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            console.log('updateCustomer thunk - id:', id, 'data:', data); // Debug log
            const response = await axiosInstance.patch(`/customers/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const getCustomerById = createAsyncThunk(
    'customer/getCustomerById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/customers/${id}`);
            return response.data; // Expecting the customer object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
        }
    }
);

export const createCustomer = createAsyncThunk(
    'customer/createCustomer',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/customers', data);
            return response.data; // Expecting the created customer object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

export const deleteCustomer = createAsyncThunk(
    'customer/deleteCustomer',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/customers/${id}`);
            return response.data; // Expecting the deleted customer object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
        }
    }
);

const initialState = {
    customers: [],
    currentCustomer: null, // For storing a single customer fetched by ID
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

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCustomers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers = action.payload.data; // The array of customers
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getCustomers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.customers = [];
            })
            .addCase(updateCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated customer in the state if returned
                if (action.payload.data) {
                    const idx = state.customers.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.customers[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new customer to the state if returned
                if (action.payload.data) {
                    state.customers.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getCustomerById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCustomerById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCustomer = action.payload.data || action.payload;
            })
            .addCase(getCustomerById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentCustomer = null;
            })
            .addCase(deleteCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted customer from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.customers = state.customers.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = customerSlice.actions;
export default customerSlice.reducer;

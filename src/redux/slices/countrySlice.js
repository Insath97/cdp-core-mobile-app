import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getCountries = createAsyncThunk(
    'country/getCountries',
    async (page = 1, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/countries?page=${page}`);
            // axiosInstance already has baseURL, so /countries?page=x is concatenated
            return response.data.data; // This is the object containing 'data', 'current_page', etc.
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch countries');
        }
    }
);

export const updateCountry = createAsyncThunk(
    'country/updateCountry',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/countries/${id}`, data);
            return response.data; // Expecting the updated country object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update country');
        }
    }
);

export const getCountryById = createAsyncThunk(
    'country/getCountryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/countries/${id}`);
            return response.data; // Expecting the country object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch country');
        }
    }
);

export const createCountry = createAsyncThunk(
    'country/createCountry',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/countries', data);
            return response.data; // Expecting the created country object or a success message
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create country');
        }
    }
);

export const deleteCountry = createAsyncThunk(
    'country/deleteCountry',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/countries/${id}`);
            return response.data; // Expecting the country object
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete country');
        }
    }
);

const initialState = {
    countries: [],
    currentCountry: null, // For storing a single country fetched by ID
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

const countrySlice = createSlice({
    name: 'country',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getCountries.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCountries.fulfilled, (state, action) => {
                state.isLoading = false;
                state.countries = action.payload.data; // The array of countries
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                    links: action.payload.links
                };
            })
            .addCase(getCountries.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.countries = [];
            })
            .addCase(updateCountry.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCountry.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the updated country in the state if returned
                if (action.payload.data) {
                    const idx = state.countries.findIndex(c => c.id === action.payload.data.id);
                    if (idx !== -1) {
                        state.countries[idx] = action.payload.data;
                    }
                }
            })
            .addCase(updateCountry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createCountry.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCountry.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add the new country to the state if returned
                if (action.payload.data) {
                    state.countries.unshift(action.payload.data);
                    state.pagination.total += 1;
                }
            })
            .addCase(createCountry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(getCountryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCountryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCountry = action.payload.data || action.payload;
            })
            .addCase(getCountryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentCountry = null;
            })
            .addCase(deleteCountry.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCountry.fulfilled, (state, action) => {
                state.isLoading = false;
                // Remove the deleted country from the list
                // The action.meta.arg contains the id that was passed to the thunk
                const deletedId = action.meta.arg;
                state.countries = state.countries.filter(p => p.id !== deletedId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteCountry.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError } = countrySlice.actions;
export default countrySlice.reducer;

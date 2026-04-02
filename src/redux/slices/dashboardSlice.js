import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

const initialState = {
    dashboardData: null,
    isLoading: true, // Start true so it shows loading immediately on mount
    error: null,
};

// Fetch dashboard data
export const getDashboardData = createAsyncThunk(
    'dashboard/getDashboardData',
    async (periodKey, { rejectWithValue }) => {
        try {
            const url = periodKey ? `/dashboard?period_key=${periodKey}` : '/dashboard';
            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboardError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDashboardData.fulfilled, (state, action) => {
                state.isLoading = false;
                // action.payload is the whole response, we extract the inner data object
                state.dashboardData = action.payload?.data || null;
            })
            .addCase(getDashboardData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.dashboardData = null;
            });
    },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

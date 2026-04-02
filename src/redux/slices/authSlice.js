import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import Cookies from 'js-cookie';

// Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/login', credentials);
            const { user, auth_token } = response.data.data;

            // Save to both for maximum compatibility
            localStorage.setItem('token', auth_token);
            Cookies.set('auth_token', auth_token, { expires: 1 }); // 1 day

            return { user, token: auth_token };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (credentials, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/logout', credentials);
            localStorage.removeItem('token');
            Cookies.remove('auth_token');
            return null;
        } catch (error) {
            // Even if API fails, we clear local session for safety
            localStorage.removeItem('token');
            Cookies.remove('auth_token');
            return rejectWithValue(error.response?.data?.message || 'Logout failed');
        }
    }
);

export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/profile');
            return response.data.data; // Assuming profile API returns { data: { user } }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                Cookies.remove('auth_token');
            }
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async (passwordData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch('/profile/change-password', passwordData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to change password');
        }
    }
);

const initialState = {
    user: null,
    token: localStorage.getItem('token') || Cookies.get('auth_token') || null,
    isAuthenticated: !!(localStorage.getItem('token') || Cookies.get('auth_token')),
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(getProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
            })
            .addCase(getProfile.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.token = null;
            });
    },
});

export const { clearError, setCredentials, setUser } = authSlice.actions;
export default authSlice.reducer;

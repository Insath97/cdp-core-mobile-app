import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const getHierarchyReport = createAsyncThunk(
    'report/getHierarchyReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reports/hierarchy`, { params });
            const result = response.data;
            let fetchedReports = result.data?.data || [];

            try {
                const userResponse = await axiosInstance.get(`/users`, { params: { per_page: 1000 } });
                if (userResponse.data?.data?.data) {
                    const lookup = {};
                    userResponse.data.data.data.forEach(u => {
                        lookup[u.id] = { id_type: u.id_type, id_number: u.id_number };
                    });
                    fetchedReports = fetchedReports.map(row => {
                        if (lookup[row.id]) {
                            return { ...row, id_type: lookup[row.id].id_type, id_number: lookup[row.id].id_number };
                        }
                        return row;
                    });
                }
            } catch (err) {
                console.error("Failed to fetch user mapping for IDs", err);
            }

            if (result.data?.data) {
                result.data.data = fetchedReports;
            }
            return result;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch hierarchy');
        }
    }
);

export const getHierarchyById = createAsyncThunk(
    'report/getHierarchyById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reports/hierarchy/${id}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch hierarchy');
        }
    }
);

export const getInvestorMaturityReport = createAsyncThunk(
    'report/getInvestorMaturityReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reports/investor-maturity`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch investor maturity report');
        }
    }
);

export const getInvestmentMaturityReport = createAsyncThunk(
    'report/getInvestmentMaturityReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/investments/maturity-report`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch investment maturity report');
        }
    }
);

export const getAgentPerformanceReport = createAsyncThunk(
    'report/getAgentPerformanceReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/reports/agent-performance`, { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch agent performance report');
        }
    }
);


// ─── Initial State 
const initialState = {
    hierarchyReportData: [],
    hierarchyPagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
        links: []
    },
    investorMaturityData: [],
    investorMaturityPagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
        links: []
    },
    investmentMaturityData: [],
    investmentMaturityPagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
        links: []
    },
    currentHierarchy: null,
    agentPerformanceData: null, // Added agentPerformanceData
    isLoading: false,
    error: null,
};

// Slice 
const reportSlice = createSlice({
    name: 'report',
    initialState,
    reducers: {
        resetReport: (state) => {
            state.isLoading = false;
            state.hierarchyReportData = [];
            state.investorMaturityData = [];
            state.investmentMaturityData = [];
            state.currentHierarchy = null;
            state.error = null;
            state.agentPerformanceData = null; // Reset agent performance data
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getHierarchyReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getHierarchyReport.fulfilled, (state, action) => {
                state.isLoading = false;
                const payloadData = action.payload?.data;
                state.hierarchyReportData = payloadData?.data || [];
                if (payloadData) {
                    state.hierarchyPagination = {
                        current_page: payloadData.current_page,
                        last_page: payloadData.last_page,
                        total: payloadData.total,
                        per_page: payloadData.per_page,
                        links: payloadData.links || []
                    };
                }
            })
            .addCase(getHierarchyReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.hierarchyReportData = [];
            })
            .addCase(getHierarchyById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getHierarchyById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentHierarchy = action.payload;
            })
            .addCase(getHierarchyById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.currentHierarchy = null;
            })
            // Investor Maturity Report
            .addCase(getInvestorMaturityReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInvestorMaturityReport.fulfilled, (state, action) => {
                state.isLoading = false;
                const payloadData = action.payload?.data;
                state.investorMaturityData = payloadData?.data || [];
                if (payloadData) {
                    state.investorMaturityPagination = {
                        current_page: payloadData.current_page,
                        last_page: payloadData.last_page,
                        total: payloadData.total,
                        per_page: payloadData.per_page,
                        links: payloadData.links || []
                    };
                }
            })
            .addCase(getInvestorMaturityReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.investorMaturityData = [];
            })
            // Investment Maturity Report
            .addCase(getInvestmentMaturityReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInvestmentMaturityReport.fulfilled, (state, action) => {
                state.isLoading = false;
                const payloadData = action.payload?.data;
                state.investmentMaturityData = payloadData?.data || [];
                if (payloadData) {
                    state.investmentMaturityPagination = {
                        current_page: payloadData.current_page,
                        last_page: payloadData.last_page,
                        total: payloadData.total,
                        per_page: payloadData.per_page,
                        links: payloadData.links || []
                    };
                }
            })
            .addCase(getInvestmentMaturityReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.investmentMaturityData = [];
            })
            // Agent Performance Report
            .addCase(getAgentPerformanceReport.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAgentPerformanceReport.fulfilled, (state, action) => {
                state.isLoading = false;
                state.agentPerformanceData = action.payload.data;
            })
            .addCase(getAgentPerformanceReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.agentPerformanceData = null;
            });
    },
});

export const { resetReport, clearError } = reportSlice.actions;
export default reportSlice.reducer;

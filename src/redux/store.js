import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import roleReducer from './slices/roleSlice';
import permissionReducer from './slices/permissionSlice';
import countryReducer from './slices/countrySlice';
import provinceReducer from './slices/provinceSlice';
import regionReducer from './slices/regionSlice';
import zoneReducer from './slices/zoneSlice';
import branchReducer from './slices/branchSlice';
import userReducer from './slices/userSlice';
import customerReducer from './slices/customerSlice';
import levelReducer from './slices/levelSlice';
import investmentReducer from './slices/investmentSlice';
import targetReducer from './slices/targetSlice';
import quotationReducer from './slices/quotationSlice';
import hierarchyReducer from './slices/hierarchySlice';
import dashboardReducer from './slices/dashboardSlice';
import bulkUploadReducer from './slices/bulkUploadSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        role: roleReducer,
        permission: permissionReducer,
        country: countryReducer,
        province: provinceReducer,
        region: regionReducer,
        zone: zoneReducer,
        branch: branchReducer,
        user: userReducer,
        customer: customerReducer,
        level: levelReducer,
        investment: investmentReducer,
        target: targetReducer,
        quotation: quotationReducer,
        hierarchy: hierarchyReducer,
        dashboard: dashboardReducer,
        bulkUpload: bulkUploadReducer,
        report: reportReducer,
    },
});

export default store;

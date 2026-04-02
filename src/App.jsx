import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { PermissionProvider } from './context/PermissionContext';
import { CountryProvider } from './context/CountryContext';
import { ProvinceProvider } from './context/ProvinceContext';
import { RegionProvider } from './context/RegionContext';
import { ZoneProvider } from './context/ZoneContext';
import { LevelProvider } from './context/LevelContext';
import { InvestmentProvider } from './context/InvestmentContext';
import { UserProvider } from './context/UserContext';
import { TargetProvider } from './context/TargetContext';
import { CustomerProvider } from './context/CustomerContext';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './redux/slices/authSlice';
import { BranchProvider } from './context/BranchContext';
import { QuotationProvider } from './context/QuotationContext';
import { HierarchyProvider } from './context/HierarchyContext';
import { DashboardProvider } from './context/DashboardContext';
import { BulkUploadProvider } from './context/BulkUploadContext';
import { ReportProvider } from './context/ReportContext';

import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import TargetAssignment from './pages/TargetAssignment';
import BusinessEntry from './pages/BusinessEntry';
import HierarchyTree from './pages/Hierarchy';
import Branches from './pages/Branches';
import BranchForm from './pages/BranchForm';
import BranchDetails from './pages/BranchDetails';
import RolesManagement from './pages/RolesManagement';
import PermissionsManagement from './pages/PermissionsManagement';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import UsersPage from './pages/Users';
import TargetForm from './pages/TargetForm';
import Level from './pages/Level';
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import CustomerDetails from './pages/CustomerDetails';
import InvestmentPeriod from './pages/InvestmentPeriod';
import Quotation from './pages/Quotation';
import AddQuotation from './pages/AddQuotation';
import TerritorySetup from './pages/TerritorySetup';
import CountrySetup from './pages/CountrySetup';
import ProvinceSetup from './pages/ProvinceSetup';
import RegionSetup from './pages/RegionSetup';
import ZoneSetup from './pages/ZoneSetup';
import Profile from './pages/Profile';
import HierarchyReport from './pages/HierarchyReport';
import BulkUpload from './pages/BulkUpload';
import UsersReport from './pages/UsersReport';
import InvestorReport from './pages/InvestorReport';
import InvestmentMaturityReport from './pages/InvestmentMaturityReport';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, token, user]);

  return (
    <Router>
      <AuthProvider>
        <RoleProvider>
          <PermissionProvider>
            <QuotationProvider>
              <CountryProvider>
                <ProvinceProvider>
                  <RegionProvider>
                    <ZoneProvider>
                      <UserProvider>
                        <LevelProvider>
                          <InvestmentProvider>
                            <TargetProvider>
                              <BranchProvider>
                                <CustomerProvider>
                                  <HierarchyProvider>
                                    <DashboardProvider>
                                      <BulkUploadProvider>
                                        <ReportProvider>
                                          <Toaster
                                            position="bottom-right"
                                            reverseOrder={false}
                                            containerStyle={{ zIndex: 99999 }}
                                            gutter={8}
                                            toastOptions={{
                                              // Default options for all toasts
                                              duration: 5000,
                                              style: {
                                                background: '#363636',
                                                color: '#fff',
                                                padding: '16px',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                              },
                                              // Success toast specific options
                                              success: {
                                                duration: 4000,
                                                style: {
                                                  background: '#10b981',
                                                },
                                                iconTheme: {
                                                  primary: '#fff',
                                                  secondary: '#10b981',
                                                },
                                              },
                                              // Error toast specific options
                                              error: {
                                                duration: 5000,
                                                style: {
                                                  background: '#ef4444',
                                                },
                                                iconTheme: {
                                                  primary: '#fff',
                                                  secondary: '#ef4444',
                                                },
                                              },
                                              // Loading toast specific options
                                              loading: {
                                                duration: Infinity, // Will stay until dismissed
                                                style: {
                                                  background: '#3b82f6',
                                                },
                                              },
                                            }}
                                          />
                                          <Routes>
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/forgot-password" element={<ForgotPassword />} />

                                            <Route
                                              path="/"
                                              element={
                                                <ProtectedRoute>
                                                  <Layout />
                                                </ProtectedRoute>
                                              }
                                            >
                                              <Route index element={<Dashboard />} />
                                              <Route path="/hierarchy" element={<HierarchyTree />} />
                                              <Route path="/branches" element={<Branches />} />
                                              <Route path="/branches/create" element={<BranchForm />} />
                                              <Route path="/branches/:id/edit" element={<BranchForm />} />
                                              <Route path="/branches/:id" element={<BranchDetails />} />
                                              <Route path="/targets-config" element={<TargetAssignment />} />
                                              <Route path="/targets-config/create" element={<TargetForm />} />
                                              <Route path="/targets-config/:id/edit" element={<TargetForm />} />
                                              <Route path="/my-business" element={<BusinessEntry />} />
                                              <Route path="/roles" element={<RolesManagement />} />
                                              <Route path="/permissions" element={<PermissionsManagement />} />
                                              <Route path="/level" element={<Level />} />
                                              <Route path="/investment-period" element={<InvestmentPeriod />} />
                                              <Route path="/territory-setup/:type?" element={<TerritorySetup />} />
                                              <Route path="/territory/country" element={<CountrySetup />} />
                                              <Route path="/territory/province" element={<ProvinceSetup />} />
                                              <Route path="/territory/region" element={<RegionSetup />} />
                                              <Route path="/territory/zone" element={<ZoneSetup />} />
                                              <Route path="/users" element={<UsersPage />} />
                                              <Route path="/customers" element={<Customers />} />
                                              <Route path="/customers/add" element={<AddCustomer />} />
                                              <Route path="/customers/:id" element={<CustomerDetails />} />
                                              <Route path="/customers/:id/edit" element={<AddCustomer />} />
                                              <Route path="/quotation" element={<Quotation />} />
                                              <Route path="/quotation/add" element={<AddQuotation />} />
                                              <Route path="/quotation/edit/:id" element={<AddQuotation />} />
                                              <Route path="/reports/hierarchy" element={<HierarchyReport />} />
                                              <Route path="/reports/investor" element={<InvestorReport />} />
                                              <Route path="/reports/investment-maturity" element={<InvestmentMaturityReport />} />
                                              <Route path="/reports/users" element={<UsersReport />} />
                                              <Route path="/profile" element={<Profile />} />
                                              <Route path="*" element={<Placeholder />} />
                                              <Route path="/bulk-upload" element={<BulkUpload />} />

                                            </Route>
                                          </Routes>
                                        </ReportProvider>
                                      </BulkUploadProvider>
                                    </DashboardProvider>
                                  </HierarchyProvider>
                                </CustomerProvider>
                              </BranchProvider>
                            </TargetProvider>
                          </InvestmentProvider>
                        </LevelProvider>
                      </UserProvider>
                    </ZoneProvider>
                  </RegionProvider>
                </ProvinceProvider>
              </CountryProvider>
            </QuotationProvider>
          </PermissionProvider>
        </RoleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

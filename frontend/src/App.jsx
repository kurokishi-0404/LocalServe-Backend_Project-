import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import RoleRoute from './components/RoleRoute';

// Public Pages
import Home from './pages/public/Home';
import Services from './pages/public/Services';
import ServiceDetails from './pages/public/ServiceDetails';
import Providers from './pages/public/Providers';
import ProviderDetails from './pages/public/ProviderDetails';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingDetails from './pages/customer/BookingDetails';
import PaymentPage from './pages/customer/PaymentPage';
import ReviewPage from './pages/customer/ReviewPage';
import CustomerChat from './pages/customer/CustomerChat';
import CustomerProfile from './pages/customer/CustomerProfile';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderServices from './pages/provider/ProviderServices';
import ServiceForm from './pages/provider/ServiceForm';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderChat from './pages/provider/ProviderChat';
import ProviderProfile from './pages/provider/ProviderProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProviders from './pages/admin/AdminProviders';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminUsers from './pages/admin/AdminUsers';
import AdminServices from './pages/admin/AdminServices';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/providers/:id" element={<ProviderDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Customer Protected Routes in Dashboard Layout */}
            <Route
              path="/customer"
              element={
                <RoleRoute allowedRoles={['customer']}>
                  <DashboardLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="bookings" element={<CustomerBookings />} />
              <Route path="bookings/:id" element={<BookingDetails />} />
              <Route path="payment/:bookingId" element={<PaymentPage />} />
              <Route path="reviews/:serviceId" element={<ReviewPage />} />
              <Route path="chat/:id" element={<CustomerChat />} />
              <Route path="profile" element={<CustomerProfile />} />
            </Route>

            {/* Provider Protected Routes in Dashboard Layout */}
            <Route
              path="/provider"
              element={
                <RoleRoute allowedRoles={['provider']}>
                  <DashboardLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<ProviderDashboard />} />
              <Route path="services" element={<ProviderServices />} />
              <Route path="services/new" element={<ServiceForm />} />
              <Route path="services/:id/edit" element={<ServiceForm />} />
              <Route path="bookings" element={<ProviderBookings />} />
              <Route path="bookings/:id" element={<BookingDetails />} />
              <Route path="chat/:id" element={<ProviderChat />} />
              <Route path="profile" element={<ProviderProfile />} />
            </Route>

            {/* Admin Protected Routes in Dashboard Layout */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </RoleRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="providers" element={<AdminProviders />} />
              <Route path="disputes" element={<AdminDisputes />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="services" element={<AdminServices />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

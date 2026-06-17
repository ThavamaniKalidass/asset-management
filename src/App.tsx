import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import DeskDetailsPage from "./pages/DeskDetailsPage";

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AssetMasterPage = lazy(() => import('@/pages/AssetMasterPage'));
const QRManagementPage = lazy(() => import('@/pages/QRManagementPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));

// Full-screen loading fallback for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
 <Route path="/desk/:deskNumber" element={<DeskDetailsPage />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              {/* All protected pages wrapped in AppLayout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assets" element={<AssetMasterPage />} />
                <Route path="/qr-management" element={<QRManagementPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/reports" element={<ReportsPage />} />
               
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

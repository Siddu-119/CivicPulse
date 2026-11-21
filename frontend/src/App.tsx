import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { TrackPage } from './pages/TrackPage';
import { MapPage } from './pages/MapPage';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import type { Role } from './types';

function ProtectedRoute({ role, children }: { role: Role; children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span>Verifying municipal authentication...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/citizen'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route
              path="/citizen"
              element={
                <ProtectedRoute role="CITIZEN">
                  <CitizenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

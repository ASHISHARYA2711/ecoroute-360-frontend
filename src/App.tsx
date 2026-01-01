import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// ===== AUTH =====
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import NotFound from './pages/NotFound';

// ===== ADMIN PAGES =====
import AdminDashboard from './pages/admin/AdminDashboard';
import BinsPage from './pages/admin/BinsPage';
import MapPage from './pages/admin/MapPage';
import RoutesPage from './pages/admin/RoutesPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import DriversPage from './pages/admin/DriversPage';
import SettingsPage from './pages/admin/SettingsPage';
import DriverMapPage from './pages/driver/DriverMapPage';
import DriverHistoryPage from './pages/driver/DriverHistoryPage';




// ===== DRIVER PAGES =====
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverRoutePage from './pages/driver/DriverRoutePage';

function App() {
  const { role, isLoading } = useAuth();

  /* ---------------------------
     LOADING STATE
  ---------------------------- */
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 18,
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  /* ---------------------------
     NOT LOGGED IN → LOGIN ONLY
  ---------------------------- */
  if (!role) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  /* ---------------------------
     LOGGED IN → APP LAYOUT
  ---------------------------- */
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout role={role} />}>
          {/* Default redirect */}
          <Route
            index
            element={
              role === 'ADMIN'
                ? <Navigate to="/admin" replace />
                : <Navigate to="/driver/route" replace />
            }
          />

          {/* ===== ADMIN ROUTES ===== */}
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/bins"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <BinsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/map"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <MapPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/routes"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <RoutesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ ADMIN → DRIVERS (THIS IS WHAT YOU ASKED) */}
          <Route
            path="admin/drivers"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <DriversPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/settings"
            element={
             <ProtectedRoute allowedRole="ADMIN">
               <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver/map"
            element={
             <ProtectedRoute allowedRole="DRIVER">
               <DriverMapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="driver/history"
            element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverHistoryPage />
              </ProtectedRoute>
            }
          />


          {/* ===== DRIVER ROUTES ===== */}
          <Route
            path="driver"
            element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="driver/route"
            element={
              <ProtectedRoute allowedRole="DRIVER">
                <DriverRoutePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

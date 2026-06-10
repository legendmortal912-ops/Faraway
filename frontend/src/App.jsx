import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useLifeMeshStore } from './store/useLifeMeshStore';

// Public pages
import Landing from './pages/Landing';
import RoleSelection from './pages/RoleSelection';
import HospitalAuth from './pages/HospitalAuth';
import LogisticsAuth from './pages/LogisticsAuth';

// Hospital portal
import HospitalLayout from './layouts/HospitalLayout';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import NetworkDonors from './pages/hospital/NetworkDonors';
import RegisterDonor from './pages/hospital/RegisterDonor';
import Waitlist from './pages/hospital/Waitlist';
import HospitalShipments from './pages/hospital/HospitalShipments';
import FleetManager from './pages/hospital/FleetManager';
import CryptoLogs from './pages/hospital/CryptoLogs';
import History from './pages/hospital/History';

// Logistics portal
import LogisticsLayout from './layouts/LogisticsLayout';
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import LiveTracking from './pages/logistics/LiveTracking';
import EmergencyRerouting from './pages/logistics/EmergencyRerouting';
import AuditLogs from './pages/logistics/AuditLogs';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useLifeMeshStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { restoreSession, connectWS, isAuthenticated, user } = useLifeMeshStore();
  const location = useLocation();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    connectWS();
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/select-role" element={<RoleSelection />} />
      <Route path="/login/hospital" element={<HospitalAuth mode="login" />} />
      <Route path="/signup/hospital" element={<HospitalAuth mode="signup" />} />
      <Route path="/login/logistics" element={<LogisticsAuth mode="login" />} />
      <Route path="/signup/logistics" element={<LogisticsAuth mode="signup" />} />
      <Route path="/login" element={<Navigate to="/select-role" replace />} />

      {/* Hospital Portal */}
      <Route path="/hospital" element={<ProtectedRoute requiredRole="hospital"><HospitalLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="network-donors" element={<NetworkDonors />} />
        <Route path="register-donor" element={<RegisterDonor />} />
        <Route path="waitlist" element={<Waitlist />} />
        <Route path="shipments" element={<HospitalShipments />} />
        <Route path="fleet" element={<FleetManager />} />
        <Route path="crypto-logs" element={<CryptoLogs />} />
        <Route path="history" element={<History />} />
      </Route>

      {/* Logistics Portal */}
      <Route path="/logistics" element={<ProtectedRoute requiredRole="logistics"><LogisticsLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/logistics/dashboard" replace />} />
        <Route path="dashboard" element={<LogisticsDashboard />} />
        <Route path="tracking" element={<LiveTracking />} />
        <Route path="rerouting" element={<EmergencyRerouting />} />
        <Route path="audit" element={<AuditLogs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-noise" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <AppRoutes />
    </BrowserRouter>
  );
}

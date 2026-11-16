import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HospitalManagement from './pages/HospitalManagement';
import HospitalAdminManagement from './pages/HospitalAdminManagement';
import Patients from './pages/Patients';
import MediCard from './pages/MediCard';
import LabTests from './pages/LabTests';
import DoctorAppointments from './pages/DoctorAppointments';
import ReportsAnalytics from './pages/ReportsAnalytics';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Doctors from './pages/Doctors';
import Staff from './pages/Staff';
import Departments from './pages/Departments';
import BioMarkers from './pages/BioMarkers';
import HealthMap from './pages/HealthMap';
import MedicineManagement from './pages/MedicineManagement';
import RecipeManagement from './pages/RecipeManagement';
import UserManagement from './pages/UserManagement';
import PatientApply from './pages/PatientApply';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Patient & Login Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<PatientApply />} />
          <Route path="/patient-apply" element={<PatientApply />} />

          {/* Super Admin Protected App Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* 1. Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* 2. Hospital Management */}
            <Route path="/hospitals" element={<HospitalManagement />} />
            <Route path="/hospital-management" element={<Navigate to="/hospitals" replace />} />
            <Route path="/hospital-admins" element={<HospitalAdminManagement />} />
            <Route path="/hospital-admin-management" element={<Navigate to="/hospital-admins" replace />} />

            {/* 3. Patient Management */}
            <Route path="/patients" element={<Patients />} />
            <Route path="/patient-management" element={<Navigate to="/patients" replace />} />

            {/* 4. Medy Card Management */}
            <Route path="/medi-card" element={<MediCard />} />
            <Route path="/medy-card-management" element={<Navigate to="/medi-card" replace />} />
            <Route path="/account" element={<Navigate to="/medi-card" replace />} />

            {/* 5. Lab Management */}
            <Route path="/lab-tests" element={<LabTests />} />
            <Route path="/lab-management" element={<Navigate to="/lab-tests" replace />} />
            <Route path="/laboratory" element={<Navigate to="/lab-tests" replace />} />

            {/* 6. Appointments */}
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route path="/appointments" element={<Navigate to="/doctor-appointments" replace />} />

            {/* 7. Reports & Analytics */}
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/analytics" element={<Navigate to="/reports" replace />} />
            <Route path="/reports-analytics" element={<Navigate to="/reports" replace />} />

            {/* 8. Audit Logs */}
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/admin-security" element={<Navigate to="/audit-logs" replace />} />
            <Route path="/security" element={<Navigate to="/audit-logs" replace />} />

            {/* 9. Settings */}
            <Route path="/settings" element={<Settings />} />

            {/* Specialized Clinical & Network Modules */}
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/biomarkers" element={<BioMarkers />} />
            <Route path="/bio-markers" element={<Navigate to="/biomarkers" replace />} />
            <Route path="/health-map" element={<HealthMap />} />
            <Route path="/healthmap" element={<Navigate to="/health-map" replace />} />
            <Route path="/medicines" element={<MedicineManagement />} />
            <Route path="/medicine-management" element={<Navigate to="/medicines" replace />} />
            <Route path="/recipes" element={<RecipeManagement />} />
            <Route path="/recipe-management" element={<Navigate to="/recipes" replace />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/user-management" element={<Navigate to="/users" replace />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  CreditCard,
  FlaskConical,
  Stethoscope,
  ShieldCheck,
  Activity,
  Clock,
  Edit2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ExternalLink,
  Plus,
  FileText,
  UserCheck,
  Check,
  X,
  Copy,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MedyCardPreview from '../components/MedyCardPreview';

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { admin } = useAuth();

  // Core Data State
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active Tab
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Search filters within tabs
  const [patientSearch, setPatientSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [labSearch, setLabSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [labTestSearch, setLabTestSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Edit Hospital Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    city: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Toggling Status
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Fetch Hospital Complete Details
  const fetchHospitalDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/hospitals/${id}`, {
        headers: {
          Authorization: `Bearer ${admin?.token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Hospital facility not found.');
        }
        throw new Error('Failed to load hospital details.');
      }

      const data = await res.json();
      setHospital(data);
      setEditForm({
        name: data.name || '',
        code: data.code || '',
        city: data.city || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        status: data.status || 'Active',
      });
    } catch (err) {
      console.error('Error fetching hospital details:', err);
      setError(err.message || 'Error fetching hospital details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalDetails();
  }, [id, admin]);

  // Handle Edit Submit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/hospitals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update hospital.');

      setSuccessMessage('Hospital details updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4500);
      setIsEditOpen(false);
      fetchHospitalDetails();
    } catch (err) {
      setEditError(err.message || 'Failed to save changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async () => {
    if (!hospital) return;
    const newStatus = hospital.status === 'Active' ? 'Inactive' : 'Active';
    try {
      setTogglingStatus(true);
      const res = await fetch(`/api/hospitals/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update hospital status');
      setSuccessMessage(`Hospital is now ${newStatus}.`);
      setTimeout(() => setSuccessMessage(''), 4500);
      fetchHospitalDetails();
    } catch (err) {
      setError(err.message || 'Failed to toggle status.');
    } finally {
      setTogglingStatus(false);
    }
  };

  // Filtered lists for each tab
  const filteredPatients = useMemo(() => {
    const list = hospital?.patients || [];
    if (!patientSearch.trim()) return list;
    const q = patientSearch.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.phone || '').includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.cardId || '').toLowerCase().includes(q)
    );
  }, [hospital?.patients, patientSearch]);

  const filteredAdmins = useMemo(() => {
    const list = hospital?.hospitalAdmins || [];
    if (!adminSearch.trim()) return list;
    const q = adminSearch.toLowerCase().trim();
    return list.filter(
      (a) =>
        (a.fullName || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.adminId || '').toLowerCase().includes(q) ||
        (a.designation || '').toLowerCase().includes(q) ||
        (a.phone || '').includes(q)
    );
  }, [hospital?.hospitalAdmins, adminSearch]);

  const filteredLabs = useMemo(() => {
    const list = hospital?.partneredLabs || [];
    if (!labSearch.trim()) return list;
    const q = labSearch.toLowerCase().trim();
    return list.filter(
      (l) =>
        (l.name || '').toLowerCase().includes(q) ||
        (l.labCode || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q) ||
        (l.category || '').toLowerCase().includes(q)
    );
  }, [hospital?.partneredLabs, labSearch]);

  const filteredAppointments = useMemo(() => {
    const list = hospital?.appointments || [];
    if (!appointmentSearch.trim()) return list;
    const q = appointmentSearch.toLowerCase().trim();
    return list.filter(
      (ap) =>
        (ap.patientName || '').toLowerCase().includes(q) ||
        (ap.appointmentId || '').toLowerCase().includes(q) ||
        (ap.doctorName || '').toLowerCase().includes(q) ||
        (ap.department || '').toLowerCase().includes(q) ||
        (ap.patientPhone || '').includes(q)
    );
  }, [hospital?.appointments, appointmentSearch]);

  const filteredLabTests = useMemo(() => {
    const list = hospital?.labTests || [];
    if (!labTestSearch.trim()) return list;
    const q = labTestSearch.toLowerCase().trim();
    return list.filter(
      (t) =>
        (t.testBookingId || '').toLowerCase().includes(q) ||
        (t.patientName || '').toLowerCase().includes(q) ||
        (t.testName || '').toLowerCase().includes(q) ||
        (t.assignedLabName || '').toLowerCase().includes(q) ||
        (t.patientPhone || '').includes(q)
    );
  }, [hospital?.labTests, labTestSearch]);

  const filteredAuditLogs = useMemo(() => {
    const list = hospital?.auditLogs || [];
    if (!auditSearch.trim()) return list;
    const q = auditSearch.toLowerCase().trim();
    return list.filter(
      (al) =>
        (al.action || '').toLowerCase().includes(q) ||
        (al.actor || '').toLowerCase().includes(q) ||
        (al.target || '').toLowerCase().includes(q) ||
        (al.details || '').toLowerCase().includes(q)
    );
  }, [hospital?.auditLogs, auditSearch]);

  // Loading state
  if (loading) {
    return (
      <div className="super-page-container" style={{ padding: '2rem 2.5rem' }}>
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#0284c7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1.25rem',
            }}
          />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Loading Hospital Dossier...</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Retrieving complete hospital profile, administrators, partnered labs, and patients.</p>
        </div>
      </div>
    );
  }

  // Error / Not found state
  if (error || !hospital) {
    return (
      <div className="super-page-container" style={{ padding: '2rem 2.5rem' }}>
        <button
          className="super-btn-secondary"
          onClick={() => navigate('/hospitals')}
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Hospitals Directory</span>
        </button>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #fee2e2',
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '2rem auto',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertTriangle size={28} color="#dc2626" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#991b1b' }}>Failed to Load Hospital</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
            {error || 'The requested hospital record could not be found or has been removed.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="super-btn-secondary" onClick={() => navigate('/hospitals')}>
              Return to Hospitals
            </button>
            <button className="super-btn-primary" onClick={fetchHospitalDetails}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = hospital.stats || {
    totalPatients: hospital.patients?.length || 0,
    totalCards: hospital.cards?.length || 0,
    activeCards: (hospital.cards || []).filter((c) => c.status === 'Active').length,
    totalAdmins: (hospital.hospitalAdmins || []).filter((a) => a.role === 'HOSPITAL_ADMIN').length,
    totalPartneredLabs: hospital.partneredLabs?.length || 0,
    totalAppointments: hospital.appointments?.length || 0,
    totalLabTests: hospital.labTests?.length || 0,
    completedLabReports: (hospital.labTests || []).filter((t) => t.status === 'Report Completed').length,
  };

  const currentColor = hospital.cardColor || '#0284c7';

  return (
    <div className="super-page-container" style={{ padding: '1.75rem 2.25rem' }}>
      {/* =========================================================================
          1. TOP NAVIGATION / BREADCRUMB BAR
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="super-btn-secondary"
            onClick={() => navigate('/hospitals')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Hospitals</span>
          </button>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Hospital Management</span>
          <span style={{ color: '#cbd5e1' }}>/</span>
          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{hospital.name}</span>
        </div>
      </div>

      {/* Toast Notification */}
      {successMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. HOSPITAL HERO HEADER CARD
          ========================================================================= */}
      <div
        className="super-panel-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          borderLeft: `6px solid ${currentColor}`,
          background: 'linear-gradient(to right, #ffffff, #f8fafc)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* Left info: Icon, Name, Code, Badges, Details */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: currentColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 18px ${currentColor}33`,
                flexShrink: 0,
              }}
            >
              <Building2 size={32} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                  {hospital.name}
                </h1>
                <span className="card-id-badge" style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem' }}>
                  {hospital.code}
                </span>
                <span className={`super-status-pill ${hospital.status === 'Active' ? 'active' : 'inactive'}`}>
                  <span className="status-dot"></span>
                  {hospital.status}
                </span>
              </div>

              {/* Location and Contact Info Strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  marginTop: '0.6rem',
                  flexWrap: 'wrap',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#0284c7" />
                  <span>{hospital.city ? `${hospital.city}, India` : 'City Network'}</span>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="#10b981" />
                  <span>{hospital.phone || 'No phone recorded'}</span>
                </div>
                {hospital.email && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="#6366f1" />
                    <span>{hospital.email}</span>
                  </div>
                )}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} color="#94a3b8" />
                  <span>
                    Enrolled {hospital.createdAt ? new Date(hospital.createdAt).toLocaleDateString('en-GB') : 'Recently'}
                  </span>
                </div>
              </div>

              {hospital.address && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
                  <span style={{ fontWeight: 600, color: '#475569' }}>Facility Address:</span> {hospital.address}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="super-btn-secondary"
              onClick={() => setIsEditOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}
            >
              <Edit2 size={14} />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              className={hospital.status === 'Active' ? 'super-btn-secondary' : 'super-btn-primary'}
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                color: hospital.status === 'Active' ? '#dc2626' : '#ffffff',
                borderColor: hospital.status === 'Active' ? '#fecaca' : undefined,
                background: hospital.status === 'Active' ? '#fef2f2' : undefined,
              }}
            >
              {hospital.status === 'Active' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
              <span>{togglingStatus ? 'Updating...' : hospital.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
            </button>

            <button
              type="button"
              className="super-btn-primary"
              onClick={() => navigate(`/hospital-admins?hospitalId=${hospital._id}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}
            >
              <UserCheck size={14} />
              <span>Manage Admins</span>
            </button>

            <button
              type="button"
              className="super-btn-secondary"
              onClick={() => navigate('/partnered-labs')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.825rem',
                background: '#f0f9ff',
                borderColor: '#bae6fd',
                color: '#0369a1',
              }}
            >
              <FlaskConical size={14} />
              <span>Partnered Labs</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. KEY KPI METRICS GRID (CLICKABLE TO OPEN RELATED TABS)
          ========================================================================= */}
      <div
        className="super-metrics-grid"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginBottom: '1.5rem',
        }}
      >
        {/* Metric 1: Registered Patients */}
        <div
          className="super-metric-card"
          onClick={() => handleTabChange('patients')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'patients' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: activeTab === 'patients' ? '#f0f9ff' : '#ffffff',
            transform: activeTab === 'patients' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view registered patients for this hospital"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Registered Patients</span>
            <span className="super-metric-value" style={{ color: '#0284c7' }}>
              {stats.totalPatients}
            </span>
            <span className="super-metric-trend">Total Patient Base</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Users size={20} color="#ffffff" />
          </div>
        </div>

        {/* Metric 2: Medy Cards Issued */}
        <div
          className="super-metric-card"
          onClick={() => handleTabChange('patients')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'patients' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: activeTab === 'patients' ? '#f0fdf4' : '#ffffff',
            transform: activeTab === 'patients' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view Medy cards issued"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Medy Cards Issued</span>
            <span className="super-metric-value" style={{ color: '#059669' }}>
              {stats.totalCards}
            </span>
            <span className="super-metric-trend positive">
              {stats.activeCards} Active Cards
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CreditCard size={20} color="#ffffff" />
          </div>
        </div>

        {/* Metric 3: Hospital Administrators */}
        <div
          className="super-metric-card"
          onClick={() => handleTabChange('admins')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'admins' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: activeTab === 'admins' ? '#f5f3ff' : '#ffffff',
            transform: activeTab === 'admins' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view assigned hospital administrators"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Hospital Admins</span>
            <span className="super-metric-value" style={{ color: '#6366f1' }}>
              {stats.totalAdmins}
            </span>
            <span className="super-metric-trend">Facility Administrators</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <ShieldCheck size={20} color="#ffffff" />
          </div>
        </div>

        {/* Metric 4: Partnered Diagnostic Labs */}
        <div
          className="super-metric-card"
          onClick={() => handleTabChange('labs')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'labs' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: activeTab === 'labs' ? '#fffbeb' : '#ffffff',
            transform: activeTab === 'labs' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view diagnostic laboratories granted to this hospital"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Partnered Labs</span>
            <span className="super-metric-value" style={{ color: '#d97706' }}>
              {stats.totalPartneredLabs}
            </span>
            <span className="super-metric-trend">Diagnostic Links</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <FlaskConical size={20} color="#ffffff" />
          </div>
        </div>

        {/* Metric 5: Doctor Appointments */}
        <div
          className="super-metric-card"
          onClick={() => handleTabChange('appointments')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'appointments' ? '2px solid #0891b2' : '1px solid #eaeff5',
            background: activeTab === 'appointments' ? '#ecfeff' : '#ffffff',
            transform: activeTab === 'appointments' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view appointments scheduled at this hospital"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Doctor Appointments</span>
            <span className="super-metric-value" style={{ color: '#0891b2' }}>
              {stats.totalAppointments}
            </span>
            <span className="super-metric-trend">Booked Appointments</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0891b2' }}>
            <Stethoscope size={20} color="#ffffff" />
          </div>
        </div>

        {/* Metric 6: Diagnostic Lab Tests */}
        <div
          className="super-metric-card"
          onClick={() => handleTabChange('lab-tests')}
          style={{
            cursor: 'pointer',
            border: activeTab === 'lab-tests' ? '2px solid #8b5cf6' : '1px solid #eaeff5',
            background: activeTab === 'lab-tests' ? '#f5f3ff' : '#ffffff',
            transform: activeTab === 'lab-tests' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view lab tests requested for this hospital's patients"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Lab Tests Booked</span>
            <span className="super-metric-value" style={{ color: '#7c3aed' }}>
              {stats.totalLabTests}
            </span>
            <span className="super-metric-trend positive">
              {stats.completedLabReports} Reports Completed
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#8b5cf6' }}>
            <Activity size={20} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. INTERACTIVE TABS BAR
          ========================================================================= */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        {[
          { key: 'overview', label: 'Overview & Profile', icon: Building2 },
          { key: 'admins', label: `Hospital Administrators (${stats.totalAdmins})`, icon: ShieldCheck },
          { key: 'labs', label: `Partnered Labs (${stats.totalPartneredLabs})`, icon: FlaskConical },
          { key: 'patients', label: `Patients & Cards (${stats.totalPatients})`, icon: Users },
          { key: 'appointments', label: `Appointments (${stats.totalAppointments})`, icon: Stethoscope },
          { key: 'lab-tests', label: `Lab Tests (${stats.totalLabTests})`, icon: Activity },
          { key: 'audit', label: `Audit Trail (${hospital.auditLogs?.length || 0})`, icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.1rem',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0284c7' : '#64748b',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                marginBottom: '-2px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#0284c7' : '#94a3b8'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          5. TAB CONTENT PANELS
          ========================================================================= */}

      {/* -------------------------------------------------------------------------
          TAB 1: FACILITY OVERVIEW & PROFILE
          ------------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Card 1: Facility Profile Dossier */}
          <div className="super-panel-card">
            <div className="panel-card-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="#0284c7" />
                <span>Facility Dossier & Technical Specs</span>
              </h3>
              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => setIsEditOpen(true)}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
              >
                <Edit2 size={13} />
                <span>Edit Info</span>
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', width: '38%', fontWeight: 500 }}>
                      Official Name
                    </td>
                    <td style={{ padding: '0.75rem 0', color: '#0f172a', fontWeight: 600 }}>{hospital.name}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>Facility Code</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span className="card-id-badge">{hospital.code}</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>Operational Status</td>
                    <td style={{ padding: '0.75rem 0' }}>
                      <span className={`super-status-pill ${hospital.status === 'Active' ? 'active' : 'inactive'}`}>
                        <span className="status-dot"></span>
                        {hospital.status}
                      </span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>City / Region</td>
                    <td style={{ padding: '0.75rem 0', color: '#0f172a' }}>{hospital.city}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>Primary Phone</td>
                    <td style={{ padding: '0.75rem 0', color: '#0f172a', fontWeight: 600 }}>{hospital.phone}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>Official Email</td>
                    <td style={{ padding: '0.75rem 0', color: '#0f172a' }}>{hospital.email || '—'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>Full Address</td>
                    <td style={{ padding: '0.75rem 0', color: '#334155' }}>{hospital.address || '—'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>Enrolled Date</td>
                    <td style={{ padding: '0.75rem 0', color: '#0f172a' }}>
                      {hospital.createdAt ? new Date(hospital.createdAt).toLocaleString('en-GB') : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0', color: '#64748b', fontWeight: 500 }}>System ID</td>
                    <td style={{ padding: '0.75rem 0', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      {hospital._id}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Medy Card Branding & Live Preview */}
          <div className="super-panel-card">
            <div className="panel-card-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} color="#0284c7" />
                <span>Medy Health Card Preview</span>
              </h3>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Patients registered through this hospital are issued a digital Medy Health Card linked directly to their facility records and treatments.
              </p>

              {/* Live Preview Widget */}
              <div style={{ margin: '0 auto', maxWidth: '380px' }}>
                <MedyCardPreview
                  card={{
                    cardId: `MED-${hospital.code || '2026'}-001`,
                    patientName: 'Sample Patient',
                    hospitalName: hospital.name,
                    cardColor: hospital.cardColor || '#0284c7',
                    status: 'Active',
                    insurancePlan: 'Medy Prime Coverage',
                    coverageAmount: 500000,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 2: HOSPITAL ADMINISTRATORS
          ------------------------------------------------------------------------- */}
      {activeTab === 'admins' && (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Hospital Administrators ({filteredAdmins.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Authorized administrator accounts assigned to manage operations for {hospital.name}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '220px' }}>
                <Search size={15} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search administrators..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="super-btn-primary"
                onClick={() => navigate(`/hospital-admins?hospitalId=${hospital._id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}
              >
                <Plus size={15} />
                <span>Assign Administrator</span>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Administrator Details</th>
                  <th>Admin ID</th>
                  <th>Designation / Role</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <UserCheck size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No Hospital Administrators Assigned Yet</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        Create a dedicated administrator account for this facility in Hospital Admin Management.
                      </div>
                      <button
                        type="button"
                        className="super-btn-primary"
                        onClick={() => navigate(`/hospital-admins?hospitalId=${hospital._id}`)}
                        style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Plus size={14} />
                        <span>Create First Administrator</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((adm) => (
                    <tr key={adm._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#e0f2fe',
                              border: '1px solid #bae6fd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0284c7',
                              flexShrink: 0,
                            }}
                          >
                            <User size={16} />
                          </div>
                          <div>
                            <strong>{adm.fullName}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{adm.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="card-id-badge">{adm.adminId || 'HADM'}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
                          {adm.designation || 'Hospital Administrator'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{adm.role || 'HOSPITAL_ADMIN'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                          <div>
                            <Phone size={12} style={{ marginRight: 4 }} />
                            {adm.phone}
                          </div>
                          <div>
                            <Mail size={12} style={{ marginRight: 4 }} />
                            {adm.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`super-status-pill ${adm.status === 'Active' ? 'active' : 'inactive'}`}>
                          <span className="status-dot"></span>
                          {adm.status}
                        </span>
                      </td>
                      <td>
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="super-btn-secondary"
                          onClick={() => navigate(`/hospital-admins?hospitalId=${hospital._id}`)}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 3: PARTNERED DIAGNOSTIC LABORATORIES
          ------------------------------------------------------------------------- */}
      {activeTab === 'labs' && (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Partnered Diagnostic Laboratories ({filteredLabs.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                External accredited laboratories granted diagnostic access for patients of {hospital.name}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '220px' }}>
                <Search size={15} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search labs, code, city..."
                  value={labSearch}
                  onChange={(e) => setLabSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="super-btn-primary"
                onClick={() => navigate('/partnered-labs')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem' }}
              >
                <FlaskConical size={14} />
                <span>Manage Partnered Labs</span>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Laboratory Name</th>
                  <th>Lab Code</th>
                  <th>City / Location</th>
                  <th>Category</th>
                  <th>Accreditations</th>
                  <th>Operating Hours</th>
                  <th>Contact Phone</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabs.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <FlaskConical size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No Partnered Labs Assigned to This Hospital</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        Grant access to accredited external laboratories in the Partnered Labs portal.
                      </div>
                      <button
                        type="button"
                        className="super-btn-primary"
                        onClick={() => navigate('/partnered-labs')}
                        style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Plus size={14} />
                        <span>Grant Partnered Lab Access</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredLabs.map((lab) => (
                    <tr key={lab._id}>
                      <td>
                        <strong>{lab.name}</strong>
                        {lab.licenseNumber && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Lic: {lab.licenseNumber}</div>
                        )}
                      </td>
                      <td>
                        <span className="card-id-badge">{lab.labCode}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={12} color="#64748b" />
                          {lab.city}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#334155',
                          }}
                        >
                          {lab.category}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {(lab.accreditations || []).map((acc) => (
                            <span
                              key={acc}
                              style={{
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: '#ecfdf5',
                                color: '#047857',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              {acc}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                        <Clock size={12} style={{ marginRight: 4 }} />
                        {lab.operatingHours || '08:00 AM - 08:00 PM'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#334155' }}>
                        <Phone size={12} style={{ marginRight: 4 }} />
                        {lab.phone}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="super-btn-secondary"
                          onClick={() => navigate('/partnered-labs')}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 4: REGISTERED PATIENTS & MEDY CARDS
          ------------------------------------------------------------------------- */}
      {activeTab === 'patients' && (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Registered Patients & Medy Health Cards ({filteredPatients.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Patients enrolled through or receiving care at {hospital.name}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '240px' }}>
                <Search size={15} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search name, phone, card..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => navigate('/patients')}
                style={{ fontSize: '0.825rem' }}
              >
                Go to Patients Portal
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Demographics</th>
                  <th>Contact Phone</th>
                  <th>Email Address</th>
                  <th>Assigned Medy Card</th>
                  <th>Application Status</th>
                  <th>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No Registered Patients Found</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        Patients enrolled via the public portal or hospital admissions will appear here.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p._id || p.phone}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>
                        {p.age ? `${p.age} yrs` : '—'} &bull; {p.gender || '—'}
                      </td>
                      <td>
                        <Phone size={12} style={{ marginRight: 4 }} />
                        {p.phone}
                      </td>
                      <td>{p.email || '—'}</td>
                      <td>
                        {p.cardId ? (
                          <span
                            className="card-id-badge"
                            style={{
                              background: currentColor ? `${currentColor}15` : undefined,
                              borderColor: currentColor ? `${currentColor}40` : undefined,
                              color: currentColor || undefined,
                              fontWeight: 700,
                            }}
                          >
                            {p.cardId}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pending Card</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`super-status-pill ${
                            p.applicationStatus === 'Approved' || p.hasMedyCard ? 'active' : 'inactive'
                          }`}
                        >
                          <span className="status-dot"></span>
                          {p.hasMedyCard ? 'Card Active' : p.applicationStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 5: DOCTOR APPOINTMENTS
          ------------------------------------------------------------------------- */}
      {activeTab === 'appointments' && (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Doctor Appointments ({filteredAppointments.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Consultations and clinical visits scheduled at {hospital.name}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '240px' }}>
                <Search size={15} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search patient, doctor, dept..."
                  value={appointmentSearch}
                  onChange={(e) => setAppointmentSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => navigate('/doctor-appointments')}
                style={{ fontSize: '0.825rem' }}
              >
                Go to Appointments
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient Name</th>
                  <th>Doctor & Department</th>
                  <th>Date & Time Slot</th>
                  <th>Patient Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Stethoscope size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No Appointments Scheduled Yet</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        Doctor consultations booked through Medy will be recorded here.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((ap) => (
                    <tr key={ap._id || ap.appointmentId}>
                      <td>
                        <span className="card-id-badge">{ap.appointmentId}</span>
                      </td>
                      <td>
                        <strong>{ap.patientName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {ap.patientAge} yrs &bull; {ap.patientGender}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{ap.doctorName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7' }}>{ap.department}</div>
                      </td>
                      <td>
                        <div>{ap.appointmentDate}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ap.timeSlot}</div>
                      </td>
                      <td>
                        <Phone size={12} style={{ marginRight: 4 }} />
                        {ap.patientPhone}
                      </td>
                      <td>
                        <span
                          className={`super-status-pill ${
                            ap.status === 'Completed' ? 'active' : ap.status === 'Scheduled' ? 'active' : 'inactive'
                          }`}
                        >
                          <span className="status-dot"></span>
                          {ap.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 6: DIAGNOSTIC LAB TESTS
          ------------------------------------------------------------------------- */}
      {activeTab === 'lab-tests' && (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Diagnostic Lab Tests & Bookings ({filteredLabTests.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Diagnostic orders scheduled for patients of {hospital.name}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '240px' }}>
                <Search size={15} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search booking, test, patient..."
                  value={labTestSearch}
                  onChange={(e) => setLabTestSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => navigate('/lab-tests')}
                style={{ fontSize: '0.825rem' }}
              >
                Go to Lab Tests Portal
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Patient Name</th>
                  <th>Diagnostic Test</th>
                  <th>Assigned Partner Lab</th>
                  <th>Scheduled Date</th>
                  <th>Report Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabTests.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Activity size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No Lab Tests Booked Yet</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        When patients book pathology or diagnostic tests, they will be tracked here.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLabTests.map((t) => (
                    <tr key={t._id || t.testBookingId}>
                      <td>
                        <span className="card-id-badge">{t.testBookingId}</span>
                      </td>
                      <td>
                        <strong>{t.patientName}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          <Phone size={11} style={{ marginRight: 3 }} />
                          {t.patientPhone}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.testName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {t.testCode}</div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#0369a1' }}>
                          <FlaskConical size={13} />
                          {t.assignedLabName || 'Network Laboratory'}
                        </span>
                      </td>
                      <td>
                        {t.scheduledDate || '—'} {t.timeSlot ? `• ${t.timeSlot}` : ''}
                      </td>
                      <td>
                        <span
                          className={`super-status-pill ${
                            t.status === 'Report Completed' ? 'active' : 'inactive'
                          }`}
                        >
                          <span className="status-dot"></span>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TAB 7: AUDIT TRAIL & SECURITY HISTORY
          ------------------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Audit Trail & Facility History ({filteredAuditLogs.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Complete audit trail of system modifications and events concerning {hospital.name}.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '240px' }}>
                <Search size={15} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search action, actor, details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => navigate('/audit-logs')}
                style={{ fontSize: '0.825rem' }}
              >
                Go to Global Audit Logs
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor Email</th>
                  <th>Target Facility</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Clock size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                      <div style={{ fontWeight: 600, color: '#334155' }}>No Audit Trail Records Found</div>
                      <div style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                        Administrative actions for this hospital will be permanently recorded here.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString('en-GB')}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#0f172a',
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#334155' }}>{log.actor}</td>
                      <td style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{log.target}</td>
                      <td style={{ fontSize: '0.82rem', color: '#475569' }}>{log.details}</td>
                      <td>
                        <span
                          className={`super-status-pill ${
                            log.status === 'Success' ? 'active' : 'inactive'
                          }`}
                        >
                          <span className="status-dot"></span>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: EDIT HOSPITAL DETAILS
          ========================================================================= */}
      {isEditOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <div
            className="super-modal"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="#0284c7" />
                <h3 style={{ margin: 0 }}>Edit Hospital Facility</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="super-modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
                {editError && (
                  <div
                    style={{
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      color: '#b91c1c',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      marginBottom: '1rem',
                    }}
                  >
                    {editError}
                  </div>
                )}

                <div className="super-form-group">
                  <label className="super-label">
                    Hospital Official Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="super-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="super-form-group">
                    <label className="super-label">
                      Facility Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="super-input"
                      value={editForm.code}
                      onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="super-form-group">
                    <label className="super-label">
                      City / Region <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="super-input"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="super-form-group">
                    <label className="super-label">
                      Primary Phone <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="super-input"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="super-form-group">
                    <label className="super-label">Official Email</label>
                    <input
                      type="email"
                      className="super-input"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="super-form-group">
                  <label className="super-label">Physical Address</label>
                  <textarea
                    rows={3}
                    className="super-input"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  />
                </div>

                <div className="super-form-group">
                  <label className="super-label">Operational Status</label>
                  <select
                    className="super-select-dropdown"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="Active">Active Facility</option>
                    <option value="Inactive">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setIsEditOpen(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving Changes...' : 'Save Hospital Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDetails;

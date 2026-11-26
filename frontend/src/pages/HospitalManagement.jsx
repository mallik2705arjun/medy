import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Users,
  UserCheck,
  Power,
  X,
  Check,
  ArrowLeft,
  Trash2,
  Eye,
  AlertTriangle,
  FlaskConical,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HospitalManagement = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected hospital for viewing patient records
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [allPatients, setAllPatients] = useState([]);

  // Modal states for full CRUD
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [viewingHospital, setViewingHospital] = useState(null);
  const [deletingHospital, setDeletingHospital] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Hospital form state
  const [hospitalForm, setHospitalForm] = useState({
    name: '',
    code: '',
    city: '',
    phone: '',
    email: '',
    address: '',
    adminName: '',
    adminEmail: '',
  });

  // Fetch hospitals and patients
  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      const [hospRes, dashRes] = await Promise.all([
        fetch('/api/hospitals', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
        fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
      ]);

      if (hospRes.ok) {
        const data = await hospRes.json();
        setHospitals(data || []);
      }
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setAllPatients(dashData.patients || []);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) {
      fetchHospitalData();
    }
  }, [admin]);

  // Handle register hospital (CREATE)
  const handleRegisterHospital = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(hospitalForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to register hospital');

      setHospitalForm({
        name: '',
        code: '',
        city: '',
        phone: '',
        email: '',
        address: '',
        adminName: '',
        adminEmail: '',
      });
      setIsRegisterOpen(false);
      const emailNotice = data.emailNotification?.success
        ? ` • Appointment email dispatched to ${data.assignedAdmin?.email}`
        : data.assignedAdmin
        ? ` • Administrator appointed (${data.assignedAdmin.email})`
        : '';
      setSuccessMessage(`Hospital "${data.name}" registered successfully!${emailNotice}`);
      setTimeout(() => setSuccessMessage(''), 5500);
      fetchHospitalData();
    } catch (err) {
      setFormError(err.message || 'Error creating hospital');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update hospital (UPDATE)
  const handleUpdateHospital = async (e) => {
    e.preventDefault();
    if (!editingHospital) return;
    setFormError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/hospitals/${editingHospital._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(editingHospital),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update hospital');

      setSuccessMessage(`Hospital "${editingHospital.name}" updated successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setEditingHospital(null);
      fetchHospitalData();
    } catch (err) {
      setFormError(err.message || 'Error updating hospital');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Activate / Deactivate Toggle (UPDATE STATUS)
  const handleToggleStatus = async (hospital) => {
    const newStatus = hospital.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/hospitals/${hospital._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setHospitals((prev) =>
          prev.map((h) => (h._id === hospital._id ? { ...h, status: newStatus } : h))
        );
        if (selectedHospital?._id === hospital._id) {
          setSelectedHospital((prev) => ({ ...prev, status: newStatus }));
        }
        if (viewingHospital?._id === hospital._id) {
          setViewingHospital((prev) => ({ ...prev, status: newStatus }));
        }
        setSuccessMessage(`Hospital "${hospital.name}" is now ${newStatus}.`);
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error toggling hospital status:', err);
    }
  };

  // Handle Delete Hospital (DELETE)
  const handleDeleteHospital = async (force = false) => {
    if (!deletingHospital) return;
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const url = `/api/hospitals/${deletingHospital._id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin?.token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete hospital facility');
      }

      setHospitals((prev) => prev.filter((h) => h._id !== deletingHospital._id));
      if (selectedHospital?._id === deletingHospital._id) {
        setSelectedHospital(null);
      }
      if (viewingHospital?._id === deletingHospital._id) {
        setViewingHospital(null);
      }
      setSuccessMessage(`Hospital "${deletingHospital.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setDeletingHospital(null);
    } catch (err) {
      setDeleteError(err.message || 'Error deleting hospital facility');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered hospitals
  const filteredHospitals = hospitals.filter((h) => {
    const matchStatus = statusFilter === 'All' || h.status === statusFilter;
    const matchSearch =
      (h.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (h.phone || '').includes(search);
    return matchStatus && matchSearch;
  });

  const activeCount = hospitals.filter((h) => h.status === 'Active').length;
  const inactiveCount = hospitals.filter((h) => h.status === 'Inactive').length;

  return (
    <div className="super-dashboard">
      {/* Page Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Hospital Management</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Create, view, update, activate and deactivate network hospitals
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <button
            className="super-btn-primary"
            onClick={() => {
              setFormError('');
              setIsRegisterOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Create Hospital</span>
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* KPI Metric Cards (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => {
            setSelectedHospital(null);
            setStatusFilter('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: !selectedHospital && statusFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: !selectedHospital && statusFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: !selectedHospital && statusFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.2)' : 'none',
            transform: !selectedHospital && statusFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all partner hospitals"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Hospitals</span>
            <span className="super-metric-value">{hospitals.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: !selectedHospital && statusFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: !selectedHospital && statusFilter === 'All' ? 700 : 500,
              }}
            >
              {!selectedHospital && statusFilter === 'All' ? '● Active: All Hospitals' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)', color: '#fff' }}>
            <Building2 size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => {
            setSelectedHospital(null);
            setStatusFilter('Active');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: !selectedHospital && statusFilter === 'Active' ? '2px solid #16a34a' : '1px solid #eaeff5',
            background: !selectedHospital && statusFilter === 'Active' ? '#f0fdf4' : '#ffffff',
            boxShadow: !selectedHospital && statusFilter === 'Active' ? '0 4px 16px rgba(22, 163, 74, 0.16)' : 'none',
            transform: !selectedHospital && statusFilter === 'Active' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter active operational hospitals"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Facilities</span>
            <span className="super-metric-value" style={{ color: '#16a34a' }}>
              {activeCount}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: !selectedHospital && statusFilter === 'Active' ? '#16a34a' : '#64748b',
                fontWeight: !selectedHospital && statusFilter === 'Active' ? 700 : 500,
              }}
            >
              {!selectedHospital && statusFilter === 'Active' ? '● Active: Operational' : 'Click to filter active'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#16a34a', color: '#fff' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => {
            setSelectedHospital(null);
            setStatusFilter('Inactive');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: !selectedHospital && statusFilter === 'Inactive' ? '2px solid #dc2626' : '1px solid #eaeff5',
            background: !selectedHospital && statusFilter === 'Inactive' ? '#fef2f2' : '#ffffff',
            boxShadow: !selectedHospital && statusFilter === 'Inactive' ? '0 4px 16px rgba(220, 38, 38, 0.16)' : 'none',
            transform: !selectedHospital && statusFilter === 'Inactive' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter deactivated / paused hospitals"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Deactivated / Paused</span>
            <span className="super-metric-value" style={{ color: '#dc2626' }}>
              {inactiveCount}
            </span>
            <span
              className="super-metric-trend negative"
              style={{
                color: !selectedHospital && statusFilter === 'Inactive' ? '#dc2626' : '#64748b',
                fontWeight: !selectedHospital && statusFilter === 'Inactive' ? 700 : 500,
              }}
            >
              {!selectedHospital && statusFilter === 'Inactive' ? '● Active: Deactivated' : 'Click to filter paused'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#dc2626', color: '#fff' }}>
            <XCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main Content Area: Hospitals List or Selected Hospital Detail */}
      {selectedHospital ? (
        /* Hospital Drill-down Patient View */
        <div className="super-panel-card">
          <div className="panel-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="super-btn-secondary"
                onClick={() => setSelectedHospital(null)}
              >
                <ArrowLeft size={16} />
                <span>Back to All Hospitals</span>
              </button>
              <div>
                <h3 style={{ margin: 0 }}>{selectedHospital.name}</h3>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {selectedHospital.city} • {selectedHospital.phone} • {selectedHospital.email}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                type="button"
                className="super-btn-primary"
                onClick={() => navigate(`/hospitals/${selectedHospital._id}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem' }}
              >
                <Eye size={14} />
                <span>Open Full Hospital Page</span>
              </button>
              <span className={`super-status-pill ${selectedHospital.status === 'Active' ? 'active' : 'inactive'}`}>
                <span className="status-dot"></span>
                {selectedHospital.status}
              </span>
            </div>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            <div className="table-responsive">
              <table className="super-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Demographics</th>
                    <th>Contact Phone</th>
                    <th>Assigned Medy Card</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allPatients
                    .filter(
                      (p) =>
                        (p.hospitalName || '').toLowerCase().trim() ===
                        (selectedHospital.name || '').toLowerCase().trim()
                    )
                    .map((p) => (
                      <tr key={p.id || p.phone}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.age} yrs • {p.gender}</td>
                        <td>{p.phone}</td>
                        <td>
                          {p.cardId ? (
                            <span className="card-id-badge">{p.cardId}</span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString('en-GB')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Full Hospitals Directory Table */
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h3>Partner Hospital Facilities ({filteredHospitals.length})</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div className="super-nav-search" style={{ width: '260px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search hospital name, city, code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Hospital Name & Address</th>
                  <th>Facility Code</th>
                  <th>City / Region</th>
                  <th>Contact Information</th>
                  <th>Registered Patients</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((hosp) => {
                  const patientCount = allPatients.filter(
                    (p) =>
                      (p.hospitalName || '').toLowerCase().trim() ===
                      (hosp.name || '').toLowerCase().trim()
                  ).length;

                  return (
                    <tr key={hosp._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span
                            onClick={() => navigate(`/hospitals/${hosp._id}`)}
                            style={{
                              fontWeight: 700,
                              color: '#0284c7',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#0369a1')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#0284c7')}
                            title="Click to view full details and records for this hospital"
                          >
                            <Building2 size={15} style={{ flexShrink: 0 }} />
                            <span>{hosp.name}</span>
                          </span>
                        </div>
                        {hosp.address && (
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {hosp.address}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="card-id-badge"
                          onClick={() => navigate(`/hospitals/${hosp._id}`)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full hospital details"
                        >
                          {hosp.code}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={13} color="#64748b" />
                          {hosp.city}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                          <div><Phone size={12} style={{ marginRight: 4 }} />{hosp.phone}</div>
                          {hosp.email && <div><Mail size={12} style={{ marginRight: 4 }} />{hosp.email}</div>}
                        </div>
                      </td>
                      <td>
                        <button
                          className="super-btn-secondary"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => navigate(`/hospitals/${hosp._id}?tab=patients`)}
                          title="Click to view all patients registered at this hospital"
                        >
                          <Users size={13} />
                          <span>{patientCount} Patients</span>
                        </button>
                      </td>
                      <td>
                        <span
                          className={`super-status-pill ${hosp.status === 'Active' ? 'active' : 'inactive'
                            }`}
                        >
                          <span className="status-dot"></span>
                          {hosp.status || 'Active'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {/* 1. READ / View Full Details Page */}
                          <button
                            type="button"
                            className="action-icon-btn edit"
                            onClick={() => navigate(`/hospitals/${hosp._id}`)}
                            title="Open Full Hospital Details & Dossier"
                            style={{ color: '#0284c7', background: '#e0f2fe' }}
                          >
                            <Eye size={15} />
                          </button>

                          {/* 2. Hospital Administrators */}
                          <button
                            type="button"
                            className="action-icon-btn edit"
                            onClick={() => navigate(`/hospital-admins?hospitalId=${hosp._id}`)}
                            title="Manage Administrators for this Hospital"
                            style={{ color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd' }}
                          >
                            <UserCheck size={15} />
                          </button>

                          {/* 3. UPDATE / Edit Details */}
                          <button
                            type="button"
                            className="action-icon-btn edit"
                            onClick={() => {
                              setFormError('');
                              setEditingHospital({ ...hosp });
                            }}
                            title="Edit Hospital Details"
                            style={{ color: '#0f172a', background: '#f1f5f9' }}
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* 4. UPDATE / Activate / Deactivate Toggle */}
                          <button
                            type="button"
                            className={`action-icon-btn ${hosp.status === 'Active' ? 'delete' : 'edit'}`}
                            onClick={() => handleToggleStatus(hosp)}
                            title={
                              hosp.status === 'Active'
                                ? 'Deactivate Hospital Facility'
                                : 'Activate Hospital Facility'
                            }
                            style={{
                              background: hosp.status === 'Active' ? '#fef2f2' : '#f0fdf4',
                              color: hosp.status === 'Active' ? '#dc2626' : '#16a34a',
                              padding: '0.35rem 0.55rem',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                            }}
                          >
                            <Power size={13} />
                            <span>{hosp.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                          </button>

                          {/* 5. DELETE / Remove Facility */}
                          <button
                            type="button"
                            className="action-icon-btn delete"
                            onClick={() => {
                              setDeleteError('');
                              setDeletingHospital(hosp);
                            }}
                            title="Delete Hospital Facility"
                            style={{ color: '#ef4444', background: '#fef2f2' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REGISTER HOSPITAL MODAL */}
      {isRegisterOpen && (
        <div className="super-modal-backdrop">
          <div className="super-modal-card" style={{ maxWidth: '520px' }}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="#0284c7" />
                <h3>Register Healthcare Facility</h3>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => setIsRegisterOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem 1.5rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleRegisterHospital}>
              <div className="super-modal-body">
                <div className="form-group">
                  <label>Hospital / Clinic Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Care Multi-Specialty Hospital"
                    value={hospitalForm.name}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Hospital Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HOSP-MCH"
                      value={hospitalForm.code}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, code: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>City / Region *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={hospitalForm.city}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, city: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 22 2847 9000"
                      value={hospitalForm.phone}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Official Email</label>
                    <input
                      type="email"
                      placeholder="info@metrocare.com"
                      value={hospitalForm.email}
                      onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Physical Address</label>
                  <input
                    type="text"
                    placeholder="Plot 45, Sector 8, Healthcare Boulevard"
                    value={hospitalForm.address}
                    onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })}
                  />
                </div>

                {/* Hospital Administrator Appointment & Nodemailer Section */}
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '1.1rem',
                  marginTop: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: '#0369a1', fontWeight: 600, fontSize: '0.85rem' }}>
                    <Mail size={16} />
                    <span>Appoint Hospital Administrator (Nodemailer Notification)</span>
                  </div>
                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.78rem', color: '#0284c7', lineHeight: 1.45 }}>
                    Enter the email of the hospital administrator. Upon registering this facility, Nodemailer will automatically dispatch an official appointment notice with login credentials to their inbox.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                        Admin Email (Recipient) *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="admin@hospital.com"
                        value={hospitalForm.adminEmail}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, adminEmail: e.target.value })}
                        style={{ background: '#ffffff' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0f172a' }}>
                        Admin Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={hospitalForm.adminName}
                        onChange={(e) => setHospitalForm({ ...hospitalForm, adminName: e.target.value })}
                        style={{ background: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setIsRegisterOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={submitting}
                >
                  <Plus size={16} />
                  <span>{submitting ? 'Registering...' : 'Register Hospital'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT HOSPITAL MODAL */}
      {editingHospital && (
        <div className="super-modal-backdrop">
          <div className="super-modal-card" style={{ maxWidth: '520px' }}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="#0284c7" />
                <h3>Edit Facility: {editingHospital.name}</h3>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => setEditingHospital(null)}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem 1.5rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUpdateHospital}>
              <div className="super-modal-body">
                <div className="form-group">
                  <label>Hospital Name</label>
                  <input
                    type="text"
                    required
                    value={editingHospital.name}
                    onChange={(e) => setEditingHospital({ ...editingHospital, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Facility Code</label>
                    <input
                      type="text"
                      required
                      value={editingHospital.code}
                      onChange={(e) => setEditingHospital({ ...editingHospital, code: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>City / Location</label>
                    <input
                      type="text"
                      required
                      value={editingHospital.city}
                      onChange={(e) => setEditingHospital({ ...editingHospital, city: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editingHospital.phone}
                      onChange={(e) => setEditingHospital({ ...editingHospital, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editingHospital.email || ''}
                      onChange={(e) => setEditingHospital({ ...editingHospital, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Physical Address</label>
                  <input
                    type="text"
                    value={editingHospital.address || ''}
                    onChange={(e) => setEditingHospital({ ...editingHospital, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setEditingHospital(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={submitting}
                >
                  <Check size={16} />
                  <span>{submitting ? 'Saving...' : 'Save Updates'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW HOSPITAL DETAILS MODAL (READ) */}
      {viewingHospital && (
        <div className="super-modal-backdrop" onClick={() => setViewingHospital(null)}>
          <div className="super-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{viewingHospital.name}</h3>
                    <span
                      className={`super-status-pill ${viewingHospital.status === 'Active' ? 'active' : 'inactive'
                        }`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      <span className="status-dot"></span>
                      {viewingHospital.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Facility Code: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{viewingHospital.code}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setViewingHospital(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Demographics Grid */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #eaeff5',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>City / Region</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                    <MapPin size={13} color="#0284c7" />
                    <span>{viewingHospital.city}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Contact Phone</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                    <Phone size={13} color="#059669" />
                    <span>{viewingHospital.phone}</span>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Official Email</span>
                  <div style={{ fontWeight: 500, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                    <Mail size={13} color="#64748b" />
                    <span>{viewingHospital.email || 'Not configured'}</span>
                  </div>
                </div>

                {viewingHospital.address && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Physical Address</span>
                    <div style={{ fontWeight: 500, color: '#334155', marginTop: '0.15rem', fontSize: '0.85rem' }}>
                      {viewingHospital.address}
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Registered Patients</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7', marginTop: '0.2rem' }}>
                    {allPatients.filter(
                      (p) => (p.hospitalName || '').toLowerCase().trim() === (viewingHospital.name || '').toLowerCase().trim()
                    ).length}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>Network Status</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d', marginTop: '0.2rem' }}>
                    {viewingHospital.status}
                  </div>
                </div>
              </div>
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-primary"
                onClick={() => {
                  const h = viewingHospital;
                  setViewingHospital(null);
                  navigate(`/hospitals/${h._id}`);
                }}
              >
                <Eye size={14} />
                <span>Open Full Hospital Page</span>
              </button>
              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => {
                  const h = viewingHospital;
                  setViewingHospital(null);
                  setEditingHospital({ ...h });
                }}
              >
                <Edit2 size={14} />
                <span>Edit Facility</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE HOSPITAL CONFIRMATION MODAL (DELETE) */}
      {deletingHospital && (
        <div className="super-modal-backdrop" onClick={() => !deleteLoading && setDeletingHospital(null)}>
          <div className="super-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="super-modal-header" style={{ borderBottom: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#991b1b' }}>Delete Hospital</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {deletingHospital.name} ({deletingHospital.code})
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setDeletingHospital(null)}
                disabled={deleteLoading}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Are you sure you want to permanently delete <strong>{deletingHospital.name}</strong> from the Medy healthcare network?
              </p>

              {deleteError && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                    lineHeight: '1.4',
                  }}
                >
                  {deleteError}
                </div>
              )}

              {(() => {
                const pCount = allPatients.filter(
                  (p) =>
                    (p.hospitalName || '').toLowerCase().trim() ===
                    (deletingHospital.name || '').toLowerCase().trim()
                ).length;
                if (pCount > 0) {
                  return (
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '8px',
                        color: '#92400e',
                        fontSize: '0.825rem',
                        lineHeight: '1.4',
                      }}
                    >
                      ⚠️ <strong>Warning:</strong> This hospital currently has <strong>{pCount}</strong> registered patient records. You can force delete or deactivate the facility instead.
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => setDeletingHospital(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              {deleteError && deleteError.includes('force') ? (
                <button
                  type="button"
                  className="super-btn-primary"
                  onClick={() => handleDeleteHospital(true)}
                  disabled={deleteLoading}
                  style={{ background: '#dc2626', borderColor: '#dc2626' }}
                >
                  <Trash2 size={15} />
                  <span>{deleteLoading ? 'Deleting...' : 'Force Delete'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="super-btn-primary"
                  onClick={() => handleDeleteHospital(false)}
                  disabled={deleteLoading}
                  style={{ background: '#dc2626', borderColor: '#dc2626' }}
                >
                  <Trash2 size={15} />
                  <span>{deleteLoading ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManagement;


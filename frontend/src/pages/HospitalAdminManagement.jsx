import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UserCheck,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Power,
  Check,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AVATAR = '';

const HospitalAdminManagement = () => {
  const { admin } = useAuth();
  const [searchParams] = useSearchParams();

  const [admins, setAdmins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState(searchParams.get('hospitalId') || 'All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(searchParams.get('action') === 'create');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeAdmin, setActiveAdmin] = useState(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ type: null, message: '' });

  // Create form state
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    username: '',
    phone: '',
    hospitalId: '',
    designation: 'Hospital Administrator',
    status: 'Active',
    avatar: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    hospitalId: '',
    designation: 'Hospital Administrator',
    status: 'Active',
    avatar: '',
    password: '',
  });

  const [showEditPassword, setShowEditPassword] = useState(false);

  // Fetch all hospital admins & hospitals
  const fetchData = async () => {
    try {
      setLoading(true);
      const [adminsRes, hospRes] = await Promise.all([
        fetch('/api/hospital-admins', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
        fetch('/api/hospitals', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
      ]);

      if (adminsRes.ok) {
        const data = await adminsRes.json();
        setAdmins(data || []);
      }
      if (hospRes.ok) {
        const hospData = await hospRes.json();
        setHospitals(hospData || []);
        if (hospData.length > 0 && !createForm.hospitalId) {
          setCreateForm((prev) => ({ ...prev, hospitalId: hospData[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [admin]);

  // Generate strong random password for edit/reset
  const handleGenerateEditPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditForm((prev) => ({ ...prev, password: pass }));
    setShowEditPassword(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormFeedback({ type: null, message: '' });
    setCreateForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'Hospital Administrator',
      hospitalId: hospitals[0]?._id || '',
      status: 'Active',
    });
    setIsCreateOpen(true);
  };

  // Handle Create Submit
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setFormFeedback({ type: null, message: '' });

    if (!createForm.fullName.trim()) {
      setFormFeedback({ type: 'error', message: 'Full name is required.' });
      return;
    }
    if (!createForm.email.trim() || !createForm.email.includes('@')) {
      setFormFeedback({ type: 'error', message: 'A valid email address is required.' });
      return;
    }
    if (!createForm.hospitalId) {
      setFormFeedback({ type: 'error', message: 'Please select an assigned hospital.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone ? createForm.phone.trim() : '+91 98765 00000',
        role: 'HOSPITAL_ADMIN',
        designation: createForm.role || 'Hospital Administrator',
        hospitalId: createForm.hospitalId,
        status: createForm.status || 'Active',
      };

      const res = await fetch('/api/hospital-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create hospital administrator');
      }

      const emailNotice = data.emailNotification?.success
        ? ` • Appointment email dispatched to ${data.email} via Nodemailer`
        : '';
      setFormFeedback({
        type: 'success',
        message: `Hospital Administrator ${data.fullName} (${data.adminId}) created successfully!${emailNotice}`,
      });

      fetchData();
      setTimeout(() => {
        setIsCreateOpen(false);
      }, 1400);
    } catch (err) {
      setFormFeedback({ type: 'error', message: err.message || 'Server error creating admin' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setActiveAdmin(item);
    setFormFeedback({ type: null, message: '' });
    setEditForm({
      fullName: item.fullName || '',
      phone: item.phone || '',
      hospitalId: item.hospitalId?._id || item.hospitalId || '',
      designation: item.designation || 'Hospital Administrator',
      status: item.status || 'Active',
      avatar: item.avatar || '',
      password: '',
    });
    setShowEditPassword(false);
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditAdmin = async (e) => {
    e.preventDefault();
    if (!activeAdmin) return;
    setFormFeedback({ type: null, message: '' });

    if (editForm.password && editForm.password.trim().length > 0 && editForm.password.trim().length < 6) {
      setFormFeedback({
        type: 'error',
        message: 'Password must be at least 6 characters long if you wish to reset it.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/hospital-admins/${activeAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update hospital administrator');
      }

      setFormFeedback({
        type: 'success',
        message: `Hospital Administrator ${data.fullName} updated successfully!`,
      });

      fetchData();
      setTimeout(() => {
        setIsEditOpen(false);
      }, 1200);
    } catch (err) {
      setFormFeedback({ type: 'error', message: err.message || 'Update failed' });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (item) => {
    try {
      const res = await fetch(`/api/hospital-admins/${item._id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to toggle status');
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Network error when updating status');
    }
  };

  // Handle Delete
  const handleDeleteAdmin = async () => {
    if (!activeAdmin) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hospital-admins/${activeAdmin._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      if (res.ok) {
        setIsDeleteOpen(false);
        setActiveAdmin(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Network error deleting administrator');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter admins
  const filteredAdmins = admins.filter((a) => {
    const matchHospital =
      hospitalFilter === 'All' ||
      String(a.hospitalId?._id || a.hospitalId) === hospitalFilter ||
      a.hospitalName === hospitalFilter;

    const matchStatus = statusFilter === 'All' || a.status === statusFilter;

    const q = search.toLowerCase();
    const matchSearch =
      (a.fullName || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q) ||
      (a.username || '').toLowerCase().includes(q) ||
      (a.adminId || '').toLowerCase().includes(q) ||
      (a.hospitalName || '').toLowerCase().includes(q) ||
      (a.designation || '').toLowerCase().includes(q);

    return matchHospital && matchStatus && matchSearch;
  });

  // KPI Calculations
  const totalAdmins = admins.length;
  const activeCount = admins.filter((a) => a.status === 'Active').length;
  const uniqueHospitalsCovered = new Set(admins.map((a) => a.hospitalName)).size;

  return (
    <div className="super-dashboard">
      {/* Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <UserCheck size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Hospital Admin Management</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Super Admin authority to provision, credential, and supervise hospital administrators network-wide
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="super-btn-primary"
            onClick={openCreateModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Create Hospital Admin</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => {
            setStatusFilter('All');
            setHospitalFilter('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'All' && hospitalFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: statusFilter === 'All' && hospitalFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: statusFilter === 'All' && hospitalFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.2)' : 'none',
            transform: statusFilter === 'All' && hospitalFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all hospital administrators"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Provisioned Hospital Admins</span>
            <span className="super-metric-value">{totalAdmins}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: statusFilter === 'All' && hospitalFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: statusFilter === 'All' && hospitalFilter === 'All' ? 700 : 500,
              }}
            >
              {statusFilter === 'All' && hospitalFilter === 'All' ? '● Active: All Admins' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <UserCheck size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('Active')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Active' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: statusFilter === 'Active' ? '#f0fdf4' : '#ffffff',
            boxShadow: statusFilter === 'Active' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: statusFilter === 'Active' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter active administrators"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Administrators</span>
            <span className="super-metric-value">{activeCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: statusFilter === 'Active' ? '#059669' : '#64748b',
                fontWeight: statusFilter === 'Active' ? 700 : 500,
              }}
            >
              {statusFilter === 'Active' ? '● Active: Active Only' : 'Click to filter active'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setHospitalFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: hospitalFilter !== 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: hospitalFilter !== 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: hospitalFilter !== 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
          }}
          title="Click to reset hospital filter"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Covered Hospitals</span>
            <span className="super-metric-value">{uniqueHospitalsCovered}</span>
            <span className="super-metric-trend positive" style={{ color: '#0284c7' }}>Healthcare Facilities</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <Building2 size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter(statusFilter === 'Inactive' ? 'All' : 'Inactive')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Inactive' ? '2px solid #ef4444' : '1px solid #eaeff5',
            background: statusFilter === 'Inactive' ? '#fef2f2' : '#ffffff',
            boxShadow: statusFilter === 'Inactive' ? '0 4px 16px rgba(239, 68, 68, 0.16)' : 'none',
          }}
          title="Click to toggle inactive administrators filter"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Inactive / Suspended</span>
            <span className="super-metric-value" style={{ color: statusFilter === 'Inactive' ? '#ef4444' : '#0f172a' }}>
              {totalAdmins - activeCount}
            </span>
            <span
              className="super-metric-trend"
              style={{
                color: statusFilter === 'Inactive' ? '#ef4444' : '#64748b',
                fontWeight: statusFilter === 'Inactive' ? 700 : 500,
              }}
            >
              {statusFilter === 'Inactive' ? '● Active: Inactive' : 'Click to filter inactive'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Shield size={22} />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="super-panel-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Input */}
            <div className="super-nav-search" style={{ minWidth: '280px', flex: 1 }}>
              <Search size={16} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search by name, email, admin ID, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Hospital Filter */}
            <select
              className="super-select-dropdown"
              value={hospitalFilter}
              onChange={(e) => setHospitalFilter(e.target.value)}
            >
              <option value="All">All Hospitals ({hospitals.length})</option>
              {hospitals.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.code})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="super-select-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Admins Table */}
        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Assigned Hospital</th>
                <th>Contact Info</th>
                <th>Designation & Role</th>
                <th>Status</th>
                <th>Date Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    Loading hospital administrators...
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
                      <UserCheck size={32} style={{ color: '#94a3b8' }} />
                      <div>No hospital administrators found matching your filter criteria.</div>
                      <button
                        type="button"
                        className="super-btn-primary"
                        onClick={openCreateModal}
                        style={{ marginTop: '0.25rem', fontSize: '0.82rem' }}
                      >
                        + Create First Hospital Admin
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((item) => (
                  <tr key={item._id}>
                    {/* Administrator column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#e0f2fe',
                            border: '1.5px solid #bae6fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0284c7',
                            flexShrink: 0,
                          }}
                        >
                          <User size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a' }}>
                            {item.fullName}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '4px',
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                              }}
                            >
                              {item.adminId || 'HADM-000'}
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              @{item.username}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Hospital column */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#0f172a' }}>
                            {item.hospitalName || item.hospitalId?.name || 'Medy Hospital'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Code: {item.hospitalCode || item.hospitalId?.code || 'N/A'} &bull;{' '}
                            {item.hospitalId?.city || 'India'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#0f172a' }}>
                          <Mail size={13} style={{ color: '#94a3b8' }} />
                          <span>{item.email}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: '#64748b' }}>
                          <Phone size={13} style={{ color: '#94a3b8' }} />
                          <span>{item.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Designation & Role */}
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b' }}>
                          {item.designation || 'Hospital Administrator'}
                        </div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '5px',
                            background: '#e0f2fe',
                            color: '#0284c7',
                            border: '1px solid #bae6fd',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            marginTop: '0.2rem',
                          }}
                        >
                          <ShieldCheck size={11} /> {item.role || 'HOSPITAL_ADMIN'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`super-status-pill ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                        <span className="status-dot" />
                        {item.status || 'Active'}
                      </span>
                    </td>

                    {/* Date Joined */}
                    <td style={{ fontSize: '0.76rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(item.dateJoined || item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="action-icon-btn edit"
                          title="Edit Administrator"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn"
                          title={item.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                          onClick={() => handleToggleStatus(item)}
                          style={{
                            color: item.status === 'Active' ? '#f59e0b' : '#10b981',
                          }}
                        >
                          <Power size={15} />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn delete"
                          title="Revoke & Delete Administrator"
                          onClick={() => {
                            setActiveAdmin(item);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          MODAL: CREATE HOSPITAL ADMIN
          ========================================================================= */}
      {isCreateOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Create Hospital Administrator
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                    Provision root login credentials and assign to registered healthcare facility
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsCreateOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formFeedback.message && (
              <div
                style={{
                  margin: '1rem 1.25rem 0',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  background: formFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: formFeedback.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${formFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{formFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin}>
              <div
                className="super-modal-body"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Row 1: Full Name & Official Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Administrator Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Dr. Sarah Jenkins"
                      value={createForm.fullName}
                      onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="e.g. s.jenkins@apollo.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Phone Number & Hospital Admin Role */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Phone Number (Ph No.) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. +91 98765 43210"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Admin Role
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      className="form-control"
                      value="Hospital Administrator"
                      style={{
                        background: '#f8fafc',
                        color: '#0369a1',
                        fontWeight: 600,
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                {/* Row 3: Assigned Hospital */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Assigned Hospital Facility <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    className="super-select-dropdown"
                    style={{ width: '100%' }}
                    required
                    value={createForm.hospitalId}
                    onChange={(e) => setCreateForm({ ...createForm, hospitalId: e.target.value })}
                  >
                    <option value="" disabled>
                      Select Hospital...
                    </option>
                    {hospitals.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name} &bull; Code: {h.code} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nodemailer Email Notification Banner */}
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: '#0369a1',
                }}>
                  <Mail size={15} style={{ flexShrink: 0 }} />
                  <span>
                    A secure initial login password will be automatically generated and emailed to <strong>{createForm.email || 'this administrator'}</strong> via Nodemailer upon creation.
                  </span>
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={submitting}
                  style={{ minWidth: '150px' }}
                >
                  {submitting ? 'Provisioning...' : 'Provision Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT HOSPITAL ADMIN
          ========================================================================= */}
      {isEditOpen && activeAdmin && (
        <div className="super-modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} style={{ color: '#0284c7' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Edit Hospital Administrator
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                    {activeAdmin.adminId} &bull; {activeAdmin.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsEditOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formFeedback.message && (
              <div
                style={{
                  margin: '1rem 1.25rem 0',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  background: formFeedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: formFeedback.type === 'success' ? '#065f46' : '#991b1b',
                  border: `1px solid ${formFeedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{formFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleEditAdmin}>
              <div
                className="super-modal-body"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Administrator Full Name
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Admin Role
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      className="form-control"
                      value="Hospital Administrator"
                      style={{
                        background: '#f8fafc',
                        color: '#0369a1',
                        fontWeight: 600,
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Assigned Hospital
                    </label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={editForm.hospitalId}
                      onChange={(e) => setEditForm({ ...editForm, hospitalId: e.target.value })}
                    >
                      {hospitals.map((h) => (
                        <option key={h._id} value={h._id}>
                          {h.name} ({h.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Account Status
                    </label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                        Reset Password
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateEditPassword}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: 0,
                        }}
                      >
                        <KeyRound size={12} /> Auto-Generate
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Leave blank to preserve current password"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        style={{ paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                      Minimum 6 characters. Leave empty to preserve current password.
                    </span>
                  </div>
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={submitting}
                  style={{ minWidth: '130px' }}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE CONFIRMATION
          ========================================================================= */}
      {isDeleteOpen && activeAdmin && (
        <div className="super-modal-backdrop" onClick={() => setIsDeleteOpen(false)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '440px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-modal-header">
              <h3 style={{ color: '#dc2626' }}>Revoke Hospital Administrator</h3>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsDeleteOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="super-modal-body">
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                Are you sure you want to permanently revoke and purge the administrator account for{' '}
                <strong>{activeAdmin.fullName}</strong> ({activeAdmin.email}) assigned to{' '}
                <strong>{activeAdmin.hospitalName}</strong>?
              </p>
              <div
                style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem',
                  background: '#fef2f2',
                  borderRadius: '6px',
                  border: '1px solid #fecaca',
                  fontSize: '0.78rem',
                  color: '#991b1b',
                }}
              >
                This action is irreversible. The hospital administrator will immediately lose all platform access.
              </div>
            </div>
            <div className="super-modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                disabled={submitting}
                onClick={handleDeleteAdmin}
              >
                {submitting ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminManagement;


import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  Search,
  X,
  CheckCircle2,
  MapPin,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DoctorAppointments = () => {
  const { admin, logout } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [viewFilter, setViewFilter] = useState('All'); // 'All' | 'Confirmed' | 'Completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch Hospitals
  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals', {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals(data || []);
      }
    } catch (e) {
      console.error('Fetch hospitals error:', e);
    }
  };

  // Fetch Appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (e) {
      console.error('Fetch appointments error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) {
      fetchHospitals();
      fetchAppointments();
    }
  }, [admin]);

  // Appointments scoped by hospital (strictly excluding cancelled visits)
  const nonCancelledAppointments = useMemo(() => {
    return appointments.filter((a) => a.status !== 'Cancelled');
  }, [appointments]);

  const hospitalScopedAppointments = useMemo(() => {
    if (hospitalFilter === 'All') return nonCancelledAppointments;
    return nonCancelledAppointments.filter(
      (a) => (a.hospitalName || '').trim().toLowerCase() === hospitalFilter.trim().toLowerCase()
    );
  }, [nonCancelledAppointments, hospitalFilter]);

  // Platform KPIs
  const stats = useMemo(() => {
    const activeHospitalsWithBookings = new Set(
      nonCancelledAppointments.map((a) => (a.hospitalName || '').trim().toLowerCase())
    ).size;

    return {
      total: hospitalScopedAppointments.length,
      confirmed: hospitalScopedAppointments.filter((a) => a.status === 'Confirmed').length,
      completed: hospitalScopedAppointments.filter((a) => a.status === 'Completed').length,
      hospitalsCount: hospitalFilter === 'All' ? activeHospitalsWithBookings : 1,
    };
  }, [nonCancelledAppointments, hospitalScopedAppointments, hospitalFilter]);

  // Filtered appointments to display
  const displayedAppointments = useMemo(() => {
    return hospitalScopedAppointments.filter((apt) => {
      if (viewFilter === 'Confirmed' && apt.status !== 'Confirmed') return false;
      if (viewFilter === 'Completed' && apt.status !== 'Completed') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          (apt.patientName || '').toLowerCase().includes(q) ||
          (apt.doctorName || '').toLowerCase().includes(q) ||
          (apt.department || '').toLowerCase().includes(q) ||
          (apt.hospitalName || '').toLowerCase().includes(q) ||
          (apt.patientPhone || '').includes(q) ||
          (apt.appointmentId || '').toLowerCase().includes(q) ||
          (apt.tokenNumber || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [hospitalScopedAppointments, viewFilter, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="super-dashboard">
      {/* 1. Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Calendar size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Appointments</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Monitor and audit doctor appointments across partner hospitals
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <select
            className="super-select-dropdown"
            value={hospitalFilter}
            onChange={(e) => setHospitalFilter(e.target.value)}
          >
            <option value="All">All Network Hospitals ({hospitals.length})</option>
            {hospitals.map((hosp) => (
              <option key={hosp._id || hosp.name} value={hosp.name}>
                {hosp.name} — {hosp.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Medy Admin 4-Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => setViewFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: viewFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: viewFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: viewFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: viewFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all appointments"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Appointments</span>
            <span className="super-metric-value">{stats.total}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: viewFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: viewFilter === 'All' ? 700 : 500,
              }}
            >
              {viewFilter === 'All' ? '● Active: All Bookings' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Calendar size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setViewFilter('Confirmed')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: viewFilter === 'Confirmed' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: viewFilter === 'Confirmed' ? '#f0fdf4' : '#ffffff',
            boxShadow: viewFilter === 'Confirmed' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: viewFilter === 'Confirmed' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter upcoming confirmed appointments"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Scheduled / Upcoming</span>
            <span className="super-metric-value">{stats.confirmed}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: viewFilter === 'Confirmed' ? '#059669' : '#64748b',
                fontWeight: viewFilter === 'Confirmed' ? 700 : 500,
              }}
            >
              {viewFilter === 'Confirmed' ? '● Active: Upcoming' : 'Click to filter upcoming'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <UserCheck size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setViewFilter('Completed')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: viewFilter === 'Completed' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: viewFilter === 'Completed' ? '#f5f3ff' : '#ffffff',
            boxShadow: viewFilter === 'Completed' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: viewFilter === 'Completed' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter completed consultations"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Completed Consultations</span>
            <span className="super-metric-value">{stats.completed}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: viewFilter === 'Completed' ? '#6366f1' : '#64748b',
                fontWeight: viewFilter === 'Completed' ? 700 : 500,
              }}
            >
              {viewFilter === 'Completed' ? '● Active: Completed' : 'Click to filter completed'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setHospitalFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: hospitalFilter !== 'All' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: hospitalFilter !== 'All' ? '#fffbeb' : '#ffffff',
            boxShadow: hospitalFilter !== 'All' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
          }}
          title="Click to reset facility filter"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Facilities</span>
            <span className="super-metric-value">{stats.hospitalsCount}</span>
            <span className="super-metric-trend positive">
              {hospitalFilter !== 'All' ? `Filtered: ${hospitalFilter}` : 'With booked visits'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <Building2 size={20} />
          </div>
        </div>
      </div>

      {/* 3. Main Panel Card with Search and Table */}
      <div className="super-panel-card">
        <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>Booked Appointments ({displayedAppointments.length})</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {hospitalFilter === 'All' ? 'Viewing across all network facilities' : `Filtered for ${hospitalFilter}`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* View filter buttons */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${viewFilter === 'All' ? 'active' : ''}`}
                onClick={() => setViewFilter('All')}
              >
                All
              </button>
              <button
                type="button"
                className={`mode-btn ${viewFilter === 'Confirmed' ? 'active' : ''}`}
                onClick={() => setViewFilter('Confirmed')}
              >
                Upcoming ({stats.confirmed})
              </button>
              <button
                type="button"
                className={`mode-btn ${viewFilter === 'Completed' ? 'active' : ''}`}
                onClick={() => setViewFilter('Completed')}
              >
                Completed ({stats.completed})
              </button>
            </div>

            {/* Search Input */}
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={16} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search patient, doctor, token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginRight: '0.5rem',
                    color: '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Appointments Table (Strictly NO status column, NO consultation type column, NO cancel button) */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#0284c7',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 1rem auto',
                }}
              />
              <span>Loading appointment records...</span>
            </div>
          ) : displayedAppointments.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <Calendar size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 0.35rem 0' }}>No Appointments Found</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                {searchQuery || hospitalFilter !== 'All'
                  ? 'No booked appointments match your search or filter.'
                  : 'No doctor appointments recorded in the network yet.'}
              </p>
            </div>
          ) : (
            <table className="super-table">
              <thead>
                <tr>
                  <th>Patient Details</th>
                  <th>Hospital Facility</th>
                  <th>Doctor & Department</th>
                  <th>Date & Time Slot</th>
                  <th>Booking Token</th>
                </tr>
              </thead>
              <tbody>
                {displayedAppointments.map((apt) => (
                  <tr key={apt._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{apt.patientName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {apt.patientAge ? `${apt.patientAge} yrs • ` : ''}
                          {apt.patientGender || ''} {apt.patientPhone ? `• ${apt.patientPhone}` : ''}
                        </div>
                        {apt.cardId && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              marginTop: '0.25rem',
                            }}
                          >
                            <CreditCard size={11} />
                            {apt.cardId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #eaeff5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0284c7',
                            flexShrink: 0,
                          }}
                        >
                          <Building2 size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{apt.hospitalName}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: '#0f172a' }}>
                          <Stethoscope size={14} style={{ color: '#0284c7' }} />
                          <span>{apt.doctorName}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 500, marginTop: '0.15rem' }}>
                          {apt.department} {apt.doctorFee ? `• ₹${apt.doctorFee}` : ''}
                        </div>
                        {apt.symptoms && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '0.15rem' }}>
                            "{apt.symptoms}"
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatDate(apt.appointmentDate)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                          <Clock size={12} />
                          <span>{apt.timeSlot}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.65rem',
                          background: '#f8fafc',
                          border: '1px solid #eaeff5',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '0.8rem',
                        }}
                      >
                        {apt.tokenNumber || apt.appointmentId || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="super-modal-backdrop" onClick={() => setSelectedAppointment(null)}>
          <div className="super-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
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
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Appointment Details</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    Token #{selectedAppointment.tokenNumber || selectedAppointment.appointmentId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setSelectedAppointment(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Patient Name</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                    {selectedAppointment.patientName}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Contact Phone</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                    {selectedAppointment.patientPhone || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Hospital Facility</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedAppointment.hospitalName}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Doctor Assigned</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {selectedAppointment.doctorName}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Department</span>
                  <div style={{ fontWeight: 600, color: '#0284c7' }}>
                    {selectedAppointment.department}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Consultation Slot</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {formatDate(selectedAppointment.appointmentDate)} • {selectedAppointment.timeSlot}
                  </div>
                </div>
              </div>

              {selectedAppointment.cardId && (
                <div
                  style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                  }}
                >
                  <CreditCard size={18} style={{ color: '#0284c7' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase' }}>
                      Linked Medy Digital Card
                    </span>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>
                      {selectedAppointment.cardId}
                    </div>
                  </div>
                </div>
              )}

              {selectedAppointment.symptoms && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Reported Symptoms</span>
                  <p
                    style={{
                      margin: '0.35rem 0 0 0',
                      fontSize: '0.85rem',
                      color: '#334155',
                      background: '#f8fafc',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #eaeff5',
                    }}
                  >
                    {selectedAppointment.symptoms}
                  </p>
                </div>
              )}
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-primary"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

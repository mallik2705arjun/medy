import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Activity,
  X,
  Plus,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Patients = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'appointments'
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [cardFilter, setCardFilter] = useState('All'); // 'All' | 'WithCard' | 'NoCard'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingPatient, setViewingPatient] = useState(null);

  // Register Patient Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    hospitalName: '',
    address: '',
  });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Patients, Hospitals & Appointments
  const fetchData = async () => {
    try {
      setLoading(true);
      const [hospRes, patRes, dashRes, aptRes] = await Promise.all([
        fetch('/api/hospitals', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
        fetch('/api/patients', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
        fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
        fetch('/api/appointments', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
      ]);

      if (hospRes.ok) {
        const hospData = await hospRes.json();
        setHospitals(hospData || []);
        if (hospData?.length > 0 && !registerForm.hospitalName) {
          setRegisterForm((prev) => ({ ...prev, hospitalName: hospData[0].name }));
        }
      }

      if (patRes.ok) {
        const patData = await patRes.json();
        setPatients(patData.patients || patData || []);
      } else if (dashRes.ok) {
        const dashData = await dashRes.json();
        setPatients(dashData.patients || []);
      }

      if (aptRes && aptRes.ok) {
        const aptData = await aptRes.json();
        setAppointments(aptData.appointments || []);
      }
    } catch (e) {
      console.error('Failed to load patient records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) fetchData();
  }, [admin]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = patients.length;
    const withCard = patients.filter((p) => p.hasMedyCard || Boolean(p.cardId)).length;
    const withoutCard = total - withCard;
    const uniqueHospitals = new Set(patients.map((p) => p.hospitalName).filter(Boolean)).size;
    const totalAppointments = appointments.length;
    return { total, withCard, withoutCard, uniqueHospitals, totalAppointments };
  }, [patients, appointments]);

  // Filtered patient list
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchHosp =
        selectedHospital === 'All' ||
        (p.hospitalName || '').toLowerCase().trim() === selectedHospital.toLowerCase().trim();

      const matchCard =
        cardFilter === 'All'
          ? true
          : cardFilter === 'WithCard'
            ? Boolean(p.hasMedyCard || p.cardId)
            : !p.hasMedyCard && !p.cardId;

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p?.name || '').toLowerCase().includes(q) ||
        (p?.phone || '').includes(q) ||
        (p?.cardId || '').toLowerCase().includes(q) ||
        (p?.email || '').toLowerCase().includes(q);

      return matchHosp && matchCard && matchSearch;
    });
  }, [patients, selectedHospital, cardFilter, search]);

  // Aggregated Appointments per Doctor by Hospital (NO patient details)
  const doctorAppointmentStats = useMemo(() => {
    const map = {};

    appointments.forEach((apt) => {
      const hosp = (apt.hospitalName || 'Unassigned Hospital').trim();
      const doc = (apt.doctorName || 'Unassigned Doctor').trim();
      const dept = (apt.department || 'General Medicine').trim();
      const key = `${hosp}___${doc}`;

      if (!map[key]) {
        map[key] = {
          hospitalName: hosp,
          doctorName: doc,
          department: dept,
          totalAppointments: 0,
          confirmedCount: 0,
          completedCount: 0,
          cancelledCount: 0,
        };
      }

      map[key].totalAppointments += 1;
      if (apt.status === 'Confirmed') map[key].confirmedCount += 1;
      else if (apt.status === 'Completed') map[key].completedCount += 1;
      else if (apt.status === 'Cancelled') map[key].cancelledCount += 1;
    });

    let list = Object.values(map);

    if (selectedHospital !== 'All') {
      list = list.filter(
        (item) => item.hospitalName.toLowerCase().trim() === selectedHospital.toLowerCase().trim()
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.doctorName.toLowerCase().includes(q) ||
          item.hospitalName.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.totalAppointments - a.totalAppointments);
  }, [appointments, selectedHospital, search]);

  // Register Patient Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSubmitting(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register patient');
      }

      setSuccessMessage(`Patient ${data.patient?.name || registerForm.name} registered successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsRegisterOpen(false);
      setRegisterForm({
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        email: '',
        hospitalName: hospitals[0]?.name || '',
        address: '',
      });
      fetchData();
    } catch (err) {
      setRegisterError(err.message || 'Failed to register patient');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  return (
    <div className="super-dashboard">
      {/* 1. Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Users size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Patient Management</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              View and audit all registered patients across network hospitals
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <select
            className="super-select-dropdown"
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            <option value="All">All Hospital Facilities ({hospitals.length})</option>
            {hospitals.map((h) => (
              <option key={h._id || h.name} value={h.name}>
                {h.name} — {h.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Notification */}
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

      {/* 2. Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('patients');
            setCardFilter('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'patients' && cardFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: activeTab === 'patients' && cardFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: activeTab === 'patients' && cardFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.2)' : 'none',
            transform: activeTab === 'patients' && cardFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all registered patients"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Registered Patients</span>
            <span className="super-metric-value">{stats.total}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: activeTab === 'patients' && cardFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: activeTab === 'patients' && cardFilter === 'All' ? 700 : 500,
              }}
            >
              {activeTab === 'patients' && cardFilter === 'All' ? '● Active: All Patients' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <Users size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('patients');
            setCardFilter('WithCard');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'patients' && cardFilter === 'WithCard' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: activeTab === 'patients' && cardFilter === 'WithCard' ? '#f0fdf4' : '#ffffff',
            boxShadow: activeTab === 'patients' && cardFilter === 'WithCard' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: activeTab === 'patients' && cardFilter === 'WithCard' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view patients with Medy Card"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Patients With Medy Card</span>
            <span className="super-metric-value">{stats.withCard}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: activeTab === 'patients' && cardFilter === 'WithCard' ? '#059669' : '#64748b',
                fontWeight: activeTab === 'patients' && cardFilter === 'WithCard' ? 700 : 500,
              }}
            >
              {activeTab === 'patients' && cardFilter === 'WithCard' ? '● Active: With Card' : 'Click to filter cardholders'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CreditCard size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('patients');
            setCardFilter('NoCard');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'patients' && cardFilter === 'NoCard' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: activeTab === 'patients' && cardFilter === 'NoCard' ? '#fffbeb' : '#ffffff',
            boxShadow: activeTab === 'patients' && cardFilter === 'NoCard' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
            transform: activeTab === 'patients' && cardFilter === 'NoCard' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view patients without Medy Card"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Patients Without Medy Card</span>
            <span className="super-metric-value">{stats.withoutCard}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: activeTab === 'patients' && cardFilter === 'NoCard' ? '#d97706' : '#64748b',
                fontWeight: activeTab === 'patients' && cardFilter === 'NoCard' ? 700 : 500,
              }}
            >
              {activeTab === 'patients' && cardFilter === 'NoCard' ? '● Active: Without Card' : 'Click to filter without card'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <UserCheck size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setActiveTab(activeTab === 'appointments' ? 'patients' : 'appointments')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'appointments' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: activeTab === 'appointments' ? '#f0f9ff' : '#ffffff',
            boxShadow: activeTab === 'appointments' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: activeTab === 'appointments' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view patient appointments per doctor and hospital"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Doctor Appointments</span>
            <span className="super-metric-value">{stats.totalAppointments}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: activeTab === 'appointments' ? '#0284c7' : '#64748b',
                fontWeight: activeTab === 'appointments' ? 700 : 500,
              }}
            >
              {activeTab === 'appointments' ? '● Active: Summary View' : 'Click to view by doctor & hospital'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <Calendar size={20} />
          </div>
        </div>
      </div>

      {/* 3. Panel with Table: Either Doctor Appointments Summary (by Hospital & Doctor, NO patient details) or Enrolled Patients Directory */}
      {activeTab === 'appointments' ? (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ margin: 0 }}>Doctor Appointments by Hospital ({doctorAppointmentStats.length})</h3>
                <span
                  style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#f0f9ff',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                  }}
                >
                  {appointments.length} Total Bookings
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {selectedHospital === 'All'
                  ? 'Total patient appointment volume per doctor across all network hospitals (No patient details)'
                  : `Filtered for ${selectedHospital}`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search Input */}
              <div className="super-nav-search" style={{ width: '280px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search doctor, hospital, specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
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

              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => setActiveTab('patients')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Users size={15} />
                <span>View Patients Directory</span>
              </button>
            </div>
          </div>

          <div className="table-responsive">
            {doctorAppointmentStats.length === 0 ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                <Calendar size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 0.35rem 0' }}>
                  No Appointments Found
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  {search || selectedHospital !== 'All'
                    ? 'No doctor appointments match your current search or hospital facility filter.'
                    : 'No patient appointments scheduled in the network yet.'}
                </p>
              </div>
            ) : (
              <table className="super-table">
                <thead>
                  <tr>
                    <th>Hospital Facility</th>
                    <th>Doctor Name</th>
                    <th>Department / Specialty</th>
                    <th style={{ textAlign: 'center' }}>Total Patient Appointments</th>
                    <th>Status Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointmentStats.map((item, idx) => (
                    <tr key={`${item.hospitalName}-${item.doctorName}-${idx}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Building2 size={15} style={{ color: '#0284c7', flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.hospitalName}</span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Stethoscope size={15} style={{ color: '#059669', flexShrink: 0 }} />
                          <strong style={{ color: '#0f172a' }}>{item.doctorName}</strong>
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          {item.department}
                        </span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            background: '#f0f9ff',
                            color: '#0284c7',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          {item.totalAppointments} Patient{item.totalAppointments === 1 ? '' : 's'}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                          <span style={{ color: '#059669', fontWeight: 600 }}>
                            ● {item.confirmedCount} Confirmed
                          </span>
                          {item.completedCount > 0 && (
                            <span style={{ color: '#0284c7', fontWeight: 600 }}>
                              • {item.completedCount} Completed
                            </span>
                          )}
                          {item.cancelledCount > 0 && (
                            <span style={{ color: '#dc2626', fontWeight: 500 }}>
                              • {item.cancelledCount} Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Enrolled Patients Table */
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Enrolled Patients ({filtered.length})</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {selectedHospital === 'All' ? 'Viewing across all network hospitals' : `Filtered for ${selectedHospital}`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Card Status Toggle */}
              <div className="view-mode-toggle">
                <button
                  type="button"
                  className={`mode-btn ${cardFilter === 'All' ? 'active' : ''}`}
                  onClick={() => setCardFilter('All')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`mode-btn ${cardFilter === 'WithCard' ? 'active' : ''}`}
                  onClick={() => setCardFilter('WithCard')}
                >
                  With Card ({stats.withCard})
                </button>
                <button
                  type="button"
                  className={`mode-btn ${cardFilter === 'NoCard' ? 'active' : ''}`}
                  onClick={() => setCardFilter('NoCard')}
                >
                  Without Card ({stats.withoutCard})
                </button>
              </div>

              {/* Search Input */}
              <div className="super-nav-search" style={{ width: '260px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search patient, phone, card..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
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

          {/* Patients Table */}
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
                <span>Loading patient records...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                <Users size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 0.35rem 0' }}>No Patients Found</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  {search || selectedHospital !== 'All'
                    ? 'No patient records match your current search or facility filter.'
                    : 'No patients registered in the network yet.'}
                </p>
              </div>
            ) : (
              <table className="super-table">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Demographics</th>
                    <th>Contact Info</th>
                    <th>Hospital Facility</th>
                    <th>Medy Insurance Card</th>
                    <th>Appointments</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const cleanPPhone = (p.phone || '').replace(/\D/g, '').slice(-10);
                    const patientAppointments = appointments.filter((a) => {
                      const cleanAPhone = (a.patientPhone || '').replace(/\D/g, '').slice(-10);
                      const matchPhone = cleanPPhone && cleanAPhone && cleanPPhone === cleanAPhone;
                      const matchCard = p.cardId && a.cardId && p.cardId === a.cardId;
                      const matchName =
                        p.name && a.patientName && p.name.trim().toLowerCase() === a.patientName.trim().toLowerCase();
                      return matchPhone || matchCard || matchName;
                    });

                    return (
                      <tr key={p._id || p.id || p.phone}>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                            {p.email && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.email}</div>}
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.5rem',
                              background: '#f8fafc',
                              border: '1px solid #eaeff5',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              color: '#334155',
                              fontWeight: 500,
                            }}
                          >
                            {p.age ? `${p.age} yrs` : '—'} • {p.gender || '—'}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0f172a', fontWeight: 500 }}>
                            <Phone size={13} style={{ color: '#0284c7' }} />
                            <span>{p.phone}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Building2 size={14} style={{ color: '#0284c7' }} />
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.hospitalName}</span>
                          </div>
                        </td>

                        <td>
                          {p.cardId ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.55rem',
                                background: '#e0f2fe',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                color: '#0284c7',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                              }}
                            >
                              <CreditCard size={12} />
                              {p.cardId}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                              No Card Issued
                            </span>
                          )}
                        </td>

                        <td>
                          {patientAppointments.length > 0 ? (
                            <span
                              onClick={() => {
                                setActiveTab('appointments');
                                setSearch(p.hospitalName || '');
                              }}
                              style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.55rem',
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '6px',
                                color: '#0284c7',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                              }}
                              title="Click to view doctor appointments summary for this hospital in this page"
                            >
                              <Calendar size={12} />
                              <span>{patientAppointments.length} Booked</span>
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>None</span>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}>
                            <Calendar size={12} />
                            <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Register Patient Modal */}
      {isRegisterOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsRegisterOpen(false)}>
          <div className="super-modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
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
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Register New Patient</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Enroll patient to a network hospital registry
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsRegisterOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {registerError && (
                  <div
                    style={{
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      color: '#991b1b',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertTriangle size={16} />
                    <span>{registerError}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Patient Name *
                  </label>
                  <input
                    type="text"
                    className="super-search-input"
                    style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Robert Williams"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Age *
                    </label>
                    <input
                      type="number"
                      className="super-search-input"
                      style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                      value={registerForm.age}
                      onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                      placeholder="35"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Gender *
                    </label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%', height: '38px' }}
                      value={registerForm.gender}
                      onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      className="super-search-input"
                      style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="super-search-input"
                      style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="patient@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Hospital Facility *
                  </label>
                  <select
                    className="super-select-dropdown"
                    style={{ width: '100%', height: '38px' }}
                    value={registerForm.hospitalName}
                    onChange={(e) => setRegisterForm({ ...registerForm, hospitalName: e.target.value })}
                    required
                  >
                    {hospitals.map((hosp) => (
                      <option key={hosp._id || hosp.name} value={hosp.name}>
                        {hosp.name} — {hosp.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setIsRegisterOpen(false)}
                  disabled={registerSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="super-btn-primary" disabled={registerSubmitting}>
                  <Plus size={16} />
                  <span>{registerSubmitting ? 'Registering...' : 'Register Patient'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Patient Details Profile */}
      {viewingPatient && (
        <div className="super-modal-backdrop" onClick={() => setViewingPatient(null)}>
          <div className="super-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
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
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Patient Profile</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {viewingPatient.name}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setViewingPatient(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Full Name</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{viewingPatient.name}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Contact Phone</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{viewingPatient.phone}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Demographics</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {viewingPatient.age} yrs • {viewingPatient.gender}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Hospital Facility</span>
                  <div style={{ fontWeight: 600, color: '#0284c7' }}>{viewingPatient.hospitalName}</div>
                </div>
              </div>

              {/* Medy Card Status */}
              <div
                style={{
                  background: viewingPatient.cardId ? '#e0f2fe' : '#f8fafc',
                  border: `1px solid ${viewingPatient.cardId ? '#bae6fd' : '#eaeff5'}`,
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <CreditCard size={20} style={{ color: viewingPatient.cardId ? '#0284c7' : '#94a3b8' }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Medy Digital Insurance Card
                  </span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: viewingPatient.cardId ? '#0369a1' : '#475569', fontSize: '0.95rem' }}>
                    {viewingPatient.cardId || 'Not Assigned / No Card Issued'}
                  </div>
                </div>
              </div>
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-primary"
                onClick={() => setViewingPatient(null)}
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

export default Patients;

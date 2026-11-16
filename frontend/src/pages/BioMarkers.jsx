import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Wind,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  X,
  TrendingUp,
  Clock,
  Trash2,
  Eye,
} from 'lucide-react';

const INITIAL_BIOMARKERS = [
  {
    id: 'BIO-1001',
    patientName: 'Sarah Jenkins',
    patientId: 'PAT-4091',
    age: 34,
    gender: 'Female',
    bloodPressure: '118/76',
    heartRate: 72,
    bloodGlucose: 94,
    spO2: 99,
    temperature: 98.4,
    status: 'Normal',
    lastSync: '10 mins ago',
    hospital: 'City Care Hospital',
  },
  {
    id: 'BIO-1002',
    patientName: 'Michael Chang',
    patientId: 'PAT-3820',
    age: 58,
    gender: 'Male',
    bloodPressure: '142/92',
    heartRate: 88,
    bloodGlucose: 168,
    spO2: 96,
    temperature: 99.1,
    status: 'Elevated',
    lastSync: '25 mins ago',
    hospital: 'Apex Heart Center',
  },
  {
    id: 'BIO-1003',
    patientName: 'Devon Vance',
    patientId: 'PAT-5112',
    age: 62,
    gender: 'Male',
    bloodPressure: '175/105',
    heartRate: 114,
    bloodGlucose: 240,
    spO2: 91,
    temperature: 101.4,
    status: 'Critical',
    lastSync: 'Just Now',
    hospital: 'Metropolitan General',
  },
  {
    id: 'BIO-1004',
    patientName: 'Priya Sharma',
    patientId: 'PAT-2983',
    age: 29,
    gender: 'Female',
    bloodPressure: '112/74',
    heartRate: 68,
    bloodGlucose: 88,
    spO2: 100,
    temperature: 98.6,
    status: 'Normal',
    lastSync: '1 hour ago',
    hospital: 'Apollo Speciality',
  },
  {
    id: 'BIO-1005',
    patientName: 'Arthur Dent',
    patientId: 'PAT-6721',
    age: 45,
    gender: 'Male',
    bloodPressure: '136/86',
    heartRate: 82,
    bloodGlucose: 142,
    spO2: 97,
    temperature: 98.9,
    status: 'Elevated',
    lastSync: '2 hours ago',
    hospital: 'City Care Hospital',
  },
  {
    id: 'BIO-1006',
    patientName: 'Grace Hopper',
    patientId: 'PAT-1082',
    age: 71,
    gender: 'Female',
    bloodPressure: '122/80',
    heartRate: 75,
    bloodGlucose: 102,
    spO2: 98,
    temperature: 98.4,
    status: 'Normal',
    lastSync: '3 hours ago',
    hospital: 'St. Jude Healthcare',
  },
];

const BioMarkers = () => {
  const [biomarkers, setBiomarkers] = useState(INITIAL_BIOMARKERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // New Record Form State
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    age: '',
    gender: 'Male',
    bloodPressure: '120/80',
    heartRate: '72',
    bloodGlucose: '95',
    spO2: '98',
    temperature: '98.6',
    hospital: 'City Care Hospital',
  });

  const filtered = biomarkers.filter((b) => {
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      b.patientName.toLowerCase().includes(q) ||
      b.patientId.toLowerCase().includes(q) ||
      b.hospital.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const normalCount = biomarkers.filter((b) => b.status === 'Normal').length;
  const elevatedCount = biomarkers.filter((b) => b.status === 'Elevated').length;
  const criticalCount = biomarkers.filter((b) => b.status === 'Critical').length;

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.patientId) return;

    // Determine status automatically based on vitals
    let calculatedStatus = 'Normal';
    const systolic = parseInt(formData.bloodPressure.split('/')[0]) || 120;
    const hr = parseInt(formData.heartRate) || 72;
    const bg = parseInt(formData.bloodGlucose) || 95;
    const spo2 = parseInt(formData.spO2) || 98;

    if (systolic >= 160 || hr >= 110 || bg >= 200 || spo2 < 92) {
      calculatedStatus = 'Critical';
    } else if (systolic >= 135 || hr >= 90 || bg >= 135 || spo2 < 96) {
      calculatedStatus = 'Elevated';
    }

    const newRecord = {
      id: `BIO-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: formData.patientName.trim(),
      patientId: formData.patientId.trim().toUpperCase(),
      age: parseInt(formData.age) || 35,
      gender: formData.gender,
      bloodPressure: formData.bloodPressure,
      heartRate: parseInt(formData.heartRate) || 75,
      bloodGlucose: parseInt(formData.bloodGlucose) || 100,
      spO2: parseInt(formData.spO2) || 98,
      temperature: parseFloat(formData.temperature) || 98.6,
      status: calculatedStatus,
      lastSync: 'Just Now',
      hospital: formData.hospital,
    };

    setBiomarkers([newRecord, ...biomarkers]);
    setIsModalOpen(false);
    setFormData({
      patientName: '',
      patientId: '',
      age: '',
      gender: 'Male',
      bloodPressure: '120/80',
      heartRate: '72',
      bloodGlucose: '95',
      spO2: '98',
      temperature: '98.6',
      hospital: 'City Care Hospital',
    });
  };

  return (
    <div className="super-dashboard">
      {/* Page Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Patient Bio-Markers & Vitals</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Real-time physiological telemetry, vital sign thresholds & diagnostic telemetry
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <button
            type="button"
            className="super-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Record Patient Vitals</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: statusFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: statusFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: statusFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all monitored patients"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Monitored Patients</span>
            <span className="super-metric-value">{biomarkers.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: statusFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: statusFilter === 'All' ? 700 : 500,
              }}
            >
              {statusFilter === 'All' ? '● Active: All Telemetry' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Activity size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('Normal')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Normal' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: statusFilter === 'Normal' ? '#f0fdf4' : '#ffffff',
            boxShadow: statusFilter === 'Normal' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: statusFilter === 'Normal' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter normal vitals"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Normal Range Vitals</span>
            <span className="super-metric-value">{normalCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: statusFilter === 'Normal' ? '#059669' : '#64748b',
                fontWeight: statusFilter === 'Normal' ? 700 : 500,
              }}
            >
              {statusFilter === 'Normal'
                ? '● Active: Stable Range'
                : `${((normalCount / (biomarkers.length || 1)) * 100).toFixed(0)}% Stable`}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('Elevated')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Elevated' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: statusFilter === 'Elevated' ? '#fffbeb' : '#ffffff',
            boxShadow: statusFilter === 'Elevated' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
            transform: statusFilter === 'Elevated' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter elevated vitals"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Elevated Vitals Watch</span>
            <span className="super-metric-value">{elevatedCount}</span>
            <span
              className="super-metric-trend"
              style={{
                color: statusFilter === 'Elevated' ? '#d97706' : '#64748b',
                fontWeight: statusFilter === 'Elevated' ? 700 : 500,
              }}
            >
              {statusFilter === 'Elevated' ? '● Active: Elevated Watch' : 'Requires Monitoring'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <Heart size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('Critical')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Critical' ? '2px solid #ef4444' : '1px solid #eaeff5',
            background: statusFilter === 'Critical' ? '#fef2f2' : '#ffffff',
            boxShadow: statusFilter === 'Critical' ? '0 4px 16px rgba(239, 68, 68, 0.16)' : 'none',
            transform: statusFilter === 'Critical' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter critical telemetry alerts"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Critical Telemetry Alerts</span>
            <span className="super-metric-value" style={{ color: '#ef4444' }}>
              {criticalCount}
            </span>
            <span
              className="super-metric-trend negative"
              style={{
                color: statusFilter === 'Critical' ? '#ef4444' : '#64748b',
                fontWeight: statusFilter === 'Critical' ? 700 : 500,
              }}
            >
              {statusFilter === 'Critical' ? '● Active: Critical Alerts' : 'Immediate Intervention'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#ef4444' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Continuous Bio-Marker Telemetry ({filtered.length})</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Blood Pressure, Heart Rate, Blood Glucose, SpO2 & Temperature readings
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={15} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search patient, ID, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <select
              className="super-select-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Vitals ({biomarkers.length})</option>
              <option value="Normal">Normal Range ({normalCount})</option>
              <option value="Elevated">Elevated Watch ({elevatedCount})</option>
              <option value="Critical">Critical Alert ({criticalCount})</option>
            </select>
          </div>
        </div>

        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Blood Pressure</th>
                <th>Heart Rate</th>
                <th>Blood Glucose</th>
                <th>SpO2 Level</th>
                <th>Body Temp</th>
                <th>Vitals Status</th>
                <th>Network Node</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
                      {b.patientName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {b.patientId} • {b.age}y ({b.gender})
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{b.bloodPressure}</div>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>mmHg</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Heart size={14} style={{ color: b.heartRate > 100 ? '#ef4444' : '#0284c7' }} />
                      <strong style={{ fontSize: '0.84rem' }}>{b.heartRate}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>bpm</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Droplets size={14} style={{ color: b.bloodGlucose > 140 ? '#f59e0b' : '#10b981' }} />
                      <strong style={{ fontSize: '0.84rem' }}>{b.bloodGlucose}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>mg/dL</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Wind size={14} style={{ color: b.spO2 < 95 ? '#ef4444' : '#10b981' }} />
                      <strong style={{ fontSize: '0.84rem' }}>{b.spO2}%</strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600 }}>{b.temperature}°F</span>
                  </td>
                  <td>
                    <span
                      className={`super-status-pill ${b.status === 'Normal' ? 'active' : 'inactive'
                        }`}
                      style={{
                        background:
                          b.status === 'Normal'
                            ? '#ecfdf5'
                            : b.status === 'Elevated'
                              ? '#fef3c7'
                              : '#fef2f2',
                        color:
                          b.status === 'Normal'
                            ? '#065f46'
                            : b.status === 'Elevated'
                              ? '#b45309'
                              : '#dc2626',
                        border: `1px solid ${b.status === 'Normal'
                          ? '#a7f3d0'
                          : b.status === 'Elevated'
                            ? '#fde68a'
                            : '#fecaca'
                          }`,
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{
                          background:
                            b.status === 'Normal'
                              ? '#10b981'
                              : b.status === 'Elevated'
                                ? '#f59e0b'
                                : '#ef4444',
                        }}
                      />
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>{b.hospital}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{b.lastSync}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="action-icon-btn edit"
                        title="View Telemetry Graph"
                        onClick={() => setSelectedRecord(b)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="action-icon-btn delete"
                        title="Delete Telemetry Record"
                        onClick={() => {
                          if (window.confirm(`Delete record for ${b.patientName}?`)) {
                            setBiomarkers(biomarkers.filter((item) => item.id !== b.id));
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Biomarkers Modal */}
      {isModalOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '580px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Record Patient Bio-Markers</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Log clinical telemetry and vital indicators</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRecord}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Liam Foster"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Patient ID</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. PAT-9102"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 42"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Gender</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Facility</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.hospital}
                      onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    >
                      <option value="City Care Hospital">City Care Hospital</option>
                      <option value="Apex Heart Center">Apex Heart Center</option>
                      <option value="Apollo Speciality">Apollo Speciality</option>
                      <option value="Metropolitan General">Metropolitan General</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. 120/80"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 72"
                      value={formData.heartRate}
                      onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Blood Glucose (mg/dL)</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 95"
                      value={formData.bloodGlucose}
                      onChange={(e) => setFormData({ ...formData, bloodGlucose: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">SpO2 Oxygen (%)</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 99"
                      value={formData.spO2}
                      onChange={(e) => setFormData({ ...formData, spO2: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      className="form-control"
                      placeholder="e.g. 98.6"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="super-btn-primary">
                  Record Telemetry Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Patient Vitals Modal */}
      {selectedRecord && (
        <div className="super-modal-backdrop" onClick={() => setSelectedRecord(null)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Telemetry Inspection: {selectedRecord.patientName}</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Detailed physiological vitals telemetry</span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedRecord.patientName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    ID: {selectedRecord.patientId} • Age: {selectedRecord.age} • Gender: {selectedRecord.gender}
                  </div>
                </div>
                <span className={`super-status-pill ${selectedRecord.status === 'Normal' ? 'active' : 'inactive'}`}>
                  <span className="status-dot" /> {selectedRecord.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Pressure</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{selectedRecord.bloodPressure}</div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Target: &lt;120/80 mmHg</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Heart Rate</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{selectedRecord.heartRate} bpm</div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Resting: 60-100 bpm</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Blood Glucose</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{selectedRecord.bloodGlucose} mg/dL</div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Fasting: 70-99 mg/dL</div>
                </div>
                <div style={{ padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Oxygen SpO2</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{selectedRecord.spO2}%</div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981' }}>Normal: 95-100%</div>
                </div>
              </div>
            </div>
            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-primary"
                onClick={() => setSelectedRecord(null)}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BioMarkers;

import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Users,
  Calendar,
  Star,
  Award,
  Filter,
  User,
} from 'lucide-react';

const INITIAL_DOCTORS = [
  {
    id: 1,
    name: 'Dr. Nazar Becks',
    department: 'Gynecology & Women Care',
    specialty: 'Obstetrics & Women Care',
    experience: '12 Years',
    status: 'Active',
    patients: 430,
    rating: '4.9',
    hospital: 'City Care Hospital',
    avatar: '',
  },
  {
    id: 2,
    name: 'Dr. John Darwin',
    department: 'Radiology & Imaging',
    specialty: 'Diagnostic Imaging & ECG',
    experience: '15 Years',
    status: 'Active',
    patients: 610,
    rating: '4.8',
    hospital: 'Apex Heart Center',
    avatar: '',
  },
  {
    id: 3,
    name: 'Dr. Alex Hales',
    department: 'General Medicine',
    specialty: 'Internal Medicine & Critical Care',
    experience: '8 Years',
    status: 'InActive',
    patients: 290,
    rating: '4.7',
    hospital: 'City Care Hospital',
    avatar: '',
  },
  {
    id: 4,
    name: 'Dr. Sarah Connor',
    department: 'Cardiology',
    specialty: 'Interventional Cardiology',
    experience: '14 Years',
    status: 'Active',
    patients: 540,
    rating: '5.0',
    hospital: 'Apollo Speciality',
    avatar: '',
  },
  {
    id: 5,
    name: 'Dr. Robert Chen',
    department: 'Neurology',
    specialty: 'Brain & Spine Neurosurgery',
    experience: '10 Years',
    status: 'Active',
    patients: 380,
    rating: '4.9',
    hospital: 'Metropolitan General',
    avatar: '',
  },
];

const Doctors = () => {
  const [doctorsList, setDoctorsList] = useState(INITIAL_DOCTORS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [sortMode, setSortMode] = useState('default'); // 'default' | 'active' | 'patients' | 'rating'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    department: 'Cardiology',
    specialty: '',
    experience: '5 Years',
    hospital: 'City Care Hospital',
    avatar: '',
  });

  const filtered = doctorsList
    .filter((d) => {
      if (sortMode === 'active' && d.status !== 'Active') return false;
      const matchDept = deptFilter === 'All' || d.department.includes(deptFilter);
      const q = search.toLowerCase();
      const matchSearch =
        d.name.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q);
      return matchDept && matchSearch;
    })
    .sort((a, b) => {
      if (sortMode === 'patients') return (b.patients || 0) - (a.patients || 0);
      if (sortMode === 'rating') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      return 0;
    });

  const activeCount = doctorsList.filter((d) => d.status === 'Active').length;
  const totalPatients = doctorsList.reduce((sum, d) => sum + d.patients, 0);

  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newDoc = {
      id: Date.now(),
      name: formData.name.startsWith('Dr.') ? formData.name : `Dr. ${formData.name}`,
      department: formData.department,
      specialty: formData.specialty || 'General Practice',
      experience: formData.experience,
      status: 'Active',
      patients: 0,
      rating: '5.0',
      hospital: formData.hospital,
      avatar: formData.avatar,
    };

    setDoctorsList([newDoc, ...doctorsList]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      department: 'Cardiology',
      specialty: '',
      experience: '5 Years',
      hospital: 'City Care Hospital',
      avatar: '',
    });
  };

  return (
    <div className="super-dashboard">
      {/* Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Stethoscope size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Doctor Specialists Management</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Physicians, surgeons, and clinical specialists across partner facilities
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
            <span>Onboard Specialist Doctor</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => {
            setSortMode('default');
            setDeptFilter('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'default' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: sortMode === 'default' ? '#f0f9ff' : '#ffffff',
            boxShadow: sortMode === 'default' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: sortMode === 'default' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all registered specialists"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Registered Specialists</span>
            <span className="super-metric-value">{doctorsList.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'default' ? '#0284c7' : '#64748b',
                fontWeight: sortMode === 'default' ? 700 : 500,
              }}
            >
              {sortMode === 'default' ? '● Active: All Specialists' : `${activeCount} Currently Active`}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Stethoscope size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSortMode('active')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'active' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: sortMode === 'active' ? '#f0fdf4' : '#ffffff',
            boxShadow: sortMode === 'active' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: sortMode === 'active' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter active on duty specialists"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active on Duty</span>
            <span className="super-metric-value">{activeCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'active' ? '#059669' : '#64748b',
                fontWeight: sortMode === 'active' ? 700 : 500,
              }}
            >
              {sortMode === 'active' ? '● Active: On Duty' : 'Coverage: 100% Wards'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSortMode('patients')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'patients' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: sortMode === 'patients' ? '#f5f3ff' : '#ffffff',
            boxShadow: sortMode === 'patients' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: sortMode === 'patients' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to sort by patient volume"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Treated Patients</span>
            <span className="super-metric-value">{totalPatients.toLocaleString()}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'patients' ? '#6366f1' : '#64748b',
                fontWeight: sortMode === 'patients' ? 700 : 500,
              }}
            >
              {sortMode === 'patients' ? '● Sorted by Volume' : '+18% this month'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <Users size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSortMode('rating')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'rating' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: sortMode === 'rating' ? '#fffbeb' : '#ffffff',
            boxShadow: sortMode === 'rating' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
            transform: sortMode === 'rating' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to sort by top rating"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Avg Specialist Rating</span>
            <span className="super-metric-value">4.9 / 5.0</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'rating' ? '#d97706' : '#64748b',
                fontWeight: sortMode === 'rating' ? 700 : 500,
              }}
            >
              {sortMode === 'rating' ? '● Sorted by Rating' : 'Verified Patient Feedback'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <Star size={22} />
          </div>
        </div>
      </div>

      {/* Main Panel Card */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Medical Specialists & Physicians Directory ({filtered.length})</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={15} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search doctor or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="super-select-dropdown"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Radiology">Radiology</option>
              <option value="Neurology">Neurology</option>
              <option value="General">General Medicine</option>
            </select>
          </div>
        </div>

        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>Physician Name</th>
                <th>Department</th>
                <th>Clinical Specialty</th>
                <th>Experience</th>
                <th>Affiliated Facility</th>
                <th>Patients</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="table-user-cell">
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
                        <div className="user-row-name">{d.name}</div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Verified Physician</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {d.department}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{d.specialty}</td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{d.experience}</td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{d.hospital}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{d.patients}</strong>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 600, fontSize: '0.82rem' }}>
                      <Star size={13} fill="#f59e0b" />
                      <span>{d.rating}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`super-status-pill ${d.status === 'Active' ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setDoctorsList(
                          doctorsList.map((doc) =>
                            doc.id === d.id
                              ? { ...doc, status: doc.status === 'Active' ? 'InActive' : 'Active' }
                              : doc
                          )
                        );
                      }}
                    >
                      <span className="status-dot" />
                      {d.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      title="Remove Doctor"
                      onClick={() => {
                        if (window.confirm(`Remove ${d.name} from directory?`)) {
                          setDoctorsList(doctorsList.filter((doc) => doc.id !== d.id));
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '540px' }}
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
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Onboard Specialist Physician</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Register and affiliate a specialist doctor</span>
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

            <form onSubmit={handleAddDoctor}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Arthur Pendelton"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Gynecology & Women Care">Gynecology</option>
                      <option value="Radiology & Imaging">Radiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Orthopedics">Orthopedics</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Clinical Specialty</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Pediatric Cardiology"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Experience</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 10 Years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Affiliated Facility</label>
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
                  Save Physician
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;

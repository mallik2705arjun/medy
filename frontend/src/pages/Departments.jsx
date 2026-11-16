import React, { useState } from 'react';
import {
  Building2,
  Stethoscope,
  Users,
  BedDouble,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Activity,
  Layers,
} from 'lucide-react';

const INITIAL_DEPTS = [
  {
    id: 1,
    name: 'Cardiology & Vascular',
    head: 'Dr. Sarah Connor',
    doctors: 14,
    beds: 80,
    bedsOccupied: 72,
    patients: 420,
    hospital: 'Apex Heart Center',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Gynecology & Obstetrics',
    head: 'Dr. Nazar Becks',
    doctors: 12,
    beds: 65,
    bedsOccupied: 58,
    patients: 510,
    hospital: 'City Care Hospital',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Radiology & Imaging',
    head: 'Dr. John Darwin',
    doctors: 8,
    beds: 20,
    bedsOccupied: 16,
    patients: 890,
    hospital: 'Metropolitan General',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Neurology & Neurosurgery',
    head: 'Dr. Robert Chen',
    doctors: 10,
    beds: 45,
    bedsOccupied: 38,
    patients: 310,
    hospital: 'Apollo Speciality',
    status: 'Active',
  },
  {
    id: 5,
    name: 'General Internal Medicine',
    head: 'Dr. Alex Hales',
    doctors: 24,
    beds: 120,
    bedsOccupied: 104,
    patients: 1150,
    hospital: 'City Care Hospital',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Orthopedics & Joint Care',
    head: 'Dr. David Kim',
    doctors: 11,
    beds: 50,
    bedsOccupied: 41,
    patients: 270,
    hospital: 'St. Jude Healthcare',
    status: 'Active',
  },
];

const Departments = () => {
  const [departments, setDepartments] = useState(INITIAL_DEPTS);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState('default'); // 'default' | 'doctors' | 'beds' | 'patients'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    head: '',
    doctors: '10',
    beds: '50',
    hospital: 'City Care Hospital',
  });

  const filtered = departments
    .filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.head.toLowerCase().includes(search.toLowerCase()) ||
        d.hospital.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortMode === 'doctors') return (b.doctors || 0) - (a.doctors || 0);
      if (sortMode === 'beds') return (b.beds || 0) - (a.beds || 0);
      if (sortMode === 'patients') return (b.patients || 0) - (a.patients || 0);
      return 0;
    });

  const totalBeds = departments.reduce((sum, d) => sum + d.beds, 0);
  const totalDocs = departments.reduce((sum, d) => sum + d.doctors, 0);
  const totalPatients = departments.reduce((sum, d) => sum + d.patients, 0);

  const handleCreateDept = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newDept = {
      id: Date.now(),
      name: formData.name.trim(),
      head: formData.head.trim() || 'Dr. Specialist Lead',
      doctors: parseInt(formData.doctors) || 8,
      beds: parseInt(formData.beds) || 40,
      bedsOccupied: Math.floor((parseInt(formData.beds) || 40) * 0.75),
      patients: 120,
      hospital: formData.hospital,
      status: 'Active',
    };

    setDepartments([newDept, ...departments]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      head: '',
      doctors: '10',
      beds: '50',
      hospital: 'City Care Hospital',
    });
  };

  return (
    <div className="super-dashboard">
      {/* Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Hospital Clinical Departments</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Specialized clinical wards, department directors and bed allocations
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
            <span>Add Clinical Department</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => setSortMode('default')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'default' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: sortMode === 'default' ? '#f0f9ff' : '#ffffff',
            boxShadow: sortMode === 'default' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: sortMode === 'default' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all departments"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Departments</span>
            <span className="super-metric-value">{departments.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'default' ? '#0284c7' : '#64748b',
                fontWeight: sortMode === 'default' ? 700 : 500,
              }}
            >
              {sortMode === 'default' ? '● Active: All Departments' : 'Fully Operational'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Building2 size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSortMode('doctors')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'doctors' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: sortMode === 'doctors' ? '#f0fdf4' : '#ffffff',
            boxShadow: sortMode === 'doctors' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: sortMode === 'doctors' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to sort by physician staffing"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Assigned Specialists</span>
            <span className="super-metric-value">{totalDocs} Physicians</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'doctors' ? '#059669' : '#64748b',
                fontWeight: sortMode === 'doctors' ? 700 : 500,
              }}
            >
              {sortMode === 'doctors' ? '● Sorted by Staffing' : '100% Ward Roster'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Stethoscope size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSortMode('beds')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'beds' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: sortMode === 'beds' ? '#f5f3ff' : '#ffffff',
            boxShadow: sortMode === 'beds' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: sortMode === 'beds' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to sort by bed capacity"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Inpatient Capacity</span>
            <span className="super-metric-value">{totalBeds} Beds</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'beds' ? '#6366f1' : '#64748b',
                fontWeight: sortMode === 'beds' ? 700 : 500,
              }}
            >
              {sortMode === 'beds' ? '● Sorted by Capacity' : '85% Utilization'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <BedDouble size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSortMode('patients')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: sortMode === 'patients' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: sortMode === 'patients' ? '#f0f9ff' : '#ffffff',
            boxShadow: sortMode === 'patients' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: sortMode === 'patients' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to sort by patient census"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Inpatients</span>
            <span className="super-metric-value">{totalPatients.toLocaleString()}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: sortMode === 'patients' ? '#0284c7' : '#64748b',
                fontWeight: sortMode === 'patients' ? 700 : 500,
              }}
            >
              {sortMode === 'patients' ? '● Sorted by Census' : 'Admitted Across Wards'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className="super-panel-card"
        style={{
          padding: '0.85rem 1.4rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
        }}
      >
        <div className="super-nav-search" style={{ width: '320px' }}>
          <Search size={15} className="super-search-icon" />
          <input
            type="text"
            className="super-search-input"
            placeholder="Search department, director, hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Displaying <strong>{filtered.length}</strong> specialized hospital departments
        </span>
      </div>

      {/* Departments Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map((d) => {
          const occRate = Math.round((d.bedsOccupied / d.beds) * 100);
          return (
            <div
              key={d.id}
              className="super-panel-card"
              style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{d.name}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Head: <strong style={{ color: '#334155' }}>{d.head}</strong>
                    </div>
                  </div>
                  <span className="super-status-pill active">
                    <span className="status-dot" /> {d.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.76rem', color: '#0284c7', marginBottom: '0.85rem', fontWeight: 600 }}>
                  Facility: {d.hospital}
                </div>

                {/* Ward Stats Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '0.5rem',
                    background: '#f8fafc',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Specialists</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{d.doctors}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Capacity</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{d.beds} Beds</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Active Load</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0284c7' }}>{d.patients}</div>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    <span>Bed Occupancy</span>
                    <strong>{occRate}% ({d.bedsOccupied}/{d.beds})</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${occRate}%`,
                        height: '100%',
                        background: occRate > 85 ? '#f59e0b' : '#0284c7',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="action-icon-btn delete"
                  title="Remove Department"
                  onClick={() => {
                    if (window.confirm(`Delete ${d.name} department?`)) {
                      setDepartments(departments.filter((item) => item.id !== d.id));
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Department Modal */}
      {isModalOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="super-modal-card"
            style={{ maxWidth: '500px' }}
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
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Add Clinical Department</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Configure new medical department & capacity</span>
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

            <form onSubmit={handleCreateDept}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Oncology & Cancer Care"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Head of Department / Clinical Director</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Jennifer Hayes"
                    value={formData.head}
                    onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assigned Specialists</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 12"
                      value={formData.doctors}
                      onChange={(e) => setFormData({ ...formData, doctors: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Inpatient Beds</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 60"
                      value={formData.beds}
                      onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Facility Affiliation</label>
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
                    <option value="St. Jude Healthcare">St. Jude Healthcare</option>
                  </select>
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
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;

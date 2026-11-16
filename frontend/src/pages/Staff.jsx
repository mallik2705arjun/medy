import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Shield,
  Clock,
  Briefcase,
  Hospital,
} from 'lucide-react';

const INITIAL_STAFF = [
  {
    id: 1,
    name: 'Elena Rostova',
    role: 'Nurses',
    department: 'Emergency & Critical Care',
    shift: 'Morning (07:00 - 15:00)',
    hospital: 'City Care Hospital',
    status: 'Active',
    joined: 'Jan 2023',
  },
  {
    id: 2,
    name: 'Marcus Brody',
    role: 'Volunteers',
    department: 'Community Outreach',
    shift: 'Flexible',
    hospital: 'Apex Heart Center',
    status: 'Active',
    joined: 'Jun 2023',
  },
  {
    id: 3,
    name: 'Amina Al-Mansoor',
    role: 'Pharmacists',
    department: 'Central Pharmacy & Formulary',
    shift: 'Evening (15:00 - 23:00)',
    hospital: 'Metropolitan General',
    status: 'Active',
    joined: 'Sep 2022',
  },
  {
    id: 4,
    name: 'Daniel Vance',
    role: 'Dietitians',
    department: 'Clinical Nutrition & Dietetics',
    shift: 'Regular (09:00 - 17:00)',
    hospital: 'Apollo Speciality',
    status: 'Active',
    joined: 'Feb 2024',
  },
  {
    id: 5,
    name: 'Grace Hopper',
    role: 'Nurses',
    department: 'Intensive Care Unit (ICU)',
    shift: 'Night (23:00 - 07:00)',
    hospital: 'City Care Hospital',
    status: 'Active',
    joined: 'Nov 2021',
  },
  {
    id: 6,
    name: 'Samuel Miller',
    role: 'Facility Technicians',
    department: 'Facility & Equipment Operations',
    shift: 'Day (08:00 - 16:00)',
    hospital: 'St. Jude Healthcare',
    status: 'Active',
    joined: 'Aug 2023',
  },
];

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState(INITIAL_STAFF);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: 'Nurses',
    department: '',
    shift: 'Morning (07:00 - 15:00)',
    hospital: 'City Care Hospital',
  });

  const filtered = staffMembers.filter((s) => {
    const matchRole = roleFilter === 'All' || s.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.hospital.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const activeStaff = staffMembers.filter((s) => s.status === 'Active').length;
  const nurseCount = staffMembers.filter((s) => s.role === 'Nurses').length;

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newMember = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role,
      department: formData.department.trim() || 'General Operations',
      shift: formData.shift,
      hospital: formData.hospital,
      status: 'Active',
      joined: 'Just Now',
    };

    setStaffMembers([newMember, ...staffMembers]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      role: 'Nurses',
      department: '',
      shift: 'Morning (07:00 - 15:00)',
      hospital: 'City Care Hospital',
    });
  };

  return (
    <div className="super-dashboard">
      {/* Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Users size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Healthcare Staff & Employee Roster</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Nurses, pharmacists, dietitians, technicians and clinical volunteers across partner facilities
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
            <span>Onboard Staff Member</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => setRoleFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: roleFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: roleFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: roleFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: roleFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all employed staff"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Employed Staff</span>
            <span className="super-metric-value">{staffMembers.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: roleFilter === 'All' ? 700 : 500,
              }}
            >
              {roleFilter === 'All' ? '● Active: All Staff' : `${activeStaff} Active on Duty`}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Users size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setRoleFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid #eaeff5',
            background: '#ffffff',
          }}
          title="All 3 shifts staffed"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Shift Coverage</span>
            <span className="super-metric-value">100%</span>
            <span className="super-metric-trend positive">All 3 Shifts Staffed</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setRoleFilter('Nurses')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: roleFilter === 'Nurses' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: roleFilter === 'Nurses' ? '#f5f3ff' : '#ffffff',
            boxShadow: roleFilter === 'Nurses' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: roleFilter === 'Nurses' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter nursing personnel"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Nursing Team</span>
            <span className="super-metric-value">{nurseCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'Nurses' ? '#6366f1' : '#64748b',
                fontWeight: roleFilter === 'Nurses' ? 700 : 500,
              }}
            >
              {roleFilter === 'Nurses' ? '● Active: Nursing Team' : 'ICU & Emergency Certified'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <Briefcase size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setRoleFilter(roleFilter === 'Lab Technicians' ? 'All' : 'Lab Technicians')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: roleFilter === 'Lab Technicians' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: roleFilter === 'Lab Technicians' ? '#f0f9ff' : '#ffffff',
            boxShadow: roleFilter === 'Lab Technicians' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
          }}
          title="Click to filter lab technicians & diagnostics team"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Lab Technicians</span>
            <span className="super-metric-value">
              {staffMembers.filter((s) => s.role === 'Lab Technicians').length}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'Lab Technicians' ? '#0284c7' : '#64748b',
                fontWeight: roleFilter === 'Lab Technicians' ? 700 : 500,
              }}
            >
              {roleFilter === 'Lab Technicians' ? '● Active: Lab Staff' : 'Diagnostics & Pathology'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Main Panel Card */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Staff & Clinical Employees ({filtered.length})</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={15} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search staff, dept, hospital..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="super-select-dropdown"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Nurses">Nurses</option>
              <option value="Volunteers">Volunteers</option>
              <option value="Pharmacists">Pharmacists</option>
              <option value="Dietitians">Dietitians</option>
              <option value="Facility Technicians">Facility Technicians</option>
            </select>
          </div>
        </div>

        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role Category</th>
                <th>Department Assignment</th>
                <th>Assigned Facility</th>
                <th>Operational Shift</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      {s.name}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Joined: {s.joined}</span>
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
                      {s.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{s.department}</td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{s.hospital}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <Clock size={13} />
                      <span>{s.shift}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`super-status-pill ${s.status === 'Active' ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setStaffMembers(
                          staffMembers.map((item) =>
                            item.id === s.id
                              ? { ...item, status: item.status === 'Active' ? 'InActive' : 'Active' }
                              : item
                          )
                        );
                      }}
                    >
                      <span className="status-dot" />
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      title="Remove Staff"
                      onClick={() => {
                        if (window.confirm(`Remove ${s.name} from directory?`)) {
                          setStaffMembers(staffMembers.filter((item) => item.id !== s.id));
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

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsModalOpen(false)}>
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
                  <Users size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Onboard Staff Member</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Register and assign clinical or support staff</span>
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

            <form onSubmit={handleAddStaff}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Employee Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Role Category</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="Nurses">Nurses</option>
                      <option value="Volunteers">Volunteers</option>
                      <option value="Pharmacists">Pharmacists</option>
                      <option value="Dietitians">Dietitians</option>
                      <option value="Facility Technicians">Facility Technicians</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Intensive Care Unit"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assigned Shift</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    >
                      <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                      <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                      <option value="Night (23:00 - 07:00)">Night (23:00 - 07:00)</option>
                      <option value="Regular (09:00 - 17:00)">Regular (09:00 - 17:00)</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assigned Facility</label>
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
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;

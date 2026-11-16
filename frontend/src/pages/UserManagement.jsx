import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Lock,
  Search,
  CheckCircle2,
  Trash2,
  X,
  Users,
  Shield,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL_USERS = [
  { id: 1, name: 'Dr. Robert', email: 'admin@medy.com', role: 'Super Administrator', permissions: 'Full Access (Root)', twoFactor: 'Enforced', status: 'Active', lastLogin: 'Just Now' },
  { id: 2, name: 'Dr. John Darwin', email: 'j.darwin@medy.com', role: 'Department Head', permissions: 'Clinical + Department Admin', twoFactor: 'Enforced', status: 'Active', lastLogin: '2 Hours Ago' },
  { id: 3, name: 'Elena Rostova', email: 'elena.r@medy.com', role: 'Staff Supervisor', permissions: 'Ward Operations & Staff Schedules', twoFactor: 'Enforced', status: 'Active', lastLogin: 'Yesterday' },
  { id: 4, name: 'Marcus Brody', email: 'm.brody@medy.com', role: 'Facility Auditor', permissions: 'Hospital Read-only Compliance', twoFactor: 'Enforced', status: 'Active', lastLogin: '3 Days Ago' },
  { id: 5, name: 'Dr. Sarah Connor', email: 's.connor@medy.com', role: 'Claims Officer', permissions: 'Medi Card Review & Verification', twoFactor: 'Enforced', status: 'Active', lastLogin: '5 Hours Ago' },
];

const UserManagement = () => {
  const { admin } = useAuth();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Department Head',
    permissions: 'Clinical + Department Admin',
  });

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const activeCount = users.filter((u) => u.status === 'Active').length;

  const handleInviteUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser = {
      id: Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      permissions: formData.permissions,
      twoFactor: 'Enforced',
      status: 'Active',
      lastLogin: 'Invitation Sent',
    };

    setUsers([...users, newUser]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      email: '',
      role: 'Department Head',
      permissions: 'Clinical + Department Admin',
    });
  };

  return (
    <div className="super-dashboard">
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Platform User & Role Management</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              System administrators, department directors and governance role assignments
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <button
            type="button"
            className="super-btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus size={16} />
            <span>Invite Platform User</span>
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
          title="Click to view all platform users"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total System Users</span>
            <span className="super-metric-value">{users.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: roleFilter === 'All' ? 700 : 500,
              }}
            >
              {roleFilter === 'All' ? '● Active: All Users' : `${activeCount} Active`}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Users size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setRoleFilter(roleFilter === 'Super Admin' ? 'All' : 'Super Admin')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: roleFilter === 'Super Admin' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: roleFilter === 'Super Admin' ? '#f0fdf4' : '#ffffff',
            boxShadow: roleFilter === 'Super Admin' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: roleFilter === 'Super Admin' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter root super administrators"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Root Administrators</span>
            <span className="super-metric-value">
              {users.filter((u) => u.role === 'Super Admin').length}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'Super Admin' ? '#059669' : '#64748b',
                fontWeight: roleFilter === 'Super Admin' ? 700 : 500,
              }}
            >
              {roleFilter === 'Super Admin' ? '● Active: Root Admin' : 'Full Clearance'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Shield size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setRoleFilter(roleFilter === 'Department Head' ? 'All' : 'Department Head')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: roleFilter === 'Department Head' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: roleFilter === 'Department Head' ? '#f5f3ff' : '#ffffff',
            boxShadow: roleFilter === 'Department Head' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: roleFilter === 'Department Head' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter Department Heads"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Department Heads</span>
            <span className="super-metric-value">
              {users.filter((u) => u.role === 'Department Head').length}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'Department Head' ? '#6366f1' : '#64748b',
                fontWeight: roleFilter === 'Department Head' ? 700 : 500,
              }}
            >
              {roleFilter === 'Department Head' ? '● Active: Dept Heads' : 'Clinical Leads'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <Key size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setRoleFilter(roleFilter === 'Clinical Auditor' ? 'All' : 'Clinical Auditor')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: roleFilter === 'Clinical Auditor' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: roleFilter === 'Clinical Auditor' ? '#f0f9ff' : '#ffffff',
            boxShadow: roleFilter === 'Clinical Auditor' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: roleFilter === 'Clinical Auditor' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter Clinical Auditors"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Clinical Auditors</span>
            <span className="super-metric-value">
              {users.filter((u) => u.role === 'Clinical Auditor').length}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: roleFilter === 'Clinical Auditor' ? '#0284c7' : '#64748b',
                fontWeight: roleFilter === 'Clinical Auditor' ? 700 : 500,
              }}
            >
              {roleFilter === 'Clinical Auditor' ? '● Active: Auditors' : 'Compliance Ledger'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Lock size={22} />
          </div>
        </div>
      </div>

      {/* Main Panel Card */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Platform Governance User Roster ({filtered.length})</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={15} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search user, email or role..."
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
              <option value="Super Administrator">Super Administrator</option>
              <option value="Department Head">Department Head</option>
              <option value="Staff Supervisor">Staff Supervisor</option>
              <option value="Facility Auditor">Facility Auditor</option>
              <option value="Claims Officer">Claims Officer</option>
            </select>
          </div>
        </div>

        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>User / Administrator</th>
                <th>Assigned Role</th>
                <th>Access Scope & Permissions</th>
                <th>Two-Factor Auth</th>
                <th>Status</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{u.email}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{u.permissions}</td>
                  <td>
                    <span className="super-status-pill active">
                      <span className="status-dot" /> {u.twoFactor}
                    </span>
                  </td>
                  <td>
                    <span className={`super-status-pill ${u.status === 'Active' ? 'active' : 'inactive'}`}>
                      <span className="status-dot" /> {u.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.76rem', color: '#64748b' }}>{u.lastLogin}</td>
                  <td style={{ textAlign: 'right' }}>
                    {u.role !== 'Super Administrator' && (
                      <button
                        type="button"
                        className="action-icon-btn delete"
                        title="Revoke User Access"
                        onClick={() => {
                          if (window.confirm(`Revoke access for ${u.name}?`)) {
                            setUsers(users.filter((item) => item.id !== u.id));
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
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
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Invite Platform User</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Provision role-based access for system user</span>
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

            <form onSubmit={handleInviteUser}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Katherine Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="e.g. k.johnson@medy.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role Category</label>
                  <select
                    className="super-select-dropdown"
                    style={{ width: '100%' }}
                    value={formData.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      let permissions = 'Clinical + Department Admin';
                      if (role === 'Staff Supervisor') permissions = 'Ward Operations & Staff Schedules';
                      if (role === 'Facility Auditor') permissions = 'Hospital Read-only Compliance';
                      if (role === 'Claims Officer') permissions = 'Medi Card Review & Verification';
                      setFormData({ ...formData, role, permissions });
                    }}
                  >
                    <option value="Department Head">Department Head</option>
                    <option value="Staff Supervisor">Staff Supervisor</option>
                    <option value="Facility Auditor">Facility Auditor</option>
                    <option value="Claims Officer">Claims Officer</option>
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
                  Send User Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

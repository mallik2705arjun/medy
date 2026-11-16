import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Key,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Save,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSecurity = () => {
  const { admin } = useAuth();
  const [sessionTimeout, setSessionTimeout] = useState('30 Minutes');
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);

  // New admin form
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Regional Hospital Auditor',
    scope: 'Hospital Inspections & Compliance',
    twoFactor: 'Enforced',
  });

  const [adminUsers, setAdminUsers] = useState([
    {
      id: 1,
      name: admin?.username || 'Super Admin',
      email: admin?.email || 'admin@medy.com',
      role: 'Super Administrator',
      scope: 'Full Platform Root Control',
      twoFactor: 'Enforced',
      status: 'Active',
      lastActive: 'Just Now',
    },
    {
      id: 2,
      name: 'Dr. John Darwin',
      email: 'j.darwin@medy.com',
      role: 'Regional Hospital Auditor',
      scope: 'Hospital Inspections & Compliance',
      twoFactor: 'Enforced',
      status: 'Active',
      lastActive: '2 Hours Ago',
    },
    {
      id: 3,
      name: 'Sarah Connor',
      email: 's.connor@medy.com',
      role: 'Claims & Insurance Officer',
      scope: 'Medi Card Issuance & Approvals',
      twoFactor: 'Enabled',
      status: 'Active',
      lastActive: 'Yesterday',
    },
  ]);

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;

    const created = {
      id: Date.now(),
      name: newAdmin.name.trim(),
      email: newAdmin.email.trim(),
      role: newAdmin.role,
      scope: newAdmin.scope,
      twoFactor: newAdmin.twoFactor,
      status: 'Active',
      lastActive: 'Invited Just Now',
    };

    setAdminUsers((prev) => [...prev, created]);

    // Log to audit trail
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({
          action: 'SECURITY_POLICY_UPDATE',
          target: created.email,
          details: `Granted administrative privileges (${created.role}) with 2FA ${created.twoFactor}`,
        }),
      });
    } catch (e) {
      console.error('Audit log failed:', e);
    }

    setIsGrantModalOpen(false);
    setNewAdmin({
      name: '',
      email: '',
      role: 'Regional Hospital Auditor',
      scope: 'Hospital Inspections & Compliance',
      twoFactor: 'Enforced',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleToggleStatus = (id) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteAdmin = (id) => {
    if (window.confirm('Are you sure you want to revoke this administrative account?')) {
      setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="super-dashboard">
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Admin & Security Management</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Manage Super Admin access, security policies, and permissions
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <button className="super-btn-primary" onClick={() => setIsGrantModalOpen(true)}>
            <UserPlus size={16} />
            <span>Grant Admin Access</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} />
          <span>Administrative privileges and security policies updated successfully!</span>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="super-metrics-grid">
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Administrative Accounts</span>
            <span className="super-metric-value">{adminUsers.length}</span>
            <span className="super-metric-trend positive">Active root & delegated roles</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Two-Factor Authentication</span>
            <span className="super-metric-value">100%</span>
            <span className="super-metric-trend positive">TOTP enforced network-wide</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Smartphone size={20} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Session Idle Timeout</span>
            <span className="super-metric-value">{sessionTimeout.split(' ')[0]}m</span>
            <span className="super-metric-trend positive">Strict token revocation</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">RBAC Security Tier</span>
            <span className="super-metric-value">Level 4</span>
            <span className="super-metric-trend positive">Enterprise SOC-2 compliant</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <Lock size={20} />
          </div>
        </div>
      </div>

      {/* Admin Accounts Table */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <h3>Super Admin Accounts & Delegated Roles ({adminUsers.length})</h3>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="super-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Assigned Role</th>
                <th>Scope of Authority</th>
                <th>2FA Security</th>
                <th>Last Active</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div>
                      <strong>{u.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className="table-dept-text" style={{ fontWeight: 600, color: '#0284c7' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.scope}</td>
                  <td>
                    <span className="super-status-pill active">
                      <Smartphone size={12} style={{ marginRight: 3 }} />
                      {u.twoFactor}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.82rem' }}>{u.lastActive}</td>
                  <td>
                    <span
                      className={`super-status-pill ${u.status === 'Active' ? 'active' : 'inactive'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleStatus(u.id)}
                      title="Click to toggle status"
                    >
                      <span className="status-dot"></span>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.role !== 'Super Administrator' && (
                      <button
                        type="button"
                        className="action-icon-btn delete"
                        onClick={() => handleDeleteAdmin(u.id)}
                        title="Revoke Admin Access"
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

      {/* Security Policies and Permissions Grid */}
      <div className="super-charts-grid">
        {/* Security Policy Settings */}
        <div className="super-panel-card">
          <div className="panel-card-header">
            <h3>Global Platform Security Policies</h3>
          </div>

          <form onSubmit={handleSaveSecurity} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Super Admin Session Idle Timeout
              </label>
              <select
                className="super-select-dropdown"
                style={{ width: '100%' }}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
              >
                <option value="15 Minutes">15 Minutes (Strict Security)</option>
                <option value="30 Minutes">30 Minutes (Recommended)</option>
                <option value="1 Hour">1 Hour</option>
                <option value="8 Hours">8 Hours (Standard Shift)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaeff5' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                  Mandatory Two-Factor Authentication (2FA)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Require TOTP/Authenticator app for all administrative logins
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnforced}
                onChange={(e) => setTwoFactorEnforced(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <button type="submit" className="super-btn-primary" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
              <Save size={15} />
              <span>Apply Security Policies</span>
            </button>
          </form>
        </div>

        {/* Role-Based Access Matrix */}
        <div className="super-panel-card">
          <div className="panel-card-header">
            <h3>Role-Based Access Control (RBAC)</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaeff5' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Super Administrator</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                Unrestricted access to Hospital activations, Medy Card generation, database mutations, and system keys.
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaeff5' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Regional Hospital Auditor</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                Read-only inspection rights over clinical appointments, registered patients, and lab diagnostic catalog.
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #eaeff5' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>Claims & Insurance Officer</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                Authority to review digital insurance card applications, approve coverage tiers, and manage card transfers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grant Admin Access Modal */}
      {isGrantModalOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsGrantModalOpen(false)}>
          <div className="super-modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Grant Administrative Access</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Provision new administrative or auditor role</span>
                </div>
              </div>
              <button className="modal-close-icon" onClick={() => setIsGrantModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGrantAccess}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="super-search-input"
                    style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    placeholder="e.g. Dr. Emily Thorne"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="super-search-input"
                    style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    placeholder="e.thorne@medy.com"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Assigned Role *
                  </label>
                  <select
                    className="super-select-dropdown"
                    style={{ width: '100%', height: '38px' }}
                    value={newAdmin.role}
                    onChange={(e) => {
                      const role = e.target.value;
                      let scope = 'Hospital Inspections & Compliance';
                      if (role === 'Claims & Insurance Officer') scope = 'Medi Card Issuance & Approvals';
                      if (role === 'Clinical Lab Lead') scope = 'Diagnostic Laboratory Management';
                      if (role === 'Platform Security Analyst') scope = 'Audit Trail & Access Surveillance';
                      setNewAdmin({ ...newAdmin, role, scope });
                    }}
                  >
                    <option value="Regional Hospital Auditor">Regional Hospital Auditor</option>
                    <option value="Claims & Insurance Officer">Claims & Insurance Officer</option>
                    <option value="Clinical Lab Lead">Clinical Lab Lead</option>
                    <option value="Platform Security Analyst">Platform Security Analyst</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Scope of Authority
                  </label>
                  <input
                    type="text"
                    className="super-search-input"
                    style={{ width: '100%', height: '38px', padding: '0.5rem 0.75rem' }}
                    value={newAdmin.scope}
                    onChange={(e) => setNewAdmin({ ...newAdmin, scope: e.target.value })}
                  />
                </div>
              </div>

              <div className="super-modal-footer">
                <button type="button" className="super-btn-secondary" onClick={() => setIsGrantModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="super-btn-primary">
                  <UserPlus size={15} />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurity;

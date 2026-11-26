import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Filter, AlertCircle, CheckCircle2, Building2, ShieldAlert, CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuditLogs = () => {
  const { admin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/audit-logs', {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data || []);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!admin?.token) return;
    fetchLogs();
    // Live background polling every 5 seconds to ensure immediate governance updates
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [admin]);

  const distinctActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean))).sort();

  const hospitalOpsCount = logs.filter(
    (l) => (l.action || '').includes('HOSPITAL') || (l.action || '').includes('BED')
  ).length;
  const cardPatientCount = logs.filter(
    (l) =>
      (l.action || '').includes('MEDY_CARD') ||
      (l.action || '').includes('MEDICARD') ||
      (l.action || '').includes('CARD') ||
      (l.action || '').includes('PATIENT')
  ).length;
  const clinicalSecurityCount = logs.filter(
    (l) =>
      (l.action || '').includes('LAB') ||
      (l.action || '').includes('APPOINTMENT') ||
      (l.action || '').includes('SECURITY') ||
      (l.action || '').includes('LOGIN') ||
      (l.action || '').includes('ADMIN')
  ).length;

  const filtered = logs.filter((log) => {
    let matchAction = true;
    if (actionFilter === 'HOSPITAL_EVENTS') {
      matchAction = (log.action || '').includes('HOSPITAL') || (log.action || '').includes('BED');
    } else if (actionFilter === 'CARD_PATIENT_EVENTS') {
      matchAction =
        (log.action || '').includes('MEDY_CARD') ||
        (log.action || '').includes('MEDICARD') ||
        (log.action || '').includes('CARD') ||
        (log.action || '').includes('PATIENT');
    } else if (actionFilter === 'CLINICAL_SECURITY_EVENTS') {
      matchAction =
        (log.action || '').includes('LAB') ||
        (log.action || '').includes('APPOINTMENT') ||
        (log.action || '').includes('SECURITY') ||
        (log.action || '').includes('LOGIN') ||
        (log.action || '').includes('ADMIN');
    } else if (actionFilter !== 'All') {
      matchAction = log.action === actionFilter;
    }

    return matchAction;
  });

  const getActionBadgeColor = (action = '') => {
    const act = (action || '').toUpperCase();
    if (
      act.includes('DELETE') ||
      act.includes('DEACTIVATE') ||
      act.includes('CANCEL') ||
      act.includes('REJECT') ||
      act.includes('FAILED') ||
      act.includes('HOLD') ||
      act.includes('REVOKE')
    ) {
      return { bg: '#fee2e2', color: '#b91c1c' };
    }
    if (act.includes('HOSPITAL_ADMIN') || act.includes('ADMIN') || act.includes('SECURITY') || act.includes('LOGIN')) {
      return { bg: '#fffbeb', color: '#b45309' };
    }
    if (act.includes('HOSPITAL') || act.includes('BED')) {
      return { bg: '#e0f2fe', color: '#0284c7' };
    }
    if (act.includes('MEDY_CARD') || act.includes('MEDICARD') || act.includes('CARD')) {
      return { bg: '#f5f3ff', color: '#6d28d9' };
    }
    if (act.includes('PATIENT')) {
      return { bg: '#f0fdfa', color: '#0f766e' };
    }
    if (act.includes('LAB') || act.includes('APPOINTMENT')) {
      return { bg: '#ecfeff', color: '#0891b2' };
    }
    return { bg: '#f1f5f9', color: '#334155' };
  };

  return (
    <div className="super-dashboard">
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <History size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Audit Logs & Governance</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Track who performed which action and when across the entire healthcare network
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <select
            className="super-select-dropdown"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="All">All Audit Actions ({logs.length})</option>
            <optgroup label="Event Categories">
              <option value="HOSPITAL_EVENTS">🏥 Hospital Governance ({hospitalOpsCount})</option>
              <option value="CARD_PATIENT_EVENTS">💳 Medy Cards & Patients ({cardPatientCount})</option>
              <option value="CLINICAL_SECURITY_EVENTS">🛡️ Clinical, Security & Admins ({clinicalSecurityCount})</option>
            </optgroup>
            {distinctActions.length > 0 && (
              <optgroup label="Logged Actions">
                {distinctActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* 4 Interactive KPI Metric Cards */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => setActionFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: actionFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: actionFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: actionFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: actionFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all audit log records"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Audit Trail</span>
            <span className="super-metric-value">{logs.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: actionFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: actionFilter === 'All' ? 700 : 500,
              }}
            >
              {actionFilter === 'All' ? '● Active: All Events' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <History size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setActionFilter(actionFilter === 'HOSPITAL_EVENTS' ? 'All' : 'HOSPITAL_EVENTS')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: actionFilter === 'HOSPITAL_EVENTS' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: actionFilter === 'HOSPITAL_EVENTS' ? '#f0fdf4' : '#ffffff',
            boxShadow: actionFilter === 'HOSPITAL_EVENTS' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: actionFilter === 'HOSPITAL_EVENTS' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter hospital governance events"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Hospital Operations</span>
            <span className="super-metric-value">{hospitalOpsCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: actionFilter === 'HOSPITAL_EVENTS' ? '#059669' : '#64748b',
                fontWeight: actionFilter === 'HOSPITAL_EVENTS' ? 700 : 500,
              }}
            >
              {actionFilter === 'HOSPITAL_EVENTS' ? '● Active: Hospital Ops' : 'Hospitals & Beds'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Building2 size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setActionFilter(actionFilter === 'CARD_PATIENT_EVENTS' ? 'All' : 'CARD_PATIENT_EVENTS')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: actionFilter === 'CARD_PATIENT_EVENTS' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: actionFilter === 'CARD_PATIENT_EVENTS' ? '#f5f3ff' : '#ffffff',
            boxShadow: actionFilter === 'CARD_PATIENT_EVENTS' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: actionFilter === 'CARD_PATIENT_EVENTS' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter Medy Card and patient events"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Cards & Patients</span>
            <span className="super-metric-value">{cardPatientCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: actionFilter === 'CARD_PATIENT_EVENTS' ? '#6366f1' : '#64748b',
                fontWeight: actionFilter === 'CARD_PATIENT_EVENTS' ? 700 : 500,
              }}
            >
              {actionFilter === 'CARD_PATIENT_EVENTS' ? '● Active: Cards & Patients' : 'Issuance & Registrations'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <CreditCard size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setActionFilter(actionFilter === 'CLINICAL_SECURITY_EVENTS' ? 'All' : 'CLINICAL_SECURITY_EVENTS')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: actionFilter === 'CLINICAL_SECURITY_EVENTS' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: actionFilter === 'CLINICAL_SECURITY_EVENTS' ? '#fffbeb' : '#ffffff',
            boxShadow: actionFilter === 'CLINICAL_SECURITY_EVENTS' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
            transform: actionFilter === 'CLINICAL_SECURITY_EVENTS' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter clinical diagnostics & security events"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Clinical & Security</span>
            <span className="super-metric-value">{clinicalSecurityCount}</span>
            <span
              className="super-metric-trend"
              style={{
                color: actionFilter === 'CLINICAL_SECURITY_EVENTS' ? '#d97706' : '#64748b',
                fontWeight: actionFilter === 'CLINICAL_SECURITY_EVENTS' ? 700 : 500,
              }}
            >
              {actionFilter === 'CLINICAL_SECURITY_EVENTS' ? '● Active: Clinical & Security' : 'Labs, Appointments & Auth'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      <div className="super-panel-card">
        <div className="panel-card-header">
          <h3>Immutable Audit Trail Records ({filtered.length})</h3>
        </div>

        <div className="table-responsive">
          <table className="super-table">
            <thead>
              <tr>
                <th>Timestamp (UTC+5:30)</th>
                <th>Action Performed</th>
                <th>Initiator / Actor</th>
                <th>Target Resource</th>
                <th>Event Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, idx) => {
                const badgeStyle = getActionBadgeColor(log.action);
                return (
                  <tr key={log._id || log.timestamp || idx}>
                    <td style={{ whiteSpace: 'nowrap', color: '#475569', fontSize: '0.82rem' }}>
                      {new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.55rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: badgeStyle.bg,
                          color: badgeStyle.color,
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <strong>{log.actor}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{log.role}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{log.target}</span>
                    </td>
                    <td style={{ color: '#334155', maxWidth: '340px' }}>{log.details}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: log.status === 'Success' ? '#ecfdf5' : log.status === 'Warning' ? '#fffbeb' : '#fef2f2',
                          color: log.status === 'Success' ? '#047857' : log.status === 'Warning' ? '#b45309' : '#dc2626',
                          border: `1px solid ${log.status === 'Success' ? '#a7f3d0' : log.status === 'Warning' ? '#fde68a' : '#fecaca'}`,
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: log.status === 'Success' ? '#10b981' : log.status === 'Warning' ? '#f59e0b' : '#ef4444',
                          }}
                        />
                        {log.status || 'Success'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;


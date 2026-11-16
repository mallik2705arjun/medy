import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Activity,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TIME_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 15 Days', days: 15 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 6 Months', days: 180 },
  { label: 'All Time', days: 0 },
];

const ReportsAnalytics = () => {
  const { admin } = useAuth();
  const [reportsData, setReportsData] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const selectedObj = TIME_RANGES.find((r) => r.label === timeRange) || { days: 7 };
        const params = new URLSearchParams();
        params.append('range', timeRange);
        params.append('days', selectedObj.days);

        const res = await fetch(`/api/reports/analytics?${params.toString()}`, {
          headers: { Authorization: `Bearer ${admin?.token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setReportsData(data);
        }
      } catch (e) {
        console.error('Error fetching analytics report:', e);
      } finally {
        setLoading(false);
      }
    };

    if (admin?.token) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [admin, timeRange]);

  const summary = reportsData?.summary || {
    totalHospitals: 0,
    activeHospitals: 0,
    totalPatients: 0,
    allTimePatients: 0,
    totalCards: 0,
    allTimeCards: 0,
    totalAppointments: 0,
    allTimeAppointments: 0,
    totalLabTests: 0,
    allTimeLabTests: 0,
    totalCoverage: 0,
    totalRevenue: 0,
    satisfactionRate: '98.6%',
  };

  const monthlyTrends = reportsData?.monthlyTrends || reportsData?.trends || [];
  const hospitalDistribution = reportsData?.hospitalDistribution || [];

  const isDaily = timeRange === 'Last 7 Days' || timeRange === 'Last 15 Days' || timeRange === 'Last 30 Days';

  return (
    <div className="super-dashboard">
      {/* 1. Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Reports & Analytics</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Real-time analytics and performance reports across all network hospitals
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Days Selector Pills */}
          <div className="view-mode-toggle" style={{ display: 'flex' }}>
            {TIME_RANGES.map((r) => (
              <button
                key={r.label}
                type="button"
                className={`mode-btn ${timeRange === r.label ? 'active' : ''}`}
                onClick={() => setTimeRange(r.label)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: timeRange === r.label ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Fallback Dropdown Selector */}
          <select
            className="super-select-dropdown"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ minWidth: '150px' }}
          >
            {TIME_RANGES.map((r) => (
              <option key={r.label} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="super-metrics-grid">
        {/* Metric 1: Network Hospitals */}
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Network Hospitals</span>
            <span className="super-metric-value">{summary.totalHospitals}</span>
            <span className="super-metric-trend positive" style={{ color: '#0284c7' }}>
              {summary.activeHospitals} Active Facilities
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <Building2 size={20} />
          </div>
        </div>

        {/* Metric 2: Enrolled Patients in Period */}
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Patients in {timeRange}</span>
            <span className="super-metric-value">{summary.totalPatients}</span>
            <span className="super-metric-trend positive">
              All-Time: {summary.allTimePatients || summary.totalPatients} Patients
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Users size={20} />
          </div>
        </div>

        {/* Metric 3: Appointments Booked in Period */}
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Appointments in {timeRange}</span>
            <span className="super-metric-value">{summary.totalAppointments}</span>
            <span className="super-metric-trend positive" style={{ color: '#0284c7' }}>
              All-Time: {summary.allTimeAppointments || summary.totalAppointments} Booked
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <Calendar size={20} />
          </div>
        </div>

        {/* Metric 4: Platform Revenue / Cards in Period */}
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Revenue ({timeRange})</span>
            <span className="super-metric-value" style={{ color: '#0f172a' }}>
              ₹{Number(summary.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="super-metric-trend positive" style={{ color: '#059669' }}>
              {summary.totalCards} Medi Cards Issued
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#059669' }}>
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="super-charts-grid">
        {/* Performance Timeline Table */}
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                {isDaily ? 'Daily Activity Breakdown' : 'Monthly Performance Timeline'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Showing patient registrations, appointments, and revenue for <strong>{timeRange}</strong>
              </p>
            </div>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                background: '#e0f2fe',
                color: '#0284c7',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: '1px solid #bae6fd',
              }}
            >
              ● Filtered: {timeRange}
            </span>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
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
                <span>Updating reports for {timeRange}...</span>
              </div>
            ) : monthlyTrends.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <Activity size={36} style={{ color: '#94a3b8', margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ color: '#0f172a', margin: '0 0 0.25rem 0' }}>No Records in this Timeframe</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Try selecting a wider range like Last 30 Days or All Time.</p>
              </div>
            ) : (
              <table className="super-table">
                <thead>
                  <tr>
                    <th>{isDaily ? 'Date' : 'Month / Period'}</th>
                    <th>New Patients</th>
                    <th>Doctor Appointments</th>
                    <th>Lab Tests</th>
                    <th>Estimated Revenue</th>
                    <th>Activity Status</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrends.map((t, idx) => (
                    <tr key={`${t.period}-${idx}`}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#0f172a' }}>
                          <Clock size={13} style={{ color: '#0284c7' }} />
                          <span>{t.period}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {t.patients ? t.patients.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0284c7' }}>
                          {t.appointments ? t.appointments.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#64748b' }}>
                          {t.labTests ? t.labTests.toLocaleString() : '0'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#059669' }}>
                          ₹{Number(t.revenue || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span
                          className="super-status-pill"
                          style={{
                            background: (t.appointments > 0 || t.patients > 0) ? '#f0fdf4' : '#f8fafc',
                            color: (t.appointments > 0 || t.patients > 0) ? '#16a34a' : '#94a3b8',
                            border: (t.appointments > 0 || t.patients > 0) ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          <TrendingUp size={12} />
                          {(t.appointments > 0 || t.patients > 0) ? 'Active' : 'Idle'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Hospital Patient Distribution */}
        <div className="super-panel-card">
          <div className="panel-card-header">
            <h3>Hospital Volume Distribution</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Patient enrollments across partner facilities ({timeRange})
            </p>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            {hospitalDistribution.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No hospital distribution data available.</p>
            ) : (
              <ul className="patients-legend-list" style={{ gap: '1rem', listStyle: 'none', padding: 0 }}>
                {hospitalDistribution.map((h, i) => (
                  <li key={i} className="legend-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#10b981', '#f59e0b'][i % 6],
                          display: 'inline-block',
                        }}
                      />
                      <span className="legend-name" style={{ fontWeight: 600, color: '#0f172a' }}>
                        {h.name}
                      </span>
                    </div>
                    <span className="legend-val" style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                      {h.count} Patient{h.count === 1 ? '' : 's'} • {h.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div
              style={{
                marginTop: '1.75rem',
                padding: '1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
                  Network Clinical Quality & Satisfaction
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  {summary.satisfactionRate || '98.6%'} Operational Status
                </div>
              </div>
              <FileSpreadsheet size={24} color="#0284c7" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

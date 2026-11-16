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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReportsAnalytics = () => {
  const { admin } = useAuth();
  const [reportsData, setReportsData] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reports/analytics', {
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

    if (admin?.token) fetchAnalytics();
  }, [admin]);

  const summary = reportsData?.summary || {
    totalHospitals: 6,
    activeHospitals: 6,
    totalPatients: 15,
    totalCards: 85,
    totalAppointments: 25,
    totalLabTests: 15,
    totalCoverage: 42500000,
    satisfactionRate: '98.4%',
  };

  const monthlyTrends = reportsData?.monthlyTrends || [
    { month: 'May', patients: 1850, appointments: 620, revenue: 28000 },
    { month: 'Jun', patients: 2100, appointments: 740, revenue: 32500 },
    { month: 'Jul', patients: 2450, appointments: 890, revenue: 39000 },
    { month: 'Aug', patients: 2900, appointments: 960, revenue: 44000 },
    { month: 'Sep', patients: 3200, appointments: 1020, revenue: 49500 },
    { month: 'Oct', patients: 3550, appointments: 1079, revenue: 55000 },
  ];

  return (
    <div className="super-dashboard">
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Reports & Analytics</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              View comprehensive hospital, patient, and platform reports
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          <select
            className="super-select-dropdown"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Year to Date">Year to Date</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="super-metrics-grid">
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Network Hospitals</span>
            <span className="super-metric-value">{summary.totalHospitals}</span>
            <span className="super-metric-trend positive">{summary.activeHospitals} Active Facilities</span>
          </div>
          <div className="super-metric-icon-wrap">
            <Building2 size={20} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Enrolled Patients</span>
            <span className="super-metric-value">{summary.totalPatients}</span>
            <span className="super-metric-trend positive">+18.5% Growth</span>
          </div>
          <div className="super-metric-icon-wrap">
            <Users size={20} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Insurance Coverage Pool</span>
            <span className="super-metric-value">$42.5M</span>
            <span className="super-metric-trend positive">{summary.totalCards} Issued Medi Cards</span>
          </div>
          <div className="super-metric-icon-wrap">
            <CreditCard size={20} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Fulfillment Quality</span>
            <span className="super-metric-value">{summary.satisfactionRate}</span>
            <span className="super-metric-trend positive">Clinical Rating</span>
          </div>
          <div className="super-metric-icon-wrap">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="super-charts-grid">
        {/* Monthly Performance Timeline */}
        <div className="super-panel-card">
          <div className="panel-card-header">
            <h3>Monthly Patient Growth & Appointments</h3>
          </div>

          <div className="table-responsive">
            <table className="super-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>New Patients</th>
                  <th>Appointments</th>
                  <th>Monthly Revenue</th>
                  <th>Growth Trend</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrends.map((t) => (
                  <tr key={t.month}>
                    <td><strong>{t.month}</strong></td>
                    <td>{t.patients.toLocaleString()}</td>
                    <td>{t.appointments.toLocaleString()}</td>
                    <td>${t.revenue.toLocaleString()}</td>
                    <td>
                      <span className="super-status-pill active">
                        <TrendingUp size={12} style={{ marginRight: 3 }} />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hospital Patient Distribution */}
        <div className="super-panel-card">
          <div className="panel-card-header">
            <h3>Hospital Volume Distribution</h3>
          </div>

          <div style={{ padding: '0.5rem 0' }}>
            <ul className="patients-legend-list" style={{ gap: '1rem' }}>
              <li className="legend-row">
                <span className="legend-dot dot-followup"></span>
                <span className="legend-name" style={{ fontWeight: 600 }}>City Care Hospital</span>
                <span className="legend-val">340 Patients • 48%</span>
              </li>
              <li className="legend-row">
                <span className="legend-dot dot-transferred"></span>
                <span className="legend-name" style={{ fontWeight: 600 }}>Apollo Specialty Hospital</span>
                <span className="legend-val">210 Patients • 26%</span>
              </li>
              <li className="legend-row">
                <span className="legend-dot dot-admitted"></span>
                <span className="legend-name" style={{ fontWeight: 600 }}>Metro Care Multi-Specialty</span>
                <span className="legend-val">150 Patients • 16%</span>
              </li>
              <li className="legend-row">
                <span className="legend-dot dot-discharged"></span>
                <span className="legend-name" style={{ fontWeight: 600 }}>Other Network Clinics</span>
                <span className="legend-val">80 Patients • 10%</span>
              </li>
            </ul>

            <div style={{ marginTop: '1.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Aggregate Network Capacity</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>100% Operational Status</div>
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


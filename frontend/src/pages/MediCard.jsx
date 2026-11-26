import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  X,
  Clock,
  Building2,
  Copy,
  Check,
  MapPin,
  Filter,
  User,
  Shield,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MedyCardPreview from '../components/MedyCardPreview';

const PRESET_COLORS = [
  {
    id: 'blue',
    name: 'Sky Medical',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #38bdf8 100%)',
    accent: '#93c5fd',
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)',
    accent: '#a7f3d0',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    gradient: 'linear-gradient(135deg, #3b0764 0%, #6366f1 60%, #8b5cf6 100%)',
    accent: '#c4b5fd',
  },
  {
    id: 'amber',
    name: 'Golden Amber',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 60%, #f59e0b 100%)',
    accent: '#fde68a',
  },
];

const getHospitalColorTheme = (hospitalName = '') => {
  let hash = 0;
  for (let i = 0; i < hospitalName.length; i++) {
    hash = hospitalName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESET_COLORS.length;
  return PRESET_COLORS[index];
};

const MediCard = () => {
  const { admin, logout } = useAuth();

  // Core Data
  const [hospitals, setHospitals] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedHospitalName, setSelectedHospitalName] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Blocked'
  const [planFilter, setPlanFilter] = useState('All'); // 'All' | 'Platinum' | 'Gold' | 'Silver' | 'Standard'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [viewingCard, setViewingCard] = useState(null);
  const [cardToBlock, setCardToBlock] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  // Feedback
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Hospitals
  const fetchHospitals = async () => {
    try {
      const res = await fetch('/api/hospitals', {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals(data || []);
      }
    } catch (e) {
      console.error('Fetch hospitals error:', e);
    }
  };

  // Fetch Hospital Issuance Allocations / Summaries
  const fetchAllocations = async () => {
    try {
      const res = await fetch('/api/medicards/hospital-allocations', {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllocations(data || []);
      }
    } catch (e) {
      console.error('Fetch allocations error:', e);
    }
  };

  // Fetch All Cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedHospitalName && selectedHospitalName !== 'All') {
        params.append('hospital', selectedHospitalName);
      }
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/medicards?${params.toString()}`, {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (err) {
      console.error('Fetch cards error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) {
      fetchHospitals();
      fetchAllocations();
    }
  }, [admin]);

  useEffect(() => {
    if (admin?.token) {
      fetchCards();
    } else {
      setLoading(false);
    }
  }, [admin, selectedHospitalName, statusFilter, searchQuery]);

  // Overall Network Metrics
  const stats = useMemo(() => {
    const total = cards.length;
    const active = cards.filter((c) => c.status === 'Active').length;
    const blocked = cards.filter((c) => c.status === 'Blocked').length;
    const hospitalsWithIssuances = new Set(cards.map((c) => c.hospitalName).filter(Boolean)).size;

    return { total, active, blocked, hospitalsCount: hospitalsWithIssuances || allocations.length };
  }, [cards, allocations]);

  // Filtered Cards for Display (supporting plan tier filter as well)
  const displayedCards = useMemo(() => {
    return cards.filter((card) => {
      if (planFilter !== 'All' && (card.insurancePlan || 'Standard') !== planFilter) {
        return false;
      }
      return true;
    });
  }, [cards, planFilter]);

  // Handle Regulatory Freeze / Block / Unblock
  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    if (!cardToBlock) return;

    const newStatus = cardToBlock.status === 'Active' ? 'Blocked' : 'Active';

    try {
      setBlockSubmitting(true);
      const res = await fetch(`/api/medicards/${cardToBlock._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          reason: blockReason.trim() || `Administrative regulatory update: Card marked ${newStatus}`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setCards((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
        if (viewingCard && viewingCard._id === updated._id) {
          setViewingCard(updated);
        }
        setSuccessMessage(`Card ${updated.cardId} status set to ${newStatus}.`);
        setTimeout(() => setSuccessMessage(''), 4000);
        setCardToBlock(null);
        setBlockReason('');
        fetchAllocations();
      }
    } catch (e) {
      console.error('Update card status error:', e);
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleCopyCardId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="super-dashboard">
      {/* 1. Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <CreditCard size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Medy Card Management</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Central oversight and regulatory monitoring of digital Medi Cards issued by partner hospitals to patients
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group">
          {/* Filter by Issuing Hospital */}
          <select
            className="super-select-dropdown"
            value={selectedHospitalName}
            onChange={(e) => setSelectedHospitalName(e.target.value)}
          >
            <option value="All">All Issuing Hospitals ({hospitals.length})</option>
            {hospitals.map((hosp) => (
              <option key={hosp._id || hosp.name} value={hosp.name}>
                {hosp.name} — {hosp.city}
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

      {/* 2. Invision 4-Metrics Grid: Central Network Monitoring (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => {
            setStatusFilter('All');
            setSelectedHospitalName('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'All' && selectedHospitalName === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: statusFilter === 'All' && selectedHospitalName === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: statusFilter === 'All' && selectedHospitalName === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.2)' : 'none',
            transform: statusFilter === 'All' && selectedHospitalName === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all issued patient cards"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Patient Cards Issued</span>
            <span className="super-metric-value">{stats.total}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: statusFilter === 'All' && selectedHospitalName === 'All' ? '#0284c7' : '#64748b',
                fontWeight: statusFilter === 'All' && selectedHospitalName === 'All' ? 700 : 500,
              }}
            >
              {statusFilter === 'All' && selectedHospitalName === 'All' ? '● Active: All Cards' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)' }}>
            <CreditCard size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('Active')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Active' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: statusFilter === 'Active' ? '#f0fdf4' : '#ffffff',
            boxShadow: statusFilter === 'Active' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: statusFilter === 'Active' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter active cards"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active & Valid In Circulation</span>
            <span className="super-metric-value">{stats.active}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: statusFilter === 'Active' ? '#059669' : '#64748b',
                fontWeight: statusFilter === 'Active' ? 700 : 500,
              }}
            >
              {statusFilter === 'Active' ? '● Active: Active Only' : 'Click to filter active'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <ShieldCheck size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStatusFilter('Blocked')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: statusFilter === 'Blocked' ? '2px solid #ef4444' : '1px solid #eaeff5',
            background: statusFilter === 'Blocked' ? '#fef2f2' : '#ffffff',
            boxShadow: statusFilter === 'Blocked' ? '0 4px 16px rgba(239, 68, 68, 0.16)' : 'none',
            transform: statusFilter === 'Blocked' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter blocked cards"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Regulatory Hold / Blocked</span>
            <span className="super-metric-value">{stats.blocked}</span>
            <span
              className="super-metric-trend negative"
              style={{
                color: statusFilter === 'Blocked' ? '#dc2626' : '#64748b',
                fontWeight: statusFilter === 'Blocked' ? 700 : 500,
              }}
            >
              {statusFilter === 'Blocked' ? '● Active: Blocked Only' : 'Click to filter blocked'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#ef4444' }}>
            <ShieldAlert size={20} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setSelectedHospitalName('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: selectedHospitalName !== 'All' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: selectedHospitalName !== 'All' ? '#fffbeb' : '#ffffff',
            boxShadow: selectedHospitalName !== 'All' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
          }}
          title="Click to reset facility filter"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Issuing Partner Facilities</span>
            <span className="super-metric-value">{stats.hospitalsCount}</span>
            <span className="super-metric-trend positive">
              {selectedHospitalName !== 'All' ? `Filtered: ${selectedHospitalName}` : 'All partner hospitals'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <Building2 size={20} />
          </div>
        </div>
      </div>

      {/* 3. Hospital Issuance Performance Strip */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Hospital Issuance Distribution</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Volume of digital Medi Cards issued by each partner facility to registered patients
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          {allocations.map((alloc) => {
            const isSelected = selectedHospitalName === alloc.hospitalName;
            return (
              <div
                key={alloc.hospitalId || alloc.hospitalName}
                onClick={() =>
                  setSelectedHospitalName(isSelected ? 'All' : alloc.hospitalName)
                }
                style={{
                  background: isSelected ? '#e0f2fe' : '#f8fafc',
                  border: `1.5px solid ${isSelected ? '#0284c7' : '#eaeff5'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      background: isSelected ? '#0284c7' : '#eaeff5',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontFamily: 'monospace',
                    }}
                  >
                    {alloc.hospitalCode || 'MED'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>
                    {alloc.activeCards || 0} Active
                  </span>
                </div>

                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {alloc.hospitalName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {alloc.hospitalCity}
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #eaeff5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cards Issued:</span>
                  <span style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.1rem' }}>
                    {alloc.totalIssued || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Central Registry of Issued Patient Cards */}
      <div className="super-panel-card">
        <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3>Issued Patient Cards Registry ({displayedCards.length})</h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              {selectedHospitalName === 'All' ? 'Managing and tracking patient cards across all network hospitals' : `Filtered for ${selectedHospitalName}`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Filter Toggle */}
            <div className="view-mode-toggle">
              {['All', 'Active', 'Blocked'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`mode-btn ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'All' ? 'All Cards' : st}
                </button>
              ))}
            </div>

            {/* Plan Tier Filter */}
            <select
              className="super-select-dropdown"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="All">All Coverage Plans</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Standard">Standard</option>
            </select>

            {/* Search Input */}
            <div className="super-nav-search" style={{ width: '250px' }}>
              <Search size={16} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search card ID, patient, hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
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

        {/* Cards Table */}
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
              <span>Loading patient cards registry...</span>
            </div>
          ) : displayedCards.length === 0 ? (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
              <CreditCard size={40} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 0.35rem 0' }}>No Patient Cards Found</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                {searchQuery || statusFilter !== 'All' || planFilter !== 'All'
                  ? 'No patient cards match your current search or status filter.'
                  : 'No Medi Cards have been issued by hospitals to patients yet.'}
              </p>
            </div>
          ) : (
            <table className="super-table">
              <thead>
                <tr>
                  <th>Card ID & Serial #</th>
                  <th>Cardholder Patient</th>
                  <th>Issuing Hospital</th>
                  <th>Coverage Plan</th>
                  <th>Valid Thru</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Governance Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedCards.map((card) => (
                  <tr key={card._id}>
                    <td>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7', fontSize: '0.875rem' }}>
                            {card.cardId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCardId(card.cardId)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedId === card.cardId ? '#10b981' : '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="Copy Card ID"
                          >
                            {copiedId === card.cardId ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Serial #{String(card.serialNumber || 1).padStart(4, '0')}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {card.patientName && card.patientName !== 'Unassigned'
                            ? card.patientName
                            : 'Registered Patient'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {card.patientPhone ? card.patientPhone : card.patientGender ? `${card.patientGender}` : 'Cardholder'}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Building2 size={15} style={{ color: '#0284c7' }} />
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{card.hospitalName}</span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background:
                              card.insurancePlan === 'Platinum'
                                ? '#f3e8ff'
                                : card.insurancePlan === 'Gold'
                                  ? '#fef3c7'
                                  : '#e0f2fe',
                            color:
                              card.insurancePlan === 'Platinum'
                                ? '#7e22ce'
                                : card.insurancePlan === 'Gold'
                                  ? '#b45309'
                                  : '#0369a1',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <Award size={12} />
                          {card.insurancePlan || 'Standard'}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Limit: ₹{Number(card.coverageAmount || 500000).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', color: '#334155' }}>
                        <Clock size={12} />
                        <span>{formatDate(card.validUntil)}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`super-status-pill ${card.status === 'Active' ? 'active' : 'inactive'}`}
                      >
                        <span className="status-dot" />
                        {card.status}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        {/* View Digital Card & Patient Info */}
                        <button
                          type="button"
                          className="super-btn-secondary"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => setViewingCard(card)}
                          title="Inspect digital card & cardholder profile"
                        >
                          <Eye size={13} />
                          <span>View Card</span>
                        </button>

                        {/* Super Admin Regulatory Freeze / Reinstate */}
                        <button
                          type="button"
                          className="super-btn-secondary"
                          style={{
                            padding: '0.3rem 0.55rem',
                            fontSize: '0.75rem',
                            color: card.status === 'Active' ? '#dc2626' : '#16a34a',
                          }}
                          onClick={() => {
                            setCardToBlock(card);
                            setBlockReason(
                              card.status === 'Active'
                                ? 'Regulatory suspension or cardholder reported lost'
                                : 'Card reinstated after administrative verification'
                            );
                          }}
                          title={card.status === 'Active' ? 'Regulatory freeze / block' : 'Reinstate card'}
                        >
                          {card.status === 'Active' ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
                          <span>{card.status === 'Active' ? 'Freeze' : 'Reinstate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal 1: Inspect Digital Card & Patient Credentials */}
      {viewingCard && (
        <div className="super-modal-backdrop" onClick={() => setViewingCard(null)}>
          <div className="super-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
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
                  <CreditCard size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Digital Medi Card Profile</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Issued by {viewingCard.hospitalName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setViewingCard(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* The Live Digital Medi Card Graphic in Proper ID-1 Shape */}
              <MedyCardPreview
                card={viewingCard}
                onCopy={(id) => handleCopyCardId(id)}
              />

              {/* Information Grid */}
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
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Issuing Facility</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{viewingCard.hospitalName}</div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Facility Code</span>
                  <div style={{ fontWeight: 600, color: '#0284c7', fontFamily: 'monospace' }}>
                    {viewingCard.hospitalCode || 'MED'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Cardholder Contact</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {viewingCard.patientPhone || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Registered Email</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {viewingCard.patientEmail || 'Not provided'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Insurance Tier</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {viewingCard.insurancePlan || 'Standard'} Benefit
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Total Coverage</span>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>
                    ₹{Number(viewingCard.coverageAmount || 500000).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-primary"
                onClick={() => setViewingCard(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Regulatory Freeze / Unblock Card */}
      {cardToBlock && (
        <div className="super-modal-backdrop" onClick={() => setCardToBlock(null)}>
          <div className="super-modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: cardToBlock.status === 'Active' ? '#fee2e2' : '#ecfdf5',
                    color: cardToBlock.status === 'Active' ? '#dc2626' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cardToBlock.status === 'Active' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    {cardToBlock.status === 'Active' ? 'Freeze / Suspend Card' : 'Reinstate Medi Card'}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {cardToBlock.cardId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setCardToBlock(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBlockSubmit}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#334155' }}>
                  Are you sure you want to{' '}
                  <strong>{cardToBlock.status === 'Active' ? 'freeze/suspend' : 'reinstate'}</strong> Medi Card{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{cardToBlock.cardId}</span> issued to{' '}
                  <strong>{cardToBlock.patientName}</strong> by <strong>{cardToBlock.hospitalName}</strong>?
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Regulatory Note / Justification *
                  </label>
                  <textarea
                    className="super-search-input"
                    rows={2}
                    style={{ width: '100%', height: 'auto', padding: '0.5rem 0.75rem', resize: 'vertical' }}
                    placeholder="e.g. Cardholder reported lost, suspicious activity, hospital compliance review..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setCardToBlock(null)}
                  disabled={blockSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  style={{
                    background: cardToBlock.status === 'Active' ? '#dc2626' : '#10b981',
                  }}
                  disabled={blockSubmitting}
                >
                  <span>{blockSubmitting ? 'Updating...' : cardToBlock.status === 'Active' ? 'Confirm Freeze' : 'Confirm Reinstatement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediCard;

import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Ambulance,
  BedDouble,
  Phone,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Activity,
  Compass,
  X,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const INITIAL_FACILITIES = [
  {
    id: 'FAC-01',
    name: 'City Care Super Speciality Hospital',
    code: 'HOSP-CITY-01',
    region: 'Metro Central',
    city: 'Bangalore, Karnataka',
    address: '42 Central Health Blvd, Sector 4',
    bedsTotal: 450,
    bedsOccupied: 380,
    ambulances: 12,
    emergencyHotline: '+91 80 4000 1100',
    status: 'Active',
    tier: 'Tertiary Trauma Center',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Emergency Care'],
  },
  {
    id: 'FAC-02',
    name: 'Apex Heart & Vascular Institute',
    code: 'HOSP-APEX-02',
    region: 'South Corridor',
    city: 'Hyderabad, Telangana',
    address: '18 Ring Road, Jubilee Hills',
    bedsTotal: 320,
    bedsOccupied: 275,
    ambulances: 8,
    emergencyHotline: '+91 40 2300 4400',
    status: 'Active',
    tier: 'Speciality Heart Hospital',
    departments: ['Cardiac Surgery', 'Interventional Radiology', 'ICU'],
  },
  {
    id: 'FAC-03',
    name: 'Metropolitan General Hospital',
    code: 'HOSP-METRO-03',
    region: 'North District',
    city: 'New Delhi, NCR',
    address: '88 Ring Road, Connaught Ring',
    bedsTotal: 600,
    bedsOccupied: 510,
    ambulances: 16,
    emergencyHotline: '+91 11 6500 8800',
    status: 'Active',
    tier: 'Multi-Specialty Teaching Facility',
    departments: ['General Medicine', 'Pediatrics', 'Oncology', 'Surgical'],
  },
  {
    id: 'FAC-04',
    name: 'Apollo Speciality Care Hub',
    code: 'HOSP-APO-04',
    region: 'East Zone',
    city: 'Kolkata, West Bengal',
    address: '104 Salt Lake City, Sector V',
    bedsTotal: 280,
    bedsOccupied: 210,
    ambulances: 6,
    emergencyHotline: '+91 33 2400 9900',
    status: 'Active',
    tier: 'Speciality Referral Hub',
    departments: ['Gastroenterology', 'Nephrology', 'Dialysis Unit'],
  },
  {
    id: 'FAC-05',
    name: 'St. Jude Healthcare & Research Hub',
    code: 'HOSP-STJ-05',
    region: 'West Valley',
    city: 'Mumbai, Maharashtra',
    address: '71 Marine Lines, South Mumbai',
    bedsTotal: 390,
    bedsOccupied: 340,
    ambulances: 10,
    emergencyHotline: '+91 22 2800 7700',
    status: 'Active',
    tier: 'Research & Emergency Care',
    departments: ['Pulmonology', 'Hematology', 'Neonatal ICU'],
  },
  {
    id: 'FAC-06',
    name: 'Heritage Community Medical Center',
    code: 'HOSP-HERI-06',
    region: 'Metro Central',
    city: 'Bangalore, Karnataka',
    address: '15 Whitefield Main Road',
    bedsTotal: 180,
    bedsOccupied: 125,
    ambulances: 4,
    emergencyHotline: '+91 80 2845 3300',
    status: 'Active',
    tier: 'Community Care Hospital',
    departments: ['Family Medicine', 'Diagnostics', 'Maternity'],
  },
];

const HealthMap = () => {
  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    region: 'Metro Central',
    city: '',
    address: '',
    bedsTotal: '250',
    ambulances: '6',
    emergencyHotline: '',
    tier: 'Multi-Specialty Facility',
  });

  const filtered = facilities.filter((f) => {
    const matchRegion = regionFilter === 'All' || f.region === regionFilter;
    const q = search.toLowerCase();
    const matchSearch =
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q) ||
      f.region.toLowerCase().includes(q);
    return matchRegion && matchSearch;
  });

  const totalBeds = facilities.reduce((sum, f) => sum + f.bedsTotal, 0);
  const totalOccupied = facilities.reduce((sum, f) => sum + f.bedsOccupied, 0);
  const totalAmbulances = facilities.reduce((sum, f) => sum + f.ambulances, 0);
  const avgOccupancy = ((totalOccupied / totalBeds) * 100).toFixed(1);

  const handleAddFacility = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.city) return;

    const newFac = {
      id: `FAC-0${facilities.length + 1}`,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase() || `HOSP-${formData.name.slice(0, 4).toUpperCase()}`,
      region: formData.region,
      city: formData.city.trim(),
      address: formData.address.trim() || 'Central District Route',
      bedsTotal: parseInt(formData.bedsTotal) || 200,
      bedsOccupied: Math.floor((parseInt(formData.bedsTotal) || 200) * 0.7),
      ambulances: parseInt(formData.ambulances) || 4,
      emergencyHotline: formData.emergencyHotline.trim() || '+91 80 0000 0000',
      status: 'Active',
      tier: formData.tier,
      departments: ['General Medicine', 'Emergency', 'Surgery', 'Diagnostics'],
    };

    setFacilities([newFac, ...facilities]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      code: '',
      region: 'Metro Central',
      city: '',
      address: '',
      bedsTotal: '250',
      ambulances: '6',
      emergencyHotline: '',
      tier: 'Multi-Specialty Facility',
    });
  };

  return (
    <div className="super-dashboard">
      {/* Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Compass size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Health Network Geographic Map</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Facility distribution, regional bed utilization & emergency ambulance telemetry
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
            <span>Onboard Health Facility</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid */}
      <div className="super-metrics-grid">
        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Network Facility Hubs</span>
            <span className="super-metric-value">{facilities.length} Hubs</span>
            <span className="super-metric-trend positive">5 Geographic Clusters</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Building2 size={22} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Total Inpatient Beds</span>
            <span className="super-metric-value">{totalBeds.toLocaleString()}</span>
            <span className="super-metric-trend positive">{totalOccupied.toLocaleString()} In Use</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0ea5e9' }}>
            <BedDouble size={22} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Active Ambulances</span>
            <span className="super-metric-value">{totalAmbulances} Units</span>
            <span className="super-metric-trend positive">GPS Telemetry Online</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Ambulance size={22} />
          </div>
        </div>

        <div className="super-metric-card">
          <div className="metric-info-left">
            <span className="super-metric-label">Bed Occupancy Rate</span>
            <span className="super-metric-value">{avgOccupancy}%</span>
            <span className="super-metric-trend" style={{ color: '#0284c7' }}>
              Optimal Balance
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Activity size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="super-panel-card"
        style={{
          padding: '1rem 1.4rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '280px' }}>
          <div className="super-nav-search" style={{ width: '100%', maxWidth: '360px' }}>
            <Search size={15} className="super-search-icon" />
            <input
              type="text"
              className="super-search-input"
              placeholder="Search facility name, code, city, region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="super-select-dropdown"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="All">All Regions ({facilities.length})</option>
            <option value="Metro Central">Metro Central</option>
            <option value="South Corridor">South Corridor</option>
            <option value="North District">North District</option>
            <option value="East Zone">East Zone</option>
            <option value="West Valley">West Valley</option>
          </select>
        </div>

        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Displaying <strong>{filtered.length}</strong> operational healthcare facilities
        </span>
      </div>

      {/* Facilities Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filtered.map((f) => {
          const occPercent = Math.round((f.bedsOccupied / f.bedsTotal) * 100);
          return (
            <div
              key={f.id}
              className="super-panel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.35rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#0284c7',
                        background: '#e0f2fe',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        marginBottom: '0.35rem',
                      }}
                    >
                      {f.region} • {f.code}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.3 }}>
                      {f.name}
                    </h3>
                  </div>
                  <span className="super-status-pill active">
                    <span className="status-dot" /> {f.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                  <MapPin size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span>{f.address}, {f.city}</span>
                </div>

                {/* Bed Utilization Bar */}
                <div style={{ background: '#f8fafc', padding: '0.75rem 0.85rem', borderRadius: '8px', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748b' }}>Inpatient Capacity:</span>
                    <strong style={{ color: '#0f172a' }}>{f.bedsOccupied} / {f.bedsTotal} Beds ({occPercent}%)</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${occPercent}%`,
                        height: '100%',
                        background: occPercent > 85 ? '#ef4444' : '#0284c7',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>

                {/* Department Tags */}
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {f.departments.map((d, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.7rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '0.2rem 0.45rem',
                        borderRadius: '4px',
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                  <Ambulance size={14} />
                  <span>{f.ambulances} Ambulances Ready</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#0284c7' }}>
                  <Phone size={13} />
                  <span>{f.emergencyHotline}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Facility Modal */}
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
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Onboard Health Network Facility</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Register and geo-locate hospital center</span>
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

            <form onSubmit={handleAddFacility}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Hospital / Facility Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Fortis Multispeciality Center"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Facility Network Code</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. HOSP-FORT-07"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Geographic Region</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    >
                      <option value="Metro Central">Metro Central</option>
                      <option value="South Corridor">South Corridor</option>
                      <option value="North District">North District</option>
                      <option value="East Zone">East Zone</option>
                      <option value="West Valley">West Valley</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">City & State</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Bangalore, Karnataka"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 52 Outer Ring Road"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Total Bed Capacity</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 300"
                      value={formData.bedsTotal}
                      onChange={(e) => setFormData({ ...formData, bedsTotal: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assigned Ambulances</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 8"
                      value={formData.ambulances}
                      onChange={(e) => setFormData({ ...formData, ambulances: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Emergency Hotline</label>
                  <input
                    type="tel"
                    required
                    className="form-control"
                    placeholder="e.g. +91 80 4400 5500"
                    value={formData.emergencyHotline}
                    onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                  />
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
                  Activate Facility Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMap;

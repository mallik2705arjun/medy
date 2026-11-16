import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  X,
  BookOpen,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

const INITIAL_RECIPES = [
  { id: 'RCP-001', name: 'Post-Op Antibiotic Prophylaxis', category: 'Surgical Care', standardDosage: 'Amoxicillin 500mg (TID x 7d)', route: 'Oral', status: 'Approved', hospitalsUsing: 6 },
  { id: 'RCP-002', name: 'Hypertension Management Protocol', category: 'Cardiology', standardDosage: 'Amlodipine 5mg + Telmisartan 40mg (OD)', route: 'Oral', status: 'Approved', hospitalsUsing: 6 },
  { id: 'RCP-003', name: 'Acute Asthma Stabilization Protocol', category: 'Pulmonology', standardDosage: 'Salbutamol Nebulization 2.5mg stat', route: 'Inhalation', status: 'In Review', hospitalsUsing: 4 },
  { id: 'RCP-004', name: 'Type 2 Diabetes Glycemic Control', category: 'Endocrinology', standardDosage: 'Metformin 500mg BID with meals', route: 'Oral', status: 'Approved', hospitalsUsing: 5 },
  { id: 'RCP-005', name: 'Severe Dehydration Electrolyte Regimen', category: 'Emergency Care', standardDosage: 'Ringer Lactate 1000ml IV over 2 hrs', route: 'Intravenous', status: 'Approved', hospitalsUsing: 6 },
];

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState(INITIAL_RECIPES);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cardiology',
    standardDosage: '',
    route: 'Oral',
    status: 'Approved',
  });

  const filtered = recipes.filter((r) => {
    const matchCat = catFilter === 'All' || r.category === catFilter;
    const q = search.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const approvedCount = recipes.filter((r) => r.status === 'Approved').length;

  const handleCreateRecipe = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.standardDosage) return;

    const newR = {
      id: `RCP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      category: formData.category,
      standardDosage: formData.standardDosage.trim(),
      route: formData.route,
      status: formData.status,
      hospitalsUsing: 6,
    };

    setRecipes([newR, ...recipes]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Cardiology',
      standardDosage: '',
      route: 'Oral',
      status: 'Approved',
    });
  };

  return (
    <div className="super-dashboard">
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <FileText size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Clinical Prescription Formulas & Recipes</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Standardized treatment protocols, therapeutic recipes and clinical dosing regimens
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
            <span>Create Clinical Protocol</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => setCatFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: catFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: catFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: catFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: catFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all approved clinical protocols"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Approved Protocols</span>
            <span className="super-metric-value">{approvedCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: catFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: catFilter === 'All' ? 700 : 500,
              }}
            >
              {catFilter === 'All' ? '● Active: All Protocols' : 'Peer-Reviewed Standard'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <FileText size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setCatFilter(catFilter === 'Cardiology' ? 'All' : 'Cardiology')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: catFilter === 'Cardiology' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: catFilter === 'Cardiology' ? '#f0fdf4' : '#ffffff',
            boxShadow: catFilter === 'Cardiology' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: catFilter === 'Cardiology' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter Cardiology protocols"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Cardiology Protocols</span>
            <span className="super-metric-value">
              {recipes.filter((r) => r.category === 'Cardiology').length}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: catFilter === 'Cardiology' ? '#059669' : '#64748b',
                fontWeight: catFilter === 'Cardiology' ? 700 : 500,
              }}
            >
              {catFilter === 'Cardiology' ? '● Active: Cardiology' : 'Cardiac Regimens'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <Layers size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setCatFilter(catFilter === 'Endocrinology' ? 'All' : 'Endocrinology')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: catFilter === 'Endocrinology' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: catFilter === 'Endocrinology' ? '#f5f3ff' : '#ffffff',
            boxShadow: catFilter === 'Endocrinology' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: catFilter === 'Endocrinology' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter Endocrinology protocols"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Endocrinology</span>
            <span className="super-metric-value">
              {recipes.filter((r) => r.category === 'Endocrinology').length}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: catFilter === 'Endocrinology' ? '#6366f1' : '#64748b',
                fontWeight: catFilter === 'Endocrinology' ? 700 : 500,
              }}
            >
              {catFilter === 'Endocrinology' ? '● Active: Endocrinology' : 'Glycemic Standards'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <ShieldCheck size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setCatFilter('All')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid #eaeff5',
            background: '#ffffff',
          }}
          title="Click to reset filters"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Active Regimens</span>
            <span className="super-metric-value">{recipes.length} Protocols</span>
            <span className="super-metric-trend positive">Continuously Updated</span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <BookOpen size={22} />
          </div>
        </div>
      </div>

      {/* Panel Card */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Standardized Prescription Templates ({filtered.length})</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={15} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search protocol name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="super-select-dropdown"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Surgical Care">Surgical Care</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Emergency Care">Emergency Care</option>
            </select>
          </div>
        </div>

        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>Protocol ID</th>
                <th>Standardized Regimen Name</th>
                <th>Medical Specialty</th>
                <th>Clinical Dosage & Administration</th>
                <th>Route</th>
                <th>Adoption</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
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
                      {r.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
                      {r.name}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{r.category}</td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>{r.standardDosage}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {r.route}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.hospitalsUsing} Facilities</td>
                  <td>
                    <span
                      className={`super-status-pill ${r.status === 'Approved' ? 'active' : 'inactive'}`}
                      style={{
                        background: r.status === 'Approved' ? '#ecfdf5' : '#fef3c7',
                        color: r.status === 'Approved' ? '#065f46' : '#b45309',
                        border: `1px solid ${r.status === 'Approved' ? '#a7f3d0' : '#fde68a'}`,
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{ background: r.status === 'Approved' ? '#10b981' : '#f59e0b' }}
                      />
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      title="Remove Protocol"
                      onClick={() => {
                        if (window.confirm(`Delete ${r.name}?`)) {
                          setRecipes(recipes.filter((item) => item.id !== r.id));
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

      {/* Add Recipe Modal */}
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
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Create Clinical Treatment Protocol</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Define evidence-based medical regimen</span>
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

            <form onSubmit={handleCreateRecipe}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Protocol / Regimen Title</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Sepsis Resuscitation Bundle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Clinical Specialty</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Surgical Care">Surgical Care</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Endocrinology">Endocrinology</option>
                      <option value="Emergency Care">Emergency Care</option>
                      <option value="Pediatrics">Pediatrics</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Route of Administration</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.route}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    >
                      <option value="Oral">Oral</option>
                      <option value="Intravenous">Intravenous (IV)</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Subcutaneous">Subcutaneous</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Standard Dosage Formulation & Instructions</label>
                  <textarea
                    required
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Broad-spectrum IV antibiotics within 1 hour of diagnosis..."
                    value={formData.standardDosage}
                    onChange={(e) => setFormData({ ...formData, standardDosage: e.target.value })}
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
                  Publish Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeManagement;

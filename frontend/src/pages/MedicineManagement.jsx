import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
  Package,
  DollarSign,
  TrendingDown,
} from 'lucide-react';

const INITIAL_MEDICINES = [
  { id: 'MED-101', name: 'Paracetamol 650mg', category: 'Analgesic & Antipyretic', stock: 12500, unitPrice: '$0.15', status: 'In Stock', supplier: 'Medy Central Formulary' },
  { id: 'MED-102', name: 'Amoxicillin Clavulanate 625mg', category: 'Antibiotic (Broad Spectrum)', stock: 4800, unitPrice: '$1.20', status: 'In Stock', supplier: 'Pfizer Healthcare' },
  { id: 'MED-103', name: 'Atorvastatin 20mg', category: 'Cardiovascular / Statin', stock: 920, unitPrice: '$0.85', status: 'Low Stock', supplier: 'Sun Pharma Ltd' },
  { id: 'MED-104', name: 'Pantoprazole 40mg', category: 'Gastroenterology (PPI)', stock: 8400, unitPrice: '$0.40', status: 'In Stock', supplier: 'Cipla Therapeutics' },
  { id: 'MED-105', name: 'Insulin Glargine 100IU/ml', category: 'Endocrine / Diabetes', stock: 340, unitPrice: '$14.50', status: 'Low Stock', supplier: 'Novo Nordisk' },
  { id: 'MED-106', name: 'Azithromycin 500mg', category: 'Antibiotic (Macrolide)', stock: 3200, unitPrice: '$2.10', status: 'In Stock', supplier: 'Medy Central Formulary' },
];

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All'); // 'All' | 'In Stock' | 'Low Stock' | 'HighUnits'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Analgesic',
    stock: '5000',
    unitPrice: '$1.00',
    supplier: 'Medy Central Formulary',
  });

  const filtered = medicines
    .filter((m) => {
      if (stockStatusFilter === 'In Stock' && m.status !== 'In Stock') return false;
      if (stockStatusFilter === 'Low Stock' && m.status !== 'Low Stock') return false;
      const matchCat = categoryFilter === 'All' || m.category.includes(categoryFilter);
      const q = search.toLowerCase();
      const matchSearch =
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (stockStatusFilter === 'HighUnits') return (b.stock || 0) - (a.stock || 0);
      return 0;
    });

  const lowStockCount = medicines.filter((m) => m.status === 'Low Stock').length;
  const inStockCount = medicines.filter((m) => m.status === 'In Stock').length;
  const totalUnits = medicines.reduce((sum, m) => sum + m.stock, 0);

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newMed = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name.trim(),
      category: formData.category,
      stock: parseInt(formData.stock) || 1000,
      unitPrice: formData.unitPrice.startsWith('$') ? formData.unitPrice : `$${formData.unitPrice}`,
      status: parseInt(formData.stock) < 1000 ? 'Low Stock' : 'In Stock',
      supplier: formData.supplier,
    };

    setMedicines([newMed, ...medicines]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      category: 'Analgesic',
      stock: '5000',
      unitPrice: '$1.00',
      supplier: 'Medy Central Formulary',
    });
  };

  return (
    <div className="super-dashboard">
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Pill size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Pharmacy & Medicine Management</h1>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Central pharmaceutical formulary, hospital inventory stock & procurement pricing
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
            <span>Add Medicine to Formulary</span>
          </button>
        </div>
      </div>

      {/* 4 Metrics Grid (Clickable options) */}
      <div className="super-metrics-grid">
        <div
          className="super-metric-card"
          onClick={() => {
            setStockStatusFilter('All');
            setCategoryFilter('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: stockStatusFilter === 'All' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: stockStatusFilter === 'All' ? '#f0f9ff' : '#ffffff',
            boxShadow: stockStatusFilter === 'All' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: stockStatusFilter === 'All' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all approved medicines"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Formulary Catalog</span>
            <span className="super-metric-value">{medicines.length} Drugs</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: stockStatusFilter === 'All' ? '#0284c7' : '#64748b',
                fontWeight: stockStatusFilter === 'All' ? 700 : 500,
              }}
            >
              {stockStatusFilter === 'All' ? '● Active: All Formulary' : 'Approved Items'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Pill size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStockStatusFilter('In Stock')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: stockStatusFilter === 'In Stock' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: stockStatusFilter === 'In Stock' ? '#f0fdf4' : '#ffffff',
            boxShadow: stockStatusFilter === 'In Stock' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: stockStatusFilter === 'In Stock' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter in-stock medications"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">In-Stock Formulations</span>
            <span className="super-metric-value">{inStockCount}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: stockStatusFilter === 'In Stock' ? '#059669' : '#64748b',
                fontWeight: stockStatusFilter === 'In Stock' ? 700 : 500,
              }}
            >
              {stockStatusFilter === 'In Stock' ? '● Active: In-Stock' : 'Optimal Supply'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStockStatusFilter('Low Stock')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: stockStatusFilter === 'Low Stock' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: stockStatusFilter === 'Low Stock' ? '#fffbeb' : '#ffffff',
            boxShadow: stockStatusFilter === 'Low Stock' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
            transform: stockStatusFilter === 'Low Stock' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter low-stock alerts"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Low-Stock Warnings</span>
            <span className="super-metric-value" style={{ color: '#f59e0b' }}>{lowStockCount}</span>
            <span
              className="super-metric-trend"
              style={{
                color: stockStatusFilter === 'Low Stock' ? '#d97706' : '#64748b',
                fontWeight: stockStatusFilter === 'Low Stock' ? 700 : 500,
              }}
            >
              {stockStatusFilter === 'Low Stock' ? '● Active: Low Stock' : 'Reorder Triggered'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div
          className="super-metric-card"
          onClick={() => setStockStatusFilter(stockStatusFilter === 'HighUnits' ? 'All' : 'HighUnits')}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: stockStatusFilter === 'HighUnits' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: stockStatusFilter === 'HighUnits' ? '#f5f3ff' : '#ffffff',
            boxShadow: stockStatusFilter === 'HighUnits' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: stockStatusFilter === 'HighUnits' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to sort by inventory volume"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Inventory Units</span>
            <span className="super-metric-value">{totalUnits.toLocaleString()}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: stockStatusFilter === 'HighUnits' ? '#6366f1' : '#64748b',
                fontWeight: stockStatusFilter === 'HighUnits' ? 700 : 500,
              }}
            >
              {stockStatusFilter === 'HighUnits' ? '● Sorted by Units' : 'Across Pharmacies'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* Panel Card */}
      <div className="super-panel-card">
        <div className="panel-card-header">
          <div>
            <h3>Central Hospital Pharmacy Formulary ({filtered.length})</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="super-nav-search" style={{ width: '260px' }}>
              <Search size={15} className="super-search-icon" />
              <input
                type="text"
                className="super-search-input"
                placeholder="Search drug name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="super-select-dropdown"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Endocrine">Endocrine</option>
            </select>
          </div>
        </div>

        <div className="super-table-container">
          <table className="super-table">
            <thead>
              <tr>
                <th>Drug Code</th>
                <th>Medicine Name</th>
                <th>Pharmacological Class</th>
                <th>Available Units</th>
                <th>Unit Procurement Cost</th>
                <th>Primary Supplier</th>
                <th>Stock Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
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
                      {m.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.86rem' }}>
                      {m.name}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#334155' }}>{m.category}</td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{m.stock.toLocaleString()} Units</strong>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>{m.unitPrice}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.supplier}</td>
                  <td>
                    <span
                      className={`super-status-pill ${m.status === 'In Stock' ? 'active' : 'inactive'}`}
                      style={{
                        background: m.status === 'In Stock' ? '#ecfdf5' : '#fef3c7',
                        color: m.status === 'In Stock' ? '#065f46' : '#b45309',
                        border: `1px solid ${m.status === 'In Stock' ? '#a7f3d0' : '#fde68a'}`,
                      }}
                    >
                      <span
                        className="status-dot"
                        style={{ background: m.status === 'In Stock' ? '#10b981' : '#f59e0b' }}
                      />
                      {m.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="action-icon-btn delete"
                      title="Remove Medicine"
                      onClick={() => {
                        if (window.confirm(`Remove ${m.name} from formulary?`)) {
                          setMedicines(medicines.filter((item) => item.id !== m.id));
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

      {/* Add Medicine Modal */}
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
                  <Pill size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Add Medicine to Formulary</h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Register new drug formulation & stock levels</span>
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

            <form onSubmit={handleAddMedicine}>
              <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Medicine / Molecule Name</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Ciprofloxacin 500mg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Classification</label>
                    <select
                      className="super-select-dropdown"
                      style={{ width: '100%' }}
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Analgesic">Analgesic</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Gastroenterology">Gastroenterology</option>
                      <option value="Endocrine">Endocrine</option>
                      <option value="Respiratory">Respiratory</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Initial Stock Quantity</label>
                    <input
                      type="number"
                      required
                      className="form-control"
                      placeholder="e.g. 5000"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit Price ($)</label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. $1.50"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Primary Supplier</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Medy Central Formulary"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    />
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
                  Save to Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;

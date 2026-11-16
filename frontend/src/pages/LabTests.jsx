import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  FlaskConical,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileText,
  Activity,
  Layers,
  Printer,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CATALOG = [
  {
    name: 'Complete Blood Count (CBC)',
    code: 'LAB-CBC',
    category: 'Hematology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 350,
    turnaround: '6-8 Hours',
    description: 'Comprehensive analysis of RBC, WBC, Platelets, Hemoglobin, and Hematocrit.',
  },
  {
    name: 'Comprehensive Lipid Profile',
    code: 'LAB-LIPID',
    category: 'Biochemistry',
    sampleType: 'Blood',
    fastingRequired: true,
    price: 650,
    turnaround: '12 Hours',
    description: 'Total Cholesterol, HDL, LDL, VLDL, and Triglycerides for cardiovascular assessment.',
  },
  {
    name: 'Liver Function Test (LFT)',
    code: 'LAB-LFT',
    category: 'Biochemistry',
    sampleType: 'Blood',
    fastingRequired: true,
    price: 750,
    turnaround: '12 Hours',
    description: 'SGOT, SGPT, Bilirubin (Total & Direct), Alkaline Phosphatase, Total Protein, and Albumin.',
  },
  {
    name: 'Kidney Function Test (KFT / RFT)',
    code: 'LAB-KFT',
    category: 'Renal Panel',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 700,
    turnaround: '12 Hours',
    description: 'Blood Urea Nitrogen (BUN), Serum Creatinine, Uric Acid, and Electrolytes.',
  },
  {
    name: 'HbA1c (Glycated Hemoglobin)',
    code: 'LAB-HBA1C',
    category: 'Endocrinology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 450,
    turnaround: '8-12 Hours',
    description: 'Gold standard 3-month average plasma glucose control evaluation.',
  },
  {
    name: 'Thyroid Profile (Total T3, T4, TSH)',
    code: 'LAB-THYROID',
    category: 'Endocrinology',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 550,
    turnaround: '12 Hours',
    description: 'Triiodothyronine (T3), Thyroxine (T4), and Thyroid Stimulating Hormone (TSH).',
  },
  {
    name: 'Vitamin D (25-OH) & B12 Vitality Combo',
    code: 'LAB-VIT-COMBO',
    category: 'General Health',
    sampleType: 'Blood',
    fastingRequired: false,
    price: 1200,
    turnaround: '24 Hours',
    description: 'Essential micronutrient screen evaluating bone density and nervous system health.',
  },
  {
    name: 'Cardiac Risk Biomarker Panel',
    code: 'LAB-CARDIAC',
    category: 'Cardiology',
    sampleType: 'Serum',
    fastingRequired: false,
    price: 1450,
    turnaround: '4-6 Hours',
    description: 'Troponin-I, hs-CRP, and CK-MB high-sensitivity quantitative myocardial injury markers.',
  },
  {
    name: 'Urine Routine & Microscopic Examination',
    code: 'LAB-URINE',
    category: 'Pathology',
    sampleType: 'Urine',
    fastingRequired: false,
    price: 250,
    turnaround: '4-6 Hours',
    description: 'Detects urinary tract infections, renal disorders, and metabolic conditions.',
  },
  {
    name: 'RT-PCR Viral Screen (Respiratory Panel)',
    code: 'LAB-RTPCR',
    category: 'Microbiology',
    sampleType: 'Nasal Swab',
    fastingRequired: false,
    price: 900,
    turnaround: '12-16 Hours',
    description: 'Qualitative nucleic acid amplification diagnostic detecting acute viral pathogens.',
  },
];

const getTestBiomarkers = (testName = '') => {
  const tn = testName.toLowerCase();
  if (tn.includes('cbc') || tn.includes('blood count')) {
    return [
      { name: 'Hemoglobin (Hb)', result: '14.2', unit: 'g/dL', ref: '13.0 - 17.0', status: 'Normal' },
      { name: 'RBC Count', result: '4.85', unit: 'mill/cu.mm', ref: '4.50 - 5.50', status: 'Normal' },
      { name: 'Total Leukocyte Count (WBC)', result: '7,200', unit: '/cu.mm', ref: '4,000 - 11,000', status: 'Normal' },
      { name: 'Platelet Count', result: '245,000', unit: '/cu.mm', ref: '150,000 - 450,000', status: 'Normal' },
      { name: 'Packed Cell Volume (PCV)', result: '42.8', unit: '%', ref: '40.0 - 50.0', status: 'Normal' },
    ];
  }
  if (tn.includes('lipid')) {
    return [
      { name: 'Total Cholesterol', result: '184', unit: 'mg/dL', ref: '< 200 (Desirable)', status: 'Normal' },
      { name: 'HDL Cholesterol (Good)', result: '52', unit: 'mg/dL', ref: '> 40 (Optimal)', status: 'Normal' },
      { name: 'LDL Cholesterol (Bad)', result: '106', unit: 'mg/dL', ref: '< 100 (Optimal)', status: 'Borderline' },
      { name: 'Triglycerides', result: '128', unit: 'mg/dL', ref: '< 150 (Normal)', status: 'Normal' },
      { name: 'VLDL Cholesterol', result: '25.6', unit: 'mg/dL', ref: '10.0 - 30.0', status: 'Normal' },
      { name: 'TC / HDL Ratio', result: '3.5', unit: 'Ratio', ref: '< 4.5', status: 'Normal' },
    ];
  }
  if (tn.includes('liver') || tn.includes('lft')) {
    return [
      { name: 'Bilirubin - Total', result: '0.85', unit: 'mg/dL', ref: '0.2 - 1.2', status: 'Normal' },
      { name: 'Bilirubin - Direct', result: '0.22', unit: 'mg/dL', ref: '0.0 - 0.3', status: 'Normal' },
      { name: 'SGOT (AST)', result: '26', unit: 'U/L', ref: '10 - 40', status: 'Normal' },
      { name: 'SGPT (ALT)', result: '31', unit: 'U/L', ref: '7 - 56', status: 'Normal' },
      { name: 'Alkaline Phosphatase (ALP)', result: '88', unit: 'U/L', ref: '44 - 147', status: 'Normal' },
      { name: 'Serum Albumin', result: '4.4', unit: 'g/dL', ref: '3.5 - 5.0', status: 'Normal' },
    ];
  }
  if (tn.includes('kidney') || tn.includes('kft') || tn.includes('rft')) {
    return [
      { name: 'Serum Creatinine', result: '0.92', unit: 'mg/dL', ref: '0.7 - 1.3', status: 'Normal' },
      { name: 'Blood Urea Nitrogen (BUN)', result: '14.5', unit: 'mg/dL', ref: '7.0 - 20.0', status: 'Normal' },
      { name: 'Uric Acid', result: '5.2', unit: 'mg/dL', ref: '3.5 - 7.2', status: 'Normal' },
      { name: 'Serum Sodium (Na+)', result: '141', unit: 'mEq/L', ref: '136 - 145', status: 'Normal' },
      { name: 'Serum Potassium (K+)', result: '4.3', unit: 'mEq/L', ref: '3.5 - 5.1', status: 'Normal' },
    ];
  }
  if (tn.includes('hba1c')) {
    return [
      { name: 'HbA1c (Glycated Hb)', result: '5.4', unit: '%', ref: '< 5.7 (Non-Diabetic)', status: 'Normal' },
      { name: 'Estimated Avg Glucose (eAG)', result: '108', unit: 'mg/dL', ref: '90 - 120', status: 'Normal' },
    ];
  }
  if (tn.includes('thyroid')) {
    return [
      { name: 'TSH (Ultrasensitive)', result: '2.18', unit: 'uIU/mL', ref: '0.45 - 4.50', status: 'Normal' },
      { name: 'Total Thyroxine (T4)', result: '8.4', unit: 'ug/dL', ref: '5.1 - 14.1', status: 'Normal' },
      { name: 'Total Triiodothyronine (T3)', result: '118', unit: 'ng/dL', ref: '80 - 200', status: 'Normal' },
    ];
  }
  if (tn.includes('vitamin')) {
    return [
      { name: 'Vitamin D (25-OH)', result: '38.5', unit: 'ng/mL', ref: '30.0 - 100.0 (Sufficient)', status: 'Normal' },
      { name: 'Vitamin B12', result: '495', unit: 'pg/mL', ref: '200 - 900', status: 'Normal' },
    ];
  }
  if (tn.includes('cardiac') || tn.includes('troponin')) {
    return [
      { name: 'Troponin-I (High Sensitivity)', result: '< 0.02', unit: 'ng/mL', ref: '< 0.04 (Negative)', status: 'Normal' },
      { name: 'hs-CRP (Cardiac Risk)', result: '1.1', unit: 'mg/L', ref: '< 1.0 Low, 1.0-3.0 Avg', status: 'Normal' },
      { name: 'CK-MB', result: '14', unit: 'U/L', ref: '0 - 25', status: 'Normal' },
    ];
  }
  if (tn.includes('urine')) {
    return [
      { name: 'Specific Gravity', result: '1.020', unit: '', ref: '1.005 - 1.030', status: 'Normal' },
      { name: 'pH', result: '6.0', unit: '', ref: '5.0 - 7.5', status: 'Normal' },
      { name: 'Protein / Albumin', result: 'Nil', unit: '', ref: 'Nil', status: 'Normal' },
      { name: 'Urine Glucose', result: 'Nil', unit: '', ref: 'Nil', status: 'Normal' },
      { name: 'Pus Cells (WBC)', result: '1-2', unit: '/HPF', ref: '0 - 5', status: 'Normal' },
    ];
  }
  return [
    { name: 'Diagnostic Assay Result', result: 'Negative / Clear', unit: '', ref: 'Biological Baseline', status: 'Normal' },
    { name: 'Quality Verification Index', result: 'Verified (99.8%)', unit: '', ref: '> 95%', status: 'Normal' },
  ];
};

const LabTests = () => {
  const { admin, logout } = useAuth();

  // Active navigation mode from the 4 metric cards:
  // 'all' | 'completed' | 'in_analysis' | 'catalog'
  const [cardTab, setCardTab] = useState('all');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'availableTests'

  const [labTests, setLabTests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [loading, setLoading] = useState(true);

  // Filters
  const [hospitalFilter, setHospitalFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('All');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Selected report modal
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  // Fetch Lab Tests
  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lab-tests', {
        headers: { Authorization: `Bearer ${admin?.token}` },
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const testsList = data.labTests || data.tests || (Array.isArray(data) ? data : []);
        setLabTests(testsList);
        if (data.catalog && Array.isArray(data.catalog) && data.catalog.length > 0) {
          setCatalog(data.catalog);
        }
      }
    } catch (e) {
      console.error('Fetch lab tests error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) {
      fetchHospitals();
      fetchLabTests();
    }
  }, [admin]);

  // Tests scoped by hospital
  const hospitalScopedTests = useMemo(() => {
    if (hospitalFilter === 'All') return labTests;
    return labTests.filter(
      (t) => (t.hospitalName || '').trim().toLowerCase() === hospitalFilter.trim().toLowerCase()
    );
  }, [labTests, hospitalFilter]);

  // Derived Statistics for the 4 Options
  const stats = useMemo(() => {
    const total = hospitalScopedTests.length;
    const completed = hospitalScopedTests.filter((t) => t.status === 'Report Completed').length;
    const pending = hospitalScopedTests.filter((t) => t.status === 'Pending Collection').length;
    const sampleCollected = hospitalScopedTests.filter((t) => t.status === 'Sample Collected').length;
    const inAnalysis = hospitalScopedTests.filter((t) => t.status === 'In-Analysis').length;
    const inProgressTotal = pending + sampleCollected + inAnalysis;

    return {
      total,
      completed,
      pending,
      sampleCollected,
      inAnalysis,
      inProgressTotal,
    };
  }, [hospitalScopedTests]);

  // Filtered displayed tests depending on the active option card & sub-filters
  const displayedTests = useMemo(() => {
    return hospitalScopedTests.filter((test) => {
      // 1. Metric Card Filter Option
      if (cardTab === 'completed') {
        if (test.status !== 'Report Completed') return false;
      } else if (cardTab === 'in_analysis') {
        if (test.status === 'Report Completed' || test.status === 'Cancelled') return false;
        if (
          statusFilter !== 'All' &&
          statusFilter !== 'In-Analysis & Samples' &&
          test.status !== statusFilter
        ) {
          return false;
        }
      } else if (cardTab === 'all') {
        if (statusFilter !== 'All' && test.status !== statusFilter) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          (test.patientName || '').toLowerCase().includes(q) ||
          (test.testName || '').toLowerCase().includes(q) ||
          (test.category || '').toLowerCase().includes(q) ||
          (test.hospitalName || '').toLowerCase().includes(q) ||
          (test.patientPhone || '').includes(q) ||
          (test.testBookingId || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [hospitalScopedTests, cardTab, statusFilter, searchQuery]);

  // Filtered catalog tests
  const catalogCategories = useMemo(() => {
    const cats = new Set(catalog.map((t) => t.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((test) => {
      if (catalogCategory !== 'All' && test.category !== catalogCategory) {
        return false;
      }
      if (catalogSearch.trim()) {
        const q = catalogSearch.toLowerCase().trim();
        return (
          (test.name || '').toLowerCase().includes(q) ||
          (test.code || '').toLowerCase().includes(q) ||
          (test.category || '').toLowerCase().includes(q) ||
          (test.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [catalog, catalogCategory, catalogSearch]);

  // Update Status
  const handleUpdateStatus = async (testId, newStatus) => {
    try {
      const res = await fetch(`/api/lab-tests/${testId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          resultSummary:
            newStatus === 'Report Completed'
              ? 'All evaluated diagnostic parameters are within normal reference ranges.'
              : undefined,
        }),
      });

      if (res.ok) {
        setLabTests((prev) =>
          prev.map((t) => (t._id === testId ? { ...t, status: newStatus } : t))
        );
        if (selectedBooking && selectedBooking._id === testId) {
          setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      console.error('Update status error:', e);
    }
  };

  // Delete booking
  const handleDeleteBooking = async (testId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this diagnostic test booking?')) return;

    try {
      const res = await fetch(`/api/lab-tests/${testId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${admin?.token}` },
      });

      if (res.ok) {
        setLabTests((prev) => prev.filter((t) => t._id !== testId));
        if (selectedBooking?._id === testId) setSelectedBooking(null);
        setSuccessMessage('Diagnostic test booking deleted.');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
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
      {/* 1. Header (Cleaned as requested, without the top control buttons) */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <FlaskConical size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Lab Management</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Manage hospital laboratory facilities, diagnostic tests, specimen collections & clinical reports
            </p>
          </div>
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

      {/* 2. Interactive 4-Options Metrics Grid (Clickable navigation & filters) */}
      <div className="super-metrics-grid">
        {/* Option 1: Total Test Bookings */}
        <div
          className="super-metric-card"
          onClick={() => {
            setCardTab('all');
            setActiveTab('bookings');
            setStatusFilter('All');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: cardTab === 'all' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: cardTab === 'all' ? '#f0f9ff' : '#ffffff',
            boxShadow: cardTab === 'all' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: cardTab === 'all' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all diagnostic test bookings"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Test Bookings</span>
            <span className="super-metric-value">{stats.total}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: cardTab === 'all' ? '#0284c7' : '#64748b',
                fontWeight: cardTab === 'all' ? 700 : 500,
              }}
            >
              {cardTab === 'all' ? '● Active Filter: All Tests' : 'Click to view all'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <FlaskConical size={20} />
          </div>
        </div>

        {/* Option 2: Reports Ready / Completed */}
        <div
          className="super-metric-card"
          onClick={() => {
            setCardTab('completed');
            setActiveTab('bookings');
            setStatusFilter('Report Completed');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: cardTab === 'completed' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: cardTab === 'completed' ? '#f0fdf4' : '#ffffff',
            boxShadow: cardTab === 'completed' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: cardTab === 'completed' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter completed diagnostic reports"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Reports Ready / Completed</span>
            <span className="super-metric-value">{stats.completed}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: cardTab === 'completed' ? '#059669' : '#64748b',
                fontWeight: cardTab === 'completed' ? 700 : 500,
              }}
            >
              {cardTab === 'completed' ? '● Active Filter: Ready' : 'Click to view reports'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Option 3: In-Analysis & Samples */}
        <div
          className="super-metric-card"
          onClick={() => {
            setCardTab('in_analysis');
            setActiveTab('bookings');
            setStatusFilter('In-Analysis & Samples');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: cardTab === 'in_analysis' ? '2px solid #f59e0b' : '1px solid #eaeff5',
            background: cardTab === 'in_analysis' ? '#fffbeb' : '#ffffff',
            boxShadow: cardTab === 'in_analysis' ? '0 4px 16px rgba(245, 158, 11, 0.16)' : 'none',
            transform: cardTab === 'in_analysis' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to filter tests in-analysis & sample collection"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">In-Analysis & Samples</span>
            <span className="super-metric-value">{stats.inProgressTotal}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: cardTab === 'in_analysis' ? '#d97706' : '#64748b',
                fontWeight: cardTab === 'in_analysis' ? 700 : 500,
              }}
            >
              {cardTab === 'in_analysis' ? '● Active Filter: Processing' : 'Click to view processing'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#f59e0b' }}>
            <Activity size={20} />
          </div>
        </div>

        {/* Option 4: Catalog Profiles */}
        <div
          className="super-metric-card"
          onClick={() => {
            setCardTab('catalog');
            setActiveTab('availableTests');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: cardTab === 'catalog' ? '2px solid #6366f1' : '1px solid #eaeff5',
            background: cardTab === 'catalog' ? '#f5f3ff' : '#ffffff',
            boxShadow: cardTab === 'catalog' ? '0 4px 16px rgba(99, 102, 241, 0.16)' : 'none',
            transform: cardTab === 'catalog' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view full standard diagnostic test catalog"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Catalog Profiles</span>
            <span className="super-metric-value">{catalog.length}</span>
            <span
              className="super-metric-trend positive"
              style={{
                color: cardTab === 'catalog' ? '#6366f1' : '#64748b',
                fontWeight: cardTab === 'catalog' ? 700 : 500,
              }}
            >
              {cardTab === 'catalog' ? '● Active View: Catalog' : 'Click to view profiles'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#6366f1' }}>
            <Layers size={20} />
          </div>
        </div>
      </div>

      {/* 3. Main Panel: Controlled by the 4 Options above */}
      {activeTab === 'bookings' ? (
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>
                {cardTab === 'completed'
                  ? 'Reports Ready / Completed'
                  : cardTab === 'in_analysis'
                  ? 'In-Analysis & Sample Bookings'
                  : 'Diagnostic Test Bookings'}{' '}
                ({displayedTests.length})
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {hospitalFilter === 'All' ? 'Viewing across all network hospitals' : `Filtered for ${hospitalFilter}`}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Hospital facility dropdown */}
              <select
                className="super-select-dropdown"
                value={hospitalFilter}
                onChange={(e) => setHospitalFilter(e.target.value)}
              >
                <option value="All">All Hospitals ({hospitals.length})</option>
                {hospitals.map((hosp) => (
                  <option key={hosp._id || hosp.name} value={hosp.name}>
                    {hosp.name} — {hosp.city || 'Network'}
                  </option>
                ))}
              </select>

              {/* Status filter toggle pills synchronized with options */}
              <div className="view-mode-toggle">
                {cardTab === 'in_analysis' ? (
                  ['In-Analysis & Samples', 'Pending Collection', 'Sample Collected', 'In-Analysis'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`mode-btn ${statusFilter === st ? 'active' : ''}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st === 'In-Analysis & Samples' ? 'All In-Progress' : st}
                    </button>
                  ))
                ) : cardTab === 'completed' ? (
                  <button type="button" className="mode-btn active">
                    Completed Reports ({displayedTests.length})
                  </button>
                ) : (
                  ['All', 'Pending Collection', 'Sample Collected', 'In-Analysis', 'Report Completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`mode-btn ${statusFilter === st ? 'active' : ''}`}
                      onClick={() => {
                        setStatusFilter(st);
                        if (st === 'Report Completed') setCardTab('completed');
                        else if (st === 'All') setCardTab('all');
                        else setCardTab('in_analysis');
                      }}
                    >
                      {st === 'All' ? 'All' : st}
                    </button>
                  ))
                )}
              </div>

              {/* Search */}
              <div className="super-nav-search" style={{ width: '240px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search patient, test, token..."
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

          {/* Bookings Table */}
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
                <span>Loading lab bookings...</span>
              </div>
            ) : displayedTests.length === 0 ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                <FlaskConical size={42} style={{ color: '#94a3b8', margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ color: '#0f172a', fontWeight: 600, margin: '0 0 0.35rem 0' }}>No Lab Bookings Found</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  {searchQuery || hospitalFilter !== 'All' || statusFilter !== 'All'
                    ? 'No diagnostic tests match your current search or status filter.'
                    : 'No diagnostic bookings recorded under this category.'}
                </p>
              </div>
            ) : (
              <table className="super-table">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Hospital Lab Facility</th>
                    <th>Diagnostic Test</th>
                    <th>Collection Mode & Slot</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTests.map((test) => (
                    <tr key={test._id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{test.patientName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {test.patientAge ? `${test.patientAge} yrs • ` : ''}
                            {test.patientGender || ''} {test.patientPhone ? `• ${test.patientPhone}` : ''}
                          </div>
                          {test.cardId && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background: '#e0f2fe',
                                color: '#0284c7',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                marginTop: '0.25rem',
                              }}
                            >
                              <CreditCard size={11} />
                              {test.cardId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: '#f8fafc',
                              border: '1px solid #eaeff5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#0284c7',
                              flexShrink: 0,
                            }}
                          >
                            <Building2 size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{test.hospitalName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Token: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{test.testBookingId || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{test.testName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 500, marginTop: '0.15rem' }}>
                            {test.category} • ₹{test.price || 0}
                          </div>
                          {test.fastingRequired && (
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '0.7rem',
                                color: '#d97706',
                                background: '#fffbeb',
                                border: '1px solid #fef3c7',
                                borderRadius: '4px',
                                padding: '0.1rem 0.35rem',
                                marginTop: '0.2rem',
                                fontWeight: 600,
                              }}
                            >
                              Fasting Required
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatDate(test.bookingDate)}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                            <Clock size={12} />
                            <span>{test.timeSlot || 'Standard Slot'}</span>
                          </div>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: test.collectionType === 'Home Sample Collection' ? '#7c3aed' : '#0f172a',
                              background: test.collectionType === 'Home Sample Collection' ? '#f5f3ff' : '#f8fafc',
                              border: '1px solid #eaeff5',
                              borderRadius: '4px',
                              padding: '0.1rem 0.4rem',
                              marginTop: '0.2rem',
                            }}
                          >
                            {test.collectionType || 'Hospital Lab'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`super-status-pill ${
                            test.status === 'Report Completed'
                              ? 'active'
                              : test.status === 'Cancelled'
                              ? 'inactive'
                              : ''
                          }`}
                          style={
                            test.status === 'Report Completed'
                              ? { background: '#ecfdf5', color: '#059669' }
                              : test.status === 'In-Analysis'
                              ? { background: '#e0f2fe', color: '#0284c7' }
                              : test.status === 'Sample Collected'
                              ? { background: '#fffbeb', color: '#d97706' }
                              : test.status === 'Pending Collection'
                              ? { background: '#f1f5f9', color: '#475569' }
                              : { background: '#f8fafc', color: '#64748b' }
                          }
                        >
                          <span
                            className="status-dot"
                            style={{
                              background:
                                test.status === 'Report Completed'
                                  ? '#059669'
                                  : test.status === 'In-Analysis'
                                  ? '#0284c7'
                                  : test.status === 'Sample Collected'
                                  ? '#d97706'
                                  : test.status === 'Pending Collection'
                                  ? '#64748b'
                                  : '#94a3b8',
                            }}
                          />
                          {test.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Test Catalog Table (When Option 4 "Catalog Profiles" is clicked) */
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Laboratory Test Profiles ({filteredCatalog.length})</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Standard diagnostic profiles enabled across all partner hospital laboratories
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="super-select-dropdown"
                value={catalogCategory}
                onChange={(e) => setCatalogCategory(e.target.value)}
              >
                {catalogCategories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              <div className="super-nav-search" style={{ width: '240px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search test name or code..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="super-table">
              <thead>
                <tr>
                  <th>Test Profile</th>
                  <th>Category</th>
                  <th>Sample Type</th>
                  <th>Standard Fee</th>
                  <th>Turnaround Time</th>
                  <th>Fasting</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalog.map((item, idx) => (
                  <tr key={item._id || item.code || idx}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'monospace' }}>
                          {item.code}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          background: '#e0f2fe',
                          color: '#0284c7',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 500, color: '#334155', fontSize: '0.85rem' }}>
                        {item.sampleType || 'Blood'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                        ₹{item.price}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.825rem', color: '#64748b' }}>
                        <Clock size={12} />
                        <span>{item.turnaround || '24 Hours'}</span>
                      </div>
                    </td>

                    <td>
                      {item.fastingRequired ? (
                        <span style={{ color: '#d97706', fontSize: '0.75rem', fontWeight: 600 }}>Yes (10-12h)</span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span className="super-status-pill active" style={{ fontSize: '0.72rem' }}>
                        <span className="status-dot" style={{ background: '#10b981' }} />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Booking & Diagnostic Report Modal */}
      {selectedBooking && (
        <div className="super-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="super-modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="super-modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      Diagnostic Laboratory Report
                    </h3>
                    <span
                      style={{
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: '#e0f2fe',
                        color: '#0284c7',
                      }}
                    >
                      Official Demo
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Token #{selectedBooking.testBookingId || selectedBooking._id} • {selectedBooking.hospitalName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Patient Demographics Banner */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #eaeff5',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.85rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Patient Name</span>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{selectedBooking.patientName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                    {selectedBooking.patientAge} Yrs • {selectedBooking.patientGender}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Contact & Medy Card</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{selectedBooking.patientPhone || 'Not provided'}</div>
                  {selectedBooking.cardId ? (
                    <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>Card: {selectedBooking.cardId}</span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>No card linked</span>
                  )}
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Specimen / Slot</span>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                    {selectedBooking.sampleType || 'Blood'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {formatDate(selectedBooking.bookingDate)}
                  </div>
                </div>
              </div>

              {/* Biomarkers / Clinical Parameters Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Activity size={15} style={{ color: '#0284c7' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                      {selectedBooking.testName}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.25rem' }}>
                      ({selectedBooking.category} • {selectedBooking.testCode || 'LAB-TEST'})
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      background: selectedBooking.status === 'Report Completed' ? '#ecfdf5' : '#e0f2fe',
                      color: selectedBooking.status === 'Report Completed' ? '#059669' : '#0284c7',
                    }}
                  >
                    {selectedBooking.status}
                  </span>
                </div>

                <div style={{ border: '1px solid #eaeff5', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #eaeff5', textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Parameter Tested</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Observed Value</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Biological Ref Interval</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Evaluation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getTestBiomarkers(selectedBooking.testName).map((bio, bIdx) => (
                        <tr key={bIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>
                            {bio.name}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>
                            {bio.result} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{bio.unit}</span>
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', color: '#64748b', fontSize: '0.78rem' }}>
                            {bio.ref} {bio.unit}
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                background: bio.status === 'Normal' ? '#ecfdf5' : '#fffbeb',
                                color: bio.status === 'Normal' ? '#059669' : '#d97706',
                              }}
                            >
                              <CheckCircle2 size={11} />
                              {bio.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pathologist Diagnostic Summary */}
              {selectedBooking.resultSummary && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Pathologist Clinical Impression
                  </span>
                  <p
                    style={{
                      margin: '0.35rem 0 0 0',
                      fontSize: '0.825rem',
                      color: '#065f46',
                      background: '#ecfdf5',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedBooking.resultSummary}
                  </p>
                </div>
              )}

              {/* Status Updater */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Update Workflow Status
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Pending Collection', 'Sample Collected', 'In-Analysis', 'Report Completed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedBooking._id, st)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: selectedBooking.status === st ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                        background: selectedBooking.status === st ? '#e0f2fe' : '#ffffff',
                        color: selectedBooking.status === st ? '#0284c7' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="super-modal-footer" style={{ borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => {
                    window.print();
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} />
                  <span>Print Report</span>
                </button>
              </div>

              <button
                type="button"
                className="super-btn-primary"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;

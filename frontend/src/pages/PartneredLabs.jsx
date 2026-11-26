import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Microscope,
  Building2,
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Sliders,
  Check,
  X,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Eye,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PartneredLabs = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [hospitals, setHospitals] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Main View Tab: 'hospitals' (Default) vs 'labs' (Directory)
  const [activeTab, setActiveTab] = useState('hospitals');

  // Filters for Hospitals View
  const [cardFilter, setCardFilter] = useState('all'); // 'all' | 'configured' | 'pending'
  const [search, setSearch] = useState('');

  // Filters for Labs Directory
  const [labSearch, setLabSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals
  // 1. Manage Lab Access for a Hospital
  const [managingHospital, setManagingHospital] = useState(null);
  const [selectedLabIds, setSelectedLabIds] = useState([]);
  const [modalLabSearch, setModalLabSearch] = useState('');
  const [modalLabCategory, setModalLabCategory] = useState('All');
  const [savingAccess, setSavingAccess] = useState(false);

  // 2. View Lab Profile Details
  const [viewingLab, setViewingLab] = useState(null);

  // 3. Edit Laboratory Information
  const [editingLab, setEditingLab] = useState(null);
  const [updatingLab, setUpdatingLab] = useState(false);
  const [editError, setEditError] = useState('');

  // 4. Delete Laboratory Confirmation
  const [deletingLab, setDeletingLab] = useState(null);
  const [isDeletingLab, setIsDeletingLab] = useState(false);

  // 5. Register New Partnered Lab
  const [isRegisterLabOpen, setIsRegisterLabOpen] = useState(false);
  const [registeringLab, setRegisteringLab] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [newLabForm, setNewLabForm] = useState({
    name: '',
    licenseNumber: '',
    category: 'Multi-Specialty Diagnostics',
    phone: '',
    email: '',
    city: '',
    address: '',
    operatingHours: '07:00 AM - 09:00 PM',
    commissionRate: 10,
    accreditations: ['NABL Accredited'],
  });

  // Success / Error Toast Notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-dismiss notifications
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Fetch Hospitals and Partnered Labs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [hospRes, labsRes] = await Promise.all([
        fetch('/api/hospitals', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
        fetch('/api/partnered-labs', {
          headers: { Authorization: `Bearer ${admin?.token}` },
        }),
      ]);

      if (hospRes.ok) {
        const hospData = await hospRes.json();
        setHospitals(Array.isArray(hospData) ? hospData : []);
      }

      if (labsRes.ok) {
        const labsData = await labsRes.json();
        setLabs(Array.isArray(labsData.labs) ? labsData.labs : []);
      }
    } catch (err) {
      console.error('Error fetching partnered labs data:', err);
      setErrorMessage('Failed to load records from server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.token) {
      fetchData();
    }
  }, [admin]);

  // Helper: Retrieve assigned partner labs for a given hospital
  const getAssignedLabsForHospital = (hospitalId) => {
    if (!hospitalId || !Array.isArray(labs)) return [];
    return labs.filter((lab) => {
      if (!Array.isArray(lab.hospitals)) return false;
      return lab.hospitals.some((item) => {
        const id = item?._id || item;
        return id?.toString() === hospitalId.toString();
      });
    });
  };

  // Compute KPI counts
  const stats = useMemo(() => {
    let configuredCount = 0;
    let pendingCount = 0;

    hospitals.forEach((h) => {
      const assigned = getAssignedLabsForHospital(h._id);
      if (assigned.length > 0) {
        configuredCount += 1;
      } else {
        pendingCount += 1;
      }
    });

    const activeLabsCount = labs.filter(
      (l) => l.status === 'Active' && l.partnershipStatus === 'Approved'
    ).length;

    return {
      totalHospitals: hospitals.length,
      configuredCount,
      pendingCount,
      activeLabsCount,
      totalPartneredLabs: labs.length,
    };
  }, [hospitals, labs]);

  // Displayed hospitals based on filters and search
  const displayedHospitals = useMemo(() => {
    let list = hospitals;

    if (cardFilter === 'configured') {
      list = list.filter((h) => getAssignedLabsForHospital(h._id).length > 0);
    } else if (cardFilter === 'pending') {
      list = list.filter((h) => getAssignedLabsForHospital(h._id).length === 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (h) =>
          (h.name || '').toLowerCase().includes(q) ||
          (h.code || '').toLowerCase().includes(q) ||
          (h.city || '').toLowerCase().includes(q) ||
          (h.phone || '').includes(q)
      );
    }

    return list;
  }, [hospitals, cardFilter, search, labs]);

  // Displayed labs for Directory tab
  const displayedLabs = useMemo(() => {
    let list = labs;

    if (categoryFilter !== 'All') {
      list = list.filter((l) => l.category === categoryFilter);
    }

    if (labSearch.trim()) {
      const q = labSearch.toLowerCase().trim();
      list = list.filter(
        (l) =>
          (l.name || '').toLowerCase().includes(q) ||
          (l.labCode || '').toLowerCase().includes(q) ||
          (l.city || '').toLowerCase().includes(q) ||
          (l.licenseNumber || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [labs, categoryFilter, labSearch]);

  // Open "Grant / Manage Lab Access" Modal for a hospital
  const handleOpenAccessModal = (hospital) => {
    const currentlyAssigned = getAssignedLabsForHospital(hospital._id);
    setSelectedLabIds(currentlyAssigned.map((l) => l._id.toString()));
    setManagingHospital(hospital);
    setModalLabSearch('');
    setModalLabCategory('All');
  };

  // Toggle selection of a laboratory inside the modal
  const handleToggleLabSelection = (labId) => {
    const strId = labId.toString();
    setSelectedLabIds((prev) =>
      prev.includes(strId) ? prev.filter((id) => id !== strId) : [...prev, strId]
    );
  };

  // Categories present in partner labs for the modal filter dropdown
  const modalCategories = useMemo(() => {
    const cats = new Set(labs.map((l) => l.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [labs]);

  // Filtered labs list inside the Manage Lab Access modal
  const filteredModalLabs = useMemo(() => {
    return labs.filter((lab) => {
      // 1. Specialty Category Filter
      if (modalLabCategory !== 'All' && lab.category !== modalLabCategory) return false;

      // 2. Search query filter
      if (modalLabSearch.trim()) {
        const q = modalLabSearch.toLowerCase().trim();
        const matchName = (lab.name || '').toLowerCase().includes(q);
        const matchCode = (lab.labCode || '').toLowerCase().includes(q);
        const matchCity = (lab.city || '').toLowerCase().includes(q);
        const matchCat = (lab.category || '').toLowerCase().includes(q);
        return matchName || matchCode || matchCity || matchCat;
      }

      return true;
    });
  }, [labs, modalLabCategory, modalLabSearch]);

  // Save updated lab access for the hospital
  const handleSaveAccess = async (e) => {
    if (e) e.preventDefault();
    if (!managingHospital) return;

    try {
      setSavingAccess(true);
      const res = await fetch('/api/partnered-labs/assign-to-hospital', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({
          hospitalId: managingHospital._id,
          labIds: selectedLabIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update partnered lab access');
      }

      setSuccessMessage(
        `Successfully updated partnered lab access for "${managingHospital.name}" (${selectedLabIds.length} lab${
          selectedLabIds.length === 1 ? '' : 's'
        } granted).`
      );

      if (Array.isArray(data.labs)) {
        setLabs(data.labs);
      } else {
        fetchData();
      }

      setManagingHospital(null);
    } catch (err) {
      console.error('Error saving lab access:', err);
      setErrorMessage(err.message || 'Failed to update lab access permissions.');
    } finally {
      setSavingAccess(false);
    }
  };

  // Open Edit Lab Modal
  const handleOpenEditLab = (lab) => {
    setEditError('');
    setEditingLab({
      ...lab,
      name: lab.name || '',
      licenseNumber: lab.licenseNumber || '',
      category: lab.category || 'Multi-Specialty Diagnostics',
      phone: lab.phone || '',
      email: lab.email || '',
      city: lab.city || '',
      address: lab.address || '',
      operatingHours: lab.operatingHours || '07:00 AM - 09:00 PM',
      commissionRate: lab.commissionRate !== undefined ? lab.commissionRate : 10,
    });
  };

  // Save edited lab
  const handleUpdateLab = async (e) => {
    e.preventDefault();
    if (!editingLab) return;
    setEditError('');

    if (!editingLab.name?.trim() || !editingLab.licenseNumber?.trim() || !editingLab.phone?.trim()) {
      setEditError('Laboratory Name, License Number, and Contact Phone are required.');
      return;
    }

    try {
      setUpdatingLab(true);
      const res = await fetch(`/api/partnered-labs/${editingLab._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({
          name: editingLab.name.trim(),
          licenseNumber: editingLab.licenseNumber.trim(),
          category: editingLab.category,
          phone: editingLab.phone.trim(),
          email: editingLab.email?.trim() || '',
          city: editingLab.city?.trim() || '',
          address: editingLab.address?.trim() || '',
          operatingHours: editingLab.operatingHours || '07:00 AM - 09:00 PM',
          commissionRate: Number(editingLab.commissionRate) || 10,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update laboratory');
      }

      setLabs((prev) => prev.map((l) => (l._id === data._id ? data : l)));
      setSuccessMessage(`Laboratory "${data.name}" updated successfully.`);
      setEditingLab(null);
    } catch (err) {
      console.error('Update lab error:', err);
      setEditError(err.message || 'Failed to update laboratory information.');
    } finally {
      setUpdatingLab(false);
    }
  };

  // Delete lab
  const handleDeleteLab = async () => {
    if (!deletingLab) return;

    try {
      setIsDeletingLab(true);
      const res = await fetch(`/api/partnered-labs/${deletingLab._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${admin?.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete laboratory');
      }

      setLabs((prev) => prev.filter((l) => l._id !== deletingLab._id));
      setSelectedLabIds((prev) => prev.filter((id) => id !== deletingLab._id.toString()));
      setSuccessMessage(`Laboratory "${deletingLab.name}" has been deleted.`);
      setDeletingLab(null);
    } catch (err) {
      console.error('Delete lab error:', err);
      setErrorMessage(err.message || 'Failed to delete laboratory.');
    } finally {
      setIsDeletingLab(false);
    }
  };

  // Register a new external laboratory
  const handleRegisterLab = async (e) => {
    e.preventDefault();
    setRegisterError('');

    if (!newLabForm.name.trim() || !newLabForm.licenseNumber.trim() || !newLabForm.phone.trim()) {
      setRegisterError('Laboratory Name, License Number, and Contact Phone are required.');
      return;
    }

    try {
      setRegisteringLab(true);
      const res = await fetch('/api/partnered-labs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify(newLabForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register laboratory');
      }

      setSuccessMessage(`Laboratory "${data.name}" (${data.labCode}) registered and activated!`);
      if (managingHospital && data?._id) {
        setSelectedLabIds((prev) => [...prev, data._id.toString()]);
      }
      setIsRegisterLabOpen(false);
      setNewLabForm({
        name: '',
        licenseNumber: '',
        category: 'Multi-Specialty Diagnostics',
        phone: '',
        email: '',
        city: '',
        address: '',
        operatingHours: '07:00 AM - 09:00 PM',
        commissionRate: 10,
        accreditations: ['NABL Accredited'],
      });

      fetchData();
    } catch (err) {
      console.error('Error registering lab:', err);
      setRegisterError(err.message || 'Failed to register laboratory.');
    } finally {
      setRegisteringLab(false);
    }
  };

  return (
    <div className="super-dashboard">
      {/* =========================================================================
          1. PAGE HEADER
          ========================================================================= */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <Microscope size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Partnered Laboratories</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Assign and manage external diagnostic laboratory access for network hospitals without in-house facilities
            </p>
          </div>
        </div>

        <div className="dashboard-controls-group" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className="super-btn-primary"
            onClick={() => {
              setRegisterError('');
              setIsRegisterLabOpen(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} />
            <span>Register External Lab</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          NOTIFICATIONS (SUCCESS & ERROR TOASTS)
          ========================================================================= */}
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
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle size={18} color="#dc2626" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. KPI METRICS CARDS (CLICKABLE FILTERS & NAVIGATION)
          ========================================================================= */}
      <div className="super-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {/* Card 1: Total Network Hospitals */}
        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('hospitals');
            setCardFilter('all');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'hospitals' && cardFilter === 'all' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: activeTab === 'hospitals' && cardFilter === 'all' ? '#f0f9ff' : '#ffffff',
            boxShadow: activeTab === 'hospitals' && cardFilter === 'all' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: activeTab === 'hospitals' && cardFilter === 'all' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all network hospitals"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Total Hospitals</span>
            <span className="super-metric-value" style={{ color: '#0284c7' }}>
              {stats.totalHospitals}
            </span>
            <span
              className="super-metric-trend"
              style={{
                color: activeTab === 'hospitals' && cardFilter === 'all' ? '#0284c7' : '#64748b',
                fontWeight: activeTab === 'hospitals' && cardFilter === 'all' ? 700 : 500,
              }}
            >
              {activeTab === 'hospitals' && cardFilter === 'all' ? '● Active View: All Hospitals' : 'Registered Hospital Network'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <Building2 size={20} color="#ffffff" />
          </div>
        </div>

        {/* Card 2: Lab Access Configured */}
        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('hospitals');
            setCardFilter('configured');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'hospitals' && cardFilter === 'configured' ? '2px solid #10b981' : '1px solid #eaeff5',
            background: activeTab === 'hospitals' && cardFilter === 'configured' ? '#f0fdf4' : '#ffffff',
            boxShadow: activeTab === 'hospitals' && cardFilter === 'configured' ? '0 4px 16px rgba(16, 185, 129, 0.16)' : 'none',
            transform: activeTab === 'hospitals' && cardFilter === 'configured' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view hospitals with partner lab access granted"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Access Granted</span>
            <span className="super-metric-value" style={{ color: '#059669' }}>
              {stats.configuredCount}
            </span>
            <span
              className="super-metric-trend positive"
              style={{
                color: activeTab === 'hospitals' && cardFilter === 'configured' ? '#059669' : '#64748b',
                fontWeight: activeTab === 'hospitals' && cardFilter === 'configured' ? 700 : 500,
              }}
            >
              {activeTab === 'hospitals' && cardFilter === 'configured' ? '● Filtered: Partner Labs Linked' : 'Diagnostic Links Active'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#10b981' }}>
            <ShieldCheck size={20} color="#ffffff" />
          </div>
        </div>

        {/* Card 3: Pending Lab Access */}
        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('hospitals');
            setCardFilter('pending');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'hospitals' && cardFilter === 'pending' ? '2px solid #ef4444' : '1px solid #eaeff5',
            background: activeTab === 'hospitals' && cardFilter === 'pending' ? '#fef2f2' : '#ffffff',
            boxShadow: activeTab === 'hospitals' && cardFilter === 'pending' ? '0 4px 16px rgba(239, 68, 68, 0.16)' : 'none',
            transform: activeTab === 'hospitals' && cardFilter === 'pending' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view hospitals awaiting partner lab assignment"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Pending Lab Access</span>
            <span className="super-metric-value" style={{ color: '#dc2626' }}>
              {stats.pendingCount}
            </span>
            <span
              className="super-metric-trend negative"
              style={{
                color: activeTab === 'hospitals' && cardFilter === 'pending' ? '#dc2626' : '#64748b',
                fontWeight: activeTab === 'hospitals' && cardFilter === 'pending' ? 700 : 500,
              }}
            >
              {activeTab === 'hospitals' && cardFilter === 'pending' ? '● Action Needed: Assign Labs' : 'No Partnered Lab Assigned'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#ef4444' }}>
            <AlertTriangle size={20} color="#ffffff" />
          </div>
        </div>

        {/* Card 4: Partnered Labs Directory */}
        <div
          className="super-metric-card"
          onClick={() => {
            setActiveTab('labs');
          }}
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: activeTab === 'labs' ? '2px solid #0284c7' : '1px solid #eaeff5',
            background: activeTab === 'labs' ? '#f0f9ff' : '#ffffff',
            boxShadow: activeTab === 'labs' ? '0 4px 16px rgba(2, 132, 199, 0.16)' : 'none',
            transform: activeTab === 'labs' ? 'translateY(-2px)' : 'none',
          }}
          title="Click to view all external partnered diagnostic laboratories"
        >
          <div className="metric-info-left">
            <span className="super-metric-label">Partnered Labs Directory</span>
            <span className="super-metric-value" style={{ color: '#0284c7' }}>
              {stats.activeLabsCount}
            </span>
            <span
              className="super-metric-trend"
              style={{
                color: activeTab === 'labs' ? '#0284c7' : '#64748b',
                fontWeight: activeTab === 'labs' ? 700 : 500,
              }}
            >
              {activeTab === 'labs' ? '● Active: External Lab Catalog' : 'Accredited Diagnostic Networks'}
            </span>
          </div>
          <div className="super-metric-icon-wrap" style={{ background: '#0284c7' }}>
            <FlaskConical size={20} color="#ffffff" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN PANEL CARD
          ========================================================================= */}
      {activeTab === 'hospitals' ? (
        <div className="super-panel-card">
          {/* Panel Card Header */}
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                All Network Hospitals{' '}
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                  ({displayedHospitals.length})
                </span>
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Manage and grant external partner diagnostic laboratory access to network hospitals.
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Status Filter */}
              <select
                className="super-select-dropdown"
                value={cardFilter}
                onChange={(e) => setCardFilter(e.target.value)}
              >
                <option value="all">All Hospitals ({hospitals.length})</option>
                <option value="configured">Access Granted ({stats.configuredCount})</option>
                <option value="pending">Pending Lab Access ({stats.pendingCount})</option>
              </select>

              {/* Search Bar */}
              <div className="super-nav-search" style={{ width: '250px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search hospital, code, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
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

          {/* Table Container */}
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
                    margin: '0 auto 1rem',
                  }}
                />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading hospital lab access records...</p>
              </div>
            ) : displayedHospitals.length === 0 ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Building2 size={30} color="#64748b" />
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
                  No matching hospital records found
                </h4>
                <p
                  style={{
                    margin: '0 auto 1.5rem',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    maxWidth: '460px',
                    lineHeight: 1.5,
                  }}
                >
                  Try changing your search terms or filters.
                </p>

                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => {
                    setSearch('');
                    setCardFilter('all');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <table className="super-table">
                <thead>
                  <tr>
                    <th>Hospital Name & Address</th>
                    <th>Facility Code</th>
                    <th>City / Region</th>
                    <th>Contact Information</th>
                    <th>Partnered Labs Access</th>
                    <th style={{ textAlign: 'right' }}>Management Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedHospitals.map((hosp) => {
                    const assignedLabs = getAssignedLabsForHospital(hosp._id);

                    return (
                      <tr key={hosp._id}>
                        {/* Hospital Name & Address */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <strong>{hosp.name}</strong>
                          </div>
                          {hosp.address && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                              {hosp.address}
                            </div>
                          )}
                        </td>

                        {/* Facility Code */}
                        <td>
                          <span className="card-id-badge">{hosp.code}</span>
                        </td>

                        {/* City / Region */}
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={13} color="#64748b" />
                            {hosp.city || 'Network'}
                          </span>
                        </td>

                        {/* Contact Information */}
                        <td>
                          <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                            <div>
                              <Phone size={12} style={{ marginRight: 4 }} />
                              {hosp.phone}
                            </div>
                            {hosp.email && (
                              <div>
                                <Mail size={12} style={{ marginRight: 4 }} />
                                {hosp.email}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Partnered Labs Access */}
                        <td>
                          {assignedLabs.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              <div>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    background: '#ecfdf5',
                                    color: '#065f46',
                                    border: '1px solid #a7f3d0',
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  {assignedLabs.length} Partnered Lab{assignedLabs.length === 1 ? '' : 's'} Granted
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                                {assignedLabs.map((lab) => (
                                  <span
                                    key={lab._id}
                                    onClick={() => setViewingLab(lab)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 600,
                                      background: '#f8fafc',
                                      color: '#0369a1',
                                      border: '1px solid #bae6fd',
                                      cursor: 'pointer',
                                    }}
                                    title="Click to view lab details"
                                  >
                                    <FlaskConical size={10} />
                                    {lab.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.15rem 0.55rem',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                background: '#fef2f2',
                                color: '#991b1b',
                                border: '1px solid #fecaca',
                              }}
                            >
                              <AlertTriangle size={12} color="#dc2626" />
                              No Partnered Lab Assigned
                            </span>
                          )}
                        </td>

                        {/* Management Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div
                            className="table-actions-cell"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              justifyContent: 'flex-end',
                            }}
                          >
                            <button
                              type="button"
                              className="super-btn-primary"
                              onClick={() => handleOpenAccessModal(hosp)}
                              style={{
                                padding: '0.32rem 0.75rem',
                                fontSize: '0.78rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              title="Assign or update partnered labs for this hospital"
                            >
                              <Sliders size={13} />
                              <span>{assignedLabs.length > 0 ? 'Manage Lab Access' : 'Grant Lab Access'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
            PARTNERED LABS DIRECTORY TAB
            ========================================================================= */
        <div className="super-panel-card">
          <div className="panel-card-header" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Partnered Diagnostic Laboratories{' '}
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                  ({displayedLabs.length})
                </span>
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                External accredited laboratories available to receive referrals from hospitals without in-house labs.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="super-select-dropdown"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Specialties</option>
                <option value="Multi-Specialty Diagnostics">Multi-Specialty Diagnostics</option>
                <option value="Pathology & Biochemistry">Pathology & Biochemistry</option>
                <option value="Microbiology & Serology">Microbiology & Serology</option>
                <option value="Molecular Diagnostics">Molecular Diagnostics</option>
                <option value="Genetics & Genomics">Genetics & Genomics</option>
              </select>

              <div className="super-nav-search" style={{ width: '250px' }}>
                <Search size={16} className="super-search-icon" />
                <input
                  type="text"
                  className="super-search-input"
                  placeholder="Search lab name, license, city..."
                  value={labSearch}
                  onChange={(e) => setLabSearch(e.target.value)}
                />
                {labSearch && (
                  <button
                    type="button"
                    onClick={() => setLabSearch('')}
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

          <div className="table-responsive">
            {displayedLabs.length === 0 ? (
              <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
                <FlaskConical size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                <p>No partnered laboratories matching search query.</p>
              </div>
            ) : (
              <table className="super-table">
                <thead>
                  <tr>
                    <th>Laboratory Profile</th>
                    <th>Specialty Category</th>
                    <th>Accreditations</th>
                    <th>Contact & Hours</th>
                    <th>Hospitals Connected</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLabs.map((lab) => {
                    const connectedCount = Array.isArray(lab.hospitals) ? lab.hospitals.length : 0;

                    return (
                      <tr key={lab._id}>
                        <td>
                          <strong>{lab.name}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{lab.labCode}</span>
                            {' • '}
                            <span>Lic: {lab.licenseNumber}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            {lab.category}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {lab.city}, {lab.state || 'Maharashtra'}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(lab.accreditations || []).map((acc) => (
                              <span
                                key={acc}
                                style={{
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 600,
                                }}
                              >
                                {acc}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                            <div>
                              <Phone size={11} style={{ marginRight: 4 }} />
                              {lab.phone}
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 2 }}>
                              <Clock size={10} style={{ marginRight: 3 }} />
                              {lab.operatingHours}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.18rem 0.55rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: connectedCount > 0 ? '#f0fdf4' : '#f8fafc',
                              color: connectedCount > 0 ? '#166534' : '#64748b',
                              border: `1px solid ${connectedCount > 0 ? '#bbf7d0' : '#e2e8f0'}`,
                            }}
                          >
                            <Building2 size={12} />
                            {connectedCount} Hospital{connectedCount === 1 ? '' : 's'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`super-status-pill ${
                              lab.status === 'Active' ? 'active' : 'inactive'
                            }`}
                          >
                            <span className="status-dot"></span>
                            {lab.status || 'Active'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="super-btn-secondary"
                              onClick={() => setViewingLab(lab)}
                              style={{ padding: '0.28rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              <Eye size={13} style={{ marginRight: '0.25rem' }} />
                              <span>Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditLab(lab)}
                              title="Edit Laboratory Details"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #bae6fd',
                                background: '#f0f9ff',
                                color: '#0284c7',
                                cursor: 'pointer',
                              }}
                            >
                              <Edit2 size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingLab(lab)}
                              title="Delete Laboratory"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#dc2626',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GRANT / MANAGE LAB ACCESS FOR A HOSPITAL
          ========================================================================= */}
      {managingHospital && (
        <div className="super-modal-backdrop">
          <div className="super-modal-card" style={{ maxWidth: '820px', width: '94%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="super-modal-header" style={{ paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Grant & Manage Partnered Lab Access</h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Configure external diagnostic laboratories authorized for this facility
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="super-btn-primary"
                  onClick={() => setIsRegisterLabOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                  }}
                  title="Register and onboard an additional diagnostic laboratory"
                >
                  <Plus size={14} />
                  <span>Add Lab Option</span>
                </button>

                <button
                  className="modal-close-icon"
                  onClick={() => setManagingHospital(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Target Hospital Subheader */}
            <div
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '0.75rem 1.25rem',
                fontSize: '0.825rem',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', marginRight: '0.5rem' }}>
                  {managingHospital.name} ({managingHospital.code})
                </span>
                <span style={{ color: '#64748b' }}>
                  — Select external partner laboratories to grant diagnostic testing access.
                </span>
              </div>
            </div>

            <div className="super-modal-body" style={{ maxHeight: '58vh', overflowY: 'auto', padding: '1rem 1.25rem' }}>
              {/* Filtering Controls: Category Dropdown & Search Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                  Available Partner Laboratories ({selectedLabIds.length} of {labs.length} granted)
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {/* Category Dropdown */}
                  <select
                    className="super-select-dropdown"
                    value={modalLabCategory}
                    onChange={(e) => setModalLabCategory(e.target.value)}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', minWidth: '150px' }}
                  >
                    {modalCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Specialties' : cat}
                      </option>
                    ))}
                  </select>

                  {/* Search Input */}
                  <div className="super-nav-search" style={{ width: '200px' }}>
                    <Search size={13} className="super-search-icon" />
                    <input
                      type="text"
                      className="super-search-input"
                      placeholder="Search lab options..."
                      value={modalLabSearch}
                      onChange={(e) => setModalLabSearch(e.target.value)}
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem 0.3rem 1.8rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Lab List Cards with Edit & Delete Logo Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filteredModalLabs.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2.5rem 1rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1',
                      color: '#64748b',
                    }}
                  >
                    <Microscope size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'inline-block' }} />
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.9rem' }}>
                      No Laboratory Options Found
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Try selecting "All Labs" or clearing your search filter.
                    </div>
                    <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="super-btn-secondary"
                        onClick={() => {
                          setModalLabSearch('');
                          setModalLabCategory('All');
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                      >
                        Reset Filters
                      </button>
                      <button
                        type="button"
                        className="super-btn-primary"
                        onClick={() => setIsRegisterLabOpen(true)}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Plus size={13} />
                        <span>Register New Lab</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredModalLabs.map((lab) => {
                    const isSelected = selectedLabIds.includes(lab._id.toString());
                    const isApproved = lab.partnershipStatus === 'Approved';

                    return (
                      <div
                        key={lab._id}
                        onClick={() => handleToggleLabSelection(lab._id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          background: isSelected ? '#f0f9ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(2, 132, 199, 0.08)' : 'none',
                        }}
                      >
                        <div style={{ color: isSelected ? '#0284c7' : '#94a3b8', flexShrink: 0 }}>
                          {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                              {lab.name}
                            </span>
                            <span className="card-id-badge" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                              {lab.labCode}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '9999px',
                                background: isApproved ? '#ecfdf5' : '#fffbeb',
                                color: isApproved ? '#047857' : '#b45309',
                                fontWeight: 600,
                                border: isApproved ? '1px solid #a7f3d0' : '1px solid #fde68a',
                              }}
                            >
                              {lab.partnershipStatus}
                            </span>
                            {lab.status === 'Active' && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.08rem 0.4rem',
                                  borderRadius: '9999px',
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  fontWeight: 600,
                                }}
                              >
                                Active Provider
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              fontSize: '0.775rem',
                              color: '#64748b',
                              marginTop: '0.25rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={{ color: '#0284c7', fontWeight: 600 }}>{lab.category}</span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={12} style={{ color: '#94a3b8' }} />
                              {lab.city || 'Network'}, {lab.state || 'India'}
                            </span>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={12} style={{ color: '#94a3b8' }} />
                              {lab.operatingHours || 'Standard Diagnostic Hours'}
                            </span>
                          </div>

                          {/* Accreditations & Test Offerings Strip */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              marginTop: '0.35rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            {(lab.accreditations || []).map((acc, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: '4px',
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  fontWeight: 500,
                                }}
                              >
                                {acc}
                              </span>
                            ))}
                            {Array.isArray(lab.offeredTests) && lab.offeredTests.length > 0 && (
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '0.05rem 0.35rem',
                                  borderRadius: '4px',
                                  background: '#f1f5f9',
                                  color: '#475569',
                                  fontWeight: 600,
                                }}
                              >
                                {lab.offeredTests.length} Tests Available
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badge & Edit/Delete Logo Icons */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#0284c7',
                                background: '#e0f2fe',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                marginRight: '0.2rem',
                              }}
                            >
                              <Check size={14} /> Granted Access
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748b',
                                background: '#f1f5f9',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                marginRight: '0.2rem',
                              }}
                            >
                              Click to Grant
                            </span>
                          )}

                          {/* Edit Logo */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditLab(lab);
                            }}
                            title={`Edit ${lab.name}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: '1px solid #bae6fd',
                              background: '#f0f9ff',
                              color: '#0284c7',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e0f2fe';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f0f9ff';
                            }}
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete Logo */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingLab(lab);
                            }}
                            title={`Delete ${lab.name}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#fef2f2';
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => setManagingHospital(null)}
                disabled={savingAccess}
              >
                Cancel
              </button>
              <button
                type="button"
                className="super-btn-primary"
                onClick={handleSaveAccess}
                disabled={savingAccess}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ShieldCheck size={16} />
                <span>{savingAccess ? 'Saving Access...' : 'Save & Grant Lab Access'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT LABORATORY INFORMATION
          ========================================================================= */}
      {editingLab && (
        <div className="super-modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="super-modal-card" style={{ maxWidth: '580px', width: '92%' }}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={18} color="#0284c7" />
                <h3>Edit Laboratory Information</h3>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => setEditingLab(null)}
              >
                <X size={18} />
              </button>
            </div>

            {editError && (
              <div style={{ padding: '0.75rem 1.5rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateLab}>
              <div className="super-modal-body">
                <div className="form-group">
                  <label>Laboratory Name *</label>
                  <input
                    type="text"
                    required
                    value={editingLab.name || ''}
                    onChange={(e) => setEditingLab({ ...editingLab, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>License / Registration No. *</label>
                    <input
                      type="text"
                      required
                      value={editingLab.licenseNumber || ''}
                      onChange={(e) => setEditingLab({ ...editingLab, licenseNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Specialty Category</label>
                    <select
                      value={editingLab.category || 'Multi-Specialty Diagnostics'}
                      onChange={(e) => setEditingLab({ ...editingLab, category: e.target.value })}
                    >
                      <option value="Multi-Specialty Diagnostics">Multi-Specialty Diagnostics</option>
                      <option value="Pathology & Biochemistry">Pathology & Biochemistry</option>
                      <option value="Microbiology & Serology">Microbiology & Serology</option>
                      <option value="Molecular Diagnostics">Molecular Diagnostics</option>
                      <option value="Radiology & Imaging">Radiology & Imaging</option>
                      <option value="Genetics & Genomics">Genetics & Genomics</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={editingLab.phone || ''}
                      onChange={(e) => setEditingLab({ ...editingLab, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Official Email</label>
                    <input
                      type="email"
                      value={editingLab.email || ''}
                      onChange={(e) => setEditingLab({ ...editingLab, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>City / Region</label>
                    <input
                      type="text"
                      value={editingLab.city || ''}
                      onChange={(e) => setEditingLab({ ...editingLab, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Operating Hours</label>
                    <input
                      type="text"
                      value={editingLab.operatingHours || ''}
                      onChange={(e) => setEditingLab({ ...editingLab, operatingHours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Address</label>
                  <input
                    type="text"
                    value={editingLab.address || ''}
                    onChange={(e) => setEditingLab({ ...editingLab, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setEditingLab(null)}
                  disabled={updatingLab}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={updatingLab}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} />
                  <span>{updatingLab ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DELETE PARTNERED LABORATORY CONFIRMATION
          ========================================================================= */}
      {deletingLab && (
        <div className="super-modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="super-modal-card" style={{ maxWidth: '480px', width: '92%' }}>
            <div className="super-modal-header" style={{ borderBottom: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c' }}>
                <Trash2 size={20} color="#dc2626" />
                <h3 style={{ color: '#b91c1c' }}>Delete Partnered Laboratory</h3>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => setDeletingLab(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.5 }}>
                Are you sure you want to delete <strong>{deletingLab.name}</strong> ({deletingLab.labCode})?
              </p>
              <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748b', lineHeight: 1.4 }}>
                This will permanently remove this laboratory from the Medy network and revoke test routing access from all connected hospitals ({deletingLab.hospitals?.length || 0} hospitals currently linked).
              </p>
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => setDeletingLab(null)}
                disabled={isDeletingLab}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLab}
                disabled={isDeletingLab}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={16} />
                <span>{isDeletingLab ? 'Deleting...' : 'Delete Laboratory'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW LAB PROFILE DETAILS
          ========================================================================= */}
      {viewingLab && (
        <div className="super-modal-backdrop">
          <div className="super-modal-card" style={{ maxWidth: '580px', width: '92%' }}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlaskConical size={20} color="#0284c7" />
                <h3>{viewingLab.name}</h3>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => setViewingLab(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="super-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Lab Code</label>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{viewingLab.labCode}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>License Number</label>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{viewingLab.licenseNumber}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Specialty Category</label>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>{viewingLab.category}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Status</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: viewingLab.status === 'Active' ? '#047857' : '#b91c1c' }}>
                    {viewingLab.status} ({viewingLab.partnershipStatus})
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Phone</label>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>{viewingLab.phone}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Email</label>
                  <div style={{ fontSize: '0.85rem', color: '#334155' }}>{viewingLab.email || 'N/A'}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Operating Hours & Address</label>
                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                  {viewingLab.operatingHours} • {viewingLab.address ? `${viewingLab.address}, ` : ''}{viewingLab.city}
                </div>
              </div>

              {viewingLab.accreditations?.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                    Accreditations & Certifications
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {viewingLab.accreditations.map((acc) => (
                      <span
                        key={acc}
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Connected Network Hospitals ({viewingLab.hospitals?.length || 0})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {(viewingLab.hospitals || []).length > 0 ? (
                    viewingLab.hospitals.map((hosp) => (
                      <span
                        key={hosp._id || hosp}
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Building2 size={11} color="#64748b" />
                        {hosp.name || hosp.code || 'Hospital'}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      No hospitals currently connected.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="super-modal-footer">
              <button
                type="button"
                className="super-btn-secondary"
                onClick={() => setViewingLab(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: REGISTER EXTERNAL LABORATORY
          ========================================================================= */}
      {isRegisterLabOpen && (
        <div className="super-modal-backdrop">
          <div className="super-modal-card" style={{ maxWidth: '580px', width: '92%' }}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlaskConical size={20} color="#0284c7" />
                <h3>Register External Laboratory Partner</h3>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => setIsRegisterLabOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {registerError && (
              <div style={{ padding: '0.75rem 1.5rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.85rem' }}>
                {registerError}
              </div>
            )}

            <form onSubmit={handleRegisterLab}>
              <div className="super-modal-body">
                <div className="form-group">
                  <label>Laboratory Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suburban Diagnostic Center"
                    value={newLabForm.name}
                    onChange={(e) => setNewLabForm({ ...newLabForm, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>License / Registration No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NABL-MH-2024-998"
                      value={newLabForm.licenseNumber}
                      onChange={(e) => setNewLabForm({ ...newLabForm, licenseNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Specialty Category</label>
                    <select
                      value={newLabForm.category}
                      onChange={(e) => setNewLabForm({ ...newLabForm, category: e.target.value })}
                    >
                      <option value="Multi-Specialty Diagnostics">Multi-Specialty Diagnostics</option>
                      <option value="Pathology & Biochemistry">Pathology & Biochemistry</option>
                      <option value="Microbiology & Serology">Microbiology & Serology</option>
                      <option value="Molecular Diagnostics">Molecular Diagnostics</option>
                      <option value="Radiology & Imaging">Radiology & Imaging</option>
                      <option value="Genetics & Genomics">Genetics & Genomics</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 22 2847 9000"
                      value={newLabForm.phone}
                      onChange={(e) => setNewLabForm({ ...newLabForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Official Email</label>
                    <input
                      type="email"
                      placeholder="e.g. contact@lab.com"
                      value={newLabForm.email}
                      onChange={(e) => setNewLabForm({ ...newLabForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>City / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={newLabForm.city}
                      onChange={(e) => setNewLabForm({ ...newLabForm, city: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Operating Hours</label>
                    <input
                      type="text"
                      placeholder="07:00 AM - 09:00 PM"
                      value={newLabForm.operatingHours}
                      onChange={(e) => setNewLabForm({ ...newLabForm, operatingHours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Full Address</label>
                  <input
                    type="text"
                    placeholder="Building, street, area, pincode"
                    value={newLabForm.address}
                    onChange={(e) => setNewLabForm({ ...newLabForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setIsRegisterLabOpen(false)}
                  disabled={registeringLab}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="super-btn-primary"
                  disabled={registeringLab}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} />
                  <span>{registeringLab ? 'Registering...' : 'Register Laboratory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartneredLabs;

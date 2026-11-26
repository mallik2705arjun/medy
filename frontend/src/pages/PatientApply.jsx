import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MedyCardPreview from '../components/MedyCardPreview';
import {
  CreditCard,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Shield,
  XCircle,
  Copy,
  Check,
} from 'lucide-react';

const PLANS = [
  {
    name: 'Silver',
    coverage: 500000,
    coverageLabel: '₹5,00,000',
    description: 'Essential cashless healthcare covering primary hospitalization & diagnostics.',
    color: '#0284c7',
  },
  {
    name: 'Gold',
    coverage: 1000000,
    coverageLabel: '₹10,00,000',
    description: 'Comprehensive family coverage with priority network hospital admission.',
    color: '#d97706',
    popular: true,
  },
  {
    name: 'Platinum',
    coverage: 2500000,
    coverageLabel: '₹25,00,000',
    description: 'Zero-deductible super specialty cover with immediate emergency authorization.',
    color: '#7c3aed',
  },
];

const PatientApply = () => {
  const [activeTab, setActiveTab] = useState('apply'); // 'apply' | 'status'
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    hospitalName: '',
    requestedPlan: 'Gold',
    requestedCoverage: 1000000,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [applicationResult, setApplicationResult] = useState(null);

  // Real-time Hospital Patient Registration Verification
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [registrationCheck, setRegistrationCheck] = useState(null);

  // Status Check State
  const [statusPhone, setStatusPhone] = useState('');
  const [statusHospital, setStatusHospital] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [copiedCardId, setCopiedCardId] = useState(false);

  // Load public hospitals list
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoadingHospitals(true);
        const res = await fetch('/api/hospitals/public');
        if (res.ok) {
          const data = await res.json();
          setHospitals(data || []);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, hospitalName: data[0].name }));
            setStatusHospital(data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load public hospitals:', err);
      } finally {
        setLoadingHospitals(false);
      }
    };
    fetchHospitals();
  }, []);

  // Check if patient is officially registered at the selected hospital
  const checkPatientRegistration = async (phoneToVerify, hospitalToVerify) => {
    if (!phoneToVerify || phoneToVerify.trim().length < 8 || !hospitalToVerify) {
      setRegistrationCheck(null);
      return;
    }

    try {
      setCheckingRegistration(true);
      const res = await fetch(
        `/api/patients/check-registered?phone=${encodeURIComponent(
          phoneToVerify.trim()
        )}&hospitalName=${encodeURIComponent(hospitalToVerify.trim())}`
      );
      const data = await res.json();
      if (res.ok) {
        setRegistrationCheck({
          checked: true,
          registered: data.registered,
          patient: data.patient || null,
          message: data.message,
        });

        // If registered patient found, auto-populate details for convenience
        if (data.registered && data.patient) {
          setFormData((prev) => ({
            ...prev,
            name: data.patient.name || prev.name,
            age: data.patient.age || prev.age,
            gender: data.patient.gender || prev.gender,
            email: data.patient.email || prev.email,
            address: data.patient.address || prev.address,
          }));
        }
      }
    } catch (err) {
      console.error('Registration check error:', err);
    } finally {
      setCheckingRegistration(false);
    }
  };

  // Debounced effect to check patient registration as user types phone or changes hospital
  useEffect(() => {
    const cleanPhone = formData.phone.trim();
    if (cleanPhone.length >= 10 && formData.hospitalName) {
      const timer = setTimeout(() => {
        checkPatientRegistration(cleanPhone, formData.hospitalName);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setRegistrationCheck(null);
    }
  }, [formData.phone, formData.hospitalName]);

  // Handle plan select
  const handleSelectPlan = (plan) => {
    setFormData((prev) => ({
      ...prev,
      requestedPlan: plan.name,
      requestedCoverage: plan.coverage,
    }));
  };

  // Submit Application
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Pre-flight check: Only registered patients can apply
    if (registrationCheck && !registrationCheck.registered) {
      setSubmitError(
        `Registration Required: You are not registered at ${formData.hospitalName}. Only patients who have registered in the hospital can apply for a Medy Card. Please contact or visit ${formData.hospitalName} to register first.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/patients/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit application.');
      }

      setApplicationResult({
        ...data.patient,
        serverMessage: data.message,
      });
    } catch (err) {
      setSubmitError(err.message || 'Network error while submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Check Status
  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setStatusError('');
    setStatusResult(null);

    if (!statusPhone.trim()) {
      setStatusError('Please enter your registered mobile phone number.');
      return;
    }

    try {
      setCheckingStatus(true);
      const params = new URLSearchParams({ phone: statusPhone.trim() });
      if (statusHospital && statusHospital !== 'All') {
        params.append('hospital', statusHospital);
      }

      const res = await fetch(`/api/patients/status?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'No application found for this phone number.');
      }

      setStatusResult(data);
    } catch (err) {
      setStatusError(err.message || 'Failed to find application details.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCardId(true);
    setTimeout(() => setCopiedCardId(false), 2000);
  };

  return (
    <div className="patient-portal-page">
      {/* Top Brand Nav */}
      <header className="patient-portal-header">
        <div className="portal-header-inner">
          <div className="portal-brand">
            <div className="brand-logo-icon">
              <Shield size={24} />
            </div>
            <div>
              <span className="brand-title">Medy Health Network</span>
              <span className="brand-subtitle">Official Insurance Card Portal</span>
            </div>
          </div>

          <div className="portal-header-actions">
            <Link to="/login" className="btn-portal-admin">
              Hospital Admin Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="portal-hero">
        <div className="hero-content">
          <span className="hero-pill">
            <Sparkles size={14} /> Cashless Healthcare Access
          </span>
          <h1>Apply for Your Medy Health Insurance Card</h1>
          <p>
            Choose your preferred network hospital, submit your patient information, and receive your
            official Medy Insurance Card with instant hospital validation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="portal-tabs">
          <button
            className={`portal-tab-btn ${activeTab === 'apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('apply')}
          >
            <User size={16} />
            <span>Apply for New Card</span>
          </button>
          <button
            className={`portal-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <Search size={16} />
            <span>Check Application Status</span>
          </button>
        </div>
      </section>

      {/* Main Container */}
      <main className="portal-container">
        {activeTab === 'apply' ? (
          applicationResult ? (
            /* Application Success Receipt */
            <div className="application-success-card">
              <div className="success-header">
                <div className="success-check-icon">
                  <CheckCircle2 size={40} />
                </div>
                <h2>Application Submitted Successfully!</h2>
                <p className="success-sub">
                  Your Medy Card application has been received and forwarded to{' '}
                  <strong>{applicationResult.hospitalName}</strong> for acceptance and card issuance.
                </p>
              </div>

              <div className="receipt-details">
                <div className="receipt-row">
                  <span className="receipt-label">Applicant Name</span>
                  <span className="receipt-value">{applicationResult.name}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Contact Number</span>
                  <span className="receipt-value">{applicationResult.phone}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Registered Hospital</span>
                  <span className="receipt-value">{applicationResult.hospitalName}</span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Requested Plan</span>
                  <span className="receipt-value plan-badge">
                    {applicationResult.requestedPlan || formData.requestedPlan} Plan (₹
                    {(applicationResult.requestedCoverage || formData.requestedCoverage).toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="receipt-row">
                  <span className="receipt-label">Application Status</span>
                  <span className="receipt-status pending">
                    <Clock size={15} /> PENDING HOSPITAL ACCEPTANCE
                  </span>
                </div>
              </div>

              <div className="receipt-notice">
                <Building2 size={20} className="notice-icon" />
                <div>
                  <strong>What happens next?</strong>
                  <p>
                    The hospital administration will review your application in their Medy Admin Portal.
                    Once approved, your unique Medy Card ID will be generated and activated. You can track
                    the progress anytime in the <strong>"Check Application Status"</strong> tab.
                  </p>
                </div>
              </div>

              <div className="receipt-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    setApplicationResult(null);
                    setFormData({
                      name: '',
                      age: '',
                      gender: 'Male',
                      phone: '',
                      email: '',
                      address: '',
                      hospitalName: hospitals[0]?.name || '',
                      requestedPlan: 'Gold',
                      requestedCoverage: 1000000,
                    });
                  }}
                >
                  Submit Another Application
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setStatusPhone(applicationResult.phone);
                    setStatusHospital(applicationResult.hospitalName);
                    setActiveTab('status');
                  }}
                >
                  Track Application Status
                </button>
              </div>
            </div>
          ) : (
            /* Application Form */
            <div className="portal-form-card">
              <div className="form-card-header">
                <h2>Patient Application Form</h2>
                <p>Fill out the details below to apply for your official Medy Insurance Card.</p>
              </div>

              {/* Strict Hospital Registration Policy Notice */}
              <div className="registration-requirement-banner">
                <div className="req-banner-icon">
                  <ShieldCheck size={22} />
                </div>
                <div className="req-banner-text">
                  <h4>Hospital Patient Registration Required</h4>
                  <p>
                    <strong>Policy:</strong> Only patients who have registered in the hospital can apply for a Medy Card.
                    If you are not yet registered, please visit or contact the hospital to register first before submitting this application.
                  </p>
                </div>
              </div>

              {submitError && (
                <div className="form-alert-error">
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitApplication}>
                {/* 1. Hospital Selection */}
                <div className="portal-form-section">
                  <div className="section-header-row">
                    <span className="section-step-num">1</span>
                    <div>
                      <h3>Select Your Healthcare Facility</h3>
                      <p>Choose the network hospital where you wish to register and receive your card.</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Network Hospital *</label>
                    <div className="input-with-icon">
                      <Building2 size={18} />
                      <select
                        required
                        value={formData.hospitalName}
                        onChange={(e) =>
                          setFormData({ ...formData, hospitalName: e.target.value })
                        }
                      >
                        {loadingHospitals ? (
                          <option>Loading hospitals...</option>
                        ) : hospitals.length === 0 ? (
                          <option value="City Care Hospital">City Care Hospital</option>
                        ) : (
                          hospitals.map((hosp) => (
                            <option key={hosp._id || hosp.name} value={hosp.name}>
                              {hosp.name} — {hosp.city} ({hosp.code})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    <span className="form-helper-text">
                      The hospital administration will receive and verify your application directly.
                    </span>
                  </div>
                </div>

                {/* 2. Patient Personal Information */}
                <div className="portal-form-section">
                  <div className="section-header-row">
                    <span className="section-step-num">2</span>
                    <div>
                      <h3>Patient Information</h3>
                      <p>Enter your legal name and contact details as per government ID.</p>
                    </div>
                  </div>

                  <div className="portal-grid-2">
                    <div className="form-group">
                      <label>Full Patient Name *</label>
                      <div className="input-with-icon">
                        <User size={18} />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number (Registered Mobile) *</label>
                      <div className="input-with-icon">
                        <Phone size={18} />
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      {checkingRegistration && (
                        <div className="reg-inline-hint checking">
                          <span className="mini-spin"></span>
                          <span>Verifying hospital patient registration...</span>
                        </div>
                      )}
                      {!checkingRegistration && registrationCheck && registrationCheck.registered && registrationCheck.patient?.hasMedyCard && (
                        <div className="reg-inline-hint verified" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }}>
                          <CheckCircle2 size={14} />
                          <span>
                            Card already issued ({registrationCheck.patient.cardId}) for <strong>{registrationCheck.patient.name}</strong> at {formData.hospitalName}.
                          </span>
                        </div>
                      )}
                      {!checkingRegistration && registrationCheck && registrationCheck.registered && !registrationCheck.patient?.hasMedyCard && registrationCheck.patient?.applicationStatus === 'Pending' && (
                        <div className="reg-inline-hint checking" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                          <Clock size={14} />
                          <span>
                            Application already submitted and pending review for <strong>{registrationCheck.patient.name}</strong> at {formData.hospitalName}.
                          </span>
                        </div>
                      )}
                      {!checkingRegistration && registrationCheck && registrationCheck.registered && !registrationCheck.patient?.hasMedyCard && registrationCheck.patient?.applicationStatus !== 'Pending' && (
                        <div className="reg-inline-hint verified">
                          <CheckCircle2 size={14} />
                          <span>
                            Verified: <strong>{registrationCheck.patient?.name}</strong> is registered at {formData.hospitalName}. Eligible to apply!
                          </span>
                        </div>
                      )}
                      {!checkingRegistration && registrationCheck && !registrationCheck.registered && (
                        <div className="reg-inline-hint unregistered">
                          <AlertCircle size={14} />
                          <span>
                            Not registered at {formData.hospitalName}. Only registered hospital patients can apply.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="portal-grid-3">
                    <div className="form-group">
                      <label>Age (Years) *</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        placeholder="e.g. 35"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Email Address (Optional)</label>
                      <div className="input-with-icon">
                        <Mail size={18} />
                        <input
                          type="email"
                          placeholder="e.g. ramesh@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Residential Address (Optional)</label>
                    <div className="input-with-icon">
                      <MapPin size={18} />
                      <input
                        type="text"
                        placeholder="e.g. 123 Health Avenue, Indiranagar, Bengaluru"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Insurance Plan Selection */}
                <div className="portal-form-section">
                  <div className="section-header-row">
                    <span className="section-step-num">3</span>
                    <div>
                      <h3>Select Your Medy Insurance Plan</h3>
                      <p>Select your desired cashless insurance coverage tier.</p>
                    </div>
                  </div>

                  <div className="plans-grid">
                    {PLANS.map((plan) => {
                      const isSelected = formData.requestedPlan === plan.name;
                      return (
                        <div
                          key={plan.name}
                          className={`plan-card-select ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectPlan(plan)}
                        >
                          {plan.popular && <span className="popular-badge">Most Popular</span>}
                          <div className="plan-name-row">
                            <h4 style={{ color: plan.color }}>{plan.name} Plan</h4>
                            <div className={`radio-indicator ${isSelected ? 'checked' : ''}`}></div>
                          </div>
                          <div className="plan-amount">{plan.coverageLabel}</div>
                          <span className="plan-sub">Annual Cashless Limit</span>
                          <p className="plan-desc">{plan.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="portal-form-actions">
                  {registrationCheck && !registrationCheck.registered && (
                    <div className="submit-blocked-notice">
                      <AlertCircle size={16} />
                      <span>Registration required at {formData.hospitalName} before submitting application.</span>
                    </div>
                  )}
                  {registrationCheck?.patient?.hasMedyCard && (
                    <div className="submit-blocked-notice" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                      <CheckCircle2 size={16} />
                      <span>An active Medy Card ({registrationCheck.patient.cardId}) is already issued for you at {formData.hospitalName}.</span>
                    </div>
                  )}
                  {registrationCheck?.patient?.applicationStatus === 'Pending' && !registrationCheck?.patient?.hasMedyCard && (
                    <div className="submit-blocked-notice" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>
                      <Clock size={16} />
                      <span>Your application is already received and pending review by {formData.hospitalName}.</span>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="btn-portal-submit"
                    disabled={
                      submitting ||
                      (registrationCheck &&
                        (!registrationCheck.registered ||
                          registrationCheck.patient?.hasMedyCard ||
                          registrationCheck.patient?.applicationStatus === 'Pending'))
                    }
                  >
                    {submitting ? (
                      <>
                        <div className="spinner-white"></div>
                        <span>Submitting Application to Hospital...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        <span>Submit Application to {formData.hospitalName}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          /* Check Status Section */
          <div className="portal-form-card status-lookup-card">
            <div className="form-card-header">
              <h2>Check Medy Card Application Status</h2>
              <p>Enter your registered mobile phone number to check your card issuance status.</p>
            </div>

            <form onSubmit={handleCheckStatus} className="status-lookup-form">
              <div className="status-form-grid">
                <div className="form-group">
                  <label>Registered Phone Number *</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={statusPhone}
                      onChange={(e) => setStatusPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hospital Applied To</label>
                  <div className="input-with-icon">
                    <Building2 size={18} />
                    <select
                      value={statusHospital}
                      onChange={(e) => setStatusHospital(e.target.value)}
                    >
                      <option value="All">All Network Hospitals</option>
                      {hospitals.map((h) => (
                        <option key={h._id || h.name} value={h.name}>
                          {h.name} ({h.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary status-search-btn" disabled={checkingStatus}>
                {checkingStatus ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Check Application Status</span>
                  </>
                )}
              </button>
            </form>

            {statusError && (
              <div className="form-alert-error status-error">
                <AlertCircle size={18} />
                <span>{statusError}</span>
              </div>
            )}

            {statusResult && (
              <div className="status-result-box">
                <div className="status-result-header">
                  <div>
                    <h3>{statusResult.patient.name}</h3>
                    <span className="status-sub">
                      Applied to: <strong>{statusResult.patient.hospitalName}</strong>
                    </span>
                  </div>

                  <div className="status-badge-container">
                    {statusResult.patient.hasMedyCard ? (
                      <span className="status-chip active">
                        <CheckCircle2 size={16} /> CARD ISSUED & ACTIVE
                      </span>
                    ) : statusResult.patient.applicationStatus === 'Rejected' ? (
                      <span className="status-chip rejected">
                        <XCircle size={16} /> APPLICATION DECLINED
                      </span>
                    ) : (
                      <span className="status-chip pending">
                        <Clock size={16} /> PENDING HOSPITAL APPROVAL
                      </span>
                    )}
                  </div>
                </div>

                {statusResult.patient.hasMedyCard && statusResult.patient.cardId ? (
                  /* Issued Card Result */
                  <div className="issued-card-result">
                    <div className="card-success-banner" style={{ marginBottom: '1.25rem' }}>
                      <CheckCircle2 size={24} />
                      <div>
                        <strong>Your Medy Card has been issued and approved!</strong>
                        <p>You can use this Card ID for cashless hospitalization at network facilities.</p>
                      </div>
                    </div>

                    {/* Proper Shape Physical Medy Card */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <MedyCardPreview
                        card={{
                          cardId: statusResult.patient.cardId,
                          patientName: statusResult.patient.name,
                          hospitalName: statusResult.cardDetails?.hospitalName || statusResult.patient.hospitalName,
                          insurancePlan: statusResult.cardDetails?.insurancePlan || 'Standard',
                          coverageAmount: statusResult.cardDetails?.coverageAmount || 500000,
                          validUntil: statusResult.cardDetails?.validUntil,
                          status: 'Active',
                        }}
                        onCopy={(id) => copyToClipboard(id)}
                      />
                    </div>

                    {statusResult.cardDetails && (
                      <div className="card-summary-grid">
                        <div className="summary-item">
                          <span>Insurance Plan</span>
                          <strong>{statusResult.cardDetails.insurancePlan}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Coverage Limit</span>
                          <strong>
                            ₹{(statusResult.cardDetails.coverageAmount || 500000).toLocaleString('en-IN')}
                          </strong>
                        </div>
                        <div className="summary-item">
                          <span>Issuing Facility</span>
                          <strong>{statusResult.cardDetails.hospitalName}</strong>
                        </div>
                        <div className="summary-item">
                          <span>Valid Thru</span>
                          <strong>
                            {new Date(statusResult.cardDetails.validUntil).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                ) : statusResult.patient.applicationStatus === 'Rejected' ? (
                  /* Rejected Application */
                  <div className="rejected-result">
                    <p className="reject-reason">
                      <strong>Reason from Hospital:</strong>{' '}
                      {statusResult.patient.rejectionReason || 'Application details could not be verified.'}
                    </p>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          name: statusResult.patient.name,
                          phone: statusResult.patient.phone,
                          hospitalName: statusResult.patient.hospitalName,
                        }));
                        setActiveTab('apply');
                      }}
                    >
                      Re-apply with Corrected Information
                    </button>
                  </div>
                ) : (
                  /* Pending Application */
                  <div className="pending-result">
                    <p>
                      Your application submitted on{' '}
                      <strong>
                        {new Date(statusResult.patient.appliedAt || statusResult.patient.createdAt).toLocaleDateString(
                          'en-GB',
                          { day: '2-digit', month: 'short', year: 'numeric' }
                        )}
                      </strong>{' '}
                      is currently under review by the hospital administration at{' '}
                      <strong>{statusResult.patient.hospitalName}</strong>.
                    </p>
                    <span className="pending-hint">
                      The hospital administrator will accept your application and generate your Medy Card shortly.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientApply;


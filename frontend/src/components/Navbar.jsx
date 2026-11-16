import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Shield,
  ShieldCheck,
  Key,
  Settings,
  LogOut,
  Edit3,
  Check,
  X,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160&auto=format&fit=crop&q=80';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Hospital Partner Onboarded',
    desc: 'Apollo Speciality Hospital successfully activated on Medy network.',
    time: '25 mins ago',
    unread: true,
  },
  {
    id: 2,
    title: 'Card Regulatory Hold Enforcement',
    desc: 'Medi Card MED-APO-0010 placed on regulatory hold pending KYC update.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 3,
    title: 'Diagnostic Test Catalog Synchronized',
    desc: '12 new molecular & pathology panels updated across partner facilities.',
    time: '4 hours ago',
    unread: true,
  },
];

const Navbar = ({ collapsed, setCollapsed }) => {
  const { admin, logout, updateProfileState } = useAuth();
  const navigate = useNavigate();

  const [searchVal, setSearchVal] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('general');

  // Form State for Profile Editing
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [adminId, setAdminId] = useState('MEDY-ADM-001');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accountStatus, setAccountStatus] = useState('Active');
  const [dateJoined, setDateJoined] = useState('March 14, 2024');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  // Refs for click outside
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Sync profile form state whenever admin changes or modal opens
  useEffect(() => {
    if (admin) {
      setFullName(admin.fullName || admin.username || 'Super Administrator');
      setUsername(admin.username || 'admin');
      setAdminId(admin.adminId || 'MEDY-ADM-001');
      setEmail(admin.email || 'admin@medy.com');
      setPhone(admin.phone || '+91 98765 43210');
      setAccountStatus(admin.status || 'Active');
      setAvatar(admin.avatar || DEFAULT_AVATAR);
      if (admin.dateJoined || admin.createdAt) {
        setDateJoined(
          new Date(admin.dateJoined || admin.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        );
      }
    }
  }, [admin, isModalOpen]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openProfileModal = () => {
    setIsProfileOpen(false);
    setFeedback({ type: null, message: '' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setModalTab('general');
    setIsModalOpen(true);
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    logout();
    navigate('/login');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    // Validate email
    if (!email || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid administrative email address.' });
      return;
    }

    // Validate username
    if (!username || username.trim().length < 3) {
      setFeedback({ type: 'error', message: 'Username must be at least 3 characters long.' });
      return;
    }

    // Password validation if new password entered
    if (newPassword && newPassword.trim() !== '') {
      if (!currentPassword) {
        setFeedback({
          type: 'error',
          message: 'Current password is required to set a new password.',
        });
        return;
      }
      if (newPassword.length < 6) {
        setFeedback({
          type: 'error',
          message: 'New password must be at least 6 characters long.',
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({
          type: 'error',
          message: 'New passwords do not match. Please verify.',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${admin?.token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          avatar: avatar.trim(),
          status: accountStatus,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update admin profile');
      }

      // Update AuthContext state
      updateProfileState({
        fullName: data.fullName,
        username: data.username,
        adminId: data.adminId,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        role: 'MEDY_ADMIN',
        status: data.status,
        dateJoined: data.dateJoined,
        token: data.token || admin.token,
      });

      setFeedback({
        type: 'success',
        message: 'Super Administrator profile updated successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto close after 1.5s
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error occurred while updating profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="super-navbar">
        {/* Brand Header Section - Spans across the sidebar width */}
        <div className={`super-nav-brand-section ${collapsed ? 'collapsed' : ''}`}>
          <div className="super-nav-brand-wrap">
            <div className="super-nav-brand-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="3" width="18" height="18" rx="6" fill="rgba(255,255,255,0.22)" />
                <path
                  d="M12 7V17M7 12H17"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {!collapsed && <span className="super-nav-brand-name">Medy Admin</span>}
          </div>

          {/* Sidebar Collapse Toggle Button */}
          {setCollapsed && (
            <button
              type="button"
              className="super-nav-toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>

        {/* Main Navbar Section - Search and User Actions */}
        <div className="super-nav-content-section">
          {/* Search Input */}
          <div className="super-nav-search">
            <Search size={16} className="super-search-icon" />
            <input
              type="text"
              className="super-search-input"
              placeholder="Search hospitals, patients, medi cards, staff..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>

          {/* Actions & Profile */}
          <div className="super-nav-actions">
            {/* Single Platform Notification Option */}
            <div className="super-profile-wrapper" ref={notifRef}>
              <button
                type="button"
                className={`super-icon-btn ${isNotificationsOpen ? 'active' : ''}`}
                title="Platform Notifications"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                aria-label="Platform Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="super-badge-count">{unreadCount}</span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="super-popover-dropdown">
                  <div className="popover-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Bell size={15} style={{ color: '#0284c7' }} />
                      <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="dropdown-root-pill" style={{ marginLeft: '0.2rem' }}>
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0284c7',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '0.15rem 0.35rem',
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="popover-list">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className="popover-item"
                        style={{
                          borderLeft: item.unread ? '3px solid #0284c7' : '3px solid transparent',
                          background: item.unread ? '#f8fafc' : '#ffffff',
                        }}
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                          );
                        }}
                      >
                        <div
                          className="popover-item-title"
                          style={{
                            fontWeight: item.unread ? 700 : 500,
                            color: item.unread ? '#0f172a' : '#475569',
                          }}
                        >
                          {item.title}
                        </div>
                        <div className="popover-item-desc">{item.desc}</div>
                        <span className="popover-item-time">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Trigger Button */}
            <div className="super-profile-wrapper" ref={profileRef}>
              <button
                type="button"
                className={`super-profile-trigger ${isProfileOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                aria-label="Admin Profile Menu"
              >
                <div className="super-avatar-badge-wrap">
                  <img
                    src={admin?.avatar || DEFAULT_AVATAR}
                    alt="Admin Avatar"
                    className="super-avatar-img"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATAR;
                    }}
                  />
                  <span className="super-online-dot" title="Active Online" />
                </div>
                <div className="super-user-meta">
                  <span className="super-user-name">
                    {admin?.fullName || admin?.username || 'Super Admin'}
                  </span>
                  <span className="super-user-role">MEDY_ADMIN</span>
                </div>
                <ChevronDown size={14} className="super-profile-chevron" />
              </button>

              {/* Elevated Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="super-profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="dropdown-avatar-lg">
                      <img
                        src={admin?.avatar || DEFAULT_AVATAR}
                        alt="Super Admin"
                        onError={(e) => {
                          e.target.src = DEFAULT_AVATAR;
                        }}
                      />
                    </div>
                    <div className="dropdown-header-info">
                      <span className="dropdown-name">
                        {admin?.fullName || admin?.username || 'Super Admin'}
                      </span>
                      <span className="dropdown-email">{admin?.email || 'admin@medy.com'}</span>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span className="dropdown-root-pill">
                          <ShieldCheck size={11} /> MEDY_ADMIN
                        </span>
                        <span
                          className="dropdown-root-pill"
                          style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
                        >
                          {admin?.adminId || 'MEDY-ADM-001'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-status-strip">
                    <span>Node: Medy Central</span>
                    <strong style={{ color: '#10b981' }}>256-bit Encrypted</strong>
                  </div>

                  <ul className="dropdown-menu-list">
                    <li>
                      <button
                        type="button"
                        className="dropdown-menu-btn text-primary"
                        onClick={openProfileModal}
                      >
                        <User size={15} />
                        <span>Super Admin profile</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-menu-btn"
                        onClick={() => {
                          openProfileModal();
                          setModalTab('password');
                        }}
                      >
                        <Lock size={15} />
                        <span>Change password</span>
                      </button>
                    </li>

                    <li className="dropdown-divider" />

                    <li>
                      <button
                        type="button"
                        className="dropdown-menu-btn danger"
                        onClick={handleSignOut}
                      >
                        <LogOut size={15} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Super Admin Profile Management Modal */}
      {isModalOpen && (
        <div className="super-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="super-profile-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="super-modal-header">
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
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                    Super Admin Profile
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Central identity, root permissions & platform credentials
                  </span>
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

            {/* Modal Tabs */}
            <div className="profile-modal-tabs">
              <button
                type="button"
                className={`profile-tab-btn ${modalTab === 'general' ? 'active' : ''}`}
                onClick={() => setModalTab('general')}
              >
                <User size={15} /> General Information
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${modalTab === 'security' ? 'active' : ''}`}
                onClick={() => setModalTab('security')}
              >
                <Lock size={15} /> Password & Security
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${modalTab === 'clearance' ? 'active' : ''}`}
                onClick={() => setModalTab('clearance')}
              >
                <ShieldCheck size={15} /> Root Permissions
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="profile-modal-scrollable">
                {/* Feedback Alerts */}
                {feedback.message && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.84rem',
                      fontWeight: 500,
                      background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
                      color: feedback.type === 'success' ? '#065f46' : '#991b1b',
                      border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    }}
                  >
                    {feedback.type === 'success' ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* TAB 1: General Information */}
                {modalTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Profile Photo Display */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '1rem 1.25rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img
                          src={avatar || DEFAULT_AVATAR}
                          alt="Super Admin"
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid #0284c7',
                            display: 'block',
                          }}
                          onError={(e) => {
                            e.target.src = DEFAULT_AVATAR;
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '13px',
                            height: '13px',
                            borderRadius: '50%',
                            background: '#10b981',
                            border: '2px solid #ffffff',
                          }}
                          title="Active Online"
                        />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {fullName || 'Super Administrator'}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '5px',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              border: '1px solid #bae6fd',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            <ShieldCheck size={11} /> MEDY_ADMIN
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Super Admin's profile picture &bull; Unique ID: <strong style={{ color: '#0284c7' }}>{adminId}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    {/* 1. Full Name & Admin ID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Full Name <span style={{ color: '#64748b', fontWeight: 400 }}>(Administrator's name)</span>
                        </label>
                        <input
                          type="text"
                          required
                          className="form-control"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Administrator's name"
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Admin ID <span style={{ color: '#64748b', fontWeight: 400 }}>(Unique administrator ID)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            disabled
                            className="form-control"
                            value={adminId}
                            style={{
                              background: '#f8fafc',
                              color: '#0284c7',
                              fontWeight: 700,
                              cursor: 'not-allowed',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Email Address & Phone Number */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Email Address <span style={{ color: '#64748b', fontWeight: 400 }}>(Registered email address)</span>
                        </label>
                        <input
                          type="email"
                          required
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="admin@medy.com"
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Phone Number <span style={{ color: '#64748b', fontWeight: 400 }}>(Registered mobile number)</span>
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    {/* 3. Role & Account Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Role
                        </label>
                        <div
                          className="form-control"
                          style={{
                            background: '#e0f2fe',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            color: '#0284c7',
                            fontWeight: 700,
                            cursor: 'not-allowed',
                            border: '1px solid #bae6fd',
                          }}
                        >
                          <ShieldCheck size={16} />
                          <span>MEDY_ADMIN</span>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Account Status
                        </label>
                        <select
                          className="super-select-dropdown"
                          style={{ width: '100%' }}
                          value={accountStatus}
                          onChange={(e) => setAccountStatus(e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* 4. Date Joined */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Date Joined <span style={{ color: '#64748b', fontWeight: 400 }}>(Account creation date)</span>
                        </label>
                        <input
                          type="text"
                          disabled
                          className="form-control"
                          value={dateJoined}
                          style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Assigned Authority
                        </label>
                        <input
                          type="text"
                          disabled
                          className="form-control"
                          value="Medy Central Healthcare Network"
                          style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Security & Password */}
                {modalTab === 'security' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        color: '#475569',
                      }}
                    >
                      <strong style={{ color: '#0f172a' }}>Security Recommendation:</strong> Leave
                      the password fields empty if you do not wish to change your current password.
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        Current Password (Required for password changes)
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          className="form-control"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                            }}
                          >
                            {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#e0f2fe',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 600 }}>
                        Root Password Standards:
                      </div>
                      <ul
                        style={{
                          margin: '0.35rem 0 0 1rem',
                          padding: 0,
                          fontSize: '0.74rem',
                          color: '#0284c7',
                        }}
                      >
                        <li>Encrypted using bcrypt-10 salt rounds</li>
                        <li>Requires re-authentication on credentials change</li>
                        <li>Changes are immediately archived to the permanent audit ledger</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* TAB 3: Root Permissions & Clearance */}
                {modalTab === 'clearance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                          Assigned Security Tier: Level 4 (Root)
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Unrestricted regulatory clearance across all Medy platform subsystems
                        </div>
                      </div>
                      <span className="super-status-pill active">
                        <span className="status-dot" /> Full Clearance
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {[
                        {
                          title: 'Hospital Governance & Onboarding',
                          desc: 'Ability to onboard, verify, suspend and configure hospital tenant partitions.',
                          allowed: true,
                        },
                        {
                          title: 'Central Medi Card Regulatory Oversight',
                          desc: 'Global monitoring of cards issued by hospitals, regulatory hold enforcement, and cardholder inspection.',
                          allowed: true,
                        },
                        {
                          title: 'Central Laboratory & Diagnostic Network',
                          desc: 'Diagnostic catalog maintenance, test panel provisioning, and quality audit trails.',
                          allowed: true,
                        },
                        {
                          title: 'System & Security Key Rotation',
                          desc: 'Creation of sub-administrators, access revocations, and IP whitelisting.',
                          allowed: true,
                        },
                        {
                          title: 'Immutable Platform Audit Log Access',
                          desc: 'Read-only access to tamper-proof forensic audit trail of all platform operations.',
                          allowed: true,
                        },
                      ].map((perm, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            background: '#ffffff',
                            border: '1px solid #f1f5f9',
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: '#ecfdf5',
                              color: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginTop: '2px',
                              flexShrink: 0,
                            }}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                              {perm.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.3 }}>
                              {perm.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="super-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ minWidth: '130px' }}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

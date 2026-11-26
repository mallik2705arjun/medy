import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  FlaskConical,
  BarChart3,
  History,
  Settings,
  LogOut,
  Bell,
  ShieldCheck,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  User,
  Microscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_AVATAR = '';

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

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { admin, logout, updateProfileState } = useAuth();
  const navigate = useNavigate();

  // Notification states
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef(null);

  // Profile modal states
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
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: '' });

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Sync profile form state whenever admin changes or modal opens
  useEffect(() => {
    if (admin) {
      const sanitizedName = (admin.fullName || admin.username || 'Dr. Robert').replace(/\bMedy\b/gi, '').trim() || 'Dr. Robert';
      setFullName(sanitizedName);
      setUsername(admin.username || 'admin');
      setAdminId(admin.adminId || 'MEDY-ADM-001');
      setEmail(admin.email || 'admin@medy.com');
      setPhone(admin.phone || '+91 98765 43210');
      setAccountStatus(admin.status || 'Active');
      setAvatar(admin.avatar || '');
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

  // Close notifications popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openProfileModal = () => {
    setFeedback({ type: null, message: '' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setModalTab('general');
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: '' });

    if (!email || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Please provide a valid administrative email address.' });
      return;
    }

    if (!username || username.trim().length < 3) {
      setFeedback({ type: 'error', message: 'Username must be at least 3 characters long.' });
      return;
    }

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
          avatar: '',
          status: accountStatus,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update admin profile');
      }

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

  // Primary Platform Operational Modules
  const primaryNavItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Hospital Management', to: '/hospitals', icon: Building2 },
    { label: 'Hospital Admin', to: '/hospital-admins', icon: UserCheck },
    { label: 'Patient Management', to: '/patients', icon: Users },
    { label: 'Medy Card Management', to: '/medi-card', icon: CreditCard },
    { label: 'Lab Management', to: '/lab-tests', icon: FlaskConical },
    { label: 'Partnered Labs', to: '/partnered-labs', icon: Microscope },
    { label: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
    { label: 'Audit Logs', to: '/audit-logs', icon: History },
  ];

  return (
    <>
      <aside className={`super-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* =========================================================================
            SIDEBAR HEADER: ADMIN PROFILE, NOTIFICATION BELL & COLLAPSE TOGGLE
            ========================================================================= */}
        <div
          className="super-sidebar-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: '1rem',
            padding: collapsed ? '0.2rem 0 0.75rem 0' : '0.25rem 0.15rem 0.85rem 0.15rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            gap: '0.4rem',
            flexDirection: collapsed ? 'column' : 'row',
          }}
        >
          {/* Profile: Avatar, Dr. Name & Admin */}
          <div
            onClick={openProfileModal}
            title={`${(admin?.fullName ? admin.fullName.replace(/\bMedy\b/gi, '').trim() : 'Dr. Robert') || 'Dr. Robert'} (Admin)`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '0.65rem',
              cursor: 'pointer',
              flex: collapsed ? 'none' : 1,
              minWidth: 0,
              padding: collapsed ? '0.2rem' : '0.25rem 0.35rem',
              borderRadius: '10px',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {admin?.avatar ? (
                <img
                  src={admin.avatar}
                  alt="Admin Profile"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid rgba(255, 255, 255, 0.85)',
                    display: 'block',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1.5px solid rgba(255, 255, 255, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  <User size={18} />
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '1.5px solid #0a1128',
                  boxShadow: '0 0 4px #10b981',
                }}
              />
            </div>

            {!collapsed && (
              <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    lineHeight: 1.25,
                  }}
                >
                  {(admin?.fullName ? admin.fullName.replace(/\bMedy\b/gi, '').trim() : 'Dr. Robert') || 'Dr. Robert'}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#93c5fd',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '2px',
                  }}
                >
                  <ShieldCheck size={12} />
                  Admin
                </span>
              </div>
            )}
          </div>

          {/* Action Icons: Notification Bell & Sidebar Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
              marginTop: collapsed ? '0.4rem' : 0,
            }}
            ref={notifRef}
          >
            {/* Notification Bell Button */}
            <button
              type="button"
              className="sidebar-action-btn"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              title="Platform Notifications"
              style={{
                position: 'relative',
                background: isNotificationsOpen ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.18)',
                border: 'none',
                borderRadius: '8px',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid #0a1128',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* =========================================================================
            MAIN NAVIGATION LINKS
            ========================================================================= */}
        <div className="super-sidebar-menu">
          <ul className="super-nav-list">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="super-nav-item">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `super-nav-link ${isActive ? 'active' : ''}`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="nav-link-left">
                      <Icon size={18} className="super-nav-icon" />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Lower Settings Section */}
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <ul className="super-nav-list">
              <li className="super-nav-item">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `super-nav-link ${isActive ? 'active' : ''}`
                  }
                  title={collapsed ? 'Settings' : undefined}
                >
                  <div className="nav-link-left">
                    <Settings size={18} className="super-nav-icon" />
                    {!collapsed && <span>Settings</span>}
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Sidebar Footer with Logout */}
        <div className="super-sidebar-footer">
          <button
            type="button"
            className="super-nav-link footer-link logout-btn"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
          >
            <div className="nav-link-left">
              <LogOut size={18} className="super-nav-icon" />
              {!collapsed && <span>Logout</span>}
            </div>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          NOTIFICATIONS POPOVER (ANCHORED NEXT TO SIDEBAR)
          ========================================================================= */}
      {isNotificationsOpen && (
        <div
          style={{
            position: 'fixed',
            left: collapsed ? '86px' : '260px',
            top: '16px',
            width: '330px',
            maxWidth: 'calc(100vw - 300px)',
            background: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 6px 12px -2px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            zIndex: 1100,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #f1f5f9',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Bell size={15} style={{ color: '#0284c7' }} />
              <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    padding: '0.12rem 0.45rem',
                    borderRadius: '10px',
                  }}
                >
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
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #f8fafc',
                  borderLeft: item.unread ? '3px solid #0284c7' : '3px solid transparent',
                  background: item.unread ? '#f8fafc' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                  );
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: item.unread ? 700 : 500,
                    color: item.unread ? '#0f172a' : '#475569',
                    marginBottom: '0.2rem',
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35, marginBottom: '0.3rem' }}>
                  {item.desc}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMIN PROFILE MODAL (EDIT PROFILE & SECURITY)
          ========================================================================= */}
      {isModalOpen && (
        <div className="super-modal-backdrop">
          <div className="super-modal-card" style={{ maxWidth: '560px' }}>
            <div className="super-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#0284c7' }} />
                <h3>Super Admin Profile & Access</h3>
              </div>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #e2e8f0',
                padding: '0 1.25rem',
                gap: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setModalTab('general')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: modalTab === 'general' ? '2px solid #0284c7' : '2px solid transparent',
                  padding: '0.75rem 0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: modalTab === 'general' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                General Information
              </button>
              <button
                type="button"
                onClick={() => setModalTab('security')}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: modalTab === 'security' ? '2px solid #0284c7' : '2px solid transparent',
                  padding: '0.75rem 0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: modalTab === 'security' ? '#0284c7' : '#64748b',
                  cursor: 'pointer',
                }}
              >
                Security & Password
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div
                className="super-modal-body"
                style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1.25rem' }}
              >
                {/* Feedback message */}
                {feedback.message && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      background: feedback.type === 'error' ? '#fef2f2' : '#e0f2fe',
                      color: feedback.type === 'error' ? '#ef4444' : '#0284c7',
                      border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bae6fd'}`,
                    }}
                  >
                    {feedback.type === 'error' ? (
                      <AlertCircle size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {modalTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                    {/* Profile Header Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.85rem 1rem',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          background: '#e0f2fe',
                          border: '2px solid #bae6fd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0284c7',
                          flexShrink: 0,
                        }}
                      >
                        <User size={26} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                            {fullName || 'Super Administrator'}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              background: '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                            }}
                          >
                            <ShieldCheck size={11} /> MEDY_ADMIN
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Administrator ID: <strong style={{ color: '#0284c7' }}>{adminId}</strong> &bull; Status: <strong style={{ color: '#16a34a' }}>{accountStatus}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem' }}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Username *
                        </label>
                        <input
                          type="text"
                          required
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem' }}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem' }}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem' }}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Admin Identification ID
                        </label>
                        <input
                          type="text"
                          disabled
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem', background: '#f8fafc', color: '#64748b' }}
                          value={adminId}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Date Joined / Registered
                        </label>
                        <input
                          type="text"
                          disabled
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem', background: '#f8fafc', color: '#64748b' }}
                          value={dateJoined}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'security' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                        Change Password
                      </span>
                      <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                        To update the Super Admin password, enter your current password followed by a new secure password.
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                        Current Administrative Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 2rem 0.4rem 0.65rem' }}
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          style={{ position: 'absolute', right: '8px', top: '9px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            className="super-search-input"
                            style={{ width: '100%', height: '36px', padding: '0.4rem 2rem 0.4rem 0.65rem' }}
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            style={{ position: 'absolute', right: '8px', top: '9px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                          >
                            {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="super-search-input"
                          style={{ width: '100%', height: '36px', padding: '0.4rem 0.65rem' }}
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="super-modal-footer">
                <button
                  type="button"
                  className="super-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="super-btn-primary"
                  style={{ opacity: saving ? 0.7 : 1 }}
                >
                  <Check size={15} />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

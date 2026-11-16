
import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Bell,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Save,
  Building2,
  Users,
  CreditCard,
  FlaskConical,
  Calendar,
  Languages,
  Clock,
} from 'lucide-react';

const DEFAULT_GENERAL_SETTINGS = {
  platformName: 'Medy Healthcare Platform',
  supportEmail: 'support@medy.health',
  supportPhone: '+91 1800 200 4567',
  officeAddress: 'Building 4A, Cyber City, Gurugram, India',
};

const DEFAULT_NOTIFICATION_SETTINGS = {
  hospitalAlerts: true,
  patientAlerts: true,
  cardAlerts: true,
  labAlerts: true,
  appointmentAlerts: true,
};

const DEFAULT_PREFERENCES = {
  language: 'en-US',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  // 1. General Settings State
  const [generalSettings, setGeneralSettings] = useState(() => {
    const saved = localStorage.getItem('medy_general_settings');
    if (saved) {
      try {
        return { ...DEFAULT_GENERAL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved general settings:', e);
      }
    }
    return DEFAULT_GENERAL_SETTINGS;
  });

  // 2. Notification Settings State
  const [notifSettings, setNotifSettings] = useState(() => {
    const saved = localStorage.getItem('medy_notification_settings');
    if (saved) {
      try {
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved notification settings:', e);
      }
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  // 3. Platform Preferences State
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('medy_platform_preferences');
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved platform preferences:', e);
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [savedSuccess, setSavedSuccess] = useState('');

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    localStorage.setItem('medy_general_settings', JSON.stringify(generalSettings));
    setSavedSuccess('General Settings saved successfully!');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    localStorage.setItem('medy_notification_settings', JSON.stringify(notifSettings));
    setSavedSuccess('Notification Settings saved successfully!');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('medy_platform_preferences', JSON.stringify(preferences));
    setSavedSuccess('Platform Preferences saved successfully!');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  const toggleNotif = (key) => {
    setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems = [
    {
      key: 'hospitalAlerts',
      title: 'Hospital Alerts',
      desc: 'Notifications for hospital registrations, activations, and facility updates',
      icon: Building2,
      enabled: notifSettings.hospitalAlerts,
    },
    {
      key: 'patientAlerts',
      title: 'Patient Alerts',
      desc: 'Notifications for patient admissions, registration updates, and emergency records',
      icon: Users,
      enabled: notifSettings.patientAlerts,
    },
    {
      key: 'cardAlerts',
      title: 'Card Alerts',
      desc: 'Notifications for Medy Card issuances, regulatory holds, and status updates',
      icon: CreditCard,
      enabled: notifSettings.cardAlerts,
    },
    {
      key: 'labAlerts',
      title: 'Lab Alerts',
      desc: 'Notifications for test bookings, sample arrivals, and completed diagnostics',
      icon: FlaskConical,
      enabled: notifSettings.labAlerts,
    },
    {
      key: 'appointmentAlerts',
      title: 'Appointment Alerts',
      desc: 'Notifications for doctor appointments, bookings, cancellations, and schedules',
      icon: Calendar,
      enabled: notifSettings.appointmentAlerts,
    },
  ];

  return (
    <div className="super-dashboard">
      {/* Header */}
      <div className="super-dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-title-icon">
            <SettingsIcon size={22} />
          </div>
          <div>
            <h1 className="super-page-title">Platform Settings</h1>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: '#64748b' }}>
              Configure platform identity, notification alerts, and platform preferences
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="settings-tabs-bar" style={{ maxWidth: '850px' }}>
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          <Sliders size={16} />
          <span>General Settings</span>
        </button>
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} />
          <span>Notification Settings</span>
        </button>
        <button
          type="button"
          className={`settings-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <Languages size={16} />
          <span>Platform Preferences</span>
        </button>
      </div>

      {/* Success Notification */}
      {savedSuccess && (
        <div
          style={{
            maxWidth: '850px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* 1. General Settings Form */}
      {activeTab === 'general' && (
        <div className="super-panel-card" style={{ padding: '1.75rem', maxWidth: '850px' }}>
          <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Medy Platform Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.45rem',
                }}
              >
                Medy Platform Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="super-search-input"
                  style={{ width: '100%', height: '42px', padding: '0.5rem 0.75rem 0.5rem 2.25rem' }}
                  value={generalSettings.platformName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, platformName: e.target.value })}
                  placeholder="Medy Healthcare Platform"
                  required
                />
                <Globe
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8' }}
                />
              </div>
            </div>

            {/* Logo */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.45rem',
                }}
              >
                Logo
              </label>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #eaeff5',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    background: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" fill="rgba(255,255,255,0.22)" />
                    <path
                      d="M12 7V17M7 12H17"
                      stroke="white"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Medy
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Official Platform Healthcare Badge
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.45rem',
                }}
              >
                Contact Details
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {/* Email */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#64748b',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Contact Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="super-search-input"
                      style={{ width: '100%', height: '42px', padding: '0.5rem 0.75rem 0.5rem 2.25rem' }}
                      value={generalSettings.supportEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                      placeholder="support@medy.health"
                      required
                    />
                    <Mail
                      size={16}
                      style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8' }}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#64748b',
                      marginBottom: '0.35rem',
                    }}
                  >
                    Contact Phone
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="super-search-input"
                      style={{ width: '100%', height: '42px', padding: '0.5rem 0.75rem 0.5rem 2.25rem' }}
                      value={generalSettings.supportPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, supportPhone: e.target.value })}
                      placeholder="+91 1800 200 4567"
                      required
                    />
                    <Phone
                      size={16}
                      style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8' }}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#64748b',
                    marginBottom: '0.35rem',
                  }}
                >
                  Contact Address
                </label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="super-search-input"
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                      height: 'auto',
                      resize: 'vertical',
                    }}
                    value={generalSettings.officeAddress}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, officeAddress: e.target.value })}
                    placeholder="Corporate Office Address"
                  />
                  <MapPin
                    size={16}
                    style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8' }}
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #eaeff5', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="super-btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
              >
                <Save size={16} />
                <span>Save General Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Notification Settings Form */}
      {activeTab === 'notifications' && (
        <div className="super-panel-card" style={{ padding: '1.75rem', maxWidth: '850px' }}>
          <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Notification Alerts
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Enable or disable operational alert broadcasts across system modules
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {notificationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem 1.25rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: item.enabled ? '#e0f2fe' : '#f1f5f9',
                          color: item.enabled ? '#0284c7' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>

                    {/* On / Off Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: item.enabled ? '#0284c7' : '#94a3b8',
                          minWidth: '28px',
                          textAlign: 'right',
                        }}
                      >
                        {item.enabled ? 'ON' : 'OFF'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.enabled}
                        onClick={() => toggleNotif(item.key)}
                        style={{
                          width: '46px',
                          height: '26px',
                          borderRadius: '13px',
                          background: item.enabled ? '#0284c7' : '#cbd5e1',
                          position: 'relative',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            position: 'absolute',
                            top: '3px',
                            left: item.enabled ? '23px' : '3px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #eaeff5', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="super-btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
              >
                <Save size={16} />
                <span>Save Notification Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Platform Preferences Form */}
      {activeTab === 'preferences' && (
        <div className="super-panel-card" style={{ padding: '1.75rem', maxWidth: '850px' }}>
          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Platform Preferences
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Configure regional language, operational timezone, and date format
              </p>
            </div>

            {/* Language */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.45rem',
                }}
              >
                Language
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="super-search-input"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                  <option value="es-ES">Spanish (Español)</option>
                  <option value="fr-FR">French (Français)</option>
                  <option value="ar-AE">Arabic (العربية)</option>
                </select>
                <Languages
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8', pointerEvents: 'none' }}
                />
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.45rem',
                }}
              >
                Timezone
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="super-search-input"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC +05:30)</option>
                  <option value="UTC">Coordinated Universal Time (UTC +00:00)</option>
                  <option value="America/New_York">America/New York (EST/EDT, UTC -05:00)</option>
                  <option value="Europe/London">Europe/London (GMT/BST, UTC +01:00)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC +04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT, UTC +08:00)</option>
                </select>
                <Clock
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8', pointerEvents: 'none' }}
                />
              </div>
            </div>

            {/* Date Format */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '0.45rem',
                }}
              >
                Date Format
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="super-search-input"
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    background: '#ffffff',
                    cursor: 'pointer',
                  }}
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 05/11/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 11/05/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-11-05)</option>
                  <option value="DD MMM YYYY">DD MMM YYYY (e.g. 05 Nov 2026)</option>
                </select>
                <Calendar
                  size={16}
                  style={{ position: 'absolute', left: '0.75rem', top: '13px', color: '#94a3b8', pointerEvents: 'none' }}
                />
              </div>
            </div>

            {/* Save Button */}
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #eaeff5', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="super-btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}
              >
                <Save size={16} />
                <span>Save Platform Preferences</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Settings;

import React, { useState } from 'react';
import { Copy, Check, Building2 } from 'lucide-react';

const PRESET_COLORS = [
  {
    id: 'blue',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #38bdf8 100%)',
    accent: '#93c5fd',
  },
  {
    id: 'emerald',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #10b981 100%)',
    accent: '#a7f3d0',
  },
  {
    id: 'violet',
    gradient: 'linear-gradient(135deg, #3b0764 0%, #6366f1 60%, #8b5cf6 100%)',
    accent: '#c4b5fd',
  },
  {
    id: 'amber',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 60%, #f59e0b 100%)',
    accent: '#fde68a',
  },
  {
    id: 'slate',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #334155 60%, #475569 100%)',
    accent: '#cbd5e1',
  },
];

export const getHospitalColorTheme = (hospitalName = '') => {
  let hash = 0;
  for (let i = 0; i < hospitalName.length; i++) {
    hash = hospitalName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PRESET_COLORS.length;
  return PRESET_COLORS[index];
};

const MedyCardPreview = ({
  card = {},
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const cardId = card.cardId || card.patient?.cardId || 'MED-2026-0000';
  const patientName = card.patientName || card.name || card.patient?.name || 'Cardholder Patient';
  const hospitalName = card.hospitalName || card.patient?.hospitalName || card.hospital?.name || 'Network Hospital';
  const insurancePlan = card.insurancePlan || card.plan || 'Standard';
  const coverageAmount = card.coverageAmount || 500000;
  const status = card.status || (card.isBlocked ? 'Blocked' : 'Active');
  const validUntil = card.validUntil || card.expiryDate;

  const formatDate = (d) => {
    if (!d) return '12/30';
    try {
      const date = new Date(d);
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = String(date.getFullYear()).slice(-2);
      return `${m}/${y}`;
    } catch {
      return '12/30';
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(cardId);
    } else if (navigator?.clipboard) {
      navigator.clipboard.writeText(cardId);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const theme = getHospitalColorTheme(hospitalName);
  const isBlocked = status === 'Blocked';

  return (
    <div
      className={`real-medy-card ${isBlocked ? 'blocked' : 'active'}`}
      style={{
        maxWidth: '430px',
        width: '100%',
        aspectRatio: '85.6 / 53.98',
        minHeight: '260px',
        borderRadius: '16px',
        margin: '0 auto',
        padding: '1.35rem 1.6rem',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.45), 0 8px 18px -4px rgba(15, 23, 42, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        background: isBlocked
          ? 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 60%, #991b1b 100%)'
          : theme.gradient,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Glossy light reflection sheen overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '52%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 75%, rgba(255, 255, 255, 0) 100%)',
          borderRadius: '16px 16px 120px 0',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Decorative Radial Background Accent */}
      <div
        style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Header: Logo & Facility Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#38bdf8',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            ✚
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1 }}>MEDY</div>
            <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.12em', opacity: 0.82, textTransform: 'uppercase' }}>
              Health Card
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '0.22rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#ffffff',
            maxWidth: '200px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
          title={hospitalName}
        >
          <Building2 size={12} style={{ opacity: 0.85 }} />
          <span>{hospitalName}</span>
        </div>
      </div>

      {/* Chip & Tier Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2, margin: '0.35rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Authentic EMV Gold Smart Chip */}
          <div
            style={{
              width: '42px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #fde68a 0%, #d97706 50%, #f59e0b 100%)',
              border: '1px solid #b45309',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 2px 4px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(146, 64, 14, 0.55)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(146, 64, 14, 0.55)' }} />
            <div style={{ position: 'absolute', left: '22%', right: '22%', top: '22%', bottom: '22%', border: '1px solid rgba(146, 64, 14, 0.45)', borderRadius: '3px' }} />
          </div>

          {/* Contactless Wave Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(90deg)' }}>
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" fill="rgba(255,255,255,0.75)" />
          </svg>

          {/* Plan Tier Badge */}
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              padding: '0.2rem 0.55rem',
              borderRadius: '5px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {insurancePlan} Tier
          </span>
        </div>

        {/* Status Indicator */}
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            letterSpacing: '0.06em',
            background: isBlocked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)',
            color: isBlocked ? '#fca5a5' : '#6ee7b7',
            border: `1px solid ${isBlocked ? '#f87171' : '#34d399'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isBlocked ? '#f87171' : '#34d399' }} />
          {status.toUpperCase()}
        </span>
      </div>

      {/* Card ID Monospace Number with Copy Action */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.35rem 0' }}>
        <div
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: '1.35rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.6)',
            color: '#ffffff',
          }}
        >
          {cardId}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '6px',
            color: copied ? '#86efac' : '#ffffff',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Copy Card ID"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {/* Footer Info: Cardholder, Limit, Expiry */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          paddingTop: '0.65rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div style={{ flex: 1.2, minWidth: 0, paddingRight: '0.5rem' }}>
          <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75, fontWeight: 700 }}>
            Cardholder
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={patientName}
          >
            {patientName}
          </div>
        </div>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75, fontWeight: 700 }}>
            Coverage Limit
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            ₹{Number(coverageAmount).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ flex: 0.8, textAlign: 'right' }}>
          <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.75, fontWeight: 700 }}>
            Valid Thru
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'monospace', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {formatDate(validUntil)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedyCardPreview;

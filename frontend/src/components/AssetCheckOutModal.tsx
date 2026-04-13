import { useState, useEffect } from 'react';
import { X, LogOut } from 'lucide-react';
import { colors, spacing, radius } from '../theme';
import type { Asset } from '../types/asset';

interface AssetCheckOutModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onConfirm: (assetId: number, assignedTo: string, notes: string) => void;
}

const DUMMY_USERS = [
  'Maria Chen',
  'Lebron Jeymz',
  'Stephen Carry',
  'Ronald MacDonald',
  'Tyler Brooks',
  'Priya Nair',
  'Sam Okafor',
  'Alex Johnson',
  'Jamie Lee',
  'Chris Park',
];

const labelStyle: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: colors.blueGrayMd,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  marginBottom: '0.2rem',
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4375rem 0.625rem',
  borderRadius: radius.md,
  border: '1.5px solid #d1d5db',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.8125rem',
  color: colors.textPrimary,
  backgroundColor: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

export default function AssetCheckOutModal({
  isOpen,
  asset,
  onClose,
  onConfirm,
}: AssetCheckOutModalProps) {
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssignedTo('');
      setNotes('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!assignedTo) return;
    onConfirm(asset.id, assignedTo, notes.trim());
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3,12,35,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: radius.xl,
          width: '26rem',
          position: 'relative',
          boxShadow: '0 1.5rem 4rem rgba(3,12,35,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Coloured header bar */}
        <div
          style={{
            backgroundColor: '#22c55e',
            padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: spacing.md,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: radius.full,
                backgroundColor: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogOut size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Check Out Asset
              </h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', margin: `0.2rem 0 0` }}>
                {asset.asset_name} · {asset.asset_tag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '1.75rem', height: '1.75rem', borderRadius: radius.full,
              backgroundColor: 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', padding: 0, flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: spacing.xl, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

          {/* Assign to */}
          <div>
            <label style={labelStyle}>Assign To *</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              onFocus={() => setFocused('user')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle,
                borderColor: submitted && !assignedTo ? '#ef4444' : focused === 'user' ? colors.primary : '#d1d5db',
                appearance: 'none',
                cursor: 'pointer',
                backgroundColor: assignedTo ? '#ffffff' : '#fafafa',
                color: assignedTo ? colors.textPrimary : '#9ca3af',
              }}
            >
              <option value="">Select a user…</option>
              {DUMMY_USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            {submitted && !assignedTo && (
              <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.6875rem', color: '#ef4444', marginTop: '0.15rem', display: 'block' }}>
                Please select a user
              </span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this checkout…"
              rows={3}
              onFocus={() => setFocused('notes')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.5,
                borderColor: focused === 'notes' ? colors.primary : '#d1d5db',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: spacing.md,
            padding: `0 ${spacing.xl} ${spacing.xl}`,
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: '1.5px solid #d1d5db',
              backgroundColor: '#ffffff',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.textPrimary,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: '#22c55e',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}

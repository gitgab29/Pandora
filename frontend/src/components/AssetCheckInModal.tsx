import { useState, useEffect } from 'react';
import { X, LogIn } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Asset } from '../types/asset';

interface AssetCheckInModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onConfirm: (assetId: string, notes: string) => void;
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: fontSize.micro,
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
  border: `1.5px solid ${colors.border}`,
  fontFamily: "'Archivo', sans-serif",
  fontSize: fontSize.sm,
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

export default function AssetCheckInModal({
  isOpen,
  asset,
  onClose,
  onConfirm,
}: AssetCheckInModalProps) {
  const [notes, setNotes] = useState('');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (isOpen) setNotes('');
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleConfirm = () => {
    onConfirm(asset.id, notes.trim());
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          width: '26rem',
          position: 'relative',
          boxShadow: shadows.modal,
          overflow: 'hidden',
        }}
      >
        {/* Coloured header bar */}
        <div
          style={{
            backgroundColor: colors.orangeAccent,
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
              <LogIn size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1rem', fontWeight: 700, color: colors.white, margin: 0 }}>
                Check In Asset
              </h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: 'rgba(255,255,255,0.85)', margin: `0.2rem 0 0` }}>
                {asset.asset_tag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '1.75rem', height: '1.75rem', borderRadius: radius.full,
              backgroundColor: 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.white, padding: 0, flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: spacing.xl, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

          {/* Current holder info */}
          {asset.assigned_to && (
            <div
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: radius.md,
                backgroundColor: 'rgba(252,156,45,0.08)',
                border: '1px solid rgba(252,156,45,0.2)',
              }}
            >
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.textPrimary, margin: 0 }}>
                Currently assigned to <strong>{asset.assigned_to}</strong>. Checking in will unassign and mark the asset as Available.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this check-in…"
              rows={3}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.5,
                borderColor: focused ? colors.primary : colors.border,
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
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.bgSurface,
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
              backgroundColor: colors.orangeAccent,
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.white,
              cursor: 'pointer',
            }}
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
}

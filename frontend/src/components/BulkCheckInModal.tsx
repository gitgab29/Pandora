import { useState } from 'react';
import { LogIn, X } from 'lucide-react';
import { colors, spacing, radius } from '../theme';

interface Props {
  isOpen: boolean;
  count: number;
  onConfirm: (notes: string) => void;
  onClose: () => void;
}

export default function BulkCheckInModal({ isOpen, count, onConfirm, onClose }: Props) {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(3,12,35,0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          border: '1px solid rgba(70,98,145,0.15)',
          boxShadow: '0 8px 40px rgba(3,12,35,0.18)',
          width: '100%', maxWidth: '26rem',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.xl}`,
            borderBottom: '1px solid rgba(70,98,145,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <LogIn size={16} color={colors.success} />
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary }}>
              Check In {count} Asset{count !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '1.625rem', height: '1.625rem', borderRadius: radius.sm, border: 'none',
              backgroundColor: 'transparent', color: colors.blueGrayMd,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: spacing.xl }}>
          <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', color: colors.blueGrayMd, margin: `0 0 ${spacing.lg}` }}>
            This will mark {count} selected asset{count !== 1 ? 's' : ''} as available and clear their holders.
          </p>
          <label
            style={{
              display: 'block', fontFamily: "'Archivo', sans-serif",
              fontSize: '0.75rem', fontWeight: 600, color: colors.blueGrayMd,
              marginBottom: spacing.xs,
            }}
          >
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Return reason, condition, etc."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: radius.md,
              border: '1px solid rgba(70,98,145,0.2)',
              backgroundColor: colors.bgSurface,
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem',
              color: colors.textPrimary, resize: 'vertical', outline: 'none',
            }}
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', gap: spacing.sm,
            padding: `${spacing.md} ${spacing.xl}`,
            borderTop: '1px solid rgba(70,98,145,0.1)',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: `0.4rem ${spacing.lg}`, borderRadius: radius.md,
              border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent',
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600,
              color: colors.blueGrayMd, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: `0.4rem ${spacing.lg}`, borderRadius: radius.md, border: 'none',
              backgroundColor: colors.success,
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600,
              color: colors.white, cursor: 'pointer',
            }}
          >
            Check In {count}
          </button>
        </div>
      </div>
    </div>
  );
}

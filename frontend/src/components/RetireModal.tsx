import { useState } from 'react';
import { X, Archive } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

interface RetireModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
}

export default function RetireModal({ isOpen, itemName, itemType, onClose, onConfirm }: RetireModalProps) {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          padding: `${spacing.xl3} ${spacing.xl} ${spacing.xl}`,
          width: '22rem',
          position: 'relative',
          textAlign: 'center',
          boxShadow: shadows.modal,
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: spacing.md,
            right: spacing.md,
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: radius.full,
            backgroundColor: colors.closeBtn,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.white,
            padding: 0,
          }}
        >
          <X size={14} />
        </button>

        <div
          style={{
            width: '3.75rem',
            height: '3.75rem',
            borderRadius: radius.full,
            backgroundColor: 'rgba(252,156,45,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing.lg}`,
          }}
        >
          <Archive size={22} color={colors.orangeAccent} />
        </div>

        <h3
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: fontSize.h6,
            fontWeight: 700,
            color: colors.textPrimary,
            margin: `0 0 ${spacing.sm}`,
          }}
        >
          Retire {itemType}
        </h3>

        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.sm,
            color: colors.blueGrayMd,
            margin: `0 0 ${spacing.lg}`,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: colors.textPrimary }}>{itemName}</strong> will be moved to
          the Archive as <strong style={{ color: colors.orangeAccent }}>Retired</strong>.
        </p>

        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Reason for retirement (optional)"
          rows={3}
          style={{
            width: '100%',
            padding: '0.4375rem 0.625rem',
            borderRadius: radius.md,
            border: `1.5px solid ${colors.border}`,
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.sm,
            color: colors.textPrimary,
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
            marginBottom: spacing.lg,
          }}
        />

        <div style={{ display: 'flex', gap: spacing.md }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.bgSurface,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.md,
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
              fontSize: fontSize.md,
              fontWeight: 600,
              color: colors.white,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            Retire
          </button>
        </div>
      </div>
    </div>
  );
}

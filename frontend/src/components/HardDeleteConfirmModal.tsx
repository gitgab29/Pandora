import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

interface HardDeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function HardDeleteConfirmModal({
  isOpen,
  itemName,
  itemType,
  onClose,
  onConfirm,
}: HardDeleteConfirmModalProps) {
  const [typed, setTyped] = useState('');

  if (!isOpen) return null;

  const canConfirm = typed === itemName;

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setTyped('');
    onConfirm();
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
        zIndex: 1000,
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
            backgroundColor: colors.error,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing.lg}`,
          }}
        >
          <Trash2 size={22} color={colors.white} />
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
          Delete Permanently
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
          This <strong style={{ color: colors.error }}>cannot be undone</strong>. Type{' '}
          <strong style={{ color: colors.textPrimary }}>{itemName}</strong> to permanently
          delete this {itemType.toLowerCase()}.
        </p>

        <input
          type="text"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder={`Type "${itemName}"`}
          autoFocus
          style={{
            width: '100%',
            padding: '0.4375rem 0.625rem',
            borderRadius: radius.md,
            border: `1.5px solid ${typed.length > 0 && !canConfirm ? colors.error : colors.border}`,
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.sm,
            color: colors.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: spacing.lg,
            transition: 'border-color 0.15s',
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
            disabled={!canConfirm}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: canConfirm ? colors.error : colors.bgDisabled,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.md,
              fontWeight: 600,
              color: canConfirm ? colors.white : colors.textDisabled,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}

import { X, RotateCcw } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

interface RestoreConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  itemType: string;
  destination: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function RestoreConfirmModal({
  isOpen,
  itemName,
  itemType,
  destination,
  onClose,
  onConfirm,
}: RestoreConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
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
          padding: `${spacing.xl3} ${spacing.xl} ${spacing.xl}`,
          width: '22rem',
          position: 'relative',
          textAlign: 'center',
          boxShadow: shadows.modal,
        }}
      >
        <button
          onClick={onClose}
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
            backgroundColor: 'rgba(34,197,94,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing.lg}`,
          }}
        >
          <RotateCcw size={22} color={colors.success} />
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
          Restore {itemType}
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
          <strong style={{ color: colors.textPrimary }}>{itemName}</strong> will be restored
          and will reappear in <strong style={{ color: colors.textPrimary }}>{destination}</strong>.
        </p>

        <div style={{ display: 'flex', gap: spacing.md }}>
          <button
            onClick={onClose}
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
              backgroundColor: colors.success,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.md,
              fontWeight: 600,
              color: colors.white,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}

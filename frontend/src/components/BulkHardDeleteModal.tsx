import { X, Trash2 } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

interface Props {
  isOpen: boolean;
  count: number;
  itemType: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BulkHardDeleteModal({ isOpen, count, itemType, onClose, onConfirm }: Props) {
  if (!isOpen) return null;

  const label = count === 1 ? itemType : `${itemType}s`;

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
          Delete {count} {label} Permanently
        </h3>

        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: fontSize.sm,
            color: colors.blueGrayMd,
            margin: `0 0 ${spacing.xl}`,
            lineHeight: 1.5,
          }}
        >
          This <strong style={{ color: colors.error }}>cannot be undone</strong>.{' '}
          {count} {label.toLowerCase()} will be permanently removed from the system.
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
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: colors.error,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.md,
              fontWeight: 600,
              color: colors.white,
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
          >
            Delete {count} {label}
          </button>
        </div>
      </div>
    </div>
  );
}

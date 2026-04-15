import { X } from 'lucide-react';
import { colors, spacing, radius, shadows } from '../theme';

interface FeatureNotAvailableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeatureNotAvailableModal({ isOpen, onClose }: FeatureNotAvailableModalProps) {
  if (!isOpen) return null;

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
          width: '20rem',
          position: 'relative',
          textAlign: 'center',
          boxShadow: shadows.modal,
        }}
      >
        {/* Close button */}
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

        {/* Blue circle with ! */}
        <div
          style={{
            width: '3.75rem',
            height: '3.75rem',
            borderRadius: radius.full,
            backgroundColor: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing.xl}`,
          }}
        >
          <span
            style={{
              color: colors.white,
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            !
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: `0 0 ${spacing.xl}`,
          }}
        >
          Feature Not Available
        </h3>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: spacing.md }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: '1.5px solid #d1d5db',
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
            onClick={onClose}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: colors.primary,
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.white,
              cursor: 'pointer',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { colors } from '../theme';

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
        backgroundColor: 'rgba(3, 12, 35, 0.45)',
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
          borderRadius: '16px',
          padding: '36px 28px 28px',
          width: '320px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 24px 64px rgba(3, 12, 35, 0.18)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#374151',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            padding: 0,
          }}
        >
          <X size={14} />
        </button>

        {/* Blue circle with ! */}
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: '28px',
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
            fontSize: '17px',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: '0 0 24px',
          }}
        >
          Feature Not Available
        </h3>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '50px',
              border: '1.5px solid #d1d5db',
              backgroundColor: '#ffffff',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '14px',
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
              padding: '10px 16px',
              borderRadius: '50px',
              border: 'none',
              backgroundColor: colors.primary,
              fontFamily: "'Archivo', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              color: '#ffffff',
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

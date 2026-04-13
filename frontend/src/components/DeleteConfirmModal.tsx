import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { colors, spacing, radius } from '../theme';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  /** Display name of the item being deleted — user must type this to confirm */
  itemName: string;
  /** e.g. "Asset" | "Inventory Item" — shown in the title */
  itemType: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemName,
  itemType,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
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
          padding: `${spacing.xl3} ${spacing.xl} ${spacing.xl}`,
          width: '22rem',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 1.5rem 4rem rgba(3,12,35,0.18)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: spacing.md,
            right: spacing.md,
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: radius.full,
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

        {/* Red icon circle */}
        <div
          style={{
            width: '3.75rem',
            height: '3.75rem',
            borderRadius: radius.full,
            backgroundColor: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing.lg}`,
          }}
        >
          <Trash2 size={22} color="#ffffff" />
        </div>

        <h3
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: `0 0 ${spacing.sm}`,
          }}
        >
          Delete {itemType}
        </h3>

        <p
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '0.8125rem',
            color: colors.blueGrayMd,
            margin: `0 0 ${spacing.lg}`,
            lineHeight: 1.5,
          }}
        >
          This action is permanent and cannot be undone. Type{' '}
          <strong style={{ color: colors.textPrimary }}>{itemName}</strong> to confirm.
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
            border: `1.5px solid ${typed.length > 0 && !canConfirm ? '#ef4444' : '#d1d5db'}`,
            fontFamily: "'Archivo', sans-serif",
            fontSize: '0.8125rem',
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
            disabled={!canConfirm}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: canConfirm ? '#ef4444' : '#f3f4f6',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: canConfirm ? '#ffffff' : '#9ca3af',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

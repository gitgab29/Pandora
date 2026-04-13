import { useState, useEffect } from 'react';
import { X, PackagePlus } from 'lucide-react';
import { colors, spacing, radius } from '../theme';
import type { StoreroomInventory } from '../types/inventory';

interface InventoryCheckInModalProps {
  isOpen: boolean;
  item: StoreroomInventory | null;
  onClose: () => void;
  onConfirm: (itemId: number, quantity: number, notes: string) => void;
}

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

export default function InventoryCheckInModal({
  isOpen,
  item,
  onClose,
  onConfirm,
}: InventoryCheckInModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity('1');
      setNotes('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const qty = parseInt(quantity) || 0;
  const qtyError = submitted && qty < 1;

  const handleConfirm = () => {
    setSubmitted(true);
    if (qty < 1) return;
    onConfirm(item.id, qty, notes.trim());
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
              <PackagePlus size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Check In Stock
              </h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', margin: `0.2rem 0 0` }}>
                {item.item_name}
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

          {/* Current stock info */}
          <div
            style={{
              display: 'flex',
              gap: spacing.lg,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: radius.md,
              backgroundColor: '#f8fafc',
              border: '1px solid rgba(70,98,145,0.1)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.6875rem', color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
                Current Stock
              </p>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                {item.quantity_available}
              </p>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(70,98,145,0.12)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.6875rem', color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
                After Check-In
              </p>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                {item.quantity_available + (qty > 0 ? qty : 0)}
              </p>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(70,98,145,0.12)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.6875rem', color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
                Min Qty
              </p>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                {item.min_quantity}
              </p>
            </div>
          </div>

          {/* Quantity input */}
          <div>
            <label style={labelStyle}>Quantity to Add *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              onFocus={() => setFocused('qty')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle,
                borderColor: qtyError ? '#ef4444' : focused === 'qty' ? colors.primary : '#d1d5db',
              }}
            />
            {qtyError && (
              <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.6875rem', color: '#ef4444', marginTop: '0.15rem', display: 'block' }}>
                Enter a quantity of at least 1
              </span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this stock addition…"
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
            Check In
          </button>
        </div>
      </div>
    </div>
  );
}

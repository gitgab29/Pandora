import { useState, useEffect } from 'react';
import { X, PackageMinus } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Accessory } from '../types/inventory';
import type { Person } from '../types/people';

interface InventoryCheckOutModalProps {
  isOpen: boolean;
  item: Accessory | null;
  users?: Person[];
  onClose: () => void;
  onConfirm: (itemId: string, quantity: number, userId: string, notes: string) => void;
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
  border: '1.5px solid #d1d5db',
  fontFamily: "'Archivo', sans-serif",
  fontSize: fontSize.sm,
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

export default function InventoryCheckOutModal({
  isOpen,
  item,
  users = [],
  onClose,
  onConfirm,
}: InventoryCheckOutModalProps) {
  const [assignedTo, setAssignedTo] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAssignedTo('');
      setQuantity('1');
      setNotes('');
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const qty = parseInt(quantity) || 0;
  const maxQty = item.quantity_available;
  const qtyError = submitted && (qty < 1 || qty > maxQty);
  const userError = submitted && !assignedTo;
  const isOutOfStock = maxQty === 0;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!assignedTo || qty < 1 || qty > maxQty) return;
    onConfirm(item.id, qty, assignedTo, notes.trim());
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
              <PackageMinus size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.body, fontWeight: 700, color: colors.white, margin: 0 }}>
                Check Out Stock
              </h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: 'rgba(255,255,255,0.85)', margin: `0.2rem 0 0` }}>
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
              color: colors.white, padding: 0, flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Out-of-stock banner */}
        {isOutOfStock && (
          <div
            style={{
              backgroundColor: 'rgba(239,68,68,0.08)',
              borderBottom: '1px solid rgba(239,68,68,0.2)',
              padding: `${spacing.sm} ${spacing.xl}`,
            }}
          >
            <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.error, fontWeight: 600, margin: 0 }}>
              This item is out of stock and cannot be checked out.
            </p>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: spacing.xl, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>

          {/* Current stock info */}
          <div
            style={{
              display: 'flex',
              gap: spacing.lg,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: radius.md,
              backgroundColor: colors.bgStripe,
              border: '1px solid rgba(70,98,145,0.1)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
                Current Stock
              </p>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h5, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                {maxQty}
              </p>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(70,98,145,0.12)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
                After Check-Out
              </p>
              <p
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: fontSize.h5,
                  fontWeight: 700,
                  color: qty > 0 && qty <= maxQty ? (maxQty - qty === 0 ? colors.error : maxQty - qty < item.min_quantity ? colors.orangeAccent : colors.success) : colors.textPrimary,
                  margin: 0,
                }}
              >
                {qty > 0 && qty <= maxQty ? maxQty - qty : '–'}
              </p>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(70,98,145,0.12)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.2rem' }}>
                Min Qty
              </p>
              <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h5, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                {item.min_quantity}
              </p>
            </div>
          </div>

          {/* Assign to */}
          <div>
            <label style={labelStyle}>Assign To *</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              disabled={isOutOfStock}
              onFocus={() => setFocused('user')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle,
                borderColor: userError ? colors.error : focused === 'user' ? colors.primary : colors.border,
                appearance: 'none',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                backgroundColor: isOutOfStock ? colors.bgDisabled : assignedTo ? colors.bgSurface : colors.bgEmpty,
                color: assignedTo ? colors.textPrimary : colors.textDisabled,
                opacity: isOutOfStock ? 0.6 : 1,
              }}
            >
              <option value="">Select a user…</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
              ))}
            </select>
            {userError && (
              <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '0.15rem', display: 'block' }}>
                Please select a user
              </span>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label style={labelStyle}>Quantity *</label>
            <input
              type="number"
              min="1"
              max={maxQty}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              disabled={isOutOfStock}
              onFocus={() => setFocused('qty')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle,
                borderColor: qtyError ? colors.error : focused === 'qty' ? colors.primary : colors.border,
                opacity: isOutOfStock ? 0.6 : 1,
                cursor: isOutOfStock ? 'not-allowed' : 'text',
              }}
            />
            {qtyError && (
              <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '0.15rem', display: 'block' }}>
                Enter a quantity between 1 and {maxQty}
              </span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this checkout…"
              rows={3}
              onFocus={() => setFocused('notes')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.5,
                borderColor: focused === 'notes' ? colors.primary : colors.border,
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
            disabled={isOutOfStock}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: isOutOfStock ? colors.bgDisabled : colors.orangeAccent,
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isOutOfStock ? colors.textDisabled : colors.white,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            }}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}

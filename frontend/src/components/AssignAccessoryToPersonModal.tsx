import { useState, useEffect, useMemo } from 'react';
import { X, PackageMinus, Search } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Accessory } from '../types/inventory';
import type { Person } from '../types/people';
import { accessoriesApi } from '../api';

interface AssignAccessoryToPersonModalProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onAssigned: () => void;
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
  border: `1.5px solid ${colors.border}`,
  fontFamily: "'Archivo', sans-serif",
  fontSize: fontSize.sm,
  color: colors.textPrimary,
  backgroundColor: colors.bgSurface,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
};

export default function AssignAccessoryToPersonModal({ isOpen, person, onClose, onAssigned }: AssignAccessoryToPersonModalProps) {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId('');
      setQuantity('1');
      setNotes('');
      setSearch('');
      setSubmitted(false);
      accessoriesApi.list()
        .then(data => setAccessories(data.filter(a => a.quantity_available > 0)))
        .catch(() => {});
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return accessories;
    return accessories.filter(a =>
      a.item_name.toLowerCase().includes(q) ||
      (a.category ?? '').toLowerCase().includes(q) ||
      (a.model_number ?? '').toLowerCase().includes(q),
    );
  }, [accessories, search]);

  if (!isOpen || !person) return null;

  const selected = accessories.find(a => a.id === selectedId);
  const qty = parseInt(quantity) || 0;
  const maxQty = selected?.quantity_available ?? 0;
  const qtyError = submitted && selectedId && (qty < 1 || qty > maxQty);

  const handleConfirm = () => {
    setSubmitted(true);
    if (!selectedId || qty < 1 || qty > maxQty) return;
    setLoading(true);
    accessoriesApi.checkOut(selectedId, qty, person.id, notes.trim())
      .then(() => {
        onAssigned();
        onClose();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: colors.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: colors.bgSurface, borderRadius: radius.xl, width: '30rem', maxHeight: '82vh', display: 'flex', flexDirection: 'column', boxShadow: shadows.modal, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ backgroundColor: colors.orangeAccent, padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PackageMinus size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1rem', fontWeight: 700, color: colors.white, margin: 0 }}>Check Out Accessory</h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: 'rgba(255,255,255,0.8)', margin: `0.2rem 0 0` }}>
                to {person.first_name} {person.last_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '1.75rem', height: '1.75rem', borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, padding: 0, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: spacing.xl, display: 'flex', flexDirection: 'column', gap: spacing.lg, flex: 1 }}>

          {/* Search */}
          <div>
            <label style={labelStyle}>Select Accessory *</label>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: colors.blueGrayMd, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by name or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2rem', borderColor: focused === 'search' ? colors.primary : colors.border }}
                onFocus={() => setFocused('search')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          {/* Accessory list */}
          <div style={{ borderRadius: radius.md, border: `1px solid ${submitted && !selectedId ? colors.error : 'rgba(70,98,145,0.15)'}`, overflow: 'hidden', maxHeight: '14rem', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: `${spacing.lg} ${spacing.md}`, textAlign: 'center', color: colors.blueGrayMd, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm }}>
                {accessories.length === 0 ? 'No accessories with available stock.' : 'No accessories match your search.'}
              </div>
            ) : (
              filtered.map((acc, idx) => {
                const isSelected = selectedId === acc.id;
                return (
                  <div
                    key={acc.id}
                    onClick={() => { setSelectedId(acc.id); setQuantity('1'); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: `0.625rem ${spacing.md}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(252,156,45,0.07)' : idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                      borderLeft: `3px solid ${isSelected ? colors.orangeAccent : 'transparent'}`,
                      borderBottom: '1px solid rgba(70,98,145,0.07)',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', border: `2px solid ${isSelected ? colors.orangeAccent : 'rgba(70,98,145,0.35)'}`, backgroundColor: isSelected ? colors.orangeAccent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <div style={{ width: '0.3rem', height: '0.3rem', borderRadius: '50%', backgroundColor: colors.white }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, fontWeight: 600, color: colors.textPrimary }}>{acc.item_name}</span>
                      {acc.category && <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', color: colors.blueGrayMd, marginLeft: spacing.sm }}>{acc.category}</span>}
                    </div>
                    <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: colors.success, flexShrink: 0 }}>
                      {acc.quantity_available} avail.
                    </span>
                  </div>
                );
              })
            )}
          </div>
          {submitted && !selectedId && (
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '-0.75rem', display: 'block' }}>Please select an accessory</span>
          )}

          {/* Quantity (only shown when something selected) */}
          {selected && (
            <div style={{ display: 'flex', gap: spacing.lg }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={maxQty}
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  onFocus={() => setFocused('qty')}
                  onBlur={() => setFocused(null)}
                  style={{ ...inputStyle, borderColor: qtyError ? colors.error : focused === 'qty' ? colors.primary : colors.border }}
                />
                {qtyError && (
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '0.15rem', display: 'block' }}>
                    Enter a qty between 1 and {maxQty}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: spacing.xl, padding: `${spacing.sm} ${spacing.md}`, borderRadius: radius.md, backgroundColor: colors.bgStripe, border: '1px solid rgba(70,98,145,0.1)', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.15rem' }}>In Stock</p>
                  <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: colors.textPrimary, margin: 0 }}>{maxQty}</p>
                </div>
                <div style={{ width: '1px', backgroundColor: 'rgba(70,98,145,0.12)', alignSelf: 'stretch' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.15rem' }}>After</p>
                  <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: qty > 0 && qty <= maxQty ? (maxQty - qty === 0 ? colors.error : colors.success) : colors.textPrimary, margin: 0 }}>
                    {qty > 0 && qty <= maxQty ? maxQty - qty : '–'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
              onFocus={() => setFocused('notes')}
              onBlur={() => setFocused(null)}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, borderColor: focused === 'notes' ? colors.primary : colors.border }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: spacing.md, padding: `0 ${spacing.xl} ${spacing.xl}`, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: `${spacing.sm} ${spacing.lg}`, borderRadius: radius.full, border: `1.5px solid ${colors.border}`, backgroundColor: colors.bgSurface, fontFamily: "'Archivo', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: colors.textPrimary, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{ flex: 1, padding: `${spacing.sm} ${spacing.lg}`, borderRadius: radius.full, border: 'none', backgroundColor: loading ? colors.bgDisabled : colors.orangeAccent, fontFamily: "'Archivo', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: loading ? colors.textDisabled : colors.white, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Checking Out…' : 'Check Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

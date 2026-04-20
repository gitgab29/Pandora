import { useState } from 'react';
import { X } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { AddInventoryFormData, Accessory } from '../types/inventory';
import { accessoriesApi } from '../api';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (acc: Accessory) => void;
}

const EMPTY_FORM: AddInventoryFormData = {
  item_name: '', category: '', quantity_available: '',
  min_quantity: '', model_number: '', purchase_date: '',
  unit_cost: '', order_number: '', manufacturer: '',
  supplier: '', location: '', notes: '',
};

const INVENTORY_CATEGORIES = [
  'Cable', 'Adapter', 'Keyboard', 'Mouse', 'Headset',
  'Power Supply', 'Storage', 'RAM', 'Monitor', 'Other',
];

// ── Shared field styles ───────────────────────────────────────────────────────

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

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: fontSize.xs,
  fontWeight: 700,
  color: colors.blueGrayDark,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  padding: `${spacing.md} 0 ${spacing.xs}`,
  borderTop: '1px solid rgba(70,98,145,0.1)',
  marginTop: spacing.md,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function TextInput({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder ?? label}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle, borderColor: focused ? colors.primary : colors.border }}
      />
    </div>
  );
}

function SelectInput({
  label, value, options, onChange, placeholder,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          borderColor: focused ? colors.primary : colors.border,
          appearance: 'none',
          cursor: 'pointer',
          color: value ? colors.textPrimary : colors.textDisabled,
        }}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AddInventoryModal({ isOpen, onClose, onSave }: AddInventoryModalProps) {
  const [form, setForm] = useState<AddInventoryFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const set = (key: keyof AddInventoryFormData) => (v: string) =>
    setForm(prev => ({ ...prev, [key]: v }));

  const handleSubmit = () => {
    if (!form.item_name.trim()) return;
    setSaving(true);
    accessoriesApi.create({
      item_name: form.item_name.trim(),
      category: form.category || undefined,
      quantity_available: parseInt(form.quantity_available) || 0,
      min_quantity: parseInt(form.min_quantity) || 0,
      model_number: form.model_number || undefined,
      purchase_date: form.purchase_date || undefined,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      order_number: form.order_number || undefined,
      manufacturer: form.manufacturer || undefined,
      supplier: form.supplier || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
    }).then(created => {
      onSave?.(created);
      setForm(EMPTY_FORM);
      onClose();
    }).catch(() => {}).finally(() => setSaving(false));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
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
        zIndex: 1000,
        padding: spacing.xl,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          width: '100%',
          maxWidth: '38rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: shadows.modal,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing.xl} ${spacing.xl} ${spacing.md}`,
            borderBottom: '1px solid rgba(70,98,145,0.1)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h6, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              New Inventory Item
            </h2>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: colors.blueGrayMd, margin: `${spacing.xs} 0 0` }}>
              Fill in the details below. Fields marked * are required.
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '1.75rem', height: '1.75rem', borderRadius: radius.full,
              backgroundColor: colors.closeBtn, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.white, padding: 0, flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', padding: `${spacing.sm} ${spacing.xl} ${spacing.xl}`, flex: 1 }}>

          {/* ── Item Details ── */}
          <p style={{ ...sectionHeadStyle, borderTop: 'none', marginTop: 0, paddingTop: spacing.md }}>Item Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <TextInput label="Item Name *" value={form.item_name} onChange={set('item_name')} placeholder="e.g. USB-C Cable 2m" />
            </div>
            <SelectInput label="Category *" value={form.category} options={INVENTORY_CATEGORIES} onChange={set('category')} />
            <TextInput label="Model Number" value={form.model_number} onChange={set('model_number')} placeholder="e.g. MX-USBC-200" />
            <TextInput label="Quantity Available *" value={form.quantity_available} onChange={set('quantity_available')} placeholder="e.g. 25" type="number" />
            <TextInput label="Min Quantity (Alert)" value={form.min_quantity} onChange={set('min_quantity')} placeholder="e.g. 5" type="number" />
          </div>

          {/* ── Source ── */}
          <p style={sectionHeadStyle}>Source</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} placeholder="e.g. Anker" />
            <TextInput label="Supplier" value={form.supplier} onChange={set('supplier')} placeholder="e.g. Amazon Business" />
            <TextInput label="Purchase Date" value={form.purchase_date} onChange={set('purchase_date')} type="date" />
            <TextInput label="Unit Cost (₱)" value={form.unit_cost} onChange={set('unit_cost')} placeholder="e.g. 12.99" type="number" />
            <div style={{ gridColumn: '1 / -1' }}>
              <TextInput label="Order Number" value={form.order_number} onChange={set('order_number')} placeholder="e.g. PO-2024-00456" />
            </div>
          </div>

          {/* ── Location ── */}
          <p style={sectionHeadStyle}>Location</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <TextInput label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Storeroom A, Shelf 3" />
            </div>
          </div>

          {/* ── Notes ── */}
          <p style={sectionHeadStyle}>Notes</p>
          <div style={{ marginTop: spacing.sm }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              placeholder="Any additional notes about this item…"
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: spacing.md,
            padding: `${spacing.md} ${spacing.xl}`,
            borderTop: '1px solid rgba(70,98,145,0.1)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: `${spacing.sm} ${spacing.xl}`,
              borderRadius: radius.full,
              border: `1.5px solid ${colors.border}`,
              backgroundColor: colors.bgSurface,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: colors.textPrimary,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              padding: `${spacing.sm} ${spacing.xl}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: saving ? colors.bgDisabled : colors.primary,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: saving ? colors.textDisabled : colors.white,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
}

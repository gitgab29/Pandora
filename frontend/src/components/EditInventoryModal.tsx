import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Accessory, AddInventoryFormData } from '../types/inventory';
import { accessoriesApi } from '../api';

interface EditInventoryModalProps {
  isOpen: boolean;
  item: Accessory | null;
  onClose: () => void;
  onSave: (updated: Accessory) => void;
}

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        placeholder={placeholder ?? label}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle, borderColor: focused ? colors.primary : colors.border }}
      />
    </Field>
  );
}

function SelectInput({
  label, value, options, onChange, placeholder,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label}>
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
          backgroundColor: value ? colors.bgSurface : colors.bgEmpty,
          color: value ? colors.textPrimary : colors.textDisabled,
        }}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </Field>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function itemToForm(i: Accessory): AddInventoryFormData {
  return {
    item_name: i.item_name,
    category: i.category ?? '',
    quantity_available: i.quantity_available.toString(),
    min_quantity: i.min_quantity.toString(),
    model_number: i.model_number ?? '',
    purchase_date: i.purchase_date ?? '',
    unit_cost: i.unit_cost?.toString() ?? '',
    order_number: i.order_number ?? '',
    manufacturer: i.manufacturer ?? '',
    supplier: i.supplier ?? '',
    location: i.location ?? '',
    business_group: i.business_group ?? '',
    notes: i.notes ?? '',
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EditInventoryModal({ isOpen, item, onClose, onSave }: EditInventoryModalProps) {
  const [form, setForm] = useState<AddInventoryFormData | null>(null);

  useEffect(() => {
    if (item) setForm(itemToForm(item));
  }, [item]);

  if (!isOpen || !item || !form) return null;

  const set = (key: keyof AddInventoryFormData) => (v: string) =>
    setForm(prev => prev ? { ...prev, [key]: v } : prev);

  const handleSubmit = () => {
    if (!form.item_name.trim()) return;
    const qty = parseInt(form.quantity_available) || 0;
    const minQty = parseInt(form.min_quantity) || 0;
    const patch: Partial<Accessory> = {
      item_name: form.item_name.trim(),
      category: form.category || undefined,
      quantity_available: qty,
      min_quantity: minQty,
      model_number: form.model_number || undefined,
      purchase_date: form.purchase_date || undefined,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      order_number: form.order_number || undefined,
      manufacturer: form.manufacturer || undefined,
      supplier: form.supplier || undefined,
      location: form.location || undefined,
      business_group: form.business_group || undefined,
      notes: form.notes || undefined,
    };
    accessoriesApi.update(item.id, patch)
      .then(updated => { onSave(updated); onClose(); })
      .catch(() => {});
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
              Edit Inventory Item
            </h2>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: colors.blueGrayMd, margin: `${spacing.xs} 0 0` }}>
              Update the details below. Fields marked * are required.
            </p>
          </div>
          <button
            onClick={onClose}
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
          <p style={sectionHeadStyle}>Item Details</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <TextInput label="Item Name *" value={form.item_name} onChange={set('item_name')} placeholder="e.g. USB-C Cable 2m" />
            </div>
            <SelectInput label="Category" value={form.category} options={INVENTORY_CATEGORIES} onChange={set('category')} placeholder="Select category" />
            <TextInput label="Model Number" value={form.model_number} onChange={set('model_number')} placeholder="e.g. ANK-USB2M" />
            <TextInput label="Qty Available *" value={form.quantity_available} onChange={set('quantity_available')} placeholder="e.g. 20" type="number" />
            <TextInput label="Min Quantity *" value={form.min_quantity} onChange={set('min_quantity')} placeholder="e.g. 5" type="number" />
          </div>

          {/* ── Source ── */}
          <p style={sectionHeadStyle}>Source</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} placeholder="e.g. Anker" />
            <TextInput label="Supplier" value={form.supplier} onChange={set('supplier')} placeholder="e.g. Amazon Business" />
            <TextInput label="Purchase Date" value={form.purchase_date} onChange={set('purchase_date')} type="date" />
            <TextInput label="Unit Cost (₱)" value={form.unit_cost} onChange={set('unit_cost')} placeholder="e.g. 12.99" type="number" />
            <TextInput label="Order Number" value={form.order_number} onChange={set('order_number')} placeholder="e.g. PO-2024-00123" />
          </div>

          {/* ── Location ── */}
          <p style={sectionHeadStyle}>Location</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Storeroom A, Shelf 1" />
            <TextInput label="Department" value={form.business_group} onChange={set('business_group')} placeholder="e.g. IT" />
          </div>

          {/* ── Notes ── */}
          <p style={sectionHeadStyle}>Notes</p>
          <div style={{ marginTop: spacing.sm }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              placeholder="Any additional notes…"
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
            onClick={onClose}
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
            style={{
              padding: `${spacing.sm} ${spacing.xl}`,
              borderRadius: radius.full,
              border: 'none',
              backgroundColor: colors.primary,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.sm,
              fontWeight: 600,
              color: colors.white,
              cursor: 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

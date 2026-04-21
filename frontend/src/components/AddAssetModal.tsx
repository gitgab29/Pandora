import { useState } from 'react';
import { X } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { AddAssetFormData, Asset, AssetStatus } from '../types/asset';
import { ASSET_STATUS_LABELS } from '../types/asset';
import { isBlank } from '../utils/validation';
import { assetsApi } from '../api';
import { useToast } from '../context/ToastContext';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (asset: Asset) => void;
}

const EMPTY_FORM: AddAssetFormData = {
  asset_tag: '', model: '', category: '', status: '',
  serial_number: '', warranty_expiry: '', end_of_life: '',
  order_number: '', purchase_date: '', purchase_cost: '',
  depreciation_value: '', manufacturer: '', supplier: '',
  assigned_to: '', notes: '',
  group: '', imei_number: '',
  cpu: '', gpu: '', operating_system: '',
  ram: '', screen_size: '', storage_size: '',
};

const ASSET_STATUSES: AssetStatus[] = ['AVAILABLE', 'DEPLOYED', 'IN_REPAIR', 'IN_MAINTENANCE', 'TO_AUDIT', 'LOST'];
const ASSET_CATEGORIES = ['Laptop', 'Phone', 'Tablet', 'PC', 'Monitor', 'Accessory', 'Other'];
const ASSET_GROUPS = ['PRODUCT', 'PARTS'];
const ASSET_GROUP_LABELS: Record<string, string> = { PRODUCT: 'Product', PARTS: 'Parts' };

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
  label, value, onChange, placeholder, type = 'text', error = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: boolean;
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
        style={{
          ...inputStyle,
          borderColor: error ? colors.error : focused ? colors.primary : colors.border,
        }}
      />
      {error && (
        <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '0.15rem' }}>
          This field is required
        </span>
      )}
    </Field>
  );
}

function SelectInput({
  label, value, options, onChange, placeholder, error = false, labelMap,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
  placeholder?: string; error?: boolean; labelMap?: Record<string, string>;
}) {
  const optionLabel = (o: string) => labelMap?.[o] ?? (ASSET_STATUS_LABELS as Record<string, string>)[o] ?? o;
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
          borderColor: error ? colors.error : focused ? colors.primary : colors.border,
          appearance: 'none',
          cursor: 'pointer',
          backgroundColor: value ? colors.bgSurface : colors.bgEmpty,
          color: value ? colors.textPrimary : colors.textDisabled,
        }}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{optionLabel(o)}</option>)}
      </select>
      {error && (
        <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '0.15rem' }}>
          This field is required
        </span>
      )}
    </Field>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AddAssetModal({ isOpen, onClose, onSave }: AddAssetModalProps) {
  const [form, setForm] = useState<AddAssetFormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const set = (key: keyof AddAssetFormData) => (v: string) =>
    setForm(prev => ({ ...prev, [key]: v }));

  const errors = {
    asset_tag:     submitted && isBlank(form.asset_tag),
    serial_number: submitted && isBlank(form.serial_number),
    category:      submitted && isBlank(form.category),
    status:        submitted && isBlank(form.status),
    assigned_to:   submitted && form.status === 'DEPLOYED' && isBlank(form.assigned_to),
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const deployedWithoutUser = form.status === 'DEPLOYED' && isBlank(form.assigned_to);
    if (isBlank(form.asset_tag) || isBlank(form.serial_number) || isBlank(form.category) || isBlank(form.status) || deployedWithoutUser) return;

    setSaving(true);
    assetsApi.create({
      asset_tag:          form.asset_tag.trim(),
      serial_number:      form.serial_number.trim(),
      category:           form.category,
      status:             form.status as AssetStatus,
      model:              form.model || undefined,
      manufacturer:       form.manufacturer || undefined,
      supplier:           form.supplier || undefined,
      purchase_date:      form.purchase_date || undefined,
      purchase_cost:      form.purchase_cost ? parseFloat(form.purchase_cost) : undefined,
      depreciation_value: form.depreciation_value ? parseFloat(form.depreciation_value) : undefined,
      order_number:       form.order_number || undefined,
      warranty_expiry:    form.warranty_expiry || undefined,
      end_of_life:        form.end_of_life || undefined,
      assigned_to:        form.assigned_to || undefined,
      group:              form.group || undefined,
      imei_number:        form.imei_number || undefined,
      cpu:                form.cpu || undefined,
      gpu:                form.gpu || undefined,
      operating_system:   form.operating_system || undefined,
      ram:                form.ram || undefined,
      screen_size:        form.screen_size || undefined,
      storage_size:       form.storage_size || undefined,
      notes:              form.notes || undefined,
    }).then(created => {
      onSave?.(created);
      toast.success(`Added asset ${created.asset_tag}`);
      setForm(EMPTY_FORM);
      setSubmitted(false);
      onClose();
    }).catch(() => {
      toast.error('Could not add asset. Please try again.');
    }).finally(() => setSaving(false));
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setSubmitted(false);
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
          maxWidth: '42rem',
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
              New Asset
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

          {/* ── Basic Information ── */}
          <p style={sectionHeadStyle}>Basic Information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="Asset Tag *" value={form.asset_tag} onChange={set('asset_tag')} placeholder="e.g. ES-0042" error={errors.asset_tag} />
            <TextInput label="Serial Number *" value={form.serial_number} onChange={set('serial_number')} placeholder="e.g. C02X12ABCDEF" error={errors.serial_number} />
            <SelectInput label="Category *" value={form.category} options={ASSET_CATEGORIES} onChange={set('category')} error={errors.category} />
            <SelectInput label="Status *" value={form.status} options={ASSET_STATUSES} onChange={set('status')} error={errors.status} />
            <TextInput label="Model" value={form.model} onChange={set('model')} placeholder="e.g. MacBook Pro 14" />
          </div>

          {/* ── Assignment ── */}
          <p style={sectionHeadStyle}>Assignment</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label={form.status === 'DEPLOYED' ? 'Assigned To *' : 'Assigned To'} value={form.assigned_to} onChange={set('assigned_to')} placeholder="User ID (UUID)" error={errors.assigned_to} />
            <SelectInput label="Group" value={form.group} options={ASSET_GROUPS} onChange={set('group')} placeholder="Select Group" labelMap={ASSET_GROUP_LABELS} />
          </div>

          {/* ── Hardware Specifications ── */}
          <p style={sectionHeadStyle}>Hardware Specifications</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="CPU" value={form.cpu} onChange={set('cpu')} placeholder="e.g. Apple M3 Pro" />
            <TextInput label="GPU" value={form.gpu} onChange={set('gpu')} placeholder="e.g. Apple M3 Pro 18-core" />
            <TextInput label="RAM" value={form.ram} onChange={set('ram')} placeholder="e.g. 16 GB" />
            <TextInput label="Storage Size" value={form.storage_size} onChange={set('storage_size')} placeholder="e.g. 512 GB SSD" />
            <TextInput label="Screen Size" value={form.screen_size} onChange={set('screen_size')} placeholder="e.g. 14 inch" />
            <TextInput label="Operating System" value={form.operating_system} onChange={set('operating_system')} placeholder="e.g. macOS 14" />
            <TextInput label="IMEI Number" value={form.imei_number} onChange={set('imei_number')} placeholder="For phones/tablets" />
          </div>

          {/* ── Purchase Information ── */}
          <p style={sectionHeadStyle}>Purchase Information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="Manufacturer" value={form.manufacturer} onChange={set('manufacturer')} placeholder="e.g. Apple" />
            <TextInput label="Supplier" value={form.supplier} onChange={set('supplier')} placeholder="e.g. CDW" />
            <TextInput label="Purchase Date" value={form.purchase_date} onChange={set('purchase_date')} type="date" />
            <TextInput label="Purchase Cost (₱)" value={form.purchase_cost} onChange={set('purchase_cost')} placeholder="e.g. 1299.00" type="number" />
            <TextInput label="Depreciation Value (₱)" value={form.depreciation_value} onChange={set('depreciation_value')} placeholder="e.g. 900.00" type="number" />
            <TextInput label="Order Number" value={form.order_number} onChange={set('order_number')} placeholder="e.g. PO-2024-00123" />
            <TextInput label="Warranty Expiry" value={form.warranty_expiry} onChange={set('warranty_expiry')} type="date" />
            <TextInput label="End of Life" value={form.end_of_life} onChange={set('end_of_life')} type="date" />
          </div>

          {/* ── Notes ── */}
          <p style={sectionHeadStyle}>Notes</p>
          <div style={{ marginTop: spacing.sm }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              placeholder="Any additional notes about this asset…"
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: 1.5,
              }}
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
            {saving ? 'Adding…' : 'Add Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}

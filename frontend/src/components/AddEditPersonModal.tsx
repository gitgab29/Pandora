import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Person, PersonRole } from '../types/people';

interface AddEditPersonModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  person?: Person | null;
  allPeople: Person[];
  onClose: () => void;
  onSave: (person: Person) => void;
}

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  title: '',
  business_group: '',
  supervisor: '' as string,
  location: '',
  badge_number: '',
  image_url: '',
  role: 'STAFF' as PersonRole,
  notes: '',
};

const BUSINESS_GROUPS = [
  'Engineering', 'IT', 'Product', 'Operations', 'Finance',
  'Human Resources', 'Executive Leadership', 'Sales', 'Marketing', 'Legal',
];

// ── Shared input styles ────────────────────────────────────────────────────────

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

const inputBase: React.CSSProperties = {
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

const sectionHead: React.CSSProperties = {
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

// ── Sub-components ─────────────────────────────────────────────────────────────

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
        placeholder={placeholder ?? ''}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputBase, borderColor: focused ? colors.primary : colors.border }}
      />
    </div>
  );
}

function SelectInput({
  label, value, options, onChange, placeholder,
}: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; placeholder?: string;
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
          ...inputBase,
          borderColor: focused ? colors.primary : colors.border,
          appearance: 'none',
          cursor: 'pointer',
          color: value ? colors.textPrimary : colors.textDisabled,
        }}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AddEditPersonModal({
  isOpen, mode, person, allPeople, onClose, onSave,
}: AddEditPersonModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && person) {
        setForm({
          first_name:     person.first_name,
          last_name:      person.last_name,
          email:          person.email,
          title:          person.title,
          business_group: person.business_group,
          supervisor:     person.supervisor ?? '',
          location:       person.location,
          badge_number:   person.badge_number,
          image_url:      person.image_url ?? '',
          role:           person.role,
          notes:          person.notes,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [isOpen, mode, person]);

  if (!isOpen) return null;

  const set = <K extends keyof typeof EMPTY_FORM>(key: K) => (v: typeof EMPTY_FORM[K]) =>
    setForm(prev => ({ ...prev, [key]: v }));

  const supervisorOptions = allPeople
    .filter(p => p.is_active && p.id !== person?.id)
    .sort((a, b) => a.last_name.localeCompare(b.last_name))
    .map(p => ({ value: String(p.id), label: `${p.last_name}, ${p.first_name}` }));

  const bgOptions = BUSINESS_GROUPS.map(g => ({ value: g, label: g }));
  const roleOptions = [
    { value: 'STAFF', label: 'Staff' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const canSubmit = form.first_name.trim() && form.last_name.trim() && form.email.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const today = new Date().toISOString().split('T')[0];
    onSave({
      id:             person?.id ?? '',
      first_name:     form.first_name.trim(),
      last_name:      form.last_name.trim(),
      email:          form.email.trim(),
      title:          form.title.trim(),
      business_group: form.business_group,
      supervisor:     form.supervisor !== '' ? form.supervisor : null,
      location:       form.location.trim(),
      badge_number:   form.badge_number.trim(),
      image_url:      form.image_url.trim(),
      role:           form.role,
      is_active:      true,
      notes:          form.notes.trim(),
      created_at:     person?.created_at ?? today,
      updated_at:     today,
    });
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: colors.overlay,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: spacing.xl,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          width: '100%', maxWidth: '38rem',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: shadows.modal,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${spacing.xl} ${spacing.xl} ${spacing.md}`,
            borderBottom: '1px solid rgba(70,98,145,0.1)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h6, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
              {mode === 'add' ? 'Add Person' : 'Edit Person'}
            </h2>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: colors.blueGrayMd, margin: `${spacing.xs} 0 0` }}>
              Fields marked * are required.
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

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: `${spacing.sm} ${spacing.xl} ${spacing.xl}`, flex: 1 }}>

          {/* Identity */}
          <p style={{ ...sectionHead, borderTop: 'none', marginTop: 0, paddingTop: spacing.md }}>Identity</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="First Name *" value={form.first_name} onChange={set('first_name')} placeholder="e.g. Maria" />
            <TextInput label="Last Name *"  value={form.last_name}  onChange={set('last_name')}  placeholder="e.g. Santos" />
            <div style={{ gridColumn: '1 / -1' }}>
              <TextInput label="Email *" value={form.email} onChange={set('email')} placeholder="name@embeddedsilicon.com" type="email" />
            </div>
            <TextInput label="Badge Number" value={form.badge_number} onChange={set('badge_number')} placeholder="e.g. ES-B-001" />
            <TextInput label="Location"     value={form.location}     onChange={set('location')}     placeholder="e.g. HQ - Lab A" />
            <div style={{ gridColumn: '1 / -1' }}>
              <TextInput label="Profile Image URL" value={form.image_url} onChange={set('image_url')} placeholder="https://example.com/photo.jpg" />
            </div>
          </div>

          {/* Role & Organisation */}
          <p style={sectionHead}>Role &amp; Organisation</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md} ${spacing.lg}`, marginTop: spacing.sm }}>
            <TextInput label="Position" value={form.title} onChange={set('title')} placeholder="e.g. IT Specialist" />
            <SelectInput label="Business Group" value={form.business_group} options={bgOptions} onChange={set('business_group')} placeholder="Select group" />
            <SelectInput
              label="Supervisor"
              value={form.supervisor}
              options={supervisorOptions}
              onChange={v => set('supervisor')(v)}
              placeholder="None"
            />
            <SelectInput label="Role" value={form.role} options={roleOptions} onChange={v => set('role')(v as PersonRole)} />
          </div>

          {/* Notes */}
          <p style={sectionHead}>Notes</p>
          <div style={{ marginTop: spacing.sm }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              placeholder="Any additional notes…"
              onChange={e => set('notes')(e.target.value)}
              rows={3}
              style={{ ...inputBase, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', gap: spacing.md,
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
              fontSize: fontSize.sm, fontWeight: 600,
              color: colors.textPrimary, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: `${spacing.sm} ${spacing.xl}`,
              borderRadius: radius.full, border: 'none',
              backgroundColor: canSubmit ? colors.primary : colors.bgDisabled,
              fontFamily: "'Archivo', sans-serif",
              fontSize: fontSize.sm, fontWeight: 600,
              color: canSubmit ? colors.white : colors.textDisabled,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
            }}
          >
            {mode === 'add' ? 'Add Person' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

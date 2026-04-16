import { useState, useEffect, useMemo } from 'react';
import { X, LogOut, Search } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Asset } from '../types/asset';
import type { Person } from '../types/people';
import { assetsApi } from '../api';

interface AssignAssetToPersonModalProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onAssigned: (asset: Asset) => void;
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

export default function AssignAssetToPersonModal({ isOpen, person, onClose, onAssigned }: AssignAssetToPersonModalProps) {
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId('');
      setNotes('');
      setSearch('');
      setSubmitted(false);
      assetsApi.list({ status: 'AVAILABLE' }).then(setAvailableAssets).catch(() => {});
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return availableAssets;
    return availableAssets.filter(a =>
      a.asset_tag.toLowerCase().includes(q) ||
      a.serial_number.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q),
    );
  }, [availableAssets, search]);

  if (!isOpen || !person) return null;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!selectedId) return;
    setLoading(true);
    assetsApi.checkOut(selectedId, person.id, notes.trim())
      .then(updated => {
        onAssigned(updated);
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
        style={{ backgroundColor: colors.bgSurface, borderRadius: radius.xl, width: '30rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: shadows.modal, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ backgroundColor: colors.success, padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={16} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1rem', fontWeight: 700, color: colors.white, margin: 0 }}>Assign Asset</h2>
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
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Select Available Asset *</label>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: colors.blueGrayMd, pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by tag, serial, category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '2rem', borderColor: focused === 'search' ? colors.primary : colors.border }}
                onFocus={() => setFocused('search')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          {/* Asset list */}
          <div style={{ borderRadius: radius.md, border: `1px solid ${submitted && !selectedId ? colors.error : 'rgba(70,98,145,0.15)'}`, overflow: 'hidden', maxHeight: '16rem', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: `${spacing.lg} ${spacing.md}`, textAlign: 'center', color: colors.blueGrayMd, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm }}>
                {availableAssets.length === 0 ? 'No available assets.' : 'No assets match your search.'}
              </div>
            ) : (
              filtered.map((asset, idx) => {
                const isSelected = selectedId === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedId(asset.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: `0.625rem ${spacing.md}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(46,124,253,0.07)' : idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                      borderLeft: `3px solid ${isSelected ? colors.primary : 'transparent'}`,
                      borderBottom: '1px solid rgba(70,98,145,0.07)',
                      transition: 'background-color 0.1s',
                    }}
                  >
                    <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', border: `2px solid ${isSelected ? colors.primary : 'rgba(70,98,145,0.35)'}`, backgroundColor: isSelected ? colors.primary : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <div style={{ width: '0.3rem', height: '0.3rem', borderRadius: '50%', backgroundColor: colors.white }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, fontWeight: 600, color: colors.textPrimary }}>{asset.asset_tag}</span>
                      <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', color: colors.blueGrayMd, marginLeft: spacing.sm }}>{asset.category}</span>
                    </div>
                    <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: '0.7rem', color: colors.blueGrayMd, flexShrink: 0 }}>{asset.serial_number}</span>
                  </div>
                );
              })
            )}
          </div>
          {submitted && !selectedId && (
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.error, marginTop: '-0.75rem', display: 'block' }}>Please select an asset</span>
          )}

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes about this assignment…"
              rows={3}
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
            style={{ flex: 1, padding: `${spacing.sm} ${spacing.lg}`, borderRadius: radius.full, border: 'none', backgroundColor: loading ? colors.bgDisabled : colors.success, fontFamily: "'Archivo', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: loading ? colors.textDisabled : colors.white, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Assigning…' : 'Assign Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}

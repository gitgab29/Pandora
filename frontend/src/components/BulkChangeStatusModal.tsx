import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { colors, spacing, radius } from '../theme';
import type { AssetStatus } from '../types/asset';
import { ASSET_STATUS_LABELS } from '../types/asset';

const STATUS_OPTIONS: AssetStatus[] = ['AVAILABLE', 'DEPLOYED', 'IN_REPAIR', 'IN_MAINTENANCE', 'TO_AUDIT', 'LOST'];

interface Props {
  isOpen: boolean;
  count: number;
  onConfirm: (status: AssetStatus, notes: string) => void;
  onClose: () => void;
}

export default function BulkChangeStatusModal({ isOpen, count, onConfirm, onClose }: Props) {
  const [status, setStatus] = useState<AssetStatus>('AVAILABLE');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(status, notes);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Archivo', sans-serif",
    fontSize: '0.75rem', fontWeight: 600, color: colors.blueGrayMd,
    marginBottom: spacing.xs,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.md,
    border: '1px solid rgba(70,98,145,0.2)',
    backgroundColor: colors.bgSurface,
    fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem',
    color: colors.textPrimary, outline: 'none',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(3,12,35,0.45)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.xl,
          border: '1px solid rgba(70,98,145,0.15)',
          boxShadow: '0 8px 40px rgba(3,12,35,0.18)',
          width: '100%', maxWidth: '27rem',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${spacing.md} ${spacing.xl}`,
            borderBottom: '1px solid rgba(70,98,145,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <RefreshCw size={15} color={colors.primary} />
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary }}>
              Change Status — {count} Asset{count !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: '1.625rem', height: '1.625rem', borderRadius: radius.sm, border: 'none',
              backgroundColor: 'transparent', color: colors.blueGrayMd,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: spacing.xl, display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          <div>
            <label style={labelStyle}>New Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as AssetStatus)}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{ASSET_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Reason for status change…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex', justifyContent: 'flex-end', gap: spacing.sm,
            padding: `${spacing.md} ${spacing.xl}`,
            borderTop: '1px solid rgba(70,98,145,0.1)',
          }}
        >
          <button
            onClick={handleClose}
            style={{
              padding: `0.4rem ${spacing.lg}`, borderRadius: radius.md,
              border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent',
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600,
              color: colors.blueGrayMd, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: `0.4rem ${spacing.lg}`, borderRadius: radius.md, border: 'none',
              backgroundColor: colors.primary,
              fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600,
              color: colors.white, cursor: 'pointer',
            }}
          >
            Apply to {count}
          </button>
        </div>
      </div>
    </div>
  );
}

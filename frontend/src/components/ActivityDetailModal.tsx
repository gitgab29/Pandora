import { X } from 'lucide-react';
import { colors, spacing, radius } from '../theme';
import type { TransactionLog } from '../types/activity';

const EVENT_COLORS: Record<string, { bg: string; color: string }> = {
  'Check In':  { bg: 'rgba(34,197,94,0.12)',   color: '#15803d' },
  'Check Out': { bg: 'rgba(252,156,45,0.12)',  color: '#b45309' },
  'Update':    { bg: 'rgba(46,124,253,0.1)',   color: colors.primary },
  'Audit':     { bg: 'rgba(139,92,246,0.1)',   color: '#7c3aed' },
  'Request':   { bg: 'rgba(45,252,249,0.12)',  color: '#0891b2' },
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Asset:     { bg: 'rgba(46,124,253,0.1)',  color: colors.primary },
  Inventory: { bg: 'rgba(45,252,249,0.12)', color: '#0891b2' },
  License:   { bg: 'rgba(252,156,45,0.12)', color: '#b45309' },
};

interface Props {
  log: TransactionLog | null;
  onClose: () => void;
}

export default function ActivityDetailModal({ log, onClose }: Props) {
  if (!log) return null;

  const eventStyle = EVENT_COLORS[log.event] ?? { bg: '#f3f4f6', color: '#374151' };
  const typeStyle  = TYPE_COLORS[log.type]   ?? { bg: '#f3f4f6', color: '#374151' };

  const fields: { label: string; value: string }[] = [
    { label: 'Log ID',        value: `#${log.id}` },
    { label: 'Date',          value: log.date },
    { label: 'Performed By',  value: log.user },
    { label: 'Type',          value: log.type },
    { label: 'Event',         value: log.event },
    { label: 'Item',          value: log.item },
    { label: 'To / From',     value: log.toFrom },
    { label: 'Department',    value: log.department ?? '—' },
    { label: 'Notes',         value: log.notes },
  ];

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
          width: '30rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 1.5rem 4rem rgba(3,12,35,0.18)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            backgroundColor: colors.primary,
            padding: `${spacing.lg} ${spacing.xl}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: `${radius.xl} ${radius.xl} 0 0`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <span
              style={{
                color: '#ffffff',
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}
            >
              Log #{log.id}
            </span>
            <span
              style={{
                padding: `0.125rem ${spacing.sm}`,
                borderRadius: '0.25rem',
                backgroundColor: eventStyle.bg,
                color: eventStyle.color,
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {log.event}
            </span>
            <span
              style={{
                padding: `0.125rem ${spacing.sm}`,
                borderRadius: '0.25rem',
                backgroundColor: typeStyle.bg,
                color: typeStyle.color,
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {log.type}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: radius.full,
              width: '1.75rem',
              height: '1.75rem',
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
        </div>

        {/* ── Body ── */}
        <div style={{ padding: spacing.xl }}>
          {fields.map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                gap: spacing.lg,
                alignItems: 'flex-start',
                paddingBottom: spacing.md,
                marginBottom: spacing.md,
                borderBottom: '1px solid rgba(70,98,145,0.07)',
              }}
            >
              <span
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: colors.blueGrayMd,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  minWidth: '7.5rem',
                  paddingTop: '0.15rem',
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '0.875rem',
                  color: value === '—' ? colors.blueGrayMd : colors.textPrimary,
                  flex: 1,
                  wordBreak: 'break-word',
                }}
              >
                {value || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

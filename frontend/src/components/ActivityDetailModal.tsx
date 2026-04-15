import { X } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows, badgeColors } from '../theme';
import type { TransactionLog } from '../types/activity';

const EVENT_COLORS: Record<string, { bg: string; color: string }> = {
  'Check In':  { bg: badgeColors.checkIn.bg,  color: badgeColors.checkIn.text },
  'Check Out': { bg: badgeColors.checkOut.bg, color: badgeColors.checkOut.text },
  'Update':    { bg: badgeColors.update.bg,   color: badgeColors.update.text },
  'Audit':     { bg: badgeColors.audit.bg,    color: badgeColors.audit.text },
  'Request':   { bg: badgeColors.request.bg,  color: badgeColors.request.text },
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Asset:     { bg: badgeColors.asset.bg,     color: badgeColors.asset.text },
  Inventory: { bg: badgeColors.inventory.bg, color: badgeColors.inventory.text },
  License:   { bg: badgeColors.license.bg,   color: badgeColors.license.text },
};

interface Props {
  log: TransactionLog | null;
  onClose: () => void;
}

export default function ActivityDetailModal({ log, onClose }: Props) {
  if (!log) return null;

  const eventStyle = EVENT_COLORS[log.event] ?? { bg: colors.bgDisabled, color: colors.closeBtn };
  const typeStyle  = TYPE_COLORS[log.type]   ?? { bg: colors.bgDisabled, color: colors.closeBtn };

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
          width: '30rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: shadows.modal,
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
                color: colors.white,
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 700,
                fontSize: fontSize.lg,
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
                fontSize: fontSize.xs,
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
                fontSize: fontSize.xs,
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
              color: colors.white,
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
                  fontSize: fontSize.micro,
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
                  fontSize: fontSize.md,
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

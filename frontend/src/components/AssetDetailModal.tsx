import { useState } from 'react';
import { X, Pencil, Monitor, Laptop, Smartphone, Tablet, Cpu, Package, LogOut, LogIn, Wrench, ClipboardCheck, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';
import { ASSET_STATUS_LABELS } from '../types/asset';
import RetireModal from './RetireModal';

interface AssetDetailModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onEdit: () => void;
  onRetire?: (notes?: string) => void;
  onCheckOut?: () => void;
  onCheckIn?: () => void;
  onChangeStatus?: (target: AssetStatus) => void;
  onResolve?: (targetStatus: AssetStatus, notes: string) => void;
}

const STATUS_COLORS: Record<AssetStatus, string> = {
  AVAILABLE: colors.success,
  DEPLOYED: colors.primary,
  IN_REPAIR: colors.orangeAccent,
  IN_MAINTENANCE: '#94a3b8',
  TO_AUDIT: '#eab308',
  LOST: colors.error,
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Laptop: Laptop,
  Phone: Smartphone,
  Tablet: Tablet,
  PC: Cpu,
  Monitor: Monitor,
};

const RESOLUTION_CONFIG: Partial<Record<AssetStatus, { label: string; icon: React.ElementType }>> = {
  TO_AUDIT:       { label: 'Mark Audited',  icon: ClipboardCheck },
  IN_REPAIR:      { label: 'Mark Repaired', icon: Wrench },
  IN_MAINTENANCE: { label: 'Mark Done',     icon: CheckCircle2 },
  LOST:           { label: 'Mark Found',    icon: MapPin },
};

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: colors.blueGrayMd, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: value ? colors.textPrimary : colors.textDisabled }}>
        {value || '—'}
      </span>
    </div>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.xs, fontWeight: 700, color: colors.blueGrayDark, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0, paddingBottom: spacing.xs, borderBottom: '1px solid rgba(70,98,145,0.1)', ...style }}>
      {children}
    </p>
  );
}

export default function AssetDetailModal({ isOpen, asset, onClose, onEdit, onRetire, onCheckOut, onCheckIn, onChangeStatus, onResolve }: AssetDetailModalProps) {
  const [retireOpen, setRetireOpen] = useState(false);
  const [pendingResolve, setPendingResolve] = useState<{ targetStatus: AssetStatus; label: string } | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  if (!isOpen || !asset) return null;

  const resolutionConfig = RESOLUTION_CONFIG[asset.status];
  const resolveTarget    = (asset.previous_status ?? 'AVAILABLE') as AssetStatus;
  const showResolution   = !!resolutionConfig && !!onResolve;

  const showCheckOut    = asset.status === 'AVAILABLE' && !!onCheckOut;
  const showCheckIn     = asset.status === 'DEPLOYED'  && !!onCheckIn;
  const showSetRepair   = (asset.status === 'AVAILABLE' || asset.status === 'DEPLOYED' || asset.status === 'TO_AUDIT') && !!onChangeStatus;
  const showSetAudit    = (asset.status === 'DEPLOYED'  || asset.status === 'IN_REPAIR' || asset.status === 'IN_MAINTENANCE') && !!onChangeStatus;
  const showSetLost     = asset.status !== 'LOST' && !!onChangeStatus;
  const footerVisible   = showCheckOut || showCheckIn || showSetRepair || showSetAudit || showSetLost || showResolution;

  const handleAction = (cb?: () => void) => () => { onClose(); cb?.(); };
  const handleStatus = (target: AssetStatus) => () => { onClose(); onChangeStatus?.(target); };

  const statusColor = STATUS_COLORS[asset.status] ?? colors.blueGrayMd;
  const statusLabel = ASSET_STATUS_LABELS[asset.status] ?? asset.status;
  const CategoryIcon = CATEGORY_ICONS[asset.category] ?? Package;

  const holder = asset.assigned_to_detail
    ? `${asset.assigned_to_detail.first_name} ${asset.assigned_to_detail.last_name}`
    : null;

  const formatDate = (d?: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (v?: number) => {
    if (v == null) return null;
    return `₱${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: colors.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: spacing.xl }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: colors.bgSurface, borderRadius: radius.xl, width: '100%', maxWidth: '54rem', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: shadows.modal }}
      >
        {/* ── Header ── */}
        <div style={{ padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`, borderBottom: '1px solid rgba(70,98,145,0.1)', display: 'flex', alignItems: 'flex-start', gap: spacing.lg, flexShrink: 0 }}>
          {/* Category icon */}
          <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: radius.lg, backgroundColor: 'rgba(46,124,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CategoryIcon size={22} color={colors.primary} />
          </div>

          {/* Title + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h6, fontWeight: 700, color: colors.textPrimary, margin: `0 0 0.1rem` }}>
              {asset.asset_tag}
            </h2>
            {(asset.manufacturer || asset.model) && (
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, fontWeight: 600, color: colors.textPrimary, margin: `0 0 0.15rem`, opacity: 0.75 }}>
                {[asset.manufacturer, asset.model].filter(Boolean).join(' ')}
              </p>
            )}
            <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, margin: `0 0 ${spacing.sm}` }}>
              {asset.category} {asset.serial_number ? `· ${asset.serial_number}` : ''}
            </p>
            <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: `${statusColor}18`, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: statusColor, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: statusColor }} />
                {statusLabel}
              </span>
              {asset.category && (
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: 'rgba(46,124,253,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: colors.primary, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {asset.category}
                </span>
              )}
              {holder && (
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: 'rgba(34,197,94,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: '#15803d', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  Assigned
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: spacing.sm, flexShrink: 0 }}>
            <button
              onClick={onEdit}
              style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: `1px solid rgba(70,98,145,0.25)`, backgroundColor: colors.bgSurface, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.blueGrayMd, cursor: 'pointer', transition: 'background-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bgSubtle)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.bgSurface)}
            >
              <Pencil size={12} />
              Edit
            </button>
            {onRetire && (
              <button
                onClick={() => setRetireOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: `1px solid rgba(252,156,45,0.35)`, backgroundColor: 'rgba(252,156,45,0.08)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.orangeAccent, cursor: 'pointer', transition: 'background-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(252,156,45,0.15)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(252,156,45,0.08)')}
              >
                Retire
              </button>
            )}
            <button
              onClick={onClose}
              style={{ width: '1.75rem', height: '1.75rem', borderRadius: radius.full, backgroundColor: colors.closeBtn, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ overflowY: 'auto', padding: `${spacing.lg} ${spacing.xl} ${spacing.xl}`, flex: 1 }}>

          {/* General Info */}
          <SectionLabel>General</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
            <InfoField label="Asset Tag" value={asset.asset_tag} />
            <InfoField label="Serial Number" value={asset.serial_number} />
            <InfoField label="Category" value={asset.category} />
            <InfoField label="Status" value={statusLabel} />
            <InfoField label="Current Holder" value={holder} />
            <InfoField label="Model" value={asset.model} />
          </div>

          {/* Procurement */}
          <SectionLabel style={{ marginTop: spacing.xl }}>Procurement</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
            <InfoField label="Manufacturer" value={asset.manufacturer} />
            <InfoField label="Supplier" value={asset.supplier} />
            <InfoField label="Order Number" value={asset.order_number} />
            <InfoField label="Purchase Date" value={formatDate(asset.purchase_date)} />
            <InfoField label="Purchase Cost" value={formatCurrency(asset.purchase_cost)} />
            <InfoField label="Depreciation" value={formatCurrency(asset.depreciation_value)} />
          </div>

          {/* Lifecycle */}
          <SectionLabel style={{ marginTop: spacing.xl }}>Lifecycle</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
            <InfoField label="Warranty Expiry" value={formatDate(asset.warranty_expiry)} />
            <InfoField label="End of Life" value={formatDate(asset.end_of_life)} />
            <InfoField label="Group" value={asset.group} />
          </div>

          {/* Specs */}
          {(asset.cpu || asset.ram || asset.storage_size || asset.gpu || asset.operating_system || asset.screen_size || asset.imei_number) && (
            <>
              <SectionLabel style={{ marginTop: spacing.xl }}>Specifications</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
                <InfoField label="CPU" value={asset.cpu} />
                <InfoField label="RAM" value={asset.ram} />
                <InfoField label="Storage" value={asset.storage_size} />
                <InfoField label="GPU" value={asset.gpu} />
                <InfoField label="OS" value={asset.operating_system} />
                <InfoField label="Screen Size" value={asset.screen_size} />
                <InfoField label="IMEI" value={asset.imei_number} />
              </div>
            </>
          )}

          {/* Notes */}
          {asset.notes && (
            <>
              <SectionLabel style={{ marginTop: spacing.xl }}>Notes</SectionLabel>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, lineHeight: 1.6, marginTop: spacing.sm, padding: `${spacing.md} ${spacing.lg}`, backgroundColor: colors.bgStripe, borderRadius: radius.md, border: '1px solid rgba(70,98,145,0.08)' }}>
                {asset.notes}
              </p>
            </>
          )}

          {/* Timestamps */}
          <div style={{ display: 'flex', gap: spacing.xl2, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: '1px solid rgba(70,98,145,0.08)' }}>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd }}>
              Created: {formatDate(asset.created_at)}
            </span>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd }}>
              Updated: {formatDate(asset.updated_at)}
            </span>
          </div>
        </div>

        {/* ── Footer actions ── */}
        {footerVisible && (
          <div style={{ flexShrink: 0, borderTop: '1px solid rgba(70,98,145,0.1)', padding: `${spacing.md} ${spacing.xl}` }}>
            {pendingResolve ? (
              /* Inline resolve confirm */
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <CheckCircle2 size={14} color={colors.success} />
                  <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: colors.textSecondary }}>
                    Resolve to{' '}
                    <strong style={{ color: colors.textPrimary }}>{ASSET_STATUS_LABELS[pendingResolve.targetStatus]}</strong>
                  </span>
                </div>
                <textarea
                  value={resolveNotes}
                  onChange={e => setResolveNotes(e.target.value)}
                  placeholder="Optional notes…"
                  rows={2}
                  style={{ width: '100%', resize: 'none', padding: `${spacing.xs} ${spacing.sm}`, borderRadius: radius.md, border: '1px solid rgba(70,98,145,0.2)', backgroundColor: colors.bgSubtle, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: colors.textPrimary, outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <button
                    onClick={() => { setPendingResolve(null); setResolveNotes(''); }}
                    style={{ padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: 'none', backgroundColor: 'transparent', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.blueGrayMd, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onResolve?.(pendingResolve.targetStatus, resolveNotes.trim()); }}
                    style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: 'none', backgroundColor: colors.success, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.white, cursor: 'pointer', transition: 'filter 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                  >
                    <CheckCircle2 size={12} />
                    {pendingResolve.label}
                  </button>
                </div>
              </div>
            ) : (
              /* Normal footer row */
              <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Resolution button — left side */}
                <div>
                  {showResolution && resolutionConfig && (() => {
                    const Icon = resolutionConfig.icon;
                    return (
                      <button
                        onClick={() => setPendingResolve({ targetStatus: resolveTarget, label: resolutionConfig.label })}
                        style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: `1px solid rgba(34,197,94,0.4)`, backgroundColor: 'rgba(34,197,94,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: '#15803d', cursor: 'pointer', transition: 'background-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(34,197,94,0.1)')}
                      >
                        <Icon size={12} />
                        {resolutionConfig.label}
                      </button>
                    );
                  })()}
                </div>

                {/* Status change buttons — right side */}
                <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap', marginLeft: 'auto' }}>
                  {showSetLost && (
                    <button
                      onClick={handleStatus('LOST')}
                      style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: `1px solid ${colors.error}59`, backgroundColor: `${colors.error}14`, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.error, cursor: 'pointer', transition: 'background-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${colors.error}22`)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${colors.error}14`)}
                    >
                      <AlertTriangle size={12} />
                      Set Lost
                    </button>
                  )}
                  {showSetAudit && (
                    <button
                      onClick={handleStatus('TO_AUDIT')}
                      style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: `1px solid rgba(234,179,8,0.4)`, backgroundColor: 'rgba(234,179,8,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: '#a16207', cursor: 'pointer', transition: 'background-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.18)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.1)')}
                    >
                      <ClipboardCheck size={12} />
                      Set to Audit
                    </button>
                  )}
                  {showSetRepair && (
                    <button
                      onClick={handleStatus('IN_REPAIR')}
                      style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: `1px solid rgba(252,156,45,0.35)`, backgroundColor: 'rgba(252,156,45,0.08)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.orangeAccent, cursor: 'pointer', transition: 'background-color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(252,156,45,0.15)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(252,156,45,0.08)')}
                    >
                      <Wrench size={12} />
                      Set to Repair
                    </button>
                  )}
                  {showCheckIn && (
                    <button
                      onClick={handleAction(onCheckIn)}
                      style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: 'none', backgroundColor: colors.orangeAccent, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.white, cursor: 'pointer', transition: 'filter 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.95)')}
                      onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                    >
                      <LogIn size={12} />
                      Check In
                    </button>
                  )}
                  {showCheckOut && (
                    <button
                      onClick={handleAction(onCheckOut)}
                      style={{ display: 'flex', alignItems: 'center', gap: spacing.xs, padding: `0.375rem ${spacing.md}`, borderRadius: radius.md, border: 'none', backgroundColor: colors.success, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.white, cursor: 'pointer', transition: 'filter 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(0.95)')}
                      onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
                    >
                      <LogOut size={12} />
                      Check Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    {onRetire && (
      <RetireModal
        isOpen={retireOpen}
        itemName={asset.asset_tag}
        itemType="Asset"
        onClose={() => setRetireOpen(false)}
        onConfirm={notes => { onRetire(notes); onClose(); }}
      />
    )}
    </>
  );
}

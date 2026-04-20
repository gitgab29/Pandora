import { X, Pencil, Monitor, Laptop, Smartphone, Tablet, Cpu, Package } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';
import { ASSET_STATUS_LABELS } from '../types/asset';

interface AssetDetailModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onEdit: () => void;
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

export default function AssetDetailModal({ isOpen, asset, onClose, onEdit }: AssetDetailModalProps) {
  if (!isOpen || !asset) return null;

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
            <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h6, fontWeight: 700, color: colors.textPrimary, margin: `0 0 ${spacing.xs}` }}>
              {asset.asset_tag}
            </h2>
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
      </div>
    </div>
  );
}

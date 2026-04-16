import { X, Pencil, AlertTriangle } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Accessory } from '../types/inventory';

interface AccessoryDetailModalProps {
  isOpen: boolean;
  item: Accessory | null;
  onClose: () => void;
  onEdit: () => void;
}

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

export default function AccessoryDetailModal({ isOpen, item, onClose, onEdit }: AccessoryDetailModalProps) {
  if (!isOpen || !item) return null;

  const isOutOfStock = item.quantity_available === 0;
  const isLowStock   = !isOutOfStock && item.quantity_available < item.min_quantity;

  const formatDate = (d?: string) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (v?: number) => {
    if (v == null) return null;
    return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalCost = (item.unit_cost != null && item.quantity_available != null)
    ? item.unit_cost * item.quantity_available
    : null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: colors.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: spacing.xl }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: colors.bgSurface, borderRadius: radius.xl, width: '100%', maxWidth: '48rem', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: shadows.modal }}
      >
        {/* ── Header ── */}
        <div style={{ padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`, borderBottom: '1px solid rgba(70,98,145,0.1)', display: 'flex', alignItems: 'flex-start', gap: spacing.lg, flexShrink: 0 }}>
          {/* Thumbnail */}
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.item_name}
              style={{ width: '3.5rem', height: '3.5rem', borderRadius: radius.lg, objectFit: 'cover', border: '2px solid rgba(70,98,145,0.1)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: radius.lg, backgroundColor: 'rgba(46,124,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Roboto', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: colors.primary }}>
              {item.item_name[0]?.toUpperCase() ?? 'A'}
            </div>
          )}

          {/* Title + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h6, fontWeight: 700, color: colors.textPrimary, margin: `0 0 ${spacing.xs}` }}>
              {item.item_name}
            </h2>
            <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, margin: `0 0 ${spacing.sm}` }}>
              {item.model_number ? `Model: ${item.model_number}` : ''} {item.category ? `· ${item.category}` : ''}
            </p>
            <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Qty badge */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: isOutOfStock ? 'rgba(239,68,68,0.1)' : isLowStock ? 'rgba(252,156,45,0.1)' : 'rgba(34,197,94,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: isOutOfStock ? colors.error : isLowStock ? colors.orangeAccent : colors.success, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                {isOutOfStock && <AlertTriangle size={9} />}
                {isLowStock && <AlertTriangle size={9} />}
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : `${item.quantity_available} Available`}
              </span>
              {item.category && (
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: 'rgba(46,124,253,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: colors.primary, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {item.category}
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
            <InfoField label="Item Name" value={item.item_name} />
            <InfoField label="Model Number" value={item.model_number} />
            <InfoField label="Category" value={item.category} />
            <InfoField label="Manufacturer" value={item.manufacturer} />
            <InfoField label="Supplier" value={item.supplier} />
            <InfoField label="Order Number" value={item.order_number} />
          </div>

          {/* Inventory */}
          <SectionLabel style={{ marginTop: spacing.xl }}>Inventory</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
            <InfoField label="Qty Available" value={String(item.quantity_available)} />
            <InfoField label="Min Quantity" value={String(item.min_quantity)} />
            <InfoField label="Location" value={item.location} />
            <InfoField label="Department" value={item.business_group} />
            <InfoField label="Purchase Date" value={formatDate(item.purchase_date)} />
            <InfoField label="Unit Cost" value={formatCurrency(item.unit_cost)} />
          </div>

          {/* Cost Summary */}
          {totalCost != null && (
            <>
              <SectionLabel style={{ marginTop: spacing.xl }}>Cost</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
                <InfoField label="Unit Cost" value={formatCurrency(item.unit_cost)} />
                <InfoField label="Total Value" value={formatCurrency(totalCost)} />
              </div>
            </>
          )}

          {/* Notes */}
          {item.notes && (
            <>
              <SectionLabel style={{ marginTop: spacing.xl }}>Notes</SectionLabel>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, lineHeight: 1.6, marginTop: spacing.sm, padding: `${spacing.md} ${spacing.lg}`, backgroundColor: colors.bgStripe, borderRadius: radius.md, border: '1px solid rgba(70,98,145,0.08)' }}>
                {item.notes}
              </p>
            </>
          )}

          {/* Timestamps */}
          <div style={{ display: 'flex', gap: spacing.xl2, marginTop: spacing.xl, paddingTop: spacing.md, borderTop: '1px solid rgba(70,98,145,0.08)' }}>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd }}>
              Created: {formatDate(item.created_at)}
            </span>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, color: colors.blueGrayMd }}>
              Updated: {formatDate(item.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

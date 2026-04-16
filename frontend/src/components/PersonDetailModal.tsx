import { useState, useEffect } from 'react';
import { X, Pencil, LogIn, Package, PackageMinus, Plus } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows, badgeColors } from '../theme';
import type { Person } from '../types/people';
import type { Asset } from '../types/asset';
import type { TransactionLog } from '../types/activity';
import { ASSET_STATUS_LABELS } from '../types/asset';
import { assetsApi, transactionsApi } from '../api';
import AssetCheckInModal from './AssetCheckInModal';
import AssignAssetToPersonModal from './AssignAssetToPersonModal';
import AssignAccessoryToPersonModal from './AssignAccessoryToPersonModal';

interface PersonDetailModalProps {
  isOpen: boolean;
  person: Person | null;
  allPeople: Person[];
  onClose: () => void;
  onEdit: () => void;
}

// ── Avatar palette ─────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: 'rgba(46,124,253,0.15)',  fg: '#1a5bbf' },
  { bg: 'rgba(139,92,246,0.15)', fg: '#6d28d9' },
  { bg: 'rgba(34,197,94,0.15)',  fg: '#15803d' },
  { bg: 'rgba(252,156,45,0.15)', fg: '#b45309' },
  { bg: 'rgba(45,252,249,0.15)', fg: '#0891b2' },
  { bg: 'rgba(239,68,68,0.15)',  fg: '#b91c1c' },
];

function getAvatarColor(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

const ROLE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN: { bg: 'rgba(46,124,253,0.12)', text: colors.primary,    label: 'Admin' },
  STAFF: { bg: 'rgba(70,98,145,0.10)',  text: colors.blueGrayMd, label: 'Staff' },
};

const ASSET_STATUS_COLORS: Record<string, string> = {
  'AVAILABLE':      colors.success,
  'DEPLOYED':       colors.primary,
  'IN_REPAIR':      colors.orangeAccent,
  'IN_MAINTENANCE': colors.grayMed,
  'TO_AUDIT':       '#eab308',
  'LOST':           colors.error,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

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

function assetTD(extra?: React.CSSProperties): React.CSSProperties {
  return { padding: '0.5625rem 0.875rem', fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', color: colors.textPrimary, borderBottom: '1px solid rgba(70,98,145,0.07)', whiteSpace: 'nowrap', ...extra };
}

function actionPillStyle(bg: string): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.2rem 0.625rem`, borderRadius: radius.full, border: 'none', backgroundColor: bg, fontFamily: "'Archivo', sans-serif", fontSize: '0.6875rem', fontWeight: 700, color: colors.white, cursor: 'pointer', whiteSpace: 'nowrap' };
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PersonDetailModal({ isOpen, person, allPeople, onClose, onEdit }: PersonDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'Assets' | 'Accessories'>('Assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accessoryTxns, setAccessoryTxns] = useState<TransactionLog[]>([]);
  const [checkInTarget, setCheckInTarget] = useState<Asset | null>(null);
  const [assignAssetOpen, setAssignAssetOpen] = useState(false);
  const [assignAccessoryOpen, setAssignAccessoryOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !person) return;
    assetsApi.list({ assigned_to: person.id }).then(setAssets).catch(() => {});
    transactionsApi.list({ to_user: person.id, transaction_type: 'CHECK_OUT' })
      .then(logs => setAccessoryTxns(logs.filter(l => l.accessory_detail !== null)))
      .catch(() => {});
  }, [isOpen, person]);

  if (!isOpen || !person) return null;

  const avatarColor = getAvatarColor(person.id);
  const initials    = `${person.first_name[0]}${person.last_name[0]}`.toUpperCase();
  const displayName = `${person.last_name}, ${person.first_name}`;
  const roleBadge   = ROLE_BADGE[person.role] ?? ROLE_BADGE.STAFF;

  const supervisor = person.supervisor ? allPeople.find(p => p.id === person.supervisor) : null;
  const supervisorLabel = supervisor ? `${supervisor.last_name}, ${supervisor.first_name}` : null;

  const memberSince = new Date(person.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleCheckIn = (assetId: string, notes: string) => {
    assetsApi.checkIn(assetId, notes)
      .then(() => setAssets(prev => prev.filter(a => a.id !== assetId)))
      .catch(() => {});
  };

  const handleAssetAssigned = (newAsset: Asset) => {
    setAssets(prev => [...prev, newAsset]);
  };

  const handleAccessoryAssigned = () => {
    if (!person) return;
    transactionsApi.list({ to_user: person.id, transaction_type: 'CHECK_OUT' })
      .then(logs => setAccessoryTxns(logs.filter(l => l.accessory_detail !== null)))
      .catch(() => {});
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
          {/* ── Hero header ── */}
          <div style={{ padding: `${spacing.xl} ${spacing.xl} ${spacing.lg}`, borderBottom: '1px solid rgba(70,98,145,0.1)', display: 'flex', alignItems: 'flex-start', gap: spacing.lg, flexShrink: 0 }}>
            {/* Avatar */}
            {person.image_url ? (
              <img
                src={person.image_url}
                alt={initials}
                style={{ width: '3.5rem', height: '3.5rem', borderRadius: radius.full, objectFit: 'cover', border: '2px solid rgba(70,98,145,0.1)', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: radius.full, backgroundColor: avatarColor.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: avatarColor.fg, letterSpacing: '0.02em' }}>{initials}</span>
              </div>
            )}

            {/* Name + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.h6, fontWeight: 700, color: colors.textPrimary, margin: `0 0 ${spacing.xs}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </h2>
              <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, margin: `0 0 ${spacing.sm}` }}>
                {person.email}
              </p>
              <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: roleBadge.bg, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: roleBadge.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {roleBadge.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: badgeColors.checkIn.bg, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: badgeColors.checkIn.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  <span style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: colors.success, display: 'inline-block' }} />
                  Active
                </span>
                {assets.length > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: `0.15rem ${spacing.sm}`, borderRadius: radius.full, backgroundColor: badgeColors.asset.bg, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.micro, fontWeight: 700, color: badgeColors.asset.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                    <Package size={9} />
                    {assets.length} asset{assets.length !== 1 ? 's' : ''}
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

          {/* ── Scrollable body ── */}
          <div style={{ overflowY: 'auto', padding: `${spacing.lg} ${spacing.xl} ${spacing.xl}`, flex: 1 }}>

            {/* Profile section */}
            <SectionLabel>Profile</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: `${spacing.lg} ${spacing.xl2}`, marginTop: spacing.md }}>
              <InfoField label="Position"       value={person.title || null} />
              <InfoField label="Business Group" value={person.business_group || null} />
              <InfoField label="Supervisor"     value={supervisorLabel} />
              <InfoField label="Location"       value={person.location || null} />
              <InfoField label="Badge Number"   value={person.badge_number || null} />
              <InfoField label="Member Since"   value={memberSince} />
            </div>

            {person.notes && (
              <>
                <SectionLabel style={{ marginTop: spacing.xl }}>Notes</SectionLabel>
                <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, lineHeight: 1.6, marginTop: spacing.sm, padding: `${spacing.md} ${spacing.lg}`, backgroundColor: colors.bgStripe, borderRadius: radius.md, border: '1px solid rgba(70,98,145,0.08)' }}>
                  {person.notes}
                </p>
              </>
            )}

            {/* ── Subtabs ── */}
            <div style={{ marginTop: spacing.xl }}>
              {/* Tab bar + action button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(70,98,145,0.12)', marginBottom: spacing.md }}>
                <div style={{ display: 'flex' }}>
                  {(['Assets', 'Accessories'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        border: 'none',
                        borderBottom: `2px solid ${activeTab === tab ? colors.primary : 'transparent'}`,
                        backgroundColor: 'transparent',
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: activeTab === tab ? 700 : 500,
                        color: activeTab === tab ? colors.primary : colors.blueGrayMd,
                        cursor: 'pointer',
                        marginBottom: '-1px',
                        transition: 'color 0.15s, border-color 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing.xs,
                      }}
                    >
                      {tab}
                      {tab === 'Assets' && assets.length > 0 && (
                        <span style={{ display: 'inline-block', padding: '0.1rem 0.4rem', borderRadius: radius.full, backgroundColor: activeTab === 'Assets' ? 'rgba(46,124,253,0.12)' : 'rgba(70,98,145,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: '0.65rem', fontWeight: 700, color: activeTab === 'Assets' ? colors.primary : colors.blueGrayMd }}>
                          {assets.length}
                        </span>
                      )}
                      {tab === 'Accessories' && accessoryTxns.length > 0 && (
                        <span style={{ display: 'inline-block', padding: '0.1rem 0.4rem', borderRadius: radius.full, backgroundColor: activeTab === 'Accessories' ? 'rgba(46,124,253,0.12)' : 'rgba(70,98,145,0.1)', fontFamily: "'Archivo', sans-serif", fontSize: '0.65rem', fontWeight: 700, color: activeTab === 'Accessories' ? colors.primary : colors.blueGrayMd }}>
                          {accessoryTxns.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Assign button */}
                <button
                  onClick={() => activeTab === 'Assets' ? setAssignAssetOpen(true) : setAssignAccessoryOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.3rem ${spacing.md}`, borderRadius: radius.md, border: 'none', backgroundColor: colors.primary, fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, fontWeight: 600, color: colors.white, cursor: 'pointer' }}
                >
                  <Plus size={12} />
                  {activeTab === 'Assets' ? 'Assign Asset' : 'Check Out Accessory'}
                </button>
              </div>

              {/* ── Assets tab ── */}
              {activeTab === 'Assets' && (
                assets.length === 0 ? (
                  <div style={{ padding: `${spacing.xl} ${spacing.lg}`, textAlign: 'center', borderRadius: radius.md, border: '1px dashed rgba(70,98,145,0.2)', backgroundColor: colors.bgStripe }}>
                    <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, margin: 0 }}>
                      No assets currently assigned to this person.
                    </p>
                  </div>
                ) : (
                  <div style={{ borderRadius: radius.md, border: '1px solid rgba(70,98,145,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Asset Tag', 'Category', 'Serial Number', 'Status', 'Action'].map((h, i) => (
                            <th key={h} style={{ padding: '0.5rem 0.875rem', fontFamily: "'Archivo', sans-serif", fontSize: '0.69rem', fontWeight: 600, color: colors.blueGrayMd, textAlign: i === 4 ? 'right' : 'left', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid rgba(70,98,145,0.12)', backgroundColor: colors.bgStripe, whiteSpace: 'nowrap' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset, idx) => {
                          const dotColor = ASSET_STATUS_COLORS[asset.status] ?? colors.grayMed;
                          return (
                            <tr key={asset.id} style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe }}>
                              <td style={assetTD({ fontWeight: 500 })}>{asset.asset_tag}</td>
                              <td style={assetTD()}>{asset.category}</td>
                              <td style={assetTD({ fontFamily: "'Roboto Mono', monospace", fontSize: '0.75rem', color: colors.blueGrayMd })}>{asset.serial_number}</td>
                              <td style={assetTD()}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
                                  {ASSET_STATUS_LABELS[asset.status] ?? asset.status}
                                </span>
                              </td>
                              <td style={assetTD({ textAlign: 'right' })}>
                                <button onClick={() => setCheckInTarget(asset)} style={actionPillStyle(colors.orangeAccent)}>
                                  <LogIn size={10} />
                                  Check In
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* ── Accessories tab ── */}
              {activeTab === 'Accessories' && (
                accessoryTxns.length === 0 ? (
                  <div style={{ padding: `${spacing.xl} ${spacing.lg}`, textAlign: 'center', borderRadius: radius.md, border: '1px dashed rgba(70,98,145,0.2)', backgroundColor: colors.bgStripe }}>
                    <p style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.sm, color: colors.blueGrayMd, margin: 0 }}>
                      No accessory checkouts recorded for this person.
                    </p>
                  </div>
                ) : (
                  <div style={{ borderRadius: radius.md, border: '1px solid rgba(70,98,145,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Item', 'Qty', 'Date', 'Notes'].map((h, i) => (
                            <th key={h} style={{ padding: '0.5rem 0.875rem', fontFamily: "'Archivo', sans-serif", fontSize: '0.69rem', fontWeight: 600, color: colors.blueGrayMd, textAlign: 'left', letterSpacing: '0.04em', textTransform: 'uppercase', borderBottom: '1px solid rgba(70,98,145,0.12)', backgroundColor: colors.bgStripe, whiteSpace: 'nowrap' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {accessoryTxns.map((txn, idx) => (
                          <tr key={txn.id} style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe }}>
                            <td style={assetTD({ fontWeight: 500 })}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <PackageMinus size={12} color={colors.orangeAccent} />
                                {txn.accessory_detail?.item_name ?? '—'}
                              </span>
                            </td>
                            <td style={assetTD()}>
                              <span style={{ fontWeight: 700, color: colors.primary }}>{txn.quantity}</span>
                            </td>
                            <td style={assetTD({ color: colors.blueGrayMd, fontSize: '0.75rem' })}>
                              {new Date(txn.transaction_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td style={assetTD({ color: colors.blueGrayMd, maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis' })}>
                              {txn.notes || txn.event_description || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Check-in asset */}
      <AssetCheckInModal
        isOpen={checkInTarget !== null}
        asset={checkInTarget}
        onClose={() => setCheckInTarget(null)}
        onConfirm={handleCheckIn}
      />

      {/* Assign asset to person */}
      <AssignAssetToPersonModal
        isOpen={assignAssetOpen}
        person={person}
        onClose={() => setAssignAssetOpen(false)}
        onAssigned={handleAssetAssigned}
      />

      {/* Assign accessory to person */}
      <AssignAccessoryToPersonModal
        isOpen={assignAccessoryOpen}
        person={person}
        onClose={() => setAssignAccessoryOpen(false)}
        onAssigned={handleAccessoryAssigned}
      />
    </>
  );
}

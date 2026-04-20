import { useState, useMemo, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import StatisticCard from './StatisticCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import AssetDetailModal from './AssetDetailModal';
import RestoreConfirmModal from './RestoreConfirmModal';
import HardDeleteConfirmModal from './HardDeleteConfirmModal';
import { colors, spacing, radius, statusColors } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';
import { assetsApi } from '../api';

type ArchiveTab = 'All' | 'Deleted' | 'Retired';

const ARCHIVE_TABS: ArchiveTab[] = ['All', 'Deleted', 'Retired'];
const ROWS_PER_PAGE = 10;

const STATUS_CONFIG: Record<AssetStatus, { dot: string; label: string }> = {
  AVAILABLE:      { dot: colors.success,      label: 'Available' },
  DEPLOYED:       { dot: colors.primary,      label: 'Deployed' },
  IN_REPAIR:      { dot: colors.orangeAccent, label: 'In Repair' },
  IN_MAINTENANCE: { dot: statusColors.retired, label: 'In Maintenance' },
  LOST:           { dot: colors.error,        label: 'Lost' },
  TO_AUDIT:       { dot: statusColors.toAudit, label: 'To Audit' },
};

const TH: React.CSSProperties = {
  padding: '0.625rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.719rem',
  fontWeight: 600,
  color: colors.blueGrayMd,
  textAlign: 'left',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid rgba(70, 98, 145, 0.12)',
  backgroundColor: colors.bgStripe,
};

const TD: React.CSSProperties = {
  padding: '0.6875rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.8125rem',
  color: colors.textPrimary,
  borderBottom: '1px solid rgba(70, 98, 145, 0.07)',
  whiteSpace: 'nowrap',
};

const iconBtnStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.625rem',
  height: '1.625rem',
  borderRadius: radius.sm,
  border: `1px solid ${color}22`,
  backgroundColor: `${color}10`,
  color,
  cursor: 'pointer',
  padding: 0,
  transition: 'background-color 0.15s',
});

export default function ArchiveAssetsTabContent() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailTarget,    setDetailTarget]    = useState<Asset | null>(null);
  const [restoreTarget,   setRestoreTarget]   = useState<Asset | null>(null);
  const [hardDelTarget,   setHardDelTarget]   = useState<Asset | null>(null);

  useEffect(() => {
    assetsApi.list({ archived_only: 1 }).then(setAssets).catch(() => {});
  }, []);

  const statCards = useMemo(() => [
    { title: 'Total Archived', value: assets.length },
    { title: 'Deleted',        value: assets.filter(a => a.archive_reason === 'DELETED').length },
    { title: 'Retired',        value: assets.filter(a => a.archive_reason === 'RETIRED').length },
  ], [assets]);

  const filtered = useMemo(() => {
    let items = assets;
    if (activeTab === 'Deleted') items = items.filter(a => a.archive_reason === 'DELETED');
    if (activeTab === 'Retired') items = items.filter(a => a.archive_reason === 'RETIRED');
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(a =>
        a.asset_tag.toLowerCase().includes(q) ||
        (a.model ?? '').toLowerCase().includes(q) ||
        (a.manufacturer ?? '').toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
      );
    }
    return items;
  }, [assets, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    assetsApi.restore(restoreTarget.id)
      .then(() => setAssets(prev => prev.filter(a => a.id !== restoreTarget.id)))
      .catch(() => {});
    setRestoreTarget(null);
  };

  const handleHardDelete = () => {
    if (!hardDelTarget) return;
    assetsApi.hardDelete(hardDelTarget.id)
      .then(() => setAssets(prev => prev.filter(a => a.id !== hardDelTarget.id)))
      .catch(() => {});
    setHardDelTarget(null);
  };

  return (
    <>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: spacing.lg, marginBottom: spacing.xl2, flexWrap: 'wrap' }}>
        {statCards.map(c => <StatisticCard key={c.title} title={c.title} value={c.value} />)}
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: colors.bgSurface, borderRadius: radius.lg, border: '1px solid rgba(70,98,145,0.1)', boxShadow: '0 1px 4px rgba(3,12,35,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderBottom: '1px solid rgba(70,98,145,0.08)', display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary, marginRight: spacing.sm, whiteSpace: 'nowrap' }}>
              Archived Assets
            </span>
            <div style={{ display: 'flex', gap: spacing.xs }}>
              {ARCHIVE_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  style={{
                    padding: `0.25rem ${spacing.md}`,
                    borderRadius: radius.full,
                    border: activeTab === tab ? 'none' : '1px solid rgba(70,98,145,0.25)',
                    backgroundColor: activeTab === tab
                      ? tab === 'Deleted' ? colors.error : tab === 'Retired' ? colors.orangeAccent : colors.primary
                      : 'transparent',
                    color: activeTab === tab ? colors.white : colors.blueGrayMd,
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <SearchBar value={search} onChange={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search assets…" />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Asset Tag</th>
                <th style={TH}>Item Name</th>
                <th style={TH}>Category</th>
                <th style={TH}>Status</th>
                <th style={TH}>Reason</th>
                <th style={TH}>Archived</th>
                <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...TD, textAlign: 'center', color: colors.blueGrayMd, padding: `${spacing.xl3} ${spacing.md}` }}>
                    No archived assets found.
                  </td>
                </tr>
              ) : pageItems.map((asset, idx) => {
                const sc = STATUS_CONFIG[asset.status as AssetStatus];
                const itemName = [asset.manufacturer, asset.model].filter(Boolean).join(' ') || '—';
                return (
                  <tr
                    key={asset.id}
                    onClick={() => setDetailTarget(asset)}
                    style={{
                      backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                      cursor: 'pointer',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,124,253,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe)}
                  >
                    <td style={{ ...TD, fontFamily: "'Roboto Mono', monospace", fontSize: '0.75rem', color: colors.blueGrayMd }}>{asset.asset_tag}</td>
                    <td style={{ ...TD, fontWeight: 500, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itemName}</td>
                    <td style={TD}>{asset.category}</td>
                    <td style={TD}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: '50%', backgroundColor: sc?.dot ?? colors.grayMed, display: 'inline-block', flexShrink: 0 }} />
                        {sc?.label ?? asset.status}
                      </span>
                    </td>
                    <td style={TD}>
                      <span style={{
                        display: 'inline-block',
                        padding: `0.125rem ${spacing.sm}`,
                        borderRadius: '0.25rem',
                        backgroundColor: asset.archive_reason === 'RETIRED' ? 'rgba(252,156,45,0.1)' : 'rgba(239,68,68,0.1)',
                        color: asset.archive_reason === 'RETIRED' ? colors.orangeAccent : colors.error,
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {asset.archive_reason === 'RETIRED' ? 'Retired' : 'Deleted'}
                      </span>
                    </td>
                    <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>{formatDate(asset.archived_at)}</td>
                    <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                        <button title="Restore" style={iconBtnStyle(colors.success)} onClick={() => setRestoreTarget(asset)}>
                          <RotateCcw size={11} />
                        </button>
                        <button title="Delete permanently" style={iconBtnStyle(colors.error)} onClick={() => setHardDelTarget(asset)}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderTop: '1px solid rgba(70,98,145,0.08)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      <AssetDetailModal
        isOpen={!!detailTarget}
        asset={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={() => {}}
      />
      <RestoreConfirmModal
        isOpen={!!restoreTarget}
        itemName={restoreTarget?.asset_tag ?? ''}
        itemType="Asset"
        destination="Inventory"
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
      />
      <HardDeleteConfirmModal
        isOpen={!!hardDelTarget}
        itemName={hardDelTarget?.asset_tag ?? ''}
        itemType="Asset"
        onClose={() => setHardDelTarget(null)}
        onConfirm={handleHardDelete}
      />
    </>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { Trash2, Pencil, Copy, Plus, Download, Filter, Eye, EyeOff } from 'lucide-react';
import StatisticCard from './StatisticCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import SortDropdown from './SortDropdown';
import FeatureNotAvailableModal from './FeatureNotAvailableModal';
import AddAssetModal from './AddAssetModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditAssetModal from './EditAssetModal';
import CopyAssetModal from './CopyAssetModal';
import AssetCheckOutModal from './AssetCheckOutModal';
import AssetCheckInModal from './AssetCheckInModal';
import { colors, spacing, radius, statusColors } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';
import { assetsApi } from '../api';


const STAT_CARDS = [
  { title: 'Available', value: 56, trend: { value: 66, direction: 'up' as const } },
  { title: 'Deployed',  value: 18, trend: { value: 66, direction: 'down' as const } },
  { title: 'To Audit',  value: 4 },
];

const STATUS_CONFIG: Record<AssetStatus, { dot: string; label: string }> = {
  'AVAILABLE':      { dot: colors.success,      label: 'Available' },
  'DEPLOYED':       { dot: colors.primary,      label: 'Deployed' },
  'IN_REPAIR':      { dot: colors.orangeAccent, label: 'In Repair' },
  'IN_MAINTENANCE': { dot: statusColors.retired, label: 'In Maintenance' },
  'LOST':           { dot: colors.error,        label: 'Lost' },
  'TO_AUDIT':       { dot: statusColors.toAudit, label: 'To Audit' },
};

const FILTER_TABS: Array<AssetStatus | 'All'> = [
  'All', 'AVAILABLE', 'DEPLOYED', 'IN_REPAIR', 'TO_AUDIT', 'LOST',
];

const SORT_OPTIONS = ['Tag (A–Z)', 'Tag (Z–A)', 'Date Added (Newest)', 'Date Added (Oldest)', 'Status'];

const ROWS_PER_PAGE = 10;

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

export default function AssetsTabContent() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    assetsApi.list().then(setAssets).catch(() => {});
  }, []);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AssetStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState('Tag (A–Z)');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [deleteTarget,   setDeleteTarget]   = useState<Asset | null>(null);
  const [editTarget,     setEditTarget]     = useState<Asset | null>(null);
  const [copyTarget,     setCopyTarget]     = useState<Asset | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<Asset | null>(null);
  const [checkInTarget,  setCheckInTarget]  = useState<Asset | null>(null);

  const allCategories = useMemo(
    () => [...new Set(assets.map(a => a.category))].sort(),
    [assets],
  );

  const filtered = useMemo(() => {
    let items = assets;
    if (activeTab !== 'All') items = items.filter(a => a.status === activeTab);
    if (activeCategories.length > 0) items = items.filter(a => activeCategories.includes(a.category));
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(a => {
        const holder = a.assigned_to_detail
          ? `${a.assigned_to_detail.first_name} ${a.assigned_to_detail.last_name}`
          : '';
        return (
          a.asset_tag.toLowerCase().includes(q) ||
          a.serial_number.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          holder.toLowerCase().includes(q)
        );
      });
    }
    const sorted = [...items];
    if (activeSort === 'Tag (A–Z)')              sorted.sort((a, b) => a.asset_tag.localeCompare(b.asset_tag));
    else if (activeSort === 'Tag (Z–A)')          sorted.sort((a, b) => b.asset_tag.localeCompare(a.asset_tag));
    else if (activeSort === 'Date Added (Newest)') sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (activeSort === 'Date Added (Oldest)') sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    else if (activeSort === 'Status')              sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  }, [assets, search, activeTab, activeCategories, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleTabChange = (tab: AssetStatus | 'All') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const allPageSelected = pageItems.length > 0 && pageItems.every(a => selectedIds.has(a.id));
  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach(a => next.delete(a.id));
      else pageItems.forEach(a => next.add(a.id));
      return next;
    });
  };
  const toggleRow = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const closeDropdowns = () => { setFilterOpen(false); setSortOpen(false); };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setAssets(prev => prev.filter(a => a.id !== deleteTarget.id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
    setDeleteTarget(null);
  };

  const handleSaveEdit = (updated: Asset) => {
    setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleSaveCopy = (data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    const today = new Date().toISOString().split('T')[0];
    setAssets(prev => [...prev, { ...data, id: newId, created_at: today, updated_at: today }]);
  };

  const handleCheckOut = (assetId: string, assignedTo: string, _notes: string) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, status: 'DEPLOYED', assigned_to: assignedTo, updated_at: new Date().toISOString().split('T')[0] } : a,
    ));
  };

  const handleCheckIn = (assetId: string, _notes: string) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, status: 'AVAILABLE', assigned_to: null, updated_at: new Date().toISOString().split('T')[0] } : a,
    ));
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showStats ? spacing.md : spacing.xl2 }}>
        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: colors.blueGrayMd, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Statistics
        </span>
        <button
          onClick={() => setShowStats(s => !s)}
          title={showStats ? 'Hide statistics' : 'Show statistics'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.625rem',
            borderRadius: radius.full,
            border: '1px solid rgba(70,98,145,0.2)',
            backgroundColor: 'transparent',
            color: colors.blueGrayMd,
            fontFamily: "'Archivo', sans-serif",
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(70,98,145,0.07)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {showStats ? <EyeOff size={12} /> : <Eye size={12} />}
          {showStats ? 'Hide' : 'Show'}
        </button>
      </div>
      {showStats && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl2 }}>
          {STAT_CARDS.map(card => (
            <StatisticCard key={card.title} title={card.title} value={card.value} trend={card.trend} />
          ))}
        </div>
      )}

      <div
        style={{
          backgroundColor: colors.bgSurface,
          borderRadius: radius.lg,
          border: '1px solid rgba(70, 98, 145, 0.1)',
          boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: `${spacing.md} ${spacing.xl}`,
            borderBottom: '1px solid rgba(70, 98, 145, 0.1)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: spacing.md,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: colors.textPrimary,
                marginRight: spacing.sm,
                whiteSpace: 'nowrap',
              }}
            >
              Assets
            </span>
            <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  style={{
                    padding: `0.25rem ${spacing.md}`,
                    borderRadius: radius.full,
                    border: activeTab === tab ? 'none' : '1px solid rgba(70,98,145,0.25)',
                    backgroundColor: activeTab === tab ? colors.primary : 'transparent',
                    color: activeTab === tab ? colors.white : colors.blueGrayMd,
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                >
                  {tab === 'All' ? 'All Assets' : STATUS_CONFIG[tab].label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <SearchBar value={search} onChange={handleSearch} placeholder="Hint: search text" />
            <CategoryFilterDropdown
              open={filterOpen}
              onToggle={() => { setFilterOpen(o => !o); setSortOpen(false); }}
              categories={allCategories}
              active={activeCategories}
              onToggleCategory={(cat) => {
                setActiveCategories(prev =>
                  prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                );
                setCurrentPage(1);
              }}
            />
            <SortDropdown
              open={sortOpen}
              onToggle={() => { setSortOpen(o => !o); setFilterOpen(false); }}
              options={SORT_OPTIONS}
              activeSort={activeSort}
              onSortChange={(opt) => { setActiveSort(opt); setSortOpen(false); setCurrentPage(1); }}
            />
            <button
              onClick={() => setFeatureModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing.xs,
                padding: `0.375rem ${spacing.md}`,
                borderRadius: radius.md,
                border: '1px solid rgba(70,98,145,0.25)',
                backgroundColor: colors.bgSurface,
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: colors.blueGrayMd,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: spacing.xs,
                padding: `0.375rem ${spacing.md}`,
                borderRadius: radius.md,
                border: 'none',
                backgroundColor: colors.primary,
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: colors.white,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={13} />
              New
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: '2.5rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: colors.primary }}
                  />
                </th>
                <th style={{ ...TH, width: '3.25rem', padding: '0.625rem 0.5rem' }} />
                <th style={TH}>Asset Tag</th>
                <th style={TH}>Serial Number</th>
                <th style={TH}>Category</th>
                <th style={TH}>Current Holder</th>
                <th style={TH}>Status</th>
                <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      ...TD,
                      textAlign: 'center',
                      color: colors.blueGrayMd,
                      padding: `${spacing.xl3} ${spacing.md}`,
                    }}
                  >
                    No assets match your search.
                  </td>
                </tr>
              ) : (
                pageItems.map((asset, idx) => {
                  const statusCfg = STATUS_CONFIG[asset.status] ?? { dot: colors.blueGrayMd, label: asset.status };
                  const isAvailable = asset.status === 'AVAILABLE';
                  const isDeployed  = asset.status === 'DEPLOYED';
                  const pillVisible = isAvailable || isDeployed;
                  return (
                    <tr
                      key={asset.id}
                      style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe }}
                    >
                      <td style={{ ...TD, textAlign: 'center', width: '2.5rem' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(asset.id)}
                          onChange={() => toggleRow(asset.id)}
                          style={{ cursor: 'pointer', accentColor: colors.primary }}
                        />
                      </td>

                      <td style={{ ...TD, width: '3.25rem', padding: '0.5rem 0.5rem' }}>
                        <img
                          src={`https://picsum.photos/seed/asset-${asset.id}/32/32`}
                          alt=""
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: radius.sm,
                            border: '1px solid rgba(70,98,145,0.1)',
                            display: 'block',
                          }}
                        />
                      </td>

                      <td style={{ ...TD, fontWeight: 500 }}>{asset.asset_tag}</td>

                      <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem', fontFamily: "'Roboto Mono', monospace" }}>
                        {asset.serial_number}
                      </td>

                      <td style={TD}>{asset.category}</td>

                      <td style={{ ...TD, color: asset.assigned_to_detail ? colors.textPrimary : colors.blueGrayMd }}>
                        {asset.assigned_to_detail
                          ? `${asset.assigned_to_detail.first_name} ${asset.assigned_to_detail.last_name}`
                          : '—'}
                      </td>

                      <td style={TD}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span
                            style={{
                              width: '0.5rem', height: '0.5rem',
                              borderRadius: '50%',
                              backgroundColor: statusCfg.dot,
                              display: 'inline-block',
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: '0.8125rem', color: colors.textPrimary }}>
                            {statusCfg.label}
                          </span>
                        </span>
                      </td>

                      <td style={{ ...TD, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                          <button
                            onClick={() => setDeleteTarget(asset)}
                            title="Delete"
                            style={iconBtnStyle(colors.error)}
                          >
                            <Trash2 size={11} />
                          </button>

                          <button
                            onClick={() => setCopyTarget(asset)}
                            title="Copy Item"
                            style={iconBtnStyle(colors.primary)}
                          >
                            <Copy size={11} />
                          </button>

                          <button
                            onClick={() => setEditTarget(asset)}
                            title="Edit"
                            style={iconBtnStyle(colors.blueGrayMd)}
                          >
                            <Pencil size={11} />
                          </button>

                          <button
                            onClick={
                              isAvailable ? () => setCheckOutTarget(asset)
                              : isDeployed  ? () => setCheckInTarget(asset)
                              : undefined
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '5.5rem',
                              padding: `0.2rem 0`,
                              borderRadius: radius.full,
                              border: 'none',
                              backgroundColor: isAvailable ? colors.success : colors.orangeAccent,
                              color: colors.white,
                              fontFamily: "'Archivo', sans-serif",
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              cursor: pillVisible ? 'pointer' : 'default',
                              whiteSpace: 'nowrap',
                              visibility: pillVisible ? 'visible' : 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            {isAvailable ? 'Check Out' : 'Check In'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: `0 ${spacing.xl} ${spacing.sm}`, borderTop: '1px solid rgba(70, 98, 145, 0.07)' }}>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <FeatureNotAvailableModal isOpen={featureModalOpen} onClose={() => setFeatureModalOpen(false)} />
      <AddAssetModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        itemName={deleteTarget?.asset_tag ?? ''}
        itemType="Asset"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <EditAssetModal
        isOpen={editTarget !== null}
        asset={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <CopyAssetModal
        isOpen={copyTarget !== null}
        asset={copyTarget}
        onClose={() => setCopyTarget(null)}
        onSave={handleSaveCopy}
      />

      <AssetCheckOutModal
        isOpen={checkOutTarget !== null}
        asset={checkOutTarget}
        onClose={() => setCheckOutTarget(null)}
        onConfirm={handleCheckOut}
      />

      <AssetCheckInModal
        isOpen={checkInTarget !== null}
        asset={checkInTarget}
        onClose={() => setCheckInTarget(null)}
        onConfirm={handleCheckIn}
      />

      {(filterOpen || sortOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={closeDropdowns}
        />
      )}
    </>
  );
}

function iconBtnStyle(bg: string): React.CSSProperties {
  return {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: radius.sm,
    border: 'none',
    backgroundColor: bg,
    color: colors.white,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  };
}

function CategoryFilterDropdown({
  open,
  onToggle,
  categories,
  active,
  onToggleCategory,
}: {
  open: boolean;
  onToggle: () => void;
  categories: string[];
  active: string[];
  onToggleCategory: (cat: string) => void;
}) {
  const hasActive = active.length > 0;
  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={onToggle}
        title="Filter by category"
        style={{
          width: '2.125rem',
          height: '2.125rem',
          borderRadius: radius.md,
          border: `1px solid ${open || hasActive ? colors.primary : 'rgba(70, 98, 145, 0.2)'}`,
          backgroundColor: open || hasActive ? 'rgba(46,124,253,0.06)' : colors.bgSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: open || hasActive ? colors.primary : colors.blueGrayMd,
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }}
      >
        <Filter size={15} />
        {hasActive && (
          <span
            style={{
              position: 'absolute',
              top: '0.2rem',
              right: '0.2rem',
              width: '0.4rem',
              height: '0.4rem',
              borderRadius: '50%',
              backgroundColor: colors.primary,
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: 0,
            minWidth: '13rem',
            backgroundColor: colors.bgSurface,
            borderRadius: radius.lg,
            border: '1px solid rgba(70,98,145,0.14)',
            boxShadow: '0 0.5rem 2rem rgba(3,12,35,0.12)',
            padding: spacing.md,
            zIndex: 100,
          }}
        >
          <p
            style={{
              margin: `0 0 ${spacing.sm}`,
              fontFamily: "'Roboto', sans-serif",
              fontSize: '0.719rem',
              fontWeight: 700,
              color: colors.blueGrayMd,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
            }}
          >
            Category
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
            {categories.map(cat => {
              const isActive = active.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  style={{
                    padding: `0.2rem ${spacing.sm}`,
                    borderRadius: radius.full,
                    border: `1px solid ${isActive ? colors.primary : 'rgba(70,98,145,0.25)'}`,
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    color: isActive ? colors.white : colors.blueGrayMd,
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'background-color 0.15s, color 0.15s',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


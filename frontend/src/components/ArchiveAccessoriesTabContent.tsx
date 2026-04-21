import { useState, useMemo, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import StatisticCard from './StatisticCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import AccessoryDetailModal from './AccessoryDetailModal';
import RestoreConfirmModal from './RestoreConfirmModal';
import HardDeleteConfirmModal from './HardDeleteConfirmModal';
import BulkHardDeleteModal from './BulkHardDeleteModal';
import { colors, spacing, radius } from '../theme';
import type { Accessory } from '../types/inventory';
import { accessoriesApi } from '../api';

type ArchiveTab = 'All' | 'Deleted' | 'Retired';
const ARCHIVE_TABS: ArchiveTab[] = ['All', 'Deleted', 'Retired'];
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

export default function ArchiveAccessoriesTabContent() {
  const [items, setItems]       = useState<Accessory[]>([]);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('All');
  const [search, setSearch]     = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTarget,  setDetailTarget]  = useState<Accessory | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Accessory | null>(null);
  const [hardDelTarget, setHardDelTarget] = useState<Accessory | null>(null);

  const [selectedIds,     setSelectedIds]     = useState<Set<string>>(new Set());
  const [bulkRestoreOpen, setBulkRestoreOpen] = useState(false);
  const [bulkHardDelOpen, setBulkHardDelOpen] = useState(false);

  useEffect(() => {
    accessoriesApi.list({ archived_only: 1 }).then(setItems).catch(() => {});
  }, []);

  const statCards = useMemo(() => [
    { title: 'Total Archived', value: items.length },
    { title: 'Deleted',        value: items.filter(i => i.archive_reason === 'DELETED').length },
    { title: 'Retired',        value: items.filter(i => i.archive_reason === 'RETIRED').length },
  ], [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (activeTab === 'Deleted') list = list.filter(i => i.archive_reason === 'DELETED');
    if (activeTab === 'Retired') list = list.filter(i => i.archive_reason === 'RETIRED');
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(i =>
      i.item_name.toLowerCase().includes(q) ||
      (i.model_number ?? '').toLowerCase().includes(q) ||
      (i.manufacturer ?? '').toLowerCase().includes(q) ||
      (i.category ?? '').toLowerCase().includes(q),
    );
    return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [items, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const pageIds         = pageItems.map(i => i.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const somePageSelected = pageIds.some(id => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    accessoriesApi.restore(restoreTarget.id)
      .then(() => setItems(prev => prev.filter(i => i.id !== restoreTarget.id)))
      .catch(() => {});
    setRestoreTarget(null);
  };

  const handleHardDelete = () => {
    if (!hardDelTarget) return;
    accessoriesApi.hardDelete(hardDelTarget.id)
      .then(() => setItems(prev => prev.filter(i => i.id !== hardDelTarget.id)))
      .catch(() => {});
    setHardDelTarget(null);
  };

  const handleBulkRestore = () => {
    const ids = Array.from(selectedIds);
    Promise.all(ids.map(id => accessoriesApi.restore(id)))
      .then(() => {
        setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
      })
      .catch(() => {});
  };

  const handleBulkHardDelete = () => {
    const ids = Array.from(selectedIds);
    Promise.all(ids.map(id => accessoriesApi.hardDelete(id)))
      .then(() => {
        setItems(prev => prev.filter(i => !selectedIds.has(i.id)));
        setSelectedIds(new Set());
      })
      .catch(() => {});
  };

  return (
    <>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: spacing.lg, marginBottom: spacing.xl2, flexWrap: 'wrap' }}>
        {statCards.map(c => <StatisticCard key={c.title} title={c.title} value={c.value} />)}
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: colors.bgSurface, borderRadius: radius.lg, border: '1px solid rgba(70,98,145,0.1)', boxShadow: '0 1px 4px rgba(3,12,35,0.06)', overflow: 'hidden' }}>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div style={{ padding: `${spacing.sm} ${spacing.xl}`, backgroundColor: 'rgba(46,124,253,0.05)', borderBottom: '1px solid rgba(46,124,253,0.15)', display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: colors.primary }}>
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => setBulkRestoreOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(34,197,94,0.12)', color: '#15803d', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <RotateCcw size={11} /> Restore {selectedIds.size}
            </button>
            <button
              onClick={() => setBulkHardDelOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: colors.error, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              <Trash2 size={11} /> Delete {selectedIds.size} Permanently
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{ padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent', color: colors.blueGrayMd, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderBottom: '1px solid rgba(70,98,145,0.08)', display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary, marginRight: spacing.sm, whiteSpace: 'nowrap' }}>
              Archived Accessories
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
          <SearchBar value={search} onChange={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search accessories…" />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: '2.5rem', paddingLeft: spacing.xl }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: colors.primary }}
                  />
                </th>
                <th style={TH}>Item Name</th>
                <th style={TH}>Category</th>
                <th style={{ ...TH, textAlign: 'center' }}>Qty</th>
                <th style={TH}>Location</th>
                <th style={TH}>Reason</th>
                <th style={TH}>Archived</th>
                <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...TD, textAlign: 'center', color: colors.blueGrayMd, padding: `${spacing.xl3} ${spacing.md}` }}>
                    No archived accessories found.
                  </td>
                </tr>
              ) : pageItems.map((item, idx) => {
                const isSelected = selectedIds.has(item.id);
                return (
                  <tr
                    key={item.id}
                    onClick={() => setDetailTarget(item)}
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(46,124,253,0.05)'
                        : idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                      cursor: 'pointer',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(46,124,253,0.04)'; }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe; }}
                  >
                    <td style={{ ...TD, paddingLeft: spacing.xl }} onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(item.id)}
                        style={{ cursor: 'pointer', accentColor: colors.primary }}
                      />
                    </td>
                    <td style={{ ...TD, fontWeight: 500 }}>{item.item_name}</td>
                    <td style={TD}>
                      <span style={{ display: 'inline-block', padding: `0.125rem ${spacing.sm}`, borderRadius: '0.25rem', backgroundColor: 'rgba(46,124,253,0.08)', color: colors.primary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {item.category ?? '—'}
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: 'center', color: colors.blueGrayMd }}>{item.quantity_available}</td>
                    <td style={{ ...TD, color: colors.blueGrayMd, maxWidth: '10rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location ?? '—'}</td>
                    <td style={TD}>
                      <span style={{
                        display: 'inline-block',
                        padding: `0.125rem ${spacing.sm}`,
                        borderRadius: '0.25rem',
                        backgroundColor: item.archive_reason === 'RETIRED' ? 'rgba(252,156,45,0.1)' : 'rgba(239,68,68,0.1)',
                        color: item.archive_reason === 'RETIRED' ? colors.orangeAccent : colors.error,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {item.archive_reason === 'RETIRED' ? 'Retired' : 'Deleted'}
                      </span>
                    </td>
                    <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>{formatDate(item.archived_at)}</td>
                    <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                        <button title="Restore" style={iconBtnStyle(colors.success)} onClick={() => setRestoreTarget(item)}>
                          <RotateCcw size={11} />
                        </button>
                        <button title="Delete permanently" style={iconBtnStyle(colors.error)} onClick={() => setHardDelTarget(item)}>
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

        {totalPages > 1 && (
          <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderTop: '1px solid rgba(70,98,145,0.08)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Single-item modals */}
      <AccessoryDetailModal
        isOpen={!!detailTarget}
        item={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={() => {}}
      />
      <RestoreConfirmModal
        isOpen={!!restoreTarget}
        itemName={restoreTarget?.item_name ?? ''}
        itemType="Accessory"
        destination="Inventory"
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
      />
      <HardDeleteConfirmModal
        isOpen={!!hardDelTarget}
        itemName={hardDelTarget?.item_name ?? ''}
        itemType="Accessory"
        onClose={() => setHardDelTarget(null)}
        onConfirm={handleHardDelete}
      />

      {/* Bulk modals */}
      <RestoreConfirmModal
        isOpen={bulkRestoreOpen}
        itemName={`${selectedIds.size} selected accessor${selectedIds.size !== 1 ? 'ies' : 'y'}`}
        itemType="Accessories"
        destination="Inventory"
        onClose={() => setBulkRestoreOpen(false)}
        onConfirm={handleBulkRestore}
      />
      <BulkHardDeleteModal
        isOpen={bulkHardDelOpen}
        count={selectedIds.size}
        itemType="Accessory"
        onClose={() => setBulkHardDelOpen(false)}
        onConfirm={handleBulkHardDelete}
      />
    </>
  );
}

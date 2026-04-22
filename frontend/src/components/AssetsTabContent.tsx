import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2, Pencil, Copy, Plus, Download, Filter, Eye, EyeOff, Archive, LogIn, LogOut, RefreshCw, ShieldCheck, Wrench, Settings, MapPin } from 'lucide-react';
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
import AssetDetailModal from './AssetDetailModal';
import ChangeStatusModal from './ChangeStatusModal';
import BulkCheckInModal from './BulkCheckInModal';
import BulkCheckOutModal from './BulkCheckOutModal';
import BulkChangeStatusModal from './BulkChangeStatusModal';
import BulkResolveStatusModal from './BulkResolveStatusModal';
import { colors, spacing, radius, statusColors } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';
import { ASSET_STATUS_LABELS } from '../types/asset';
import { assetsApi, usersApi } from '../api';
import type { Person } from '../types/people';
import { useToast } from '../context/ToastContext';
import { useRecency } from '../hooks/useRecency';
import RecencyBadge from './RecencyBadge';



const STATUS_CONFIG: Record<AssetStatus, { dot: string; label: string }> = {
  'AVAILABLE':      { dot: colors.success,      label: 'Available' },
  'DEPLOYED':       { dot: colors.primary,      label: 'Deployed' },
  'IN_REPAIR':      { dot: colors.orangeAccent, label: 'In Repair' },
  'IN_MAINTENANCE': { dot: statusColors.retired, label: 'In Maintenance' },
  'LOST':           { dot: colors.error,        label: 'Lost' },
  'TO_AUDIT':       { dot: statusColors.toAudit, label: 'To Audit' },
};

const FILTER_TABS: Array<AssetStatus | 'All'> = [
  'All', 'AVAILABLE', 'DEPLOYED', 'IN_REPAIR', 'IN_MAINTENANCE', 'TO_AUDIT', 'LOST',
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
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status') as AssetStatus | null;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<Person[]>([]);
  const toast = useToast();
  const { isNew, markSeen } = useRecency('assets');

  useEffect(() => {
    assetsApi.list().then(setAssets).catch(() => {});
    usersApi.list({ is_active: true }).then(setUsers).catch(() => {});
  }, []);

  // Mark the feed as seen after 2.5s dwell so NEW badges clear on next visit
  useEffect(() => {
    const timer = setTimeout(markSeen, 2500);
    return () => clearTimeout(timer);
  }, [markSeen]);

  const statCards = useMemo(() => [
    { title: 'Total Assets', value: assets.length,                                          filter: 'All'       as AssetStatus | 'All' },
    { title: 'Available',    value: assets.filter(a => a.status === 'AVAILABLE').length,    filter: 'AVAILABLE' as AssetStatus | 'All' },
    { title: 'Deployed',     value: assets.filter(a => a.status === 'DEPLOYED').length,     filter: 'DEPLOYED'  as AssetStatus | 'All' },
    { title: 'To Audit',     value: assets.filter(a => a.status === 'TO_AUDIT').length,     filter: 'TO_AUDIT'  as AssetStatus | 'All' },
  ], [assets]);
  const [search, setSearch] = useState('');
  const validStatuses: Array<AssetStatus | 'All'> = ['All', 'AVAILABLE', 'DEPLOYED', 'IN_REPAIR', 'IN_MAINTENANCE', 'TO_AUDIT', 'LOST'];
  const [activeTab, setActiveTab] = useState<AssetStatus | 'All'>(
    statusFromUrl && validStatuses.includes(statusFromUrl) ? statusFromUrl : 'All'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState('Date Added (Newest)');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [deleteTarget,   setDeleteTarget]   = useState<Asset | null>(null);
  const [editTarget,     setEditTarget]     = useState<Asset | null>(null);
  const [detailTarget,   setDetailTarget]   = useState<Asset | null>(null);
  const [copyTarget,     setCopyTarget]     = useState<Asset | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<Asset | null>(null);
  const [checkInTarget,  setCheckInTarget]  = useState<Asset | null>(null);
  const [statusTarget,   setStatusTarget]   = useState<{ asset: Asset; status: AssetStatus } | null>(null);

  const [bulkDeleteConfirm,      setBulkDeleteConfirm]      = useState(false);
  const [bulkCheckInOpen,        setBulkCheckInOpen]        = useState(false);
  const [bulkCheckOutOpen,       setBulkCheckOutOpen]       = useState(false);
  const [bulkStatusOpen,         setBulkStatusOpen]         = useState(false);
  const [bulkResolveTarget, setBulkResolveTarget] = useState<'TO_AUDIT' | 'IN_REPAIR' | 'IN_MAINTENANCE' | 'LOST' | null>(null);
  const [bulkLoading,            setBulkLoading]            = useState(false);

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
          holder.toLowerCase().includes(q) ||
          (a.manufacturer ?? '').toLowerCase().includes(q) ||
          (a.model ?? '').toLowerCase().includes(q)
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
    const id = deleteTarget.id;
    const tag = deleteTarget.asset_tag;
    setDeleteTarget(null);
    assetsApi.remove(id)
      .then(() => {
        setAssets(prev => prev.filter(a => a.id !== id));
        setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        toast.success(`Deleted asset ${tag}`);
      })
      .catch(() => toast.error('Could not delete asset. Please try again.'));
  };

  const handleSaveEdit = (updated: Asset) => {
    setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
    toast.success(`Updated asset ${updated.asset_tag}`);
  };

  const handleSaveCopy = (data: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now());
    const today = new Date().toISOString().split('T')[0];
    setAssets(prev => [...prev, { ...data, id: newId, created_at: today, updated_at: today }]);
    toast.success(`Copied asset as ${data.asset_tag}`);
  };

  const handleCheckOut = (assetId: string, userId: string, notes: string) => {
    assetsApi.checkOut(assetId, userId, notes)
      .then(updated => {
        setAssets(prev => prev.map(a => a.id === assetId ? updated : a));
        const holder = updated.assigned_to_detail
          ? `${updated.assigned_to_detail.first_name} ${updated.assigned_to_detail.last_name}`
          : 'user';
        toast.success(`Checked out ${updated.asset_tag} to ${holder}`);
      })
      .catch(() => toast.error('Could not check out asset. Please try again.'));
  };

  const handleCheckIn = (assetId: string, notes: string) => {
    assetsApi.checkIn(assetId, notes)
      .then(updated => {
        setAssets(prev => prev.map(a => a.id === assetId ? updated : a));
        toast.success(`Checked in ${updated.asset_tag}`);
      })
      .catch(() => toast.error('Could not check in asset. Please try again.'));
  };

  const handleChangeStatus = (assetId: string, status: AssetStatus, notes: string) => {
    assetsApi.changeStatus(assetId, status, notes)
      .then(updated => {
        setAssets(prev => prev.map(a => a.id === assetId ? updated : a));
        toast.success(`Status updated to ${ASSET_STATUS_LABELS[updated.status]}`);
      })
      .catch(() => toast.error('Could not update status. Please try again.'));
  };

  const handleBulkArchive = async () => {
    const ids = [...selectedIds];
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => assetsApi.retire(id)));
      setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      toast.success(`Archived ${ids.length} asset${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some assets could not be archived. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkDeleteConfirm(false);
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => assetsApi.remove(id)));
      setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      toast.success(`Deleted ${ids.length} asset${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some assets could not be deleted. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkCheckIn = async (notes: string) => {
    const ids = [...selectedIds];
    setBulkCheckInOpen(false);
    setBulkLoading(true);
    try {
      const results = await Promise.all(ids.map(id => assetsApi.checkIn(id, notes)));
      setAssets(prev => {
        const map = new Map(results.map(r => [r.id, r]));
        return prev.map(a => map.get(a.id) ?? a);
      });
      setSelectedIds(new Set());
      toast.success(`Checked in ${ids.length} asset${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some assets could not be checked in. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkCheckOut = async (userId: string, notes: string) => {
    const ids = [...selectedIds];
    setBulkCheckOutOpen(false);
    setBulkLoading(true);
    try {
      const results = await Promise.all(ids.map(id => assetsApi.checkOut(id, userId, notes)));
      setAssets(prev => {
        const map = new Map(results.map(r => [r.id, r]));
        return prev.map(a => map.get(a.id) ?? a);
      });
      setSelectedIds(new Set());
      toast.success(`Checked out ${ids.length} asset${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some assets could not be checked out. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkChangeStatus = async (status: AssetStatus, notes: string) => {
    const ids = [...selectedIds];
    setBulkStatusOpen(false);
    setBulkLoading(true);
    try {
      const results = await Promise.all(ids.map(id => assetsApi.changeStatus(id, status, notes)));
      setAssets(prev => {
        const map = new Map(results.map(r => [r.id, r]));
        return prev.map(a => map.get(a.id) ?? a);
      });
      setSelectedIds(new Set());
      toast.success(`Updated status of ${ids.length} asset${ids.length !== 1 ? 's' : ''} to ${ASSET_STATUS_LABELS[status]}`);
    } catch {
      toast.error('Some assets could not be updated. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const RESOLVE_CONFIG = {
    TO_AUDIT:       { label: 'audit',       fallback: 'AVAILABLE' as AssetStatus },
    IN_REPAIR:      { label: 'repair',      fallback: 'AVAILABLE' as AssetStatus },
    IN_MAINTENANCE: { label: 'maintenance', fallback: 'AVAILABLE' as AssetStatus },
    LOST:           { label: 'lost',        fallback: 'AVAILABLE' as AssetStatus },
  } as const;

  const handleBulkResolveStatus = async (targetStatus: keyof typeof RESOLVE_CONFIG, notes: string) => {
    const cfg = RESOLVE_CONFIG[targetStatus];
    const matching = assets.filter(a => selectedIds.has(a.id) && a.status === targetStatus);
    if (matching.length === 0) return;
    setBulkResolveTarget(null);
    setBulkLoading(true);
    try {
      const results = await Promise.all(
        matching.map(a =>
          assetsApi.changeStatus(a.id, (a.previous_status ?? cfg.fallback) as AssetStatus, notes || `Resolved from ${cfg.label}`),
        ),
      );
      setAssets(prev => {
        const map = new Map(results.map(r => [r.id, r]));
        return prev.map(a => map.get(a.id) ?? a);
      });
      setSelectedIds(new Set());
      toast.success(`Resolved ${matching.length} asset${matching.length !== 1 ? 's' : ''} from ${cfg.label}`);
    } catch {
      toast.error('Some assets could not be resolved. Please try again.');
    } finally {
      setBulkLoading(false);
    }
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
          {statCards.map(card => (
            <StatisticCard
              key={card.title}
              title={card.title}
              value={card.value}
              onClick={() => handleTabChange(card.filter)}
            />
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

        {/* ── Bulk action bar ── */}
        {selectedIds.size > 0 && (() => {
          const countOf = (s: AssetStatus) => assets.filter(a => selectedIds.has(a.id) && a.status === s).length;
          const auditCount       = countOf('TO_AUDIT');
          const repairCount      = countOf('IN_REPAIR');
          const maintenanceCount = countOf('IN_MAINTENANCE');
          const lostCount        = countOf('LOST');
          return (
            <div
              style={{
                padding: `${spacing.sm} ${spacing.xl}`,
                backgroundColor: 'rgba(46,124,253,0.05)',
                borderBottom: '1px solid rgba(46,124,253,0.15)',
                display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap',
              }}
            >
              <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.8125rem', fontWeight: 600, color: colors.primary, whiteSpace: 'nowrap' }}>
                {selectedIds.size} selected
              </span>

              <button
                onClick={handleBulkArchive}
                disabled={bulkLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(252,156,45,0.12)', color: '#b45309', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                <Archive size={11} /> Archive {selectedIds.size}
              </button>

              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(239,68,68,0.1)', color: colors.error, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                <Trash2 size={11} /> Delete {selectedIds.size}
              </button>

              <button
                onClick={() => setBulkCheckInOpen(true)}
                disabled={bulkLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(34,197,94,0.12)', color: '#15803d', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                <LogIn size={11} /> Check In
              </button>

              <button
                onClick={() => setBulkCheckOutOpen(true)}
                disabled={bulkLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(252,156,45,0.12)', color: colors.orangeAccent, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                <LogOut size={11} /> Check Out
              </button>

              <button
                onClick={() => setBulkStatusOpen(true)}
                disabled={bulkLoading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(46,124,253,0.1)', color: colors.primary, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                <RefreshCw size={11} /> Change Status
              </button>

              {auditCount > 0 && (
                <button
                  onClick={() => setBulkResolveTarget('TO_AUDIT')}
                  disabled={bulkLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  <ShieldCheck size={11} /> Set Audited ({auditCount})
                </button>
              )}

              {repairCount > 0 && (
                <button
                  onClick={() => setBulkResolveTarget('IN_REPAIR')}
                  disabled={bulkLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(217,119,6,0.1)', color: '#d97706', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Wrench size={11} /> Mark Repaired ({repairCount})
                </button>
              )}

              {maintenanceCount > 0 && (
                <button
                  onClick={() => setBulkResolveTarget('IN_MAINTENANCE')}
                  disabled={bulkLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(8,145,178,0.1)', color: '#0891b2', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Settings size={11} /> Mark Serviced ({maintenanceCount})
                </button>
              )}

              {lostCount > 0 && (
                <button
                  onClick={() => setBulkResolveTarget('LOST')}
                  disabled={bulkLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(220,38,38,0.1)', color: '#dc2626', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  <MapPin size={11} /> Mark Found ({lostCount})
                </button>
              )}

              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ display: 'inline-flex', alignItems: 'center', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent', color: colors.blueGrayMd, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Clear
              </button>
            </div>
          );
        })()}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: '2.5rem', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = pageItems.some(a => selectedIds.has(a.id)) && !allPageSelected; }}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: colors.primary }}
                  />
                </th>
                <th style={TH}>Asset Tag</th>
                <th style={TH}>Item Name</th>
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
                      onClick={() => setDetailTarget(asset)}
                      style={{
                        backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                        cursor: 'pointer',
                        transition: 'background-color 0.1s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,124,253,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe)}
                    >
                      <td style={{ ...TD, textAlign: 'center', width: '2.5rem' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(asset.id)}
                          onChange={() => toggleRow(asset.id)}
                          style={{ cursor: 'pointer', accentColor: colors.primary }}
                        />
                      </td>

                      <td style={{ ...TD, fontWeight: 500 }}>
                        {asset.asset_tag}
                        <RecencyBadge visible={isNew(asset.created_at)} />
                      </td>

                      <td style={{ ...TD, color: colors.textPrimary }}>
                        {[asset.manufacturer, asset.model].filter(Boolean).join(' ') || '—'}
                      </td>

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

                      <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
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
      <AddAssetModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={created => setAssets(prev => [created, ...prev])}
      />

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
        users={users}
        onClose={() => setCheckOutTarget(null)}
        onConfirm={handleCheckOut}
      />

      <AssetCheckInModal
        isOpen={checkInTarget !== null}
        asset={checkInTarget}
        onClose={() => setCheckInTarget(null)}
        onConfirm={handleCheckIn}
      />

      <AssetDetailModal
        isOpen={detailTarget !== null}
        asset={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={() => {
          const a = detailTarget;
          setDetailTarget(null);
          setEditTarget(a);
        }}
        onRetire={notes => {
          if (!detailTarget) return;
          const tag = detailTarget.asset_tag;
          assetsApi.retire(detailTarget.id, notes)
            .then(() => {
              setAssets(prev => prev.filter(a => a.id !== detailTarget.id));
              toast.success(`Archived asset ${tag}`);
            })
            .catch(() => toast.error('Could not archive asset. Please try again.'));
        }}
        onCheckOut={() => {
          const a = detailTarget;
          setDetailTarget(null);
          setCheckOutTarget(a);
        }}
        onCheckIn={() => {
          const a = detailTarget;
          setDetailTarget(null);
          setCheckInTarget(a);
        }}
        onChangeStatus={target => {
          const a = detailTarget;
          setDetailTarget(null);
          if (a) setStatusTarget({ asset: a, status: target });
        }}
        onResolve={(targetStatus, notes) => {
          const a = detailTarget;
          if (!a) return;
          setDetailTarget(null);
          assetsApi.changeStatus(a.id, targetStatus, notes)
            .then(updated => {
              setAssets(prev => prev.map(x => x.id === updated.id ? updated : x));
              toast.success(`Asset resolved to ${ASSET_STATUS_LABELS[updated.status]}`);
            })
            .catch(() => toast.error('Could not update status. Please try again.'));
        }}
      />

      <ChangeStatusModal
        isOpen={statusTarget !== null}
        asset={statusTarget?.asset ?? null}
        initialStatus={statusTarget?.status}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleChangeStatus}
      />

      {(filterOpen || sortOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={closeDropdowns}
        />
      )}

      <DeleteConfirmModal
        isOpen={bulkDeleteConfirm}
        itemName={`${selectedIds.size} selected asset${selectedIds.size !== 1 ? 's' : ''}`}
        itemType=""
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />

      <BulkCheckInModal
        isOpen={bulkCheckInOpen}
        count={selectedIds.size}
        onConfirm={handleBulkCheckIn}
        onClose={() => setBulkCheckInOpen(false)}
      />

      <BulkCheckOutModal
        isOpen={bulkCheckOutOpen}
        count={selectedIds.size}
        users={users}
        onConfirm={handleBulkCheckOut}
        onClose={() => setBulkCheckOutOpen(false)}
      />

      <BulkChangeStatusModal
        isOpen={bulkStatusOpen}
        count={selectedIds.size}
        onConfirm={handleBulkChangeStatus}
        onClose={() => setBulkStatusOpen(false)}
      />

      {bulkResolveTarget === 'TO_AUDIT' && (
        <BulkResolveStatusModal
          isOpen
          count={assets.filter(a => selectedIds.has(a.id) && a.status === 'TO_AUDIT').length}
          icon={<ShieldCheck size={16} color="#7c3aed" />}
          title="Set Assets as Audited"
          description="Selected assets flagged for audit will be marked as audited and reverted to their previous status."
          confirmLabel="Set Audited"
          accentColor="#7c3aed"
          notesPlaceholder="Audit findings, resolution notes, etc."
          onConfirm={notes => handleBulkResolveStatus('TO_AUDIT', notes)}
          onClose={() => setBulkResolveTarget(null)}
        />
      )}
      {bulkResolveTarget === 'IN_REPAIR' && (
        <BulkResolveStatusModal
          isOpen
          count={assets.filter(a => selectedIds.has(a.id) && a.status === 'IN_REPAIR').length}
          icon={<Wrench size={16} color="#d97706" />}
          title="Mark Assets as Repaired"
          description="Selected assets in repair will be marked as repaired and reverted to their previous status."
          confirmLabel="Mark Repaired"
          accentColor="#d97706"
          notesPlaceholder="Repair details, parts replaced, technician notes, etc."
          onConfirm={notes => handleBulkResolveStatus('IN_REPAIR', notes)}
          onClose={() => setBulkResolveTarget(null)}
        />
      )}
      {bulkResolveTarget === 'IN_MAINTENANCE' && (
        <BulkResolveStatusModal
          isOpen
          count={assets.filter(a => selectedIds.has(a.id) && a.status === 'IN_MAINTENANCE').length}
          icon={<Settings size={16} color="#0891b2" />}
          title="Mark Assets as Serviced"
          description="Selected assets under maintenance will be marked as serviced and reverted to their previous status."
          confirmLabel="Mark Serviced"
          accentColor="#0891b2"
          notesPlaceholder="Service details, maintenance completed, etc."
          onConfirm={notes => handleBulkResolveStatus('IN_MAINTENANCE', notes)}
          onClose={() => setBulkResolveTarget(null)}
        />
      )}
      {bulkResolveTarget === 'LOST' && (
        <BulkResolveStatusModal
          isOpen
          count={assets.filter(a => selectedIds.has(a.id) && a.status === 'LOST').length}
          icon={<MapPin size={16} color="#dc2626" />}
          title="Mark Assets as Found"
          description="Selected lost assets will be marked as found and reverted to their previous status."
          confirmLabel="Mark Found"
          accentColor="#dc2626"
          notesPlaceholder="Recovery location, condition, how it was found, etc."
          onConfirm={notes => handleBulkResolveStatus('LOST', notes)}
          onClose={() => setBulkResolveTarget(null)}
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


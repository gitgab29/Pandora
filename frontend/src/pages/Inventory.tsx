import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Trash2, Pencil, Plus, Download, AlertTriangle, Filter,
  Eye, EyeOff, Archive,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import SortDropdown from '../components/SortDropdown';
import FeatureNotAvailableModal from '../components/FeatureNotAvailableModal';
import AddInventoryModal from '../components/AddInventoryModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EditInventoryModal from '../components/EditInventoryModal';
import InventoryCheckInModal from '../components/InventoryCheckInModal';
import InventoryCheckOutModal from '../components/InventoryCheckOutModal';
import AccessoryDetailModal from '../components/AccessoryDetailModal';
import AssetsTabContent from '../components/AssetsTabContent';
import ComingSoonPanel from '../components/ComingSoonPanel';
import { colors, spacing, radius } from '../theme';
import type { Accessory } from '../types/inventory';
import type { Person } from '../types/people';
import { accessoriesApi, usersApi } from '../api';
import { useToast } from '../context/ToastContext';

type InventoryTab = 'Assets' | 'Accessories' | 'Licenses' | 'Consumables';
const INVENTORY_TABS: InventoryTab[] = ['Assets', 'Accessories', 'Licenses', 'Consumables'];


type FilterTab = 'All' | 'Low Stock' | 'Out of Stock';
const FILTER_TABS: FilterTab[] = ['All', 'Low Stock', 'Out of Stock'];

const INV_SORT_OPTIONS = [
  'Name (A–Z)', 'Name (Z–A)',
  'Qty (High–Low)', 'Qty (Low–High)',
  'Date Added (Newest)', 'Date Added (Oldest)',
];

const ROWS_PER_PAGE = 10;

// ── Table cell styles ─────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function Inventory() {
  const [searchParams] = useSearchParams();
  const [inventory, setInventory] = useState<Accessory[]>([]);
  const [users, setUsers] = useState<Person[]>([]);
  const toast = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const tabFromUrl = searchParams.get('tab') as InventoryTab | null;
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>(
    tabFromUrl && INVENTORY_TABS.includes(tabFromUrl) ? tabFromUrl : 'Assets'
  );

  useEffect(() => {
    if (tabFromUrl && INVENTORY_TABS.includes(tabFromUrl)) {
      setActiveInventoryTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    accessoriesApi.list().then(setInventory).catch(() => {});
    usersApi.list({ is_active: true }).then(setUsers).catch(() => {});
  }, []);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ locations: string[] }>({ locations: [] });
  const [activeSort, setActiveSort] = useState('Date Added (Newest)');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);

  // ── Modal targets ────────────────────────────────────────────────────────
  const [deleteTarget,   setDeleteTarget]   = useState<Accessory | null>(null);
  const [editTarget,     setEditTarget]     = useState<Accessory | null>(null);
  const [detailTarget,   setDetailTarget]   = useState<Accessory | null>(null);
  const [checkInTarget,  setCheckInTarget]  = useState<Accessory | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<Accessory | null>(null);

  // ── Derived data ─────────────────────────────────────────────────────────
  const allInvCategories = useMemo(
    () => [...new Set(inventory.map(i => i.category ?? '').filter(Boolean))].sort(),
    [inventory],
  );
  const allLocations = useMemo(
    () => [...new Set(inventory.map(i => (i.location ?? '').split(',')[0].trim()).filter(Boolean))].sort(),
    [inventory],
  );

  const statCards = useMemo(() => {
    const totalItems   = inventory.length;
    const lowStock     = inventory.filter(i => i.quantity_available > 0 && i.quantity_available < i.min_quantity).length;
    const outOfStock   = inventory.filter(i => i.quantity_available === 0).length;
    const totalUnits   = inventory.reduce((s, i) => s + i.quantity_available, 0);
    return [
      { title: 'Total Items',  value: totalItems,  trend: { value: 12, direction: 'up'   as const }, filter: 'All'          as FilterTab },
      { title: 'Total Units',  value: totalUnits,  trend: { value: 8,  direction: 'up'   as const }, filter: 'All'          as FilterTab },
      { title: 'Low Stock',    value: lowStock,    trend: { value: 25, direction: 'down' as const }, filter: 'Low Stock'    as FilterTab },
      { title: 'Out of Stock', value: outOfStock,                                                    filter: 'Out of Stock' as FilterTab },
    ];
  }, [inventory]);

  const filtered = useMemo(() => {
    let items = inventory;
    // Status tab
    if (activeTab === 'Low Stock')    items = items.filter(i => i.quantity_available > 0 && i.quantity_available < i.min_quantity);
    if (activeTab === 'Out of Stock') items = items.filter(i => i.quantity_available === 0);
    // Category tab
    if (activeCategory) items = items.filter(i => i.category === activeCategory);
    // Dept + Location filters
    if (activeFilters.locations.length > 0)   items = items.filter(i => activeFilters.locations.includes((i.location ?? '').split(',')[0].trim()));
    // Search
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(i =>
        i.item_name.toLowerCase().includes(q) ||
        (i.model_number ?? '').toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q) ||
        (i.manufacturer ?? '').toLowerCase().includes(q) ||
        (i.location ?? '').toLowerCase().includes(q),
      );
    }
    // Sort
    const sorted = [...items];
    if (activeSort === 'Name (A–Z)')           sorted.sort((a, b) => a.item_name.localeCompare(b.item_name));
    else if (activeSort === 'Name (Z–A)')       sorted.sort((a, b) => b.item_name.localeCompare(a.item_name));
    else if (activeSort === 'Qty (High–Low)')   sorted.sort((a, b) => b.quantity_available - a.quantity_available);
    else if (activeSort === 'Qty (Low–High)')   sorted.sort((a, b) => a.quantity_available - b.quantity_available);
    else if (activeSort === 'Date Added (Newest)') sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (activeSort === 'Date Added (Oldest)') sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    return sorted;
  }, [inventory, search, activeTab, activeCategory, activeFilters, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds(new Set());
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const allPageSelected = pageItems.length > 0 && pageItems.every(i => selectedIds.has(i.id));
  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach(i => next.delete(i.id));
      else pageItems.forEach(i => next.add(i.id));
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

  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handleBulkArchive = async () => {
    const ids = [...selectedIds];
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => accessoriesApi.retire(id)));
      setInventory(prev => prev.filter(i => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      toast.success(`Archived ${ids.length} item${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some items could not be archived. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkDeleteConfirm(false);
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => accessoriesApi.remove(id)));
      setInventory(prev => prev.filter(i => !selectedIds.has(i.id)));
      setSelectedIds(new Set());
      toast.success(`Deleted ${ids.length} item${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some items could not be deleted. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleDelete = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.item_name;
    accessoriesApi.remove(deleteTarget.id)
      .then(() => {
        setInventory(prev => prev.filter(i => i.id !== deleteTarget.id));
        setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
        setDeleteTarget(null);
        toast.success(`Deleted "${name}"`);
      })
      .catch(() => toast.error('Could not delete item. Please try again.'));
  };

  const handleSaveEdit = (updated: Accessory) => {
    setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleCheckIn = (itemId: string, quantity: number, userId: string, notes: string) => {
    accessoriesApi.checkIn(itemId, quantity, userId, notes)
      .then(updated => {
        setInventory(prev => prev.map(i => i.id === itemId ? updated : i));
        toast.success(`Checked in ${quantity} × ${updated.item_name}`);
      })
      .catch(() => toast.error('Could not check in item. Please try again.'));
  };

  const handleCheckOut = (itemId: string, quantity: number, userId: string, notes: string) => {
    accessoriesApi.checkOut(itemId, quantity, userId || undefined, notes)
      .then(updated => {
        setInventory(prev => prev.map(i => i.id === itemId ? updated : i));
        toast.success(`Checked out ${quantity} × ${updated.item_name}`);
      })
      .catch(() => toast.error('Could not check out item. Please try again.'));
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage: "url('/bg-auth.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

      {/* Main column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'rgba(244, 246, 249, 0.92)',
        }}
      >
        <Header title="Inventory" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* ── Inventory entity tabs ── */}
          <div
            style={{
              display: 'flex',
              gap: spacing.xs,
              marginBottom: spacing.xl2,
              borderBottom: '1px solid rgba(70, 98, 145, 0.15)',
            }}
          >
            {INVENTORY_TABS.map(tab => {
              const isActive = activeInventoryTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveInventoryTab(tab)}
                  style={{
                    padding: `${spacing.sm} ${spacing.lg}`,
                    border: 'none',
                    background: 'transparent',
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? colors.primary : colors.blueGrayMd,
                    cursor: 'pointer',
                    borderBottom: `2px solid ${isActive ? colors.primary : 'transparent'}`,
                    marginBottom: '-1px',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {activeInventoryTab === 'Assets' && <AssetsTabContent />}

          {activeInventoryTab === 'Licenses' && (
            <ComingSoonPanel
              label="Licenses — Coming Soon"
              description="Software license tracking will live here. Schema and fields are still being scoped."
            />
          )}

          {activeInventoryTab === 'Consumables' && (
            <ComingSoonPanel
              label="Consumables — Coming Soon"
              description="Consumable item tracking will live here. Schema and fields are still being scoped."
            />
          )}

          {activeInventoryTab === 'Accessories' && <>
          {/* ── Stat cards ── */}
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
                  trend={card.trend}
                  onClick={() => handleTabChange(card.filter)}
                />
              ))}
            </div>
          )}

          {/* ── Inventory table card ── */}
          <div
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: radius.lg,
              border: '1px solid rgba(70, 98, 145, 0.1)',
              boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Toolbar */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
                borderBottom: '1px solid rgba(70, 98, 145, 0.08)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: spacing.md,
              }}
            >
              {/* Left: title + status filter tabs */}
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
                  Accessories
                </span>
                <div style={{ display: 'flex', gap: spacing.xs }}>
                  {FILTER_TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      style={{
                        padding: `0.25rem ${spacing.md}`,
                        borderRadius: radius.full,
                        border: activeTab === tab ? 'none' : '1px solid rgba(70,98,145,0.25)',
                        backgroundColor: activeTab === tab
                          ? tab === 'Out of Stock' ? colors.error
                          : tab === 'Low Stock'   ? colors.orangeAccent
                          : colors.primary
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

              {/* Right: search + filter + sort + export + new */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Search items…" />
                <InventoryFilterDropdown
                  open={filterOpen}
                  onToggle={() => { setFilterOpen(o => !o); setSortOpen(false); }}
                  locations={allLocations}
                  active={activeFilters}
                  onToggleLoc={(l) => {
                    setActiveFilters(prev => ({
                      ...prev,
                      locations: prev.locations.includes(l)
                        ? prev.locations.filter(x => x !== l)
                        : [...prev.locations, l],
                    }));
                    setCurrentPage(1);
                  }}
                />
                <SortDropdown
                  open={sortOpen}
                  onToggle={() => { setSortOpen(o => !o); setFilterOpen(false); }}
                  options={INV_SORT_OPTIONS}
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

            {/* Category tabs row */}
            <div
              style={{
                padding: `${spacing.sm} ${spacing.xl}`,
                borderBottom: '1px solid rgba(70, 98, 145, 0.1)',
                display: 'flex',
                gap: spacing.xs,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => { setActiveCategory(''); setCurrentPage(1); }}
                style={{
                  padding: `0.2rem ${spacing.md}`,
                  borderRadius: radius.full,
                  border: activeCategory === '' ? 'none' : '1px solid rgba(70,98,145,0.25)',
                  backgroundColor: activeCategory === '' ? colors.primary : 'transparent',
                  color: activeCategory === '' ? colors.white : colors.blueGrayMd,
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background-color 0.15s, color 0.15s',
                }}
              >
                All
              </button>
              {allInvCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(activeCategory === cat ? '' : cat); setCurrentPage(1); }}
                  style={{
                    padding: `0.2rem ${spacing.md}`,
                    borderRadius: radius.full,
                    border: activeCategory === cat ? 'none' : '1px solid rgba(70,98,145,0.25)',
                    backgroundColor: activeCategory === cat ? colors.primary : 'transparent',
                    color: activeCategory === cat ? colors.white : colors.blueGrayMd,
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
              ))}
            </div>

            {/* ── Bulk action bar ── */}
            {selectedIds.size > 0 && (
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
                  onClick={() => setSelectedIds(new Set())}
                  style={{ display: 'inline-flex', alignItems: 'center', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent', color: colors.blueGrayMd, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Clear
                </button>
              </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: '2.5rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={el => { if (el) el.indeterminate = pageItems.some(i => selectedIds.has(i.id)) && !allPageSelected; }}
                        onChange={toggleAll}
                        style={{ cursor: 'pointer', accentColor: colors.primary }}
                      />
                    </th>
                    <th style={TH}>Item Name</th>
                    <th style={TH}>Model Number</th>
                    <th style={TH}>Category</th>
                    <th style={{ ...TH, textAlign: 'center' }}>Qty Available</th>
                    <th style={{ ...TH, textAlign: 'center' }}>Min Qty</th>
                    <th style={TH}>Location</th>
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
                        No items match your search.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item, idx) => {
                      const isOutOfStock = item.quantity_available === 0;
                      const isLowStock   = !isOutOfStock && item.quantity_available < item.min_quantity;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setDetailTarget(item)}
                          style={{
                            backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                            cursor: 'pointer',
                            transition: 'background-color 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,124,253,0.04)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe)}
                        >
                          {/* Checkbox */}
                          <td style={{ ...TD, textAlign: 'center', width: '2.5rem' }} onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleRow(item.id)}
                              style={{ cursor: 'pointer', accentColor: colors.primary }}
                            />
                          </td>

                          {/* Item Name */}
                          <td style={{ ...TD, fontWeight: 500 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                              {item.item_name}
                              {isLowStock && (
                                <AlertTriangle size={11} color={colors.orangeAccent} aria-label="Low stock" />
                              )}
                              {isOutOfStock && (
                                <AlertTriangle size={11} color={colors.error} aria-label="Out of stock" />
                              )}
                            </span>
                          </td>

                          {/* Model Number */}
                          <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem', fontFamily: "'Roboto Mono', monospace" }}>
                            {item.model_number ?? '—'}
                          </td>

                          {/* Category */}
                          <td style={TD}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: `0.125rem ${spacing.sm}`,
                                borderRadius: '0.25rem',
                                backgroundColor: 'rgba(46,124,253,0.08)',
                                color: colors.primary,
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '0.75rem',
                                fontWeight: 600,
                              }}
                            >
                              {item.category ?? '—'}
                            </span>
                          </td>

                          {/* Qty Available */}
                          <td style={{ ...TD, textAlign: 'center' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                color: isOutOfStock ? colors.error : isLowStock ? colors.orangeAccent : colors.success,
                              }}
                            >
                              {item.quantity_available}
                            </span>
                          </td>

                          {/* Min Qty */}
                          <td style={{ ...TD, textAlign: 'center', color: colors.blueGrayMd }}>
                            {item.min_quantity}
                          </td>

                          {/* Location */}
                          <td style={{ ...TD, color: colors.blueGrayMd, maxWidth: '12rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.location ?? '—'}
                          </td>

                          {/* Actions */}
                          <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                              {/* Delete */}
                              <button
                                onClick={() => setDeleteTarget(item)}
                                title="Delete"
                                style={iconBtnStyle(colors.error)}
                              >
                                <Trash2 size={11} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => setEditTarget(item)}
                                title="Edit"
                                style={iconBtnStyle(colors.blueGrayMd)}
                              >
                                <Pencil size={11} />
                              </button>

                              {/* Check In */}
                              <button
                                onClick={() => setCheckInTarget(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '5.5rem',
                                  padding: `0.2rem 0`,
                                  borderRadius: radius.full,
                                  border: 'none',
                                  backgroundColor: colors.success,
                                  color: colors.white,
                                  fontFamily: "'Archivo', sans-serif",
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                Check In
                              </button>

                              {/* Check Out */}
                              <button
                                onClick={() => setCheckOutTarget(item)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '5.5rem',
                                  padding: `0.2rem 0`,
                                  borderRadius: radius.full,
                                  border: 'none',
                                  backgroundColor: colors.orangeAccent,
                                  color: colors.white,
                                  fontFamily: "'Archivo', sans-serif",
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  flexShrink: 0,
                                }}
                              >
                                Check Out
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

            {/* Pagination */}
            <div style={{ padding: `0 ${spacing.xl} ${spacing.sm}`, borderTop: '1px solid rgba(70, 98, 145, 0.07)' }}>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
          </>}
        </main>
      </div>

      {/* ── Modals ── */}
      <FeatureNotAvailableModal isOpen={featureModalOpen} onClose={() => setFeatureModalOpen(false)} />
      <AddInventoryModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={acc => setInventory(prev => [...prev, acc])}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        itemName={deleteTarget?.item_name ?? ''}
        itemType="Inventory Item"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <EditInventoryModal
        isOpen={editTarget !== null}
        item={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />

      <InventoryCheckInModal
        isOpen={checkInTarget !== null}
        item={checkInTarget}
        onClose={() => setCheckInTarget(null)}
        onConfirm={handleCheckIn}
      />

      <InventoryCheckOutModal
        isOpen={checkOutTarget !== null}
        item={checkOutTarget}
        users={users}
        onClose={() => setCheckOutTarget(null)}
        onConfirm={handleCheckOut}
      />

      <AccessoryDetailModal
        isOpen={detailTarget !== null}
        item={detailTarget}
        onClose={() => setDetailTarget(null)}
        onEdit={() => {
          const item = detailTarget;
          setDetailTarget(null);
          setEditTarget(item);
        }}
        onRetire={notes => {
          if (!detailTarget) return;
          accessoriesApi.retire(detailTarget.id, notes)
            .then(() => { setInventory(prev => prev.filter(i => i.id !== detailTarget.id)); setDetailTarget(null); })
            .catch(() => {});
        }}
      />

      <DeleteConfirmModal
        isOpen={bulkDeleteConfirm}
        itemName={`${selectedIds.size} selected item${selectedIds.size !== 1 ? 's' : ''}`}
        itemType=""
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />

      {/* Backdrop — closes open dropdowns on outside click */}
      {(filterOpen || sortOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={closeDropdowns}
        />
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── InventoryFilterDropdown ───────────────────────────────────────────────────

function InventoryFilterDropdown({
  open,
  onToggle,
  locations,
  active,
  onToggleLoc,
}: {
  open: boolean;
  onToggle: () => void;
  locations: string[];
  active: { locations: string[] };
  onToggleLoc: (l: string) => void;
}) {
  const hasActive = active.locations.length > 0;
  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={onToggle}
        title="Filter by location"
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
            width: '16rem',
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
            Location
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs }}>
            {locations.map(l => {
              const isActive = active.locations.includes(l);
              return (
                <button
                  key={l}
                  onClick={() => onToggleLoc(l)}
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
                  {l}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

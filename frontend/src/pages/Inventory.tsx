import { useState, useMemo } from 'react';
import {
  Trash2, Pencil, Plus, Download, AlertTriangle, Filter,
  Cable, Plug, Keyboard, Mouse, Headphones, Zap, HardDrive,
  MemoryStick, Monitor, Package,
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
import AssetsTabContent from '../components/AssetsTabContent';
import ComingSoonPanel from '../components/ComingSoonPanel';
import { colors, spacing, radius } from '../theme';
import type { StoreroomInventory } from '../types/inventory';

type InventoryTab = 'Assets' | 'Accessories' | 'Licenses' | 'Consumables';
const INVENTORY_TABS: InventoryTab[] = ['Assets', 'Accessories', 'Licenses', 'Consumables'];

// ── Initial dummy data ─────────────────────────────────────────────────────────

const INITIAL_INVENTORY: StoreroomInventory[] = [
  { id:  1, item_name: 'USB-C Cable 2m',       category: 'Cable',        quantity_available: 24, min_quantity: 10, model_number: 'ANK-USB2M',   manufacturer: 'Anker',    supplier: 'Amazon Business', location: 'Storeroom A, Shelf 1', department: 'IT',       unit_cost: 12.99,  total_cost: 311.76, purchase_date: '2024-01-10', created_at: '2024-01-10', updated_at: '2024-01-10' },
  { id:  2, item_name: 'HDMI Cable 1.5m',      category: 'Cable',        quantity_available: 3,  min_quantity: 8,  model_number: 'HDMI-1M5-BK', manufacturer: 'Belkin',   supplier: 'CDW',             location: 'Storeroom A, Shelf 1', department: 'IT',       unit_cost: 9.99,   total_cost: 29.97,  purchase_date: '2024-01-12', created_at: '2024-01-12', updated_at: '2024-01-12' },
  { id:  3, item_name: 'USB-C to HDMI Adapter',category: 'Adapter',      quantity_available: 0,  min_quantity: 5,  model_number: 'UCA-HDMI-4K', manufacturer: 'Anker',    supplier: 'Amazon Business', location: 'Storeroom A, Shelf 2', department: 'IT',       unit_cost: 18.99,  total_cost: 0,      purchase_date: '2024-01-15', created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id:  4, item_name: 'Wireless Keyboard',    category: 'Keyboard',     quantity_available: 9,  min_quantity: 4,  model_number: 'MX-KEYS-BLK', manufacturer: 'Logitech', supplier: 'Insight',         location: 'Storeroom B, Shelf 1', department: 'IT',       unit_cost: 89.99,  total_cost: 809.91, purchase_date: '2024-02-01', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id:  5, item_name: 'Wireless Mouse',       category: 'Mouse',        quantity_available: 11, min_quantity: 4,  model_number: 'MX-MASTER-3S',manufacturer: 'Logitech', supplier: 'Insight',         location: 'Storeroom B, Shelf 1', department: 'IT',       unit_cost: 74.99,  total_cost: 824.89, purchase_date: '2024-02-01', created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id:  6, item_name: 'USB-A Hub 7-Port',     category: 'Adapter',      quantity_available: 2,  min_quantity: 3,  model_number: 'ANK-HUB7-A', manufacturer: 'Anker',    supplier: 'Amazon Business', location: 'Storeroom A, Shelf 2', department: 'IT',       unit_cost: 29.99,  total_cost: 59.98,  purchase_date: '2024-02-05', created_at: '2024-02-05', updated_at: '2024-02-05' },
  { id:  7, item_name: 'Laptop Stand',         category: 'Other',        quantity_available: 15, min_quantity: 5,  model_number: 'BSTAND-ALU',  manufacturer: 'Brydge',   supplier: 'B&H Photo',       location: 'Storeroom B, Shelf 2', department: 'Operations', unit_cost: 39.99, total_cost: 599.85, purchase_date: '2024-02-10', created_at: '2024-02-10', updated_at: '2024-02-10' },
  { id:  8, item_name: 'Noise-Cancel Headset', category: 'Headset',      quantity_available: 7,  min_quantity: 3,  model_number: 'BOSE-700-BLK',manufacturer: 'Bose',     supplier: 'CDW',             location: 'Storeroom C, Shelf 1', department: 'IT',       unit_cost: 299.99, total_cost: 2099.93,purchase_date: '2024-02-15', created_at: '2024-02-15', updated_at: '2024-02-15' },
  { id:  9, item_name: '65W USB-C Charger',    category: 'Power Supply', quantity_available: 0,  min_quantity: 6,  model_number: 'ANK-65W-GAN', manufacturer: 'Anker',    supplier: 'Amazon Business', location: 'Storeroom A, Shelf 3', department: 'IT',       unit_cost: 22.99,  total_cost: 0,      purchase_date: '2024-02-20', created_at: '2024-02-20', updated_at: '2024-02-20' },
  { id: 10, item_name: 'Thunderbolt 4 Dock',   category: 'Adapter',      quantity_available: 4,  min_quantity: 2,  model_number: 'CAL-TB4-DOCK',manufacturer: 'CalDigit', supplier: 'B&H Photo',       location: 'Storeroom A, Shelf 2', department: 'IT',       unit_cost: 249.99, total_cost: 999.96, purchase_date: '2024-03-01', created_at: '2024-03-01', updated_at: '2024-03-01' },
  { id: 11, item_name: '512 GB SSD',           category: 'Storage',      quantity_available: 6,  min_quantity: 4,  model_number: 'SAM-870-512', manufacturer: 'Samsung',  supplier: 'CDW',             location: 'Storeroom C, Shelf 2', department: 'IT',       unit_cost: 54.99,  total_cost: 329.94, purchase_date: '2024-03-05', created_at: '2024-03-05', updated_at: '2024-03-05' },
  { id: 12, item_name: '16 GB DDR5 RAM',       category: 'RAM',          quantity_available: 8,  min_quantity: 4,  model_number: 'COR-16G-DDR5',manufacturer: 'Corsair',  supplier: 'Newegg',          location: 'Storeroom C, Shelf 2', department: 'IT',       unit_cost: 44.99,  total_cost: 359.92, purchase_date: '2024-03-08', created_at: '2024-03-08', updated_at: '2024-03-08' },
  { id: 13, item_name: '27" Monitor',          category: 'Monitor',      quantity_available: 2,  min_quantity: 2,  model_number: 'LG-27-4K-UHD',manufacturer: 'LG',       supplier: 'Insight',         location: 'Storeroom B, Shelf 3', department: 'IT',       unit_cost: 349.99, total_cost: 699.98, purchase_date: '2024-03-10', created_at: '2024-03-10', updated_at: '2024-03-10' },
  { id: 14, item_name: 'USB-C Cable 1m',       category: 'Cable',        quantity_available: 30, min_quantity: 10, model_number: 'ANK-USB1M',   manufacturer: 'Anker',    supplier: 'Amazon Business', location: 'Storeroom A, Shelf 1', department: 'IT',       unit_cost: 8.99,   total_cost: 269.70, purchase_date: '2024-03-12', created_at: '2024-03-12', updated_at: '2024-03-12' },
  { id: 15, item_name: 'VESA Monitor Mount',   category: 'Other',        quantity_available: 1,  min_quantity: 2,  model_number: 'ERG-MNT-V1',  manufacturer: 'Ergotron', supplier: 'CDW',             location: 'Storeroom B, Shelf 3', department: 'Operations', unit_cost: 79.99, total_cost: 79.99,  purchase_date: '2024-03-15', created_at: '2024-03-15', updated_at: '2024-03-15' },
  { id: 16, item_name: 'Ethernet Cable 5m',    category: 'Cable',        quantity_available: 18, min_quantity: 5,  model_number: 'PATCH-5M-BLU',manufacturer: 'Tripp Lite',supplier: 'CDW',            location: 'Storeroom A, Shelf 1', department: 'IT',       unit_cost: 6.99,   total_cost: 125.82, purchase_date: '2024-03-18', created_at: '2024-03-18', updated_at: '2024-03-18' },
  { id: 17, item_name: 'Surge Protector 6-Way',category: 'Power Supply', quantity_available: 5,  min_quantity: 3,  model_number: 'APC-6W-SURGE',manufacturer: 'APC',      supplier: 'Insight',         location: 'Storeroom A, Shelf 3', department: 'Operations', unit_cost: 34.99, total_cost: 174.95, purchase_date: '2024-03-20', created_at: '2024-03-20', updated_at: '2024-03-20' },
  { id: 18, item_name: 'Laptop Backpack',      category: 'Other',        quantity_available: 0,  min_quantity: 3,  model_number: 'TOMTOC-BP-15',manufacturer: 'Tomtoc',   supplier: 'Amazon Business', location: 'Storeroom B, Shelf 2', department: 'Operations', unit_cost: 49.99, total_cost: 0,      purchase_date: '2024-03-22', created_at: '2024-03-22', updated_at: '2024-03-22' },
  { id: 19, item_name: 'Webcam 4K',            category: 'Other',        quantity_available: 4,  min_quantity: 2,  model_number: 'LOG-BRIO-4K', manufacturer: 'Logitech', supplier: 'B&H Photo',       location: 'Storeroom C, Shelf 1', department: 'IT',       unit_cost: 149.99, total_cost: 599.96, purchase_date: '2024-04-01', created_at: '2024-04-01', updated_at: '2024-04-01' },
  { id: 20, item_name: 'Display Port Cable',   category: 'Cable',        quantity_available: 1,  min_quantity: 5,  model_number: 'DP-1M4-BLK',  manufacturer: 'Cable Matters', supplier: 'Amazon Business', location: 'Storeroom A, Shelf 1', department: 'IT', unit_cost: 11.99, total_cost: 11.99, purchase_date: '2024-04-05', created_at: '2024-04-05', updated_at: '2024-04-05' },
];

type FilterTab = 'All' | 'Low Stock' | 'Out of Stock';
const FILTER_TABS: FilterTab[] = ['All', 'Low Stock', 'Out of Stock'];

const INV_SORT_OPTIONS = [
  'Name (A–Z)', 'Name (Z–A)',
  'Qty (High–Low)', 'Qty (Low–High)',
  'Date Added (Newest)', 'Date Added (Oldest)',
];

const ROWS_PER_PAGE = 10;

// ── Category thumbnail ────────────────────────────────────────────────────────

type CategoryKey = 'Cable' | 'Adapter' | 'Keyboard' | 'Mouse' | 'Headset' | 'Power Supply' | 'Storage' | 'RAM' | 'Monitor' | 'Other';

const CATEGORY_META: Record<CategoryKey, { Icon: React.ElementType; bg: string; iconColor: string }> = {
  'Cable':         { Icon: Cable,       bg: 'rgba(46,124,253,0.10)',  iconColor: colors.primary },
  'Adapter':       { Icon: Plug,        bg: 'rgba(45,252,249,0.12)',  iconColor: '#0eb5b3' },
  'Keyboard':      { Icon: Keyboard,    bg: 'rgba(46,124,253,0.10)',  iconColor: colors.primary },
  'Mouse':         { Icon: Mouse,       bg: 'rgba(66,80,102,0.10)',   iconColor: colors.blueGrayDark },
  'Headset':       { Icon: Headphones,  bg: 'rgba(252,156,45,0.12)',  iconColor: colors.orangeAccent },
  'Power Supply':  { Icon: Zap,         bg: 'rgba(252,156,45,0.12)',  iconColor: colors.orangeAccent },
  'Storage':       { Icon: HardDrive,   bg: 'rgba(46,124,253,0.10)',  iconColor: colors.primary },
  'RAM':           { Icon: MemoryStick, bg: 'rgba(34,197,94,0.10)',   iconColor: colors.success },
  'Monitor':       { Icon: Monitor,     bg: 'rgba(70,98,145,0.10)',   iconColor: colors.blueGrayMd },
  'Other':         { Icon: Package,     bg: 'rgba(66,80,102,0.10)',   iconColor: colors.blueGrayDark },
};

function CategoryThumbnail({ category }: { category: string | null | undefined }) {
  const meta = CATEGORY_META[(category ?? 'Other') as CategoryKey] ?? CATEGORY_META['Other'];
  const { Icon, bg, iconColor } = meta;
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: bg,
        border: '1px solid rgba(70,98,145,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={15} color={iconColor} strokeWidth={1.75} />
    </div>
  );
}

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
  const [inventory, setInventory] = useState<StoreroomInventory[]>(INITIAL_INVENTORY);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>('Assets');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ departments: string[]; locations: string[] }>({ departments: [], locations: [] });
  const [activeSort, setActiveSort] = useState('Name (A–Z)');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // ── Modal targets ────────────────────────────────────────────────────────
  const [deleteTarget,   setDeleteTarget]   = useState<StoreroomInventory | null>(null);
  const [editTarget,     setEditTarget]     = useState<StoreroomInventory | null>(null);
  const [checkInTarget,  setCheckInTarget]  = useState<StoreroomInventory | null>(null);
  const [checkOutTarget, setCheckOutTarget] = useState<StoreroomInventory | null>(null);

  // ── Derived data ─────────────────────────────────────────────────────────
  const allInvCategories = useMemo(
    () => [...new Set(inventory.map(i => i.category ?? '').filter(Boolean))].sort(),
    [inventory],
  );
  const allDepartments = useMemo(
    () => [...new Set(inventory.map(i => i.department ?? '').filter(Boolean))].sort(),
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
      { title: 'Total Items',  value: totalItems,  trend: { value: 12, direction: 'up'   as const } },
      { title: 'Total Units',  value: totalUnits,  trend: { value: 8,  direction: 'up'   as const } },
      { title: 'Low Stock',    value: lowStock,    trend: { value: 25, direction: 'down' as const } },
      { title: 'Out of Stock', value: outOfStock },
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
    if (activeFilters.departments.length > 0) items = items.filter(i => activeFilters.departments.includes(i.department ?? ''));
    if (activeFilters.locations.length > 0)   items = items.filter(i => activeFilters.locations.includes((i.location ?? '').split(',')[0].trim()));
    // Search
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(i =>
        i.item_name.toLowerCase().includes(q) ||
        (i.model_number ?? '').toLowerCase().includes(q) ||
        (i.category ?? '').toLowerCase().includes(q) ||
        (i.manufacturer ?? '').toLowerCase().includes(q) ||
        (i.location ?? '').toLowerCase().includes(q) ||
        (i.department ?? '').toLowerCase().includes(q),
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
  const toggleRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const closeDropdowns = () => { setFilterOpen(false); setSortOpen(false); };

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleDelete = () => {
    if (!deleteTarget) return;
    // TODO: DELETE /api/inventory/:id/ + POST /api/transactions/ when backend is ready
    setInventory(prev => prev.filter(i => i.id !== deleteTarget.id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTarget.id); return n; });
    setDeleteTarget(null);
  };

  const handleSaveEdit = (updated: StoreroomInventory) => {
    // TODO: PATCH /api/inventory/:id/ + POST /api/transactions/ when backend is ready
    setInventory(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleCheckIn = (itemId: number, quantity: number, _notes: string) => {
    // TODO: POST /api/inventory/:id/checkin/ + POST /api/transactions/ when backend is ready
    setInventory(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, quantity_available: i.quantity_available + quantity, updated_at: new Date().toISOString().split('T')[0] }
        : i,
    ));
  };

  const handleCheckOut = (itemId: number, quantity: number, _assignedTo: string, _notes: string) => {
    // TODO: POST /api/inventory/:id/checkout/ + POST /api/transactions/ when backend is ready
    setInventory(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, quantity_available: Math.max(0, i.quantity_available - quantity), updated_at: new Date().toISOString().split('T')[0] }
        : i,
    ));
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl2 }}>
            {statCards.map(card => (
              <StatisticCard key={card.title} title={card.title} value={card.value} trend={card.trend} />
            ))}
          </div>

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
                  Storeroom Inventory
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
                  departments={allDepartments}
                  locations={allLocations}
                  active={activeFilters}
                  onToggleDept={(d) => {
                    setActiveFilters(prev => ({
                      ...prev,
                      departments: prev.departments.includes(d)
                        ? prev.departments.filter(x => x !== d)
                        : [...prev.departments, d],
                    }));
                    setCurrentPage(1);
                  }}
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

            {/* Table */}
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
                    <th style={TH}>Item Name</th>
                    <th style={TH}>Model Number</th>
                    <th style={TH}>Category</th>
                    <th style={{ ...TH, textAlign: 'center' }}>Qty Available</th>
                    <th style={{ ...TH, textAlign: 'center' }}>Min Qty</th>
                    <th style={TH}>Location</th>
                    <th style={TH}>Department</th>
                    <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
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
                          style={{ backgroundColor: idx % 2 === 0 ? 'colors.bgSurface' : 'colors.bgStripe' }}
                        >
                          {/* Checkbox */}
                          <td style={{ ...TD, textAlign: 'center', width: '2.5rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => toggleRow(item.id)}
                              style={{ cursor: 'pointer', accentColor: colors.primary }}
                            />
                          </td>

                          {/* Thumbnail */}
                          <td style={{ ...TD, width: '3.25rem', padding: '0.5rem 0.5rem' }}>
                            <CategoryThumbnail category={item.category} />
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

                          {/* Department */}
                          <td style={{ ...TD, color: colors.blueGrayMd }}>
                            {item.department ?? '—'}
                          </td>

                          {/* Actions */}
                          <td style={{ ...TD, textAlign: 'right' }}>
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
      <AddInventoryModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />

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
        onClose={() => setCheckOutTarget(null)}
        onConfirm={handleCheckOut}
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
  departments,
  locations,
  active,
  onToggleDept,
  onToggleLoc,
}: {
  open: boolean;
  onToggle: () => void;
  departments: string[];
  locations: string[];
  active: { departments: string[]; locations: string[] };
  onToggleDept: (d: string) => void;
  onToggleLoc: (l: string) => void;
}) {
  const hasActive = active.departments.length > 0 || active.locations.length > 0;
  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <button
        onClick={onToggle}
        title="Filter by department or location"
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
            Department
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md }}>
            {departments.map(d => {
              const isActive = active.departments.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => onToggleDept(d)}
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
                  {d}
                </button>
              );
            })}
          </div>

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

import { useState, useMemo } from 'react';
import { Trash2, Pencil, RefreshCw, Plus, Download, AlertTriangle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import FeatureNotAvailableModal from '../components/FeatureNotAvailableModal';
import AddInventoryModal from '../components/AddInventoryModal';
import { colors, spacing, radius } from '../theme';
import type { StoreroomInventory } from '../types/inventory';

// ── Dummy data ─────────────────────────────────────────────────────────────────

const DUMMY_INVENTORY: StoreroomInventory[] = [
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

// ── Derived stat values ────────────────────────────────────────────────────────

const TOTAL_ITEMS = DUMMY_INVENTORY.length;
const LOW_STOCK   = DUMMY_INVENTORY.filter(i => i.quantity_available > 0 && i.quantity_available < i.min_quantity).length;
const OUT_OF_STOCK = DUMMY_INVENTORY.filter(i => i.quantity_available === 0).length;
const TOTAL_UNITS  = DUMMY_INVENTORY.reduce((s, i) => s + i.quantity_available, 0);

const STAT_CARDS = [
  { title: 'Total Items',   value: TOTAL_ITEMS,  trend: { value: 12, direction: 'up'   as const } },
  { title: 'Total Units',   value: TOTAL_UNITS,  trend: { value: 8,  direction: 'up'   as const } },
  { title: 'Low Stock',     value: LOW_STOCK,    trend: { value: 25, direction: 'down' as const } },
  { title: 'Out of Stock',  value: OUT_OF_STOCK },
];

type FilterTab = 'All' | 'Low Stock' | 'Out of Stock';
const FILTER_TABS: FilterTab[] = ['All', 'Low Stock', 'Out of Stock'];

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
  backgroundColor: '#f8fafc',
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = DUMMY_INVENTORY;
    if (activeTab === 'Low Stock')    items = items.filter(i => i.quantity_available > 0 && i.quantity_available < i.min_quantity);
    if (activeTab === 'Out of Stock') items = items.filter(i => i.quantity_available === 0);
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
    return items;
  }, [search, activeTab]);

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

  const showFeatureModal = () => setFeatureModalOpen(true);

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

          {/* ── Stat cards ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl2 }}>
            {STAT_CARDS.map(card => (
              <StatisticCard key={card.title} title={card.title} value={card.value} trend={card.trend} />
            ))}
          </div>

          {/* ── Inventory table card ── */}
          <div
            style={{
              backgroundColor: '#ffffff',
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
                borderBottom: '1px solid rgba(70, 98, 145, 0.1)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: spacing.md,
              }}
            >
              {/* Left: title + filter tabs */}
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
                          ? tab === 'Out of Stock' ? '#ef4444'
                          : tab === 'Low Stock'   ? colors.orangeAccent
                          : colors.primary
                          : 'transparent',
                        color: activeTab === tab ? '#ffffff' : colors.blueGrayMd,
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

              {/* Right: search + export + new */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Search items…" />
                <button
                  onClick={showFeatureModal}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing.xs,
                    padding: `0.375rem ${spacing.md}`,
                    borderRadius: radius.md,
                    border: '1px solid rgba(70,98,145,0.25)',
                    backgroundColor: '#ffffff',
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
                    color: '#ffffff',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={13} />
                  New
                </button>
              </div>
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
                        colSpan={9}
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
                          style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}
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

                          {/* Item Name */}
                          <td style={{ ...TD, fontWeight: 500 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                              {item.item_name}
                              {isLowStock && (
                                <AlertTriangle size={11} color={colors.orangeAccent} title="Low stock" />
                              )}
                              {isOutOfStock && (
                                <AlertTriangle size={11} color="#ef4444" title="Out of stock" />
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
                                color: isOutOfStock ? '#ef4444' : isLowStock ? colors.orangeAccent : '#22c55e',
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
                                onClick={showFeatureModal}
                                title="Delete"
                                style={iconBtnStyle('#ef4444')}
                              >
                                <Trash2 size={11} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={showFeatureModal}
                                title="Edit"
                                style={iconBtnStyle(colors.blueGrayMd)}
                              >
                                <Pencil size={11} />
                              </button>

                              {/* Restock */}
                              <button
                                onClick={showFeatureModal}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  padding: `0.2rem 0.625rem`,
                                  borderRadius: radius.full,
                                  border: 'none',
                                  backgroundColor: colors.primary,
                                  color: '#ffffff',
                                  fontFamily: "'Archivo', sans-serif",
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <RefreshCw size={9} />
                                Restock
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
        </main>
      </div>

      {/* Modals */}
      <FeatureNotAvailableModal isOpen={featureModalOpen} onClose={() => setFeatureModalOpen(false)} />
      <AddInventoryModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
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
    color: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  };
}

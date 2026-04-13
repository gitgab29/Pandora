import { useState, useMemo } from 'react';
import { Trash2, Pencil, Copy, Plus, Download, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import SortDropdown from '../components/SortDropdown';
import FeatureNotAvailableModal from '../components/FeatureNotAvailableModal';
import AddAssetModal from '../components/AddAssetModal';
import { colors, spacing, radius } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';

// ── Dummy data ─────────────────────────────────────────────────────────────────

const DUMMY_ASSETS: Asset[] = [
  { id:  1, asset_name: 'Asus Laptop',      asset_tag: 'ES-001', category: 'Laptop', status: 'Available', serial_number: 'q13411234ldsf',    assigned_to: undefined,           created_at: '2024-01-10', updated_at: '2024-01-10' },
  { id:  2, asset_name: 'MacBook Pro',       asset_tag: 'ES-002', category: 'Laptop', status: 'Deployed',  serial_number: '412345dsfq',        assigned_to: 'Lebron Jeymz',      created_at: '2024-01-12', updated_at: '2024-03-15' },
  { id:  3, asset_name: 'iPhone 15 Pro',     asset_tag: 'ES-003', category: 'Phone',  status: 'Available', serial_number: '14231asdfgasd',    assigned_to: undefined,           created_at: '2024-01-15', updated_at: '2024-01-15' },
  { id:  4, asset_name: 'Samsung S24',       asset_tag: 'ES-004', category: 'Phone',  status: 'Deployed',  serial_number: 'q131dsf13s',        assigned_to: 'Stephen Carry',     created_at: '2024-01-18', updated_at: '2024-02-20' },
  { id:  5, asset_name: 'MacBook Air',       asset_tag: 'ES-005', category: 'Laptop', status: 'Available', serial_number: 'asd13241dgjwe',    assigned_to: undefined,           created_at: '2024-01-20', updated_at: '2024-01-20' },
  { id:  6, asset_name: 'Samsung Laptop',    asset_tag: 'ES-006', category: 'Laptop', status: 'Deployed',  serial_number: '12345y0jf',         assigned_to: 'Ronald MacDonald',  created_at: '2024-01-22', updated_at: '2024-03-01' },
  { id:  7, asset_name: 'Mac Mini',          asset_tag: 'ES-007', category: 'PC',     status: 'Available', serial_number: '14234568978f9gr',  assigned_to: undefined,           created_at: '2024-01-25', updated_at: '2024-01-25' },
  { id:  8, asset_name: 'Google Pixel 8',    asset_tag: 'ES-008', category: 'Phone',  status: 'Available', serial_number: 'qerjqkhwekjq',     assigned_to: undefined,           created_at: '2024-02-01', updated_at: '2024-02-01' },
  { id:  9, asset_name: 'Dell XPS 15',       asset_tag: 'ES-009', category: 'Laptop', status: 'Available', serial_number: '14321ksdafadfd',   assigned_to: undefined,           created_at: '2024-02-03', updated_at: '2024-02-03' },
  { id: 10, asset_name: 'iPad Pro 12.9',     asset_tag: 'ES-010', category: 'Tablet', status: 'Deployed',  serial_number: 'ipad2024xpro12',   assigned_to: 'Maria Chen',        created_at: '2024-02-05', updated_at: '2024-03-10' },
  { id: 11, asset_name: 'Surface Pro 9',     asset_tag: 'ES-011', category: 'Tablet', status: 'Available', serial_number: 'surf9pro2024ab',   assigned_to: undefined,           created_at: '2024-02-08', updated_at: '2024-02-08' },
  { id: 12, asset_name: 'ThinkPad X1',       asset_tag: 'ES-012', category: 'Laptop', status: 'In Repair', serial_number: 'tpx1c2024q1',      assigned_to: undefined,           created_at: '2024-02-10', updated_at: '2024-04-01' },
  { id: 13, asset_name: 'HP EliteBook',      asset_tag: 'ES-013', category: 'Laptop', status: 'Available', serial_number: 'hpelite840g9x',   assigned_to: undefined,           created_at: '2024-02-12', updated_at: '2024-02-12' },
  { id: 14, asset_name: 'Mac Pro',           asset_tag: 'ES-014', category: 'PC',     status: 'Deployed',  serial_number: 'macpro2024m2u',    assigned_to: 'Tyler Brooks',      created_at: '2024-02-15', updated_at: '2024-03-20' },
  { id: 15, asset_name: 'iPhone 14',         asset_tag: 'ES-015', category: 'Phone',  status: 'Available', serial_number: 'ip14pro2024bb',    assigned_to: undefined,           created_at: '2024-02-18', updated_at: '2024-02-18' },
  { id: 16, asset_name: 'Dell Latitude',     asset_tag: 'ES-016', category: 'Laptop', status: 'Available', serial_number: 'dlat5540x2024',   assigned_to: undefined,           created_at: '2024-02-20', updated_at: '2024-02-20' },
  { id: 17, asset_name: 'MacBook Pro 16',    asset_tag: 'ES-017', category: 'Laptop', status: 'Deployed',  serial_number: 'mbp16m3pro2024',   assigned_to: 'Priya Nair',        created_at: '2024-02-22', updated_at: '2024-03-25' },
  { id: 18, asset_name: 'Samsung Galaxy S23',asset_tag: 'ES-018', category: 'Phone',  status: 'Retired',   serial_number: 'sgs23u2022ret',    assigned_to: undefined,           created_at: '2022-06-01', updated_at: '2024-01-05' },
  { id: 19, asset_name: 'Asus ZenBook',      asset_tag: 'ES-019', category: 'Laptop', status: 'Available', serial_number: 'zenbookux482024',  assigned_to: undefined,           created_at: '2024-03-01', updated_at: '2024-03-01' },
  { id: 20, asset_name: 'HP Spectre x360',   asset_tag: 'ES-020', category: 'Laptop', status: 'In Repair', serial_number: 'hpspec360x2024',   assigned_to: undefined,           created_at: '2024-03-05', updated_at: '2024-04-02' },
  { id: 21, asset_name: 'iPhone 15',         asset_tag: 'ES-021', category: 'Phone',  status: 'Available', serial_number: 'ip152024stdx',     assigned_to: undefined,           created_at: '2024-03-08', updated_at: '2024-03-08' },
  { id: 22, asset_name: 'iPad Air',          asset_tag: 'ES-022', category: 'Tablet', status: 'Deployed',  serial_number: 'ipadair52024s',    assigned_to: 'Sam Okafor',        created_at: '2024-03-10', updated_at: '2024-03-28' },
  { id: 23, asset_name: 'Lenovo IdeaPad',    asset_tag: 'ES-023', category: 'Laptop', status: 'Available', serial_number: 'lenovoidea5i24',   assigned_to: undefined,           created_at: '2024-03-12', updated_at: '2024-03-12' },
  { id: 24, asset_name: 'Google Pixel 7a',   asset_tag: 'ES-024', category: 'Phone',  status: 'To Audit',  serial_number: 'pixel7a2023chk',   assigned_to: undefined,           created_at: '2023-08-01', updated_at: '2024-04-10' },
  { id: 25, asset_name: 'Dell Precision',    asset_tag: 'ES-025', category: 'PC',     status: 'Available', serial_number: 'dellprec3680x',    assigned_to: undefined,           created_at: '2024-03-15', updated_at: '2024-03-15' },
];

// ── Stat card data ─────────────────────────────────────────────────────────────

const STAT_CARDS = [
  { title: 'Available', value: 56, trend: { value: 66, direction: 'up' as const } },
  { title: 'Deployed',  value: 18, trend: { value: 66, direction: 'down' as const } },
  { title: 'To Audit',  value: 4 },
];

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AssetStatus, { dot: string; label: string }> = {
  'Available': { dot: '#22c55e', label: 'Available' },
  'Deployed':  { dot: colors.primary, label: 'Deployed' },
  'In Repair': { dot: colors.orangeAccent, label: 'In Repair' },
  'Retired':   { dot: '#6b7280', label: 'Retired' },
  'To Audit':  { dot: '#eab308', label: 'To Audit' },
};

const FILTER_TABS: Array<AssetStatus | 'All'> = [
  'All', 'Available', 'Deployed', 'In Repair', 'Retired', 'To Audit',
];

const ALL_CATEGORIES = [...new Set(DUMMY_ASSETS.map(a => a.category))].sort();

const SORT_OPTIONS = ['Name (A–Z)', 'Name (Z–A)', 'Date Added (Newest)', 'Date Added (Oldest)', 'Status'];

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

export default function Assets() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<AssetStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeSort, setActiveSort] = useState('Name (A–Z)');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = DUMMY_ASSETS;
    if (activeTab !== 'All') items = items.filter(a => a.status === activeTab);
    if (activeCategories.length > 0) items = items.filter(a => activeCategories.includes(a.category));
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(a =>
        a.asset_name.toLowerCase().includes(q) ||
        a.serial_number.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.asset_tag.toLowerCase().includes(q) ||
        (a.assigned_to ?? '').toLowerCase().includes(q),
      );
    }
    const sorted = [...items];
    if (activeSort === 'Name (A–Z)')           sorted.sort((a, b) => a.asset_name.localeCompare(b.asset_name));
    else if (activeSort === 'Name (Z–A)')       sorted.sort((a, b) => b.asset_name.localeCompare(a.asset_name));
    else if (activeSort === 'Date Added (Newest)') sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (activeSort === 'Date Added (Oldest)') sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    else if (activeSort === 'Status')           sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  }, [search, activeTab, activeCategories, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

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
  const toggleRow = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const showFeatureModal = () => setFeatureModalOpen(true);

  const closeDropdowns = () => { setFilterOpen(false); setSortOpen(false); };

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
        <Header title="Assets" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* ── Stat cards ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl2 }}>
            {STAT_CARDS.map(card => (
              <StatisticCard key={card.title} title={card.title} value={card.value} trend={card.trend} />
            ))}
          </div>

          {/* ── Asset table card ── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: radius.lg,
              border: '1px solid rgba(70, 98, 145, 0.1)',
              boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Table toolbar */}
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
                        color: activeTab === tab ? '#ffffff' : colors.blueGrayMd,
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.15s, color 0.15s',
                      }}
                    >
                      {tab === 'All' ? 'All Assets' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: search + filter + sort + export + new */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Hint: search text" />
                <CategoryFilterDropdown
                  open={filterOpen}
                  onToggle={() => { setFilterOpen(o => !o); setSortOpen(false); }}
                  categories={ALL_CATEGORIES}
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
                    <th style={{ ...TH, width: '3.25rem', padding: '0.625rem 0.5rem' }} />
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
                      const statusCfg = STATUS_CONFIG[asset.status];
                      const isCheckedOut = asset.status === 'Available';
                      const isCheckedIn  = asset.status === 'Deployed';
                      const pillVisible  = isCheckedOut || isCheckedIn;
                      return (
                        <tr
                          key={asset.id}
                          style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}
                        >
                          {/* Checkbox */}
                          <td style={{ ...TD, textAlign: 'center', width: '2.5rem' }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(asset.id)}
                              onChange={() => toggleRow(asset.id)}
                              style={{ cursor: 'pointer', accentColor: colors.primary }}
                            />
                          </td>

                          {/* Thumbnail */}
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

                          {/* Item Name */}
                          <td style={{ ...TD, fontWeight: 500 }}>{asset.asset_name}</td>

                          {/* Serial Number */}
                          <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem', fontFamily: "'Roboto Mono', monospace" }}>
                            {asset.serial_number}
                          </td>

                          {/* Category */}
                          <td style={TD}>{asset.category}</td>

                          {/* Current Holder */}
                          <td style={{ ...TD, color: asset.assigned_to ? colors.textPrimary : colors.blueGrayMd }}>
                            {asset.assigned_to ?? '—'}
                          </td>

                          {/* Status */}
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

                              {/* Copy */}
                              <button
                                onClick={showFeatureModal}
                                title="Copy Item"
                                style={iconBtnStyle(colors.primary)}
                              >
                                <Copy size={11} />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={showFeatureModal}
                                title="Edit"
                                style={iconBtnStyle(colors.blueGrayMd)}
                              >
                                <Pencil size={11} />
                              </button>

                              {/* Check Out / Check In — always rendered for uniform column width */}
                              <button
                                onClick={pillVisible ? showFeatureModal : undefined}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '5.5rem',
                                  padding: `0.2rem 0`,
                                  borderRadius: radius.full,
                                  border: 'none',
                                  backgroundColor: isCheckedOut ? '#22c55e' : colors.orangeAccent,
                                  color: '#ffffff',
                                  fontFamily: "'Archivo', sans-serif",
                                  fontSize: '0.6875rem',
                                  fontWeight: 700,
                                  cursor: pillVisible ? 'pointer' : 'default',
                                  whiteSpace: 'nowrap',
                                  visibility: pillVisible ? 'visible' : 'hidden',
                                  flexShrink: 0,
                                }}
                              >
                                {isCheckedOut ? 'Check Out' : 'Check In'}
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
      <AddAssetModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />

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
    color: '#ffffff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  };
}

// ── CategoryFilterDropdown ────────────────────────────────────────────────────

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
          backgroundColor: open || hasActive ? 'rgba(46,124,253,0.06)' : '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: open || hasActive ? colors.primary : colors.blueGrayMd,
          position: 'relative',
          flexShrink: 0,
          transition: 'all 0.15s ease',
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
            backgroundColor: '#ffffff',
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
                    color: isActive ? '#ffffff' : colors.blueGrayMd,
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

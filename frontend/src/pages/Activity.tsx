import { useState, useMemo } from 'react';
import { Trash2, Eye, Download, ListFilter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import SortDropdown from '../components/SortDropdown';
import FeatureNotAvailableModal from '../components/FeatureNotAvailableModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { colors, spacing, radius } from '../theme';
import type { TransactionLog } from '../types/activity';

// ── Dummy data ─────────────────────────────────────────────────────────────────

const USERS       = ['LeJon James', 'Maria Chen', 'Tyler Brooks', 'Priya Nair', 'Sam Okafor', 'Jordan Lee', 'Alexis Wong', 'Devon Martinez'];
const TYPES       = ['Asset', 'Inventory', 'License'] as const;
const EVENTS      = ['Check In', 'Check Out', 'Update', 'Audit', 'Request'] as const;
const ITEMS       = ['MacBook Pro', 'Dell Monitor', 'USB-C Dock', 'iPhone 15 Pro', 'iPad Air', 'Magic Keyboard', 'MX Master Mouse', 'Samsung S24', 'HP EliteBook', 'Mac Mini', 'Surface Pro 9', 'Logitech Headset', 'USB Hub', 'Dell Precision', 'ThinkPad X1'];
const DEPARTMENTS = ['Engineering', 'Operations', 'IT', 'Finance', 'HR', 'Marketing', 'Sales'];
const NOTES       = ['Updated the RAM detail', 'Device returned in good condition', 'Assigned to new hire', 'Warranty verified', 'Replaced broken unit', 'Upgraded storage to 1TB', 'Synced with inventory system', '—', 'Serial number confirmed', 'Pending approval'];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLogs(count: number): TransactionLog[] {
  const base = new Date('2026-04-14T09:00:00');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base.getTime() - i * 1000 * 60 * 73);
    return {
      id:         i + 1,
      date:       `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
      user:       pick(USERS),
      type:       pick(TYPES),
      event:      pick(EVENTS),
      item:       pick(ITEMS),
      toFrom:     Math.random() > 0.4 ? pick(USERS) : '—',
      notes:      pick(NOTES),
      department: pick(DEPARTMENTS),
    };
  });
}

const INITIAL_LOGS: TransactionLog[] = generateLogs(120);

// ── Constants ──────────────────────────────────────────────────────────────────

const EVENT_TABS = ['All', 'Check In', 'Check Out', 'Update', 'Audit', 'Request'] as const;
type EventTab = typeof EVENT_TABS[number];

const TYPE_FILTER_OPTIONS  = ['All', 'Asset', 'Inventory', 'License'];
const DEPT_FILTER_OPTIONS  = ['All', ...DEPARTMENTS];

const SORT_OPTIONS = [
  'Date (Newest first)',
  'Date (Oldest first)',
  'User (A–Z)',
  'Item (A–Z)',
  'Event (A–Z)',
];

const ROWS_PER_PAGE = 15;

// ── Style tokens ──────────────────────────────────────────────────────────────

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
  borderBottom: '1px solid rgba(70,98,145,0.12)',
  backgroundColor: colors.bgStripe,
};

const TD: React.CSSProperties = {
  padding: '0.6875rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.8125rem',
  color: colors.textPrimary,
  borderBottom: '1px solid rgba(70,98,145,0.07)',
  whiteSpace: 'nowrap',
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Asset:     { bg: 'rgba(46,124,253,0.1)',  color: colors.primary },
  Inventory: { bg: 'rgba(45,252,249,0.12)', color: '#0891b2' },
  License:   { bg: 'rgba(252,156,45,0.12)', color: '#b45309' },
};

const EVENT_COLORS: Record<string, { bg: string; color: string }> = {
  'Check In':  { bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
  'Check Out': { bg: 'rgba(252,156,45,0.12)', color: '#b45309' },
  'Update':    { bg: 'rgba(46,124,253,0.1)',  color: colors.primary },
  'Audit':     { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed' },
  'Request':   { bg: 'rgba(45,252,249,0.12)', color: '#0891b2' },
};

const EVENT_TAB_ACCENT: Record<string, string> = {
  'Check In':  '#15803d',
  'Check Out': '#b45309',
  'Update':    colors.primary,
  'Audit':     '#7c3aed',
  'Request':   '#0891b2',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Activity() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logs, setLogs] = useState<TransactionLog[]>(INITIAL_LOGS);

  // Filters & search
  const [eventTab,    setEventTab]    = useState<EventTab>('All');
  const [activeType,  setActiveType]  = useState('All');
  const [activeDept,  setActiveDept]  = useState('All');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [sortOpen,    setSortOpen]    = useState(false);
  const [activeSort,  setActiveSort]  = useState(SORT_OPTIONS[0]);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modals
  const [detailLog,       setDetailLog]       = useState<TransactionLog | null>(null);
  const [deleteTarget,    setDeleteTarget]    = useState<TransactionLog | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const closeDropdowns = () => { setFilterOpen(false); setSortOpen(false); };
  const filterActive   = activeType !== 'All' || activeDept !== 'All';

  // ── Filtering + sorting pipeline ──────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = logs;

    if (eventTab !== 'All')   result = result.filter(l => l.event      === eventTab);
    if (activeType !== 'All') result = result.filter(l => l.type       === activeType);
    if (activeDept !== 'All') result = result.filter(l => l.department === activeDept);

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter(l =>
        l.user.toLowerCase().includes(q)                ||
        l.type.toLowerCase().includes(q)                ||
        l.event.toLowerCase().includes(q)               ||
        l.item.toLowerCase().includes(q)                ||
        l.notes.toLowerCase().includes(q)               ||
        l.toFrom.toLowerCase().includes(q)              ||
        (l.department ?? '').toLowerCase().includes(q),
      );
    }

    return [...result].sort((a, b) => {
      switch (activeSort) {
        case 'Date (Oldest first)': return a.id - b.id;
        case 'User (A–Z)':          return a.user.localeCompare(b.user);
        case 'Item (A–Z)':          return a.item.localeCompare(b.item);
        case 'Event (A–Z)':         return a.event.localeCompare(b.event);
        default:                    return b.id - a.id;
      }
    });
  }, [logs, eventTab, activeType, activeDept, search, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  const pageLogs = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  // ── Selection ─────────────────────────────────────────────────────────────

  const pageIds        = pageLogs.map(l => l.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const someSelected    = pageIds.some(id => selectedIds.has(id));

  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = (log: TransactionLog) => {
    setLogs(prev => prev.filter(l => l.id !== log.id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(log.id); return next; });
    setDeleteTarget(null);
  };

  const handleBulkDelete = () => {
    setLogs(prev => prev.filter(l => !selectedIds.has(l.id)));
    setSelectedIds(new Set());
  };

  // ── Render ────────────────────────────────────────────────────────────────

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
          backgroundColor: 'rgba(244,246,249,0.92)',
        }}
      >
        <Header title="Activity Log" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* ── Table card ── */}
          <div
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: radius.lg,
              border: '1px solid rgba(70,98,145,0.1)',
              boxShadow: '0 1px 4px rgba(3,12,35,0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Backdrop — closes dropdowns */}
            {(filterOpen || sortOpen) && (
              <div onClick={closeDropdowns} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
            )}

            {/* ── Toolbar ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${spacing.lg} ${spacing.xl}`,
                borderBottom: '1px solid rgba(70,98,145,0.1)',
                flexWrap: 'wrap',
                gap: spacing.md,
              }}
            >
              {/* Left: title + count + bulk delete */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                <h2
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                  }}
                >
                  Activity Log
                </h2>
                <span
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.75rem',
                    color: colors.blueGrayMd,
                  }}
                >
                  {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                </span>

                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: `${spacing.xs} ${spacing.md}`,
                      borderRadius: radius.full,
                      border: 'none',
                      backgroundColor: colors.bgErrorLight,
                      color: colors.error,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} />
                    Delete {selectedIds.size} selected
                  </button>
                )}
              </div>

              {/* Right: search + filter + sort + export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Search logs…" />
                <ActivityFilterDropdown
                  open={filterOpen}
                  onToggle={() => { setFilterOpen(v => !v); setSortOpen(false); }}
                  activeType={activeType}
                  activeDept={activeDept}
                  onTypeChange={t => { setActiveType(t); setCurrentPage(1); }}
                  onDeptChange={d => { setActiveDept(d); setCurrentPage(1); }}
                  filterActive={filterActive}
                />
                <SortDropdown
                  open={sortOpen}
                  onToggle={() => { setSortOpen(v => !v); setFilterOpen(false); }}
                  options={SORT_OPTIONS}
                  activeSort={activeSort}
                  onSortChange={opt => { setActiveSort(opt); setSortOpen(false); setCurrentPage(1); }}
                />
                <button
                  onClick={() => setExportModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: `0.4rem ${spacing.lg}`,
                    borderRadius: radius.full,
                    border: '1px solid rgba(70,98,145,0.2)',
                    backgroundColor: colors.bgSurface,
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: colors.blueGrayMd,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>

            {/* ── Event filter tabs ── */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid rgba(70,98,145,0.1)',
                paddingLeft: spacing.xl,
                overflowX: 'auto',
              }}
            >
              {EVENT_TABS.map(tab => {
                const active = eventTab === tab;
                const accent = tab === 'All' ? colors.primary : (EVENT_TAB_ACCENT[tab] ?? colors.primary);
                return (
                  <button
                    key={tab}
                    onClick={() => { setEventTab(tab); setCurrentPage(1); }}
                    style={{
                      padding: `${spacing.sm} ${spacing.lg}`,
                      border: 'none',
                      borderBottom: `2px solid ${active ? accent : 'transparent'}`,
                      backgroundColor: 'transparent',
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.8125rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? accent : colors.blueGrayMd,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* ── Table ── */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: '2.5rem' }}>
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={el => { if (el) el.indeterminate = someSelected && !allPageSelected; }}
                        onChange={toggleAll}
                        style={{ cursor: 'pointer', accentColor: colors.primary }}
                      />
                    </th>
                    <th style={TH}>Date</th>
                    <th style={TH}>Performed By</th>
                    <th style={TH}>Type</th>
                    <th style={TH}>Event</th>
                    <th style={TH}>Item</th>
                    <th style={TH}>To / From</th>
                    <th style={TH}>Department</th>
                    <th style={{ ...TH, width: '100%' }}>Notes</th>
                    <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.length === 0 ? (
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
                        No activity logs match your search.
                      </td>
                    </tr>
                  ) : (
                    pageLogs.map((log, idx) => {
                      const isSelected = selectedIds.has(log.id);
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setDetailLog(log)}
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(46,124,253,0.05)'
                              : idx % 2 === 0 ? 'colors.bgSurface' : 'colors.bgStripe',
                            cursor: 'pointer',
                            transition: 'background-color 0.1s',
                          }}
                          onMouseEnter={e => {
                            if (!isSelected)
                              (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(46,124,253,0.03)';
                          }}
                          onMouseLeave={e => {
                            if (!isSelected)
                              (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                                idx % 2 === 0 ? 'colors.bgSurface' : 'colors.bgStripe';
                          }}
                        >
                          {/* Checkbox — stop propagation so clicking it doesn't open detail */}
                          <td style={TD} onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(log.id)}
                              style={{ cursor: 'pointer', accentColor: colors.primary }}
                            />
                          </td>

                          <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>
                            {log.date}
                          </td>

                          <td style={{ ...TD, fontWeight: 600 }}>
                            {log.user}
                          </td>

                          <td style={TD}>
                            <TypeBadge type={log.type} />
                          </td>

                          <td style={TD}>
                            <EventBadge event={log.event} />
                          </td>

                          <td style={TD}>{log.item}</td>

                          <td style={{ ...TD, color: colors.blueGrayMd }}>
                            {log.toFrom}
                          </td>

                          <td style={{ ...TD, color: colors.blueGrayMd }}>
                            {log.department ?? '—'}
                          </td>

                          <td
                            style={{
                              ...TD,
                              color: colors.blueGrayMd,
                              maxWidth: '12rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {log.notes}
                          </td>

                          {/* Actions — stop propagation */}
                          <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: spacing.xs,
                                justifyContent: 'flex-end',
                              }}
                            >
                              <RowIconBtn
                                title="View detail"
                                hoverColor={colors.primary}
                                onClick={() => setDetailLog(log)}
                              >
                                <Eye size={13} />
                              </RowIconBtn>
                              <RowIconBtn
                                title="Delete log"
                                hoverColor="#ef4444"
                                onClick={() => setDeleteTarget(log)}
                              >
                                <Trash2 size={13} />
                              </RowIconBtn>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div
              style={{
                padding: `0 ${spacing.xl} ${spacing.sm}`,
                borderTop: '1px solid rgba(70,98,145,0.07)',
              }}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <ActivityDetailModal log={detailLog} onClose={() => setDetailLog(null)} />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        itemName={deleteTarget ? `${deleteTarget.event} #${deleteTarget.id}` : ''}
        itemType="Activity Log"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />

      <FeatureNotAvailableModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}

// ── Private helpers ────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const s = TYPE_COLORS[type] ?? { bg: colors.bgDisabled, color: colors.closeBtn };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: `0.125rem ${spacing.sm}`,
        borderRadius: '0.25rem',
        backgroundColor: s.bg,
        color: s.color,
        fontFamily: "'Archivo', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {type}
    </span>
  );
}

function EventBadge({ event }: { event: string }) {
  const s = EVENT_COLORS[event] ?? { bg: colors.bgDisabled, color: colors.closeBtn };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: `0.125rem ${spacing.sm}`,
        borderRadius: '0.25rem',
        backgroundColor: s.bg,
        color: s.color,
        fontFamily: "'Archivo', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {event}
    </span>
  );
}

function RowIconBtn({
  children,
  title,
  hoverColor,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  hoverColor: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '1.625rem',
        height: '1.625rem',
        borderRadius: radius.sm,
        border: 'none',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: colors.blueGrayDark,
        padding: 0,
        transition: 'background-color 0.12s ease, color 0.12s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${hoverColor}18`;
        (e.currentTarget as HTMLButtonElement).style.color = hoverColor;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = colors.blueGrayDark;
      }}
    >
      {children}
    </button>
  );
}

// ── Inline filter dropdown ─────────────────────────────────────────────────────

interface ActivityFilterDropdownProps {
  open: boolean;
  onToggle: () => void;
  activeType: string;
  activeDept: string;
  onTypeChange: (v: string) => void;
  onDeptChange: (v: string) => void;
  filterActive: boolean;
}

function ActivityFilterDropdown({
  open,
  onToggle,
  activeType,
  activeDept,
  onTypeChange,
  onDeptChange,
  filterActive,
}: ActivityFilterDropdownProps) {
  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      {/* Trigger button */}
      <button
        onClick={onToggle}
        style={{
          width: '2.125rem',
          height: '2.125rem',
          borderRadius: radius.md,
          border: `1px solid ${open || filterActive ? colors.primary : 'rgba(70,98,145,0.2)'}`,
          backgroundColor: open || filterActive ? 'rgba(46,124,253,0.06)' : colors.bgSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: open || filterActive ? colors.primary : colors.blueGrayMd,
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }}
      >
        <ListFilter size={15} />
        {/* Blue dot when a filter is active */}
        {filterActive && (
          <span
            style={{
              position: 'absolute',
              top: '0.2rem',
              right: '0.2rem',
              width: '0.375rem',
              height: '0.375rem',
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
            width: '15rem',
            backgroundColor: colors.bgSurface,
            borderRadius: radius.lg,
            border: '1px solid rgba(70,98,145,0.14)',
            boxShadow: '0 0.5rem 2rem rgba(3,12,35,0.12)',
            padding: spacing.md,
            zIndex: 100,
          }}
        >
          {/* Type group */}
          <p
            style={{
              margin: `0 0 ${spacing.sm}`,
              fontFamily: "'Roboto', sans-serif",
              fontSize: '0.719rem',
              fontWeight: 700,
              color: colors.blueGrayMd,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Type
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: spacing.md }}>
            {TYPE_FILTER_OPTIONS.map(opt => (
              <FilterChip key={opt} label={opt} active={activeType === opt} onClick={() => onTypeChange(opt)} />
            ))}
          </div>

          {/* Department group */}
          <p
            style={{
              margin: `0 0 ${spacing.sm}`,
              fontFamily: "'Roboto', sans-serif",
              fontSize: '0.719rem',
              fontWeight: 700,
              color: colors.blueGrayMd,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Department
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {DEPT_FILTER_OPTIONS.map(opt => (
              <FilterChip key={opt} label={opt} active={activeDept === opt} onClick={() => onDeptChange(opt)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `0.1875rem ${spacing.md}`,
        borderRadius: radius.full,
        fontFamily: "'Archivo', sans-serif",
        fontSize: '0.75rem',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        backgroundColor: active ? colors.primary : colors.bgSubtle,
        color: active ? colors.white : colors.blueGrayMd,
        border: `1px solid ${active ? colors.primary : 'rgba(70,98,145,0.15)'}`,
        transition: 'background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease',
      }}
    >
      {label}
    </button>
  );
}

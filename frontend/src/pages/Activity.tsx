import { useState, useMemo, useEffect } from 'react';
import { Eye, Download, ListFilter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import SortDropdown from '../components/SortDropdown';
import FeatureNotAvailableModal from '../components/FeatureNotAvailableModal';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { colors, spacing, radius } from '../theme';
import type { ActivityLogEntry as TransactionLog } from '../types/activity';
import { toActivityLogEntry } from '../types/activity';
import { transactionsApi } from '../api';
import { useRecency } from '../hooks/useRecency';
import RecencyBadge from '../components/RecencyBadge';

const DEPARTMENTS = ['Engineering', 'Operations', 'IT', 'Finance', 'HR', 'Human Resources', 'Product'];

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
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const { isNew, markSeen } = useRecency('activity');

  useEffect(() => {
    transactionsApi.list({ ordering: '-transaction_date', within_last_days: 15 }).then(data => setLogs(data.map(toActivityLogEntry)));
  }, []);

  // Mark feed as seen after 2.5s dwell
  useEffect(() => {
    const timer = setTimeout(markSeen, 2500);
    return () => clearTimeout(timer);
  }, [markSeen]);

  // Filters & search
  const [eventTab,    setEventTab]    = useState<EventTab>('All');
  const [activeType,  setActiveType]  = useState('All');
  const [activeDept,  setActiveDept]  = useState('All');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [sortOpen,    setSortOpen]    = useState(false);
  const [activeSort,  setActiveSort]  = useState(SORT_OPTIONS[0]);
  const [search,      setSearch]      = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailLog,       setDetailLog]       = useState<TransactionLog | null>(null);
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
        case 'Date (Oldest first)': return a.rawDate.localeCompare(b.rawDate);
        case 'User (A–Z)':          return a.user.localeCompare(b.user);
        case 'Item (A–Z)':          return a.item.localeCompare(b.item);
        case 'Event (A–Z)':         return a.event.localeCompare(b.event);
        default:                    return b.rawDate.localeCompare(a.rawDate);
      }
    });
  }, [logs, eventTab, activeType, activeDept, search, activeSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  const pageLogs = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

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
              {/* Left: title + count */}
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
                <span
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.75rem',
                    color: colors.blueGrayMd,
                    padding: `0.125rem ${spacing.sm}`,
                    borderRadius: '0.25rem',
                    backgroundColor: 'rgba(70,98,145,0.07)',
                  }}
                >
                  Last 15 days · Older in Archive
                </span>
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
                        colSpan={9}
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
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setDetailLog(log)}
                          style={{
                            backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                            cursor: 'pointer',
                            transition: 'background-color 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,124,253,0.03)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe)}
                        >
                          <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>
                            {log.date}
                            <RecencyBadge visible={isNew(log.created_at)} />
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

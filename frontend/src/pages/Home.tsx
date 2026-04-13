import { useState, useMemo } from 'react';
import { ListFilter, ArrowUpDown, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { colors } from '../theme';
import type { TransactionLog } from '../types/activity';

// ── Dummy stat data ───────────────────────────────────────────────────────────

const STAT_CARDS = [
  { title: 'Available', value: 56, trend: { value: 56, direction: 'down' as const } },
  { title: 'Pending Check Outs', value: 3, trend: { value: 49, direction: 'up' as const } },
  { title: 'Audits', value: 20, trend: { value: 66, direction: 'up' as const } },
  { title: 'Asset Requests', value: 8 },
  { title: 'Pending Check Ins', value: 2 },
];

// ── Dummy log data ────────────────────────────────────────────────────────────

const USERS = ['LeJon James', 'Maria Chen', 'Tyler Brooks', 'Priya Nair', 'Sam Okafor'];
const TYPES = ['Asset', 'Inventory', 'License'];
const EVENTS = ['Check In', 'Check Out', 'Update', 'Audit', 'Request'];
const ITEMS = ['MacBook Pro', 'Dell Monitor', 'USB-C Dock', 'iPhone 15 Pro', 'iPad Air', 'Magic Keyboard', 'MX Master Mouse'];
const NOTES = [
  'Updated the RAM Detail',
  'Device returned in good condition',
  'Assigned to new hire',
  'Warranty verified',
  'Replaced broken unit',
  'Upgraded storage to 1TB',
  'Synced with inventory system',
  '—',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLogs(count: number): TransactionLog[] {
  const base = new Date('2026-04-03T07:30:00');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base.getTime() - i * 1000 * 60 * 47);
    const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return {
      id: i + 1,
      date: `${dateStr} ${timeStr}`,
      user: randomFrom(USERS),
      type: randomFrom(TYPES),
      event: randomFrom(EVENTS),
      item: randomFrom(ITEMS),
      toFrom: Math.random() > 0.4 ? randomFrom(USERS) : '—',
      notes: randomFrom(NOTES),
    };
  });
}

const ALL_LOGS: TransactionLog[] = generateLogs(68);
const ROWS_PER_PAGE = 10;

// ── Filter / Sort options (visual only) ──────────────────────────────────────

const FILTER_GROUPS = [
  { label: 'Type', options: ['All', 'Asset', 'Inventory', 'License'] },
  { label: 'Event', options: ['All', 'Check In', 'Check Out', 'Update', 'Audit', 'Request'] },
];

const SORT_OPTIONS = [
  'Date (Newest first)',
  'Date (Oldest first)',
  'User (A–Z)',
  'Item (A–Z)',
];

// ── Table styles ──────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  padding: '10px 14px',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '11.5px',
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
  padding: '11px 14px',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '13px',
  color: colors.textPrimary,
  borderBottom: '1px solid rgba(70, 98, 145, 0.07)',
  whiteSpace: 'nowrap',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);

  const closeDropdowns = () => { setFilterOpen(false); setSortOpen(false); };

  // Filter logs by search term
  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ALL_LOGS;
    return ALL_LOGS.filter(
      log =>
        log.user.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q) ||
        log.event.toLowerCase().includes(q) ||
        log.item.toLowerCase().includes(q) ||
        log.notes.toLowerCase().includes(q) ||
        log.toFrom.toLowerCase().includes(q),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ROWS_PER_PAGE));

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  const pageLogs = filteredLogs.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

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
      {/* Invisible backdrop — closes filter/sort dropdowns */}
      {(filterOpen || sortOpen) && (
        <div
          onClick={closeDropdowns}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
        />
      )}

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
        <Header title="Home" />

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* ── Stat cards ── */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {STAT_CARDS.map(card => (
              <StatisticCard
                key={card.title}
                title={card.title}
                value={card.value}
                trend={card.trend}
              />
            ))}
          </div>

          {/* ── Activity Log ── */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(70, 98, 145, 0.1)',
              boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
              overflow: 'hidden',
            }}
          >
            {/* Section header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(70, 98, 145, 0.1)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              {/* Left: title + result count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    color: colors.textPrimary,
                    margin: 0,
                  }}
                >
                  Activity Log
                </h2>
                {search && (
                  <span
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '12px',
                      color: colors.blueGrayMd,
                    }}
                  >
                    {filteredLogs.length === 0
                      ? 'No results'
                      : `${filteredLogs.length} result${filteredLogs.length !== 1 ? 's' : ''}`}
                  </span>
                )}
              </div>

              {/* Right: search + filter + sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SearchBar value={search} onChange={handleSearch} placeholder="Search logs…" />

                {/* Filter dropdown */}
                <div style={{ position: 'relative', zIndex: 100 }}>
                  <ActionIconBtn
                    title="Filter"
                    active={filterOpen}
                    onClick={() => { setFilterOpen(v => !v); setSortOpen(false); }}
                  >
                    <ListFilter size={15} />
                  </ActionIconBtn>

                  {filterOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '38px',
                        right: 0,
                        width: '240px',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid rgba(70,98,145,0.14)',
                        boxShadow: '0 8px 32px rgba(3,12,35,0.12)',
                        padding: '14px',
                        zIndex: 100,
                      }}
                    >
                      {FILTER_GROUPS.map(group => (
                        <div key={group.label} style={{ marginBottom: '14px' }}>
                          <p
                            style={{
                              margin: '0 0 8px',
                              fontFamily: "'Roboto', sans-serif",
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: colors.blueGrayMd,
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                            }}
                          >
                            {group.label}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {group.options.map((opt, i) => (
                              <FilterChip key={opt} label={opt} active={i === 0} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort dropdown */}
                <div style={{ position: 'relative', zIndex: 100 }}>
                  <ActionIconBtn
                    title="Sort"
                    active={sortOpen}
                    onClick={() => { setSortOpen(v => !v); setFilterOpen(false); }}
                  >
                    <ArrowUpDown size={15} />
                  </ActionIconBtn>

                  {sortOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '38px',
                        right: 0,
                        width: '200px',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px',
                        border: '1px solid rgba(70,98,145,0.14)',
                        boxShadow: '0 8px 32px rgba(3,12,35,0.12)',
                        padding: '8px',
                        zIndex: 100,
                      }}
                    >
                      <p
                        style={{
                          margin: '4px 8px 8px',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: colors.blueGrayMd,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Sort by
                      </p>
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setActiveSort(opt); setSortOpen(false); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: activeSort === opt ? 'rgba(46,124,253,0.06)' : 'transparent',
                            cursor: 'pointer',
                            fontFamily: "'Archivo', sans-serif",
                            fontSize: '13px',
                            color: activeSort === opt ? colors.primary : colors.textPrimary,
                            fontWeight: activeSort === opt ? 600 : 400,
                            textAlign: 'left',
                          }}
                          onMouseEnter={e => {
                            if (activeSort !== opt) e.currentTarget.style.backgroundColor = '#f5f7fb';
                          }}
                          onMouseLeave={e => {
                            if (activeSort !== opt) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {opt}
                          {activeSort === opt && <Check size={13} color={colors.primary} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>Date</th>
                    <th style={TH}>User</th>
                    <th style={TH}>Type</th>
                    <th style={TH}>Event</th>
                    <th style={TH}>Item</th>
                    <th style={TH}>To / From</th>
                    <th style={{ ...TH, width: '100%' }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          ...TD,
                          textAlign: 'center',
                          color: colors.blueGrayMd,
                          padding: '40px 14px',
                        }}
                      >
                        No activity logs match your search.
                      </td>
                    </tr>
                  ) : (
                    pageLogs.map((log, idx) => (
                      <tr key={log.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '12px' }}>{log.date}</td>
                        <td style={TD}>{log.user}</td>
                        <td style={TD}><TypeBadge type={log.type} /></td>
                        <td style={TD}>{log.event}</td>
                        <td style={TD}>{log.item}</td>
                        <td style={{ ...TD, color: colors.blueGrayMd }}>{log.toFrom}</td>
                        <td style={{ ...TD, color: colors.blueGrayMd }}>{log.notes}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: '0 20px 8px', borderTop: '1px solid rgba(70, 98, 145, 0.07)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function ActionIconBtn({
  children,
  title,
  active,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        border: `1px solid ${active ? colors.primary : 'rgba(70, 98, 145, 0.2)'}`,
        backgroundColor: active ? 'rgba(46,124,253,0.06)' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? colors.primary : colors.blueGrayMd,
        transition: 'all 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#f5f7fb';
          e.currentTarget.style.borderColor = colors.primary;
          e.currentTarget.style.color = colors.primary;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = 'rgba(70, 98, 145, 0.2)';
          e.currentTarget.style.color = colors.blueGrayMd;
        }
      }}
    >
      {children}
    </button>
  );
}

function FilterChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '20px',
        fontFamily: "'Archivo', sans-serif",
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        backgroundColor: active ? colors.primary : '#f5f7fb',
        color: active ? '#ffffff' : colors.blueGrayMd,
        border: `1px solid ${active ? colors.primary : 'rgba(70,98,145,0.15)'}`,
        transition: 'all 0.12s ease',
      }}
    >
      {label}
    </span>
  );
}

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Asset: { bg: 'rgba(46, 124, 253, 0.1)', color: colors.primary },
  Inventory: { bg: 'rgba(45, 252, 249, 0.12)', color: '#0891b2' },
  License: { bg: 'rgba(252, 156, 45, 0.12)', color: '#b45309' },
};

function TypeBadge({ type }: { type: string }) {
  const s = TYPE_COLORS[type] ?? { bg: '#f3f4f6', color: '#374151' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: s.bg,
        color: s.color,
        fontFamily: "'Archivo', sans-serif",
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {type}
    </span>
  );
}

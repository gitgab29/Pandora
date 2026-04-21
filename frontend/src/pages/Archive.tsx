import { useState, useEffect, useMemo } from 'react';
import { ListFilter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArchiveAssetsTabContent from '../components/ArchiveAssetsTabContent';
import ArchiveAccessoriesTabContent from '../components/ArchiveAccessoriesTabContent';
import ArchiveUsersTabContent from '../components/ArchiveUsersTabContent';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { colors, spacing, radius } from '../theme';
import type { ActivityLogEntry } from '../types/activity';
import { toActivityLogEntry } from '../types/activity';
import { transactionsApi } from '../api';

type ArchiveTab = 'Assets' | 'Accessories' | 'Users' | 'Activity Logs';
const ARCHIVE_TABS: ArchiveTab[] = ['Assets', 'Accessories', 'Users', 'Activity Logs'];

type EntityFilter = 'All' | 'Asset' | 'Accessory';
const ENTITY_OPTIONS: EntityFilter[] = ['All', 'Asset', 'Accessory'];

const ROWS_PER_PAGE = 15;

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

const EVENT_COLORS: Record<string, { bg: string; color: string }> = {
  'Check Out':  { bg: 'rgba(252,156,45,0.12)', color: '#b45309' },
  'Check In':   { bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
  'Transfer':   { bg: 'rgba(46,124,253,0.1)',  color: '#2e7cfd' },
  'Adjustment': { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed' },
  'Archive':    { bg: 'rgba(239,68,68,0.1)',   color: '#dc2626' },
  'Restore':    { bg: 'rgba(34,197,94,0.12)',  color: '#15803d' },
};

function EventBadge({ event }: { event: string }) {
  const s = EVENT_COLORS[event] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6b7280' };
  return (
    <span style={{ display: 'inline-block', padding: `0.125rem ${spacing.sm}`, borderRadius: '0.25rem', backgroundColor: s.bg, color: s.color, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600 }}>
      {event}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const cfg: Record<string, { bg: string; color: string }> = {
    Asset:     { bg: 'rgba(46,124,253,0.1)',  color: colors.primary },
    Inventory: { bg: 'rgba(45,252,249,0.12)', color: '#0891b2' },
    Other:     { bg: 'rgba(107,114,128,0.08)', color: '#6b7280' },
  };
  const s = cfg[type] ?? cfg.Other;
  return (
    <span style={{ display: 'inline-block', padding: `0.125rem ${spacing.sm}`, borderRadius: '0.25rem', backgroundColor: s.bg, color: s.color, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600 }}>
      {type === 'Inventory' ? 'Accessory' : type}
    </span>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
        backgroundColor: active ? colors.primary : 'transparent',
        color: active ? colors.white : colors.blueGrayMd,
        border: `1px solid ${active ? colors.primary : 'rgba(70,98,145,0.25)'}`,
        transition: 'background-color 0.12s, border-color 0.12s, color 0.12s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function ArchiveActivityTabContent() {
  const [logs, setLogs]               = useState<ActivityLogEntry[]>([]);
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('All');
  const [userFilter, setUserFilter]   = useState('All');
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen]   = useState(false);
  const [detailLog, setDetailLog]     = useState<ActivityLogEntry | null>(null);

  useEffect(() => {
    transactionsApi.list({ older_than_days: 15, ordering: '-transaction_date' })
      .then(data => setLogs(data.map(toActivityLogEntry)))
      .catch(() => {});
  }, []);

  const uniqueUsers = useMemo(() => {
    const users = Array.from(new Set(logs.map(l => l.user).filter(u => u !== '—'))).sort();
    return ['All', ...users];
  }, [logs]);

  const filtered = useMemo(() => {
    let list = logs;
    if (entityFilter === 'Asset')     list = list.filter(l => l.type === 'Asset');
    if (entityFilter === 'Accessory') list = list.filter(l => l.type === 'Inventory');
    if (userFilter !== 'All')         list = list.filter(l => l.user === userFilter);
    const q = search.toLowerCase().trim();
    if (q) list = list.filter(l =>
      l.user.toLowerCase().includes(q) ||
      l.item.toLowerCase().includes(q) ||
      l.event.toLowerCase().includes(q) ||
      l.notes.toLowerCase().includes(q) ||
      l.toFrom.toLowerCase().includes(q),
    );
    return list;
  }, [logs, entityFilter, userFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const filterActive = entityFilter !== 'All' || userFilter !== 'All';

  const reset = (fn: () => void) => { fn(); setCurrentPage(1); };

  return (
    <>
      <div style={{ backgroundColor: colors.bgSurface, borderRadius: radius.lg, border: '1px solid rgba(70,98,145,0.1)', boxShadow: '0 1px 4px rgba(3,12,35,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderBottom: '1px solid rgba(70,98,145,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary }}>
              Archived Activity Logs
            </span>
            <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', color: colors.blueGrayMd }}>
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'} · older than 15 days
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            <SearchBar value={search} onChange={v => reset(() => setSearch(v))} placeholder="Search logs…" />

            {/* Filter button */}
            <div style={{ position: 'relative', zIndex: 100 }}>
              <button
                onClick={() => setFilterOpen(v => !v)}
                style={{
                  width: '2.125rem',
                  height: '2.125rem',
                  borderRadius: radius.md,
                  border: `1px solid ${filterOpen || filterActive ? colors.primary : 'rgba(70,98,145,0.2)'}`,
                  backgroundColor: filterOpen || filterActive ? 'rgba(46,124,253,0.06)' : colors.bgSurface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: filterOpen || filterActive ? colors.primary : colors.blueGrayMd,
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
                }}
              >
                <ListFilter size={15} />
                {filterActive && (
                  <span style={{ position: 'absolute', top: '0.2rem', right: '0.2rem', width: '0.375rem', height: '0.375rem', borderRadius: '50%', backgroundColor: colors.primary }} />
                )}
              </button>

              {filterOpen && (
                <>
                  <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                  <div style={{ position: 'absolute', top: '2.5rem', right: 0, width: '16rem', backgroundColor: colors.bgSurface, borderRadius: radius.lg, border: '1px solid rgba(70,98,145,0.14)', boxShadow: '0 0.5rem 2rem rgba(3,12,35,0.12)', padding: spacing.md, zIndex: 100 }}>

                    {/* Entity type */}
                    <p style={{ margin: `0 0 ${spacing.sm}`, fontFamily: "'Roboto', sans-serif", fontSize: '0.719rem', fontWeight: 700, color: colors.blueGrayMd, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Entity Type
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: spacing.md }}>
                      {ENTITY_OPTIONS.map(opt => (
                        <FilterChip key={opt} label={opt} active={entityFilter === opt} onClick={() => reset(() => setEntityFilter(opt))} />
                      ))}
                    </div>

                    {/* Performed by */}
                    <p style={{ margin: `0 0 ${spacing.sm}`, fontFamily: "'Roboto', sans-serif", fontSize: '0.719rem', fontWeight: 700, color: colors.blueGrayMd, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Performed By
                    </p>
                    <select
                      value={userFilter}
                      onChange={e => reset(() => setUserFilter(e.target.value))}
                      style={{
                        width: '100%',
                        padding: `0.375rem ${spacing.sm}`,
                        borderRadius: radius.md,
                        border: '1px solid rgba(70,98,145,0.2)',
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '0.8125rem',
                        color: colors.textPrimary,
                        backgroundColor: colors.bgSurface,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      {uniqueUsers.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>

                    {filterActive && (
                      <button
                        onClick={() => { reset(() => { setEntityFilter('All'); setUserFilter('All'); }); }}
                        style={{ marginTop: spacing.md, width: '100%', padding: `0.3rem ${spacing.md}`, borderRadius: radius.full, border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent', fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', color: colors.blueGrayMd, cursor: 'pointer' }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </>
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
                <th style={TH}>Performed By</th>
                <th style={TH}>Type</th>
                <th style={TH}>Event</th>
                <th style={TH}>Item</th>
                <th style={TH}>To / From</th>
                <th style={{ ...TH, width: '100%' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...TD, textAlign: 'center', color: colors.blueGrayMd, padding: `${spacing.xl3} ${spacing.md}` }}>
                    No archived activity logs found.
                  </td>
                </tr>
              ) : pageItems.map((log, idx) => (
                <tr
                  key={log.id}
                  onClick={() => setDetailLog(log)}
                  style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe, cursor: 'pointer', transition: 'background-color 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(46,124,253,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe}
                >
                  <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>{log.date}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>{log.user}</td>
                  <td style={TD}><TypeBadge type={log.type} /></td>
                  <td style={TD}><EventBadge event={log.event} /></td>
                  <td style={TD}>{log.item}</td>
                  <td style={{ ...TD, color: colors.blueGrayMd }}>{log.toFrom}</td>
                  <td style={{ ...TD, color: colors.blueGrayMd, maxWidth: '14rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderTop: '1px solid rgba(70,98,145,0.07)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <ActivityDetailModal log={detailLog} onClose={() => setDetailLog(null)} />
    </>
  );
}

export default function Archive() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('Assets');

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

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'rgba(244, 246, 249, 0.92)',
        }}
      >
        <Header title="Archive" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* Page tabs */}
          <div
            style={{
              display: 'flex',
              gap: spacing.xs,
              marginBottom: spacing.xl2,
              borderBottom: '1px solid rgba(70, 98, 145, 0.15)',
            }}
          >
            {ARCHIVE_TABS.map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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

          {activeTab === 'Assets'        && <ArchiveAssetsTabContent />}
          {activeTab === 'Accessories'   && <ArchiveAccessoriesTabContent />}
          {activeTab === 'Users'         && <ArchiveUsersTabContent />}
          {activeTab === 'Activity Logs' && <ArchiveActivityTabContent />}
        </main>
      </div>
    </div>
  );
}

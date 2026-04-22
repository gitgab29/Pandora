import { useState, useMemo } from 'react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import FilterDropdown from './FilterDropdown';
import SortDropdown from './SortDropdown';
import { colors, spacing, radius, badgeColors, fontSize, shadows } from '../theme';
import type { ActivityLogEntry as TransactionLog } from '../types/activity';

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTER_GROUPS = [
  { label: 'Type',  options: ['All', 'Asset', 'Inventory', 'Other'] },
  {
    label: 'Event',
    options: [
      'All',
      'Check In',
      'Check Out',
      'Transfer',
      'Adjustment',
      'Archived',
      'Restored',
      'Set to In Repair',
      'Set to In Maintenance',
      'Marked as Lost',
      'Flagged for Audit',
      'Marked Available',
      'Set to Deployed',
    ],
  },
];

const SORT_OPTIONS = [
  'Date (Newest first)',
  'Date (Oldest first)',
  'User (A–Z)',
  'Item (A–Z)',
];

const ROWS_PER_PAGE = 10;

// ── Table cell style tokens ───────────────────────────────────────────────────

const TH: React.CSSProperties = {
  padding: '0.625rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: fontSize.label,
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
  fontSize: fontSize.sm,
  color: colors.textPrimary,
  borderBottom: '1px solid rgba(70, 98, 145, 0.07)',
  whiteSpace: 'nowrap',
};

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Asset:     { bg: badgeColors.asset.bg,     color: badgeColors.asset.text },
  Inventory: { bg: badgeColors.inventory.bg, color: badgeColors.inventory.text },
  License:   { bg: badgeColors.license.bg,   color: badgeColors.license.text },
};

// ── Component ─────────────────────────────────────────────────────────────────

interface ActivityLogTableProps {
  logs: TransactionLog[];
}

export default function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);

  const closeDropdowns = () => { setFilterOpen(false); setSortOpen(false); };

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter(log =>
      log.user.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q) ||
      log.event.toLowerCase().includes(q) ||
      log.item.toLowerCase().includes(q) ||
      log.notes.toLowerCase().includes(q) ||
      log.toFrom.toLowerCase().includes(q),
    );
  }, [search, logs]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ROWS_PER_PAGE));
  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };
  const pageLogs = filteredLogs.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  );

  return (
    <div
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.lg,
        border: '1px solid rgba(70, 98, 145, 0.1)',
        boxShadow: shadows.card,
        overflow: 'hidden',
      }}
    >
      {/* Backdrop — closes dropdowns on outside click */}
      {(filterOpen || sortOpen) && (
        <div onClick={closeDropdowns} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      )}

      {/* ── Section header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${spacing.lg} ${spacing.xl}`,
          borderBottom: '1px solid rgba(70, 98, 145, 0.1)',
          flexWrap: 'wrap',
          gap: spacing.md,
        }}
      >
        {/* Left: title + result count */}
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
          {search && (
            <span
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.75rem',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <SearchBar value={search} onChange={handleSearch} placeholder="Search logs…" />
          <FilterDropdown
            open={filterOpen}
            onToggle={() => { setFilterOpen(v => !v); setSortOpen(false); }}
            groups={FILTER_GROUPS}
          />
          <SortDropdown
            open={sortOpen}
            onToggle={() => { setSortOpen(v => !v); setFilterOpen(false); }}
            options={SORT_OPTIONS}
            activeSort={activeSort}
            onSortChange={(opt) => { setActiveSort(opt); setSortOpen(false); }}
          />
        </div>
      </div>

      {/* ── Table ── */}
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
                    padding: `${spacing.xl3} ${spacing.md}`,
                  }}
                >
                  No activity logs match your search.
                </td>
              </tr>
            ) : (
              pageLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe }}
                >
                  <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>
                    {log.date}
                  </td>
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

      {/* ── Pagination ── */}
      <div
        style={{
          padding: `0 ${spacing.xl} ${spacing.sm}`,
          borderTop: '1px solid rgba(70, 98, 145, 0.07)',
        }}
      >
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

// ── Private helper ─────────────────────────────────────────────────────────────

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

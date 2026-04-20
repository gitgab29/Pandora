import { useState, useMemo, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import StatisticCard from './StatisticCard';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import PersonDetailModal from './PersonDetailModal';
import RestoreConfirmModal from './RestoreConfirmModal';
import HardDeleteConfirmModal from './HardDeleteConfirmModal';
import { colors, spacing, radius } from '../theme';
import type { Person } from '../types/people';
import { usersApi } from '../api';

type ArchiveTab = 'All' | 'Deleted' | 'Retired';

const ARCHIVE_TABS: ArchiveTab[] = ['All', 'Deleted', 'Retired'];
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

const iconBtnStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.625rem',
  height: '1.625rem',
  borderRadius: radius.sm,
  border: `1px solid ${color}22`,
  backgroundColor: `${color}10`,
  color,
  cursor: 'pointer',
  padding: 0,
  transition: 'background-color 0.15s',
});

export default function ArchiveUsersTabContent() {
  const [users, setUsers]     = useState<Person[]>([]);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('All');
  const [search, setSearch]   = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTarget,  setDetailTarget]  = useState<Person | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Person | null>(null);
  const [hardDelTarget, setHardDelTarget] = useState<Person | null>(null);

  useEffect(() => {
    usersApi.list({ archived_only: 1 }).then(setUsers).catch(() => {});
  }, []);

  const statCards = useMemo(() => [
    { title: 'Total Archived', value: users.length },
    { title: 'Deleted',        value: users.filter(u => u.archive_reason === 'DELETED').length },
    { title: 'Retired',        value: users.filter(u => u.archive_reason === 'RETIRED').length },
  ], [users]);

  const filtered = useMemo(() => {
    let list = users;
    if (activeTab === 'Deleted') list = list.filter(u => u.archive_reason === 'DELETED');
    if (activeTab === 'Retired') list = list.filter(u => u.archive_reason === 'RETIRED');
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(u =>
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.title ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const formatDate = (d?: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleRestore = () => {
    if (!restoreTarget) return;
    usersApi.restore(restoreTarget.id)
      .then(() => setUsers(prev => prev.filter(u => u.id !== restoreTarget.id)))
      .catch(() => {});
    setRestoreTarget(null);
  };

  const handleHardDelete = () => {
    if (!hardDelTarget) return;
    usersApi.hardDelete(hardDelTarget.id)
      .then(() => setUsers(prev => prev.filter(u => u.id !== hardDelTarget.id)))
      .catch(() => {});
    setHardDelTarget(null);
  };

  const initials = (u: Person) =>
    `${u.first_name[0] ?? ''}${u.last_name[0] ?? ''}`.toUpperCase();

  return (
    <>
      {/* Stat cards */}
      <div style={{ display: 'flex', gap: spacing.lg, marginBottom: spacing.xl2, flexWrap: 'wrap' }}>
        {statCards.map(c => <StatisticCard key={c.title} title={c.title} value={c.value} />)}
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: colors.bgSurface, borderRadius: radius.lg, border: '1px solid rgba(70,98,145,0.1)', boxShadow: '0 1px 4px rgba(3,12,35,0.06)', overflow: 'hidden' }}>

        {/* Toolbar */}
        <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderBottom: '1px solid rgba(70,98,145,0.08)', display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.9375rem', fontWeight: 700, color: colors.textPrimary, marginRight: spacing.sm, whiteSpace: 'nowrap' }}>
              Archived Users
            </span>
            <div style={{ display: 'flex', gap: spacing.xs }}>
              {ARCHIVE_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  style={{
                    padding: `0.25rem ${spacing.md}`,
                    borderRadius: radius.full,
                    border: activeTab === tab ? 'none' : '1px solid rgba(70,98,145,0.25)',
                    backgroundColor: activeTab === tab
                      ? tab === 'Deleted' ? colors.error : tab === 'Retired' ? colors.orangeAccent : colors.primary
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
          <SearchBar value={search} onChange={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search users…" />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Name</th>
                <th style={TH}>Email</th>
                <th style={TH}>Title</th>
                <th style={TH}>Role</th>
                <th style={TH}>Reason</th>
                <th style={TH}>Archived</th>
                <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...TD, textAlign: 'center', color: colors.blueGrayMd, padding: `${spacing.xl3} ${spacing.md}` }}>
                    No archived users found.
                  </td>
                </tr>
              ) : pageItems.map((user, idx) => (
                <tr
                  key={user.id}
                  onClick={() => setDetailTarget(user)}
                  style={{
                    backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe,
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(46,124,253,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? colors.bgSurface : colors.bgStripe)}
                >
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: radius.full, backgroundColor: 'rgba(46,124,253,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Roboto', sans-serif", fontSize: '0.625rem', fontWeight: 700, color: colors.primary, flexShrink: 0 }}>
                        {initials(user)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{user.first_name} {user.last_name}</span>
                    </div>
                  </td>
                  <td style={{ ...TD, color: colors.blueGrayMd }}>{user.email}</td>
                  <td style={{ ...TD, color: colors.blueGrayMd }}>{user.title || '—'}</td>
                  <td style={TD}>
                    <span style={{ display: 'inline-block', padding: `0.125rem ${spacing.sm}`, borderRadius: '0.25rem', backgroundColor: user.role === 'ADMIN' ? 'rgba(46,124,253,0.08)' : 'rgba(107,114,128,0.08)', color: user.role === 'ADMIN' ? colors.primary : colors.grayMed, fontSize: '0.75rem', fontWeight: 600 }}>
                      {user.role === 'ADMIN' ? 'Admin' : 'Staff'}
                    </span>
                  </td>
                  <td style={TD}>
                    <span style={{
                      display: 'inline-block',
                      padding: `0.125rem ${spacing.sm}`,
                      borderRadius: '0.25rem',
                      backgroundColor: user.archive_reason === 'RETIRED' ? 'rgba(252,156,45,0.1)' : 'rgba(239,68,68,0.1)',
                      color: user.archive_reason === 'RETIRED' ? colors.orangeAccent : colors.error,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {user.archive_reason === 'RETIRED' ? 'Retired' : 'Deleted'}
                    </span>
                  </td>
                  <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>{formatDate(user.archived_at)}</td>
                  <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                      <button title="Restore" style={iconBtnStyle(colors.success)} onClick={() => setRestoreTarget(user)}>
                        <RotateCcw size={11} />
                      </button>
                      <button title="Delete permanently" style={iconBtnStyle(colors.error)} onClick={() => setHardDelTarget(user)}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: `${spacing.md} ${spacing.xl}`, borderTop: '1px solid rgba(70,98,145,0.08)' }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Modals */}
      <PersonDetailModal
        isOpen={!!detailTarget}
        person={detailTarget}
        allPeople={[]}
        onClose={() => setDetailTarget(null)}
        onEdit={() => {}}
      />
      <RestoreConfirmModal
        isOpen={!!restoreTarget}
        itemName={restoreTarget ? `${restoreTarget.first_name} ${restoreTarget.last_name}` : ''}
        itemType="User"
        destination="People"
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
      />
      <HardDeleteConfirmModal
        isOpen={!!hardDelTarget}
        itemName={hardDelTarget?.email ?? ''}
        itemType="User"
        onClose={() => setHardDelTarget(null)}
        onConfirm={handleHardDelete}
      />
    </>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2, Pencil, Eye, Plus, ArrowUpAZ, ArrowDownAZ, Check, ChevronDown, ChevronUp, Shield, Mail, Briefcase, Building2, Archive } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AddEditPersonModal from '../components/AddEditPersonModal';
import PersonDetailModal from '../components/PersonDetailModal';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Person } from '../types/people';
import { usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRecency } from '../hooks/useRecency';
import RecencyBadge from '../components/RecencyBadge';


// ── Constants ──────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

const NEW_BG       = 'rgba(46,124,253,0.06)';
const NEW_BG_HOVER = 'rgba(46,124,253,0.10)';
const HOVER_BG     = 'rgba(46,124,253,0.04)';

function restingBg(isNewRow: boolean, idx: number): string {
  if (isNewRow) return NEW_BG;
  return idx % 2 === 0 ? colors.bgSurface : colors.bgStripe;
}

type SortField = 'name' | 'department' | 'created_at';
type SortDir   = 'asc'  | 'desc';

// ── Style helpers ──────────────────────────────────────────────────────────────

const ROLE_BADGE = {
  ADMIN: { bg: 'rgba(46,124,253,0.12)', text: colors.primary,    label: 'Admin' },
  STAFF: { bg: 'rgba(70,98,145,0.10)',  text: colors.blueGrayMd, label: 'Staff' },
};

const TH: React.CSSProperties = {
  padding: '0.625rem 0.875rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.719rem', fontWeight: 600,
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

const metaItem: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontFamily: "'Archivo', sans-serif",
  fontSize: fontSize.xs,
  color: colors.blueGrayMd,
  whiteSpace: 'nowrap',
};

function iconBtnStyle(bg: string): React.CSSProperties {
  return {
    width: '1.625rem', height: '1.625rem',
    borderRadius: radius.sm, border: 'none',
    backgroundColor: bg, color: colors.white,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0, flexShrink: 0,
  };
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function People() {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [searchParams]  = useSearchParams();
  const showProfileCard = searchParams.get('profile') === 'me';
  const [profileExpanded, setProfileExpanded] = useState(true);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [people, setPeople]     = useState<Person[]>([]);
  const { isNew, markSeen, markAllSeen, newCount } = useRecency<Person>('people');

  useEffect(() => {
    usersApi.list().then(setPeople).catch(() => {});
  }, []);
  const [search, setSearch]     = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir]   = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [detailPerson, setDetailPerson] = useState<Person | null>(null);
  const [editPerson,   setEditPerson]   = useState<Person | null>(null);
  const [deletePerson, setDeletePerson] = useState<Person | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let items = people.filter(p => p.is_active);
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(p =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q)  ||
        p.email.toLowerCase().includes(q)      ||
        p.business_group.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q),
      );
    }
    return [...items].sort((a, b) => {
      if (sortField === 'created_at') {
        return sortDir === 'desc'
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at);
      }
      const valA = sortField === 'name'
        ? `${a.last_name} ${a.first_name}`.toLowerCase()
        : a.business_group.toLowerCase();
      const valB = sortField === 'name'
        ? `${b.last_name} ${b.first_name}`.toLowerCase()
        : b.business_group.toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [people, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const allPageSelected = pageItems.length > 0 && pageItems.every(p => selectedIds.has(p.id));
  const toggleAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allPageSelected) pageItems.forEach(p => next.delete(p.id));
      else pageItems.forEach(p => next.add(p.id));
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

  const supervisorLabel = (supervisorId: string | null | undefined) => {
    if (!supervisorId) return '—';
    const mgr = people.find(p => p.id === supervisorId);
    return mgr ? `${mgr.last_name}, ${mgr.first_name}` : '—';
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); setSelectedIds(new Set()); };

  const handleSortDir = (dir: SortDir) => { setSortDir(dir); setCurrentPage(1); };

  const handleSortField = (field: SortField) => { setSortField(field); setCurrentPage(1); };

  const handleAdd = (person: Person) => {
    usersApi.create({
      ...person,
      password: 'password123',
    })
      .then(created => {
        setPeople(prev => [...prev, created]);
        markSeen([created.id]);
        toast.success(`Added ${created.first_name} ${created.last_name}`);
      })
      .catch(() => toast.error('Could not add person. Please try again.'));
  };

  const handleEdit = (updated: Person) => {
    usersApi.update(updated.id, updated)
      .then(saved => {
        setPeople(prev => prev.map(p => p.id === saved.id ? saved : p));
        markSeen([saved.id]);
        toast.success(`Updated ${saved.first_name} ${saved.last_name}`);
      })
      .catch(() => toast.error('Could not update person. Please try again.'));
    setPeople(prev =>
      prev.map(p => p.id === updated.id
        ? { ...updated, updated_at: new Date().toISOString().split('T')[0] }
        : p,
      ),
    );
  };

  const handleDelete = () => {
    if (!deletePerson) return;
    const name = `${deletePerson.first_name} ${deletePerson.last_name}`;
    usersApi.remove(deletePerson.id)
      .then(() => {
        setPeople(prev => prev.filter(p => p.id !== deletePerson.id));
        toast.success(`Deleted ${name}`);
      })
      .catch(() => toast.error('Could not delete person. Please try again.'));
    setDeletePerson(null);
  };

  const handleBulkArchive = async () => {
    const ids = [...selectedIds];
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => usersApi.retire(id)));
      setPeople(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      toast.success(`Archived ${ids.length} person${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some people could not be archived. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkDeleteConfirm(false);
    setBulkLoading(true);
    try {
      await Promise.all(ids.map(id => usersApi.remove(id)));
      setPeople(prev => prev.filter(p => !selectedIds.has(p.id)));
      setSelectedIds(new Set());
      toast.success(`Deleted ${ids.length} person${ids.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Some people could not be deleted. Please try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        backgroundImage: "url('/bg-auth.jpg')",
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}
    >
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />

      <div
        style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'rgba(244, 246, 249, 0.92)',
        }}
      >
        <Header title="People" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* ── My Profile card ── */}
          {showProfileCard && authUser && (
            <div
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: radius.lg,
                border: authUser.role === 'ADMIN'
                  ? `1px solid rgba(46,124,253,0.3)`
                  : `1px solid rgba(70,98,145,0.1)`,
                boxShadow: authUser.role === 'ADMIN'
                  ? '0 1px 8px rgba(46,124,253,0.1)'
                  : shadows.card,
                marginBottom: spacing.xl2,
                overflow: 'hidden',
              }}
            >
              {/* Card header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${spacing.md} ${spacing.xl}`,
                  borderBottom: profileExpanded ? '1px solid rgba(70,98,145,0.08)' : 'none',
                  backgroundColor: authUser.role === 'ADMIN'
                    ? 'rgba(46,124,253,0.04)'
                    : colors.bgStripe,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  {authUser.role === 'ADMIN' && (
                    <Shield size={13} color={colors.primary} strokeWidth={2.5} />
                  )}
                  <span
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: authUser.role === 'ADMIN' ? colors.primary : colors.blueGrayMd,
                      letterSpacing: '0.03em',
                    }}
                  >
                    My Profile
                  </span>
                </div>
                <button
                  onClick={() => setProfileExpanded(v => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: `0.2rem ${spacing.sm}`,
                    borderRadius: radius.sm,
                    border: '1px solid rgba(70,98,145,0.2)',
                    backgroundColor: 'transparent',
                    color: colors.blueGrayMd,
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: fontSize.micro,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bgSubtle)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {profileExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  {profileExpanded ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Card body */}
              {profileExpanded && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xl2,
                    padding: `${spacing.xl} ${spacing.xl}`,
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: radius.full,
                      backgroundColor: authUser.role === 'ADMIN' ? colors.primary : colors.blueGrayMd,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      border: authUser.role === 'ADMIN'
                        ? '2.5px solid rgba(46,124,253,0.3)'
                        : '2.5px solid rgba(70,98,145,0.2)',
                    }}
                  >
                    {`${authUser.first_name?.[0] ?? ''}${authUser.last_name?.[0] ?? ''}`.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Name + role badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '1.0625rem',
                          fontWeight: 700,
                          color: colors.textPrimary,
                        }}
                      >
                        {authUser.first_name} {authUser.last_name}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          padding: `0.15rem ${spacing.sm}`,
                          borderRadius: radius.full,
                          backgroundColor: authUser.role === 'ADMIN'
                            ? 'rgba(46,124,253,0.12)'
                            : 'rgba(70,98,145,0.1)',
                          fontFamily: "'Archivo', sans-serif",
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: authUser.role === 'ADMIN' ? colors.primary : colors.blueGrayMd,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {authUser.role === 'ADMIN' && <Shield size={8} strokeWidth={2.5} />}
                        {authUser.role === 'ADMIN' ? 'Admin' : 'Staff'}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl, flexWrap: 'wrap' }}>
                      <span style={metaItem}>
                        <Mail size={11} color={colors.blueGrayMd} />
                        {authUser.email}
                      </span>
                      {authUser.title && (
                        <span style={metaItem}>
                          <Briefcase size={11} color={colors.blueGrayMd} />
                          {authUser.title}
                        </span>
                      )}
                      {authUser.business_group && (
                        <span style={metaItem}>
                          <Building2 size={11} color={colors.blueGrayMd} />
                          {authUser.business_group}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Table card ── */}
          <div
            style={{
              backgroundColor: colors.bgSurface,
              borderRadius: radius.lg,
              border: '1px solid rgba(70,98,145,0.1)',
              boxShadow: shadows.card,
              overflow: 'hidden',
            }}
          >
            {/* ── Toolbar ── */}
            <div
              style={{
                padding: `${spacing.md} ${spacing.xl}`,
                borderBottom: '1px solid rgba(70,98,145,0.1)',
                display: 'flex', alignItems: 'center',
                flexWrap: 'wrap', gap: spacing.md,
              }}
            >
              {/* Left: title + record count */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.sm, flex: 1 }}>
                <span
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '0.9375rem', fontWeight: 700,
                    color: colors.textPrimary, whiteSpace: 'nowrap',
                  }}
                >
                  People
                </span>
                <span
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: fontSize.xs,
                    color: colors.blueGrayMd,
                  }}
                >
                  {filtered.length} active
                </span>
                {newCount(filtered) > 0 && (
                  <button
                    onClick={() => markAllSeen(filtered)}
                    title={`Mark ${newCount(filtered)} new as read`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      padding: `0.2rem ${spacing.sm}`,
                      borderRadius: radius.full,
                      border: `1px solid ${colors.primary}`,
                      backgroundColor: 'rgba(46,124,253,0.06)',
                      color: colors.primary,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Eye size={11} /> Mark all as read ({newCount(filtered)})
                  </button>
                )}
              </div>

              {/* Right: controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>

                {/* Search */}
                <SearchBar value={search} onChange={handleSearch} placeholder="Search by name or email…" />

                {/* Divider */}
                <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'rgba(70,98,145,0.18)', flexShrink: 0 }} />

                {/* Sort direction: A→Z / Z→A */}
                <div style={{ display: 'flex', gap: spacing.xs }}>
                  {(['asc', 'desc'] as const).map(dir => (
                    <button
                      key={dir}
                      onClick={() => handleSortDir(dir)}
                      title={dir === 'asc' ? 'A → Z' : 'Z → A'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        padding: `0.3rem ${spacing.sm}`,
                        borderRadius: radius.md,
                        border: `1px solid ${sortDir === dir ? colors.primary : 'rgba(70,98,145,0.2)'}`,
                        backgroundColor: sortDir === dir ? 'rgba(46,124,253,0.08)' : 'transparent',
                        color: sortDir === dir ? colors.primary : colors.blueGrayMd,
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: fontSize.micro, fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.12s, border-color 0.12s, color 0.12s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dir === 'asc' ? <ArrowUpAZ size={13} /> : <ArrowDownAZ size={13} />}
                      {dir === 'asc' ? 'A–Z' : 'Z–A'}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'rgba(70,98,145,0.18)', flexShrink: 0 }} />

                {/* Sort field checkboxes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                  <span
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '0.69rem', fontWeight: 600,
                      color: colors.blueGrayMd,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Sort by
                  </span>
                  {(['name', 'department'] as const).map(field => {
                    const label = field === 'name' ? 'Name' : 'Business Group';
                    const active = sortField === field;
                    return (
                      <button
                        key={field}
                        onClick={() => handleSortField(field)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: `0.25rem ${spacing.md}`,
                          borderRadius: radius.full,
                          border: `1px solid ${active ? colors.primary : 'rgba(70,98,145,0.25)'}`,
                          backgroundColor: active ? 'rgba(46,124,253,0.08)' : 'transparent',
                          color: active ? colors.primary : colors.blueGrayMd,
                          fontFamily: "'Archivo', sans-serif",
                          fontSize: fontSize.micro, fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'background-color 0.12s, border-color 0.12s, color 0.12s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span
                          style={{
                            width: '0.7rem', height: '0.7rem',
                            borderRadius: '0.15rem',
                            border: `1.5px solid ${active ? colors.primary : 'rgba(70,98,145,0.4)'}`,
                            backgroundColor: active ? colors.primary : 'transparent',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background-color 0.12s, border-color 0.12s',
                          }}
                        >
                          {active && <Check size={8} color={colors.white} strokeWidth={3} />}
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '1.5rem', backgroundColor: 'rgba(70,98,145,0.18)', flexShrink: 0 }} />

                {/* Add person */}
                <button
                  onClick={() => setAddModalOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: spacing.xs,
                    padding: `0.375rem ${spacing.md}`,
                    borderRadius: radius.md, border: 'none',
                    backgroundColor: colors.primary,
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: colors.white, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={13} />
                  Add Person
                </button>
              </div>
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
                  onClick={() => { markSeen([...selectedIds]); setSelectedIds(new Set()); }}
                  disabled={bulkLoading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: 'none', backgroundColor: 'rgba(46,124,253,0.1)', color: colors.primary, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: bulkLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  <Eye size={11} /> Mark as read
                </button>

                <button
                  onClick={() => setSelectedIds(new Set())}
                  style={{ display: 'inline-flex', alignItems: 'center', padding: `0.25rem ${spacing.md}`, borderRadius: radius.full, border: '1px solid rgba(70,98,145,0.2)', backgroundColor: 'transparent', color: colors.blueGrayMd, fontFamily: "'Archivo', sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Clear
                </button>
              </div>
            )}

            {/* ── Table ── */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: '2.5rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        ref={el => { if (el) el.indeterminate = pageItems.some(p => selectedIds.has(p.id)) && !allPageSelected; }}
                        onChange={toggleAll}
                        style={{ cursor: 'pointer', accentColor: colors.primary }}
                      />
                    </th>
                    <th style={TH}>Name</th>
                    <th style={TH}>Email</th>
                    <th style={TH}>Position</th>
                    <th style={TH}>Business Group</th>
                    <th style={TH}>Supervisor</th>
                    <th style={TH}>Role</th>
                    <th style={{ ...TH, width: '3.5rem', textAlign: 'center' }}></th>
                    <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          ...TD, textAlign: 'center',
                          color: colors.blueGrayMd,
                          padding: `${spacing.xl3} ${spacing.md}`,
                        }}
                      >
                        No people match your search.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((person, idx) => {
                      const role     = ROLE_BADGE[person.role] ?? ROLE_BADGE.STAFF;
                      const displayName = `${person.last_name}, ${person.first_name}`;

                      const newRow = isNew(person);
                      return (
                        <tr
                          key={person.id}
                          onClick={() => { markSeen([person.id]); setDetailPerson(person); }}
                          style={{
                            backgroundColor: restingBg(newRow, idx),
                            cursor: 'pointer',
                            transition: 'background-color 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = newRow ? NEW_BG_HOVER : HOVER_BG)}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = restingBg(newRow, idx))}
                        >
                          {/* Checkbox */}
                          <td style={{ ...TD, textAlign: 'center', width: '2.5rem' }} onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(person.id)}
                              onChange={() => toggleRow(person.id)}
                              style={{ cursor: 'pointer', accentColor: colors.primary }}
                            />
                          </td>

                          {/* Name */}
                          <td style={{ ...TD, fontWeight: 500 }}>
                            {displayName}
                          </td>

                          {/* Email */}
                          <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>
                            {person.email}
                          </td>

                          {/* Position */}
                          <td style={TD}>{person.title || '—'}</td>

                          {/* Business Group */}
                          <td style={TD}>{person.business_group || '—'}</td>

                          {/* Supervisor */}
                          <td style={{ ...TD, color: person.supervisor ? colors.textPrimary : colors.textDisabled }}>
                            {supervisorLabel(person.supervisor)}
                          </td>

                          {/* Role badge */}
                          <td style={TD}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: `0.15rem ${spacing.sm}`,
                                borderRadius: radius.full,
                                backgroundColor: role.bg,
                                fontFamily: "'Archivo', sans-serif",
                                fontSize: '0.6875rem', fontWeight: 700,
                                color: role.text,
                                letterSpacing: '0.03em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {role.label}
                            </span>
                          </td>

                          {/* NEW */}
                          <td style={{ ...TD, textAlign: 'center' }}>
                            <RecencyBadge visible={newRow} />
                          </td>

                          {/* Actions */}
                          <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                              <button
                                onClick={() => setDeletePerson(person)}
                                title="Delete"
                                style={iconBtnStyle(colors.error)}
                              >
                                <Trash2 size={11} />
                              </button>
                              <button
                                onClick={() => setEditPerson(person)}
                                title="Edit"
                                style={iconBtnStyle(colors.blueGrayMd)}
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                onClick={() => { markSeen([person.id]); setDetailPerson(person); }}
                                title="View detail"
                                style={iconBtnStyle(colors.primary)}
                              >
                                <Eye size={11} />
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

            {/* ── Pagination ── */}
            <div style={{ padding: `0 ${spacing.xl} ${spacing.sm}`, borderTop: '1px solid rgba(70,98,145,0.07)' }}>
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

      {/* Add */}
      <AddEditPersonModal
        isOpen={addModalOpen}
        mode="add"
        allPeople={people}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAdd}
      />

      {/* Edit */}
      <AddEditPersonModal
        isOpen={editPerson !== null}
        mode="edit"
        person={editPerson}
        allPeople={people}
        onClose={() => setEditPerson(null)}
        onSave={p => { handleEdit(p); setEditPerson(null); }}
      />

      {/* Detail */}
      <PersonDetailModal
        isOpen={detailPerson !== null}
        person={detailPerson}
        allPeople={people}
        onClose={() => setDetailPerson(null)}
        onEdit={() => {
          const p = detailPerson;
          setDetailPerson(null);
          setEditPerson(p);
        }}
        onRetire={notes => {
          if (!detailPerson) return;
          const name = `${detailPerson.first_name} ${detailPerson.last_name}`;
          usersApi.retire(detailPerson.id, notes)
            .then(() => {
              setPeople(prev => prev.filter(p => p.id !== detailPerson.id));
              setDetailPerson(null);
              toast.success(`Retired ${name}`);
            })
            .catch(() => toast.error('Could not retire person. Please try again.'));
        }}
      />

      {/* Delete */}
      <DeleteConfirmModal
        isOpen={deletePerson !== null}
        itemName={deletePerson ? `${deletePerson.last_name}, ${deletePerson.first_name}` : ''}
        itemType="Person"
        onClose={() => setDeletePerson(null)}
        onConfirm={handleDelete}
      />

      {/* Bulk delete */}
      <DeleteConfirmModal
        isOpen={bulkDeleteConfirm}
        itemName={`${selectedIds.size} selected person${selectedIds.size !== 1 ? 's' : ''}`}
        itemType=""
        onClose={() => setBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}

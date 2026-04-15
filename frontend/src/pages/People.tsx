import { useState, useMemo } from 'react';
import { Trash2, Pencil, Eye, Plus, ArrowUpAZ, ArrowDownAZ, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import AddEditPersonModal from '../components/AddEditPersonModal';
import PersonDetailModal from '../components/PersonDetailModal';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Person } from '../types/people';

// ── Dummy data ─────────────────────────────────────────────────────────────────
// Names match assigned_to values in INITIAL_ASSETS so the detail modal links up.

const INITIAL_PEOPLE: Person[] = [
  { id:  1, first_name: 'Maria',   last_name: 'Santos',    email: 'maria.santos@embeddedsilicon.com',    title: 'Chief Executive Officer', department: 'Executive Leadership', manager_id: null, location: 'HQ - Office 100', badge_number: 'ES-B-001', role: 'ADMIN', is_active: true, notes: '',                                                                                    created_at: '2022-01-15', updated_at: '2024-01-01' },
  { id:  2, first_name: 'Carlos',  last_name: 'Reyes',     email: 'carlos.reyes@embeddedsilicon.com',    title: 'Chief Technology Officer', department: 'Engineering',          manager_id: 1,    location: 'HQ - Office 101', badge_number: 'ES-B-002', role: 'ADMIN', is_active: true, notes: '',                                                                                    created_at: '2022-02-01', updated_at: '2024-01-01' },
  { id:  3, first_name: 'Gabriel', last_name: 'Limbo',     email: 'gabriel.limbo@embeddedsilicon.com',   title: 'IT Manager',               department: 'IT',                   manager_id: 2,    location: 'HQ - IT Room',    badge_number: 'ES-B-003', role: 'ADMIN', is_active: true, notes: 'Primary IT admin. Handles hardware procurement and asset management.',           created_at: '2022-03-10', updated_at: '2024-01-01' },
  { id:  4, first_name: 'James',   last_name: 'Chen',      email: 'james.chen@embeddedsilicon.com',      title: 'Senior Engineer',          department: 'Engineering',          manager_id: 2,    location: 'HQ - Lab A',      badge_number: 'ES-B-004', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2022-06-01', updated_at: '2024-01-01' },
  { id:  5, first_name: 'Sarah',   last_name: 'Kim',       email: 'sarah.kim@embeddedsilicon.com',       title: 'Software Engineer',        department: 'Engineering',          manager_id: 4,    location: 'HQ - Lab A',      badge_number: 'ES-B-005', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2022-08-15', updated_at: '2024-01-01' },
  { id:  6, first_name: 'Sam',     last_name: 'Okafor',    email: 'sam.okafor@embeddedsilicon.com',      title: 'Hardware Engineer',        department: 'Engineering',          manager_id: 4,    location: 'HQ - Lab B',      badge_number: 'ES-B-006', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2022-08-15', updated_at: '2024-01-01' },
  { id:  7, first_name: 'Tyler',   last_name: 'Brooks',    email: 'tyler.brooks@embeddedsilicon.com',    title: 'IT Specialist',            department: 'IT',                   manager_id: 3,    location: 'HQ - IT Room',    badge_number: 'ES-B-007', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-01-10', updated_at: '2024-01-01' },
  { id:  8, first_name: 'Priya',   last_name: 'Nair',      email: 'priya.nair@embeddedsilicon.com',      title: 'Product Manager',          department: 'Product',              manager_id: 1,    location: 'HQ - Office 202', badge_number: 'ES-B-008', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-02-20', updated_at: '2024-01-01' },
  { id:  9, first_name: 'Ronald',  last_name: 'MacDonald', email: 'ronald.macdonald@embeddedsilicon.com',title: 'QA Engineer',              department: 'Engineering',          manager_id: 2,    location: 'HQ - Lab A',      badge_number: 'ES-B-009', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-03-15', updated_at: '2024-01-01' },
  { id: 10, first_name: 'Lebron',  last_name: 'Jeymz',     email: 'lebron.jeymz@embeddedsilicon.com',    title: 'Operations Lead',          department: 'Operations',           manager_id: 1,    location: 'HQ - Office 150', badge_number: 'ES-B-010', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-04-01', updated_at: '2024-01-01' },
  { id: 11, first_name: 'Stephen', last_name: 'Carry',     email: 'stephen.carry@embeddedsilicon.com',   title: 'Finance Manager',          department: 'Finance',              manager_id: 1,    location: 'HQ - Office 120', badge_number: 'ES-B-011', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-05-10', updated_at: '2024-01-01' },
  { id: 12, first_name: 'Chioma',  last_name: 'Obi',       email: 'chioma.obi@embeddedsilicon.com',      title: 'HR Manager',               department: 'Human Resources',      manager_id: 1,    location: 'HQ - Office 110', badge_number: 'ES-B-012', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-05-10', updated_at: '2024-01-01' },
  { id: 13, first_name: 'Wei',     last_name: 'Zhang',     email: 'wei.zhang@embeddedsilicon.com',       title: 'Data Analyst',             department: 'Engineering',          manager_id: 2,    location: 'HQ - Lab A',      badge_number: 'ES-B-013', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-07-01', updated_at: '2024-01-01' },
  { id: 14, first_name: 'Yuki',    last_name: 'Nakamura',  email: 'yuki.nakamura@embeddedsilicon.com',   title: 'UX Designer',              department: 'Product',              manager_id: 8,    location: 'HQ - Studio',     badge_number: 'ES-B-014', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-08-15', updated_at: '2024-01-01' },
  { id: 15, first_name: 'Kola',    last_name: 'Adeyemi',   email: 'kola.adeyemi@embeddedsilicon.com',    title: 'System Administrator',     department: 'IT',                   manager_id: 3,    location: 'HQ - IT Room',    badge_number: 'ES-B-015', role: 'STAFF', is_active: true, notes: 'Secondary IT admin. Handles server maintenance and network configuration.',      created_at: '2023-09-20', updated_at: '2024-01-01' },
  { id: 16, first_name: 'Maria',   last_name: 'Chen',      email: 'maria.chen@embeddedsilicon.com',      title: 'Operations Analyst',       department: 'Operations',           manager_id: 10,   location: 'HQ - Office 155', badge_number: 'ES-B-016', role: 'STAFF', is_active: true, notes: '',                                                                                    created_at: '2023-10-01', updated_at: '2024-01-01' },
];

// ── Constants ──────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10;

type SortField = 'name' | 'department';
type SortDir   = 'asc'  | 'desc';

// ── Style helpers ──────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: 'rgba(46,124,253,0.15)',  fg: '#1a5bbf' },
  { bg: 'rgba(139,92,246,0.15)', fg: '#6d28d9' },
  { bg: 'rgba(34,197,94,0.15)',  fg: '#15803d' },
  { bg: 'rgba(252,156,45,0.15)', fg: '#b45309' },
  { bg: 'rgba(45,252,249,0.15)', fg: '#0891b2' },
  { bg: 'rgba(239,68,68,0.15)',  fg: '#b91c1c' },
];

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [people, setPeople]     = useState<Person[]>(INITIAL_PEOPLE);
  const [search, setSearch]     = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir]   = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);

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
        p.department.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q),
      );
    }
    return [...items].sort((a, b) => {
      const valA = sortField === 'name'
        ? `${a.last_name} ${a.first_name}`.toLowerCase()
        : a.department.toLowerCase();
      const valB = sortField === 'name'
        ? `${b.last_name} ${b.first_name}`.toLowerCase()
        : b.department.toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [people, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const supervisorLabel = (managerId: number | null) => {
    if (!managerId) return '—';
    const mgr = people.find(p => p.id === managerId);
    return mgr ? `${mgr.last_name}, ${mgr.first_name}` : '—';
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1); };

  const handleSortDir = (dir: SortDir) => { setSortDir(dir); setCurrentPage(1); };

  const handleSortField = (field: SortField) => { setSortField(field); setCurrentPage(1); };

  const handleAdd = (person: Person) => {
    const newId = Math.max(0, ...people.map(p => p.id)) + 1;
    const today = new Date().toISOString().split('T')[0];
    setPeople(prev => [...prev, { ...person, id: newId, created_at: today, updated_at: today }]);
  };

  const handleEdit = (updated: Person) => {
    setPeople(prev =>
      prev.map(p => p.id === updated.id
        ? { ...updated, updated_at: new Date().toISOString().split('T')[0] }
        : p,
      ),
    );
  };

  const handleDelete = () => {
    if (!deletePerson) return;
    setPeople(prev => prev.filter(p => p.id !== deletePerson.id));
    setDeletePerson(null);
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

            {/* ── Table ── */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...TH, width: '2.75rem', padding: '0.625rem 0.5rem' }} />
                    <th style={TH}>Name</th>
                    <th style={TH}>Email</th>
                    <th style={TH}>Position</th>
                    <th style={TH}>Business Group</th>
                    <th style={TH}>Supervisor</th>
                    <th style={TH}>Role</th>
                    <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
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
                      const palette  = AVATAR_PALETTE[person.id % AVATAR_PALETTE.length];
                      const initials = `${person.first_name[0]}${person.last_name[0]}`.toUpperCase();
                      const role     = ROLE_BADGE[person.role] ?? ROLE_BADGE.STAFF;
                      const displayName = `${person.last_name}, ${person.first_name}`;

                      return (
                        <tr
                          key={person.id}
                          style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe }}
                        >
                          {/* Avatar */}
                          <td style={{ ...TD, width: '2.75rem', padding: '0.5rem 0.75rem' }}>
                            <div
                              style={{
                                width: '2rem', height: '2rem',
                                borderRadius: radius.full,
                                backgroundColor: palette.bg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "'Roboto', sans-serif",
                                  fontSize: '0.6875rem', fontWeight: 700,
                                  color: palette.fg,
                                  letterSpacing: '0.02em',
                                }}
                              >
                                {initials}
                              </span>
                            </div>
                          </td>

                          {/* Name */}
                          <td style={{ ...TD, fontWeight: 500 }}>{displayName}</td>

                          {/* Email */}
                          <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>
                            {person.email}
                          </td>

                          {/* Position */}
                          <td style={TD}>{person.title || '—'}</td>

                          {/* Business Group */}
                          <td style={TD}>{person.department || '—'}</td>

                          {/* Supervisor */}
                          <td style={{ ...TD, color: person.manager_id ? colors.textPrimary : colors.textDisabled }}>
                            {supervisorLabel(person.manager_id)}
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

                          {/* Actions */}
                          <td style={{ ...TD, textAlign: 'right' }}>
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
                                onClick={() => setDetailPerson(person)}
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
      />

      {/* Delete */}
      <DeleteConfirmModal
        isOpen={deletePerson !== null}
        itemName={deletePerson ? `${deletePerson.last_name}, ${deletePerson.first_name}` : ''}
        itemType="Person"
        onClose={() => setDeletePerson(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

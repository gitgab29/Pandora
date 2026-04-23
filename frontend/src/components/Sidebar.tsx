import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecencyCounts } from '../context/RecencyContext';
import {
  Home,
  ClipboardList,
  Activity,
  Users,
  Settings,
  Archive,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { colors, sizing, spacing, radius } from '../theme';

type BadgeKind = 'inventory' | 'people' | 'activity';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: BadgeKind;
};

const NAV_ITEMS: NavItem[] = [
  { icon: Home,          label: 'Home',      path: '/home' },
  { icon: ClipboardList, label: 'Inventory', path: '/inventory', badge: 'inventory' },
  { icon: Activity,      label: 'Activity',  path: '/activity',  badge: 'activity' },
  { icon: Users,         label: 'People',    path: '/people',    badge: 'people' },
  { icon: Settings,      label: 'Settings',  path: '/settings' },
  { icon: Archive,       label: 'Archive',   path: '/archive' },
];

// Semi-transparent primary so bg-auth.jpg shows through
const SIDEBAR_BG = 'rgba(46, 124, 253, 0.88)';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { inventoryBadge, peopleBadge, activityBadge } = useRecencyCounts();

  const badgeCount = (kind?: BadgeKind): number => {
    if (kind === 'inventory') return inventoryBadge;
    if (kind === 'people')    return peopleBadge;
    if (kind === 'activity')  return activityBadge;
    return 0;
  };

  return (
    <aside
      style={{
        width: collapsed ? sizing.sidebarCollapsed : sizing.sidebarExpanded,
        backgroundColor: SIDEBAR_BG,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20,
        borderRight: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* ── Logo / toggle row ── */}
      <div
        style={{
          height: sizing.headerHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : `0 ${spacing.md} 0 ${spacing.lg}`,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            title="Expand sidebar"
            style={toggleBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
          >
            <ChevronRight size={15} />
          </button>
        ) : (
          <>
            <img
              src="/whtie-logo-with-text.svg"
              alt="Pandora"
              style={{ height: '1.3125rem', width: 'auto', flexShrink: 0 }}
            />
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              style={toggleBtnStyle}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
            >
              <ChevronLeft size={15} />
            </button>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          padding: `${spacing.sm} ${spacing.sm}`,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;
          const count = badgeCount(badge);

          return (
            <NavLink key={path} to={path} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: spacing.sm,
                  padding: collapsed ? `${spacing.md} 0` : `0.5625rem ${spacing.md}`,
                  borderRadius: radius.md,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  marginBottom: '0.125rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Icon with optional badge dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Icon
                    size={19}
                    color="#ffffff"
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{ opacity: isActive ? 1 : 0.75 }}
                  />
                  {count > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-0.35rem',
                        right: '-0.5rem',
                        minWidth: '1rem',
                        height: '1rem',
                        padding: '0 0.3rem',
                        borderRadius: radius.full,
                        backgroundColor: colors.orangeAccent,
                        color: colors.white,
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }}
                    >
                      {count > 99 ? '99+' : count}
                    </div>
                  )}
                </div>

                {/* Label — hidden when collapsed */}
                {!collapsed && (
                  <span
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.844rem',
                      fontWeight: isActive ? 600 : 400,
                      color: colors.white,
                      opacity: isActive ? 1 : 0.75,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div
        style={{
          padding: `${spacing.sm} ${spacing.sm}`,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => { logout(); navigate('/sign-in'); }}
          title={collapsed ? 'Log out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: spacing.sm,
            width: '100%',
            padding: collapsed ? `${spacing.md} 0` : `0.5625rem ${spacing.md}`,
            borderRadius: radius.md,
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={19} color="#ffffff" strokeWidth={2} style={{ opacity: 0.75, flexShrink: 0 }} />
          {!collapsed && (
            <span
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.844rem',
                fontWeight: 400,
                color: colors.white,
                opacity: 0.75,
                whiteSpace: 'nowrap',
              }}
            >
              Log out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

const toggleBtnStyle: React.CSSProperties = {
  width: '1.75rem',
  height: '1.75rem',
  borderRadius: radius.sm,
  border: 'none',
  backgroundColor: 'rgba(255,255,255,0.12)',
  color: colors.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  padding: 0,
  transition: 'background-color 0.15s ease',
};

import { useLocation, NavLink } from 'react-router-dom';
import {
  Home,
  Package,
  ClipboardList,
  FileKey,
  Activity,
  Users,
  Settings,
  Archive,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { colors } from '../theme';

type NavItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Package, label: 'Assets', path: '/assets' },
  { icon: ClipboardList, label: 'Inventory', path: '/inventory' },
  { icon: FileKey, label: 'Licenses', path: '/licenses' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Users, label: 'People', path: '/people' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: Archive, label: 'Archive', path: '/archive', badge: true },
];

// Semi-transparent primary so bg-auth.jpg shows through
const SIDEBAR_BG = 'rgba(46, 124, 253, 0.88)';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      style={{
        width: collapsed ? '64px' : '220px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
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
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 14px 0 18px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          /* Collapsed: only the toggle button, centered */
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
          /* Expanded: logo + collapse button */
          <>
            <img
              src="/whtie-logo-with-text.svg"
              alt="Pandora"
              style={{ height: '21px', width: 'auto', flexShrink: 0 }}
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
          padding: '10px 8px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_ITEMS.map(({ icon: Icon, label, path, badge }) => {
          const isActive = location.pathname === path;

          return (
            <NavLink key={path} to={path} style={{ textDecoration: 'none', display: 'block' }}>
              <div
                title={collapsed ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: collapsed ? '10px 0' : '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  marginBottom: '2px',
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
                  {badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-3px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: colors.orangeAccent,
                      }}
                    />
                  )}
                </div>

                {/* Label — hidden when collapsed */}
                {!collapsed && (
                  <span
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 400,
                      color: '#ffffff',
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
    </aside>
  );
}

const toggleBtnStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: 'rgba(255,255,255,0.12)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  padding: 0,
  transition: 'background-color 0.15s ease',
};

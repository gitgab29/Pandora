import { useState } from 'react';
import { Bell, LayoutGrid, Package, ClipboardList, FileKey, Users, LayoutDashboard } from 'lucide-react';
import { colors, sizing, spacing, radius, typography } from '../theme';

interface HeaderProps {
  title: string;
}

// ── Dummy data ────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, text: 'LeJon James checked out a MacBook Pro',       time: '2 min ago',  unread: true  },
  { id: 2, text: 'Maria Chen returned a USB-C Dock',            time: '15 min ago', unread: true  },
  { id: 3, text: 'Tyler Brooks submitted an asset request',      time: '1 hr ago',   unread: true  },
  { id: 4, text: 'Priya Nair completed a device audit',          time: '3 hrs ago',  unread: false },
];

const QUICK_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/home'      },
  { icon: Package,         label: 'Assets',    path: '/assets'    },
  { icon: ClipboardList,   label: 'Inventory', path: '/inventory' },
  { icon: FileKey,         label: 'Licenses',  path: '/licenses'  },
  { icon: Users,           label: 'People',    path: '/people'    },
];

const UNREAD_COUNT = NOTIFICATIONS.filter(n => n.unread).length;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Header({ title }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [gridOpen,  setGridOpen]  = useState(false);

  const closeAll = () => { setNotifOpen(false); setGridOpen(false); };

  return (
    <>
      {/* Backdrop */}
      {(notifOpen || gridOpen) && (
        <div onClick={closeAll} style={{ position: 'fixed', inset: 0, zIndex: 149 }} />
      )}

      <header
        style={{
          height: sizing.headerHeight,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(70, 98, 145, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${spacing.xl2}`,
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            ...typography.subheadingBold,
            color: colors.textPrimary,
            margin: 0,
          }}
        >
          {title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>

          {/* ── Grid / Quick Access ── */}
          <div style={{ position: 'relative', zIndex: 150 }}>
            <IconBtn active={gridOpen} onClick={() => { setGridOpen(v => !v); setNotifOpen(false); }}>
              <LayoutGrid size={17} />
            </IconBtn>

            {gridOpen && (
              <div style={dropdownBase('11.25rem')}>
                <p style={dropdownTitle}>Quick Access</p>
                {QUICK_LINKS.map(({ icon: Icon, label, path }) => (
                  <a
                    key={path}
                    href={path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: radius.sm,
                      textDecoration: 'none',
                      color: colors.textPrimary,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.8125rem',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f5f7fb')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={15} color={colors.blueGrayMd} />
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Bell / Notifications ── */}
          <div style={{ position: 'relative', zIndex: 150 }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <IconBtn active={notifOpen} onClick={() => { setNotifOpen(v => !v); setGridOpen(false); }}>
                <Bell size={17} />
              </IconBtn>
              {UNREAD_COUNT > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: radius.full,
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    fontFamily: "'Archivo', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    border: '1.5px solid rgba(255,255,255,0.95)',
                  }}
                >
                  {UNREAD_COUNT}
                </span>
              )}
            </div>

            {notifOpen && (
              <div style={{ ...dropdownBase('18.75rem'), right: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <p style={{ ...dropdownTitle, margin: 0 }}>Notifications</p>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: "'Archivo', sans-serif",
                      color: colors.blueGrayMd,
                    }}
                  >
                    {UNREAD_COUNT} unread
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {NOTIFICATIONS.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: `0.5625rem ${spacing.md}`,
                        borderRadius: radius.sm,
                        backgroundColor: n.unread ? 'rgba(46,124,253,0.05)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.12s ease',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor = n.unread
                          ? 'rgba(46,124,253,0.1)'
                          : '#f5f7fb')
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor = n.unread
                          ? 'rgba(46,124,253,0.05)'
                          : 'transparent')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm }}>
                        {n.unread && (
                          <div
                            style={{
                              width: '0.375rem',
                              height: '0.375rem',
                              borderRadius: radius.full,
                              backgroundColor: colors.primary,
                              marginTop: '0.3125rem',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: `0 0 0.125rem`,
                              fontFamily: "'Archivo', sans-serif",
                              fontSize: '0.781rem',
                              color: colors.textPrimary,
                              fontWeight: n.unread ? 500 : 400,
                              lineHeight: 1.4,
                            }}
                          >
                            {n.text}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontFamily: "'Archivo', sans-serif",
                              fontSize: '0.6875rem',
                              color: colors.blueGrayMd,
                            }}
                          >
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(70,98,145,0.1)',
                    marginTop: spacing.sm,
                    paddingTop: spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  <a
                    href="/activity"
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.781rem',
                      color: colors.primary,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    View all activity →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* ── Avatar ── */}
          <div
            style={{
              width: '2.125rem',
              height: '2.125rem',
              borderRadius: radius.full,
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: spacing.xs,
              flexShrink: 0,
              border: '2px solid rgba(46,124,253,0.3)',
            }}
          >
            LJ
          </div>
        </div>
      </header>
    </>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function IconBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '2.125rem',
        height: '2.125rem',
        borderRadius: radius.md,
        border: 'none',
        backgroundColor: active ? '#f0f4ff' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? colors.primary : colors.blueGrayMd,
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.backgroundColor = '#f5f7fb';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function dropdownBase(width: string): React.CSSProperties {
  return {
    position: 'absolute',
    top: '2.625rem',
    right: 0,
    width,
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    border: '1px solid rgba(70,98,145,0.12)',
    boxShadow: '0 0.5rem 2rem rgba(3,12,35,0.12)',
    padding: spacing.md,
    zIndex: 150,
  };
}

const dropdownTitle: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '0.8125rem',
  fontWeight: 700,
  color: colors.textPrimary,
  margin: `0 0 ${spacing.sm}`,
};

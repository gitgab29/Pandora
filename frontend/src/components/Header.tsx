import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LayoutGrid, Package, Wrench, FileKey, ShoppingBag, LayoutDashboard, Users, UserCircle2, Settings, LogOut } from 'lucide-react';
import { colors, sizing, spacing, radius, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useNotifications, formatNotification } from '../context/NotificationsContext';
import { timeAgo } from '../utils/timeAgo';

interface HeaderProps {
  title: string;
}

// ── Quick links ────────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/home' },
  { icon: Package,         label: 'Assets',       path: '/inventory?tab=Assets' },
  { icon: Wrench,          label: 'Accessories',  path: '/inventory?tab=Accessories' },
  { icon: FileKey,         label: 'Licenses',     path: '/inventory?tab=Licenses' },
  { icon: ShoppingBag,     label: 'Consumables',  path: '/inventory?tab=Consumables' },
  { icon: Users,           label: 'People',       path: '/people' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, lastSeenAt, markAllRead } = useNotifications();
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [gridOpen,    setGridOpen]    = useState(false);
  const [avatarOpen,  setAvatarOpen]  = useState(false);

  const closeAll = () => { setNotifOpen(false); setGridOpen(false); setAvatarOpen(false); };

  // Mark all read when the notification dropdown closes (user has seen them)
  const prevNotifOpen = useRef(false);
  useEffect(() => {
    if (prevNotifOpen.current && !notifOpen) {
      markAllRead();
    }
    prevNotifOpen.current = notifOpen;
  }, [notifOpen, markAllRead]);

  const userInitials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <>
      {/* Backdrop */}
      {(notifOpen || gridOpen || avatarOpen) && (
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
          zIndex: 200,
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
                  <button
                    key={label}
                    onClick={() => { navigate(path); setGridOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: radius.sm,
                      border: 'none',
                      background: 'transparent',
                      color: colors.textPrimary,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bgSubtle)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={15} color={colors.blueGrayMd} />
                    {label}
                  </button>
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
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    width: '1rem',
                    height: '1rem',
                    borderRadius: radius.full,
                    backgroundColor: colors.error,
                    color: colors.white,
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
                  {unreadCount > 9 ? '9+' : unreadCount}
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
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <p
                    style={{
                      margin: `${spacing.xl} 0`,
                      textAlign: 'center',
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.781rem',
                      color: colors.blueGrayMd,
                    }}
                  >
                    No recent activity
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    {notifications.map(n => {
                      const isUnread = n.created_at > lastSeenAt;
                      return (
                        <div
                          key={n.id}
                          onClick={() => { navigate('/activity'); setNotifOpen(false); }}
                          style={{
                            padding: `0.5625rem ${spacing.md}`,
                            borderRadius: radius.sm,
                            backgroundColor: isUnread ? 'rgba(46,124,253,0.05)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.12s ease',
                          }}
                          onMouseEnter={e =>
                            (e.currentTarget.style.backgroundColor = isUnread
                              ? 'rgba(46,124,253,0.1)'
                              : colors.bgSubtle)
                          }
                          onMouseLeave={e =>
                            (e.currentTarget.style.backgroundColor = isUnread
                              ? 'rgba(46,124,253,0.05)'
                              : 'transparent')
                          }
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.sm }}>
                            {isUnread && (
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
                                  fontWeight: isUnread ? 500 : 400,
                                  lineHeight: 1.4,
                                  whiteSpace: 'normal',
                                }}
                              >
                                {formatNotification(n)}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontFamily: "'Archivo', sans-serif",
                                  fontSize: '0.6875rem',
                                  color: colors.blueGrayMd,
                                }}
                              >
                                {timeAgo(n.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid rgba(70,98,145,0.1)',
                    marginTop: spacing.sm,
                    paddingTop: spacing.sm,
                    textAlign: 'center',
                  }}
                >
                  <button
                    onClick={() => { navigate('/activity'); setNotifOpen(false); }}
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.781rem',
                      color: colors.primary,
                      fontWeight: 600,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    View all activity →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Avatar / Profile ── */}
          <div style={{ position: 'relative', zIndex: 150, marginLeft: spacing.xs }}>
            <div
              onClick={() => { setAvatarOpen(v => !v); setNotifOpen(false); setGridOpen(false); }}
              style={{
                width: '2.125rem',
                height: '2.125rem',
                borderRadius: radius.full,
                backgroundColor: avatarOpen ? colors.primaryDark : colors.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                fontFamily: "'Archivo', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                flexShrink: 0,
                border: avatarOpen ? '2px solid rgba(46,124,253,0.6)' : '2px solid rgba(46,124,253,0.3)',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
                userSelect: 'none',
              }}
            >
              {userInitials}
            </div>

            {avatarOpen && (
              <div style={{ ...dropdownBase('13rem'), right: 0 }}>
                {/* User info header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingBottom: spacing.md,
                    marginBottom: spacing.xs,
                    borderBottom: '1px solid rgba(70,98,145,0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: radius.full,
                      backgroundColor: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {userInitials}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: colors.textPrimary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user ? `${user.first_name} ${user.last_name}` : 'User'}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "'Archivo', sans-serif",
                        fontSize: '0.6875rem',
                        color: colors.blueGrayMd,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.role === 'ADMIN' ? 'Administrator' : 'Staff'}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                {[
                  { icon: UserCircle2, label: 'View Profile',  action: () => { navigate('/people?profile=me'); closeAll(); } },
                  { icon: Settings,    label: 'Settings',      action: () => { navigate('/settings');          closeAll(); } },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: radius.sm,
                      border: 'none',
                      background: 'transparent',
                      color: colors.textPrimary,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.bgSubtle)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Icon size={14} color={colors.blueGrayMd} />
                    {label}
                  </button>
                ))}

                {/* Logout — separated */}
                <div style={{ borderTop: '1px solid rgba(70,98,145,0.1)', marginTop: spacing.xs, paddingTop: spacing.xs }}>
                  <button
                    onClick={() => { logout(); navigate('/sign-in'); closeAll(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing.md,
                      padding: `${spacing.sm} ${spacing.md}`,
                      borderRadius: radius.sm,
                      border: 'none',
                      background: 'transparent',
                      color: colors.error,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      transition: 'background-color 0.12s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} color={colors.error} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
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
        backgroundColor: active ? colors.bgHover : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? colors.primary : colors.blueGrayMd,
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.backgroundColor = colors.bgSubtle;
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
    backgroundColor: colors.bgSurface,
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

import { useState } from 'react';
import { Bell, LayoutGrid, Package, ClipboardList, FileKey, Users, LayoutDashboard } from 'lucide-react';
import { colors } from '../theme';

interface HeaderProps {
  title: string;
}

// ── Dummy data ────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    text: 'LeJon James checked out a MacBook Pro',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 2,
    text: 'Maria Chen returned a USB-C Dock',
    time: '15 min ago',
    unread: true,
  },
  {
    id: 3,
    text: 'Tyler Brooks submitted an asset request',
    time: '1 hr ago',
    unread: true,
  },
  {
    id: 4,
    text: 'Priya Nair completed a device audit',
    time: '3 hrs ago',
    unread: false,
  },
];

const QUICK_LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/home' },
  { icon: Package, label: 'Assets', path: '/assets' },
  { icon: ClipboardList, label: 'Inventory', path: '/inventory' },
  { icon: FileKey, label: 'Licenses', path: '/licenses' },
  { icon: Users, label: 'People', path: '/people' },
];

const UNREAD_COUNT = NOTIFICATIONS.filter(n => n.unread).length;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Header({ title }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);

  const closeAll = () => {
    setNotifOpen(false);
    setGridOpen(false);
  };

  return (
    <>
      {/* Backdrop — closes any open dropdown on outside click */}
      {(notifOpen || gridOpen) && (
        <div
          onClick={closeAll}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 149,
          }}
        />
      )}

      <header
        style={{
          height: '60px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(70, 98, 145, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          flexShrink: 0,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: '20px',
            fontWeight: 700,
            color: colors.textPrimary,
            margin: 0,
          }}
        >
          {title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

          {/* ── Grid / Quick Access ── */}
          <div style={{ position: 'relative', zIndex: 150 }}>
            <IconBtn
              active={gridOpen}
              onClick={() => { setGridOpen(v => !v); setNotifOpen(false); }}
            >
              <LayoutGrid size={17} />
            </IconBtn>

            {gridOpen && (
              <div style={dropdownBase(180)}>
                <p style={dropdownTitle}>Quick Access</p>
                {QUICK_LINKS.map(({ icon: Icon, label, path }) => (
                  <a
                    key={path}
                    href={path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      color: colors.textPrimary,
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '13px',
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
              <IconBtn
                active={notifOpen}
                onClick={() => { setNotifOpen(v => !v); setGridOpen(false); }}
              >
                <Bell size={17} />
              </IconBtn>
              {UNREAD_COUNT > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
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
              <div style={{ ...dropdownBase(300), right: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <p style={{ ...dropdownTitle, margin: 0 }}>Notifications</p>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: "'Archivo', sans-serif",
                      color: colors.blueGrayMd,
                    }}
                  >
                    {UNREAD_COUNT} unread
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {NOTIFICATIONS.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '6px',
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
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        {n.unread && (
                          <div
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: colors.primary,
                              marginTop: '5px',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              margin: '0 0 2px',
                              fontFamily: "'Archivo', sans-serif",
                              fontSize: '12.5px',
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
                              fontSize: '11px',
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
                    marginTop: '8px',
                    paddingTop: '8px',
                    textAlign: 'center',
                  }}
                >
                  <a
                    href="/activity"
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: '12.5px',
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
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              marginLeft: '4px',
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
        width: '34px',
        height: '34px',
        borderRadius: '8px',
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

function dropdownBase(width: number): React.CSSProperties {
  return {
    position: 'absolute',
    top: '42px',
    right: 0,
    width: `${width}px`,
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid rgba(70,98,145,0.12)',
    boxShadow: '0 8px 32px rgba(3,12,35,0.12)',
    padding: '12px',
    zIndex: 150,
  };
}

const dropdownTitle: React.CSSProperties = {
  fontFamily: "'Roboto', sans-serif",
  fontSize: '13px',
  fontWeight: 700,
  color: colors.textPrimary,
  margin: '0 0 8px',
};

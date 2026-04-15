import { useState, useMemo } from 'react';
import { LogIn, LogOut, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ComingSoonPanel from '../components/ComingSoonPanel';
import AssetCheckOutModal from '../components/AssetCheckOutModal';
import AssetCheckInModal from '../components/AssetCheckInModal';
import ChangeStatusModal from '../components/ChangeStatusModal';
import { colors, spacing, radius, statusColors } from '../theme';
import type { Asset, AssetStatus } from '../types/asset';
import { INITIAL_ASSETS } from '../components/AssetsTabContent';

type EntityTab = 'All' | 'Assets' | 'Accessories' | 'Licenses' | 'Consumables';
const ENTITY_TABS: EntityTab[] = ['All', 'Assets', 'Accessories', 'Licenses', 'Consumables'];

const STATUS_TABS: Array<AssetStatus | 'All'> = [
  'All', 'Available', 'Deployed', 'In Repair', 'Retired', 'To Audit',
];

const STATUS_CONFIG: Record<AssetStatus, { dot: string; label: string }> = {
  'Available': { dot: colors.success, label: 'Available' },
  'Deployed':  { dot: colors.primary, label: 'Deployed' },
  'In Repair': { dot: colors.orangeAccent, label: 'In Repair' },
  'Retired':   { dot: statusColors.retired, label: 'Retired' },
  'To Audit':  { dot: statusColors.toAudit, label: 'To Audit' },
};

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

export default function Status() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [entityTab, setEntityTab] = useState<EntityTab>('All');
  const [statusTab, setStatusTab] = useState<AssetStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [checkOutTarget, setCheckOutTarget] = useState<Asset | null>(null);
  const [checkInTarget,  setCheckInTarget]  = useState<Asset | null>(null);
  const [statusTarget,   setStatusTarget]   = useState<Asset | null>(null);

  const statCards = useMemo(() => {
    const available = assets.filter(a => a.status === 'Available').length;
    const deployed  = assets.filter(a => a.status === 'Deployed').length;
    const toAudit   = assets.filter(a => a.status === 'To Audit').length;
    return [
      { title: 'Available', value: available },
      { title: 'Deployed',  value: deployed },
      { title: 'To Audit',  value: toAudit },
    ];
  }, [assets]);

  const filtered = useMemo(() => {
    let items = assets;
    if (statusTab !== 'All') items = items.filter(a => a.status === statusTab);
    const q = search.toLowerCase().trim();
    if (q) {
      items = items.filter(a =>
        a.asset_tag.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.assigned_to ?? '').toLowerCase().includes(q),
      );
    }
    return items;
  }, [assets, statusTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems  = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleCheckOut = (assetId: number, assignedTo: string, _notes: string) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, status: 'Deployed', assigned_to: assignedTo, updated_at: new Date().toISOString().split('T')[0] } : a,
    ));
  };

  const handleCheckIn = (assetId: number, _notes: string) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, status: 'Available', assigned_to: undefined, updated_at: new Date().toISOString().split('T')[0] } : a,
    ));
  };

  const handleStatusChange = (assetId: number, status: AssetStatus, _notes: string) => {
    setAssets(prev => prev.map(a =>
      a.id === assetId ? { ...a, status, updated_at: new Date().toISOString().split('T')[0] } : a,
    ));
  };

  const showAssetsTable = entityTab === 'All' || entityTab === 'Assets';

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
        <Header title="Status" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* Stat cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.lg, marginBottom: spacing.xl2 }}>
            {statCards.map(card => (
              <StatisticCard key={card.title} title={card.title} value={card.value} />
            ))}
          </div>

          {/* Entity tabs */}
          <div
            style={{
              display: 'flex',
              gap: spacing.xs,
              marginBottom: spacing.xl,
              borderBottom: '1px solid rgba(70, 98, 145, 0.15)',
            }}
          >
            {ENTITY_TABS.map(tab => {
              const isActive = entityTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { setEntityTab(tab); setCurrentPage(1); }}
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

          {/* Accessories / Licenses / Consumables → Coming Soon */}
          {(entityTab === 'Accessories' || entityTab === 'Licenses' || entityTab === 'Consumables') && (
            <ComingSoonPanel
              label={`${entityTab} Status — Coming Soon`}
              description="Live status for this entity type will appear here once the backend catches up."
            />
          )}

          {/* Assets / All → status table */}
          {showAssetsTable && (
            <div
              style={{
                backgroundColor: colors.bgSurface,
                borderRadius: radius.lg,
                border: '1px solid rgba(70, 98, 145, 0.1)',
                boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: `${spacing.md} ${spacing.xl}`,
                  borderBottom: '1px solid rgba(70, 98, 145, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: spacing.md,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flex: 1, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: colors.textPrimary,
                      marginRight: spacing.sm,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Assets
                  </span>
                  <div style={{ display: 'flex', gap: spacing.xs, flexWrap: 'wrap' }}>
                    {STATUS_TABS.map(tab => (
                      <button
                        key={tab}
                        onClick={() => { setStatusTab(tab); setCurrentPage(1); }}
                        style={{
                          padding: `0.25rem ${spacing.md}`,
                          borderRadius: radius.full,
                          border: statusTab === tab ? 'none' : '1px solid rgba(70,98,145,0.25)',
                          backgroundColor: statusTab === tab ? colors.primary : 'transparent',
                          color: statusTab === tab ? colors.white : colors.blueGrayMd,
                          fontFamily: "'Archivo', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.15s, color 0.15s',
                        }}
                      >
                        {tab === 'All' ? 'All' : tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <SearchBar value={search} onChange={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search by tag, category, holder…" />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={TH}>Asset Tag</th>
                      <th style={TH}>Category</th>
                      <th style={TH}>Status</th>
                      <th style={TH}>Assigned To</th>
                      <th style={TH}>Last Updated</th>
                      <th style={{ ...TH, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            ...TD,
                            textAlign: 'center',
                            color: colors.blueGrayMd,
                            padding: `${spacing.xl3} ${spacing.md}`,
                          }}
                        >
                          No assets match your filters.
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((asset, idx) => {
                        const cfg = STATUS_CONFIG[asset.status];
                        const isAvailable = asset.status === 'Available';
                        const isDeployed  = asset.status === 'Deployed';
                        return (
                          <tr
                            key={asset.id}
                            style={{ backgroundColor: idx % 2 === 0 ? colors.bgSurface : colors.bgStripe }}
                          >
                            <td style={{ ...TD, fontWeight: 500 }}>{asset.asset_tag}</td>
                            <td style={TD}>{asset.category}</td>
                            <td style={TD}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                <span
                                  style={{
                                    width: '0.5rem', height: '0.5rem',
                                    borderRadius: '50%',
                                    backgroundColor: cfg.dot,
                                    display: 'inline-block',
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ fontSize: '0.8125rem', color: colors.textPrimary }}>
                                  {cfg.label}
                                </span>
                              </span>
                            </td>
                            <td style={{ ...TD, color: asset.assigned_to ? colors.textPrimary : colors.blueGrayMd }}>
                              {asset.assigned_to ?? '—'}
                            </td>
                            <td style={{ ...TD, color: colors.blueGrayMd, fontSize: '0.75rem' }}>
                              {asset.updated_at}
                            </td>
                            <td style={{ ...TD, textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.xs }}>
                                <button
                                  onClick={() => setStatusTarget(asset)}
                                  title="Change Status"
                                  style={iconBtnStyle(colors.blueGrayMd)}
                                >
                                  <RefreshCw size={11} />
                                </button>

                                {isDeployed && (
                                  <button
                                    onClick={() => setCheckInTarget(asset)}
                                    style={actionPillStyle(colors.orangeAccent)}
                                  >
                                    <LogIn size={10} />
                                    Check In
                                  </button>
                                )}

                                {isAvailable && (
                                  <button
                                    onClick={() => setCheckOutTarget(asset)}
                                    style={actionPillStyle(colors.success)}
                                  >
                                    <LogOut size={10} />
                                    Check Out
                                  </button>
                                )}

                                {!isAvailable && !isDeployed && (
                                  <span style={{ color: colors.blueGrayMd, fontSize: '0.75rem' }}>—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: `0 ${spacing.xl} ${spacing.sm}`, borderTop: '1px solid rgba(70, 98, 145, 0.07)' }}>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </div>
          )}
        </main>
      </div>

      <AssetCheckOutModal
        isOpen={checkOutTarget !== null}
        asset={checkOutTarget}
        onClose={() => setCheckOutTarget(null)}
        onConfirm={handleCheckOut}
      />

      <AssetCheckInModal
        isOpen={checkInTarget !== null}
        asset={checkInTarget}
        onClose={() => setCheckInTarget(null)}
        onConfirm={handleCheckIn}
      />

      <ChangeStatusModal
        isOpen={statusTarget !== null}
        asset={statusTarget}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleStatusChange}
      />
    </div>
  );
}

function iconBtnStyle(bg: string): React.CSSProperties {
  return {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: radius.sm,
    border: 'none',
    backgroundColor: bg,
    color: colors.white,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  };
}

function actionPillStyle(bg: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: `0.2rem 0.625rem`,
    borderRadius: radius.full,
    border: 'none',
    backgroundColor: bg,
    color: colors.white,
    fontFamily: "'Archivo', sans-serif",
    fontSize: '0.6875rem',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  };
}

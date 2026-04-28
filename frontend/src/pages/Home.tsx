import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import { colors, spacing, radius, fontSize, shadows, surfaces, chartColors } from '../theme';
import { assetsApi, accessoriesApi, usersApi, transactionsApi } from '../api';
import type { Asset } from '../types/asset';
import type { Accessory } from '../types/inventory';
import type { Person } from '../types/people';
import type { TransactionLog } from '../types/activity';
import { TX_TYPE_LABELS } from '../types/activity';
import { ASSET_STATUS_LABELS } from '../types/asset';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


// ── Component ─────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE: React.CSSProperties = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: '0.75rem',
  borderRadius: radius.md,
  border: `1px solid ${surfaces.cardBorderSm}`,
  boxShadow: shadows.card,
};

const TICK_STYLE = {
  fontFamily: "'Archivo', sans-serif",
  fontSize: 11,
  fill: colors.blueGrayMd,
} as const;

export default function Home() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      assetsApi.list(),
      accessoriesApi.list(),
      usersApi.list(),
      transactionsApi.list({ ordering: '-created_at' }),
    ])
      .then(([a, ac, p, t]) => {
        if (cancelled) return;
        setAssets(a);
        setAccessories(ac);
        setPeople(p);
        setTransactions(t);
      })
      .catch(err => console.error('Home: failed to load dashboard data', err));
    return () => { cancelled = true; };
  }, []);

  // ── Stat card data ──────────────────────────────────────────────────────
  const available = assets.filter(a => a.status === 'AVAILABLE').length;
  const deployed  = assets.filter(a => a.status === 'DEPLOYED').length;
  const toAudit   = assets.filter(a => a.status === 'TO_AUDIT').length;
  const inRepair       = assets.filter(a => a.status === 'IN_REPAIR').length;
  const inMaintenance  = assets.filter(a => a.status === 'IN_MAINTENANCE').length;

  const statCards = [
    { title: 'Total Assets',    value: assets.length,       path: '/inventory?tab=Assets' },
    { title: 'Available',       value: available,            path: '/inventory?tab=Assets&status=AVAILABLE' },
    { title: 'Deployed',        value: deployed,             path: '/inventory?tab=Assets&status=DEPLOYED' },
    { title: 'To Audit',        value: toAudit,              path: '/inventory?tab=Assets&status=TO_AUDIT' },
    { title: 'In Repair',       value: inRepair,             path: '/inventory?tab=Assets&status=IN_REPAIR' },
    { title: 'In Maintenance',  value: inMaintenance,        path: '/inventory?tab=Assets&status=IN_MAINTENANCE' },
  ];

  const overviewCards = [
    { title: 'Total People',     value: people.filter(p => p.is_active).length, path: '/people' },
    { title: 'Total Accessories',value: accessories.length, path: '/inventory?tab=Accessories' },
    { title: 'Low Stock Items',  value: accessories.filter(a => a.quantity_available > 0 && a.quantity_available < a.min_quantity).length, path: '/inventory?tab=Accessories' },
    { title: 'Recent Activity',  value: transactions.length, path: '/activity' },
  ];

  // ── Chart data ──────────────────────────────────────────────────────────
  const statusCounts = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    // "In Maintenance" is abbreviated in the donut legend so it fits.
    name: status === 'IN_MAINTENANCE'
      ? 'In Maint.'
      : (ASSET_STATUS_LABELS[status as keyof typeof ASSET_STATUS_LABELS] ?? status),
    value: count,
    color: chartColors.status[status as keyof typeof chartColors.status] ?? colors.blueGrayMd,
  }));

  const txTypeCounts = Object.entries(
    transactions.reduce<Record<string, number>>((acc, t) => {
      acc[t.transaction_type] = (acc[t.transaction_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({
    name: TX_TYPE_LABELS[type] ?? type,
    value: count,
    fill: chartColors.txType[type as keyof typeof chartColors.txType] ?? colors.blueGrayMd,
  }));

  // Assets by category
  const categoryCounts = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ name: category, value: count, fill: colors.primary }));

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
        <Header title="Home" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* ── Section: Asset Status ── */}
          <SectionHeader>Asset Status</SectionHeader>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.lg,
              marginBottom: spacing.xl2,
            }}
          >
            {statCards.map(card => (
              <StatisticCard
                key={card.title}
                title={card.title}
                value={card.value}
                onClick={() => navigate(card.path)}
              />
            ))}
          </div>

          {/* ── Section: Overview ── */}
          <SectionHeader>Overview</SectionHeader>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.lg,
              marginBottom: spacing.xl2,
            }}
          >
            {overviewCards.map(card => (
              <StatisticCard
                key={card.title}
                title={card.title}
                value={card.value}
                onClick={() => navigate(card.path)}
              />
            ))}
          </div>

          {/* ── Charts Row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: spacing.lg, marginBottom: spacing.xl2 }}>

            {/* Asset Status Distribution */}
            <ChartCard title="Asset Status Distribution">
              {statusCounts.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg }}>
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie
                        data={statusCounts}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        strokeWidth={2}
                        stroke={colors.bgSurface}
                      >
                        {statusCounts.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                    {statusCounts.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                        <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Archivo', sans-serif", fontSize: fontSize.xs, color: colors.blueGrayMd }}>{s.name}</span>
                        <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: fontSize.xs, fontWeight: 700, color: colors.textPrimary, marginLeft: 'auto' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyChartMessage />
              )}
            </ChartCard>

            {/* Activity Breakdown */}
            <ChartCard title="Activity Breakdown">
              {txTypeCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={txTypeCounts} barSize={28}>
                    <XAxis dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {txTypeCounts.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage />
              )}
            </ChartCard>

            {/* Assets by Category */}
            <ChartCard title="Assets by Category">
              {categoryCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={categoryCounts} layout="vertical" barSize={18}>
                    <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} fill={colors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartMessage />
              )}
            </ChartCard>
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'Roboto', sans-serif",
        fontSize: '0.75rem',
        fontWeight: 600,
        color: colors.blueGrayMd,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        margin: `0 0 ${spacing.md}`,
      }}
    >
      {children}
    </p>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.lg,
        border: `1px solid ${surfaces.cardBorder}`,
        boxShadow: shadows.card,
        padding: spacing.xl,
      }}
    >
      <p
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: fontSize.sm,
          fontWeight: 700,
          color: colors.textPrimary,
          margin: `0 0 ${spacing.md}`,
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div
      style={{
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.blueGrayMd,
        fontFamily: "'Archivo', sans-serif",
        fontSize: fontSize.sm,
      }}
    >
      No data available
    </div>
  );
}

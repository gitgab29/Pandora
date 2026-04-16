import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import ActivityLogTable from '../components/ActivityLogTable';
import { spacing } from '../theme';
import type { ActivityLogEntry } from '../types/activity';
import { toActivityLogEntry } from '../types/activity';
import { assetsApi, transactionsApi } from '../api';
import type { Asset } from '../types/asset';


// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    assetsApi.list().then(setAssets);
    transactionsApi.list({ ordering: '-created_at' })
      .then(data => setLogs(data.slice(0, 10).map(toActivityLogEntry)));
  }, []);

  const statCards = [
    { title: 'Available',   value: assets.filter(a => a.status === 'AVAILABLE').length },
    { title: 'Deployed',    value: assets.filter(a => a.status === 'DEPLOYED').length },
    { title: 'To Audit',    value: assets.filter(a => a.status === 'TO_AUDIT').length },
    { title: 'In Repair',   value: assets.filter(a => a.status === 'IN_REPAIR').length },
    { title: 'Total Assets',value: assets.length },
  ];

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

      {/* Main column */}
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

          {/* ── Stat cards ── */}
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
              />
            ))}
          </div>

          {/* ── Activity Log ── */}
          <ActivityLogTable logs={logs} />
        </main>
      </div>
    </div>
  );
}

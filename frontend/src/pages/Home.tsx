import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticCard from '../components/StatisticCard';
import ActivityLogTable from '../components/ActivityLogTable';
import { spacing } from '../theme';
import type { TransactionLog } from '../types/activity';

// ── Dummy stat data ───────────────────────────────────────────────────────────

const STAT_CARDS = [
  { title: 'Available',          value: 56, trend: { value: 56, direction: 'down' as const } },
  { title: 'Pending Check Outs', value: 3,  trend: { value: 49, direction: 'up'   as const } },
  { title: 'Audits',             value: 20, trend: { value: 66, direction: 'up'   as const } },
  { title: 'Asset Requests',     value: 8  },
  { title: 'Pending Check Ins',  value: 2  },
];

// ── Dummy log data ────────────────────────────────────────────────────────────

const USERS  = ['LeJon James', 'Maria Chen', 'Tyler Brooks', 'Priya Nair', 'Sam Okafor'];
const TYPES  = ['Asset', 'Inventory', 'License'];
const EVENTS = ['Check In', 'Check Out', 'Update', 'Audit', 'Request'];
const ITEMS  = ['MacBook Pro', 'Dell Monitor', 'USB-C Dock', 'iPhone 15 Pro', 'iPad Air', 'Magic Keyboard', 'MX Master Mouse'];
const NOTES  = [
  'Updated the RAM Detail',
  'Device returned in good condition',
  'Assigned to new hire',
  'Warranty verified',
  'Replaced broken unit',
  'Upgraded storage to 1TB',
  'Synced with inventory system',
  '—',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLogs(count: number): TransactionLog[] {
  const base = new Date('2026-04-03T07:30:00');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base.getTime() - i * 1000 * 60 * 47);
    return {
      id: i + 1,
      date: `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
      user:   randomFrom(USERS),
      type:   randomFrom(TYPES),
      event:  randomFrom(EVENTS),
      item:   randomFrom(ITEMS),
      toFrom: Math.random() > 0.4 ? randomFrom(USERS) : '—',
      notes:  randomFrom(NOTES),
    };
  });
}

const ALL_LOGS: TransactionLog[] = generateLogs(68);

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            {STAT_CARDS.map(card => (
              <StatisticCard
                key={card.title}
                title={card.title}
                value={card.value}
                trend={card.trend}
              />
            ))}
          </div>

          {/* ── Activity Log ── */}
          <ActivityLogTable logs={ALL_LOGS} />
        </main>
      </div>
    </div>
  );
}

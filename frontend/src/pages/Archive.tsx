import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ArchiveAssetsTabContent from '../components/ArchiveAssetsTabContent';
import ArchiveAccessoriesTabContent from '../components/ArchiveAccessoriesTabContent';
import ArchiveUsersTabContent from '../components/ArchiveUsersTabContent';
import ActivityLogTable from '../components/ActivityLogTable';
import { colors, spacing } from '../theme';
import type { ActivityLogEntry } from '../types/activity';
import { toActivityLogEntry } from '../types/activity';
import { transactionsApi } from '../api';

type ArchiveTab = 'Assets' | 'Accessories' | 'Users' | 'Activity Logs';
const ARCHIVE_TABS: ArchiveTab[] = ['Assets', 'Accessories', 'Users', 'Activity Logs'];

function ArchiveActivityTabContent() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  useEffect(() => {
    transactionsApi.list({ older_than_days: 15, ordering: '-transaction_date' })
      .then(data => setLogs(data.map(toActivityLogEntry)))
      .catch(() => {});
  }, []);

  return <ActivityLogTable logs={logs} />;
}

export default function Archive() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ArchiveTab>('Assets');

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
        <Header title="Archive" />

        <main style={{ flex: 1, overflowY: 'auto', padding: spacing.xl2 }}>

          {/* Entity tabs */}
          <div
            style={{
              display: 'flex',
              gap: spacing.xs,
              marginBottom: spacing.xl2,
              borderBottom: '1px solid rgba(70, 98, 145, 0.15)',
            }}
          >
            {ARCHIVE_TABS.map(tab => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
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

          {activeTab === 'Assets'      && <ArchiveAssetsTabContent />}
          {activeTab === 'Accessories' && <ArchiveAccessoriesTabContent />}
          {activeTab === 'Users'       && <ArchiveUsersTabContent />}
          {activeTab === 'Activity Logs' && <ArchiveActivityTabContent />}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { colors } from '../theme';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
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

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'rgba(244, 246, 249, 0.92)',
        }}
      >
        <Header title={title} />

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: '22px',
              fontWeight: 700,
              color: colors.textPrimary,
              margin: 0,
            }}
          >
            Coming Soon
          </p>
          <p
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: '14px',
              color: colors.blueGrayMd,
              margin: 0,
            }}
          >
            This section is under construction.
          </p>
        </main>
      </div>
    </div>
  );
}

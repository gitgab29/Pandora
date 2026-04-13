import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { colors } from '../theme';

interface Trend {
  value: number;
  direction: 'up' | 'down';
}

interface StatisticCardProps {
  title: string;
  value: number;
  trend?: Trend;
  onClick?: () => void;
}

export default function StatisticCard({ title, value, trend, onClick }: StatisticCardProps) {
  const trendColor = trend?.direction === 'up' ? '#22c55e' : '#ef4444';

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px 22px 18px',
        border: '1px solid rgba(70, 98, 145, 0.1)',
        boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
        cursor: onClick ? 'pointer' : 'default',
        flex: '1 1 200px',
        minWidth: '160px',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: colors.blueGrayMd,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        <ArrowUpRight size={15} color={colors.blueGrayMd} style={{ opacity: 0.6 }} />
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '42px',
          fontWeight: 700,
          color: colors.textPrimary,
          lineHeight: 1.1,
          marginTop: '6px',
        }}
      >
        {value}
      </div>

      {/* Trend */}
      {trend && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '8px',
          }}
        >
          {trend.direction === 'up' ? (
            <TrendingUp size={13} color={trendColor} />
          ) : (
            <TrendingDown size={13} color={trendColor} />
          )}
          <span
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              color: trendColor,
            }}
          >
            {trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        </div>
      )}
    </div>
  );
}

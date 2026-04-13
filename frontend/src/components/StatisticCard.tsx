import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { colors, spacing, radius } from '../theme';

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
        borderRadius: radius.lg,
        padding: `${spacing.xl} ${spacing.xl} 1.125rem`,
        border: '1px solid rgba(70, 98, 145, 0.1)',
        boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
        cursor: onClick ? 'pointer' : 'default',
        flex: '1 1 12.5rem',
        minWidth: '10rem',
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '0.75rem',
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
          fontSize: '2.625rem',
          fontWeight: 700,
          color: colors.textPrimary,
          lineHeight: 1.1,
          marginTop: spacing.xs,
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
            gap: spacing.xs,
            marginTop: spacing.sm,
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
              fontSize: '0.75rem',
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

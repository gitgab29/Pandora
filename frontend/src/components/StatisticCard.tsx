import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

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
  const trendColor = trend?.direction === 'up' ? colors.success : colors.error;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.lg,
        padding: `${spacing.xl} ${spacing.xl} 1.125rem`,
        border: '1px solid rgba(70, 98, 145, 0.1)',
        boxShadow: shadows.card,
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
            fontSize: fontSize.xs,
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
          fontSize: fontSize.h1,
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
              fontSize: fontSize.xs,
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

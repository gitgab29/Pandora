import { Wrench } from 'lucide-react';
import { colors, spacing, radius } from '../theme';

interface ComingSoonPanelProps {
  label?: string;
  description?: string;
}

export default function ComingSoonPanel({
  label = 'Coming Soon',
  description = 'This section is under construction.',
}: ComingSoonPanelProps) {
  return (
    <div
      style={{
        backgroundColor: colors.bgSurface,
        borderRadius: radius.lg,
        border: '1px solid rgba(70, 98, 145, 0.1)',
        boxShadow: '0 1px 4px rgba(3, 12, 35, 0.06)',
        padding: `${spacing.xl3} ${spacing.xl}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
        minHeight: '22rem',
      }}
    >
      <div
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: radius.full,
          backgroundColor: 'rgba(46, 124, 253, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.primary,
        }}
      >
        <Wrench size={20} />
      </div>
      <p
        style={{
          fontFamily: "'Roboto', sans-serif",
          fontSize: '1.125rem',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: '0.8125rem',
          color: colors.blueGrayMd,
          margin: 0,
          textAlign: 'center',
          maxWidth: '22rem',
        }}
      >
        {description}
      </p>
    </div>
  );
}

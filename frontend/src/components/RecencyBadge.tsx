import { colors, radius } from '../theme';

export default function RecencyBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      aria-label="New"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '1.25rem',
        padding: '0 0.5rem',
        borderRadius: radius.sm,
        backgroundColor: colors.primary,
        color: colors.white,
        fontFamily: "'Archivo', sans-serif",
        fontSize: '0.6875rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      NEW
    </span>
  );
}

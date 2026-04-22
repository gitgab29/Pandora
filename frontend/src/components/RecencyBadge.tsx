import { colors, radius } from '../theme';

export default function RecencyBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.1rem 0.375rem',
        borderRadius: radius.full,
        backgroundColor: 'rgba(46,124,253,0.12)',
        color: colors.primary,
        fontFamily: "'Archivo', sans-serif",
        fontSize: '0.5625rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginLeft: '0.375rem',
        flexShrink: 0,
        verticalAlign: 'middle',
        lineHeight: 1.4,
      }}
    >
      New
    </span>
  );
}

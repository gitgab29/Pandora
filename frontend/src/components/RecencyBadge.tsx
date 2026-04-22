import { colors } from '../theme';

export default function RecencyBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: colors.primary,
        boxShadow: `0 0 0 2px rgba(46,124,253,0.25)`,
        marginLeft: '0.4rem',
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
      aria-label="New"
    />
  );
}

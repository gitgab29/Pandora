import { ArrowUpDown, Check } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

interface SortDropdownProps {
  open: boolean;
  onToggle: () => void;
  options: string[];
  activeSort: string;
  onSortChange: (opt: string) => void;
}

export default function SortDropdown({
  open,
  onToggle,
  options,
  activeSort,
  onSortChange,
}: SortDropdownProps) {
  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <ActionIconBtn title="Sort" active={open} onClick={onToggle}>
        <ArrowUpDown size={15} />
      </ActionIconBtn>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: 0,
            width: '12.5rem',
            backgroundColor: colors.bgSurface,
            borderRadius: radius.lg,
            border: '1px solid rgba(70,98,145,0.14)',
            boxShadow: shadows.dropdown,
            padding: spacing.sm,
            zIndex: 100,
          }}
        >
          <p
            style={{
              margin: `0.25rem ${spacing.sm} ${spacing.sm}`,
              fontFamily: "'Roboto', sans-serif",
              fontSize: fontSize.label,
              fontWeight: 700,
              color: colors.blueGrayMd,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Sort by
          </p>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => onSortChange(opt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: radius.sm,
                border: 'none',
                backgroundColor: activeSort === opt ? 'rgba(46,124,253,0.06)' : 'transparent',
                cursor: 'pointer',
                fontFamily: "'Archivo', sans-serif",
                fontSize: fontSize.sm,
                color: activeSort === opt ? colors.primary : colors.textPrimary,
                fontWeight: activeSort === opt ? 600 : 400,
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (activeSort !== opt) e.currentTarget.style.backgroundColor = colors.bgSubtle;
              }}
              onMouseLeave={e => {
                if (activeSort !== opt) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {opt}
              {activeSort === opt && <Check size={13} color={colors.primary} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Private helper ─────────────────────────────────────────────────────────────

function ActionIconBtn({
  children,
  title,
  active,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '2.125rem',
        height: '2.125rem',
        borderRadius: radius.md,
        border: `1px solid ${active ? colors.primary : 'rgba(70, 98, 145, 0.2)'}`,
        backgroundColor: active ? 'rgba(46,124,253,0.06)' : colors.bgSurface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? colors.primary : colors.blueGrayMd,
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = colors.bgSubtle;
          e.currentTarget.style.borderColor = colors.primary;
          e.currentTarget.style.color = colors.primary;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.backgroundColor = colors.bgSurface;
          e.currentTarget.style.borderColor = 'rgba(70, 98, 145, 0.2)';
          e.currentTarget.style.color = colors.blueGrayMd;
        }
      }}
    >
      {children}
    </button>
  );
}

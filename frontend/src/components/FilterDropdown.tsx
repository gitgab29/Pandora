import { ListFilter } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';

export interface FilterGroup {
  label: string;
  options: string[];
}

interface FilterDropdownProps {
  open: boolean;
  onToggle: () => void;
  groups: FilterGroup[];
}

export default function FilterDropdown({ open, onToggle, groups }: FilterDropdownProps) {
  return (
    <div style={{ position: 'relative', zIndex: 100 }}>
      <ActionIconBtn title="Filter" active={open} onClick={onToggle}>
        <ListFilter size={15} />
      </ActionIconBtn>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '2.5rem',
            right: 0,
            width: '15rem',
            backgroundColor: colors.bgSurface,
            borderRadius: radius.lg,
            border: '1px solid rgba(70,98,145,0.14)',
            boxShadow: shadows.dropdown,
            padding: spacing.md,
            zIndex: 100,
          }}
        >
          {groups.map(group => (
            <div key={group.label} style={{ marginBottom: spacing.md }}>
              <p
                style={{
                  margin: `0 0 ${spacing.sm}`,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: fontSize.label,
                  fontWeight: 700,
                  color: colors.blueGrayMd,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {group.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {group.options.map((opt, i) => (
                  <FilterChip key={opt} label={opt} active={i === 0} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Private helpers ────────────────────────────────────────────────────────────

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

function FilterChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      style={{
        padding: `0.1875rem ${spacing.md}`,
        borderRadius: radius.full,
        fontFamily: "'Archivo', sans-serif",
        fontSize: fontSize.xs,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        backgroundColor: active ? colors.primary : colors.bgSubtle,
        color: active ? colors.white : colors.blueGrayMd,
        border: `1px solid ${active ? colors.primary : 'rgba(70,98,145,0.15)'}`,
        transition: 'background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease',
      }}
    >
      {label}
    </span>
  );
}

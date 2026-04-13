import { Search, X } from 'lucide-react';
import { colors, spacing, radius } from '../theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: '#f5f7fb',
        border: `1px solid ${value ? colors.primary : 'rgba(70, 98, 145, 0.2)'}`,
        borderRadius: radius.md,
        padding: `0.4375rem ${spacing.md}`,
        transition: 'border-color 0.15s ease',
      }}
    >
      <Search size={15} color={colors.blueGrayMd} style={{ flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontFamily: "'Archivo', sans-serif",
          fontSize: '0.8125rem',
          color: colors.textPrimary,
          width: '11.25rem',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: colors.blueGrayMd,
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

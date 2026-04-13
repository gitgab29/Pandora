import { Search, X } from 'lucide-react';
import { colors } from '../theme';

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
        gap: '8px',
        backgroundColor: '#f5f7fb',
        border: `1px solid ${value ? colors.primary : 'rgba(70, 98, 145, 0.2)'}`,
        borderRadius: '8px',
        padding: '7px 12px',
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
          fontSize: '13px',
          color: colors.textPrimary,
          width: '180px',
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

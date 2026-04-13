import { useState } from 'react';
import { colors, spacing, radius, typography } from '../theme';

interface InputProps {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  type?: string;
  onChange: (value: string) => void;
}

export default function Input({
  label,
  value,
  error,
  placeholder,
  type = 'text',
  onChange,
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#ef4444'
    : focused
    ? colors.primary
    : '#d1d5db';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      <label
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 700,
          fontSize: '0.8125rem',
          lineHeight: 1.538,
          color: colors.textPrimary,
        }}
      >
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: `${spacing.md} 0.875rem`,
          borderRadius: radius.md,
          border: `1.5px solid ${borderColor}`,
          ...typography.body,
          fontSize: '0.9375rem',
          color: colors.textPrimary,
          backgroundColor: '#ffffff',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease',
        }}
      />

      {error && (
        <span
          style={{
            fontFamily: "'Archivo', sans-serif",
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: '#ef4444',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

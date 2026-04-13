import { useState } from 'react';
import { colors } from '../theme';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 700,
          fontSize: '13px',
          lineHeight: '20px',
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
          padding: '12px 14px',
          borderRadius: '8px',
          border: `1.5px solid ${borderColor}`,
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 400,
          fontSize: '15px',
          lineHeight: '26px',
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
            fontSize: '12px',
            lineHeight: '18px',
            color: '#ef4444',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

import { colors } from '../theme';

type Variant = 'primary' | 'google' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 20px',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: "'Archivo', sans-serif",
    fontWeight: 600,
    lineHeight: '26px',
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    opacity: isDisabled ? 0.6 : 1,
    userSelect: 'none',
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary,
      color: '#ffffff',
    },
    google: {
      backgroundColor: '#ffffff',
      color: colors.textPrimary,
      border: '1.5px solid #dadce0',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#ffffff',
      border: '1.5px solid rgba(255,255,255,0.7)',
    },
  };

  return (
    <button
      disabled={isDisabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => {
        if (isDisabled) return;
        if (variant === 'primary') e.currentTarget.style.backgroundColor = colors.primaryDark;
        if (variant === 'google') e.currentTarget.style.backgroundColor = '#f8f9fa';
        if (variant === 'ghost') e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
      }}
      onMouseLeave={e => {
        if (isDisabled) return;
        if (variant === 'primary') e.currentTarget.style.backgroundColor = colors.primary;
        if (variant === 'google') e.currentTarget.style.backgroundColor = '#ffffff';
        if (variant === 'ghost') e.currentTarget.style.backgroundColor = 'transparent';
      }}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

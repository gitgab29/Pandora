import { colors, radius, typography, fontSize } from '../theme';

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
    gap: '0.625rem',
    width: '100%',
    padding: '0.875rem 1.25rem',
    borderRadius: radius.lg,
    ...typography.body,
    fontSize: fontSize.lg,
    fontWeight: 600,
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.15s ease, opacity 0.15s ease',
    opacity: isDisabled ? 0.6 : 1,
    userSelect: 'none',
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.white,
    },
    google: {
      backgroundColor: colors.bgSurface,
      color: colors.textPrimary,
      border: '1.5px solid #dadce0',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.white,
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
        if (variant === 'google')  e.currentTarget.style.backgroundColor = colors.bgStripe;
        if (variant === 'ghost')   e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
      }}
      onMouseLeave={e => {
        if (isDisabled) return;
        if (variant === 'primary') e.currentTarget.style.backgroundColor = colors.primary;
        if (variant === 'google')  e.currentTarget.style.backgroundColor = colors.bgSurface;
        if (variant === 'ghost')   e.currentTarget.style.backgroundColor = 'transparent';
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

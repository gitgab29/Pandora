import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { colors, spacing, radius, fontSize, shadows } from '../theme';
import type { Toast, ToastKind } from '../context/ToastContext';

interface ToastHostProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

const KIND_META: Record<ToastKind, { accent: string; Icon: typeof CheckCircle2; role: 'status' | 'alert' }> = {
  success: { accent: colors.success, Icon: CheckCircle2,  role: 'status' },
  error:   { accent: colors.error,   Icon: AlertTriangle, role: 'alert'  },
  info:    { accent: colors.primary, Icon: Info,          role: 'status' },
};

export default function ToastHost({ toasts, onDismiss }: ToastHostProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        right: '1.5rem',
        bottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        zIndex: 2000,
        pointerEvents: 'none',
      }}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const { accent, Icon, role } = KIND_META[toast.kind];
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role={role}
      style={{
        pointerEvents: 'auto',
        minWidth: '18rem',
        maxWidth: '22rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing.md,
        padding: `${spacing.md} ${spacing.lg}`,
        borderRadius: radius.lg,
        backgroundColor: colors.bgSurface,
        boxShadow: shadows.dropdown,
        borderLeft: `3px solid ${accent}`,
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 180ms ease-out, transform 180ms ease-out',
      }}
    >
      <Icon size={18} color={accent} style={{ flexShrink: 0, marginTop: '0.0625rem' }} />
      <span
        style={{
          flex: 1,
          fontFamily: "'Archivo', sans-serif",
          fontSize: fontSize.sm,
          color: colors.textPrimary,
          lineHeight: 1.45,
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        style={{
          width: '1.25rem',
          height: '1.25rem',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: colors.grayMed,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

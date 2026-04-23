import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { transactionsApi } from '../api';
import type { TransactionLog } from '../types/activity';
import { useAuth } from './AuthContext';

// ── Notification text formatter ────────────────────────────────────────────────

export function formatNotification(log: TransactionLog): string {
  const who = log.performed_by_detail
    ? `${log.performed_by_detail.first_name} ${log.performed_by_detail.last_name}`
    : 'Someone';

  const item = log.asset_detail?.asset_tag
    ?? log.accessory_detail?.item_name
    ?? 'an item';

  const target = log.to_user_detail
    ? `${log.to_user_detail.first_name} ${log.to_user_detail.last_name}`
    : null;

  switch (log.transaction_type) {
    case 'CHECK_OUT':
      return target ? `${who} checked out ${item} to ${target}` : `${who} checked out ${item}`;
    case 'CHECK_IN':
      return `${who} checked in ${item}`;
    case 'TRANSFER':
      return target ? `${who} transferred ${item} to ${target}` : `${who} transferred ${item}`;
    case 'ADJUSTMENT':
      return `${who} adjusted ${item}`;
    case 'ARCHIVE':
      return `${who} archived ${item}`;
    case 'RESTORE':
      return `${who} restored ${item}`;
    case 'STATUS_IN_REPAIR':
      return `${who} set ${item} to In Repair`;
    case 'STATUS_IN_MAINTENANCE':
      return `${who} set ${item} to In Maintenance`;
    case 'STATUS_LOST':
      return `${who} marked ${item} as Lost`;
    case 'STATUS_TO_AUDIT':
      return `${who} flagged ${item} for audit`;
    case 'STATUS_AVAILABLE':
      return `${who} marked ${item} as Available`;
    case 'STATUS_DEPLOYED':
      return `${who} set ${item} to Deployed`;
    default:
      return log.event_description || `Activity by ${who}`;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface NotificationsContextValue {
  notifications: TransactionLog[];
  unreadCount: number;
  lastSeenAt: string;
  markAllRead: () => void;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<TransactionLog[]>([]);

  const storageKey = user ? `notif:lastSeenAt:${user.id}` : null;

  const getOrInitLastSeenAt = useCallback((): string => {
    if (!storageKey) return new Date().toISOString();
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      const now = new Date().toISOString();
      localStorage.setItem(storageKey, now);
      return now;
    }
    return stored;
  }, [storageKey]);

  const [lastSeenAt, setLastSeenAt] = useState<string>(() => getOrInitLastSeenAt());

  // Resync when user changes (login/logout)
  useEffect(() => {
    setLastSeenAt(getOrInitLastSeenAt());
  }, [getOrInitLastSeenAt]);

  const fetchNotifications = useCallback(() => {
    if (!isAuthenticated) return;
    transactionsApi.list({ ordering: '-transaction_date' })
      .then(data => setNotifications(data.slice(0, 10)))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();
    const handle = setInterval(() => {
      if (!document.hidden) fetchNotifications();
    }, 15_000);
    return () => clearInterval(handle);
  }, [isAuthenticated, fetchNotifications]);

  const unreadCount = notifications.filter(n => n.created_at > lastSeenAt).length;

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    if (storageKey) localStorage.setItem(storageKey, now);
    setLastSeenAt(now);
  }, [storageKey]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, lastSeenAt, markAllRead, refresh: fetchNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationsProvider');
  return ctx;
}

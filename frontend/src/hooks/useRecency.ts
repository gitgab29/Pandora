import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useRecency(feedKey: string) {
  const { user } = useAuth();
  const storageKey = user ? `recency:${user.id}:${feedKey}` : null;

  const initSeenAt = (): string => {
    if (!storageKey) return new Date().toISOString();
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      // First visit — stamp now so existing items don't all appear as new
      const now = new Date().toISOString();
      localStorage.setItem(storageKey, now);
      return now;
    }
    return stored;
  };

  const [seenAt, setSeenAt] = useState<string>(initSeenAt);

  // Resync when user changes (login/logout)
  useEffect(() => {
    if (!storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      const now = new Date().toISOString();
      localStorage.setItem(storageKey, now);
      setSeenAt(now);
    } else {
      setSeenAt(stored);
    }
  }, [storageKey]);

  const isNew = useCallback((createdAt: string): boolean => {
    return createdAt > seenAt;
  }, [seenAt]);

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    if (storageKey) localStorage.setItem(storageKey, now);
    setSeenAt(now);
  }, [storageKey]);

  return { isNew, markSeen };
}

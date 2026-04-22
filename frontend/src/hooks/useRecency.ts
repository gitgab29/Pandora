import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useRecency(feedKey: string) {
  const { user } = useAuth();
  const seenAtKey    = user ? `recency:${user.id}:${feedKey}`           : null;
  const dismissedKey = user ? `recency:${user.id}:${feedKey}:dismissed` : null;

  const initSeenAt = (): string => {
    if (!seenAtKey) return new Date().toISOString();
    const stored = localStorage.getItem(seenAtKey);
    if (!stored) {
      const now = new Date().toISOString();
      localStorage.setItem(seenAtKey, now);
      return now;
    }
    return stored;
  };

  const initDismissed = (): Set<string> => {
    if (!dismissedKey) return new Set();
    try {
      const stored = localStorage.getItem(dismissedKey);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  };

  const [seenAt,       setSeenAt]       = useState<string>(initSeenAt);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(initDismissed);

  useEffect(() => {
    if (!seenAtKey) return;
    const stored = localStorage.getItem(seenAtKey);
    if (!stored) {
      const now = new Date().toISOString();
      localStorage.setItem(seenAtKey, now);
      setSeenAt(now);
    } else {
      setSeenAt(stored);
    }
    if (dismissedKey) {
      try {
        const d = localStorage.getItem(dismissedKey);
        setDismissedIds(d ? new Set(JSON.parse(d) as string[]) : new Set());
      } catch {
        setDismissedIds(new Set());
      }
    }
  }, [seenAtKey, dismissedKey]);

  const isNew = useCallback((id: string, createdAt: string): boolean => {
    return createdAt > seenAt && !dismissedIds.has(id);
  }, [seenAt, dismissedIds]);

  const markItemSeen = useCallback((id: string) => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      if (dismissedKey) {
        localStorage.setItem(dismissedKey, JSON.stringify([...next]));
      }
      return next;
    });
  }, [dismissedKey]);

  return { isNew, markItemSeen };
}

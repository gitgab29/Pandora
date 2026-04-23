import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export type RecencyRow = { id: string; created_at: string; updated_at?: string };

type SeenMap = Record<string, string>;

export const recencyBus = new EventTarget();

export function lastChange(r: RecencyRow): string {
  return r.updated_at && r.updated_at > r.created_at ? r.updated_at : r.created_at;
}

function seenKey(userId: string, feedKey: string) {
  return `recency:${userId}:${feedKey}:seen`;
}
function initKey(userId: string, feedKey: string) {
  return `recency:${userId}:${feedKey}:init`;
}

export function readSeenMap(userId: string, feedKey: string): SeenMap {
  try {
    const raw = localStorage.getItem(seenKey(userId, feedKey));
    return raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    return {};
  }
}

export function readInitAt(userId: string, feedKey: string): string {
  const existing = localStorage.getItem(initKey(userId, feedKey));
  if (existing) return existing;
  const now = new Date().toISOString();
  localStorage.setItem(initKey(userId, feedKey), now);
  return now;
}

function writeSeenMap(userId: string, feedKey: string, map: SeenMap) {
  localStorage.setItem(seenKey(userId, feedKey), JSON.stringify(map));
}

function purgeLegacy(userId: string, feedKey: string) {
  localStorage.removeItem(`recency:${userId}:${feedKey}`);
  localStorage.removeItem(`recency:${userId}:${feedKey}:dismissed`);
}

export function useRecency<T extends RecencyRow>(feedKey: string) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [seenMap, setSeenMap] = useState<SeenMap>(() =>
    userId ? readSeenMap(userId, feedKey) : {},
  );
  const [initAt, setInitAt] = useState<string>(() =>
    userId ? readInitAt(userId, feedKey) : new Date().toISOString(),
  );

  useEffect(() => {
    if (!userId) return;
    purgeLegacy(userId, feedKey);
    setSeenMap(readSeenMap(userId, feedKey));
    setInitAt(readInitAt(userId, feedKey));
  }, [userId, feedKey]);

  useEffect(() => {
    if (!userId) return;
    const h = (e: Event) => {
      const ce = e as CustomEvent<{ feedKey: string; userId: string }>;
      if (ce.detail.feedKey === feedKey && ce.detail.userId === userId) {
        setSeenMap(readSeenMap(userId, feedKey));
      }
    };
    recencyBus.addEventListener('change', h);
    return () => recencyBus.removeEventListener('change', h);
  }, [userId, feedKey]);

  const isNew = useCallback(
    (row: T): boolean => {
      const change = lastChange(row);
      const seen = seenMap[row.id];
      return change > (seen ?? initAt);
    },
    [seenMap, initAt],
  );

  const markSeen = useCallback(
    (ids: string[]) => {
      if (!userId || ids.length === 0) return;
      const now = new Date().toISOString();
      setSeenMap(prev => {
        const next = { ...prev };
        for (const id of ids) next[id] = now;
        writeSeenMap(userId, feedKey, next);
        recencyBus.dispatchEvent(
          new CustomEvent('change', { detail: { feedKey, userId } }),
        );
        return next;
      });
    },
    [userId, feedKey],
  );

  const markAllSeen = useCallback(
    (rows: T[]) => {
      if (!userId || rows.length === 0) return;
      setSeenMap(prev => {
        const next = { ...prev };
        for (const r of rows) next[r.id] = lastChange(r);
        writeSeenMap(userId, feedKey, next);
        recencyBus.dispatchEvent(
          new CustomEvent('change', { detail: { feedKey, userId } }),
        );
        return next;
      });
    },
    [userId, feedKey],
  );

  const newCount = useCallback(
    (rows: T[]): number => rows.reduce((n, r) => (isNew(r) ? n + 1 : n), 0),
    [isNew],
  );

  return useMemo(
    () => ({ isNew, markSeen, markAllSeen, newCount }),
    [isNew, markSeen, markAllSeen, newCount],
  );
}

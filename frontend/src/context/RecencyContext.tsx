import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { assetsApi, accessoriesApi, usersApi, transactionsApi } from '../api';
import type { Asset } from '../types/asset';
import type { Accessory } from '../types/inventory';
import type { Person } from '../types/people';
import type { TransactionLog } from '../types/activity';
import {
  recencyBus,
  lastChange,
  readSeenMap,
  readInitAt,
  type RecencyRow,
} from '../hooks/useRecency';

interface RecencyCounts {
  assets: number;
  accessories: number;
  people: number;
  activity: number;
}

interface RecencyContextValue {
  counts: RecencyCounts;
  inventoryBadge: number;
  peopleBadge: number;
  activityBadge: number;
  refresh: () => void;
}

const RecencyContext = createContext<RecencyContextValue | null>(null);

function countNew<T extends RecencyRow>(
  userId: string,
  feedKey: string,
  rows: T[],
): number {
  const seen = readSeenMap(userId, feedKey);
  const init = readInitAt(userId, feedKey);
  let n = 0;
  for (const r of rows) {
    const last = lastChange(r);
    if (last > (seen[r.id] ?? init)) n++;
  }
  return n;
}

export function RecencyProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [activity, setActivity] = useState<TransactionLog[]>([]);
  const [tick, setTick] = useState(0);

  const fetchAll = useCallback(() => {
    if (!isAuthenticated) return;
    assetsApi.list().then(setAssets).catch(() => {});
    accessoriesApi.list().then(setAccessories).catch(() => {});
    usersApi.list({ is_active: true }).then(setPeople).catch(() => {});
    transactionsApi
      .list({ ordering: '-transaction_date' })
      .then(data => setActivity(data.slice(0, 50)))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setAssets([]);
      setAccessories([]);
      setPeople([]);
      setActivity([]);
      return;
    }
    fetchAll();
    const handle = setInterval(() => {
      if (!document.hidden) fetchAll();
    }, 60_000);
    return () => clearInterval(handle);
  }, [isAuthenticated, fetchAll]);

  useEffect(() => {
    const h = () => setTick(t => t + 1);
    recencyBus.addEventListener('change', h);
    return () => recencyBus.removeEventListener('change', h);
  }, []);

  const counts = useMemo<RecencyCounts>(() => {
    if (!user) return { assets: 0, accessories: 0, people: 0, activity: 0 };
    const uid = user.id;
    return {
      assets: countNew(uid, 'assets', assets),
      accessories: countNew(uid, 'accessories', accessories),
      people: countNew(uid, 'people', people),
      activity: countNew(
        uid,
        'activity',
        activity.map(t => ({
          id: t.id,
          created_at: t.created_at,
          updated_at: t.created_at,
        })),
      ),
    };
    // tick dep forces recompute when recencyBus fires
  }, [user, assets, accessories, people, activity, tick]);

  const value = useMemo<RecencyContextValue>(
    () => ({
      counts,
      inventoryBadge: counts.assets + counts.accessories,
      peopleBadge: counts.people,
      activityBadge: counts.activity,
      refresh: fetchAll,
    }),
    [counts, fetchAll],
  );

  return <RecencyContext.Provider value={value}>{children}</RecencyContext.Provider>;
}

export function useRecencyCounts() {
  const ctx = useContext(RecencyContext);
  if (!ctx) {
    return {
      counts: { assets: 0, accessories: 0, people: 0, activity: 0 },
      inventoryBadge: 0,
      peopleBadge: 0,
      activityBadge: 0,
      refresh: () => {},
    } satisfies RecencyContextValue;
  }
  return ctx;
}

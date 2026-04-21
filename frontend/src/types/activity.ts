import type { UserMinimal } from './asset';

export interface AssetDetail {
  id: string;
  asset_tag: string;
  category: string;
}

export interface AccessoryDetail {
  id: string;
  item_name: string;
}

/** Shape returned by the API  (GET /api/transactions/) */
export interface TransactionLog {
  id: string;
  transaction_date: string;
  performed_by: string;
  performed_by_detail: UserMinimal;
  transaction_type: 'CHECK_OUT' | 'CHECK_IN' | 'TRANSFER' | 'ADJUSTMENT';
  event_description: string;
  asset: string | null;
  asset_detail: AssetDetail | null;
  accessory: string | null;
  accessory_detail: AccessoryDetail | null;
  to_user: string | null;
  to_user_detail: UserMinimal | null;
  from_user: string | null;
  from_user_detail: UserMinimal | null;
  quantity: number;
  notes: string;
  created_at: string;
}

/** Flat shape consumed by ActivityLogTable and ActivityDetailModal. */
export interface ActivityLogEntry {
  id: string;
  date: string;
  rawDate: string;
  user: string;
  /** 'Asset' | 'Accessory' | 'Transfer' | 'Adjustment' */
  type: string;
  event: string;
  item: string;
  toFrom: string;
  notes: string;
  department?: string;
}

const TX_TYPE_LABEL: Record<string, string> = {
  CHECK_OUT:  'Check Out',
  CHECK_IN:   'Check In',
  TRANSFER:   'Transfer',
  ADJUSTMENT: 'Adjustment',
};

/** Map an API TransactionLog to the UI flat ActivityLogEntry. */
export function toActivityLogEntry(log: TransactionLog): ActivityLogEntry {
  const who = log.performed_by_detail
    ? `${log.performed_by_detail.first_name} ${log.performed_by_detail.last_name}`
    : '—';

  const item = log.asset_detail?.asset_tag
    ?? log.accessory_detail?.item_name
    ?? '—';

  const toFrom = (() => {
    if (log.to_user_detail) {
      return `${log.to_user_detail.first_name} ${log.to_user_detail.last_name}`;
    }
    if (log.from_user_detail) {
      return `${log.from_user_detail.first_name} ${log.from_user_detail.last_name}`;
    }
    return '—';
  })();

  const type = log.asset_detail ? 'Asset' : log.accessory_detail ? 'Inventory' : 'Other';

  return {
    id: log.id,
    date: new Date(log.transaction_date).toLocaleString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    }),
    rawDate: log.transaction_date,
    user: who,
    type,
    event: TX_TYPE_LABEL[log.transaction_type] ?? log.transaction_type,
    item,
    toFrom,
    notes: log.notes || log.event_description || '—',
  };
}

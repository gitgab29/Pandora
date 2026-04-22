export type AssetStatus =
  | 'AVAILABLE'
  | 'DEPLOYED'
  | 'IN_REPAIR'
  | 'IN_MAINTENANCE'
  | 'LOST'
  | 'TO_AUDIT';

export const ASSET_STATUS_OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: 'AVAILABLE',      label: 'Available' },
  { value: 'DEPLOYED',       label: 'Deployed' },
  { value: 'IN_REPAIR',      label: 'In Repair' },
  { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
  { value: 'TO_AUDIT',       label: 'To Audit' },
  { value: 'LOST',           label: 'Lost' },
];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = Object.fromEntries(
  ASSET_STATUS_OPTIONS.map(o => [o.value, o.label]),
) as Record<AssetStatus, string>;

export type AssetCategory =
  | 'Laptop'
  | 'Phone'
  | 'Tablet'
  | 'PC'
  | 'Monitor'
  | 'Accessory'
  | 'Other';

/** Minimal user shape returned in nested _detail fields. */
export interface UserMinimal {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Asset {
  id: string;
  asset_tag: string;
  model?: string;
  category: AssetCategory | string;
  status: AssetStatus;
  previous_status?: AssetStatus | null;
  serial_number: string;
  warranty_expiry?: string;
  end_of_life?: string;
  order_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  depreciation_value?: number;
  manufacturer?: string;
  supplier?: string;
  assigned_to?: string | null;
  assigned_to_detail?: UserMinimal | null;
  notes?: string;
  group?: string;
  imei_number?: string;
  cpu?: string;
  gpu?: string;
  operating_system?: string;
  ram?: string;
  screen_size?: string;
  storage_size?: string;
  metadata?: Record<string, unknown>;
  is_archived?: boolean;
  archive_reason?: 'DELETED' | 'RETIRED' | '';
  archived_at?: string | null;
  archived_by?: string | null;
  archived_by_detail?: UserMinimal | null;
  archive_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AddAssetFormData {
  asset_tag: string;
  model: string;
  category: string;
  status: AssetStatus | '';
  serial_number: string;
  warranty_expiry: string;
  end_of_life: string;
  order_number: string;
  purchase_date: string;
  purchase_cost: string;
  depreciation_value: string;
  manufacturer: string;
  supplier: string;
  assigned_to: string;
  notes: string;
  group: string;
  imei_number: string;
  cpu: string;
  gpu: string;
  operating_system: string;
  ram: string;
  screen_size: string;
  storage_size: string;
}

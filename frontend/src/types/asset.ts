export type AssetStatus =
  | 'Available'
  | 'Deployed'
  | 'In Repair'
  | 'In Maintenance'
  | 'Lost'
  | 'To Audit';

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
  image_url?: string;
  asset_tag: string;
  category: AssetCategory | string;
  status: AssetStatus;
  serial_number: string;
  warranty_expiry?: string;
  end_of_life?: string;
  order_number?: string;
  purchase_date?: string;
  purchase_cost?: number;
  depreciation_value?: number;
  manufacturer?: string;
  supplier?: string;
  business_group?: string;
  assigned_to?: string | null;
  assigned_to_detail?: UserMinimal | null;
  notes?: string;
  group?: string;
  imei_number?: string;
  ssd_encryption_status?: 'ENABLED' | 'DISABLED' | 'N/A';
  connectivity?: string;
  cpu?: string;
  gpu?: string;
  operating_system?: string;
  ram?: string;
  screen_size?: string;
  storage_size?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AddAssetFormData {
  asset_tag: string;
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
  business_group: string;
  assigned_to: string;
  notes: string;
  group: string;
  imei_number: string;
  ssd_encryption_status: string;
  connectivity: string;
  cpu: string;
  gpu: string;
  operating_system: string;
  ram: string;
  screen_size: string;
  storage_size: string;
}

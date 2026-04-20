export interface Accessory {
  id: string;
  item_name: string;
  quantity_available: number;
  model_number?: string;
  purchase_date?: string;
  unit_cost?: number;
  total_cost?: number;
  order_number?: string;
  min_quantity: number;
  category?: string;
  manufacturer?: string;
  supplier?: string;
  location?: string;
  notes?: string;
  is_archived?: boolean;
  archive_reason?: 'DELETED' | 'RETIRED' | '';
  archived_at?: string | null;
  archived_by?: string | null;
  archive_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AddInventoryFormData {
  item_name: string;
  category: string;
  quantity_available: string;
  min_quantity: string;
  model_number: string;
  purchase_date: string;
  unit_cost: string;
  order_number: string;
  manufacturer: string;
  supplier: string;
  location: string;
  notes: string;
}

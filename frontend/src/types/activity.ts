export interface TransactionLog {
  id: number;
  date: string;
  user: string;
  type: string;
  event: string;
  item: string;
  toFrom: string;
  notes: string;
}

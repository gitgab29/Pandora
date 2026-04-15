export type PersonRole = 'ADMIN' | 'STAFF';

export interface Person {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  /** Displayed as "Position" in the UI */
  title: string;
  /** Displayed as "Business Group" in the UI */
  department: string;
  /** Self-ref FK to Person.id — displayed as "Supervisor" */
  manager_id: number | null;
  location: string;
  badge_number: string;
  role: PersonRole;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

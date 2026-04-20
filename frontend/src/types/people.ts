export type PersonRole = 'ADMIN' | 'STAFF';

export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  /** Displayed as "Position" in the UI */
  title: string;
  /** Displayed as "Business Group" in the UI */
  business_group: string;
  /** Self-ref FK to Person.id — displayed as "Supervisor" */
  supervisor: string | null;
  supervisor_detail?: { id: string; first_name: string; last_name: string; email: string } | null;
  location: string;
  badge_number: string;
  role: PersonRole;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

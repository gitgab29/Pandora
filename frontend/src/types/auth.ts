export type UserRole = 'ADMIN' | 'STAFF';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  title?: string;
  location?: string;
  business_group?: string;
  badge_number?: string;
  supervisor?: string | null;
  supervisor_detail?: { id: string; first_name: string; last_name: string; email: string } | null;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  business_group: string;
  badgeNumber: string;
  manager: string;
  email: string;
  password: string;
}

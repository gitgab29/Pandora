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
  department: string;
  badgeNumber: string;
  manager: string;
}

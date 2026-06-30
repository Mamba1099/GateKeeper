export interface User {
  id: string;
  email: string;
  full_name: string;
  employee_id: string;
  role: "EMPLOYEE" | "HR" | "ADMIN" | "MANAGER";
  department_id: string;
  department_name?: string;
  profile_picture?: string;
  phone_number?: string;
  is_active: boolean;
  is_email_verified: boolean;
  last_login_at?: Date;
  created_at: Date;
}

export interface LoginInput {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignupInput {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  employee_id: string;
  department_id: string;
  phone_number?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface Session {
  id: string;
  session_token: string;
  user_id: string;
  device_id?: string;
  ip_address?: string;
  expires_at: Date;
  last_activity_at: Date;
  is_revoked: boolean;
}

export interface PasswordResetInput {
  email: string;
}

export interface PasswordResetConfirmInput {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

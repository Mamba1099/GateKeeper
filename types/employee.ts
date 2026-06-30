export interface EmployeeProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department_id: string;
  department_name: string;
  position: string;
  is_active: boolean;
  phone_number?: string;
  created_at: string;
  last_login_at?: string;
}

export interface UpdateProfileData {
  full_name?: string;
  position?: string;
  phone_number?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface CheckInHistory {
  id: string;
  check_in_time: string;
  check_out_time?: string;
  is_late: boolean;
  late_minutes?: number;
  is_early: boolean;
  early_minutes?: number;
  is_early_departure: boolean;
  early_departure_minutes?: number;
  hours_worked?: number;
  date: string;
  status: string;
}

export interface HistoryFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  page: number;
  limit: number;
}
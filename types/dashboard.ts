export interface DashboardStats {
  attendance_percentage: number;
  punctuality_percentage: number;
  current_streak: number;
  late_days: number;
  total_hours: number;
  total_days: number;
  present_days: number;
  early_departures: number;
}

export interface TodayStatus {
  is_checked_in: boolean;
  check_in_time?: string;
  check_out_time?: string;
  is_late?: boolean;
  late_minutes?: number;
  hours_worked?: number;
  is_early_departure?: boolean;
}

export interface AttendanceTrendPoint {
  month: string;
  attendance: number;
  punctuality: number;
}

export interface AttendanceTrendData {
  attendance: AttendanceTrendPoint[];
  department_avg?: number;
}

export interface ArrivalDataPoint {
  day: number;
  arrival: number;
  departure: number;
  date: string;
}

export interface HoursWorkedPoint {
  day: number;
  hours: number;
  date: string;
}

export interface ComparisonPoint {
  month: string;
  you: number;
  department: number;
}

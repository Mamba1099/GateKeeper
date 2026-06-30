export interface CheckInRequest {
  checkInTime: string;
}

export interface CheckOutRequest {
  checkOutTime: string;
}

export interface CheckInStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  isLate?: boolean;
  lateMinutes?: number;
  canCheckOut?: boolean;
  status?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    user_id: string;
    check_in_time: string;
    check_out_time?: string;
    status: string;
    is_late: boolean;
    late_minutes?: number;
    is_early: boolean;
    early_minutes?: number;
    is_early_departure: boolean;
    early_departure_minutes?: number;
    hours_worked?: number;
    date: string;
  };
}

export interface CheckInStats {
  stats: {
    attendance_percentage: number;
    punctuality_percentage: number;
    current_streak: number;
    best_streak: number;
    late_days: number;
    on_time_days: number;
    total_days: number;
    present_days: number;
    total_hours_worked: number;
    average_hours_worked: number;
  };
  monthlyData: Array<{
    month: string;
    attendance: number;
    punctuality: number;
    hoursWorked: number;
  }>;
  recentActivity: Array<{
    id: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
    status: string;
    hoursWorked: number;
  }>;
}

export interface CheckInStatsResponse {
  success: boolean;
  data: CheckInStats;
}

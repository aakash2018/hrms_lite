export interface Employee {
  id: number;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface AttendanceCreate {
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent';
}

export interface DashboardStats {
  total_employees: number;
  today_present: number;
  today_absent: number;
  total_attendance_records: number;
}

export interface AttendanceSummary {
  employee_id: string;
  month: number | null;
  year: number | null;
  present_days: number;
  absent_days: number;
  total_days: number;
}

import axios from 'axios';
import type { Employee, EmployeeCreate, AttendanceRecord, AttendanceCreate, DashboardStats, AttendanceSummary } from '../types';

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hrms-lite-q81l.onrender.com/api';


const api = axios.create({ baseURL: API_BASE_URL });

// ── Dashboard ──────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>('/dashboard');
  return data;
}

// ── Employees ──────────────────────────────────────────

export async function fetchEmployees(): Promise<Employee[]> {
  const { data } = await api.get<Employee[]>('/employees');
  return data;
}

export async function fetchEmployee(employeeId: string): Promise<Employee> {
  const { data } = await api.get<Employee>(`/employees/${employeeId}`);
  return data;
}

export async function createEmployee(payload: EmployeeCreate): Promise<Employee> {
  const { data } = await api.post<Employee>('/employees', payload);
  return data;
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  await api.delete(`/employees/${employeeId}`);
}

// ── Attendance ─────────────────────────────────────────

export async function fetchAttendance(
  employeeId: string,
  month?: number,
  year?: number,
): Promise<AttendanceRecord[]> {
  const params: Record<string, number> = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const { data } = await api.get<AttendanceRecord[]>(`/attendance/${employeeId}`, { params });
  return data;
}

export async function fetchAttendanceSummary(
  employeeId: string,
  month?: number,
  year?: number,
): Promise<AttendanceSummary> {
  const params: Record<string, number> = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const { data } = await api.get<AttendanceSummary>(`/attendance/${employeeId}/summary`, { params });
  return data;
}

export async function markAttendance(payload: AttendanceCreate): Promise<AttendanceRecord> {
  const { data } = await api.post<AttendanceRecord>('/attendance', payload);
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: { msg: string }) => d.msg).join(', ');
    }
    if (error.response?.status === 409) return 'A duplicate record already exists.';
    if (error.response?.status === 404) return 'Resource not found.';
    return error.message;
  }
  return 'An unexpected error occurred.';
}

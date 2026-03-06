import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, CalendarX } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchEmployees,
  fetchAttendance,
  markAttendance,
  getErrorMessage,
} from '../api';
import type { Employee, AttendanceRecord } from '../types';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState(searchParams.get('employee') || '');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Mark attendance form
  const [markDate, setMarkDate] = useState(new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState<'Present' | 'Absent'>('Present');
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchEmployees()
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const loadRecords = useCallback(() => {
    if (!selectedEmployee) return;
    setLoadingRecords(true);
    setError('');
    fetchAttendance(selectedEmployee, selectedMonth, selectedYear)
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load attendance records.'))
      .finally(() => setLoadingRecords(false));
  }, [selectedEmployee, selectedMonth, selectedYear]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  function handleEmployeeChange(empId: string) {
    setSelectedEmployee(empId);
    if (empId) {
      setSearchParams({ employee: empId });
    } else {
      setSearchParams({});
    }
  }

  async function handleMarkAttendance(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEmployee) {
      toast.error('Please select an employee first.');
      return;
    }
    setMarking(true);
    try {
      await markAttendance({
        employee_id: selectedEmployee,
        date: markDate,
        status: markStatus,
      });
      toast.success(`Attendance marked as ${markStatus}.`);
      loadRecords();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMarking(false);
    }
  }

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loadingEmployees) return <LoadingState message="Loading..." />;

  return (
    <>
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Track and manage employee attendance records</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Mark Attendance Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">Mark Attendance</div>
        <div className="card-body">
          {employees.length === 0 ? (
            <p style={{ color: 'var(--color-gray-500)', fontSize: 14 }}>
              No employees available. Please add employees first.
            </p>
          ) : (
            <form onSubmit={handleMarkAttendance}>
              <div className="attendance-controls">
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-select"
                    value={selectedEmployee}
                    onChange={(e) => handleEmployeeChange(e.target.value)}
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.full_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={markStatus}
                    onChange={(e) => setMarkStatus(e.target.value as 'Present' | 'Absent')}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={marking || !selectedEmployee}>
                  {marking ? 'Saving...' : 'Mark Attendance'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Attendance Records Card */}
      {selectedEmployee && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-card-label">Present</div>
              <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>
                {presentCount}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Absent</div>
              <div className="stat-card-value" style={{ color: 'var(--color-danger)' }}>
                {absentCount}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Total Recorded</div>
              <div className="stat-card-value">{records.length}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span>Attendance Records</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingRecords ? (
              <LoadingState message="Loading records..." />
            ) : records.length === 0 ? (
              <EmptyState
                icon={<CalendarX size={24} />}
                title="No attendance records"
                description={`No records found for ${MONTHS[selectedMonth - 1]} ${selectedYear}.`}
              />
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => {
                      const d = new Date(rec.date + 'T00:00:00');
                      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                      const formatted = d.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });
                      return (
                        <tr key={rec.id}>
                          <td style={{ fontWeight: 500 }}>{formatted}</td>
                          <td>{dayName}</td>
                          <td>
                            <span className={`badge ${rec.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedEmployee && employees.length > 0 && (
        <div className="card">
          <EmptyState
            icon={<CalendarCheck size={24} />}
            title="Select an employee"
            description="Choose an employee from the dropdown above to view and manage their attendance."
          />
        </div>
      )}
    </>
  );
}

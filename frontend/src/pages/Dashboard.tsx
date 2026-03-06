import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, Building2, UserPlus, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { fetchEmployees, fetchDashboardStats } from '../api';
import type { Employee, DashboardStats } from '../types';
import LoadingState from '../components/LoadingState';
import ErrorBanner from '../components/ErrorBanner';

export default function Dashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchDashboardStats()])
      .then(([empData, statsData]) => {
        setEmployees(empData);
        setStats(statsData);
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const departments = [...new Set(employees.map((e) => e.department))];

  if (loading) return <LoadingState message="Loading dashboard..." />;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your HR management system</p>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--color-primary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-card-label">Total Employees</div>
          <div className="stat-card-value">{stats?.total_employees ?? employees.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--color-success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-card-label">Present Today</div>
          <div className="stat-card-value" style={{ color: 'var(--color-success)' }}>
            {stats?.today_present ?? 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--color-danger)' }}>
            <XCircle size={24} />
          </div>
          <div className="stat-card-label">Absent Today</div>
          <div className="stat-card-value" style={{ color: 'var(--color-danger)' }}>
            {stats?.today_absent ?? 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ color: 'var(--color-warning)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-card-label">Total Records</div>
          <div className="stat-card-value">{stats?.total_attendance_records ?? 0}</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card" style={{ flex: '0 0 auto' }}>
          <div className="stat-card-label">Departments</div>
          <div className="stat-card-value">{departments.length}</div>
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <div className="stat-card-label">Quick Actions</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/employees" className="btn btn-outline btn-sm">
              <Users size={14} />
              View Employees
            </Link>
            <Link to="/attendance" className="btn btn-outline btn-sm">
              <CalendarCheck size={14} />
              Mark Attendance
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Recent Employees</div>
        {employees.length === 0 ? (
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">
                <UserPlus size={24} />
              </div>
              <h3>No employees yet</h3>
              <p>Get started by adding your first employee.</p>
              <Link to="/employees" className="btn btn-primary btn-sm">
                <UserPlus size={14} />
                Add Employee
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 5).map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 500 }}>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className="badge badge-dept">{emp.department}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {employees.length > 5 && (
          <div style={{ padding: '12px 24px', borderTop: '1px solid var(--color-gray-100)' }}>
            <Link to="/employees" className="text-link" style={{ fontSize: 13 }}>
              View all {employees.length} employees →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

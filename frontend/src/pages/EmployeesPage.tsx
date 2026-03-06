import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Trash2, Users, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchEmployees, createEmployee, deleteEmployee, getErrorMessage } from '../api';
import type { Employee, EmployeeCreate } from '../types';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'Finance', 'HR', 'Operations'];

const initialForm: EmployeeCreate = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add modal
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<EmployeeCreate>(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EmployeeCreate, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    fetchEmployees()
      .then(setEmployees)
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function validate(): boolean {
    const errors: Partial<Record<keyof EmployeeCreate, string>> = {};
    if (!form.employee_id.trim()) errors.employee_id = 'Employee ID is required.';
    if (!form.full_name.trim()) errors.full_name = 'Full name is required.';
    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Invalid email format.';
    }
    if (!form.department) errors.department = 'Department is required.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createEmployee(form);
      toast.success('Employee added successfully.');
      setShowAdd(false);
      setForm(initialForm);
      setFormErrors({});
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.employee_id);
      toast.success(`${deleteTarget.full_name} has been removed.`);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function updateField(field: keyof EmployeeCreate, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <>
      <div className="page-header page-header-actions">
        <div>
          <h2>Employees</h2>
          <p>Manage your employee directory</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={16} />
          Add Employee
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="card">
        {loading ? (
          <LoadingState message="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title="No employees found"
            description="Get started by adding your first employee to the system."
            action={
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                <UserPlus size={14} />
                Add Employee
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 500 }}>{emp.employee_id}</td>
                    <td>{emp.full_name}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className="badge badge-dept">{emp.department}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link
                          to={`/attendance?employee=${emp.employee_id}`}
                          className="btn-icon"
                          title="View attendance"
                        >
                          <CalendarCheck size={16} />
                        </Link>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete employee"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <Modal open={showAdd} title="Add New Employee" onClose={() => { setShowAdd(false); setFormErrors({}); }}>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input
                className={`form-input ${formErrors.employee_id ? 'error' : ''}`}
                placeholder="e.g. EMP001"
                value={form.employee_id}
                onChange={(e) => updateField('employee_id', e.target.value)}
              />
              {formErrors.employee_id && <div className="form-error">{formErrors.employee_id}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className={`form-input ${formErrors.full_name ? 'error' : ''}`}
                placeholder="e.g. John Doe"
                value={form.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
              />
              {formErrors.full_name && <div className="form-error">{formErrors.full_name}</div>}
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                type="email"
                placeholder="e.g. john@company.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className={`form-select ${formErrors.department ? 'error' : ''}`}
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {formErrors.department && <div className="form-error">{formErrors.department}</div>}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => { setShowAdd(false); setFormErrors({}); }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This action cannot be undone and will also remove all their attendance records.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

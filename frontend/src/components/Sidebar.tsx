import { NavLink } from 'react-router-dom';
import { Users, CalendarCheck, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>HRMS Lite</h1>
        <p>Human Resource Management</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Users size={18} />
          Employees
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarCheck size={18} />
          Attendance
        </NavLink>
      </nav>
    </aside>
  );
}

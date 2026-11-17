import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiCompass,
  FiCalendar,
  FiPackage,
  FiFolder,
  FiUsers,
  FiAward,
  FiBookOpen,
  FiSparkles,
  FiCheckSquare,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiBarChart2,
  FiLayers,
  FiSliders,
  FiShield,
  FiTool,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/labs', label: 'Browse Labs', icon: FiCompass },
    { to: '/bookings', label: 'My Bookings', icon: FiCalendar },
    { to: '/my-passes', label: 'Digital Passes', icon: FiCheckSquare },
    { to: '/equipment', label: 'Equipment Inventory', icon: FiPackage },
    { to: '/waiting-list', label: 'Waiting List', icon: FiClock },
    { to: '/projects', label: 'Projects Workspace', icon: FiFolder },
    { to: '/teams', label: 'Team Finder', icon: FiUsers },
    { to: '/mentorship', label: 'Faculty Mentorship', icon: FiAward },
    { to: '/learning', label: 'Learning Hub', icon: FiBookOpen },
    { to: '/showcase', label: 'Innovation Showcase', icon: FiSparkles },
    { to: '/ai-assistant', label: 'AI Resource Assistant', icon: FiSparkles },
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Overview', icon: FiGrid },
    { to: '/faculty/bookings', label: 'Booking Approvals', icon: FiCheckSquare },
    { to: '/faculty/experiments', label: 'Experiment Manager', icon: FiBookOpen },
    { to: '/faculty/materials', label: 'Learning Materials', icon: FiFileText },
    { to: '/faculty/mentorship', label: 'Mentorship Guidance', icon: FiAward },
    { to: '/faculty/announcements', label: 'Announcements', icon: FiSliders },
  ];

  const technicianLinks = [
    { to: '/technician/dashboard', label: 'Daily Operations', icon: FiGrid },
    { to: '/technician/equipment', label: 'Issue & Returns', icon: FiPackage },
    { to: '/technician/issues', label: 'Repairs & Issues', icon: FiAlertTriangle },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: FiGrid },
    { to: '/admin/users', label: 'User Directory', icon: FiUsers },
    { to: '/admin/departments', label: 'Departments', icon: FiLayers },
    { to: '/admin/labs', label: 'Laboratories', icon: FiCompass },
    { to: '/admin/equipment', label: 'Equipment Catalog', icon: FiPackage },
    { to: '/admin/bookings', label: 'All Reservations', icon: FiCalendar },
    { to: '/admin/policies', label: 'Booking Policies', icon: FiSliders },
    { to: '/admin/analytics', label: 'Utilization Analytics', icon: FiBarChart2 },
    { to: '/admin/audit-logs', label: 'Audit Security Logs', icon: FiShield },
  ];

  const navGroups = {
    student: studentLinks,
    faculty: facultyLinks,
    technician: technicianLinks,
    admin: adminLinks,
  };

  const activeLinks = navGroups[role] || studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-100 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6">
          <div className="px-3 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
              {role} Navigation
            </span>
          </div>

          <nav className="flex-1 space-y-1">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100 px-3">
            <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-3.5 border border-indigo-100">
              <p className="text-xs font-bold text-indigo-900">SMARTLAB v1.0</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Real-time resource cloud</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;


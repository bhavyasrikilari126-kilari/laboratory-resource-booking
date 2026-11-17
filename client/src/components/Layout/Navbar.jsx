import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiX, FiLogOut, FiUser, FiSliders, FiCpu } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Badge from '../common/Badge';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden transition"
          aria-label="Toggle navigation"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
            <FiCpu className="h-5 w-5" />
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-lg font-black tracking-tight text-gray-900 block leading-tight">
              SMART<span className="text-indigo-600">LAB</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block -mt-0.5">
              Campus Resource Cloud
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <Link
          to="/notifications"
          className="relative rounded-xl p-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <FiBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 rounded-xl p-1.5 text-left hover:bg-gray-50 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || 'User'}</p>
              <Badge variant={user?.role} className="mt-0.5 text-[9px] py-0 px-1.5">
                {user?.role}
              </Badge>
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 border border-gray-100 animate-in fade-in duration-150"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <FiUser className="h-4 w-4 text-gray-400" /> Profile & Skills
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 rounded-lg hover:bg-rose-50 transition mt-1"
              >
                <FiLogOut className="h-4 w-4 text-rose-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


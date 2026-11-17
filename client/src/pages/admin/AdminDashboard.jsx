import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiCompass,
  FiPackage,
  FiCalendar,
  FiAlertTriangle,
  FiBarChart2,
  FiShield,
  FiArrowRight,
  FiLayers,
} from 'react-icons/fi';
import analyticsService from '../../services/analytics.service';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getOverview();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) return <LoadingSpinner text="Loading campus administration overview..." />;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-3">
            <FiShield /> College Administration Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Campus Laboratory Overview
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage user accounts, assign department coordinators, configure reservation policies, and analyze cross-department resource utilization.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={FiUsers}
          color="indigo"
          change="Students & Faculty"
        />
        <StatCard
          title="Active Laboratories"
          value={stats?.totalLabs || 0}
          icon={FiCompass}
          color="emerald"
          change="Across departments"
        />
        <StatCard
          title="Total Reservations"
          value={stats?.totalBookings || 0}
          icon={FiCalendar}
          color="blue"
          change={`${stats?.pendingBookings || 0} pending review`}
        />
        <StatCard
          title="Hardware Inventory"
          value={`${stats?.totalEquipment || 0} Items`}
          icon={FiPackage}
          color="amber"
          change="Central hardware stock"
        />
      </div>

      {/* Admin Modules Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Campus Administrative Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/users"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-lg transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">User Account Directory</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Manage student, faculty, technician, and administrator roles, status, and permissions.
            </p>
          </Link>

          <Link
            to="/admin/labs"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-lg transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FiCompass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Laboratory Infrastructure</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add laboratories, update capacity, define operating hours, and schedule maintenance downtime.
            </p>
          </Link>

          <Link
            to="/admin/equipment"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-lg transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FiPackage className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Central Equipment Catalog</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Register microcontrollers, testing equipment, generate QR labels, and audit stock levels.
            </p>
          </Link>

          <Link
            to="/admin/policies"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-lg transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Reservation Policies</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Enforce maximum booking durations, advance notice limits, cancellation rules, and approval requirements.
            </p>
          </Link>

          <Link
            to="/admin/analytics"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-lg transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FiBarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Lab Utilization Analytics</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Explore charts for most-requested equipment, peak laboratory hours, and department distribution.
            </p>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-lg transition space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Security Audit Logs</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Immutable logging of user authentication, admin edits, pass validations, and IP records.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


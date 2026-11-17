import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const styles = {
    // Status colors
    available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    checked_in: 'bg-blue-50 text-blue-700 border-blue-200',
    issued: 'bg-blue-50 text-blue-700 border-blue-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    waiting: 'bg-amber-50 text-amber-700 border-amber-200',
    assigned: 'bg-amber-50 text-amber-700 border-amber-200',
    offered: 'bg-purple-50 text-purple-700 border-purple-200',
    in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200',
    damaged: 'bg-rose-50 text-rose-700 border-rose-200',
    under_maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
    // Roles
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    faculty: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    technician: 'bg-amber-50 text-amber-700 border-amber-200',
    student: 'bg-sky-50 text-sky-700 border-sky-200',
    // Defaults
    default: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const currentStyle = styles[variant?.toLowerCase()] || styles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${currentStyle} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;


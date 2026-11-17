import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, trend = 'up', color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-black text-gray-900 tracking-tight">{value}</p>
          {change && (
            <p className="mt-1 flex items-center text-xs font-medium text-emerald-600">
              <span>{change}</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl ${colorMap[color] || colorMap.indigo}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;


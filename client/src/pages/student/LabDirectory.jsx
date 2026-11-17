import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCompass,
  FiSearch,
  FiUsers,
  FiClock,
  FiLayers,
  FiCheckCircle,
  FiArrowRight,
  FiTool,
} from 'react-icons/fi';
import labService from '../../services/lab.service';
import departmentService from '../../services/department.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const LabDirectory = () => {
  const [labs, setLabs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchInit = async () => {
      try {
        setLoading(true);
        const [labsRes, deptsRes] = await Promise.all([
          labService.getLabs(),
          departmentService.getDepartments(),
        ]);

        if (labsRes.success) setLabs(labsRes.data || []);
        if (deptsRes.success) setDepartments(deptsRes.data || []);
      } catch (err) {
        console.error('Error fetching labs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInit();
  }, []);

  const handleFilter = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department = selectedDept;
      if (selectedStatus) params.status = selectedStatus;

      const res = await labService.getLabs(params);
      if (res.success) setLabs(res.data || []);
    } catch (err) {
      console.error('Error filtering labs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiCompass className="text-indigo-600" /> Smart Laboratory Discovery
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Explore college laboratories across departments, check capacity, facilities & reserve slots.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Search by laboratory name, number, or equipment..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="under_maintenance">Under Maintenance</option>
          </select>

          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Laboratory Grid */}
      {loading ? (
        <LoadingSpinner text="Searching laboratories..." />
      ) : labs.length === 0 ? (
        <EmptyState
          title="No laboratories found"
          description="Try adjusting your department or search query to find matching labs."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <div
              key={lab._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-indigo-100 transition duration-300 flex flex-col overflow-hidden group"
            >
              {/* Card Header Banner */}
              <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 p-5 text-white relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                    {lab.labNumber}
                  </span>
                  <Badge variant={lab.status}>{lab.status}</Badge>
                </div>
                <h3 className="text-base font-black tracking-tight text-white line-clamp-1 group-hover:text-indigo-200 transition">
                  {lab.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{lab.department?.name}</p>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {lab.description || 'Dedicated college practical lab environment.'}
                </p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <FiUsers className="text-indigo-600 w-3.5 h-3.5" />
                    <span>Capacity: <strong>{lab.capacity} seats</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiClock className="text-indigo-600 w-3.5 h-3.5" />
                    <span>
                      {lab.operatingHours?.open || '09:00'} - {lab.operatingHours?.close || '17:00'}
                    </span>
                  </div>
                </div>

                {/* Facilities Pills */}
                {lab.facilities && lab.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lab.facilities.slice(0, 3).map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {f}
                      </span>
                    ))}
                    {lab.facilities.length > 3 && (
                      <span className="text-[10px] font-medium text-gray-400 px-1 py-0.5">
                        +{lab.facilities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/labs/${lab._id}`}
                    className="flex-1 text-center py-2 px-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold transition"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/bookings/new/${lab._id}`}
                    className="flex-1 text-center py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    Reserve Slot
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabDirectory;


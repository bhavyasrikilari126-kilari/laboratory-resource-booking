import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCheckSquare,
  FiCalendar,
  FiAward,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiArrowRight,
  FiUsers,
  FiBookOpen,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/booking.service';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookings({ status: 'pending' });
      if (res.success) setPendingBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching faculty dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await bookingService.approveBooking(id);
      if (res.success) {
        toast.success('Reservation approved! Digital QR Pass generated for student.');
        fetchDashboard();
      }
    } catch (err) {
      toast.error('Failed to approve reservation');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejecting this reservation:');
    if (!reason) return;
    try {
      const res = await bookingService.rejectBooking(id, { reason });
      if (res.success) {
        toast.success('Reservation rejected.');
        fetchDashboard();
      }
    } catch (err) {
      toast.error('Failed to reject reservation');
    }
  };

  if (loading) return <LoadingSpinner text="Loading Faculty Control Panel..." />;

  return (
    <div className="space-y-6">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-3">
            Faculty In-Charge Portal • {user?.department?.name || 'Department Faculty'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Review incoming student lab requests, authorize digital passes, manage curriculum experiments, and mentor student innovation projects.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Approvals"
          value={pendingBookings.length}
          icon={FiCheckSquare}
          color="amber"
          change="Requires action"
        />
        <StatCard
          title="Today's Sessions"
          value="4 Scheduled"
          icon={FiCalendar}
          color="indigo"
          change="In assigned labs"
        />
        <StatCard
          title="Active Mentees"
          value="6 Students"
          icon={FiAward}
          color="emerald"
          change="Guidance projects"
        />
        <StatCard
          title="Curriculum Labs"
          value="Active"
          icon={FiBookOpen}
          color="blue"
          change="Practical manuals"
        />
      </div>

      {/* Pending Approvals Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiCheckSquare className="text-amber-500" /> Pending Reservation Approvals ({pendingBookings.length})
          </h2>
          <Link
            to="/faculty/bookings"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Review all bookings <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            ✓ No pending requests! All student laboratory reservations are up to date.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Student</th>
                  <th className="p-3">Laboratory</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {pendingBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{b.student?.name}</p>
                      <p className="text-[10px] text-gray-400">{b.student?.studentId || b.student?.email}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{b.laboratory?.name}</p>
                      <p className="text-[10px] text-gray-400">Room {b.laboratory?.labNumber}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-gray-900 font-bold">{new Date(b.date).toLocaleDateString()}</p>
                      <p className="text-gray-500">{b.startTime} - {b.endTime}</p>
                    </td>
                    <td className="p-3 max-w-xs truncate text-gray-600" title={b.purpose}>
                      {b.purpose}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(b._id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <FiCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(b._id)}
                          className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          <FiX /> Reject
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
    </div>
  );
};

export default FacultyDashboard;


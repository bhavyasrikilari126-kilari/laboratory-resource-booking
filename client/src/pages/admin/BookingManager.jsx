import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiSearch, FiFilter, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import bookingService from '../../services/booking.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await bookingService.getBookings(params);
      if (res.success) setBookings(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  if (loading) return <LoadingSpinner text="Loading campus reservations..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiCalendar className="text-indigo-600" /> College Reservation Registry
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete administrative log of all laboratory bookings, checked-in sessions, and student passes.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="checked_in">Checked In</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Booking Ref</th>
                <th className="p-3">Laboratory</th>
                <th className="p-3">Student</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Purpose</th>
                <th className="p-3 text-right rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {bookings.map((b) => (
                <tr key={b._id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3 font-mono font-bold text-gray-900">{b.bookingRef}</td>
                  <td className="p-3">
                    <p className="font-bold text-gray-900">{b.laboratory?.name}</p>
                    <p className="text-[10px] text-gray-400">Room {b.laboratory?.labNumber}</p>
                  </td>
                  <td className="p-3 font-bold text-gray-900">{b.student?.name}</td>
                  <td className="p-3 text-gray-600">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="p-3 text-gray-600 font-bold">{b.startTime} - {b.endTime}</td>
                  <td className="p-3 max-w-xs truncate text-gray-500" title={b.purpose}>{b.purpose}</td>
                  <td className="p-3 text-right">
                    <Badge variant={b.status}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingManager;


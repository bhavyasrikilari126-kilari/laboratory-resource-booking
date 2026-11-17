import React, { useState, useEffect } from 'react';
import {
  FiCheckSquare,
  FiCheck,
  FiX,
  FiFilter,
  FiCalendar,
  FiClock,
  FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import bookingService from '../../services/booking.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const BookingApprovals = () => {
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
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      const res = await bookingService.approveBooking(id);
      if (res.success) {
        toast.success('Reservation approved and digital pass dispatched.');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason for the student:');
    if (!reason) return;
    try {
      const res = await bookingService.rejectBooking(id, { reason });
      if (res.success) {
        toast.success('Reservation rejected.');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to reject');
    }
  };

  if (loading) return <LoadingSpinner text="Loading reservation requests..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiCheckSquare className="text-indigo-600" /> Laboratory Booking Approvals
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review, authorize, or decline incoming student laboratory and hardware requests.
          </p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-xs"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="checked_in">Checked In</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No Reservations Found"
          description="There are currently no student reservations matching the selected filter."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Ref: {b.bookingRef}
                  </span>
                  <Badge variant={b.status}>{b.status}</Badge>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-gray-900">{b.laboratory?.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">
                    Student: {b.student?.name} ({b.student?.studentId || b.student?.email})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <FiCalendar className="text-indigo-600" /> {new Date(b.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiClock className="text-indigo-600" /> {b.startTime} - {b.endTime}
                  </span>
                </div>

                <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-xl max-w-xl">
                  Purpose: "{b.purpose}"
                </p>
              </div>

              {/* Action Buttons */}
              {b.status === 'pending' && (
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <button
                    onClick={() => handleApprove(b._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <FiCheck /> Approve Request
                  </button>
                  <button
                    onClick={() => handleReject(b._id)}
                    className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <FiX /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingApprovals;


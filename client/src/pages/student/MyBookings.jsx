import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiQrCode,
  FiAlertTriangle,
  FiFileText,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import bookingService from '../../services/booking.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { QRCodeSVG } from 'qrcode.react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPass, setSelectedPass] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      if (res.success) setBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;
    try {
      const res = await bookingService.cancelBooking(id);
      if (res.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return ['pending', 'approved'].includes(b.status);
    return b.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiCalendar className="text-indigo-600" /> My Laboratory Reservations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your laboratory session requests, approvals, and digital entry passes.
          </p>
        </div>

        <Link
          to="/labs"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          Book New Session
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'approved', label: 'Approved' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Fetching your reservations..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No reservations found"
          description={`You do not have any ${activeTab !== 'all' ? activeTab : ''} bookings at this time.`}
          actionText="Browse Laboratories"
          onAction={() => (window.location.href = '/labs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Ref: {b.bookingRef}
                    </span>
                    <h3 className="text-base font-black text-gray-900 mt-0.5">
                      {b.laboratory?.name}
                    </h3>
                  </div>
                  <Badge variant={b.status}>{b.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="text-indigo-600 w-3.5 h-3.5" />
                    <span>{new Date(b.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiClock className="text-indigo-600 w-3.5 h-3.5" />
                    <span>{b.startTime} - {b.endTime}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                  <p className="font-semibold text-gray-800">Purpose:</p>
                  <p className="mt-0.5 text-gray-500">{b.purpose}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                {b.status === 'approved' && (
                  <button
                    onClick={() => setSelectedPass(b)}
                    className="flex-1 py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <FiQrCode className="w-4 h-4" /> View Digital Pass
                  </button>
                )}

                {['pending', 'approved'].includes(b.status) && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="py-2 px-4 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                  >
                    Cancel Slot
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Pass Modal */}
      {selectedPass && (
        <Modal
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
          title="Digital Laboratory Pass"
        >
          <div className="text-center space-y-4 py-2">
            <div className="p-4 bg-slate-900 rounded-2xl inline-block shadow-lg mx-auto">
              <QRCodeSVG
                value={JSON.stringify({
                  bookingRef: selectedPass.bookingRef,
                  lab: selectedPass.laboratory?.labNumber,
                  date: selectedPass.date,
                  student: selectedPass.student,
                })}
                size={180}
                bgColor="#0f172a"
                fgColor="#ffffff"
                level="M"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pass Code: {selectedPass.bookingRef}
              </p>
              <h4 className="text-lg font-black text-gray-900">
                {selectedPass.laboratory?.name}
              </h4>
              <p className="text-xs text-gray-600">
                Room: <strong>{selectedPass.laboratory?.labNumber}</strong> • Date: {new Date(selectedPass.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-indigo-600 font-bold">
                Time Window: {selectedPass.startTime} - {selectedPass.endTime}
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 text-left border border-emerald-100">
              <p className="font-bold flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-600" /> Authorized Entry Pass
              </p>
              <p className="mt-0.5 text-emerald-700 text-[11px]">
                Show this QR pass at the laboratory entrance. The technician will scan it to verify and log your attendance.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;


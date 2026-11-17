import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiXCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import waitingListService from '../../services/waitingList.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const WaitingListPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await waitingListService.getMyWaitingList();
      if (res.success) setEntries(res.data || []);
    } catch (err) {
      console.error('Error fetching waiting list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAcceptOffer = async (id) => {
    try {
      const res = await waitingListService.accept(id);
      if (res.success) {
        toast.success('Offer accepted! Your reservation is confirmed and Digital Pass generated.');
        fetchEntries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept offer');
    }
  };

  const handleLeaveQueue = async (id) => {
    if (!window.confirm('Are you sure you want to exit the waiting list?')) return;
    try {
      const res = await waitingListService.leave(id);
      if (res.success) {
        toast.success('Exited waiting list.');
        fetchEntries();
      }
    } catch (err) {
      toast.error('Failed to leave waiting list');
    }
  };

  if (loading) return <LoadingSpinner text="Checking waiting list queue..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiClock className="text-indigo-600" /> Smart Waiting List Queue
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          When slots or hardware become unavailable, join the queue. If a cancellation occurs, the system automatically offers the released slot to the next student in line.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No Active Queue Entries"
          description="You are not currently in any waiting list queues. When a desired lab time slot is occupied, click 'Join Queue' on the lab page."
          actionText="Explore Labs"
          onAction={() => (window.location.href = '/labs')}
        />
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const isOffered = entry.status === 'offered';

            return (
              <div
                key={entry._id}
                className={`bg-white rounded-3xl p-6 border shadow-xs transition space-y-4 ${
                  isOffered ? 'border-purple-300 ring-2 ring-purple-500/20 bg-purple-50/20' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Position #{entry.position} in Line
                      </span>
                      <Badge variant={entry.status}>{entry.status}</Badge>
                    </div>
                    <h3 className="text-base font-black text-gray-900 mt-1">
                      {entry.laboratory?.name || entry.equipment?.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Preferred Date: {new Date(entry.preferredDate).toLocaleDateString()} • {entry.preferredStartTime} - {entry.preferredEndTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isOffered && (
                      <button
                        onClick={() => handleAcceptOffer(entry._id)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 animate-bounce"
                      >
                        <FiCheckCircle /> Accept Released Slot
                      </button>
                    )}

                    {['waiting', 'offered'].includes(entry.status) && (
                      <button
                        onClick={() => handleLeaveQueue(entry._id)}
                        className="px-3 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
                      >
                        Leave Queue
                      </button>
                    )}
                  </div>
                </div>

                {isOffered && (
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                    <FiAlertTriangle className="text-purple-600 shrink-0" />
                    <span>
                      <strong>Slot released!</strong> A reservation was cancelled and offered to you. Click Accept to claim your slot before the offer expires.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WaitingListPage;


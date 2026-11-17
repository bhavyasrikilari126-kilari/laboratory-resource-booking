import React, { useState, useEffect } from 'react';
import { FiAward, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import mentorshipService from '../../services/mentorship.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FacultyMentorship = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal
  const [feedbackAppt, setFeedbackAppt] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await mentorshipService.getMyAppointments();
      if (res.success) setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await mentorshipService.updateAppointmentStatus(id, { status });
      if (res.success) {
        toast.success(`Appointment marked as ${status}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackAppt) return;
    try {
      setSubmitting(true);
      const res = await mentorshipService.updateAppointmentStatus(feedbackAppt._id, {
        feedback: feedbackText,
        status: 'completed',
      });
      if (res.success) {
        toast.success('Mentorship feedback recorded for student!');
        setFeedbackAppt(null);
        setFeedbackText('');
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading mentorship schedule..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiAward className="text-indigo-600" /> Student Mentorship & Advising Sessions
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review incoming student project guidance appointments, confirm schedules, and record technical feedback.
        </p>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center bg-white rounded-3xl border border-gray-100">
            No active mentorship appointments scheduled.
          </p>
        ) : (
          appointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {app.type}
                  </span>
                  <Badge variant={app.status}>{app.status}</Badge>
                </div>

                <h3 className="text-base font-black text-gray-900">
                  Student: {app.student?.name} ({app.student?.studentId || app.student?.email})
                </h3>

                <p className="text-xs text-gray-400">
                  Date: {new Date(app.date).toLocaleDateString()} • Time: {app.startTime}
                </p>

                <p className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-xl max-w-xl">
                  Discussion Purpose: "{app.purpose}"
                </p>

                {app.feedback && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl font-medium max-w-xl">
                    Recorded Feedback: "{app.feedback}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {app.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'confirmed')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <FiCheck /> Confirm
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app._id, 'cancelled')}
                      className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                    >
                      <FiX /> Decline
                    </button>
                  </>
                )}

                {app.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      setFeedbackAppt(app);
                      setFeedbackText(app.feedback || '');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <FiMessageSquare /> Record Feedback
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {feedbackAppt && (
        <Modal
          isOpen={!!feedbackAppt}
          onClose={() => setFeedbackAppt(null)}
          title={`Record Guidance Feedback for ${feedbackAppt.student?.name}`}
        >
          <form onSubmit={handleSaveFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Technical Feedback & Suggestions
              </label>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Recommended switching frequency 20kHz to eliminate audible motor coil whine..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Feedback & Mark Completed'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FacultyMentorship;


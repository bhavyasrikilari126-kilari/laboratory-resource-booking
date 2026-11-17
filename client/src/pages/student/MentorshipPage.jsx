import React, { useState, useEffect } from 'react';
import {
  FiAward,
  FiCalendar,
  FiClock,
  FiUserCheck,
  FiCheckCircle,
  FiArrowRight,
  FiBookOpen,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import mentorshipService from '../../services/mentorship.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const MentorshipPage = () => {
  const [mentors, setMentors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Appointment Modal
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [appointDate, setAppointDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [appointTime, setAppointTime] = useState('11:00');
  const [appointPurpose, setAppointPurpose] = useState('');
  const [appointType, setAppointType] = useState('mentorship');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mentorsRes, apptsRes] = await Promise.all([
        mentorshipService.getFacultyMentors(),
        mentorshipService.getMyAppointments(),
      ]);

      if (mentorsRes.success) setMentors(mentorsRes.data || []);
      if (apptsRes.success) setMyAppointments(apptsRes.data || []);
    } catch (err) {
      console.error('Error fetching mentorship data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedFaculty) return;

    try {
      setSubmitting(true);
      const res = await mentorshipService.createAppointment({
        facultyId: selectedFaculty.user?._id || selectedFaculty._id,
        date: appointDate,
        startTime: appointTime,
        purpose: appointPurpose,
        type: appointType,
      });

      if (res.success) {
        toast.success('Mentorship appointment scheduled successfully!');
        setSelectedFaculty(null);
        setAppointPurpose('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading faculty mentors..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiAward className="text-indigo-600" /> Faculty Project Mentorship & Guidance
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Connect with professors and specialized faculty members for capstone project reviews and technical advisement.
        </p>
      </div>

      {/* Grid: Available Mentors */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Available Faculty Advisors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((m) => (
            <div
              key={m._id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center">
                      {m.user?.name?.charAt(0) || 'F'}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900">{m.user?.name}</h3>
                      <p className="text-xs text-gray-400">{m.user?.department?.name || 'Department Faculty'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                    Available for Guidance
                  </span>
                </div>

                <p className="text-xs text-gray-600 italic">"{m.bio || 'Available for technical project mentorship.'}"</p>

                <div className="pt-2 border-t border-gray-50 space-y-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Specializations & Research:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.specializations?.map((s, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedFaculty(m)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                >
                  <FiCalendar className="w-3.5 h-3.5" /> Book Guidance Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appointment History */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <FiClock className="text-indigo-600" /> My Scheduled Mentorship Appointments
        </h2>

        {myAppointments.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center">No appointments booked yet.</p>
        ) : (
          <div className="space-y-3">
            {myAppointments.map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 text-sm">{app.faculty?.name}</p>
                    <Badge variant={app.status}>{app.status}</Badge>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Date: {new Date(app.date).toLocaleDateString()} • Time: {app.startTime} • Scope: {app.purpose}
                  </p>
                  {app.feedback && (
                    <p className="mt-2 text-indigo-700 bg-indigo-50/70 p-2 rounded-lg font-medium">
                      Mentor Feedback: "{app.feedback}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {selectedFaculty && (
        <Modal
          isOpen={!!selectedFaculty}
          onClose={() => setSelectedFaculty(null)}
          title={`Book Guidance Session with ${selectedFaculty.user?.name}`}
        >
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={appointDate}
                  onChange={(e) => setAppointDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Time Slot</label>
                <select
                  value={appointTime}
                  onChange={(e) => setAppointTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
                >
                  {['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Meeting Purpose</label>
              <textarea
                rows={3}
                value={appointPurpose}
                onChange={(e) => setAppointPurpose(e.target.value)}
                placeholder="Reviewing DC motor speed control PWM logic and sensor telemetry noise..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Appointment'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MentorshipPage;


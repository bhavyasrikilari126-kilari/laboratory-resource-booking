import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCompass,
  FiCalendar,
  FiPackage,
  FiFolder,
  FiUsers,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/booking.service';
import announcementService from '../../services/announcement.service';
import aiService from '../../services/ai.service';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, annRes] = await Promise.all([
          bookingService.getMyUpcoming(),
          announcementService.getAnnouncements(),
        ]);

        if (bookingsRes.success) setUpcomingBookings(bookingsRes.data || []);
        if (annRes.success) setAnnouncements(annRes.data || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAiSearch = (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    navigate(`/ai-assistant?query=${encodeURIComponent(aiQuery)}`);
  };

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/10">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold backdrop-blur-xs mb-3">
            Academic Year {user?.academicYear || '3'} • {user?.department?.name || 'Engineering'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed">
            Reserve laboratories, track equipment checkouts, collaborate on engineering projects, and access verified practical experiments.
          </p>

          {/* AI Search Bar inside Banner */}
          <form onSubmit={handleAiSearch} className="mt-6 flex items-center gap-2 max-w-lg">
            <div className="relative flex-1">
              <FiZap className="absolute left-3.5 top-3 text-indigo-400 w-4 h-4" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask SMARTLAB AI: 'IoT project with ESP32 & motor driver'..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-950/80 hover:bg-indigo-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
            >
              Recommend
            </button>
          </form>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Bookings"
          value={upcomingBookings.length}
          icon={FiCalendar}
          color="indigo"
          change="Reserved slots"
        />
        <StatCard
          title="Digital Passes"
          value={upcomingBookings.filter((b) => b.status === 'approved').length}
          icon={FiCheckCircle}
          color="emerald"
          change="Ready to scan"
        />
        <StatCard
          title="Equipment Checkouts"
          value="0 Active"
          icon={FiPackage}
          color="amber"
          change="Tracked by technician"
        />
        <StatCard
          title="Project Workspace"
          value="Active"
          icon={FiFolder}
          color="blue"
          change="Milestones & teams"
        />
      </div>

      {/* Main Grid: Upcoming Bookings & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FiCalendar className="text-indigo-600" /> Upcoming Laboratory Sessions
            </h2>
            <Link
              to="/bookings"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <FiArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
              <FiCalendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">No Upcoming Reservations</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">You do not have any pending or approved lab sessions.</p>
              <Link
                to="/labs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Browse Labs & Book Slot
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{b.laboratory?.name}</span>
                      <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {b.laboratory?.labNumber}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Date: {new Date(b.date).toLocaleDateString()} • {b.startTime} - {b.endTime}
                    </p>
                    <p className="text-xs text-gray-600 italic">Purpose: "{b.purpose}"</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge variant={b.status}>{b.status}</Badge>
                    {b.status === 'approved' && (
                      <Link
                        to="/my-passes"
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <FiCheckCircle className="w-3.5 h-3.5" /> View Pass
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Navigation Grid */}
          <div className="pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Quick Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/labs"
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-md transition text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <FiCompass className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900 block">Find Labs</span>
              </Link>

              <Link
                to="/equipment"
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-md transition text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <FiPackage className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900 block">Equipment</span>
              </Link>

              <Link
                to="/projects"
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-md transition text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <FiFolder className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900 block">Projects</span>
              </Link>

              <Link
                to="/teams"
                className="p-4 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-indigo-200 hover:shadow-md transition text-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <FiUsers className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-900 block">Find Teams</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Campus Announcements */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiAlertCircle className="text-amber-500" /> Department Announcements
          </h2>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-xs text-gray-400">
                No active announcements
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-2 hover:border-gray-200 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      {ann.priority || 'General'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 leading-snug">{ann.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

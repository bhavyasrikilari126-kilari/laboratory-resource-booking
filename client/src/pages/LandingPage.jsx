import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiCpu,
  FiCompass,
  FiCalendar,
  FiPackage,
  FiUsers,
  FiAward,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiBarChart2,
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'faculty':
        return '/faculty/dashboard';
      case 'technician':
        return '/technician/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <FiCpu className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              SMART<span className="text-indigo-400">LAB</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition"
              >
                Go to Dashboard <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition"
                >
                  Get Started <FiArrowRight />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),rgba(255,255,255,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            Next-Gen Academic Laboratory Cloud Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Empowering College Labs with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Real-Time Booking & AI Innovation
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate double bookings, automate hardware checkouts with QR passes, match teammates
            by technical skills, and manage projects with faculty mentorship.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/40 transition"
            >
              Start Free as Student / Faculty <FiArrowRight />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-base transition"
            >
              Sign In to Existing Account
            </Link>
          </div>

          {/* Quick Demo Credentials Pill */}
          <div className="mt-12 inline-block bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-400 text-left max-w-md mx-auto">
            <p className="font-bold text-slate-200 mb-1">🔑 Demo Accounts Available:</p>
            <p>Admin: <code className="text-indigo-400">admin@smartlab.com</code> / <code className="text-indigo-400">admin123</code></p>
            <p>Faculty: <code className="text-indigo-400">faculty@smartlab.com</code> / <code className="text-indigo-400">faculty123</code></p>
            <p>Technician: <code className="text-indigo-400">tech@smartlab.com</code> / <code className="text-indigo-400">tech123</code></p>
            <p>Student: <code className="text-indigo-400">student@smartlab.com</code> / <code className="text-indigo-400">student123</code></p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Built for the Entire College Ecosystem</h2>
          <p className="text-slate-400 mt-2">Comprehensive role-based workflows for Students, Faculty, Technicians & Admins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-6 hover:border-indigo-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <FiCompass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Lab Discovery</h3>
            <p className="text-sm text-slate-400">
              Browse labs across all engineering departments. View real-time availability calculated directly from verified reservations.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-6 hover:border-violet-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
              <FiCalendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Conflict-Free Bookings</h3>
            <p className="text-sm text-slate-400">
              Instant time slot overlap validation, faculty approval queues, policy limits, and automatic digital QR passes.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-6 hover:border-pink-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
              <FiPackage className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Equipment Tracking</h3>
            <p className="text-sm text-slate-400">
              Manage ESP32s, Oscilloscopes, and Robotics kits. Technician scan-to-checkout and condition verification on return.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-6 hover:border-emerald-500/50 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <FiUsers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Team & Project Hub</h3>
            <p className="text-sm text-slate-400">
              Match teammates by programming skills, track milestones, schedule faculty mentorship, and publish in the Innovation Showcase.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-500">
        <p>© 2024-2026 SMARTLAB – College Laboratory, Resource Booking and Student Innovation Platform.</p>
      </footer>
    </div>
  );
};

export default LandingPage;


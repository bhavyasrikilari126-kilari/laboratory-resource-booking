import React, { useState, useEffect } from 'react';
import {
  FiTool,
  FiCheckSquare,
  FiPackage,
  FiAlertTriangle,
  FiGrid,
  FiCheck,
  FiArrowRight,
  FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import bookingService from '../../services/booking.service';
import labPassService from '../../services/labPass.service';
import issueService from '../../services/issue.service';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TechnicianDashboard = () => {
  const [todayBookings, setTodayBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Pass Verify Modal
  const [showScanModal, setShowScanModal] = useState(false);
  const [passCodeInput, setPassCodeInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [bookingsRes, issuesRes] = await Promise.all([
        bookingService.getBookings({ date: new Date().toISOString().split('T')[0] }),
        issueService.getIssues({ status: 'reported' }),
      ]);

      if (bookingsRes.success) setTodayBookings(bookingsRes.data || []);
      if (issuesRes.success) setIssues(issuesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleVerifyPass = async (e) => {
    e.preventDefault();
    if (!passCodeInput.trim()) return;

    try {
      setVerifying(true);
      const res = await labPassService.verifyPass({ passCode: passCodeInput.trim() });
      if (res.success) {
        toast.success(res.message || 'Pass verified successfully!');
        setScanResult(res);
        setPassCodeInput('');
        fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pass verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading technician control station..." />;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/70 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-3">
            Hardware & Lab Technician Station
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Daily Laboratory Operations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Verify student QR entry passes, issue hardware modules, inspect returned components, and log repairs.
          </p>
        </div>

        <button
          onClick={() => {
            setShowScanModal(true);
            setScanResult(null);
          }}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-amber-600/30 transition shrink-0 self-start md:self-auto"
        >
          <FiGrid className="w-5 h-5" /> Scan / Verify Student Pass
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Reservations"
          value={todayBookings.length}
          icon={FiCheckSquare}
          color="indigo"
          change="Checked & active"
        />
        <StatCard
          title="Open Maintenance Issues"
          value={issues.length}
          icon={FiAlertTriangle}
          color="rose"
          change="Damaged hardware reported"
        />
        <StatCard
          title="Hardware Checkouts"
          value="Operational"
          icon={FiPackage}
          color="emerald"
          change="Inventory tracking"
        />
      </div>

      {/* Today's Lab Sessions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <FiCheckSquare className="text-indigo-600" /> Today's Scheduled Lab Sessions
        </h2>

        {todayBookings.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No sessions scheduled for today.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl">Reference</th>
                  <th className="p-3">Laboratory</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Time Window</th>
                  <th className="p-3 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {todayBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3 font-bold text-gray-900">{b.bookingRef}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{b.laboratory?.name}</p>
                      <p className="text-[10px] text-gray-400">Room {b.laboratory?.labNumber}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{b.student?.name}</p>
                      <p className="text-[10px] text-gray-400">{b.student?.studentId}</p>
                    </td>
                    <td className="p-3 text-gray-600 font-bold">{b.startTime} - {b.endTime}</td>
                    <td className="p-3 text-right">
                      <Badge variant={b.status}>{b.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify Pass Modal */}
      {showScanModal && (
        <Modal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          title="Verify Student Lab Entry Pass"
        >
          <div className="space-y-4">
            <form onSubmit={handleVerifyPass} className="space-y-3">
              <label className="block text-xs font-bold uppercase text-gray-700">
                Enter Digital Pass Code or Scan QR
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={passCodeInput}
                  onChange={(e) => setPassCodeInput(e.target.value)}
                  placeholder="e.g. LP-M123-ABC"
                  required
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
                >
                  {verifying ? 'Checking...' : 'Verify'}
                </button>
              </div>
            </form>

            {scanResult && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-sm">
                  <FiCheck className="text-emerald-600" /> {scanResult.message}
                </p>
                <div className="text-gray-700 space-y-1 pt-1 border-t border-emerald-200">
                  <p>Student: <strong>{scanResult.data?.student?.name}</strong></p>
                  <p>Lab: <strong>{scanResult.data?.laboratory?.name}</strong></p>
                  <p>Room: <strong>{scanResult.data?.laboratory?.labNumber}</strong></p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TechnicianDashboard;


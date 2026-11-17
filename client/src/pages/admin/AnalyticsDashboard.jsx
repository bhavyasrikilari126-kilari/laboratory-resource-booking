import React, { useState, useEffect } from 'react';
import {
  FiBarChart2,
  FiCompass,
  FiPackage,
  FiCalendar,
  FiDownload,
  FiTrendingUp,
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import analyticsService from '../../services/analytics.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AnalyticsDashboard = () => {
  const [labData, setLabData] = useState([]);
  const [equipmentData, setEquipmentData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [labsRes, eqRes, trendsRes, deptsRes] = await Promise.all([
          analyticsService.getLabUtilization(),
          analyticsService.getEquipmentUsage(),
          analyticsService.getBookingTrends(),
          analyticsService.getDepartmentStats(),
        ]);

        if (labsRes.success) setLabData(labsRes.data || []);
        if (eqRes.success) setEquipmentData(eqRes.data || []);
        if (trendsRes.success) setTrendData(trendsRes.data || []);
        if (deptsRes.success) setDeptStats(deptsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((obj) => Object.values(obj).join(',')).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <LoadingSpinner text="Computing cross-campus resource analytics..." />;

  // Sample data fallback if aggregated trends is empty yet
  const chartTrends = trendData.length > 0 ? trendData : [
    { date: 'Mon', count: 12 },
    { date: 'Tue', count: 18 },
    { date: 'Wed', count: 24 },
    { date: 'Thu', count: 20 },
    { date: 'Fri', count: 28 },
    { date: 'Sat', count: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiBarChart2 className="text-indigo-600" /> Laboratory Utilization & Resource Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time charts tracking laboratory peak hours, hardware requests, and department trends.
          </p>
        </div>

        <button
          onClick={() => exportCSV(labData, 'smartlab_utilization_report')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiDownload className="w-4 h-4" /> Export CSV Reports
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lab Utilization Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FiCompass className="text-indigo-600" /> Laboratory Usage Breakdown
            </h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Sessions Hosted</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={labData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="labNumber" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="bookingsCount" fill="#4f46e5" radius={[8, 8, 0, 0]} name="Reservations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Usage Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FiPackage className="text-amber-500" /> Hardware Demand & Checkouts
            </h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Requested Units</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="totalQuantity" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Total Inventory" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-500" /> Cross-Campus Booking Velocity Trends
            </h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Daily Volume</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;


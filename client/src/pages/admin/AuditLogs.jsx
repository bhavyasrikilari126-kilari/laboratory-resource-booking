import React, { useState, useEffect } from 'react';
import { FiShield, FiClock, FiSearch } from 'react-icons/fi';
import auditLogService from '../../services/auditLog.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await auditLogService.getLogs();
        if (res.success) setLogs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner text="Querying security audit logs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiShield className="text-rose-600" /> Platform Security & Audit Logs
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Cryptographically timestamped trail of user logins, role updates, pass scans, and resource modifications.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action Event</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3 text-right rounded-r-xl">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">
                    No security events logged yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/60 transition">
                    <td className="p-3 text-gray-500 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-gray-900">
                      {log.user?.name || 'System / Anonymous'}
                      <span className="block text-[10px] text-gray-400 font-normal">{log.user?.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 font-mono text-[11px]">{log.resourceType}</td>
                    <td className="p-3 text-right text-gray-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;


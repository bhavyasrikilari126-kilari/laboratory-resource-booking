import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiTool } from 'react-icons/fi';
import toast from 'react-hot-toast';
import issueService from '../../services/issue.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const IssueManager = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve Modal
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssues();
      if (res.success) setIssues(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await issueService.updateStatus(id, { status });
      if (res.success) {
        toast.success(`Issue status updated to ${status}`);
        fetchIssues();
      }
    } catch (err) {
      toast.error('Failed to update issue status');
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolvingIssue) return;

    try {
      setResolving(true);
      const res = await issueService.resolve(resolvingIssue._id, {
        resolution: resolutionText,
      });

      if (res.success) {
        toast.success('Issue marked as resolved! Equipment condition restored to good.');
        setResolvingIssue(null);
        setResolutionText('');
        fetchIssues();
      }
    } catch (err) {
      toast.error('Failed to resolve issue');
    } finally {
      setResolving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading maintenance tickets..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiAlertTriangle className="text-rose-500" /> Equipment Maintenance & Repair Station
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track reported damaged hardware, faulty power modules, and infrastructure problems.
        </p>
      </div>

      <div className="space-y-4">
        {issues.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center bg-white rounded-3xl border border-gray-100">
            ✓ No open maintenance tickets! All laboratory hardware is functional.
          </p>
        ) : (
          issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-gray-200 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                    {issue.type?.replace('_', ' ')}
                  </span>
                  <Badge variant={issue.status}>{issue.status}</Badge>
                </div>

                <h3 className="text-base font-black text-gray-900">{issue.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xl">{issue.description}</p>

                <p className="text-[11px] text-gray-400">
                  Reported by: <strong>{issue.reportedBy?.name}</strong> • Date: {new Date(issue.createdAt).toLocaleDateString()}
                  {issue.laboratory && ` • Room: ${issue.laboratory?.labNumber}`}
                </p>

                {issue.resolution && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl font-medium max-w-xl">
                    Resolution: "{issue.resolution}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                {issue.status === 'reported' && (
                  <button
                    onClick={() => handleUpdateStatus(issue._id, 'in_progress')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <FiTool /> Start Repair
                  </button>
                )}

                {['reported', 'assigned', 'in_progress'].includes(issue.status) && (
                  <button
                    onClick={() => {
                      setResolvingIssue(issue);
                      setResolutionText('');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <FiCheckCircle /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {resolvingIssue && (
        <Modal
          isOpen={!!resolvingIssue}
          onClose={() => setResolvingIssue(null)}
          title={`Resolve: ${resolvingIssue.title}`}
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Resolution & Repair Details
              </label>
              <textarea
                rows={4}
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Replaced 5V linear voltage regulator and tested GPIO 3.3V bus output with multimeter..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={resolving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {resolving ? 'Submitting...' : 'Complete Repair & Restock Equipment'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default IssueManager;


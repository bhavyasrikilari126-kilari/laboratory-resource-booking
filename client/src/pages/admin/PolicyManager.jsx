import React, { useState, useEffect } from 'react';
import { FiShield, FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import bookingPolicyService from '../../services/bookingPolicy.service';
import departmentService from '../../services/department.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PolicyManager = () => {
  const [policies, setPolicies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [maxDuration, setMaxDuration] = useState(180);
  const [advanceDays, setAdvanceDays] = useState(7);
  const [cancelDeadline, setCancelDeadline] = useState(2);
  const [requireApproval, setRequireApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [polRes, deptsRes] = await Promise.all([
        bookingPolicyService.getPolicies(),
        departmentService.getDepartments(),
      ]);

      if (polRes.success) setPolicies(polRes.data || []);
      if (deptsRes.success) setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await bookingPolicyService.createPolicy({
        name,
        department: deptId || undefined,
        maxDurationMinutes: Number(maxDuration),
        advanceBookingDays: Number(advanceDays),
        cancellationDeadlineHours: Number(cancelDeadline),
        requiresFacultyApproval: requireApproval,
      });

      if (res.success) {
        toast.success('Reservation policy established!');
        setShowModal(false);
        setName('');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking policy?')) return;
    try {
      const res = await bookingPolicyService.deletePolicy(id);
      if (res.success) {
        toast.success('Policy removed');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete policy');
    }
  };

  if (loading) return <LoadingSpinner text="Loading booking policies..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiShield className="text-indigo-600" /> Laboratory Booking Policies
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enforce maximum session lengths, advance booking periods, cancellation cutoffs, and faculty verification.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> New Policy Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md inline-block">
                {p.department?.name || 'College-Wide Policy'}
              </span>
              <h3 className="text-base font-black text-gray-900">{p.name}</h3>

              <div className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-50">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Duration:</span>
                  <span className="font-bold text-gray-800">{p.maxDurationMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Advance Booking Window:</span>
                  <span className="font-bold text-gray-800">{p.advanceBookingDays} days prior</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cancellation Deadline:</span>
                  <span className="font-bold text-gray-800">{p.cancellationDeadlineHours} hrs before start</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Faculty Review Required:</span>
                  <span className={`font-black ${p.requiresFacultyApproval ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {p.requiresFacultyApproval ? 'Mandatory Approval' : 'Auto-Approved'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleDelete(p._id)}
                className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Laboratory Reservation Policy"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Policy Title</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CSE AI Lab Capstone Policy"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Department</label>
              <select
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
              >
                <option value="">Apply College-Wide (All Departments)</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Max Duration (Mins)</label>
                <input
                  type="number"
                  value={maxDuration}
                  onChange={(e) => setMaxDuration(e.target.value)}
                  required
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Advance Days</label>
                <input
                  type="number"
                  value={advanceDays}
                  onChange={(e) => setAdvanceDays(e.target.value)}
                  required
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Cancel Cutoff (Hrs)</label>
                <input
                  type="number"
                  value={cancelDeadline}
                  onChange={(e) => setCancelDeadline(e.target.value)}
                  required
                  className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="requireAppr"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-0"
              />
              <label htmlFor="requireAppr" className="text-xs font-bold text-gray-800">
                Require Faculty In-Charge Approval Before Slot Confirmation
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Deploy Policy'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PolicyManager;


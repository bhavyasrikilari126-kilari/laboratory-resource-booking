import React, { useState, useEffect } from 'react';
import { FiCompass, FiPlus, FiTrash2, FiEdit2, FiTool } from 'react-icons/fi';
import toast from 'react-hot-toast';
import labService from '../../services/lab.service';
import departmentService from '../../services/department.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LabManager = () => {
  const [labs, setLabs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [labNumber, setLabNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [capacity, setCapacity] = useState(30);
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const [labsRes, deptsRes] = await Promise.all([
        labService.getLabs(),
        departmentService.getDepartments(),
      ]);

      if (labsRes.success) setLabs(labsRes.data || []);
      if (deptsRes.success) setDepartments(deptsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await labService.createLab({
        name,
        labNumber,
        department,
        capacity: Number(capacity),
        description,
        facilities: facilities ? facilities.split(',').map((f) => f.trim()) : [],
      });

      if (res.success) {
        toast.success('Laboratory added to campus catalog!');
        setShowModal(false);
        setName('');
        setLabNumber('');
        setDescription('');
        setFacilities('');
        fetchLabs();
      }
    } catch (err) {
      toast.error('Failed to create laboratory');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMaintenance = async (lab) => {
    try {
      const newStatus = lab.status === 'under_maintenance' ? 'available' : 'under_maintenance';
      const res = await labService.updateLab(lab._id, { status: newStatus });
      if (res.success) {
        toast.success(`Lab status updated to ${newStatus}`);
        fetchLabs();
      }
    } catch (err) {
      toast.error('Failed to update lab status');
    }
  };

  if (loading) return <LoadingSpinner text="Loading laboratories..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiCompass className="text-indigo-600" /> Laboratory Infrastructure Master
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Add laboratories, manage seating capacities, assign operating hours, and schedule maintenance.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> Add Laboratory
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Room Number</th>
                <th className="p-3">Laboratory Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Capacity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {labs.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3 font-mono font-bold text-gray-900">{l.labNumber}</td>
                  <td className="p-3 font-bold text-gray-900">{l.name}</td>
                  <td className="p-3 text-gray-600">{l.department?.code} - {l.department?.name}</td>
                  <td className="p-3 font-bold text-gray-900">{l.capacity} seats</td>
                  <td className="p-3">
                    <Badge variant={l.status}>{l.status}</Badge>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleMaintenance(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        l.status === 'under_maintenance'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'border border-amber-300 text-amber-700 hover:bg-amber-50'
                      }`}
                    >
                      {l.status === 'under_maintenance' ? 'Re-open Lab' : 'Set Maintenance'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add New College Laboratory"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Laboratory Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Microprocessor & VLSI Design Lab"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Room / Lab Number</label>
                <input
                  type="text"
                  value={labNumber}
                  onChange={(e) => setLabNumber(e.target.value)}
                  placeholder="ECE-305"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
                >
                  <option value="">Select Dept...</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Student Seating Capacity</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Facilities (Comma-separated)</label>
              <input
                type="text"
                value={facilities}
                onChange={(e) => setFacilities(e.target.value)}
                placeholder="Oscilloscopes, Soldering Benches, Logic Analyzers"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Register Laboratory'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LabManager;


import React, { useState, useEffect } from 'react';
import { FiLayers, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import departmentService from '../../services/department.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getDepartments();
      if (res.success) setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await departmentService.createDepartment({
        name,
        code: code.toUpperCase(),
        description,
      });

      if (res.success) {
        toast.success('Department created!');
        setShowModal(false);
        setName('');
        setCode('');
        setDescription('');
        fetchDepts();
      }
    } catch (err) {
      toast.error('Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this department?')) return;
    try {
      const res = await departmentService.deleteDepartment(id);
      if (res.success) {
        toast.success('Department deactivated');
        fetchDepts();
      }
    } catch (err) {
      toast.error('Failed to deactivate department');
    }
  };

  if (loading) return <LoadingSpinner text="Loading departments..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiLayers className="text-indigo-600" /> Academic Engineering Departments
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure college departments, assign department heads, and manage laboratory resource boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept._id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md inline-block">
                {dept.code}
              </span>
              <h3 className="text-base font-black text-gray-900">{dept.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{dept.description}</p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Head: {dept.headOfDepartment?.name || 'Dr. Assigned Head'}
              </span>
              <button
                onClick={() => handleDelete(dept._id)}
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
          title="Add Engineering Department"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Department Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Biomedical Engineering"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Department Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. BME"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Department'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default DepartmentManager;


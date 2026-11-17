import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFolder, FiPlus, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import projectService from '../../services/project.service';
import departmentService from '../../services/department.service';
import equipmentService from '../../services/equipment.service';

const ProjectForm = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'mini',
    department: '',
    objectives: '',
    technicalDescription: '',
    requiredEquipment: [],
  });

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [deptsRes, eqRes] = await Promise.all([
          departmentService.getDepartments(),
          equipmentService.getEquipment(),
        ]);
        if (deptsRes.success) setDepartments(deptsRes.data || []);
        if (eqRes.success) setEquipmentList(eqRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInit();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEquipmentToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      requiredEquipment: prev.requiredEquipment.includes(id)
        ? prev.requiredEquipment.filter((item) => item !== id)
        : [...prev.requiredEquipment, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await projectService.createProject({
        ...formData,
        objectives: formData.objectives ? formData.objectives.split('\n').filter(Boolean) : [],
      });

      if (res.success) {
        toast.success('Project workspace initialized!');
        navigate(`/projects/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiFolder className="text-indigo-600" /> Create Academic Project Workspace
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Set up project milestones, invite student collaborators, and request laboratory hardware resources.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Project Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Autonomous All-Terrain Obstacle Avoidance Rover"
              required
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Project Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="mini">Mini Project (Semester Practical)</option>
                <option value="major">Major Project (Final Year Capstone)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">Short Overview</label>
            <textarea
              rows={2}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of project goal and real-world engineering problem addressed..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Key Objectives (1 per line)
            </label>
            <textarea
              rows={3}
              name="objectives"
              value={formData.objectives}
              onChange={handleChange}
              placeholder="Design dual-motor H-bridge PWM driver circuit&#10;Implement ultrasonic obstacle mapping algorithm&#10;Validate latency under varied battery voltages"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
              Select Required Hardware Components
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-200">
              {equipmentList.map((eq) => {
                const isChecked = formData.requiredEquipment.includes(eq._id);
                return (
                  <div
                    key={eq._id}
                    onClick={() => handleEquipmentToggle(eq._id)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition ${
                      isChecked ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold' : 'bg-white border-gray-200 text-gray-700'
                    }`}
                  >
                    <span>{eq.name}</span>
                    <span className="text-[10px] text-gray-400">{eq.category}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating...' : 'Initialize Project Workspace'} <FiArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;


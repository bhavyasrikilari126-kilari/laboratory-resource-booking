import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiFolder,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiPackage,
  FiCompass,
  FiFileText,
  FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import projectService from '../../services/project.service';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Milestone Modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

  // Task Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProject(id);
      if (res.success) setProject(res.data);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await projectService.addMilestone(id, {
        title: milestoneTitle,
        description: milestoneDesc,
        dueDate: milestoneDate || undefined,
      });
      if (res.success) {
        toast.success('Milestone added!');
        setShowMilestoneModal(false);
        setMilestoneTitle('');
        setMilestoneDesc('');
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to add milestone');
    }
  };

  const handleToggleMilestone = async (milestoneId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const res = await projectService.updateMilestone(id, milestoneId, { status: newStatus });
      if (res.success) {
        toast.success(`Milestone marked as ${newStatus}`);
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to update milestone');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await projectService.addTask(id, {
        title: taskTitle,
        status: 'todo',
      });
      if (res.success) {
        toast.success('Task added!');
        setShowTaskModal(false);
        setTaskTitle('');
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      const res = await projectService.updateTask(id, taskId, { status: newStatus });
      if (res.success) {
        toast.success(`Task status updated`);
        fetchProject();
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  if (loading) return <LoadingSpinner text="Opening project workspace..." />;
  if (!project) return <div className="text-center p-12 text-gray-500">Project not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">
              {project.type} Project
            </span>
            <Badge variant={project.status}>{project.status}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{project.title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{project.description}</p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/labs"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Reserve Lab Space
          </Link>
          <Link
            to="/equipment"
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition"
          >
            Request Hardware
          </Link>
        </div>
      </div>

      {/* Main Grid: Milestones, Tasks, Team, Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Milestones & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FiCheckCircle className="text-indigo-600" /> Project Milestones
              </h2>
              <button
                onClick={() => setShowMilestoneModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition"
              >
                <FiPlus /> Add Milestone
              </button>
            </div>

            {project.milestones?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No milestones created yet.</p>
            ) : (
              <div className="space-y-3">
                {project.milestones?.map((m) => {
                  const isDone = m.status === 'completed';
                  return (
                    <div
                      key={m._id}
                      onClick={() => handleToggleMilestone(m._id, m.status)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isDone ? 'bg-emerald-50/40 border-emerald-200' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                            isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          {isDone && <FiCheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {m.title}
                          </p>
                          {m.description && <p className="text-[11px] text-gray-500">{m.description}</p>}
                        </div>
                      </div>
                      <Badge variant={m.status}>{m.status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Tasks Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FiClock className="text-indigo-600" /> Action Items & Tasks
              </h2>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition"
              >
                <FiPlus /> Add Task
              </button>
            </div>

            {project.tasks?.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {project.tasks?.map((t) => {
                  const isDone = t.status === 'completed';
                  return (
                    <div
                      key={t._id}
                      onClick={() => handleToggleTask(t._id, t.status)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition text-xs ${
                        isDone ? 'bg-emerald-50/40 border-emerald-200 line-through text-gray-400' : 'bg-gray-50/60 border-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isDone}
                          readOnly
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="font-semibold">{t.title}</span>
                      </div>
                      <Badge variant={t.status}>{t.status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Team Members & Linked Resources */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FiUsers className="text-indigo-600" /> Team Members ({project.members?.length || 1})
            </h2>
            <div className="space-y-3">
              {project.members?.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                    {m.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.studentId || m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linked Resources */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FiPackage className="text-indigo-600" /> Linked Lab Hardware
            </h2>
            <div className="space-y-2">
              {project.requiredEquipment?.length > 0 ? (
                project.requiredEquipment.map((eq) => (
                  <div key={eq._id} className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between items-center">
                    <span className="font-bold text-gray-900">{eq.name}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                      Linked
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No hardware components specifically tagged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <Modal
          isOpen={showMilestoneModal}
          onClose={() => setShowMilestoneModal(false)}
          title="Add Project Milestone"
        >
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Milestone Name</label>
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="e.g. Hardware schematic review & PCB design complete"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Target Due Date</label>
              <input
                type="date"
                value={milestoneDate}
                onChange={(e) => setMilestoneDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Add Milestone
            </button>
          </form>
        </Modal>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title="Add Action Item / Task"
        >
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Task Description</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Solder motor driver jumpers to ESP32 GPIO pins"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Add Task
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetail;


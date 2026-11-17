import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFolder,
  FiPlus,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiArrowRight,
  FiTag,
} from 'react-icons/fi';
import projectService from '../../services/project.service';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType) params.type = filterType;

      const res = await projectService.getProjects(params);
      if (res.success) setProjects(res.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filterType]);

  if (loading) return <LoadingSpinner text="Loading your projects..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiFolder className="text-indigo-600" /> Student Project Workspace
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your mini and major engineering projects, track milestones, assign tasks, and link lab resources.
          </p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Create New Project
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterType('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === '' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
          }`}
        >
          All Projects
        </button>
        <button
          onClick={() => setFilterType('mini')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'mini' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
          }`}
        >
          Mini Projects
        </button>
        <button
          onClick={() => setFilterType('major')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'major' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
          }`}
        >
          Major Capstones
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          title="No Academic Projects Found"
          description="Create your first mini or major project workspace to begin assembling your team and requesting equipment."
          actionText="Create Project"
          onAction={() => (window.location.href = '/projects/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const completedMilestones = proj.milestones?.filter((m) => m.status === 'completed').length || 0;
            const totalMilestones = proj.milestones?.length || 0;
            const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

            return (
              <div
                key={proj._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {proj.type} Project
                    </span>
                    <Badge variant={proj.status}>{proj.status}</Badge>
                  </div>

                  <h3 className="text-base font-black text-gray-900 leading-snug">{proj.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {proj.description || 'Academic engineering project workspace.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-gray-400">Milestone Progress</span>
                      <span className="text-indigo-600">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Members & Faculty Mentor */}
                  <div className="pt-2 text-xs text-gray-500 space-y-1 border-t border-gray-50">
                    <p className="flex items-center gap-1.5">
                      <FiUsers className="text-gray-400" /> Team: <strong>{proj.members?.length || 1} members</strong>
                    </p>
                    {proj.mentor && (
                      <p className="text-gray-600">
                        Faculty Mentor: <strong>{proj.mentor?.name}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <Link
                    to={`/projects/${proj._id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 rounded-xl text-xs font-bold transition"
                  >
                    Open Workspace <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectList;


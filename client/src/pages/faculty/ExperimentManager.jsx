import React, { useState, useEffect } from 'react';
import { FiBookOpen, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import experimentService from '../../services/experiment.service';
import labService from '../../services/lab.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ExperimentManager = () => {
  const [experiments, setExperiments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [description, setDescription] = useState('');
  const [labId, setLabId] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState(120);
  const [objectives, setObjectives] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, labRes] = await Promise.all([
        experimentService.getExperiments(),
        labService.getLabs(),
      ]);

      if (expRes.success) setExperiments(expRes.data || []);
      if (labRes.success) setLabs(labRes.data || []);
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
      const res = await experimentService.createExperiment({
        title,
        course,
        description,
        laboratory: labId,
        difficulty,
        estimatedDuration: Number(duration),
        objectives: objectives ? objectives.split('\n').filter(Boolean) : [],
      });

      if (res.success) {
        toast.success('Curriculum experiment published!');
        setShowModal(false);
        setTitle('');
        setCourse('');
        setDescription('');
        setObjectives('');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create experiment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experiment curriculum?')) return;
    try {
      const res = await experimentService.deleteExperiment(id);
      if (res.success) {
        toast.success('Experiment removed');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to delete experiment');
    }
  };

  if (loading) return <LoadingSpinner text="Loading experiments..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiBookOpen className="text-indigo-600" /> Curriculum Experiment Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Author and assign laboratory procedures, safety guidelines, and viva question banks.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> New Experiment
        </button>
      </div>

      <div className="space-y-4">
        {experiments.map((exp) => (
          <div
            key={exp._id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {exp.course} • {exp.difficulty}
              </span>
              <h3 className="text-base font-black text-gray-900 mt-1">{exp.title}</h3>
              <p className="text-xs text-gray-500">{exp.description}</p>
              <p className="text-[11px] text-gray-400">
                Assigned Lab: <strong>{exp.laboratory?.name}</strong> • Duration: {exp.estimatedDuration} mins
              </p>
            </div>

            <button
              onClick={() => handleDelete(exp._id)}
              className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition self-end sm:self-center"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Author New Practical Experiment"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Experiment Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Speed Control of DC Motor using ESP32 PWM"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="EC-305"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Target Laboratory</label>
                <select
                  value={labId}
                  onChange={(e) => setLabId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                >
                  <option value="">Select Lab...</option>
                  {labs.map((l) => (
                    <option key={l._id} value={l._id}>{l.name} ({l.labNumber})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Summary Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Learning Objectives (1 per line)
              </label>
              <textarea
                rows={3}
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Configure hardware timers&#10;Measure output duty cycle on oscilloscope"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Experiment Curriculum'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExperimentManager;


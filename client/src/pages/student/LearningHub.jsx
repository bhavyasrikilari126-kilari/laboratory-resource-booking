import React, { useState, useEffect } from 'react';
import {
  FiBookOpen,
  FiFileText,
  FiCheckCircle,
  FiHelpCircle,
  FiSend,
  FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import experimentService from '../../services/experiment.service';
import learningMaterialService from '../../services/learningMaterial.service';
import practicalRecordService from '../../services/practicalRecord.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LearningHub = () => {
  const [experiments, setExperiments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('experiments');

  // Submit Record Modal
  const [submittingExp, setSubmittingExp] = useState(null);
  const [observations, setObservations] = useState('');
  const [results, setResults] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expRes, matRes, recRes] = await Promise.all([
        experimentService.getExperiments(),
        learningMaterialService.getMaterials(),
        practicalRecordService.getMyRecords(),
      ]);

      if (expRes.success) setExperiments(expRes.data || []);
      if (matRes.success) setMaterials(matRes.data || []);
      if (recRes.success) setMyRecords(recRes.data || []);
    } catch (err) {
      console.error('Error loading learning hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    if (!submittingExp) return;

    try {
      setSubmitting(true);
      const res = await practicalRecordService.submit({
        experiment: submittingExp._id,
        laboratory: submittingExp.laboratory?._id,
        date: new Date(),
        observations,
        results,
      });

      if (res.success) {
        toast.success('Practical record submitted to faculty for evaluation!');
        setSubmittingExp(null);
        setObservations('');
        setResults('');
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to submit record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Opening learning hub..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiBookOpen className="text-indigo-600" /> Practical Learning & Experiment Hub
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Access laboratory manuals, viva question banks, safety guidelines, and submit practical experiment records.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'experiments' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Curriculum Experiments
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'materials' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Lab Manuals & Checklists
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'records' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          My Submissions & Grades
        </button>
      </div>

      {activeTab === 'experiments' && (
        <div className="space-y-4">
          {experiments.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {exp.course || 'Practical Lab'}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-1">{exp.title}</h3>
                  <p className="text-xs text-gray-400">
                    Room: {exp.laboratory?.labNumber} • Est. Duration: {exp.estimatedDuration || 120} mins
                  </p>
                </div>
                <button
                  onClick={() => setSubmittingExp(exp)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
                >
                  Submit Practical Record
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{exp.description}</p>

              {/* Objectives */}
              {exp.objectives?.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-2">
                  <p className="font-bold text-gray-900">Core Objectives:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {exp.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Viva Questions */}
              {exp.vivaQuestions?.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                    <FiHelpCircle className="text-amber-500" /> Viva Preparation Questions
                  </p>
                  <div className="space-y-2">
                    {exp.vivaQuestions.map((v, i) => (
                      <div key={i} className="p-3 bg-amber-50/50 rounded-xl text-xs border border-amber-100">
                        <p className="font-bold text-gray-900">Q: {v.question}</p>
                        <p className="text-gray-600 mt-0.5">A: {v.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((m) => (
            <div key={m._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                {m.type}
              </span>
              <h3 className="text-base font-black text-gray-900">{m.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
              {m.content && (
                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-700 font-mono text-[11px]">
                  {m.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'records' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">My Submitted Practical Records</h2>
          {myRecords.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">No submitted experiment records yet.</p>
          ) : (
            <div className="space-y-3">
              {myRecords.map((r) => (
                <div key={r._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{r.experiment?.title}</p>
                    <p className="text-gray-400 mt-0.5">Submitted: {new Date(r.submittedAt).toLocaleDateString()}</p>
                    {r.feedback && <p className="mt-1 text-emerald-700 italic">Faculty Feedback: "{r.feedback}"</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                      Grade: {r.grade || 'Under Review'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Record Modal */}
      {submittingExp && (
        <Modal
          isOpen={!!submittingExp}
          onClose={() => setSubmittingExp(null)}
          title={`Submit Record: ${submittingExp.title}`}
        >
          <form onSubmit={handleSubmitRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Practical Observations & Measurements
              </label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Observed motor RPM response at 25%, 50%, 75% PWM duty cycle..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Results & Engineering Conclusions
              </label>
              <textarea
                rows={3}
                value={results}
                onChange={(e) => setResults(e.target.value)}
                placeholder="Motor velocity scales linearly with duty cycle within 3% tolerance..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit to Faculty for Grading'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LearningHub;


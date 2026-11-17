import React, { useState, useEffect } from 'react';
import { FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import learningMaterialService from '../../services/learningMaterial.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MaterialsManager = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('manual');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await learningMaterialService.getMaterials();
      if (res.success) setMaterials(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await learningMaterialService.createMaterial({
        title,
        type,
        description,
        content,
      });

      if (res.success) {
        toast.success('Learning material published!');
        setShowModal(false);
        setTitle('');
        setDescription('');
        setContent('');
        fetchMaterials();
      }
    } catch (err) {
      toast.error('Failed to create material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this learning material?')) return;
    try {
      const res = await learningMaterialService.deleteMaterial(id);
      if (res.success) {
        toast.success('Material deleted');
        fetchMaterials();
      }
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  if (loading) return <LoadingSpinner text="Loading learning materials..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiFileText className="text-indigo-600" /> Laboratory Manuals & Guides
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Publish hardware pinout manuals, safety protocols, and preparation checklists for students.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> New Lab Manual
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((m) => (
          <div
            key={m._id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                {m.type}
              </span>
              <h3 className="text-base font-black text-gray-900">{m.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
              {m.content && (
                <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-600 font-mono">
                  {m.content}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => handleDelete(m._id)}
                className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
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
          title="Upload Laboratory Guide / Manual"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ESP32 Pinout & Hardware Peripherals Manual"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
              >
                <option value="manual">Manual</option>
                <option value="reference">Reference Sheet</option>
                <option value="checklist">Safety Checklist</option>
                <option value="guide">Guide</option>
              </select>
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
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Content / Instructions</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type manual notes or text instructions..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Learning Material'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MaterialsManager;


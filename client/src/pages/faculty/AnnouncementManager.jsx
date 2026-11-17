import React, { useState, useEffect } from 'react';
import { FiSliders, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import announcementService from '../../services/announcement.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAnnouncements();
      if (res.success) setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await announcementService.createAnnouncement({
        title,
        content,
        priority,
      });

      if (res.success) {
        toast.success('Announcement broadcasted to campus!');
        setShowModal(false);
        setTitle('');
        setContent('');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error('Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await announcementService.deleteAnnouncement(id);
      if (res.success) {
        toast.success('Announcement removed');
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  if (loading) return <LoadingSpinner text="Loading announcements..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiSliders className="text-indigo-600" /> Campus & Department Announcements
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Broadcast hardware deadlines, hackathon notices, and maintenance schedules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann._id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-indigo-100 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {ann.priority} priority
              </span>
              <h3 className="text-base font-black text-gray-900 mt-1">{ann.title}</h3>
              <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">{ann.content}</p>
              <p className="text-[11px] text-gray-400">
                Posted by {ann.publishedBy?.name || 'Faculty Staff'} • {new Date(ann.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => handleDelete(ann._id)}
              className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition self-end sm:self-center"
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
          title="Broadcast Campus Announcement"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Headline</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Robotics Lab Track Upgrades This Saturday"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Announcement Details</label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type notice message..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Broadcast Announcement'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AnnouncementManager;


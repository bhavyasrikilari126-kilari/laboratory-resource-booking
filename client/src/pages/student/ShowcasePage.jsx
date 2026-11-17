import React, { useState, useEffect } from 'react';
import {
  FiSparkles,
  FiHeart,
  FiMessageSquare,
  FiPlus,
  FiShare2,
  FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import showcaseService from '../../services/showcase.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ShowcasePage = () => {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Publish Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IoT & Smart Systems');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Feedback/Comment state
  const [commentingId, setCommentingId] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      const res = await showcaseService.getShowcases();
      if (res.success) setShowcases(res.data || []);
    } catch (err) {
      console.error('Error fetching showcase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await showcaseService.likeShowcase(id);
      if (res.success) {
        setShowcases((prev) =>
          prev.map((item) => {
            if (item._id === id) {
              const currentLikes = item.likes || [];
              const isLiked = res.data.isLiked;
              return {
                ...item,
                likes: isLiked ? [...currentLikes, 'temp'] : currentLikes.slice(0, -1),
              };
            }
            return item;
          })
        );
      }
    } catch (err) {
      toast.error('Failed to register like');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await showcaseService.createShowcase({
        title,
        description,
        category,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      });

      if (res.success) {
        toast.success('Your project has been published in the Innovation Showcase!');
        setShowModal(false);
        setTitle('');
        setDescription('');
        setTags('');
        fetchShowcases();
      }
    } catch (err) {
      toast.error('Failed to publish project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    try {
      const res = await showcaseService.addFeedback(id, { comment: commentText });
      if (res.success) {
        toast.success('Feedback posted!');
        setCommentingId(null);
        setCommentText('');
        fetchShowcases();
      }
    } catch (err) {
      toast.error('Failed to post feedback');
    }
  };

  if (loading) return <LoadingSpinner text="Loading Student Innovation Showcase..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <FiSparkles className="text-indigo-600" /> Student Innovation Showcase
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Display completed hardware prototypes, share open project descriptions, and receive feedback from college peers & faculty.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Publish Your Project
        </button>
      </div>

      {/* Grid of Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showcases.map((sc) => (
          <div
            key={sc._id}
            className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700">
                  {sc.category}
                </span>
                <span className="text-xs text-gray-400">
                  By {sc.createdBy?.name || 'Student Innovator'}
                </span>
              </div>

              <h3 className="text-lg font-black text-gray-900 leading-snug">{sc.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{sc.description}</p>

              {/* Tags */}
              {sc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sc.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interaction Bar */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <button
                onClick={() => handleLike(sc._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 font-bold transition text-gray-600"
              >
                <FiHeart className="text-rose-500 w-4 h-4" />
                <span>{sc.likes?.length || 0} Likes</span>
              </button>

              <button
                onClick={() => setCommentingId(commentingId === sc._id ? null : sc._id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 font-bold transition text-gray-600"
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>{sc.feedback?.length || 0} Comments</span>
              </button>
            </div>

            {/* Comments Expansion */}
            {commentingId === sc._id && (
              <div className="pt-3 border-t border-gray-100 space-y-3 animate-in fade-in duration-150">
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {sc.feedback?.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-gray-50 text-xs">
                      <p className="font-bold text-gray-900">{f.user?.name || 'Peer'}</p>
                      <p className="text-gray-600 mt-0.5">{f.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Leave constructive feedback or ask a question..."
                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                  />
                  <button
                    onClick={() => handleAddComment(sc._id)}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Publish Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Publish Innovation Project"
        >
          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smart Solar-Powered Autonomous Greenhouse"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              >
                <option value="IoT & Smart Systems">IoT & Smart Systems</option>
                <option value="Robotics & Automation">Robotics & Automation</option>
                <option value="Embedded Systems">Embedded Systems</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Technical Summary</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe hardware modules used, sensor calibration, and prototype performance..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="IoT, ESP32, Solar, Arduino"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish to Innovation Feed'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ShowcasePage;


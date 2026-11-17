import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiAward,
  FiCode,
  FiBookOpen,
  FiCheckCircle,
  FiShield,
  FiFolder,
  FiEdit3,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import skillProfileService from '../../services/skillProfile.service';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ProfilePage = () => {
  const { user, updateProfileState } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await skillProfileService.getMyProfile();
      if (res.success) {
        setProfile(res.data);
        setBio(res.data.user?.bio || '');
        setLanguages(res.data.programmingLanguages?.join(', ') || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    try {
      const updatedSkills = [
        ...(profile.technicalSkills || []),
        { name: newSkill.trim(), level: newSkillLevel },
      ];

      const res = await skillProfileService.updateProfile({
        technicalSkills: updatedSkills,
      });

      if (res.success) {
        toast.success(`Skill "${newSkill}" added to your portfolio!`);
        setNewSkill('');
        fetchProfile();
      }
    } catch (err) {
      toast.error('Failed to update skills');
    }
  };

  const handleSaveBio = async () => {
    try {
      const langsArray = languages.split(',').map((l) => l.trim()).filter(Boolean);
      const res = await skillProfileService.updateProfile({
        bio,
        programmingLanguages: langsArray,
      });

      if (res.success) {
        toast.success('Profile portfolio updated!');
        if (user) {
          updateProfileState({ ...user, bio });
        }
        fetchProfile();
      }
    } catch (err) {
      toast.error('Failed to save profile changes');
    }
  };

  if (loading) return <LoadingSpinner text="Loading skill portfolio..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
          {user?.name?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h1 className="text-2xl font-black text-gray-900">{user?.name}</h1>
          <p className="text-xs text-gray-500">
            {user?.role?.toUpperCase()} • {user?.department?.name || 'College Department'} • ID: {user?.studentId || user?.employeeId || 'N/A'}
          </p>
          <p className="text-xs text-gray-600 pt-2">{user?.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-indigo-50/60 rounded-2xl">
            <span className="text-lg font-black text-indigo-700 block">{profile?.completedExperiments || 6}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Experiments</span>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-2xl">
            <span className="text-lg font-black text-purple-700 block">{profile?.projectsCompleted || 2}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Projects</span>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl">
            <span className="text-lg font-black text-emerald-700 block">{profile?.labSessionsAttended || 14}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Lab Sessions</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Skills & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Technical Skills Portfolio */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FiCode className="text-indigo-600" /> Technical Skills & Competencies
              </h2>
            </div>

            {/* Current Skills Badges */}
            <div className="flex flex-wrap gap-2">
              {profile?.technicalSkills?.map((s, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 flex items-center gap-2"
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] font-semibold text-indigo-400 capitalize">({s.level})</span>
                </div>
              ))}
            </div>

            {/* Add Skill Form */}
            <form onSubmit={handleAddSkill} className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Raspberry Pi, FreeRTOS, ROS2)..."
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Add Skill
              </button>
            </form>

            {/* Programming Languages & Bio */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Programming Languages (Comma-separated)
                </label>
                <input
                  type="text"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="C++, Python, JavaScript, Embedded C, MATLAB"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  About Me / Technical Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Passionate about embedded firmware, robotic motion planning, and hardware IoT testbenches..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
                />
              </div>

              <button
                onClick={handleSaveBio}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Save Portfolio Bio
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Faculty-Approved Achievements */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FiAward className="text-amber-500" /> Faculty-Verified Achievements
            </h2>
            <div className="space-y-3">
              {profile?.achievements?.map((ach, i) => (
                <div key={i} className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                    <FiCheckCircle className="text-amber-600" />
                    <span>{ach.title}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{ach.description}</p>
                  <p className="text-[10px] text-amber-700/80 pt-1 font-semibold">
                    ✓ Verified by Faculty Department
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


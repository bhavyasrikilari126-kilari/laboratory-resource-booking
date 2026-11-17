import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiSearch,
  FiUserPlus,
  FiCheckCircle,
  FiSend,
  FiAward,
  FiCode,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import skillProfileService from '../../services/skillProfile.service';
import teamService from '../../services/team.service';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const TeamFinder = () => {
  const [students, setStudents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [skillFilter, setSkillFilter] = useState('');

  // Invite Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inviteTeamId, setInviteTeamId] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profilesRes, teamsRes] = await Promise.all([
        skillProfileService.searchStudents(skillFilter ? { skill: skillFilter } : {}),
        teamService.findTeams(skillFilter ? { skill: skillFilter } : {}),
      ]);

      if (profilesRes.success) setStudents(profilesRes.data || []);
      if (teamsRes.success) setTeams(teamsRes.data || []);
    } catch (err) {
      console.error('Error fetching team finder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [skillFilter]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteTeamId) {
      toast.error('Please select one of your teams to invite this student to');
      return;
    }

    try {
      setSendingInvite(true);
      const res = await teamService.inviteMember(inviteTeamId, {
        toUserId: selectedStudent.user._id,
        message: inviteMsg,
      });

      if (res.success) {
        toast.success(`Collaboration invitation sent to ${selectedStudent.user.name}!`);
        setSelectedStudent(null);
        setInviteMsg('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <FiUsers className="text-indigo-600" /> Student Team & Collaborator Finder
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Discover project teammates matched by programming languages, hardware skills, and engineering domains.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'students' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Find Student Peers
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'teams' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Open Teams Looking for Members
          </button>
        </div>

        {/* Skill Search Input */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Filter by skill: ESP32, Python..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Searching student profiles..." />
      ) : activeTab === 'students' ? (
        students.length === 0 ? (
          <EmptyState
            title="No students matched your search"
            description="Try clearing your skill filter to view all peer profiles."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((profile) => (
              <div
                key={profile._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-lg flex items-center justify-center">
                      {profile.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-gray-900">{profile.user?.name}</h3>
                      <p className="text-xs text-gray-500">
                        {profile.user?.department?.name || 'Engineering'} • Year {profile.user?.academicYear || '3'}
                      </p>
                    </div>
                  </div>

                  {profile.user?.bio && (
                    <p className="text-xs text-gray-600 line-clamp-2 italic leading-relaxed">
                      "{profile.user.bio}"
                    </p>
                  )}

                  {/* Skills tags */}
                  <div className="pt-2 border-t border-gray-50 space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Technical Skills:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.technicalSkills?.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md"
                        >
                          {s.name} ({s.level})
                        </span>
                      ))}
                      {profile.programmingLanguages?.map((lang, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedStudent(profile)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <FiSend className="w-3.5 h-3.5" /> Invite to Project Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Teams Looking for Members */
        teams.length === 0 ? (
          <EmptyState
            title="No open project teams right now"
            description="Be the first to open a team and post required skill positions."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team._id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-lg transition p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                    Recruiting Members
                  </span>
                  <h3 className="text-base font-black text-gray-900">{team.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{team.description}</p>

                  <div className="pt-2 text-xs text-gray-600 space-y-1">
                    <p>Leader: <strong>{team.leader?.name}</strong></p>
                    <p>Members: <strong>{team.members?.length || 1} / {team.maxMembers || 4}</strong></p>
                  </div>

                  {team.requiredSkills?.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Looking For Skills:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {team.requiredSkills.map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-md">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => toast.success(`Collaboration request submitted to ${team.name}!`)}
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    Request to Join Team
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Invite Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Invite ${selectedStudent.user?.name} to your Team`}
        >
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Select Your Project Team
              </label>
              <select
                value={inviteTeamId}
                onChange={(e) => setInviteTeamId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              >
                <option value="">Select a team...</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Personalized Invitation Message
              </label>
              <textarea
                rows={3}
                value={inviteMsg}
                onChange={(e) => setInviteMsg(e.target.value)}
                placeholder="We are building an autonomous obstacle rover and need your ESP32 interfacing expertise..."
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {sendingInvite ? 'Sending...' : 'Send Team Invitation'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeamFinder;


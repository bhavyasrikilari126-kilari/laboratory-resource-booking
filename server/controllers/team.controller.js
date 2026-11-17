const Team = require('../models/Team');
const TeamInvitation = require('../models/TeamInvitation');
const { AppError } = require('../middleware/errorHandler');

const getTeams = async (req, res, next) => {
  try {
    const { department, search, isOpen } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (isOpen !== undefined) filter.isOpen = isOpen === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const teams = await Team.find(filter)
      .populate('leader', 'name email studentId')
      .populate('members.user', 'name email studentId')
      .populate('project', 'title status')
      .populate('department', 'name code')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email studentId')
      .populate('members.user', 'name email studentId skills')
      .populate('project', 'title description status')
      .populate('department', 'name code');

    if (!team) return next(new AppError('Team not found', 404));

    // Also get pending invitations
    const invitations = await TeamInvitation.find({ team: team._id, status: 'pending' })
      .populate('toUser', 'name email')
      .populate('fromUser', 'name email');

    res.status(200).json({
      success: true,
      data: {
        ...team.toObject(),
        invitations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const createTeam = async (req, res, next) => {
  try {
    const teamData = {
      ...req.body,
      leader: req.user.id,
      members: [{ user: req.user.id, role: 'Leader', joinedAt: new Date() }],
    };

    const team = await Team.create(teamData);

    res.status(201).json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!team) return next(new AppError('Team not found', 404));

    res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return next(new AppError('Team not found', 404));

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { toUserId, type = 'invitation', message } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) return next(new AppError('Team not found', 404));

    const invitation = await TeamInvitation.create({
      team: team._id,
      fromUser: req.user.id,
      toUser: toUserId,
      type,
      message,
    });

    res.status(201).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

const respondToInvitation = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const invitation = await TeamInvitation.findById(req.params.id).populate('team');

    if (!invitation) return next(new AppError('Invitation not found', 404));

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      const team = await Team.findById(invitation.team._id);
      if (team) {
        const userIdToAdd = invitation.type === 'invitation' ? invitation.toUser : invitation.fromUser;
        const exists = team.members.some((m) => m.user.toString() === userIdToAdd.toString());
        if (!exists) {
          team.members.push({ user: userIdToAdd, role: 'Member', joinedAt: new Date() });
          await team.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
};

const findTeams = async (req, res, next) => {
  try {
    const { skill, department } = req.query;
    const filter = { isOpen: true };

    if (department) filter.department = department;
    if (skill) filter.requiredSkills = { $in: [new RegExp(skill, 'i')] };

    const teams = await Team.find(filter)
      .populate('leader', 'name email studentId')
      .populate('department', 'name code')
      .populate('project', 'title status');

    res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  inviteMember,
  respondToInvitation,
  findTeams,
};


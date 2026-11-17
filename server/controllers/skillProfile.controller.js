const SkillProfile = require('../models/SkillProfile');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const getMyProfile = async (req, res, next) => {
  try {
    let profile = await SkillProfile.findOne({ user: req.user.id })
      .populate('user', 'name email department avatar studentId academicYear phone')
      .populate('equipmentExperience.equipment', 'name category')
      .populate('achievements.verifiedBy', 'name');

    if (!profile) {
      // Create default
      profile = await SkillProfile.create({
        user: req.user.id,
        technicalSkills: [],
        programmingLanguages: [],
        projectInterests: [],
        preferredDomains: [],
      });
      profile = await SkillProfile.findById(profile._id).populate('user', 'name email department avatar studentId academicYear');
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    let profile = await SkillProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = await SkillProfile.create({
        ...req.body,
        user: req.user.id,
      });
    } else {
      Object.assign(profile, req.body);
      await profile.save();
    }

    // Also sync skills & programmingLanguages to User model
    if (req.body.skills || req.body.technicalSkills) {
      const skillsArray = req.body.technicalSkills
        ? req.body.technicalSkills.map((s) => (typeof s === 'string' ? s : s.name))
        : req.body.skills;
      await User.findByIdAndUpdate(req.user.id, {
        skills: skillsArray,
        programmingLanguages: req.body.programmingLanguages,
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const searchStudents = async (req, res, next) => {
  try {
    const { skill, language, domain, department } = req.query;
    const filter = { isPublic: true };

    if (skill) {
      filter['technicalSkills.name'] = { $regex: skill, $options: 'i' };
    }
    if (language) {
      filter.programmingLanguages = { $in: [new RegExp(language, 'i')] };
    }
    if (domain) {
      filter.preferredDomains = { $in: [new RegExp(domain, 'i')] };
    }

    const profiles = await SkillProfile.find(filter)
      .populate({
        path: 'user',
        select: 'name email department avatar studentId academicYear',
        match: department ? { department } : {},
      })
      .limit(30);

    const validProfiles = profiles.filter((p) => p.user !== null);

    res.status(200).json({
      success: true,
      data: validProfiles,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  searchStudents,
};


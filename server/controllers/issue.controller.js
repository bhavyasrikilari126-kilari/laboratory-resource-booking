const Issue = require('../models/Issue');
const Equipment = require('../models/Equipment');
const { AppError } = require('../middleware/errorHandler');

const reportIssue = async (req, res, next) => {
  try {
    const issueData = {
      ...req.body,
      reportedBy: req.user.id,
    };

    const issue = await Issue.create(issueData);

    // If equipment damaged, automatically update equipment condition to damaged
    if (issue.equipment && issue.type === 'damaged_equipment') {
      await Equipment.findByIdAndUpdate(issue.equipment, { condition: 'damaged' });
    }

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

const getIssues = async (req, res, next) => {
  try {
    const { status, priority, type, laboratory, assignedTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (type) filter.type = type;
    if (laboratory) filter.laboratory = laboratory;
    if (assignedTo) filter.assignedTo = assignedTo;

    // If technician, prioritize assigned to them or unassigned
    if (req.user.role === 'technician') {
      filter.$or = [{ assignedTo: req.user.id }, { assignedTo: { $exists: false } }, { assignedTo: null }];
    }

    const issues = await Issue.find(filter)
      .populate('laboratory', 'name labNumber')
      .populate('equipment', 'name equipmentId')
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    next(error);
  }
};

const getIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('laboratory', 'name labNumber department')
      .populate('equipment', 'name equipmentId category condition')
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email phone');

    if (!issue) return next(new AppError('Issue not found', 404));

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

const assignIssue = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return next(new AppError('Issue not found', 404));

    issue.assignedTo = assignedTo;
    issue.status = 'assigned';
    await issue.save();

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return next(new AppError('Issue not found', 404));

    issue.status = status;
    await issue.save();

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

const resolveIssue = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return next(new AppError('Issue not found', 404));

    issue.status = 'resolved';
    issue.resolution = resolution;
    issue.resolvedAt = new Date();
    await issue.save();

    // If equipment, restore condition to good/fair
    if (issue.equipment) {
      await Equipment.findByIdAndUpdate(issue.equipment, { condition: 'good' });
    }

    res.status(200).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  report: reportIssue,
  getIssues,
  getIssue,
  assign: assignIssue,
  updateStatus,
  resolve: resolveIssue,
};


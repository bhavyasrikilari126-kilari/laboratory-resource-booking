const Project = require('../models/Project');
const { AppError } = require('../middleware/errorHandler');

const getProjects = async (req, res, next) => {
  try {
    const { status, type, department, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (department) filter.department = department;

    // If student, can see all or their own
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const projects = await Project.find(filter)
      .populate('teamLeader', 'name email studentId')
      .populate('members', 'name email studentId')
      .populate('mentor', 'name email')
      .populate('department', 'name code')
      .populate('requiredEquipment', 'name')
      .populate('requiredLaboratory', 'name labNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamLeader', 'name email studentId')
      .populate('members', 'name email studentId')
      .populate('mentor', 'name email')
      .populate('department', 'name code')
      .populate('requiredEquipment', 'name category availableQuantity')
      .populate('requiredLaboratory', 'name labNumber capacity')
      .populate('tasks.assignedTo', 'name email');

    if (!project) return next(new AppError('Project not found', 404));

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const projectData = {
      ...req.body,
      teamLeader: req.user.id,
      members: req.body.members || [req.user.id],
    };

    if (!projectData.members.includes(req.user.id)) {
      projectData.members.push(req.user.id);
    }

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) return next(new AppError('Project not found', 404));

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    project.members = project.members.filter((m) => m.toString() !== memberId);
    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const addMilestone = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    project.milestones.push(req.body);
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    const milestone = project.milestones.id(milestoneId);
    if (!milestone) return next(new AppError('Milestone not found', 404));

    Object.assign(milestone, req.body);
    if (req.body.status === 'completed' && !milestone.completedAt) {
      milestone.completedAt = new Date();
    }
    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMilestone = async (req, res, next) => {
  try {
    const { milestoneId } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    project.milestones.pull(milestoneId);
    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const addTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    project.tasks.push(req.body);
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    const task = project.tasks.id(taskId);
    if (!task) return next(new AppError('Task not found', 404));

    Object.assign(task, req.body);
    if (req.body.status === 'completed' && !task.completedAt) {
      task.completedAt = new Date();
    }
    await project.save();

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const addDocument = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));

    project.documents.push({
      ...req.body,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    });
    await project.save();

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  addTask,
  updateTask,
  addDocument,
};


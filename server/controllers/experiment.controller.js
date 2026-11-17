const Experiment = require('../models/Experiment');
const { AppError } = require('../middleware/errorHandler');

const getExperiments = async (req, res, next) => {
  try {
    const { laboratory, department, difficulty, search } = req.query;
    const filter = {};

    if (laboratory) filter.laboratory = laboratory;
    if (department) filter.department = department;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } },
      ];
    }

    const experiments = await Experiment.find(filter)
      .populate('laboratory', 'name labNumber')
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .sort('title');

    res.status(200).json({
      success: true,
      data: experiments,
    });
  } catch (error) {
    next(error);
  }
};

const getExperiment = async (req, res, next) => {
  try {
    const experiment = await Experiment.findById(req.params.id)
      .populate('laboratory', 'name labNumber facilities')
      .populate('department', 'name code')
      .populate('createdBy', 'name email');

    if (!experiment) return next(new AppError('Experiment not found', 404));

    res.status(200).json({
      success: true,
      data: experiment,
    });
  } catch (error) {
    next(error);
  }
};

const createExperiment = async (req, res, next) => {
  try {
    const experiment = await Experiment.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: experiment,
    });
  } catch (error) {
    next(error);
  }
};

const updateExperiment = async (req, res, next) => {
  try {
    const experiment = await Experiment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!experiment) return next(new AppError('Experiment not found', 404));

    res.status(200).json({
      success: true,
      data: experiment,
    });
  } catch (error) {
    next(error);
  }
};

const deleteExperiment = async (req, res, next) => {
  try {
    const experiment = await Experiment.findByIdAndDelete(req.params.id);
    if (!experiment) return next(new AppError('Experiment not found', 404));

    res.status(200).json({
      success: true,
      message: 'Experiment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExperiments,
  getExperiment,
  createExperiment,
  updateExperiment,
  deleteExperiment,
};


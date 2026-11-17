const BookingPolicy = require('../models/BookingPolicy');
const { AppError } = require('../middleware/errorHandler');

const getPolicies = async (req, res, next) => {
  try {
    const policies = await BookingPolicy.find()
      .populate('department', 'name code')
      .populate('laboratory', 'name labNumber');

    res.status(200).json({
      success: true,
      data: policies,
    });
  } catch (error) {
    next(error);
  }
};

const getPolicy = async (req, res, next) => {
  try {
    const policy = await BookingPolicy.findById(req.params.id)
      .populate('department', 'name code')
      .populate('laboratory', 'name labNumber');

    if (!policy) return next(new AppError('Policy not found', 404));

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

const createPolicy = async (req, res, next) => {
  try {
    const policy = await BookingPolicy.create(req.body);
    res.status(201).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

const updatePolicy = async (req, res, next) => {
  try {
    const policy = await BookingPolicy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!policy) return next(new AppError('Policy not found', 404));

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    next(error);
  }
};

const deletePolicy = async (req, res, next) => {
  try {
    const policy = await BookingPolicy.findByIdAndDelete(req.params.id);
    if (!policy) return next(new AppError('Policy not found', 404));

    res.status(200).json({
      success: true,
      message: 'Policy deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
};


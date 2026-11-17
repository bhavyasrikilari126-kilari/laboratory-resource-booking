const Department = require('../models/Department');
const { AppError } = require('../middleware/errorHandler');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).populate('headOfDepartment', 'name email');
    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('headOfDepartment', 'name email');
    if (!department) return next(new AppError('Department not found', 404));

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) return next(new AppError('Department not found', 404));

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!department) return next(new AppError('Department not found', 404));

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};


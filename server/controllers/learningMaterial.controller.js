const LearningMaterial = require('../models/LearningMaterial');
const { AppError } = require('../middleware/errorHandler');

const getMaterials = async (req, res, next) => {
  try {
    const { laboratory, department, type, search } = req.query;
    const filter = { isPublished: true };

    if (laboratory) filter.laboratory = laboratory;
    if (department) filter.department = department;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const materials = await LearningMaterial.find(filter)
      .populate('laboratory', 'name labNumber')
      .populate('department', 'name code')
      .populate('uploadedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    next(error);
  }
};

const getMaterial = async (req, res, next) => {
  try {
    const material = await LearningMaterial.findById(req.params.id)
      .populate('laboratory', 'name labNumber')
      .populate('department', 'name code')
      .populate('uploadedBy', 'name email');

    if (!material) return next(new AppError('Learning material not found', 404));

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const material = await LearningMaterial.create({
      ...req.body,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const material = await LearningMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!material) return next(new AppError('Learning material not found', 404));

    res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const material = await LearningMaterial.findByIdAndDelete(req.params.id);
    if (!material) return next(new AppError('Learning material not found', 404));

    res.status(200).json({
      success: true,
      message: 'Learning material deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};


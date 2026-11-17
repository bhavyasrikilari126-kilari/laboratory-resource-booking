const InnovationShowcase = require('../models/InnovationShowcase');
const { AppError } = require('../middleware/errorHandler');

const getShowcases = async (req, res, next) => {
  try {
    const { category, tag, search } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const showcases = await InnovationShowcase.find(filter)
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title type status')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: showcases,
    });
  } catch (error) {
    next(error);
  }
};

const getShowcase = async (req, res, next) => {
  try {
    const showcase = await InnovationShowcase.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title description type status members')
      .populate('feedback.user', 'name role avatar');

    if (!showcase) return next(new AppError('Showcase item not found', 404));

    res.status(200).json({
      success: true,
      data: showcase,
    });
  } catch (error) {
    next(error);
  }
};

const createShowcase = async (req, res, next) => {
  try {
    const showcase = await InnovationShowcase.create({
      ...req.body,
      createdBy: req.user.id,
      isPublished: true,
    });

    res.status(201).json({
      success: true,
      data: showcase,
    });
  } catch (error) {
    next(error);
  }
};

const updateShowcase = async (req, res, next) => {
  try {
    const showcase = await InnovationShowcase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!showcase) return next(new AppError('Showcase item not found', 404));

    res.status(200).json({
      success: true,
      data: showcase,
    });
  } catch (error) {
    next(error);
  }
};

const deleteShowcase = async (req, res, next) => {
  try {
    const showcase = await InnovationShowcase.findByIdAndDelete(req.params.id);
    if (!showcase) return next(new AppError('Showcase item not found', 404));

    res.status(200).json({
      success: true,
      message: 'Showcase deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

const likeShowcase = async (req, res, next) => {
  try {
    const showcase = await InnovationShowcase.findById(req.params.id);
    if (!showcase) return next(new AppError('Showcase item not found', 404));

    const userIdStr = req.user.id.toString();
    const alreadyLiked = showcase.likes.some((id) => id.toString() === userIdStr);

    if (alreadyLiked) {
      showcase.likes = showcase.likes.filter((id) => id.toString() !== userIdStr);
    } else {
      showcase.likes.push(req.user.id);
    }

    await showcase.save();

    res.status(200).json({
      success: true,
      data: {
        likesCount: showcase.likes.length,
        isLiked: !alreadyLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

const addFeedback = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const showcase = await InnovationShowcase.findById(req.params.id);
    if (!showcase) return next(new AppError('Showcase item not found', 404));

    showcase.feedback.push({
      user: req.user.id,
      comment,
      createdAt: new Date(),
    });

    await showcase.save();

    res.status(201).json({
      success: true,
      data: showcase,
    });
  } catch (error) {
    next(error);
  }
};

const getFeatured = async (req, res, next) => {
  try {
    const featured = await InnovationShowcase.find({ isPublished: true, isFeatured: true })
      .populate('createdBy', 'name email avatar')
      .limit(6)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: featured,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShowcases,
  getShowcase,
  createShowcase,
  updateShowcase,
  deleteShowcase,
  likeShowcase,
  addFeedback,
  getFeatured,
};


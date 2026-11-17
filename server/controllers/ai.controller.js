const aiService = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');

const recommend = async (req, res, next) => {
  try {
    const { description, projectDescription } = req.body;
    const text = description || projectDescription;

    if (!text) {
      return next(new AppError('Please provide a project description', 400));
    }

    const recommendations = await aiService.recommendResources(text);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return next(new AppError('Please provide a search query', 400));
    }

    const results = await aiService.smartSearch(query);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const estimateResources = async (req, res, next) => {
  try {
    const { description, title, department, duration, type, teamSize } = req.body;

    const estimates = await aiService.estimateResources({
      description: description || title,
      department,
      duration,
      type,
      teamSize,
    });

    res.status(200).json({
      success: true,
      data: estimates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommend,
  search,
  estimateResources,
};


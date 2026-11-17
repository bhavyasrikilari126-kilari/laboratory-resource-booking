const AuditLog = require('../models/AuditLog');
const { paginate, buildPaginationResponse } = require('../utils/helpers');

const getLogs = async (req, res, next) => {
  try {
    const { action, resourceType, user, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (user) filter.user = user;

    const total = await AuditLog.countDocuments(filter);
    const { query } = paginate(
      AuditLog.find(filter).populate('user', 'name email role').sort('-timestamp'),
      page,
      limit
    );

    const logs = await query;

    res.status(200).json({
      success: true,
      data: logs,
      pagination: buildPaginationResponse(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLogs,
};


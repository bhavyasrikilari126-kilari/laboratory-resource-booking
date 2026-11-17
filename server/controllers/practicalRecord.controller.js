const PracticalRecord = require('../models/PracticalRecord');
const { AppError } = require('../middleware/errorHandler');

const submitRecord = async (req, res, next) => {
  try {
    const record = await PracticalRecord.create({
      ...req.body,
      student: req.user.id,
      submittedAt: new Date(),
      status: 'submitted',
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

const getMyRecords = async (req, res, next) => {
  try {
    const records = await PracticalRecord.find({ student: req.user.id })
      .populate('experiment', 'title difficulty course')
      .populate('laboratory', 'name labNumber')
      .populate('gradedBy', 'name email')
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { experiment, laboratory, status } = req.query;
    const filter = {};
    if (experiment) filter.experiment = experiment;
    if (laboratory) filter.laboratory = laboratory;
    if (status) filter.status = status;

    const records = await PracticalRecord.find(filter)
      .populate('student', 'name studentId email')
      .populate('experiment', 'title difficulty course')
      .populate('laboratory', 'name labNumber')
      .sort('-submittedAt');

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

const gradeRecord = async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;
    const record = await PracticalRecord.findById(req.params.id);

    if (!record) return next(new AppError('Practical record not found', 404));

    record.grade = grade;
    record.feedback = feedback;
    record.gradedBy = req.user.id;
    record.status = 'graded';
    await record.save();

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submit: submitRecord,
  getMyRecords,
  getRecords,
  grade: gradeRecord,
};


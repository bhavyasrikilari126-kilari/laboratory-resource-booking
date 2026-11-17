const Booking = require('../models/Booking');
const Laboratory = require('../models/Laboratory');
const Equipment = require('../models/Equipment');
const EquipmentReservation = require('../models/EquipmentReservation');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Department = require('../models/Department');

const getOverview = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLabs = await Laboratory.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({ date: { $gte: today } });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const totalEquipment = await Equipment.countDocuments({ isActive: true });
    const openIssues = await Issue.countDocuments({ status: { $in: ['reported', 'assigned', 'in_progress'] } });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalLabs,
        totalBookings,
        todayBookings,
        pendingBookings,
        totalEquipment,
        openIssues,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLabUtilization = async (req, res, next) => {
  try {
    const labs = await Laboratory.find({ isActive: true }).select('name labNumber department');
    const utilizationData = await Promise.all(
      labs.map(async (lab) => {
        const bookingsCount = await Booking.countDocuments({
          laboratory: lab._id,
          status: { $in: ['approved', 'checked_in', 'completed'] },
        });

        return {
          _id: lab._id,
          name: lab.name,
          labNumber: lab.labNumber,
          bookingsCount,
          utilizationScore: Math.min(100, bookingsCount * 10),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: utilizationData.sort((a, b) => b.bookingsCount - a.bookingsCount),
    });
  } catch (error) {
    next(error);
  }
};

const getEquipmentUsage = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({ isActive: true }).select('name category totalQuantity availableQuantity');
    const usageData = await Promise.all(
      equipment.map(async (item) => {
        const reservationCount = await EquipmentReservation.countDocuments({ equipment: item._id });
        const utilizedQty = item.totalQuantity - item.availableQuantity;

        return {
          _id: item._id,
          name: item.name,
          category: item.category,
          totalQuantity: item.totalQuantity,
          availableQuantity: item.availableQuantity,
          utilizedQuantity: utilizedQty,
          reservationCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usageData.sort((a, b) => b.reservationCount - a.reservationCount),
    });
  } catch (error) {
    next(error);
  }
};

const getBookingTrends = async (req, res, next) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 },
    ]);

    const formatted = bookings.map((b) => ({
      date: `${b._id.year}-${String(b._id.month).padStart(2, '0')}-${String(b._id.day).padStart(2, '0')}`,
      count: b.count,
      completed: b.completed,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true });
    const stats = await Promise.all(
      departments.map(async (dept) => {
        const labsCount = await Laboratory.countDocuments({ department: dept._id, isActive: true });
        const equipmentCount = await Equipment.countDocuments({ department: dept._id, isActive: true });
        const studentsCount = await User.countDocuments({ department: dept._id, role: 'student' });

        return {
          _id: dept._id,
          name: dept.name,
          code: dept.code,
          labsCount,
          equipmentCount,
          studentsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getLabUtilization,
  getEquipmentUsage,
  getBookingTrends,
  getDepartmentStats,
};


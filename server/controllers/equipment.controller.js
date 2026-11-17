const Equipment = require('../models/Equipment');
const EquipmentReservation = require('../models/EquipmentReservation');
const { AppError } = require('../middleware/errorHandler');
const { generateReservationRef } = require('../utils/helpers');
const { generateQRCode } = require('../utils/qrGenerator');

const getEquipment = async (req, res, next) => {
  try {
    const { category, department, laboratory, condition, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (department) filter.department = department;
    if (laboratory) filter.laboratory = laboratory;
    if (condition) filter.condition = condition;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { equipmentId: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const items = await Equipment.find(filter)
      .populate('department', 'name code')
      .populate('laboratory', 'name labNumber')
      .sort('name');

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

const getEquipmentItem = async (req, res, next) => {
  try {
    const item = await Equipment.findById(req.params.id)
      .populate('department', 'name code')
      .populate('laboratory', 'name labNumber');

    if (!item) return next(new AppError('Equipment item not found', 404));

    // Get active reservations for this item
    const reservations = await EquipmentReservation.find({
      equipment: item._id,
      status: { $in: ['pending', 'approved', 'issued'] },
    }).populate('student', 'name studentId email');

    res.status(200).json({
      success: true,
      data: {
        ...item.toObject(),
        reservations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const reserveEquipment = async (req, res, next) => {
  try {
    const { quantity = 1, bookingId, notes } = req.body;
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment || !equipment.isActive) {
      return next(new AppError('Equipment not found or unavailable', 404));
    }

    if (equipment.condition === 'damaged' || equipment.condition === 'under_maintenance') {
      return next(new AppError(`Cannot reserve equipment that is ${equipment.condition}`, 400));
    }

    if (equipment.availableQuantity < quantity) {
      return next(new AppError(`Only ${equipment.availableQuantity} items available for reservation`, 400));
    }

    // Decrement available quantity
    equipment.availableQuantity -= Number(quantity);
    await equipment.save();

    const reservation = await EquipmentReservation.create({
      reservationRef: generateReservationRef(),
      student: req.user.id,
      equipment: equipment._id,
      booking: bookingId || undefined,
      quantity: Number(quantity),
      status: 'pending',
      notes,
    });

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

const issueEquipment = async (req, res, next) => {
  try {
    const { reservationId, notes } = req.body;
    let reservation;

    if (reservationId) {
      reservation = await EquipmentReservation.findById(reservationId);
    } else {
      reservation = await EquipmentReservation.findOne({
        equipment: req.params.id,
        status: { $in: ['pending', 'approved'] },
      });
    }

    if (!reservation) {
      return next(new AppError('Active reservation not found', 404));
    }

    reservation.status = 'issued';
    reservation.issuedBy = req.user.id;
    reservation.issuedAt = new Date();
    if (notes) reservation.notes = notes;
    await reservation.save();

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

const returnEquipment = async (req, res, next) => {
  try {
    const { reservationId, returnCondition, notes } = req.body;
    const reservation = await EquipmentReservation.findById(reservationId);

    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }

    if (reservation.status !== 'issued') {
      return next(new AppError('Only issued equipment can be returned', 400));
    }

    reservation.status = 'returned';
    reservation.returnedAt = new Date();
    reservation.returnCondition = returnCondition || 'good';
    reservation.returnVerifiedBy = req.user.id;
    if (notes) reservation.notes = notes;
    await reservation.save();

    // Increment available quantity
    const equipment = await Equipment.findById(reservation.equipment);
    if (equipment) {
      equipment.availableQuantity = Math.min(
        equipment.totalQuantity,
        equipment.availableQuantity + reservation.quantity
      );
      if (returnCondition === 'damaged') {
        equipment.condition = 'damaged';
      }
      await equipment.save();
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    next(error);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.availableQuantity && data.totalQuantity) {
      data.availableQuantity = data.totalQuantity;
    }

    // Generate QR code for equipment
    const qrData = {
      equipmentId: data.equipmentId,
      name: data.name,
      category: data.category,
    };
    data.qrCode = await generateQRCode(qrData);

    const item = await Equipment.create(data);

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) return next(new AppError('Equipment not found', 404));

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipment,
  getEquipmentItem,
  reserveEquipment,
  issueEquipment,
  returnEquipment,
  createEquipment,
  updateEquipment,
};


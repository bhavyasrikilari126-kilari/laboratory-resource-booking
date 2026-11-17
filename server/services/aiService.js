const Equipment = require('../models/Equipment');
const Laboratory = require('../models/Laboratory');
const Booking = require('../models/Booking');

const EQUIPMENT_KEYWORD_MAP = {
  electronics: ['oscilloscope', 'multimeter', 'function generator', 'power supply', 'breadboard', 'soldering station', 'logic analyzer', 'spectrum analyzer'],
  robotics: ['arduino', 'raspberry pi', 'servo motor', 'sensor kit', 'motor driver', '3d printer', 'microcontroller'],
  iot: ['esp32', 'esp8266', 'arduino', 'raspberry pi', 'sensor', 'wifi module', 'zigbee', 'bluetooth module', 'relay'],
  networking: ['router', 'switch', 'cable tester', 'crimping tool', 'network analyzer', 'server rack'],
  programming: ['computer', 'monitor', 'keyboard', 'mouse', 'laptop', 'workstation'],
  mechanical: ['lathe', 'milling machine', 'drill press', 'caliper', 'micrometer', 'cnc machine'],
  embedded: ['microcontroller', 'fpga', 'arm processor', 'jtag debugger', 'logic analyzer', 'oscilloscope'],
  ai: ['gpu workstation', 'computer', 'high performance server', 'laptop'],
  web: ['computer', 'monitor', 'laptop', 'workstation'],
  mobile: ['computer', 'android device', 'ios device', 'laptop'],
  power: ['power supply', 'transformer', 'multimeter', 'wattmeter', 'ammeter', 'voltmeter'],
  communication: ['antenna', 'spectrum analyzer', 'signal generator', 'oscilloscope', 'network analyzer'],
  vlsi: ['fpga', 'logic analyzer', 'oscilloscope', 'ic tester', 'breadboard'],
  civil: ['total station', 'theodolite', 'level', 'chain', 'tape', 'compass'],
};

const recommendResources = async (projectDescription) => {
  try {
    const descLower = projectDescription.toLowerCase();
    const matchedKeywords = new Set();

    for (const [domain, equipment] of Object.entries(EQUIPMENT_KEYWORD_MAP)) {
      if (descLower.includes(domain)) {
        equipment.forEach((kw) => matchedKeywords.add(kw));
      }
    }

    const words = descLower.split(/\s+/);
    for (const word of words) {
      for (const [domain, equipment] of Object.entries(EQUIPMENT_KEYWORD_MAP)) {
        if (domain.includes(word) || word.includes(domain)) {
          equipment.forEach((kw) => matchedKeywords.add(kw));
        }
      }
    }

    if (matchedKeywords.size === 0) {
      matchedKeywords.add('computer');
      matchedKeywords.add('laptop');
    }

    const keywordArray = Array.from(matchedKeywords);

    const regexPatterns = keywordArray.map((kw) => new RegExp(kw, 'i'));

    const recommendedEquipment = await Equipment.find({
      isActive: true,
      $or: [
        { name: { $in: regexPatterns } },
        { category: { $in: regexPatterns } },
        { description: { $in: regexPatterns } },
      ],
    })
      .populate('laboratory', 'name labNumber')
      .populate('department', 'name code')
      .limit(20);

    const labKeywords = [];
    if (descLower.includes('electronics') || descLower.includes('circuit'))
      labKeywords.push(/electronics/i, /circuit/i);
    if (descLower.includes('computer') || descLower.includes('programming') || descLower.includes('software'))
      labKeywords.push(/computer/i, /programming/i, /software/i);
    if (descLower.includes('network'))
      labKeywords.push(/network/i);
    if (descLower.includes('mechanical') || descLower.includes('workshop'))
      labKeywords.push(/mechanical/i, /workshop/i);
    if (descLower.includes('iot') || descLower.includes('embedded'))
      labKeywords.push(/iot/i, /embedded/i);

    let recommendedLabs = [];
    if (labKeywords.length > 0) {
      recommendedLabs = await Laboratory.find({
        isActive: true,
        $or: [
          { name: { $in: labKeywords } },
          { description: { $in: labKeywords } },
          { facilities: { $in: labKeywords } },
        ],
      })
        .populate('department', 'name code')
        .limit(10);
    }

    if (recommendedLabs.length === 0) {
      recommendedLabs = await Laboratory.find({
        isActive: true,
        status: 'available',
      })
        .populate('department', 'name code')
        .limit(5);
    }

    return {
      matchedKeywords: keywordArray,
      equipment: recommendedEquipment.map((eq) => ({
        id: eq._id,
        name: eq.name,
        category: eq.category,
        available: eq.availableQuantity,
        total: eq.totalQuantity,
        condition: eq.condition,
        laboratory: eq.laboratory,
        department: eq.department,
      })),
      laboratories: recommendedLabs.map((lab) => ({
        id: lab._id,
        name: lab.name,
        labNumber: lab.labNumber,
        capacity: lab.capacity,
        status: lab.status,
        department: lab.department,
        facilities: lab.facilities,
      })),
    };
  } catch (error) {
    console.error('AI recommend error:', error);
    throw error;
  }
};

const smartSearch = async (query) => {
  try {
    const queryLower = query.toLowerCase();

    let labType = null;
    let date = null;
    let startTime = null;
    let endTime = null;
    const equipmentKeywords = [];

    const labTypes = [
      'electronics', 'computer', 'network', 'mechanical', 'physics',
      'chemistry', 'biology', 'iot', 'robotics', 'embedded', 'vlsi',
      'communication', 'power', 'software', 'programming',
    ];
    for (const lt of labTypes) {
      if (queryLower.includes(lt)) {
        labType = lt;
        break;
      }
    }

    if (queryLower.includes('tomorrow')) {
      date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(0, 0, 0, 0);
    } else if (queryLower.includes('today')) {
      date = new Date();
      date.setHours(0, 0, 0, 0);
    } else {
      const dateMatch = queryLower.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1;
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
        date = new Date(year, month, day);
      }
    }

    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi;
    const times = [];
    let match;
    while ((match = timeRegex.exec(queryLower)) !== null) {
      let hour = parseInt(match[1]);
      const minute = match[2] ? parseInt(match[2]) : 0;
      const period = match[3];
      if (period === 'pm' && hour < 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
    if (times.length >= 2) {
      startTime = times[0];
      endTime = times[1];
    } else if (times.length === 1) {
      startTime = times[0];
    }

    const knownEquipment = [
      'oscilloscope', 'multimeter', 'arduino', 'raspberry pi', 'esp32',
      'esp8266', 'breadboard', 'sensor', 'motor', 'servo', 'relay',
      'router', 'switch', 'fpga', '3d printer', 'soldering',
      'power supply', 'function generator', 'laptop', 'computer',
    ];
    for (const eq of knownEquipment) {
      if (queryLower.includes(eq)) {
        equipmentKeywords.push(eq);
      }
    }

    const labQuery = { isActive: true };
    if (labType) {
      labQuery.$or = [
        { name: new RegExp(labType, 'i') },
        { description: new RegExp(labType, 'i') },
        { facilities: new RegExp(labType, 'i') },
      ];
    }

    const labs = await Laboratory.find(labQuery)
      .populate('department', 'name code')
      .populate('facultyInCharge', 'name email')
      .limit(10);

    let equipment = [];
    if (equipmentKeywords.length > 0) {
      const eqPatterns = equipmentKeywords.map((kw) => new RegExp(kw, 'i'));
      equipment = await Equipment.find({
        isActive: true,
        $or: [
          { name: { $in: eqPatterns } },
          { category: { $in: eqPatterns } },
        ],
      })
        .populate('laboratory', 'name labNumber')
        .limit(10);
    }

    let availability = null;
    if (date && labs.length > 0) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const labIds = labs.map((l) => l._id);

      const bookingFilter = {
        laboratory: { $in: labIds },
        date: { $gte: dateStart, $lte: dateEnd },
        status: { $in: ['approved', 'checked_in', 'pending'] },
      };

      if (startTime && endTime) {
        bookingFilter.startTime = { $lt: endTime };
        bookingFilter.endTime = { $gt: startTime };
      }

      const existingBookings = await Booking.find(bookingFilter).select('laboratory startTime endTime');
      const bookedLabIds = new Set(existingBookings.map((b) => b.laboratory.toString()));

      availability = labs.map((lab) => ({
        lab: { id: lab._id, name: lab.name, labNumber: lab.labNumber },
        isAvailable: !bookedLabIds.has(lab._id.toString()),
      }));
    }

    return {
      parsedQuery: {
        labType,
        date: date ? date.toISOString().split('T')[0] : null,
        startTime,
        endTime,
        equipmentKeywords,
      },
      laboratories: labs,
      equipment,
      availability,
    };
  } catch (error) {
    console.error('Smart search error:', error);
    throw error;
  }
};

const estimateResources = async (projectRequirements) => {
  try {
    const { description, teamSize, duration, type } = projectRequirements;

    const recommendation = await recommendResources(description || '');

    const estimates = {
      equipment: [],
      laboratories: [],
      summary: {
        totalEquipmentNeeded: 0,
        availableEquipment: 0,
        unavailableEquipment: 0,
        alternativesAvailable: 0,
      },
    };

    for (const eq of recommendation.equipment) {
      const status =
        eq.available > 0 ? 'available' : 'unavailable';

      let alternatives = [];
      if (status === 'unavailable') {
        alternatives = await Equipment.find({
          isActive: true,
          category: eq.category,
          availableQuantity: { $gt: 0 },
          _id: { $ne: eq.id },
        })
          .select('name availableQuantity laboratory')
          .populate('laboratory', 'name')
          .limit(3);
      }

      estimates.equipment.push({
        ...eq,
        status,
        quantityNeeded: Math.min(teamSize || 1, eq.total),
        alternatives: alternatives.map((alt) => ({
          id: alt._id,
          name: alt.name,
          available: alt.availableQuantity,
          laboratory: alt.laboratory,
        })),
      });

      estimates.summary.totalEquipmentNeeded++;
      if (status === 'available') estimates.summary.availableEquipment++;
      else {
        estimates.summary.unavailableEquipment++;
        if (alternatives.length > 0) estimates.summary.alternativesAvailable++;
      }
    }

    for (const lab of recommendation.laboratories) {
      estimates.laboratories.push({
        ...lab,
        suitability: lab.capacity >= (teamSize || 1) ? 'suitable' : 'too_small',
        recommendedSessionsPerWeek: type === 'major' ? 3 : 2,
        estimatedTotalSessions: Math.ceil((duration || 30) / 7) * (type === 'major' ? 3 : 2),
      });
    }

    return estimates;
  } catch (error) {
    console.error('Resource estimation error:', error);
    throw error;
  }
};

module.exports = {
  recommendResources,
  smartSearch,
  estimateResources,
  EQUIPMENT_KEYWORD_MAP,
};

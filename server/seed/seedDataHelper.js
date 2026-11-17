const User = require('../models/User');
const Department = require('../models/Department');
const Laboratory = require('../models/Laboratory');
const Equipment = require('../models/Equipment');
const Booking = require('../models/Booking');
const BookingPolicy = require('../models/BookingPolicy');
const Experiment = require('../models/Experiment');
const LearningMaterial = require('../models/LearningMaterial');
const Announcement = require('../models/Announcement');
const InnovationShowcase = require('../models/InnovationShowcase');
const FacultyProfile = require('../models/FacultyProfile');
const SkillProfile = require('../models/SkillProfile');
const { generateQRCode } = require('../utils/qrGenerator');

const runSeed = async () => {
  // 1. Create Departments
  const depts = await Department.create([
    { name: 'Computer Science and Engineering', code: 'CSE', description: 'Department of Computer Science & Engineering' },
    { name: 'Electronics and Communication Engineering', code: 'ECE', description: 'Department of Electronics & Communication' },
    { name: 'Electrical and Electronics Engineering', code: 'EEE', description: 'Department of Electrical & Electronics' },
    { name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
    { name: 'Civil Engineering', code: 'CE', description: 'Department of Civil Engineering' },
  ]);

  const cseDept = depts[0];
  const eceDept = depts[1];
  const eeeDept = depts[2];

  // 2. Create Users
  const adminUser = await User.create({
    name: 'System Administrator',
    email: 'admin@smartlab.com',
    password: 'admin123',
    role: 'admin',
    employeeId: 'ADM-001',
    phone: '+1 555-0100',
  });

  const facultyUser = await User.create({
    name: 'Dr. Sarah Jenkins',
    email: 'faculty@smartlab.com',
    password: 'faculty123',
    role: 'faculty',
    department: cseDept._id,
    employeeId: 'FAC-CSE-01',
    phone: '+1 555-0101',
    skills: ['Distributed Systems', 'Cloud Computing', 'IoT Architecture'],
  });

  const eceFaculty = await User.create({
    name: 'Prof. Rajesh Sharma',
    email: 'prof.sharma@smartlab.com',
    password: 'faculty123',
    role: 'faculty',
    department: eceDept._id,
    employeeId: 'FAC-ECE-02',
    phone: '+1 555-0102',
    skills: ['Embedded Systems', 'Robotics', 'VLSI Design'],
  });

  const techUser = await User.create({
    name: 'John Miller',
    email: 'tech@smartlab.com',
    password: 'tech123',
    role: 'technician',
    department: eceDept._id,
    employeeId: 'TECH-01',
    phone: '+1 555-0103',
  });

  const studentUser = await User.create({
    name: 'Alex Rivera',
    email: 'student@smartlab.com',
    password: 'student123',
    role: 'student',
    department: cseDept._id,
    studentId: 'STU-2023-042',
    phone: '+1 555-0104',
    academicYear: 3,
    skills: ['React', 'Node.js', 'Python', 'C++', 'IoT'],
    programmingLanguages: ['JavaScript', 'Python', 'C++', 'TypeScript'],
    bio: 'Junior CSE student interested in IoT smart devices and robotics automation.',
  });

  const studentUser2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@smartlab.com',
    password: 'student123',
    role: 'student',
    department: eceDept._id,
    studentId: 'STU-2023-088',
    phone: '+1 555-0105',
    academicYear: 3,
    skills: ['Circuit Design', 'ESP32', 'Robotics', 'MATLAB'],
    programmingLanguages: ['C', 'C++', 'Python'],
    bio: 'Electronics enthusiast passionate about motor controllers and smart sensors.',
  });

  cseDept.headOfDepartment = facultyUser._id;
  await cseDept.save();
  eceDept.headOfDepartment = eceFaculty._id;
  await eceDept.save();

  // 3. Create Faculty Profiles
  await FacultyProfile.create([
    {
      user: facultyUser._id,
      specializations: ['Cloud Systems', 'IoT Architecture', 'Microservices'],
      researchInterests: ['Edge Computing', 'Automated Resource Scheduling'],
      qualifications: ['Ph.D. Computer Science - MIT', 'M.Tech Software Systems'],
      isMentoringAvailable: true,
      maxMentees: 8,
      currentMentees: 2,
      officeHours: [
        { day: 'Tuesday', startTime: '14:00', endTime: '16:00' },
        { day: 'Thursday', startTime: '10:00', endTime: '12:00' },
      ],
      bio: 'Dr. Jenkins leads the distributed computing lab and mentors innovation projects.',
    },
    {
      user: eceFaculty._id,
      specializations: ['Embedded Systems', 'Robotics', 'Sensor Networks'],
      researchInterests: ['Autonomous Robotics', 'Motor Control Algorithms'],
      qualifications: ['Ph.D. Robotics & Mechatronics', 'B.Tech ECE'],
      isMentoringAvailable: true,
      maxMentees: 10,
      currentMentees: 4,
      officeHours: [
        { day: 'Monday', startTime: '11:00', endTime: '13:00' },
        { day: 'Wednesday', startTime: '15:00', endTime: '17:00' },
      ],
      bio: 'Prof. Sharma specializes in robotics kits, microcontrollers, and hardware interfacing.',
    },
  ]);

  // 4. Create Skill Profile
  await SkillProfile.create({
    user: studentUser._id,
    technicalSkills: [
      { name: 'IoT Systems', level: 'intermediate' },
      { name: 'React.js', level: 'advanced' },
      { name: 'ESP32 Interfacing', level: 'intermediate' },
    ],
    programmingLanguages: ['JavaScript', 'Python', 'C++'],
    projectInterests: ['Smart Home Automation', 'Autonomous Roaming Rover', 'Energy Tracking'],
    preferredDomains: ['IoT', 'Robotics', 'Web Applications'],
    completedExperiments: 6,
    projectsCompleted: 2,
    labSessionsAttended: 14,
    isPublic: true,
    achievements: [
      {
        title: "Dean's Innovation Honor Roll",
        description: 'Awarded for exceptional prototype in College Hackathon 2024',
        verifiedBy: facultyUser._id,
        isVerified: true,
        date: new Date(),
      },
    ],
  });

  // 5. Create Laboratories
  const labs = await Laboratory.create([
    {
      name: 'Advanced IoT & Embedded Systems Lab',
      department: eceDept._id,
      labNumber: 'ECE-301',
      description: 'Equipped with cutting-edge microcontrollers, wireless sensor modules, and rapid hardware debugging testbenches.',
      capacity: 40,
      facilities: ['High Speed Wi-Fi', 'Oscilloscope Benches', 'Soldering Stations', 'Smart Display Monitors'],
      operatingHours: { open: '08:30', close: '18:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      facultyInCharge: eceFaculty._id,
      status: 'available',
      isActive: true,
    },
    {
      name: 'Robotics & Automation Laboratory',
      department: eceDept._id,
      labNumber: 'ECE-204',
      description: 'Facility for robotic arm development, mobile robotics test tracks, and motor driving setups.',
      capacity: 35,
      facilities: ['Test Track', 'DC Power Distribution', '3D Printers', 'Motor Test Bench'],
      operatingHours: { open: '09:00', close: '17:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      facultyInCharge: eceFaculty._id,
      status: 'available',
      isActive: true,
    },
    {
      name: 'AI & High Performance Computing Lab',
      department: cseDept._id,
      labNumber: 'CSE-402',
      description: 'Equipped with GPU-accelerated workstations for Deep Learning, Computer Vision, and parallel simulation models.',
      capacity: 50,
      facilities: ['NVIDIA GPU Workstations', 'Gigabit LAN', 'Air Conditioned Server Rack', 'Dual Monitors'],
      operatingHours: { open: '08:00', close: '20:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
      facultyInCharge: facultyUser._id,
      status: 'available',
      isActive: true,
    },
    {
      name: 'Cyber Security & Networks Lab',
      department: cseDept._id,
      labNumber: 'CSE-201',
      description: 'Specialized lab for network penetration testing, managed switches, routers, and protocol analyzers.',
      capacity: 45,
      facilities: ['Cisco Routers', 'Managed Switches', 'Isolated Test Subnet', 'Hardware Firewalls'],
      operatingHours: { open: '09:00', close: '17:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      facultyInCharge: facultyUser._id,
      status: 'available',
      isActive: true,
    },
  ]);

  const iotLab = labs[0];
  const roboticsLab = labs[1];
  const aiLab = labs[2];

  // 6. Create Equipment
  const equipmentItems = [
    {
      name: 'ESP32 Wi-Fi & Bluetooth Dual-Core Board',
      equipmentId: 'EQ-ESP32-01',
      department: eceDept._id,
      laboratory: iotLab._id,
      category: 'Microcontroller',
      description: '30-pin ESP-WROOM-32 development board with built-in antenna and USB-UART CP2102.',
      totalQuantity: 30,
      availableQuantity: 28,
      condition: 'good',
      serialNumber: 'SN-ESP-2024-001',
      isReservable: true,
    },
    {
      name: 'Arduino Uno R3 Microcontroller Kit',
      equipmentId: 'EQ-ARD-01',
      department: eceDept._id,
      laboratory: iotLab._id,
      category: 'Microcontroller',
      description: 'ATmega328P based standard prototyping kit with USB connector and breadboard.',
      totalQuantity: 40,
      availableQuantity: 38,
      condition: 'good',
      serialNumber: 'SN-ARD-2024-040',
      isReservable: true,
    },
    {
      name: 'Raspberry Pi 4 Model B (4GB RAM)',
      equipmentId: 'EQ-RPI4-01',
      department: cseDept._id,
      laboratory: aiLab._id,
      category: 'Single Board Computer',
      description: 'Quad core 64-bit SoC, dual 4K micro-HDMI outputs, Gigabit Ethernet.',
      totalQuantity: 20,
      availableQuantity: 18,
      condition: 'good',
      serialNumber: 'SN-RPI-4B-01',
      isReservable: true,
    },
    {
      name: 'L298N Dual H-Bridge Motor Driver Module',
      equipmentId: 'EQ-L298N-01',
      department: eceDept._id,
      laboratory: roboticsLab._id,
      category: 'Motor Driver',
      description: 'High power motor driver for driving DC and Stepper motors up to 2A per channel.',
      totalQuantity: 25,
      availableQuantity: 24,
      condition: 'good',
      isReservable: true,
    },
    {
      name: '12V DC High Torque Geared Motor (300 RPM)',
      equipmentId: 'EQ-DCMOT-01',
      department: eceDept._id,
      laboratory: roboticsLab._id,
      category: 'Actuator',
      description: 'Metal gear motor suitable for all-terrain robotics chassis and speed control tasks.',
      totalQuantity: 30,
      availableQuantity: 28,
      condition: 'good',
      isReservable: true,
    },
    {
      name: 'Digital Storage Oscilloscope 100MHz (2-Channel)',
      equipmentId: 'EQ-DSO-01',
      department: eceDept._id,
      laboratory: iotLab._id,
      category: 'Testing Equipment',
      description: '1GSa/s real-time sampling rate, color TFT LCD, USB waveform capture.',
      totalQuantity: 15,
      availableQuantity: 15,
      condition: 'good',
      serialNumber: 'SN-DSO-RIGOL-01',
      isReservable: true,
    },
    {
      name: 'True RMS Digital Multimeter',
      equipmentId: 'EQ-DMM-01',
      department: eceDept._id,
      laboratory: iotLab._id,
      category: 'Testing Equipment',
      description: 'Measures AC/DC voltage, current, resistance, capacitance, frequency, and continuity.',
      totalQuantity: 45,
      availableQuantity: 43,
      condition: 'good',
      isReservable: true,
    },
    {
      name: 'NVIDIA Jetson Nano Developer Kit',
      equipmentId: 'EQ-JETSON-01',
      department: cseDept._id,
      laboratory: aiLab._id,
      category: 'AI Edge Device',
      description: '128-core Maxwell GPU for accelerated edge inference and neural network deployment.',
      totalQuantity: 10,
      availableQuantity: 9,
      condition: 'good',
      isReservable: true,
    },
  ];

  for (const item of equipmentItems) {
    try {
      item.qrCode = await generateQRCode({ equipmentId: item.equipmentId, name: item.name });
    } catch (e) {
      item.qrCode = '';
    }
    await Equipment.create(item);
  }

  // 7. Booking Policies
  await BookingPolicy.create([
    {
      name: 'General Student Lab Reservation Policy',
      department: eceDept._id,
      maxDurationMinutes: 180,
      maxBookingsPerDay: 2,
      maxBookingsPerMonth: 12,
      advanceBookingDays: 7,
      cancellationDeadlineHours: 2,
      requiresFacultyApproval: true,
      allowedRoles: ['student', 'faculty'],
      isActive: true,
    },
  ]);

  // 8. Experiments
  await Experiment.create([
    {
      title: 'PWM Speed Control of DC Motor using ESP32 & L298N',
      description: 'Learn pulse width modulation techniques to regulate DC motor rotational velocity and direction using ESP32 GPIOs.',
      laboratory: iotLab._id,
      department: eceDept._id,
      course: 'EC-305: Embedded Systems Design',
      difficulty: 'intermediate',
      estimatedDuration: 120,
      objectives: [
        'Understand PWM signal generation using ESP32 LEDC peripherals.',
        'Interface the L298N dual H-bridge motor driver to an external 12V supply.',
        'Implement bidirectional speed ramping using potentiometer inputs.',
      ],
      materials: ['ESP32 Board', 'L298N Motor Driver', '12V DC Motor', '10k Potentiometer'],
      vivaQuestions: [
        { question: 'What is the role of flyback diodes in an H-bridge driver?', answer: 'To dissipate inductive voltage spikes caused when motor windings switch off.' },
      ],
      createdBy: eceFaculty._id,
    },
  ]);

  // 9. Learning Materials
  await LearningMaterial.create([
    {
      title: 'ESP32 Hardware Pinout & Peripherals Reference Manual',
      type: 'manual',
      description: 'Comprehensive guide covering GPIO pin mapping, ADC, DAC, I2C, SPI, and UART configurations.',
      content: 'The ESP32 features 34 GPIO pins with hardware PWM, capacitive touch sensors, ADC channels, and dual I2C buses...',
      laboratory: iotLab._id,
      department: eceDept._id,
      course: 'EC-305',
      uploadedBy: eceFaculty._id,
      tags: ['ESP32', 'Pinout', 'GPIO'],
      isPublished: true,
    },
  ]);

  // 10. Announcements
  await Announcement.create([
    {
      title: 'Annual College Innovation & Hardware Hackathon 2024',
      content: 'Registration is now open for SMART-HACK 2024! Reserve labs and equipment early.',
      department: cseDept._id,
      publishedBy: adminUser._id,
      targetRoles: ['student', 'faculty'],
      priority: 'high',
      isActive: true,
    },
  ]);

  // 11. Innovation Showcase
  await InnovationShowcase.create([
    {
      title: 'Smart Solar-Powered Autonomous Greenhouse Monitor',
      description: 'An IoT edge monitoring station utilizing ESP32, soil capacitive sensors, and solar battery charging.',
      createdBy: studentUser._id,
      tags: ['IoT', 'Solar', 'Agriculture', 'ESP32'],
      category: 'IoT & Smart Systems',
      likes: [studentUser2._id],
      isFeatured: true,
      isPublished: true,
    },
  ]);
};

module.exports = { runSeed };


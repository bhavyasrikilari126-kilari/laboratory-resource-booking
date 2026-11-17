const mongoose = require('mongoose');
require('dotenv').config();

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

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Laboratory.deleteMany({}),
      Equipment.deleteMany({}),
      Booking.deleteMany({}),
      BookingPolicy.deleteMany({}),
      Experiment.deleteMany({}),
      LearningMaterial.deleteMany({}),
      Announcement.deleteMany({}),
      InnovationShowcase.deleteMany({}),
      FacultyProfile.deleteMany({}),
      SkillProfile.deleteMany({}),
    ]);

    // 1. Create Departments
    console.log('Creating Departments...');
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
    console.log('Creating Users...');
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

    // Update department heads
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

    // 4. Create Skill Profile for Alex Rivera
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
          title: 'Dean\'s Innovation Honor Roll',
          description: 'Awarded for exceptional prototype in College Hackathon 2024',
          verifiedBy: facultyUser._id,
          isVerified: true,
          date: new Date(),
        },
      ],
    });

    // 5. Create Laboratories
    console.log('Creating Laboratories...');
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
      {
        name: 'Microprocessor & VLSI Lab',
        department: eeeDept._id,
        labNumber: 'EEE-105',
        description: 'FPGA development boards, logic analyzers, and digital signal processing trainers.',
        capacity: 30,
        facilities: ['Logic Analyzers', 'Xilinx FPGA Kits', 'Function Generators'],
        operatingHours: { open: '09:00', close: '16:30', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
        status: 'available',
        isActive: true,
      },
    ]);

    const iotLab = labs[0];
    const roboticsLab = labs[1];
    const aiLab = labs[2];

    // 6. Create Equipment
    console.log('Creating Equipment Inventory...');
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
        name: 'Ultrasonic Distance Sensor Module (HC-SR04)',
        equipmentId: 'EQ-HCSR04-01',
        department: eceDept._id,
        laboratory: roboticsLab._id,
        category: 'Sensor',
        description: '2cm to 400cm non-contact distance measuring module with 3mm precision.',
        totalQuantity: 50,
        availableQuantity: 48,
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
      item.qrCode = await generateQRCode({ equipmentId: item.equipmentId, name: item.name });
      await Equipment.create(item);
    }

    // 7. Create Booking Policies
    console.log('Creating Booking Policies...');
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
      {
        name: 'CSE AI Lab Advanced Reservation Policy',
        department: cseDept._id,
        maxDurationMinutes: 240,
        maxBookingsPerDay: 1,
        maxBookingsPerMonth: 10,
        advanceBookingDays: 14,
        cancellationDeadlineHours: 4,
        requiresFacultyApproval: true,
        allowedRoles: ['student', 'faculty'],
        isActive: true,
      },
    ]);

    // 8. Create Experiments
    console.log('Creating Experiments...');
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
        procedure: [
          'Wire the ESP32 GPIO pins 16 and 17 to IN1 and IN2 of the L298N driver.',
          'Connect the motor terminals to OUT1 and OUT2.',
          'Common the ground of ESP32 and external 12V power supply.',
          'Upload the PWM motor control sketch and calibrate speed step values.',
        ],
        materials: ['ESP32 Board', 'L298N Motor Driver', '12V DC Motor', '10k Potentiometer', 'Jumper Wires'],
        safetyGuidelines: ['Verify motor voltage rating does not exceed supply', 'Keep fingers clear of rotating motor shafts'],
        vivaQuestions: [
          { question: 'What is the role of flyback diodes in an H-bridge driver?', answer: 'To dissipate inductive voltage spikes caused when motor windings switch off.' },
          { question: 'What is the duty cycle in PWM?', answer: 'The percentage of one period in which a signal is active high.' },
        ],
        createdBy: eceFaculty._id,
      },
      {
        title: 'Real-Time Edge Computer Vision with OpenCV and Jetson Nano',
        description: 'Deploy a lightweight YOLO object detector on Jetson Nano using CSI camera inputs.',
        laboratory: aiLab._id,
        department: cseDept._id,
        course: 'CS-412: Machine Learning Systems',
        difficulty: 'advanced',
        estimatedDuration: 180,
        objectives: [
          'Configure TensorRT optimizations for edge models.',
          'Measure frame rates and latency under varied batch dimensions.',
        ],
        procedure: [
          'Mount CSI camera sensor to the Jetson Nano slot.',
          'Load pre-trained quantized weights with TensorRT.',
          'Execute inference loop and log real-time FPS.',
        ],
        materials: ['NVIDIA Jetson Nano', 'IMX219 CSI Camera', '5V 4A Power Barrel Adapter'],
        vivaQuestions: [
          { question: 'How does TensorRT accelerate neural network inference?', answer: 'By layer fusion, precision calibration (FP16/INT8), and kernel auto-tuning for NVIDIA GPUs.' },
        ],
        createdBy: facultyUser._id,
      },
    ]);

    // 9. Create Learning Materials
    console.log('Creating Learning Materials...');
    await LearningMaterial.create([
      {
        title: 'ESP32 Hardware Pinout & Peripherals Reference Manual',
        type: 'manual',
        description: 'Comprehensive guide covering GPIO pin mapping, ADC attenuation levels, DAC, I2C, SPI, and UART configurations.',
        content: 'The ESP32 features 34 GPIO pins with hardware PWM, capacitive touch sensors, ADC channels, and dual I2C buses...',
        laboratory: iotLab._id,
        department: eceDept._id,
        course: 'EC-305',
        uploadedBy: eceFaculty._id,
        tags: ['ESP32', 'Pinout', 'GPIO', 'Peripherals'],
        isPublished: true,
      },
      {
        title: 'Laboratory Safety & Soldering Practice Checklist',
        type: 'checklist',
        description: 'Standard protocol checklist before operating soldering irons, heat guns, and high-current power supplies.',
        content: '1. Inspect grounding wire. 2. Wear safety eye protection. 3. Turn on fume extraction hood. 4. Never leave iron unattended.',
        laboratory: iotLab._id,
        department: eceDept._id,
        uploadedBy: eceFaculty._id,
        tags: ['Safety', 'Soldering', 'Protocol'],
        isPublished: true,
      },
    ]);

    // 10. Create Announcements
    console.log('Creating Announcements...');
    await Announcement.create([
      {
        title: 'Annual College Innovation & Hardware Hackathon 2024',
        content: 'Registration is now open for SMART-HACK 2024! Teams can reserve dedicated laboratory spaces and prototype hardware components directly through SMARTLAB.',
        department: cseDept._id,
        publishedBy: adminUser._id,
        targetRoles: ['student', 'faculty'],
        priority: 'high',
        isActive: true,
      },
      {
        title: 'Routine Maintenance Notice: Robotics Lab Track Upgrades',
        content: 'Robotics Lab (ECE-204) will undergo track resurfacing and electrical upgrades this Saturday. All slots on Saturday will be rescheduled.',
        department: eceDept._id,
        publishedBy: eceFaculty._id,
        targetRoles: ['student', 'faculty', 'technician'],
        priority: 'medium',
        isActive: true,
      },
    ]);

    // 11. Create Innovation Showcase items
    console.log('Creating Innovation Showcase items...');
    await InnovationShowcase.create([
      {
        title: 'Smart Solar-Powered Autonomous Greenhouse Monitor',
        description: 'An IoT edge monitoring station utilizing ESP32, soil capacitive sensors, and solar battery charging to maintain microclimate precision.',
        createdBy: studentUser._id,
        tags: ['IoT', 'Solar', 'Agriculture', 'ESP32'],
        category: 'IoT & Smart Systems',
        likes: [studentUser2._id, facultyUser._id],
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Gesture-Controlled Robotic Manipulator Arm',
        description: 'A 5-DOF robotic arm controlled via wearable flex sensor gloves with low-latency Bluetooth RFCOMM telemetry.',
        createdBy: studentUser2._id,
        tags: ['Robotics', 'Mechatronics', 'Arduino'],
        category: 'Robotics & Automation',
        likes: [studentUser._id, eceFaculty._id],
        isFeatured: true,
        isPublished: true,
      },
    ]);

    console.log('Seeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('DEFAULT LOGINS:');
    console.log('Admin:       admin@smartlab.com    / admin123');
    console.log('Faculty:     faculty@smartlab.com  / faculty123');
    console.log('Technician:  tech@smartlab.com     / tech123');
    console.log('Student:     student@smartlab.com  / student123');
    console.log('Student 2:   priya@smartlab.com    / student123');
    console.log('--------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();


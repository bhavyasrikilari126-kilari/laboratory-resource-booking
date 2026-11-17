const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartlab';
  
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`Connected to external MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.log('Local/external MongoDB not detected. Starting embedded MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      console.log(`Embedded MongoDB started at: ${memoryUri}`);

      const conn = await mongoose.connect(memoryUri);
      console.log(`Connected to embedded MongoDB: ${conn.connection.host}`);

      // Run automatic seed if DB is empty
      const User = require('../models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('Database is empty. Automatically triggering data seed...');
        try {
          const seedModule = require('../seed/seedDataHelper');
          await seedModule.runSeed();
          console.log('Auto-seeding completed successfully!');
        } catch (seedErr) {
          console.error('Auto-seed error:', seedErr);
        }
      }

      return conn;
    } catch (memErr) {
      console.error('Failed to initialize MongoDB connection:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

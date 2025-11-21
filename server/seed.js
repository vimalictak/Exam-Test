const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./src/models/Admin');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await Admin.deleteMany();

    const adminUser = {
      username: 'admin',
      password: 'password123',
    };

    await Admin.create(adminUser);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();

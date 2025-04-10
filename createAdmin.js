const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

mongoose.connect('mongodb+srv://miko:miko2007@cluster0.tqdfc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    const adminUser = new User({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin', // Admin roli
    });
    await adminUser.save();
    console.log('Admin foydalanuvchi qo‘shildi');
  } catch (err) {
    console.error('Xato:', err);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
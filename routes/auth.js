const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      logger.warn(`Ro‘yxatdan o‘tish urinishi: Maydonlar to‘liq emas, email: ${email}`);
      return res.status(400).json({ error: 'Email, parol va ismni kiriting' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Ro‘yxatdan o‘tish urinishi: ${email} allaqachon mavjud`);
      return res.status(400).json({ error: 'Bu email allaqachon ro‘yxatdan o‘tgan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });
    await newUser.save();

    logger.info(`Yangi foydalanuvchi ro‘yxatdan o‘tdi: ${email}`);
    res.status(201).json({
      message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
      user: { email, name, role: 'user' }
    });
  } catch (err) {
    logger.error(`Ro‘yxatdan o‘tish xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

// Admin login endpoint
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn(`Admin kirish urinishi: Maydonlar to‘liq emas, email: ${email}`);
      return res.status(400).json({ error: 'Email va parolni kiriting' });
    }

    const user = await User.findOne({ email, role: 'admin' });
    if (!user) {
      logger.warn(`Admin kirish urinishi: ${email} topilmadi yoki admin emas`);
      return res.status(400).json({ error: 'Noto‘g‘ri email yoki parol' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Admin kirish urinishi: ${email} uchun noto‘g‘ri parol`);
      return res.status(400).json({ error: 'Noto‘g‘ri email yoki parol' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    logger.info(`Admin kirdi: ${email}`);
    res.json({ message: 'Admin tizimga kirdi!', token });
  } catch (err) {
    logger.error(`Admin kirish xatosi: ${err.message}`);
    res.status(500).json({ error: 'Server xatosi: ' + err.message });
  }
});

module.exports = router;
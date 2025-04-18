const jwt = require('jsonwebtoken');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Faqat adminlar uchun autentifikatsiya middleware
const adminMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    logger.warn('Autentifikatsiya urinishi: Token topilmadi');
    return res.status(401).json({ error: 'Tizimga kirish kerak' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      logger.warn(`Admin marshrutiga kirish urinishi: ${decoded.email} admin emas`);
      return res.status(403).json({ error: 'Faqat adminlar uchun!' });
    }
    req.user = decoded; // decoded ichida userId, email va role bo‘ladi
    logger.info(`Token tekshirildi: ${decoded.email}`);
    next();
  } catch (err) {
    logger.error(`Token tekshirish xatosi: ${err.message}`);
    res.status(401).json({ error: 'Noto‘g‘ri token' });
  }
};

module.exports = { adminMiddleware };
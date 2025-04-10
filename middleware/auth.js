const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Tizimga kirish kerak' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded ichida userId, email va role bo‘ladi
    next();
  } catch (err) {
    res.status(401).json({ error: 'Noto‘g‘ri token' });
  }
};

module.exports = authMiddleware;
  const mongoose = require('mongoose');

  const UserSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // Faqat "user" yoki "admin" bo‘lishi mumkin
      default: 'user', // Yangi foydalanuvchilar default sifatida "user" bo‘ladi
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  module.exports = mongoose.model('User', UserSchema);
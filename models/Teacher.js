const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: 'default-image.jpg', // Agar rasm kiritilmasa
  },
  bio: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // Yaratilgan va yangilangan vaqtni qo‘shish uchun

module.exports = mongoose.model('Teacher', teacherSchema);
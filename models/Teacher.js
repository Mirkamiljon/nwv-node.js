const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: 'default-image.jpg',
  },
  bio: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Teacher', teacherSchema);
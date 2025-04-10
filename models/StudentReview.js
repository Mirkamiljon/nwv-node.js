const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: { type: String, required: true },
  text: { type: String, required: true },
});

module.exports = mongoose.model('StudentReview', reviewSchema);
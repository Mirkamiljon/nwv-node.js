const mongoose = require('mongoose');

const advantageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model('Advantage', advantageSchema);
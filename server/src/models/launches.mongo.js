const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },

  launchDate: {
    type: Date,
    required: true,
  },

  mission: {
    type: String,
    required: true,
  },

  target: {
    type: String,
  },

  rocket: {
    type: String,
    required: true,
  },

  upcoming: {
    type: Boolean,
    required: true,
  },

  success: {
    type: Boolean,
    required: true,
    default: true,
  },

  customers: [String],
});

module.exports = mongoose.model('Launch', launchesSchema);

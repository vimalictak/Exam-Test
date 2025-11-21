const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },

  verificationToken: { type: String },
  isTokenUsed: { type: Boolean, default: false },

  emailVerified: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending',
  },
}, { timestamps: true });

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;

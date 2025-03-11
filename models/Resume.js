// models/Resume.js
const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user_id: { type: String },
  text: { type: String, required: true },
  skills: { type: [String], default: [] },
  experience: { type: [String], default: [] },
  education: { type: [String], default: [] },
  embedding: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Resume', ResumeSchema);

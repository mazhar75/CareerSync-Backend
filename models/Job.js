// models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  company: { type: String, default: 'Unknown Company' },
  title: { type: String, default: 'Job Title' },
  text: { type: String, required: true },
  required_skills: { type: [String], default: [] },
  embedding: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);

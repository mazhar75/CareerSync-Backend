// models/MatchScore.js
const mongoose = require('mongoose');

const MatchScoreSchema = new mongoose.Schema({
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  match_score: { type: Number, required: true },
  recommendations: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('MatchScore', MatchScoreSchema);

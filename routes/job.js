// routes/job.js
const express = require('express');
const Job = require('../models/Job');

const router = express.Router();

// GET /job/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (error) {
    console.error("Error in GET /job/:id", error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

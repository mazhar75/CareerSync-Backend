// routes/resume.js
const express = require('express');
const Resume = require('../models/Resume');

const router = express.Router();

// GET /resume/:id
router.get('/:id', async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    console.error("Error in GET /resume/:id", error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

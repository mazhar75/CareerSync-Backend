// routes/upload.js
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const Job = require('../models/Job');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Dummy NER extraction function to get skills, experience, and education
function extractDataFromText(text) {
  const skills = text.match(/(JavaScript|Node\.js|React|Python|Java)/gi) || [];
  const experience = text.toLowerCase().includes('experience') ? ['Some Experience'] : [];
  const education = text.toLowerCase().includes('university') ? ['Some Education'] : [];
  return { skills, experience, education };
}

// Function to extract text from a file based on its mimetype
async function extractText(fileBuffer, fileMimetype) {
  if (fileMimetype === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (fileMimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else {
    return fileBuffer.toString();
  }
}

// POST /upload
router.post('/', upload.fields([{ name: 'resume' }, { name: 'jobDesc' }]), async (req, res) => {
  try {
    // Process resume file
    const resumeFile = req.files['resume'] ? req.files['resume'][0] : null;
    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }
    const resumeText = await extractText(resumeFile.buffer, resumeFile.mimetype);
    const resumeData = extractDataFromText(resumeText);
    const newResume = new Resume({
      text: resumeText,
      skills: resumeData.skills,
      experience: resumeData.experience,
      education: resumeData.education,
    });
    const savedResume = await newResume.save();

    // Process job description input based on mode (upload or paste)
    const jobDescMode = req.body.jobDescMode;
    let jobDescText = '';
    if (jobDescMode === 'upload') {
      const jobDescFile = req.files['jobDesc'] ? req.files['jobDesc'][0] : null;
      if (!jobDescFile) {
        return res.status(400).json({ error: 'Job description file is required' });
      }
      jobDescText = await extractText(jobDescFile.buffer, jobDescFile.mimetype);
    } else if (jobDescMode === 'paste') {
      jobDescText = req.body.jobDescText;
      if (!jobDescText) {
        return res.status(400).json({ error: 'Job description text is required' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid jobDescMode' });
    }
    
    const jobData = extractDataFromText(jobDescText);
    const newJob = new Job({
      text: jobDescText,
      required_skills: jobData.skills, // For demo purposes, we use the extracted skills as required skills.
    });
    const savedJob = await newJob.save();

    res.json({ resumeId: savedResume._id, jobId: savedJob._id });
  } catch (error) {
    console.error("Error in /upload:", error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

module.exports = router;

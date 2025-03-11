const express = require('express');
const axios = require('axios');
const HfInference = require('@huggingface/inference');
const Resume = require('../models/Resume');
const Job = require('../models/Job');

const router = express.Router();

// Initialize Hugging Face Inference with your token (ensure HF_TOKEN is set in .env)
const hf = new HfInference.HfInference(process.env.HF_TOKEN);
const MODEL_NAME = 'deepseek-ai/deepseek-r1';

/**
 * Summarize text using facebook/bart-large-cnn.
 */
async function summarizeText(text) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );
    return response.data[0].summary_text;
  } catch (error) {
    console.error("Error summarizing text:", error.response ? error.response.data : error);
    throw error;
  }
}

/**
 * Safely parse a JSON string from model output.
 */
function safeJsonParse(str) {
  try {
    const jsonStr = str.match(/{.*}/s)[0];
    return JSON.parse(jsonStr);
  } catch (e) {
    return { error: "Failed to parse analysis" };
  }
}

/**
 * Return a random motivational phrase.
 */
function randomMotivationalPhrase() {
  const phrases = [
    "Great potential!",
    "You've got this!",
    "Strong foundation!",
    "Impressive background!",
    "You're a great match!",
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get recommendations from deepseek-ai/DeepSeek-R1.
 * The prompt includes both summarized resume and job description,
 * asking for an analysis that highlights missing skills/experience, strengths,
 * and offers motivating, constructive advice.
 */
async function getRecommendations(summarizedResume, summarizedJob) {
  const prompt = `Analyze the following summarized resume and job description. First, determine the match percentage between the candidate and the job. Then:
1. List 5 key improvement suggestions for the resume.
2. Highlight 3 strongest matching points.
3. Provide motivational encouragement based on the match.
4. Add a positive closing statement.

Summarized Resume: ${summarizedResume}

Summarized Job Description: ${summarizedJob}

Format the response as JSON with the following keys:
{
  "matchPercentage": number,
  "suggestions": string[],
  "strengths": string[],
  "motivation": string,
  "positiveClosing": string
}`;
  
  const response = await hf.textGeneration({
    model: MODEL_NAME,
    inputs: prompt,
    parameters: {
      max_new_tokens: 700,
      temperature: 0.3,
      return_full_text: false
    }
  });
  console.log(response.generated_text);
  return response.generated_text;
}

// GET /recommendations/:resumeId/:jobId
router.get('/:resumeId/:jobId', async (req, res) => {
  try {
    const { resumeId, jobId } = req.params;
    const resume = await Resume.findById(resumeId);
    const job = await Job.findById(jobId);
    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or Job not found' });
    }
    
    // Summarize the texts to focus on key details
    const summarizedResume = await summarizeText(resume.text);
    const summarizedJob = await summarizeText(job.text);
    
    // Generate recommendations using DeepSeek-R1 model
    const generatedText = await getRecommendations(summarizedResume, summarizedJob);
    const analysis = safeJsonParse(generatedText);
    
    res.json({
      recommendations: {
        ...analysis,
        motivationalMessage: `${randomMotivationalPhrase()} ${analysis.motivation || ""}`
      }
    });
  } catch (error) {
    console.error("Error in GET /recommendations", error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;

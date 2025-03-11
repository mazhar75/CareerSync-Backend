// routes/matchScore.js
const express = require('express');
const axios = require('axios');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const MatchScore = require('../models/MatchScore');

const router = express.Router();

/**
 * Summarize text using facebook/bart-large-cnn.
 */
async function summarizeText(text) {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    { 
      inputs: text,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.2
      }
    },
    { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
  );
  return response.data[0].summary_text;
}

// Get semantic similarity using paraphrase-mpnet-base-v2 via sentence-similarity pipeline
async function getSemanticSimilarity(source, target) {
  // Summarize both texts to focus on key information
  const sanitizedSource = await summarizeText(source);
  const sanitizedTarget = await summarizeText(target);
  console.log("Source Summary:", sanitizedSource);
  console.log("Target Summary:", sanitizedTarget);
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2?pipeline=sentence-similarity",
      { 
        source_sentence: sanitizedSource, 
        sentences: [sanitizedTarget] 
      },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );
    // Expecting an array of similarity scores, e.g. [0.85]
    return response.data[0]; // return first score
  } catch (error) {
    console.error("Error fetching semantic similarity:", error.response ? error.response.data : error);
    throw error;
  }
}

// Simple skill extraction using a predefined list of common skills.
function extractSkills(text) {
  const skillsList = [
    // Programming Languages
    "Java", "Python", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP", "R", "Dart", "Perl", "Scala", "Shell Scripting",  
    // Web Development
    "HTML", "CSS", "SASS", "Bootstrap", "Tailwind CSS", "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte",  
    // Backend Development
    "Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Ruby on Rails", "GraphQL",  
    // Databases
    "SQL", "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Firebase", "Redis", "Cassandra", "DynamoDB", "Oracle Database", "Neo4j",  
    // Cloud & DevOps
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "CI/CD", "Ansible",  
    // Machine Learning & AI
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "NLTK", "Hugging Face Transformers", "GPT APIs",  
    // Cybersecurity
    "Ethical Hacking", "Penetration Testing", "Cryptography", "Security Auditing", "Metasploit", "Wireshark", "Burp Suite",  
    // Mobile Development
    "Android Development", "iOS Development", "Flutter", "React Native", "SwiftUI", "Jetpack Compose",  
    // Software Development
    "OOP", "Data Structures", "Algorithms", "Design Patterns", "Microservices", "REST API", "GraphQL API",  
    // System Administration & Networking
    "Linux", "Windows Server", "Bash Scripting", "Networking", "DNS", "HTTP/HTTPS", "Nginx", "Apache",  
    // Tools & Misc
    "Git", "GitHub", "Bitbucket", "JIRA", "Postman", "Figma", "Adobe XD", "Unity", "Blender", "WebAssembly"  
  ];
  const lowerText = text.toLowerCase();
  return skillsList.filter(skill => lowerText.includes(skill.toLowerCase()));
}

/**
 * Compute rule-based skill score: percentage of job-required skills found in the resume.
 */
function calculateSkillScore(jobText, resumeText) {
  const jobSkills = extractSkills(jobText);
  const resumeSkills = extractSkills(resumeText);
  if (jobSkills.length === 0) return 100;
  const matched = jobSkills.filter(skill =>
    resumeSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  ).length;
  return (matched / jobSkills.length) * 100;
}

/**
 * Extract additional non-skill requirements from the job description.
 */
function extractRequirements(jobText) {
  const requirements = {
    experience: [],
    education: [],
    expertise: []
  };
  
  // Experience phrases like "1-3 years", "3 years of experience"
  const expRegex = /(\d+\s*(?:-\s*\d+)?\s*year[s]?)/gi;
  const expMatches = jobText.match(expRegex);
  if (expMatches) {
    requirements.experience = expMatches;
  }
  
  // Education phrases, e.g. "B.Sc", "Bachelor", "Computer Science"
  const eduRegex = /\b(B\.?Sc\.?|Bachelor(?:'s)?|Master(?:'s)?|Ph\.?D\.?)\s*(?:in\s*[A-Za-z\s]+)?/gi;
  const eduMatches = jobText.match(eduRegex);
  if (eduMatches) {
    requirements.education = eduMatches;
  }
  
  // Expertise phrases like "expertise in", "proficient in", "experienced in"
  const expInRegex = /\b(?:expertise|proficient|experienced)\s+in\s+([A-Za-z0-9 ,]+)/gi;
  let match;
  while ((match = expInRegex.exec(jobText)) !== null) {
    requirements.expertise.push(match[1].trim());
  }
  
  return requirements;
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
    "You're a great match!"
  ];
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Get a random improvement suggestion template for a given skill.
 */
function getImprovementSuggestion(skill) {
  const templates = [
    `It might be beneficial to highlight a project or role where you utilized ${skill}.`,
    `Consider adding a dedicated section that showcases your experience with ${skill}.`,
    `If you have any certification or training in ${skill}, be sure to mention it.`,
    `Demonstrate your proficiency in ${skill} by detailing specific accomplishments.`,
    `Include examples of how you've applied ${skill} in practical scenarios.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Get a random strength phrase for a given skill.
 */
function getStrengthPhrase(skill) {
  const templates = [
    `Proficient in ${skill}`,
    `Experienced with ${skill}`,
    `${skill} expertise is evident`,
    `Strong in ${skill}`,
    `Demonstrates solid skills in ${skill}`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Hybrid recommendation generator.
 * Combines rule-based suggestions for missing skills and non-skill requirements,
 * and uses varied templates to produce more natural, tailored output.
 */
function getHybridRecommendations(resumeText, jobText) {
  // Extract skills from both resume and job description.
  const jobSkills = [...new Set(extractSkills(jobText))];
  const resumeSkills = [...new Set(extractSkills(resumeText))];
  
  // Identify missing skills (in job but not in resume).
  const missingSkills = jobSkills.filter(skill =>
    !resumeSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  );
  
  // Identify matching skills.
  const matchingSkills = jobSkills.filter(skill =>
    resumeSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
  );
  
  // Extract additional non-skill requirements.
  const requirements = extractRequirements(jobText);
  
  // Build improvement suggestions for missing skills.
  let skillSuggestions = [];
  if (missingSkills.length > 0) {
    skillSuggestions = missingSkills.map(skill => getImprovementSuggestion(skill));
  } else {
    skillSuggestions.push("Your skills appear to cover all key requirements.");
  }
  
  // Additional suggestions for non-skill requirements.
  let additionalSuggestions = [];
  if (requirements.experience.length > 0 && !/\d+\s*year/i.test(resumeText)) {
    additionalSuggestions.push("Include detailed work experience to meet the required years.");
  }
  if (requirements.education.length > 0 && !/computer science/i.test(resumeText)) {
    additionalSuggestions.push("Emphasize your educational background or relevant coursework.");
  }
  if (requirements.expertise.length > 0) {
    const dedupedExpertise = [...new Set(requirements.expertise)];
    const missingExpertise = dedupedExpertise.filter(exp => 
      !resumeText.toLowerCase().includes(exp.toLowerCase())
    );
    if (missingExpertise.length > 0) {
      additionalSuggestions.push(`Mention expertise in ${missingExpertise.join(', ')} if applicable.`);
    }
  }
  
  // Combine all suggestions.
  const allSuggestions = [...skillSuggestions, ...additionalSuggestions];
  
  // Build strengths using varied templates.
  const strengths = matchingSkills.length > 0
    ? matchingSkills.map(skill => getStrengthPhrase(skill))
    : ["No directly matching skills identified."];
  
  // Fixed motivational and closing statements.
  const motivation = "Keep enhancing your expertise and practical experience to excel in your career.";
  const positiveClosing = "Overall, your resume shows promise—focus on these areas to further strengthen your profile!";
  
  // Construct final recommendation text.
  return `${randomMotivationalPhrase()}
Improvement Suggestions: ${allSuggestions.join(' ')}
Strengths: ${strengths.join(', ')}
Motivation: ${motivation}
Closing: ${positiveClosing}`;
}

/**
 * Combine semantic similarity and rule-based skill score to get final match score.
 */
async function getFinalMatchScore(resumeText, jobText) {
  const semanticSimilarity = await getSemanticSimilarity(resumeText, jobText); // value between 0 and 1
  const semanticScore = semanticSimilarity * 100; // convert to percentage
  const ruleBasedScore = calculateSkillScore(jobText, resumeText); // percentage based on skills matching
  const alpha = 0.5; // weight for semantic similarity
  return Math.round(alpha * semanticScore + (1 - alpha) * ruleBasedScore);
}

// GET /match-score/:resumeId/:jobId
router.get('/:resumeId/:jobId', async (req, res) => {
  try {
    const { resumeId, jobId } = req.params;
    const resume = await Resume.findById(resumeId);
    const job = await Job.findById(jobId);
    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or Job not found' });
    }
    
    const finalMatchScore = await getFinalMatchScore(resume.text, job.text);
    const recommendationText = getHybridRecommendations(resume.text, job.text);
    const resume_summery =  await summarizeText(resume.text);
    const job_summery = await summarizeText(job.text);

    // Save match score document with recommendations (stored as a single-element array of strings)
    const matchScoreDoc = new MatchScore({
      resume_id: resume._id,
      job_id: job._id,
      match_score: finalMatchScore,
      recommendations: [recommendationText]
    });
    await matchScoreDoc.save();
    
    res.json({ match_score: finalMatchScore, recommendations: [recommendationText],resume_summary:resume_summery,job_summary: job_summery});
  } catch (error) {
    console.error("Error in GET /match-score", error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;

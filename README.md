# CareerSync Backend

**CareerSync** is an intelligent backend system for an AI-powered job-resume matching platform. It analyzes resumes and job descriptions using a combination of advanced NLP techniques and rule-based processing to compute a match score and generate personalized recommendations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Future Improvements & Cautions](#future-improvements--cautions)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Overview

CareerSync Backend is built with Node.js and Express.js and uses MongoDB for data storage. It processes resumes and job descriptions to:
- Summarize lengthy texts using the `facebook/bart-large-cnn` model.
- Convert text summaries into high-dimensional vectors using the `all-MiniLM-L6-v2` model (via Hugging Face Inference API).
- Calculate semantic similarity (cosine similarity) between resume and job description embeddings.
- Extract and compare skills (and additional requirements such as experience and education) through rule-based logic.
- Generate a hybrid match score and actionable, personalized recommendations.
- Save match reports (including summaries, scores, and recommendations) in the database for later retrieval.

## Features

- **Text Summarization:** Uses Hugging Face’s `facebook/bart-large-cnn` to condense long resumes and job descriptions.
- **Semantic Similarity:** Computes similarity between summarized texts using the `all-MiniLM-L6-v2` model.
- **Rule-Based Skill Extraction:** Extracts a predefined list of skills and additional requirements (experience, education, expertise) from the texts.
- **Hybrid Recommendation Engine:** Combines semantic similarity and rule-based matching to compute a final match score:
  ```
  finalScore = Math.round(alpha * semanticScore + (1 - alpha) * ruleBasedScore)
  ```
- **Personalized Recommendations:** Provides actionable suggestions to help candidates improve their resumes.
- **Data Storage:** Uses MongoDB to store resumes, job descriptions, and match reports.

## Technology Stack

- **Backend Framework:** Node.js, Express.js
- **Database:** MongoDB
- **APIs & AI Models:**
  - Hugging Face Inference API:  
    - `facebook/bart-large-cnn` for text summarization  
    - `sentence-transformers/all-MiniLM-L6-v2` for semantic similarity
- **Other Dependencies:** Axios, dotenv, and more (see `package.json`).

## How It Works

1. **Text Summarization & Vectorization:**  
   The backend summarizes resumes and job descriptions to extract key information. These summaries are then transformed into high-dimensional vectors.

2. **Similarity Analysis:**  
   Cosine similarity is calculated between the vector representations, determining how closely a resume matches a job description.

3. **Skill and Requirement Extraction:**  
   A predefined list is used to extract skills from both documents. In addition, the system extracts non-skill requirements (such as years of experience and educational qualifications) using regular expressions.

4. **Hybrid Recommendation & Score Calculation:**  
   The final match score is computed using:
   ```javascript
   Math.round(alpha * semanticScore + (1 - alpha) * ruleBasedScore)
   ```
   The system also generates personalized recommendations by highlighting missing skills and offering actionable insights.

5. **Data Storage & Response:**  
   The match score, along with resume and job summaries and recommendations, is saved in MongoDB and returned through the API.

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (or yarn)
- A running instance of **MongoDB**

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/mazhar75/CareerSync-Backend.git
   cd CareerSync-Backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory and add the following (replace placeholder values with your actual secrets):
   ```env
   MONGO_URI=your_mongodb_connection_string
   HF_API_KEY=your_huggingface_api_key
   PORT=5000
   ```

4. **Ensure `.env` is in `.gitignore`:**
   Make sure your `.env` file is not pushed to GitHub.

### Running the Application

Start the server:
```bash
npm start
# or
yarn start
```
Your backend will run on the port specified (default is 5000).

## Deployment

For hosting on platforms like Render (or AWS Free Tier), push your clean code (without secrets) to GitHub and configure environment variables on the hosting platform. Render, for example, allows you to choose your branch (master or main) and set environment variables via their dashboard.

## Future Improvements & Cautions

- **Enhanced AI Models:**  
  Future iterations may fine-tune domain-specific models (like BERT/DistilBERT) for more accurate matching and recommendation generation.
- **User Authentication & Dashboard:**  
  Adding secure login and personalized dashboards to improve user experience.
- **Job Recommendation Engine:**  
  Automatic suggestion of suitable job openings based on candidate profiles.
- **Data Privacy & Security:**  
  Implementing stricter measures and encryption for sensitive data.
- **Caution:**  
  Although CareerSync employs advanced AI and rule-based methods, it may not always deliver perfect results. Users should cross-check recommendations and treat them as guidance rather than absolute answers.


---

This README.md provides a comprehensive overview of the CareerSync Backend project, covering all aspects from technology stack and core features to setup, deployment, and future improvements. You can now push this file to your repository, and it will serve as the documentation for your project on GitHub.

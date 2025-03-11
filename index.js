// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import route modules
const uploadRoute = require('./routes/upload');
const resumeRoute = require('./routes/resume');
const jobRoute = require('./routes/job');
const matchScoreRoute = require('./routes/matchScore');
const recommendationsRoute = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Mount routes
app.use('/upload', uploadRoute);
app.use('/resume', resumeRoute);
app.use('/job', jobRoute);
app.use('/match-score', matchScoreRoute);
app.use('/recommendations', recommendationsRoute);
// Default route to check if the server is running
app.get('/', (req, res) => {
  res.send('AI Job Matching Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

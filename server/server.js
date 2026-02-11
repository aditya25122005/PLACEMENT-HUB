const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const contentRoutes = require('./routes/contentRoutes');
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');  
const subjectRoutes = require('./routes/subjectRoutes');
const leetcodeRoutes = require("./routes/leetcodeRoutes");
// Load env variables
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON data
app.use(cors()); // Allow cross-origin requests

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/quiz', quizRoutes); 
app.use('/api/subjects', subjectRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/uploads", express.static("uploads"));


// Simple Test Route
app.get('/', (req, res) => {
    res.send('Placement Hub API Running!');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
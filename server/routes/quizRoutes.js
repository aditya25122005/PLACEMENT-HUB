// server/routes/quizRoutes.js

const express = require('express');
const router = express.Router();
const QuizQuestion = require('../models/QuizQuestion');
const User = require('../models/User'); // User Model is required for score update
const Content=require('../models/Content')
// ======================= 1. STUDENT ROUTES =======================

// 1. GET /api/quiz/topic/:topicName: Fetch approved questions for quiz attempt
router.get('/topic/:topicName', async (req, res) => {
    try {
        // Only fetch approved questions and exclude the correct answer for security
        const questions = await QuizQuestion.find({ 
            topic: req.params.topicName, 
            status: 'approved' 
        }).select('-correctAnswer'); 
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch quiz questions.' });
    }
});

// 2. POST /api/quiz/submit-answers: Calculate score and update user dashboard
router.post('/submit-answers', async (req, res) => {
    // We assume userId, topic, and answers are sent from the frontend
    const { topic, answers, userId } = req.body; 
    let score = 0;
    
    try {
        const questionIds = Object.keys(answers);
        const correctQuestions = await QuizQuestion.find({ _id: { $in: questionIds } });

        // Score calculation logic
        correctQuestions.forEach(q => {
            const submittedIndex = answers[q._id.toString()];
            if (submittedIndex === q.correctAnswer) {
                score += 1;
            }
        });

        // **Dashboard Update Logic (Guaranteed Save)**
        if (userId) { 
            const user = await User.findById(userId);
            if (user) {
                // Find the index to locate the exact score sub-document
                const topicIndex = user.scores.findIndex(s => s.topic === topic);
                let scoreEntry = topicIndex !== -1 ? user.scores[topicIndex] : null;

                // Case 1: Score does not exist (Create New Entry)
                if (!scoreEntry) {
                    user.scores.push({ topic, highScore: score, lastAttempt: Date.now() });
                } 
                // Case 2: Score exists (Update High Score/Date)
                else {
                    // Update only if the score is higher or equal (to update the date)
                    if (score >= scoreEntry.highScore) { 
                        user.scores[topicIndex].highScore = score;
                    }
                    user.scores[topicIndex].lastAttempt = Date.now();

                    // ⚠️ CRITICAL FIX: Mark the array as modified for Mongoose to save changes
                    user.markModified('scores');
                }
                
                await user.save();
            }
        }
        
        res.json({ score, totalQuestions: questionIds.length });
    } catch (error) {
        console.error("Score update error:", error);
        res.status(500).json({ message: 'Score submission and calculation failed.' });
    }
});


// ======================= 2. MODERATOR ROUTES =======================

// 4. POST /api/quiz/add: Moderator adds a new Quiz Question (Pending or Approved)
router.post('/add', async (req, res) => {
    const { topic, questionText, options, correctAnswer, status } = req.body;
    try {
        // Basic validation for options count
        if (!options || options.length !== 4) {
             return res.status(400).json({ message: 'Quiz must have exactly 4 options.' });
        }
        if (correctAnswer === undefined || correctAnswer < 0 || correctAnswer > 3) {
             return res.status(400).json({ message: 'Correct answer index must be between 0 and 3.' });
        }
        
        const newQuiz = await QuizQuestion.create({ 
            topic, 
            questionText, 
            options, 
            correctAnswer, 
            status: status || 'pending' 
        });
        res.status(201).json({ message: 'Quiz question added successfully.', quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add quiz question.' });
    }
});

// 5. GET /api/quiz/pending: Fetch pending quiz questions for moderation
router.get('/pending', async (req, res) => {
    try {
        const pendingQuizzes = await QuizQuestion.find({ status: 'pending' }).sort({ createdAt: 1 });
        res.json(pendingQuizzes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch pending quizzes.' });
    }
});

// 6. PUT /api/quiz/approve/:id: Approve a pending quiz question
router.put('/approve/:id', async (req, res) => {
    try {
        await QuizQuestion.findByIdAndUpdate(req.params.id, { status: 'approved' });
        res.json({ message: 'Quiz approved.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to approve quiz.' });
    }
});

// 7. PUT /api/quiz/reject/:id: Reject a pending quiz question
router.put('/reject/:id', async (req, res) => {
    try {
        const rejectedQuiz = await QuizQuestion.findByIdAndUpdate(
            req.params.id, 
            { status: 'rejected' },
            { new: true }
        );
        
        if (!rejectedQuiz) {
            return res.status(404).json({ message: 'Quiz question not found.' });
        }
        
        res.json({ message: 'Quiz rejected.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to reject quiz.' });
    }
});
// 8. GET /api/quiz/all-dsa: Fetch all approved DSA problems system-wide
router.get('/all-dsa', async (req, res) => {
    try {
        const dsaMaterial = await Content.find({ 
            dsaProblemLink: { $exists: true, $ne: '' },
            status: 'approved',
        })
        // .select('question_text dsaProblemLink youtubeSolutionLink topic');

        res.json(dsaMaterial);
    } catch (error) {
        // Log the actual server error to the console for better debugging
        console.error("SERVER ERROR fetching all DSA:", error);
        res.status(500).json({ message: 'Failed to fetch centralized DSA material.' });
    }
});


// server/routes/quizRoutes.js (Add to existing file)

// 8. GET /api/quiz/all: Get ALL Quiz Questions (Approved, Pending, Rejected)
router.get('/all', async (req, res) => {
    try {
        // Fetch ALL quiz questions without excluding the correct answer
        const allQuizzes = await QuizQuestion.find().sort({ createdAt: -1 });
        res.json(allQuizzes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all quizzes.' });
    }
});

// 9. PUT /api/quiz/:id: Update existing Quiz Question (Edit)
router.put('/:id', async (req, res) => {
    try {
        const updatedQuiz = await QuizQuestion.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, // $set updates only the fields sent in req.body
            { new: true, runValidators: true } 
        );
        if (!updatedQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        res.json({ message: 'Quiz updated successfully.', quiz: updatedQuiz });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update quiz.' });
    }
});

// 10. DELETE /api/quiz/:id: Delete a Quiz Question
router.delete('/:id', async (req, res) => {
    try {
        const deletedQuiz = await QuizQuestion.findByIdAndDelete(req.params.id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found.' });
        }
        res.json({ message: 'Quiz successfully deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete quiz.' });
    }
});


module.exports = router;
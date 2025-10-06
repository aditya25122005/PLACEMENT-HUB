const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
    topic: { 
        type: String, 
        required: true,
        // Update topics to include all subjects for the systematic flow
        enum: ['Aptitude', 'DSA', 'HR', 'Core CS', 'OS', 'DBMS', 'CN'] 
    },
    questionText: { 
        type: String, 
        required: true 
    },
    // MCQ Options: Array of 4 strings
    options: {
        type: [String], 
        required: true,
        validate: [v => v.length === 4, 'Quiz must have exactly 4 options.']
    },
    // The index (0, 1, 2, or 3) of the correct answer
    correctAnswer: { 
        type: Number, 
        required: true,
        min: 0,
        max: 3
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // New questions need moderation too
    }
}, { timestamps: true });

module.exports = mongoose.model('QuizQuestion', QuizQuestionSchema);
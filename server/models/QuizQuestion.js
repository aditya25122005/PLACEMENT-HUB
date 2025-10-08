const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
    topic: { 
        type: String, 
        required: true,
       
        // enum: ['Aptitude', 'DSA-PLAN', 'HR', 'OS', 'DBMS', 'CN','REACT JS'] 
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
    
    correctAnswer: { 
        type: Number, 
        required: true,
        min: 0,
        max: 3
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('QuizQuestion', QuizQuestionSchema);
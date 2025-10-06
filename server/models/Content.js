const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    topic: { 
        type: String, 
        required: true,
        enum: ['Aptitude', 'DSA', 'HR', 'Core CS', 'OS', 'DBMS', 'CN'], 
    },
    question_text: { 
        type: String, 
        required: true 
    },
    explanation: { 
        type: String 
    },
    source_url: { 
        type: String 
    },
    // ✅ DSA and YouTube links are correctly added here
    dsaProblemLink: { 
        type: String
    },
    youtubeSolutionLink: { 
        type: String
    },
    // CORE MODERATION FIELD
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // User field hum abhi hackathon ke liye chhod rahe hain
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Content', ContentSchema);
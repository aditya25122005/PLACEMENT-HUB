const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    topic: { 
        type: String, 
        required: true,
        
    },
    question_text: { 
        type: String, 
        
    },
    videoTitle: { type: String }, 
    explanation: { 
        type: String 
    },
    source_url: { 
        type: String 
    },
    
    dsaProblemLink: { 
        type: String
    },
    
    youtubeSolutionLink: { 
        type: String
    },
    youtubeEmbedLink: { 
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    contentType: {
    type: String,
    enum: ['text','video','pdf'],
    default: 'text'
    },

    pdfUrl: {
            type: String
    }
    
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Content', ContentSchema);
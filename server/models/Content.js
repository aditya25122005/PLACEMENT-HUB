const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    question_text: { type: String, required: true },
    explanation: { type: String },
    source_url: { type: String },
    // **This is the core feature for moderation**
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending' // New submissions start here
    },
    submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Content', ContentSchema);
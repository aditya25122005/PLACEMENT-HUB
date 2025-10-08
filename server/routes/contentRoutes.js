// server/routes/contentRoutes.js

const express = require('express');
const router = express.Router();
const Content = require('../models/Content'); // Content Model zaroori hai

// 1. POST /api/content/submit: Student Content Submission (The 'Net' part)
router.post('/submit', async (req, res) => {
    try {
        // ✅ CRITICAL FIX: Destructure ALL possible fields, including DSA links
        const { 
            topic, 
            question_text, 
            explanation, 
            source_url,
            dsaProblemLink, // <--- New DSA field
            youtubeSolutionLink,
            youtubeEmbedLink, // <--- ADD THIS
            videoTitle // <--- New YouTube field
        } = req.body;
        
        // Validation: Ensure required fields are present
        if (!topic || !question_text) {
            return res.status(400).json({ message: 'Topic and Question Text are required.' });
        }

        // Naya content 'pending' status ke saath save hoga
        const newContent = await Content.create({
            topic,
            question_text,
            explanation,
            source_url,
            dsaProblemLink, // ✅ Ensure all fields are passed to Content.create
            youtubeSolutionLink,
            youtubeEmbedLink, // <--- ADD THIS
            videoTitle,
            status: 'pending', 
        });

        res.status(201).json({ 
            message: 'Content submitted for review! Thank you for contributing.', 
            content: newContent 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. GET /api/content/approved: Fetch Verified Content (The 'Systematic' part)
router.get('/approved', async (req, res) => {
    try {
        // Sirf 'approved' content hi user ko dikhega, latest pehle
        const approvedContent = await Content.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.json(approvedContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. GET /api/content/pending: Fetch Pending Content (Moderator Dashboard)
router.get('/pending', async (req, res) => {
    try {
        // Sirf 'pending' content hi moderator ko dikhega, purana pehle (FIFO)
        const pendingContent = await Content.find({ status: 'pending' }).sort({ createdAt: 1 });
        res.json(pendingContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. PUT /api/content/approve/:id: Moderator Approval (The 'Moderation' part)
router.put('/approve/:id', async (req, res) => {
    try {
        const contentId = req.params.id;
        
        const updatedContent = await Content.findByIdAndUpdate(
            contentId,
            { status: 'approved' }, // Status ko 'approved' mein badalna
            { new: true } // Updated document return karna
        );

        if (!updatedContent) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json({ 
            message: 'Content successfully approved! Now live for students.', 
            content: updatedContent 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. PUT /api/content/reject/:id: Moderator Rejection
router.put('/reject/:id', async (req, res) => {
    try {
        const contentId = req.params.id;
        
        const rejectedContent = await Content.findByIdAndUpdate(
            contentId,
            { status: 'rejected' }, // Status ko 'rejected' mein badalna
            { new: true } // Updated document return karna
        );

        if (!rejectedContent) {
            return res.status(404).json({ message: 'Content not found' });
        }

        res.json({ 
            message: 'Content successfully rejected.', 
            content: rejectedContent 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. POST /api/content/add-official: Moderator/Faculty can directly add approved content
router.post('/add-official', async (req, res) => {
    try {
        // ✅ CRITICAL FIX: Destructure all fields, including the new ones
        const { 
            topic, 
            question_text, 
            explanation, 
            dsaProblemLink, 
            youtubeSolutionLink,
            youtubeEmbedLink, // <--- ADDED!
            videoTitle // <--- ADDED!
        } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Topic is required for official content.' });
        }
        
        // Validation Logic (Checks if AT LEAST ONE content field exists)
        if (
            !question_text && // Title is now optional
            !explanation &&
            !dsaProblemLink &&
            !youtubeSolutionLink &&
            !youtubeEmbedLink
        ) {
            return res.status(400).json({ message: 'Content body missing. Please add an explanation OR at least one link.' });
        }
        
        // Official content directly 'approved' status के saath save hoga
        const officialContent = await Content.create({
            topic,
            question_text,
            explanation,
            dsaProblemLink, 
            youtubeSolutionLink,
            youtubeEmbedLink, // ✅ PASSED TO DB
            videoTitle, // ✅ PASSED TO DB
            status: 'approved', 
        });

        res.status(201).json({ 
            message: 'Official content added and is immediately live!', 
            content: officialContent 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. GET /api/content/quiz: Fetch a random set of N approved questions
router.get('/quiz', async (req, res) => {
    try {
        // Fetch 5 random approved questions for the quiz
        const quizSize = 5; 
        
        // Use MongoDB's aggregation pipeline to find approved documents 
        const quizQuestions = await Content.aggregate([
            { $match: { status: 'approved' } }, // Only select approved content
            { $sample: { size: quizSize } } 
        ]);
        
        // Remove the solution (explanation) before sending to the client 
        const safeQuizQuestions = quizQuestions.map(q => {
            q.explanation = undefined; 
            return q;
        });

        res.json(safeQuizQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 8. DELETE /api/content/:id: Delete any content (for Moderator QC)
router.delete('/:id', async (req, res) => {
    try {
        const deletedContent = await Content.findByIdAndDelete(req.params.id);
        if (!deletedContent) {
            return res.status(404).json({ message: 'Content not found.' });
        }
        res.json({ message: 'Content successfully deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete content.' });
    }
});

// 9. PUT /api/content/:id: Update existing content (Edit)
router.put('/:id', async (req, res) => {
    try {
        // Only allow updating the fields that are sent in the body
        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true } // Return new doc and run schema validators
        );

        if (!updatedContent) {
            return res.status(404).json({ message: 'Content not found.' });
        }
        res.json({ message: 'Content successfully updated.', content: updatedContent });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update content.' });
    }
});

// 10. GET /api/content/all: Get ALL content (Approved, Rejected, Pending) for full admin overview
router.get('/all', async (req, res) => {
    try {
        const allContent = await Content.find().sort({ createdAt: -1 });
        res.json(allContent);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all content.' });
    }
});
module.exports = router;
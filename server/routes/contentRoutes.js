const express = require('express');
const router = express.Router();
const Content = require('../models/Content'); 
const upload = require("../config/multer");   

// 1. POST /api/content/submit

router.post('/submit', upload.single("pdf"), async (req, res) => {
    try {
        const { 
            topic, 
            question_text, 
            explanation, 
            source_url,
            dsaProblemLink, 
            youtubeSolutionLink,
            youtubeEmbedLink, 
            videoTitle,
            contentType
        } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Topic is required.' });
        }

        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newContent = await Content.create({
            topic,
            question_text,
            explanation,
            source_url,
            dsaProblemLink,
            youtubeSolutionLink,
            youtubeEmbedLink,
            videoTitle,
            contentType: contentType || "text",
            pdfUrl,
            status: 'pending'
        });

        res.status(201).json({ 
            message: 'Content submitted for review! Thank you for contributing.', 
            content: newContent 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. GET APPROVED CONTENT 
router.get('/approved', async (req, res) => {
    try {
        const approvedContent = await Content.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.json(approvedContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. GET PENDING (NO CHANGE)

router.get('/pending', async (req, res) => {
    try {
        const pendingContent = await Content.find({ status: 'pending' }).sort({ createdAt: 1 });
        res.json(pendingContent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. APPROVE CONTENT (NO CHANGE)

router.put('/approve/:id', async (req, res) => {
    try {
        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
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

// 5. REJECT CONTENT (NO CHANGE)

router.put('/reject/:id', async (req, res) => {
    try {
        const rejectedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
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

// 6. ADD OFFICIAL CONTENT (NOW SUPPORTS PDF)

router.post('/add-official', upload.single("pdf"), async (req, res) => {
    try {
        const { 
            topic, 
            question_text, 
            explanation, 
            dsaProblemLink, 
            youtubeSolutionLink,
            youtubeEmbedLink, 
            videoTitle,
            contentType
        } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Topic is required for official content.' });
        }

        const pdfUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const officialContent = await Content.create({
            topic,
            question_text,
            explanation,
            dsaProblemLink,
            youtubeSolutionLink,
            youtubeEmbedLink,
            videoTitle,
            contentType: contentType || "text",
            pdfUrl,
            status: 'approved'
        });

        res.status(201).json({ 
            message: 'Official content added and is immediately live!', 
            content: officialContent 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. QUIZ ROUTE (NO CHANGE)

router.get('/quiz', async (req, res) => {
    try {
        const quizSize = 5;

        const quizQuestions = await Content.aggregate([
            { $match: { status: 'approved' } },
            { $sample: { size: quizSize } }
        ]);

        const safeQuizQuestions = quizQuestions.map(q => {
            q.explanation = undefined;
            return q;
        });

        res.json(safeQuizQuestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 8. DELETE (NO CHANGE)

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


// 9. UPDATE CONTENT (NO CHANGE)

router.put('/:id', async (req, res) => {
    try {
        const updatedContent = await Content.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedContent) {
            return res.status(404).json({ message: 'Content not found.' });
        }
        res.json({ message: 'Content successfully updated.', content: updatedContent });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update content.' });
    }
});


// 10. GET ALL (NO CHANGE)

router.get('/all', async (req, res) => {
    try {
        const allContent = await Content.find().sort({ createdAt: -1 });
        res.json(allContent);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all content.' });
    }
});

module.exports = router;

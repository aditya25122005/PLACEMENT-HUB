const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// GET /api/subjects/all: Get all subjects (Frontend uses this)
router.get('/all', async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ name: 1 });
        // We add 'All' manually for the filter dropdowns, but it's not saved to DB
        const allSubjects = [{ name: 'All' }, ...subjects]; 
        res.json(allSubjects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch subjects.' });
    }
});

// POST /api/subjects/add: Add a new subject (Moderator uses this)
router.post('/add', async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) return res.status(400).json({ message: 'Subject name is required.' });
        
        const subject = new Subject({ name: name.trim() });
        await subject.save();
        res.status(201).json({ message: 'Subject added successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add subject.' });
    }
});


// 3. DELETE /api/subjects/:id: Remove a subject (Delete)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Subject.findByIdAndDelete(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.json({ message: 'Subject successfully deleted.' });
        
    } catch (error) {
        console.error("SUBJECT DELETE ERROR:", error); 
        res.status(500).json({ message: 'Failed to delete subject due to server error.' });
    }
});

module.exports = router;
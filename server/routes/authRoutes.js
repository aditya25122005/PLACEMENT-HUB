const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// 1. POST /api/auth/register: User Registration (Student)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ username, password, role: 'student' });
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. POST /api/auth/login: User Login (Student/Moderator)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//3.GET /api/auth/profile/:id: Fetch User Profile (including Scores)
router.get('/profile/:id', async (req, res) => {
    try {
       
        const userId = req.params.id; 
        
        
        const user = await User.findById(userId).select('-password'); 
        
        if (user) {
            res.json(user);
        } else {
         
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
       
        res.status(500).json({ message: 'Error fetching profile data.' });
    }
});
// 4. PUT /api/auth/watch-content/:userId: Marks a content item as watched
router.put('/watch-content/:userId', async (req, res) => {
    const { contentId } = req.body;
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the ID is already present in the watchedContent array
        if (!user.watchedContent.includes(contentId)) {
            user.watchedContent.push(contentId);
            user.markModified('watchedContent');
            await user.save();
        }
        res.json({ watchedList: user.watchedContent }); 

    } catch (error) {
        res.status(500).json({ message: 'Failed to mark content as watched.' });
    }
});
// 5. PUT /api/auth/solve-dsa/:userId: Marks a problem as solved/unsolved
router.put('/solve-dsa/:userId', async (req, res) => {
    const { problemId, isSolved } = req.body; // Frontend se status aayega
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (isSolved) {
            
            user.solvedDSA = user.solvedDSA.filter(id => id !== problemId);
        } else {
         
            if (!user.solvedDSA.includes(problemId)) {
                user.solvedDSA.push(problemId);
            }
        }
        
       
        user.markModified('solvedDSA'); 
        await user.save();

        res.json({ message: 'Solved status updated.', solvedDSA: user.solvedDSA });

    } catch (error) {
        res.status(500).json({ message: 'Failed to update solved status.' });
    }
});
module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const uploadDp = require("../config/multerDp.js");

const generateOtp = require("../utils/generateOtp");
const sendOtpMail = require("../utils/sendOtpMail");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// 1️⃣ POST /api/auth/register: User Registration (Student)
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // 1. Check if a fully verified user already exists with this username
        const existingUsername = await User.findOne({ username, isVerified: true });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken.' });
        }

        // 2. Find the temporary user created during the OTP step
        let user = await User.findOne({ email });

        if (user) {
            // Update the temporary record with actual details and mark as verified
            user.username = username;
            user.password = password;
            user.isVerified = true; 
            user.otp = undefined;      // Clear security sensitive data
            user.otpExpiry = undefined;
            await user.save();
        } else {
            // Fallback: If for some reason the temp user doesn't exist, create it
            user = await User.create({
                username, 
                password, 
                email,
                role: 'student',
                isVerified: true,
                authProvider: "local"
            });
        }

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
// 2️⃣ POST /api/auth/login: User Login (Student/Moderator)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        // STEP 1 — User exists?
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // STEP 2 — Password match?
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // STEP 3 — OTP Verification check (Moderator bypass)
        if (user.authProvider === "local" && user.role !== "moderator" && !user.isVerified) {
            return res.status(401).json({ message: "Verify OTP first" });
        }

        // STEP 4 — Success Login
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3️⃣ GET /api/auth/profile/:id: Fetch User Profile
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

// ⭐ UPDATE USER PROFILE
router.put("/update-profile/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { dob, college, branch, leetcodeId } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                dob,
                college,
                branch,
                leetcodeId
            },
            { new: true }
        );

        res.json(updatedUser);

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// ⭐ UPLOAD PROFILE DP
router.post("/upload-dp/:id", uploadDp.single("dp"), async (req, res) => {
    try {
        const userId = req.params.id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const dpPath = `/uploads/dp/${req.file.filename}`;

        await User.findByIdAndUpdate(
            userId,
            { dp: dpPath },
            { new: true }
        );

        res.json({
            message: "DP uploaded successfully",
            dp: dpPath,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "DP upload failed" });
    }
});

// 4️⃣ PUT /api/auth/watch-content/:userId
router.put('/solve-dsa/:userId', async (req, res) => {
    const { problemId, isSolved } = req.body;

    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (isSolved) {
            if (!user.solvedDSA.some(id => id.toString() === problemId)) {
                user.solvedDSA.push(problemId);
            }
        } else {
            user.solvedDSA = user.solvedDSA.filter(
                id => id.toString() !== problemId
            );
        }

        await user.save();

        res.json({
            message: 'Solved status updated.',
            solvedDSA: user.solvedDSA
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update solved status.' });
    }
});
// send - otp route
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) return res.status(400).json({ message: "Email required" });

        let user = await User.findOne({ email });

        // If user exists and is already verified, they shouldn't register again
        if (user && user.isVerified) {
            return res.status(400).json({ message: "Email already registered. Please login." });
        }

        const otp = generateOtp();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 mins

        if (!user) {
            // Create temporary unverified user to store OTP
            user = await User.create({
                email,
                username: `temp_${Date.now()}`, // Placeholder username
                password: `temp_${Math.random()}`, // Placeholder password
                isVerified: false,
                otp,
                otpExpiry
            });
        } else {
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        }

        await sendOtpMail(email, otp);
        res.json({ message: "OTP sent successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// verify otp route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  // Debugging logs (Check karein console mein kya aa raha hai)
  console.log("Verifying for:", email);
  console.log("Received OTP:", otp, typeof otp);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Stored OTP:", user.otp, typeof user.otp);

    // FIX: String() use karein mismatch se bachne ke liye
    const isOtpValid = String(user.otp) === String(otp);
    const isNotExpired = user.otpExpiry > Date.now();

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP code" });
    }

    if (!isNotExpired) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Success logic
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ message: "OTP verified successfully!" });

  } catch (err) {
    console.error("Verification Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});
// google login route
router.post("/google-login", async (req,res)=>{
  const { token } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email });

  if(!user){
    user = await User.create({
      username: payload.name,
      email: payload.email,
      authProvider:"google",
      googleId: payload.sub,
      isVerified:true,
      password: "google-auth"
    });
  }

  res.json({
    _id:user._id,
    username:user.username,
    role:user.role,
    token: generateToken(user._id,user.role)
  });
});
module.exports = router;

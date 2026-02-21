const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const ScoreSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    highScore: Number,
    lastScore: Number,
    totalQuestions: { type: Number, default: 0 },
    lastAttempt: Date
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true },
    role: { 
        type: String, 
        enum: ['student', 'moderator'], 
        default: 'student' 
    },
      // ⭐ PROFILE DETAILS
  dp: { type: String, default: "" },
  dob: { type: Date },
  college: { type: String },
  branch: { type: String },

  // ⭐ LEETCODE USERNAME
  leetcodeId: { type: String },

  // ⭐ SAVED LEETCODE STATS (FETCH ONCE MODEL)
  leetcodeStats: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    contestRating: { type: Number, default: 0 },
    totalContests: { type: Number, default: 0 },
  },
  
    scores: [ScoreSchema],
    solvedDSA: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
    watchedContent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],



}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
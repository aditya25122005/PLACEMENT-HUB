const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const ScoreSchema = new mongoose.Schema({
    topic: { type: String, required: true },
    highScore: { type: Number, default: 0 },
    lastScore: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now },
    
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['student', 'moderator'], 
        default: 'student' 
    },
   
    scores: [ScoreSchema],
    solvedDSA: [{ type: String }], 
    watchedContent: [{ type: String }], 
    

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
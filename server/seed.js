// server/seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); 
const Content = require('./models/Content'); 
const QuizQuestion = require('./models/QuizQuestion'); 
const connectDB = require('./config/db'); 

// Load environment variables (MONGO_URI)
dotenv.config({ path: './.env' });

// Database connect करें
connectDB();

// --- MOCK DATA ---

// 20 Aptitude Questions का Data
const aptitudeQuizQuestions = [
    // --- Aptitude Question 1 ---
    {
        topic: 'Aptitude',
        questionText: 'A tap can fill a tank in 6 hours. Another tap can empty it in 12 hours. If both taps are open, how long will it take to fill the tank?',
        options: ['8 hours', '10 hours', '12 hours', '15 hours'],
        correctAnswer: 2, // 12 hours
        status: 'approved',
    },
    // --- Aptitude Question 2 ---
    {
        topic: 'Aptitude',
        questionText: 'If 20% of a number is 10, what is the number?',
        options: ['40', '50', '60', '70'],
        correctAnswer: 1, // 50
        status: 'approved',
    },
    // --- Aptitude Question 3 ---
    {
        topic: 'Aptitude',
        questionText: 'What is the sum of the first 10 odd numbers?',
        options: ['100', '110', '90', '80'],
        correctAnswer: 0, // 100 (10^2)
        status: 'approved',
    },
    // --- Aptitude Question 4 ---
    {
        topic: 'Aptitude',
        questionText: 'A train 100m long passes a pole in 5 seconds. What is its speed?',
        options: ['20 m/s', '30 m/s', '15 m/s', '25 m/s'],
        correctAnswer: 0, // 20 m/s (100/5)
        status: 'approved',
    },
    // --- Aptitude Question 5 ---
    {
        topic: 'Aptitude',
        questionText: 'What is the simple interest on Rs 500 for 4 years at 6% p.a.?',
        options: ['Rs 100', 'Rs 120', 'Rs 150', 'Rs 130'],
        correctAnswer: 1, // Rs 120
        status: 'approved',
    },
    // --- Aptitude Question 6 ---
    {
        topic: 'Aptitude',
        questionText: 'Find the next number in the series: 2, 4, 8, 16, ?',
        options: ['20', '24', '32', '36'],
        correctAnswer: 2, // 32
        status: 'approved',
    },
    // --- Aptitude Question 7 ---
    {
        topic: 'Aptitude',
        questionText: 'The ratio of two numbers is 3:4 and their sum is 21. Find the numbers.',
        options: ['9 and 12', '10 and 11', '8 and 13', '6 and 15'],
        correctAnswer: 0, // 9 and 12
        status: 'approved',
    },
    // --- Aptitude Question 8 ---
    {
        topic: 'Aptitude',
        questionText: 'What is the value of 5! (5 factorial)?',
        options: ['100', '120', '150', '60'],
        correctAnswer: 1, // 120
        status: 'approved',
    },
    // --- Aptitude Question 9 ---
    {
        topic: 'Aptitude',
        questionText: 'If cost price is 500 and selling price is 600, what is the profit percentage?',
        options: ['10%', '15%', '20%', '25%'],
        correctAnswer: 2, // 20%
        status: 'approved',
    },
    // --- Aptitude Question 10 ---
    {
        topic: 'Aptitude',
        questionText: 'Find the average of 10, 20, and 30.',
        options: ['15', '20', '25', '60'],
        correctAnswer: 1, // 20
        status: 'approved',
    },
    // --- Aptitude Question 11 ---
    {
        topic: 'Aptitude',
        questionText: 'A box contains 5 red and 5 blue balls. What is the probability of drawing a red ball?',
        options: ['1/2', '1/5', '1/10', '2/5'],
        correctAnswer: 0, // 1/2
        status: 'approved',
    },
    // --- Aptitude Question 12 ---
    {
        topic: 'Aptitude',
        questionText: 'How many sides does a hexagon have?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 1, // 6
        status: 'approved',
    },
    // --- Aptitude Question 13 ---
    {
        topic: 'Aptitude',
        questionText: 'If one pipe fills a pool in 3 hours, how much is filled in 1 hour?',
        options: ['1/2', '1/3', '1/4', '2/3'],
        correctAnswer: 1, // 1/3
        status: 'approved',
    },
    // --- Aptitude Question 14 ---
    {
        topic: 'Aptitude',
        questionText: 'The length of a rectangle is 8cm and width is 4cm. What is the perimeter?',
        options: ['32 cm', '12 cm', '24 cm', '16 cm'],
        correctAnswer: 2, // 24 cm
        status: 'approved',
    },
    // --- Aptitude Question 15 ---
    {
        topic: 'Aptitude',
        questionText: 'What is the square root of 64?',
        options: ['7', '8', '9', '10'],
        correctAnswer: 1, // 8
        status: 'approved',
    },
    // --- Aptitude Question 16 ---
    {
        topic: 'Aptitude',
        questionText: 'Find the LCM of 2 and 3.',
        options: ['1', '2', '3', '6'],
        correctAnswer: 3, // 6
        status: 'approved',
    },
    // --- Aptitude Question 17 ---
    {
        topic: 'Aptitude',
        questionText: 'Convert 0.5 into a percentage.',
        options: ['5%', '50%', '0.5%', '500%'],
        correctAnswer: 1, // 50%
        status: 'approved',
    },
    // --- Aptitude Question 18 ---
    {
        topic: 'Aptitude',
        questionText: 'How many permutations of the letters CAT are possible?',
        options: ['3', '6', '9', '12'],
        correctAnswer: 1, // 6
        status: 'approved',
    },
    // --- Aptitude Question 19 ---
    {
        topic: 'Aptitude',
        questionText: 'A clock shows 3:00. What is the angle between the hour and minute hands?',
        options: ['60 degrees', '90 degrees', '120 degrees', '180 degrees'],
        correctAnswer: 1, // 90 degrees
        status: 'approved',
    },
    // --- Aptitude Question 20 ---
    {
        topic: 'Aptitude',
        questionText: 'What is the compound interest on Rs 100 at 10% p.a. for 2 years?',
        options: ['Rs 20', 'Rs 21', 'Rs 22', 'Rs 25'],
        correctAnswer: 1, // Rs 21
        status: 'approved',
    },
];

const userSeedData = async () => {
    // CRITICAL: Ensure you use your exact generated hash here
    const MOD_PASSWORD_HASH = '$2b$10$EMOoxuasVAUOkNEGk9vmfO6knMKCKwdgczfCQ.Z8Ti7nez7abc7.S'; 

    return [
        {
            username: 'moderator',
            password: MOD_PASSWORD_HASH,
            role: 'moderator',
            scores: [],
            solvedDSA: [],
        },
        {
            username: 'teststudent', // Added a student for quiz testing
            password: MOD_PASSWORD_HASH, 
            role: 'student',
            scores: [],
            solvedDSA: [],
        },
    ];
};

const contentSeedData = () => {
    // Add essential Content/Theory data here
    return [
        // Example Theory Content
        {
            topic: 'OS',
            question_text: 'Primary function of the kernel',
            explanation: 'The kernel manages the system resources (CPU, Memory, I/O) and acts as a bridge between hardware and applications.',
            status: 'approved',
        },
    ];
};


// --- Main Seeder Function ---
const importData = async () => {
    try {
        // 1. Clear ALL existing data 
        await User.deleteMany();
        await Content.deleteMany();
        await QuizQuestion.deleteMany();

        console.log('✅ Existing data cleared successfully!');

        // 2. Insert all data 
        await User.insertMany(await userSeedData());
        await Content.insertMany(contentSeedData());
        await QuizQuestion.insertMany(aptitudeQuizQuestions); // Insert 20 Aptitude Questions

        console.log('✅ All Data (Users, Content, 20 Aptitude Quizzes) Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`🛑 Error with data import: ${error.message}`);
        process.exit(1);
    }
};

// Script ko run करें
importData();
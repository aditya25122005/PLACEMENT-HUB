import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../App.css'; 
// Settings for the quiz
const QUIZ_DURATION_SECONDS = 60; // 1 minute challenge for 5 questions
const QUIZ_SIZE = 5;

const TimedQuiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timer, setTimer] = useState(QUIZ_DURATION_SECONDS);
    const [score, setScore] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const timerRef = useRef();

    // --- A. Fetch Questions ---
    const fetchQuestions = async () => {
        try {
            // Hitting the new random quiz endpoint
            const response = await axios.get('/api/content/quiz');
            
            // NOTE: Since our approved content doesn't have multiple choice options, 
            // we will treat this as a simple 'Did you know the answer?' challenge.
            setQuestions(response.data);
            setQuizStarted(false);
            setQuizFinished(false);
            setTimer(QUIZ_DURATION_SECONDS);
            setScore(0);
        } catch (error) {
            console.error("Error fetching quiz questions:", error);
            alert("Failed to load quiz. Ensure you have at least 5 approved questions!");
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // --- B. Timer Logic (The 'Timed' Part) ---
    useEffect(() => {
        if (quizStarted && timer > 0 && !quizFinished) {
            timerRef.current = setInterval(() => {
                setTimer(prevTime => prevTime - 1);
            }, 1000);
        }
        
        if (timer === 0) {
            clearInterval(timerRef.current);
            setQuizFinished(true);
        }

        return () => clearInterval(timerRef.current);
    }, [quizStarted, timer, quizFinished]);

    // --- C. Handle User Action (Simple Pass/Fail) ---
    const handleAnswer = (isCorrect) => {
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
        
        const nextIndex = currentQuestionIndex + 1;
        
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            // Quiz finished
            clearInterval(timerRef.current);
            setQuizFinished(true);
        }
    };
    
    // --- D. Render Logic ---
    const currentQuestion = questions[currentQuestionIndex];

    if (questions.length === 0) {
        return <p style={{textAlign: 'center', margin: '50px'}}>Loading Quiz... (Make sure you have at least 5 approved items!)</p>;
    }
    
    if (!quizStarted) {
        return (
            <div className="quiz-container start-screen">
                <h2>Timed Quiz Challenge ⏱️</h2>
                <p>Test your knowledge with {QUIZ_SIZE} random questions in {QUIZ_DURATION_SECONDS} seconds.</p>
                <button onClick={() => setQuizStarted(true)} className="approve-btn">
                    Start Quiz Now!
                </button>
            </div>
        );
    }
    
    if (quizFinished) {
        return (
            <div className="quiz-container results-screen">
                <h2>Quiz Complete!</h2>
                <p>You finished the challenge in {QUIZ_DURATION_SECONDS - timer} seconds.</p>
                <h3>Your Final Score: {score} out of {QUIZ_SIZE}</h3>
                <button onClick={fetchQuestions} className="mod-login-btn" style={{marginTop: '20px'}}>
                    Try Again
                </button>
            </div>
        );
    }

    // Main Quiz Interface
    return (
        <div className="quiz-container active-quiz">
            <h3 className="quiz-header">Question {currentQuestionIndex + 1} of {questions.length}</h3>
            
            <div className="timer-bar">
                Time Left: <span style={{color: timer < 10 ? 'red' : 'green', fontWeight: 'bold'}}>{timer}s</span>
            </div>
            
            <div className="question-card">
                <p className="question-text">{currentQuestion.question_text}</p>
                <small>Topic: {currentQuestion.topic}</small>
            </div>
            
            <div className="quiz-actions">
                <p style={{marginBottom: '10px'}}>Did you answer correctly in your head?</p>
                <button onClick={() => handleAnswer(true)} className="approve-btn">
                    I Got It Right! (Score +1)
                </button>
                <button onClick={() => handleAnswer(false)} className="reject-btn">
                    I Got It Wrong (Skip)
                </button>
            </div>
        </div>
    );
};

export default TimedQuiz;
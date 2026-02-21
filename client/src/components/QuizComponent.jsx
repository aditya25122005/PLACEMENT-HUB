import React, { useState, useEffect } from 'react';
import axios from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheckCircle, FiChevronRight, FiAlertTriangle, 
  FiClock, FiAward, FiRotateCcw, FiHelpCircle 
} from 'react-icons/fi';

const QuizComponent = ({ topicName, userId }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizFinished, setQuizFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(null);
    const [quizFetched, setQuizFetched] = useState(false);

    // ⭐ FETCH FUNCTION (moved outside)
    const fetchQuiz = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/quiz/topic/${topicName}`);
            setQuestions(response.data);
            setQuizFetched(true);
        } catch (error) {
            console.error("Error fetching quiz:", error);
        } finally {
            setLoading(false);
        }
    };

    // ⭐ RESET QUIZ FIXED
    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizFinished(false);
        setFinalScore(null);
        fetchQuiz(); // ⭐ THIS FIXES RETAKE ISSUE
    };

    useEffect(() => {
        fetchQuiz();
    }, [topicName]);

    const handleAnswerSelect = (optionIndex) => {
        const currentQuestionId = questions[currentQuestionIndex]._id;
        setUserAnswers({
            ...userAnswers,
            [currentQuestionId]: optionIndex
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmitQuiz();
        }
    };
    
    const handleSubmitQuiz = async () => {
        try {
            const response = await axios.post('/api/quiz/submit-answers', { 
                topic: topicName,
                answers: userAnswers,
                userId: userId 
            });
            setFinalScore(response.data.score);
            setQuizFinished(true);
        } catch (error) {
            setQuizFinished(true);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4" />
                <p className="text-slate-500 font-bold italic tracking-tight">Preparing your quiz for {topicName}...</p>
            </div>
        );
    }

    if (quizFetched && questions.length === 0) {
        return (
            <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <FiAlertTriangle className="mx-auto text-amber-500 mb-4" size={40} />
                <h4 className="text-slate-800 font-bold">No Questions Found</h4>
                <p className="text-slate-500 text-sm px-10">Moderators haven't approved questions for {topicName} yet.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return null;

    const selectedOption = userAnswers[currentQuestion._id];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    if (quizFinished) {
        const passRate = (finalScore / questions.length) * 100;
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-lg ${passRate >= 50 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    <FiAward size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Quiz Complete!</h2>
                <p className="text-slate-500 mb-8 font-medium">Topic: <span className="text-indigo-600 font-bold">{topicName}</span></p>
                
                <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Your Final Score</p>
                    <h3 className={`text-5xl font-black ${passRate >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {finalScore} <span className="text-2xl text-slate-300">/ {questions.length}</span>
                    </h3>
                </div>

                <div className="flex flex-col gap-3">
                    <button onClick={resetQuiz} className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                        <FiRotateCcw /> Retake Quiz
                    </button>
                    <p className="text-[11px] text-slate-400 font-medium">Score has been synced with your progress dashboard.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FiClock className="text-indigo-500" /> Question {currentQuestionIndex + 1} of {questions.length}
                    </h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {Math.round(progress)}% Complete
                    </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-indigo-600" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
                >
                    <div className="flex gap-4 mb-6">
                        <div className="hidden sm:flex shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 items-center justify-center rounded-xl font-bold">
                            Q
                        </div>
                        <p className="text-xl font-bold text-slate-800 leading-relaxed">
                            {currentQuestion.questionText}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            return (
                                <motion.div 
                                    key={index} 
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className={`relative group cursor-pointer flex items-center p-5 rounded-2xl border-2 transition-all duration-200 ${
                                        isSelected 
                                        ? 'border-indigo-600 bg-indigo-50/50' 
                                        : 'border-slate-100 hover:border-slate-200 bg-white'
                                    }`}
                                    onClick={() => handleAnswerSelect(index)}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'
                                    }`}>
                                        {isSelected && <FiCheckCircle size={14}/>}
                                    </div>
                                    <label className={`text-sm font-bold cursor-pointer transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>
                                        {option}
                                    </label>
                                    <input type="radio" name="quiz-option" checked={isSelected} readOnly className="hidden" />
                                </motion.div>
                            );
                        })}
                    </div>

                    <button 
                        onClick={handleNext} 
                        disabled={selectedOption === undefined} 
                        className="w-full mt-10 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale
                        bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                    >
                        {currentQuestionIndex === questions.length - 1 ? 'Finish & View Results' : 'Next Question'} 
                        <FiChevronRight />
                    </button>
                </motion.div>
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                <FiHelpCircle /> Answers are strictly private and used for progress tracking
            </div>
        </div>
    );
};

export default QuizComponent;
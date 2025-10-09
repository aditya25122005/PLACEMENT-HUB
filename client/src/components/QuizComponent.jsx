import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

const QuizComponent = ({ topicName, userId }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizFinished, setQuizFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(null);

    const [quizFetched, setQuizFetched] = useState(false); 
 
    const resetQuiz = () => {
        setQuestions([]); 
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setQuizFinished(false);
        setFinalScore(null);
        setQuizFetched(false);
        
    };
    
  
    useEffect(() => {
        const fetchQuiz = async () => {
           
            if (questions.length > 0) return; 

            setLoading(true);
            try {
              
                const response = await axios.get(`/api/quiz/topic/${topicName}`);
                setQuestions(response.data);

                setQuizFetched(true);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching quiz:", error);
                setLoading(false);
                alert(`Failed to load quiz for ${topicName}. Ensure moderator has added approved quiz questions for this topic!`);
            }
        };

        fetchQuiz();
    }, [topicName, questions]); 

    const handleAnswerSelect = (optionIndex) => {
        const currentQuestionId = questions[currentQuestionIndex]._id;
        setUserAnswers({
            ...userAnswers,
            [currentQuestionId]: optionIndex
        });
    };

    const handleNext = () => {
       
        if (userAnswers[questions[currentQuestionIndex]._id] === undefined) {
             alert("Please select an option before moving to the next question.");
             return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
           
            handleSubmitQuiz();
        }
    };
    
    const handleSubmitQuiz = async () => {
        try {
            if (!userId) {
                alert("Error: Cannot save score. User ID missing.");
                setQuizFinished(true);
                return;
            }

            const response = await axios.post('/api/quiz/submit-answers', { 
                topic: topicName,
                answers: userAnswers,
                userId: userId 
            });
            
            setFinalScore(response.data.score);
            setQuizFinished(true);
          

        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert('Failed to calculate score. Try again.');
            setQuizFinished(true);
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center' }}>Loading Quiz Questions for {topicName}... ⏳</p>;
    }

     if (quizFetched && questions.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd' }}>No approved quiz questions found for {topicName}.</p>;
    }
    
    if (questions.length === 0) {
        return <p style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd' }}>No approved quiz questions found for {topicName}.</p>;
    }
    

    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = userAnswers[currentQuestion._id]; 


    if (quizFinished) {
        return (
            <div className="quiz-results-card">
                <h2>Quiz Results for {topicName}</h2>
                <h3 style={{ color: finalScore >= questions.length / 2 ? '#28a745' : '#dc3545' }}>
                    Your Score: {finalScore} / {questions.length}
                </h3>
                <p>Great job! Your high score is saved to your progress dashboard.</p>
                <button 
                   
                    onClick={resetQuiz} 
                    className="approve-btn" 
                    style={{marginTop: '20px'}}
                >
                    Take Quiz Again
                </button>
            </div>
        );
    }

    // --- Render Logic: Active Quiz ---
    return (
        <div className="quiz-active-container">
            <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
            
            <div className="question-card-quiz">
                <p className="question-text">{currentQuestion.questionText}</p>
            </div>
            
            <div className="options-list">
                {currentQuestion.options.map((option, index) => (
                    <div 
                        key={index} 
                        className={`option-item ${selectedOption === index ? 'selected' : ''}`}
                        onClick={() => handleAnswerSelect(index)}
                    >
                        <input 
                            type="radio" 
                            name="quiz-option" 
                            checked={selectedOption === index} 
                            readOnly 
                        />
                        <label>{option}</label>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleNext} 
                disabled={selectedOption === undefined} 
                className="mod-login-btn"
                style={{ width: '100%', marginTop: '20px' }}
            >
                {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question →'}
            </button>
        </div>
    );
};

export default QuizComponent;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

const QuizManagement = ({ onContentChange, subjectList }) => { 
    
    const initialFormState = {
        topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude', 
        questionText: '',
        options: ['', '', '', ''], 
        correctAnswer: 0,
        isOfficial: false, 
    };
    const [formData, setFormData] = useState(initialFormState); 
    const [pendingQuizzes, setPendingQuizzes] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPendingQuizzes = async () => {
        try {
            const response = await axios.get('/api/quiz/pending'); 
            setPendingQuizzes(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending quizzes:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingQuizzes();
    }, []);



    const handleAddChange = (e, index) => {
        const { name, value, type, checked } = e.target;

        if (name === 'options') {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (name === 'correctAnswer') {
             setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };


    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (formData.questionText.trim().length < 5) {
             setMessage('❌ Question text is too short.');
             return;
        }

        const dataToSend = {
            ...formData,
            status: formData.isOfficial ? 'approved' : 'pending',
        };

        try {
            await axios.post('/api/quiz/add', dataToSend);
            setMessage('✅ Quiz Question Added Successfully!');
            setFormData(initialFormState); // Reset form
            fetchPendingQuizzes(); // Refresh the pending list
        } catch (error) {
            const errorMsg = error.response?.data?.message || '❌ Failed to add quiz question.';
            const displayError = errorMsg.includes('must have exactly 4 options') 
                                 ? '❌ Error: Ensure all 4 options and a correct answer are selected.' 
                                 : errorMsg;
            setMessage(displayError);
        }
    };


 
    const handleQuizApproval = async (id) => {
        try {
            await axios.put(`/api/quiz/approve/${id}`);
            fetchPendingQuizzes(); 
            if (onContentChange) onContentChange(); 
            alert('✅ Quiz Approved! Now available for students.');
        } catch (error) {
            alert('❌ Failed to approve quiz.');
        }
    };

    const handleQuizRejection = async (id) => {
        try {
            await axios.put(`/api/quiz/reject/${id}`);
            fetchPendingQuizzes(); 
            alert('❌ Quiz Rejected.');
        } catch (error) {
            alert('❌ Failed to reject quiz.');
        }
    };

    return (
        <div className="quiz-management-container">
        
            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`} style={{marginBottom: '20px'}}>{message}</p>}


           
            <div className="admin-add-section">
                <h3>1. Add New MCQ Question</h3>
                <p>Use this to create official, verified quiz content.</p>
                <form onSubmit={handleAddSubmit} className="quiz-add-form">
                    
                    <label>Topic:</label>
                    <select name="topic" value={formData.topic} onChange={handleAddChange}>
                  
                        {subjectList && subjectList.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    
                    <label>Question Text (Required):</label>
                    <textarea name="questionText" value={formData.questionText} onChange={handleAddChange} rows="3" required />

                    <div style={{marginTop: '15px'}}>
                        <h4>Options (Enter 4). Select the radio button for the Correct Answer.</h4>
                        {formData.options.map((option, index) => (
                            <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    value={index}
                                    checked={formData.correctAnswer === index}
                                    onChange={handleAddChange}
                                    style={{width: 'auto', marginRight: '10px'}}
                                />
                                <input
                                    type="text"
                                    name="options"
                                    value={option}
                                    onChange={(e) => handleAddChange(e, index)}
                                    placeholder={`Option ${index + 1}`}
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', marginTop: '20px'}}>
                        <input
                            type="checkbox"
                            name="isOfficial"
                            checked={formData.isOfficial}
                            onChange={handleAddChange}
                            style={{width: 'auto', marginRight: '10px'}}
                        />
                        <label style={{margin: 0}}>Publish Immediately (Official Content)</label>
                    </div>

                    <button type="submit" className="approve-btn" style={{width: 'auto', padding: '10px 30px', marginTop: '20px'}}>
                        Submit New Quiz
                    </button>
                </form>
            </div>
            
            <hr style={{margin: '40px 0'}}/>
            <div className="admin-moderate-section">
                <h3>2. Verify Pending Quiz Submissions</h3>
                {loading ? (
                    <p>Loading pending quizzes...</p>
                ) : pendingQuizzes.length === 0 ? (
                    <p className="success-message">🎉 Quiz Moderation Queue Clear!</p>
                ) : (
                    pendingQuizzes.map((quiz) => (
                        <div key={quiz._id} className="pending-card">
                            <h4>[{quiz.topic}] {quiz.questionText}</h4>
                            <ol style={{margin: '10px 0 15px 20px'}}>
                                {quiz.options.map((opt, idx) => (
                                    <li 
                                        key={idx} 
                                        style={{fontWeight: idx === quiz.correctAnswer ? 'bold' : 'normal'}}
                                    >
                                        {opt} 
                                        {idx === quiz.correctAnswer && " (✅ Correct Answer)"}
                                    </li>
                                ))}
                            </ol>
                            <div className="action-buttons">
                                <button onClick={() => handleQuizApproval(quiz._id)} className="approve-btn">
                                    ✅ Approve Quiz
                                </button>
                                <button onClick={() => handleQuizRejection(quiz._id)} className="reject-btn">
                                    ❌ Reject Quiz
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default QuizManagement;
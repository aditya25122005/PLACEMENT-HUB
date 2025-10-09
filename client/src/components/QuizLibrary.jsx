import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 
import EditQuizModal from './EditQuizModal'; 


const QuizLibrary = ({ onContentChange, subjectList }) => { 
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null); 
    
    const [selectedFilter, setSelectedFilter] = useState('All'); 

    const fetchAllQuizzes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/quiz/all'); 
            setAllQuizzes(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching all quizzes:", error);
            setMessage("Error fetching Quiz Library.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllQuizzes();
    }, []);

    const handleDelete = async (id, question) => {
        if (!window.confirm(`Are you sure you want to permanently delete quiz: "${question}"?`)) {
            return;
        }

        try {
            
            await axios.delete(`/api/quiz/${id}`); 
            setMessage(`✅ Quiz "${question.substring(0, 30)}..." deleted successfully.`);
            fetchAllQuizzes(); 
            onContentChange(); 
        } catch (error) {
            setMessage(`❌ Error deleting quiz.`);
            console.error("Delete error:", error);
        }
    };

    const handleEdit = (quizItem) => {
        setCurrentQuiz(quizItem); 
        setIsModalOpen(true);     
    };
    

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentQuiz(null);
        fetchAllQuizzes();
        onContentChange(); 
    };

    const filteredQuizzes = selectedFilter === 'All'
        ? allQuizzes
        : allQuizzes.filter(item => item.topic === selectedFilter);


    if (loading) {
        return <h3 style={{ textAlign: 'center' }}>Loading Full Quiz Library...</h3>;
    }

    const getStatusColor = (status) => {
        if (status === 'approved') return 'green';
        if (status === 'pending') return 'orange';
        if (status === 'rejected') return 'red';
        return 'gray';
    };

    // 6. Render the Quiz List AND the Modal
    return (
        <div className="content-library-container">
            <h3>Full Quiz Library (Total: {allQuizzes.length})</h3>
            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}

           
            <div className="filter-bar-crud">
                <label>Filter by Topic:</label>
                <select 
                    value={selectedFilter} 
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px' }}
                >
                 
                    <option value="All">All</option>
                    {subjectList && subjectList.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                    ))}
                </select>
                <span style={{marginLeft: '20px', fontWeight: 'bold'}}>
                    Showing {filteredQuizzes.length} quizzes in view.
                </span>
            </div>
            
            <p style={{marginBottom: '20px'}}>Use this to edit or permanently remove any quiz question from the system.</p>

            {filteredQuizzes.map((item) => (
                <div key={item._id} className="content-audit-card">
                    <div className="audit-info">
                        <strong>Topic: {item.topic}</strong>
                        <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>
                            {item.status.toUpperCase()}
                        </span>
                        <p className="question-snippet">Q: {item.questionText?.substring(0, 80) || 'No Question Text'}...</p>
                        <p className="question-snippet">Correct Answer Index: {item.correctAnswer}</p>
                        <small>ID: {item._id}</small>
                    </div>

                    <div className="audit-actions">
                        <button onClick={() => handleEdit(item)} className="edit-btn">
                            ✏️ Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(item._id, item.questionText)} 
                            className="reject-btn"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            ))}
            
            {/* 7. MODAL RENDERING */}
            {isModalOpen && currentQuiz && (
                <EditQuizModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal}
                    quizData={currentQuiz}
                    subjectList={subjectList} 
                />
            )}
        </div>
    );
};

export default QuizLibrary;
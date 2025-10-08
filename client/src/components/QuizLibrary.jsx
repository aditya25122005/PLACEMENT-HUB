// client/src/components/QuizLibrary.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 
import EditQuizModal from './EditQuizModal';
// NOTE: We assume you will create a similar EditQuizModal.jsx component if needed

// Topics list for filtering (Must match QuizQuestion.js enum)
const ALL_TOPICS_QUIZ = ['All', 'Aptitude', 'DSA-PLAN', 'HR', 'OS', 'DBMS', 'CN', 'REACT JS']; 

const QuizLibrary = ({ onContentChange }) => {
    const [allQuizzes, setAllQuizzes] = useState([]); // Changed name to allQuizzes
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
    // MODAL STATES (For editing quiz)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null); 
    
    // To track the currently selected topic filter
    const [selectedFilter, setSelectedFilter] = useState('All'); 


    // 1. Fetch ALL Quizzes (Pending, Approved, Rejected)
    const fetchAllQuizzes = async () => {
        setLoading(true);
        try {
            // ✅ CRITICAL FETCH: Hitting the GET /api/quiz/all route
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

    // 2. Delete Handler (The 'D' in CRUD)
    const handleDelete = async (id, question) => {
        // NOTE: window.confirm() replaces alert() for better user experience
        if (!window.confirm(`Are you sure you want to permanently delete quiz: "${question}"?`)) {
            return;
        }

        try {
            // ✅ CRITICAL ACTION: Hitting the DELETE /api/quiz/:id route
            await axios.delete(`/api/quiz/${id}`); 
            setMessage(`✅ Quiz "${question.substring(0, 30)}..." deleted successfully.`);
            
            // Refresh local list (Quizzes) and the main student view (for theory)
            fetchAllQuizzes(); 
            onContentChange(); 
        } catch (error) {
            setMessage(`❌ Error deleting quiz.`);
            console.error("Delete error:", error);
        }
    };
    
    // 3. Edit Handler (Opens the modal)
    const handleEdit = (quizItem) => {
        setCurrentQuiz(quizItem); // Load the data
        setIsModalOpen(true);     // Open the modal
        // NOTE: For a real hackathon, you would now implement EditQuizModal.jsx
    };
    
    // 4. Close Modal Handler (Refreshes data after update)
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentQuiz(null);
        fetchAllQuizzes(); // Refresh the library list
        onContentChange(); // Notify App.jsx to refresh student view
    };

    // 5. Filter Logic
    const filteredQuizzes = selectedFilter === 'All'
        ? allQuizzes
        : allQuizzes.filter(item => item.topic === selectedFilter);


    if (loading) {
        return <h3 style={{ textAlign: 'center' }}>Loading Full Quiz Library...</h3>;
    }
    
    // Helper to get status color (remains the same)
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
            {message && <p className="submission-message success">{message}</p>}

            {/* ✅ FILTER UI */}
            <div className="filter-bar-crud">
                <label>Filter by Topic:</label>
                <select 
                    value={selectedFilter} 
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px' }}
                >
                    {ALL_TOPICS_QUIZ.map(topic => (
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
            
            {/* 7. MODAL RENDERING (Uncomment this block) */}
                {isModalOpen && currentQuiz && (
                    <EditQuizModal 
                        isOpen={isModalOpen} 
                        onClose={handleCloseModal}
                        quizData={currentQuiz}
                    />
                )}
        </div>
    );
};

export default QuizLibrary;
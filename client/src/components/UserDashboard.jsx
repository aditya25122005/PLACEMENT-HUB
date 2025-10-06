import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

const ALL_TOPICS = ['Aptitude', 'DSA', 'HR', 'Core CS', 'OS', 'DBMS', 'CN']; 

const UserDashboard = ({ userId }) => {
    const [userScores, setUserScores] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch User Scores
    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                // NOTE: We need a new backend route to fetch user scores by ID
                // For the hackathon, we'll temporarily simulate fetching the user profile:
                // Since the full backend route hasn't been coded yet, we'll assume this API returns the user object with scores.
                const response = await axios.get(`/api/auth/profile/${userId}`); 
                
                // Assuming the backend returns an object like: { username: '...', scores: [{topic: 'Aptitude', highScore: 5}, ...] }
                setUserScores(response.data.scores || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user scores:", error);
                // For demo, load empty scores if API fails
                setUserScores([]); 
                setLoading(false);
            }
        };

        if (userId) {
            fetchScores();
        }
    }, [userId]); 

    // Helper function to calculate the percentage for the progress bar
    const getScorePercentage = (score) => {
        // Since quizzes are 5 questions long (as per QuizComponent.jsx)
        const MAX_SCORE = 20; 
        return (score / MAX_SCORE) * 100; 
    };

    if (loading) {
        return <p className="dashboard-loading">Loading your placement progress...</p>;
    }

    return (
        <section className="dashboard-section">
           <h2 className="section-title">📘 Your Systematic Progress Dashboard</h2>

            
            <div className="score-visual-grid">
                {ALL_TOPICS.map(topic => {
                    const scoreData = userScores.find(s => s.topic === topic);
                    const score = scoreData ? scoreData.highScore : 0;
                    const percentage = getScorePercentage(score);
                    
                    return (
                        <div key={topic} className="score-card">
                            <h3>{topic} Mastery</h3>
                            <p className="score-value">{score} / 20</p>
                            
                            {/* Visual Score Bar (The 'Visual Form' Requirement) */}
                            <div className="progress-bar-container">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: `${percentage}%` }}
                                >
                                    {percentage > 0 ? `${Math.round(percentage)}%` : ''}
                                </div>
                            </div>
                            
                            <small>Last Attempt: {scoreData ? new Date(scoreData.lastAttempt).toLocaleDateString() : 'N/A'}</small>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default UserDashboard;
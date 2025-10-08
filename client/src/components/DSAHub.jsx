// client/src/components/DSAHub.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

const DSAHub = ({ userId }) => {
    const [dsaProblems, setDsaProblems] = useState([]);
    const [solvedStatus, setSolvedStatus] = useState([]); // User's solved problem IDs
    const [loading, setLoading] = useState(true);

    // 1. Fetch All DSA Problems and User's Solved Status
    useEffect(() => {
        const fetchDsaData = async () => {
            try {
                // Fetch ALL approved problems that have a dsaProblemLink
                const problemsResponse = await axios.get('/api/quiz/all-dsa');
                console.log("Fetched DSA Data:", problemsResponse.data); 
                setDsaProblems(problemsResponse.data);

                // Fetch the user's solved status from the user profile route
                const userResponse = await axios.get(`/api/auth/profile/${userId}`);
                setSolvedStatus(userResponse.data.solvedDSA || []);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching DSA Hub data:", error);
                setLoading(false);
            }
        };

        if (userId) {
            fetchDsaData();
        }
    }, [userId]);


    // 2. Handler to Mark Problem as Solved/Unsolved
const handleToggleSolve = async (problemId) => {
    const isCurrentlySolved = solvedStatus.includes(problemId);
    
    try {
        // Hitting the new PUT /api/auth/solve-dsa/:userId route
        const response = await axios.put(`/api/auth/solve-dsa/${userId}`, { 
            problemId: problemId,
            isSolved: isCurrentlySolved 
        });
        setSolvedStatus(response.data.solvedDSA);
        
        
    } catch (error) {
        console.error("Failed to update solved status:", error);
        alert("Failed to update status. Please try again.");
    }
};

    if (loading) {
        return <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Loading DSA Hub... ⏳</h1>;
    }

    return (
        <div className="dsa-hub-container">
            <h1>🚀 Dedicated DSA Problem Hub</h1>
            <p className="subtitle">Track your progress on core coding questions.</p>
            
            <div className="dsa-summary-bar">
                Total Problems: {dsaProblems.length} | Solved: {solvedStatus.length} 
            </div>

            <div className="dsa-problem-list">
                {dsaProblems.map(problem => {
                    const isSolved = solvedStatus.includes(problem._id);
                    return (
                        <div key={problem._id} className={`dsa-problem-card ${isSolved ? 'solved' : ''}`}>
                            <div className="problem-info">
                                {/* Problem Title */}
                                <h4>[{problem.topic || 'General'}] {problem.question_text || 'No Title'}</h4>
                                
                                {/* ✅ FIX APPLIED: Explanation shown in collapsible <details> tag */}
                                <details>
                                     <summary>View Internal Solution/Approach</summary>
                                     {/* Full Explanation without substring cutting it off */}
                                     <p style={{marginTop: '10px', whiteSpace: 'pre-wrap'}}>
                                         {problem.explanation || 'No internal solution provided.'} 
                                     </p>
                                </details>
                            </div>
                            
                            <div className="problem-actions">
                                <a href={problem.dsaProblemLink} target="_blank" rel="noopener noreferrer" className="dsa-btn primary">
                                    Solve on Platform
                                </a>
                                <a href={problem.youtubeSolutionLink} target="_blank" rel="noopener noreferrer" className="dsa-btn secondary">
                                    Solution
                                </a>
                                
                                {/* Solved Status Button */}
                                <button 
                                    onClick={() => handleToggleSolve(problem._id)} 
                                    className={`solve-toggle-btn ${isSolved ? 'unmark' : 'mark'}`}
                                >
                                    {isSolved ? '✅ Mark Unsolved' : '❌ Mark Solved'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DSAHub;
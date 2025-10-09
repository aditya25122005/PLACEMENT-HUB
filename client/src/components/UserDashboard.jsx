// client/src/components/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

const MAX_QUIZ_SCORE = 5; // Fixed quiz score limit

// Helper function to render the Progress Ring (using SVG)
const renderProgressRing = (percentage, color) => {
    const radius = 25; // Smaller radius for better fit
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width="60" height="60" viewBox="0 0 60 60" style={{marginRight: '10px'}}>
            {/* Background Circle */}
            <circle 
                cx="30" 
                cy="30" 
                r={radius} 
                fill="none" 
                stroke="#e0e0e0" // Lighter background color
                strokeWidth="6"
            />
            {/* Progress Arc */}
            <circle 
                cx="30" 
                cy="30" 
                r={radius} 
                fill="none" 
                stroke={color} 
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
            {/* Percentage Text */}
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="10" fill="var(--text-dark)" fontWeight="700">
                {Math.round(percentage)}%
            </text>
        </svg>
    );
};


const UserDashboard = ({ userId, approvedContent, subjectList }) => { 
    const [userScores, setUserScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [videoProgress, setVideoProgress] = useState([]); 

    // Helper function to calculate percentage for score mastery
    const getScorePercentage = (score) => {
        return (score / MAX_QUIZ_SCORE) * 100; 
    };

    // 1. Fetch User Scores & Calculate Video Progress
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const contentSource = Array.isArray(approvedContent) ? approvedContent : [];

                const userResponse = await axios.get(`/api/auth/profile/${userId}`); 
                const userData = userResponse.data;
                
                setUserScores(userData.scores || []);
                
                // --- VIDEO PROGRESS CALCULATION LOGIC ---
                const progressData = [];
                const watchedIds = userData.watchedContent || [];

                subjectList.forEach(topic => { 
                    
                    const allTopicVideos = contentSource
                        .filter(item => item.topic === topic && item.youtubeEmbedLink);
                    
                    const totalVideos = allTopicVideos.length;

                    const watchedCount = allTopicVideos
                        .filter(item => watchedIds.includes(item._id))
                        .length;

                    progressData.push({
                        topic: topic,
                        total: totalVideos,
                        watched: watchedCount,
                        percentage: totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0
                    });
                });
                
                setVideoProgress(progressData); 
                setLoading(false);
            } catch (error) {
                console.error("Error fetching user dashboard data:", error);
                setUserScores([]); 
                setVideoProgress([]);
                setLoading(false);
            }
        };

        // Run only if user is logged in AND approvedContent AND subjectList are available
        if (userId && Array.isArray(approvedContent) && approvedContent.length > 0 && subjectList.length > 0) {
            fetchAllData();
        } else if (userId && Array.isArray(subjectList) && subjectList.length > 0) {
            setLoading(false);
        }
    }, [userId, approvedContent, subjectList]); 
    
    // Helper to get video progress for rendering
    const getVideoProgress = (topic) => {
        return videoProgress.find(p => p.topic === topic);
    };


    if (loading) {
        return <p className="dashboard-loading">Loading your placement progress...</p>;
    }
    
    // Render
    return (
        <section className="dashboard-section">
            <h2 className="section-title">📘 Your Systematic Progress Dashboard</h2>
            
            <div className="score-visual-grid">
                {subjectList.map(topic => {
                    const scoreData = userScores.find(s => s.topic === topic);
                    
                    // ✅ CRITICAL FIX: Use lastScore for display. If lastScore is null, use 0.
                    const scoreToDisplay = scoreData ? (scoreData.lastScore !== undefined ? scoreData.lastScore : 0) : 0;
                    
                    const quizPercentage = getScorePercentage(scoreToDisplay);
                    
                    const videoData = getVideoProgress(topic);
                    const videoPercentage = videoData ? videoData.percentage : 0;

                    return (
                        <div key={topic} className="score-card">
                            
                            {/* 1. Subject Header */}
                            <h3>{topic} Mastery</h3>

                            {/* 2. QUIZ MASTERY SECTION (RING + SCORE) */}
                            <div className="progress-section quiz-section">
                                
                                {/* Quiz Ring */}
                                {renderProgressRing(quizPercentage, 'var(--primary-color)')} 
                                
                                {/* Score Text */}
                                <div className="metric-text-area">
                                    <h4 style={{color: 'var(--text-dark)'}}>Last Quiz Score</h4>
                                    <p className="score-value">{scoreToDisplay} / {MAX_QUIZ_SCORE}</p>
                                    <small className="last-attempt-text">Last Attempt: {scoreData ? new Date(scoreData.lastAttempt).toLocaleDateString() : 'N/A'}</small>
                                </div>
                            </div>
                            
                            
                            {/* 3. VIDEO PROGRESS SECTION (RING + WATCHED COUNT) */}
                            <hr style={{margin: '15px 0', borderStyle: 'dashed', borderColor: '#e0e0e0'}}/>
                            
                            {videoData && videoData.total > 0 ? (
                                <div className="progress-section video-section">
                                    
                                    {/* Video Ring */}
                                    {renderProgressRing(videoPercentage, 'var(--progress-orange)')}
                                    
                                    {/* Watched Count Text */}
                                    <div className="metric-text-area">
                                        <h4 style={{color: 'var(--text-dark)'}}>Video Learning</h4>
                                        <p className="score-value">{videoData.watched} / {videoData.total} Watched</p>
                                        <small className="last-attempt-text">Total Resources: {videoData.total}</small>
                                    </div>
                                </div>
                            ) : (
                                <small style={{color: '#6c757d', display: 'block', marginTop: '10px'}}>No video resources available for tracking.</small>
                            )}
                            
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default UserDashboard;
// client/src/components/UserDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

const MAX_QUIZ_SCORE = 5; // Fixed quiz score limit

// UserDashboard now receives approvedContent AND subjectList from App.jsx
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
                // Fetch User Profile (contains scores, solvedDSA, and watchedContent)
                const userResponse = await axios.get(`/api/auth/profile/${userId}`); 
                const userData = userResponse.data;
                
                setUserScores(userData.scores || []);
                const progressData = [];
                const watchedIds = userData.watchedContent || [];

                // Use the dynamically fetched subjectList for iteration
                subjectList.forEach(topic => { 
                    // 1. Find all content items that are videos for this specific topic
                    const allTopicVideos = approvedContent
                        .filter(item => item.topic === topic && item.youtubeEmbedLink);
                    
                    const totalVideos = allTopicVideos.length;

                    // 2. Count how many of those videos are in the user's watched list
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

        if (userId && Array.isArray(approvedContent) && approvedContent.length > 0 && subjectList.length > 0) {
            fetchAllData();
        } else if (userId && Array.isArray(subjectList) && subjectList.length > 0) {
             // Load the dashboard if subjects are present, even if content is 0
            setLoading(false);
        }
    }, [userId, approvedContent, subjectList]); // Added subjectList to dependencies
    
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
                    const score = scoreData ? scoreData.highScore : 0;
                    const percentage = getScorePercentage(score);
                    const videoData = getVideoProgress(topic);

                    return (
                        <div key={topic} className="score-card">
                            <h3>{topic} Mastery</h3>
                            
                            {/* 1. QUIZ MASTERY */}
                            <p className="score-value">{score} / {MAX_QUIZ_SCORE}</p>
                            
                            {/* Quiz Mastery Bar */}
                            <div className="progress-bar-container">
                                <div 
                                    className="progress-bar" 
                                    style={{ width: score > 0 ? `${percentage}%` : '0%', backgroundColor: 'var(--secondary-color)' }}
                                >
                                    {score > 0 ? `${Math.round(percentage)}%` : ''}
                                </div>
                            </div>
                            
                            <small>Last Quiz Attempt: {scoreData ? new Date(scoreData.lastAttempt).toLocaleDateString() : 'N/A'}</small>
                            
                            <hr style={{margin: '10px 0', borderStyle: 'dashed'}}/>
                            
                            {/* 2. VIDEO PROGRESS VISUAL SECTION */}
                            {videoData && videoData.total > 0 ? (
                                <div className="video-progress-section">
                                    <small>Resources Watched ({videoData.watched} / {videoData.total})</small>
                                    <div className="progress-bar-container small-bar">
                                        <div 
                                            className="progress-bar" 
                                            style={{ width: `${videoData.percentage}%`, backgroundColor: '#ff9800' }}
                                        >
                                            {videoData.percentage > 0 ? `${Math.round(videoData.percentage)}%` : ''}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <small style={{color: '#6c757d'}}>No video resources available for tracking.</small>
                            )}
                            
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default UserDashboard;
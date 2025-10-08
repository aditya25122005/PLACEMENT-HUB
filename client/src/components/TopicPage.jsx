// client/src/components/TopicPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import QuizComponent from './QuizComponent'; 
import YouTube from 'react-youtube'; // For video playback
import '../App.css'; 

const getDsaContent = (content) => content.filter(item => item.dsaProblemLink);

const getVideoResources = (content) => content.filter(item => item.youtubeEmbedLink);

const getStudyMaterial = (content) => content.filter(item => 
    !item.dsaProblemLink && 
    !item.youtubeEmbedLink
);

const TopicPage = ({ topicName, content, userId }) => {
    const [activeTab, setActiveTab] = useState('study');

    // Filter content into three distinct groups
    const studyMaterial = getStudyMaterial(content);
    const dsaContent = getDsaContent(content);
    const videoResources = getVideoResources(content);
    const handleVideoClick = async (contentId) => {
        try {
            // Hitting the API to mark content as watched
            await axios.put(`/api/auth/watch-content/${userId}`, { contentId });
            // Force the main App to re-fetch user data to update the dashboard charts
            window.location.reload(); 
        } catch (error) {
            console.error("Failed to mark video watched:", error);
        }
    };
    const renderStudyMaterial = () => (
        <div className="study-material-section">
            <h3>📖 Theory & Explanations ({studyMaterial.length} Items)</h3>
            {studyMaterial.length === 0 ? (
                <p>No study material found. Please submit content via the form!</p>
            ) : (
                studyMaterial.map(item => (
                    <div key={item._id} className="study-item-card">
                      
                        {item.question_text && <p><strong>{item.question_text}</strong></p>}
                        
                        <details>
                            <summary>Details</summary>
                            <p>{item.explanation}</p>
                            <small>Source: {item.source_url || 'N/A'}</small>
                        </details>
                    </div>
                ))
            )}
        </div>
    );

    // ✅ NEW: Render Best Resources (Video Embeds) Section
    const renderBestResources = () => (
        <div className="best-resources-section">
            <h3>🎥 Best Video Resources ({videoResources.length} Items)</h3>
            
            {videoResources.length === 0 ? (
                <p>No video resources found for {topicName}. Please ask the moderator to add some.</p>
            ) : (
                <div className="video-grid">
                    {videoResources.map(item => {
                        // Safety check: ensure link is present before rendering iframe
                        if (!item.youtubeEmbedLink) return null;

                        return (
                            <div key={item._id} className="video-card">
                                {/* ✅ FIX: Use videoTitle field for the header */}
                                <h4>{item.videoTitle || item.question_text || "Video Resource"}</h4>
                                
                                {/* Iframe must be wrapped in a div with onClick handler */}
                                <div onClick={() => handleVideoClick(item._id)} className="video-embed-wrapper">
                                    <YouTube
                                        videoId={item.youtubeEmbedLink} 
                                        opts={{
                                            width: '100%',
                                            height: '200',
                                            playerVars: { controls: 1, modestbranding: 1, rel: 0 },
                                        }}
                                        onEnd={() => handleVideoClick(item._id)}
                                        title={item.videoTitle || item.question_text} 
                                    />
                                </div>
                                
                                {/* Show explanation snippet or fallback */}
                                <p style={{marginTop: '10px'}}>
                                    {item.explanation?.substring(0, 80) || 'Verified explanatory video.'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // Render DSA Problems Section
    const renderDsaProblems = () => (
        <div className="dsa-section">
            <h3>🔗 Important DSA Problems ({dsaContent.length} Problems)</h3>
            {dsaContent.length === 0 ? (
                <p>No DSA problems found for {topicName}.</p>
            ) : (
                dsaContent.map(item => (
                    <div key={item._id} className="dsa-item-card">
                        <p><strong>{item.question_text}</strong></p>
                        <div className="dsa-links">
                            <a href={item.dsaProblemLink} target="_blank" rel="noopener noreferrer" className="dsa-btn primary">
                                Solve Problem
                            </a>
                            <a href={item.youtubeSolutionLink} target="_blank" rel="noopener noreferrer" className="dsa-btn secondary">
                                Watch Solution (YouTube)
                            </a>
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    return (
        <div className="topic-page-container">
            <h2>{topicName} Preparation Hub</h2>
            <p>Systematic approach for mastering {topicName}.</p>

            <div className="tab-navigation">
                <button 
                    className={activeTab === 'study' ? 'active-tab-btn' : ''} 
                    onClick={() => setActiveTab('study')}
                >
                    Study Material
                </button>
                <button 
                    className={activeTab === 'quiz' ? 'active-tab-btn' : ''} 
                    onClick={() => setActiveTab('quiz')}
                >
                    Take Quiz
                </button>
                <button 
                    className={activeTab === 'dsa' ? 'active-tab-btn' : ''} 
                    onClick={() => setActiveTab('dsa')}
                >
                    Practice Problems
                </button>
                {/* ✅ BEST RESOURCES TAB */}
                <button 
                    className={activeTab === 'resources' ? 'active-tab-btn' : ''} 
                    onClick={() => setActiveTab('resources')}
                >
                    ⭐ Best Resources
                </button>
            </div>
            
            <div className="tab-content">
                {activeTab === 'study' && renderStudyMaterial()}
                
                {activeTab === 'quiz' && <QuizComponent topicName={topicName} userId={userId} />}
                
                {activeTab === 'dsa' && renderDsaProblems()}

                {activeTab === 'resources' && renderBestResources()}
            </div>
        </div>
    );
};

export default TopicPage;
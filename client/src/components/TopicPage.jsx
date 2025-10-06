// client/src/components/TopicPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import QuizComponent from './QuizComponent'; // Import the new Quiz Component
import '../App.css'; // Global styling import

// DSA links ke liye helper function:
const getDsaContent = (content) => content.filter(item => item.dsaProblemLink);
// Study material (Theory/Notes) ke liye:
const getStudyMaterial = (content) => content.filter(item => !item.dsaProblemLink);


// Component Signature: userId prop ko receive karna zaroori hai
const TopicPage = ({ topicName, content, userId }) => {
    // NOTE: fetchApprovedContent prop ki zaroorat yahan direct nahi hai, isliye humne use hata diya hai.
    // Score update ke baad App.jsx khud refresh ho jayega.
    
    // State to manage the tab view: 'study', 'quiz', 'dsa'
    const [activeTab, setActiveTab] = useState('study');

    const studyMaterial = getStudyMaterial(content);
    const dsaContent = getDsaContent(content);


    // Render Study Material Section
    const renderStudyMaterial = () => (
        <div className="study-material-section">
            <h3>📖 Theory & Explanations ({studyMaterial.length} Items)</h3>
            {studyMaterial.length === 0 ? (
                <p>No study material found. Please submit content via the form!</p>
            ) : (
                studyMaterial.map(item => (
                    <div key={item._id} className="study-item-card">
                        <p><strong>{item.question_text}</strong></p>
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
                    DSA Problems
                </button>
            </div>
            
            <div className="tab-content">
                {activeTab === 'study' && renderStudyMaterial()}
                
                {/* ✅ CRITICAL FIX: userId prop is now passed to QuizComponent */}
                {activeTab === 'quiz' && <QuizComponent topicName={topicName} userId={userId} />}
                
                {activeTab === 'dsa' && renderDsaProblems()}
            </div>
        </div>
    );
};

export default TopicPage;
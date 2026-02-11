import React, { useState } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import QuizComponent from './QuizComponent';
import '../App.css';

const getDsaContent = (content) => content.filter(item => item.dsaProblemLink);
const getVideoResources = (content) => content.filter(item => item.youtubeEmbedLink);

// ⭐ Study material = ONLY TEXT THEORY
const getStudyMaterial = (content) => content.filter(item =>
    !item.dsaProblemLink &&
    !item.youtubeEmbedLink &&
    item.contentType !== "pdf"
);

// ⭐ NEW PDF NOTES FILTER
const getPdfNotes = (content) => content.filter(item => item.contentType === "pdf");

const TopicPage = ({ topicName, content, userId }) => {

    const [activeTab, setActiveTab] = useState('study');

    const studyMaterial = getStudyMaterial(content);
    const dsaContent = getDsaContent(content);
    const videoResources = getVideoResources(content);
    const pdfNotes = getPdfNotes(content);

    const handleVideoClick = async (contentId) => {
        try {
            await axios.put(`/api/auth/watch-content/${userId}`, { contentId });
            window.location.reload();
        } catch (error) {
            console.error("Failed to mark video watched:", error);
        }
    };

    // =====================================================
    // TEXT THEORY TAB
    // =====================================================
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

    // =====================================================
    // ⭐ PDF NOTES TAB (NEW)
    // =====================================================
    const renderNotes = () => (
        <div className="notes-section">
            <h3>📄 PDF Notes ({pdfNotes.length} Files)</h3>

            {pdfNotes.length === 0 ? (
                <p>No PDF notes uploaded for {topicName}.</p>
            ) : (
                pdfNotes.map(item => (
                    <div key={item._id} className="study-item-card">
                        <p><strong>📄 {item.question_text || "PDF Notes"}</strong></p>

                        <a
                            href={`http://localhost:5000${item.pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dsa-btn primary"
                        >
                            Open PDF
                        </a>
                    </div>
                ))
            )}
        </div>
    );

    // =====================================================
    // VIDEO TAB
    // =====================================================
    const renderBestResources = () => (
        <div className="best-resources-section">
            <h3>🎥 Best Video Resources ({videoResources.length} Items)</h3>

            {videoResources.length === 0 ? (
                <p>No video resources found for {topicName}. Please ask the moderator to add some.</p>
            ) : (
                <div className="video-grid">
                    {videoResources.map(item => {

                        if (!item.youtubeEmbedLink) return null;

                        return (
                            <div key={item._id} className="video-card">

                                <h4>{item.videoTitle || item.question_text || "Video Resource"}</h4>

                                <div className="video-embed-wrapper">
                                    <YouTube
                                        videoId={item.youtubeEmbedLink}
                                        opts={{
                                            width: '100%',
                                            height: '200',
                                            playerVars: { controls: 1, modestbranding: 1, rel: 0 },
                                        }}
                                        onEnd={() => handleVideoClick(item._id)}
                                        onPlay={() => handleVideoClick(item._id)}
                                        title={item.videoTitle || item.question_text}
                                    />
                                </div>

                                <p style={{ marginTop: '10px' }}>
                                    {item.explanation?.substring(0, 80) || 'Verified explanatory video.'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // =====================================================
    // DSA TAB
    // =====================================================
    const renderDsaProblems = () => (
        <div className="dsa-section">
            <h3>🔗 Practice Problems ({dsaContent.length} Problems)</h3>

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

    // =====================================================
    // MAIN UI
    // =====================================================
    return (
        <div className="topic-page-container">
            <h2>{topicName} Preparation Hub</h2>
            <p>Systematic approach for mastering {topicName}.</p>

            <div className="tab-navigation">
                <button className={activeTab === 'study' ? 'active-tab-btn' : ''} onClick={() => setActiveTab('study')}>
                    Study Material
                </button>

                <button className={activeTab === 'quiz' ? 'active-tab-btn' : ''} onClick={() => setActiveTab('quiz')}>
                    Take Quiz
                </button>

                <button className={activeTab === 'dsa' ? 'active-tab-btn' : ''} onClick={() => setActiveTab('dsa')}>
                    Practice Problems
                </button>

                <button className={activeTab === 'resources' ? 'active-tab-btn' : ''} onClick={() => setActiveTab('resources')}>
                    ⭐ Best Resources
                </button>

                {/* ⭐ NEW NOTES TAB */}
                <button className={activeTab === 'notes' ? 'active-tab-btn' : ''} onClick={() => setActiveTab('notes')}>
                    📄 Notes
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'study' && renderStudyMaterial()}
                {activeTab === 'quiz' && <QuizComponent topicName={topicName} userId={userId} />}
                {activeTab === 'dsa' && renderDsaProblems()}
                {activeTab === 'resources' && renderBestResources()}
                {activeTab === 'notes' && renderNotes()}
            </div>
        </div>
    );
};

export default TopicPage;

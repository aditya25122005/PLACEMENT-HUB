import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminDashboard from './components/AdminDashboard';
import AuthScreen from './components/AuthScreen';
import ContentSubmissionForm from './components/ContentSubmissionForm';
import TopicPage from './components/TopicPage'; 
import UserDashboard from './components/UserDashboard'; 
import DSAHub from './components/DSAHub'; // NEW IMPORT for dedicated DSA page
import './App.css'; 

// ✅ FINALIZED TOPICS LIST: DSA is now separate, Core CS is split into components.
const TOPICS = ['Aptitude', 'HR', 'OS', 'DBMS', 'CN']; 

// Helper function to group content by topic
const groupContentByTopic = (contentArray) => {
    return contentArray.reduce((acc, content) => {
        const topic = content.topic;
        if (!acc[topic]) {
            acc[topic] = []; 
        }
        acc[topic].push(content);
        return acc;
    }, {});
};

// Helper function to get user info from localStorage
const getLocalUserInfo = () => {
    const storedInfo = localStorage.getItem('userInfo');
    return storedInfo ? JSON.parse(storedInfo) : null;
};

const App = () => {
    // Authentication State
    const [userInfo, setUserInfo] = useState(getLocalUserInfo()); 
    
    // UI States
    const [isModerator, setIsModerator] = useState(false); 
    const [loading, setLoading] = useState(true);
    
    // Navigation and Content States
    const [approvedContent, setApprovedContent] = useState([]);
    const [groupedContent, setGroupedContent] = useState({}); 
    const [selectedTopic, setSelectedTopic] = useState(null); 
    // ✅ NEW STATE: DSA Hub toggle
    const [isDSAHubActive, setIsDSAHubActive] = useState(false); 


    // --- Core Function: Fetch Approved Content ---
    const fetchApprovedContent = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/content/approved');
            const data = response.data;
            
            setApprovedContent(data);
            setGroupedContent(groupContentByTopic(data));
            setLoading(false);
        } catch (error) {
            console.error("Error fetching approved content:", error);
            setLoading(false);
        }
    };

    // --- Logout Function ---
    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null); 
        window.location.reload(); 
    };

    // --- INITIAL EFFECT: Load Content & Check Role ---
    useEffect(() => {
        fetchApprovedContent();
        
        if (userInfo && userInfo.role === 'moderator') {
            setIsModerator(true);
        } else {
            setIsModerator(false);
        }
    }, [userInfo]); 

    
    // --- Render Logic: NOT Logged In ---
    if (!userInfo) {
        return (
            <div className="container">
                <header className="main-header">
                    <h1>Verified Placement Prep Hub 🌟</h1>
                </header>
                <AuthScreen />
            </div>
        );
    }

    
    // --- Render Logic: Moderator View ---
    if (isModerator) {
        return (
            <div className="moderator-view">
                <header className="mod-header">
                    <button onClick={() => setIsModerator(false)} className="switch-btn">
                        Switch to Student View
                    </button>
                    <h1>Admin Panel (Logged in as {userInfo.username})</h1>
                    <button onClick={handleLogout} className="reject-btn">Logout</button>
                </header>
                <AdminDashboard 
                    onContentApprovedOrAdded={fetchApprovedContent} 
                /> 
            </div>
        );
    }
    
    // --- Render Logic: Dedicated DSA Hub View ---
    if (isDSAHubActive) {
        return (
            <div className="container">
                <button onClick={() => setIsDSAHubActive(false)} className="switch-btn" style={{marginBottom: '20px'}}>
                    Back to Topics Dashboard
                </button>
                <DSAHub userId={userInfo._id} /> 
            </div>
        );
    }

    // --- Render Logic: Topic Page View (User has clicked a standard topic) ---
    if (selectedTopic) {
        return (
            <div className="container">
                <button onClick={() => setSelectedTopic(null)} className="switch-btn" style={{marginBottom: '20px'}}>
                    Back to Topics Dashboard
                </button>
                <TopicPage 
                    topicName={selectedTopic} 
                    content={groupedContent[selectedTopic] || []} 
                    userId={userInfo._id} 
                />
            </div>
        );
    }


    // --- Render Logic: Main Student Dashboard (Default View - Logged In) ---
    if (loading) {
        return <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard... ⏳</h1>;
    }

    return (
        <div className="container">
            <header className="main-header">
                <div>
                    <h1>Welcome, {userInfo.username}!</h1>
                    <small>Your personalized placement preparation hub 🚀</small>
                </div>
                <div>
                    {/* ✅ DSA HUB BUTTON */}
                    <button onClick={() => setIsDSAHubActive(true)} className="mod-login-btn" style={{marginRight: '10px'}}>
                        🔗 DSA Problem Hub
                    </button>
                    <button onClick={handleLogout} className="reject-btn">Logout</button>
                </div>
            </header>
            
            {/* 1. VISUAL DASHBOARD SECTION */}
            <UserDashboard userId={userInfo._id} /> 

            {/* 2. TOPIC SELECTION SECTION */}
            <section className="topics-dashboard">
                <h2>Choose a Topic to Start Your Systematic Prep</h2>
                
                <div className="topics-cards-container">
                    {TOPICS.map(topic => (
                        <div 
                            key={topic} 
                            className="topic-card-summary" 
                            onClick={() => setSelectedTopic(topic)}
                        >
                            <h3 className="card-title">{topic}</h3>
                            <p>{groupedContent[topic] ? groupedContent[topic].length : 0} Verified Items</p>
                            <span className="topic-action-tag">Click to View & Practice →</span>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* 3. SUBMISSION SECTION */}
            <section className="submission-section">
                <ContentSubmissionForm onSubmissionSuccess={fetchApprovedContent} />
            </section>
            
        </div>
    );
};

export default App;
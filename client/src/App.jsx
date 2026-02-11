import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminDashboard from './components/AdminDashboard';
import AuthScreen from './components/AuthScreen';
import ContentSubmissionForm from './components/ContentSubmissionForm';
import TopicPage from './components/TopicPage';
import UserDashboard from './components/UserDashboard';
import DSAHub from './components/DSAHub';
import CompaniesSection from './components/CompaniesSection';
import ProfilePage from './components/ProfilePage';
import './App.css';

// Helper function to group content by topic
const groupContentByTopic = (contentArray) => {
    return contentArray.reduce((acc, content) => {
        const topic = content.topic;
        if (!acc[topic]) acc[topic] = [];
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

    // Navigation States
    const [approvedContent, setApprovedContent] = useState([]);
    const [groupedContent, setGroupedContent] = useState({});
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isDSAHubActive, setIsDSAHubActive] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Subjects
    const [subjectList, setSubjectList] = useState([]);

    // --- Fetch Approved Content ---
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

    // --- Logout ---
    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setUserInfo(null);
        window.location.reload();
    };

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selectedTopic, isDSAHubActive, isProfileOpen]);

    // Initial data loading
    useEffect(() => {

        const fetchSubjects = async () => {
            try {
                const response = await axios.get('/api/subjects/all');

                setSubjectList(
                    response.data
                        .filter(s => s.name !== 'All')
                        .map(s => s.name)
                );
            } catch (error) {
                console.error("Failed to fetch subject list:", error.message);
            }
        };

        if (userInfo && userInfo.role === 'moderator') {
            setIsModerator(true);
        } else {
            setIsModerator(false);
        }

        fetchSubjects();
        fetchApprovedContent();

    }, [userInfo]);

    // --- NOT LOGGED IN ---
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

    // --- MODERATOR VIEW ---
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
                    subjectList={subjectList}
                />
            </div>
        );
    }

    // --- PROFILE PAGE VIEW ⭐ NEW ---
    if (isProfileOpen) {
    return (
        <div className="container">
            <ProfilePage
                userId={userInfo._id}
                onBack={async () => {
                    try {
                        // 🔥 REFRESH USER INFO FROM BACKEND
                        const res = await axios.get(`/api/auth/profile/${userInfo._id}`);

                        localStorage.setItem("userInfo", JSON.stringify(res.data));
                        setUserInfo(res.data);

                    } catch (err) {
                        console.error("Failed to refresh userInfo", err);
                    }

                    setIsProfileOpen(false);
                }}
            />
        </div>
    );
}


    // --- DSA HUB VIEW ---
    if (isDSAHubActive) {
        return (
            <div className="container">
                <button
                    onClick={() => setIsDSAHubActive(false)}
                    className="switch-btn"
                    style={{ marginBottom: '20px' }}
                >
                    Back to Topics Dashboard
                </button>
                <DSAHub userId={userInfo._id} />
            </div>
        );
    }

    // --- TOPIC PAGE VIEW ---
    if (selectedTopic) {
        return (
            <div className="container">
                <button
                    onClick={() => setSelectedTopic(null)}
                    className="switch-btn"
                    style={{ marginBottom: '20px' }}
                >
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

    // --- LOADING ---
    if (loading) {
        return <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard... ⏳</h1>;
    }

    // --- MAIN STUDENT DASHBOARD ---
    return (
        <div className="container">
            <header className="main-header">
                <div>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

                            <img
                            src={
                                userInfo?.dp
                                ? `http://localhost:5000${userInfo.dp}`
                                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                            }
                            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                            alt="dp"
                            />

                            <h1>Welcome, {userInfo?.username}!</h1>

                        </div>
                        </div>

                    <small>Your personalized placement preparation hub 🚀</small>
                </div>

                <div>
                    {/* ⭐ PROFILE BUTTON ADDED */}
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="switch-btn"
                        style={{ marginRight: '10px' }}
                    >
                        👤 Profile
                    </button>

                    <button
                        onClick={() => setIsDSAHubActive(true)}
                        className="mod-login-btn"
                        style={{ marginRight: '10px' }}
                    >
                        🔗 DSA Problem Hub
                    </button>

                    <button onClick={handleLogout} className="reject-btn">
                        Logout
                    </button>
                </div>
            </header>

            {/* DASHBOARD */}
            <UserDashboard
                userId={userInfo._id}
                approvedContent={approvedContent}
                subjectList={subjectList}
            />

            {/* TOPIC SELECTION */}
            <section className="topics-dashboard">
                <h2>Choose a Topic to Start Your Systematic Prep</h2>

                <div className="topics-cards-container">
                    {subjectList.map(topicName => (
                        <div
                            key={topicName}
                            className="topic-card-summary"
                            onClick={() => setSelectedTopic(topicName)}
                        >
                            <h3 className="card-title">{topicName}</h3>
                            <p>{groupedContent[topicName] ? groupedContent[topicName].length : 0} Verified Items</p>
                            <span className="topic-action-tag">Click to View & Practice →</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* <CompaniesSection /> */}

            {/* SUBMISSION */}
            <section className="submission-section">
                <ContentSubmissionForm
                    onSubmissionSuccess={fetchApprovedContent}
                    subjectList={subjectList}
                />
            </section>
        </div>
    );
};

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OfficialContentForm from './OfficialContentForm'; 
import PendingContentManager from './PendingContentManager'; 
import QuizManagement from './QuizManagement'; 
import ContentLibrary from './ContentLibrary';
import QuizLibrary from './QuizLibrary';
import SubjectManager from './SubjectManager'; 

import '../App.css'

// Component now receives the dynamic subject list from App.jsx
const AdminDashboard = ({ onContentApprovedOrAdded, subjectList }) => { 
    const [activeTab, setActiveTab] = useState('pending_content');
    
    // ✅ NEW STATE: To store the pending count for the tab badge
    const [pendingContentCount, setPendingContentCount] = useState(0); 
    const [pendingQuizCount, setPendingQuizCount] = useState(0);

    // -------------------------------------------------------------
    // ✅ NEW LOGIC: Fetch Pending Counts for Badges
    // -------------------------------------------------------------
    const fetchPendingCounts = async () => {
        try {
            // Fetch Content Pending Count (from Content.js model)
            const contentResponse = await axios.get('/api/content/pending');
            setPendingContentCount(contentResponse.data.length);
            
            // Fetch Quiz Pending Count (from QuizQuestion.js model)
            const quizResponse = await axios.get('/api/quiz/pending');
            setPendingQuizCount(quizResponse.data.length);

        } catch (error) {
            console.error("Failed to fetch pending counts.", error);
            setPendingContentCount('!'); // Show error icon/symbol on failure
            setPendingQuizCount('!');
        }
    };
    
    // Run fetchPendingCounts on initial load and whenever content changes (approval/deletion)
    useEffect(() => {
        fetchPendingCounts();
    }, [onContentApprovedOrAdded]); 
    // -------------------------------------------------------------


    // Tab List (Updated with dynamic counts and icons)
    const tabs = [
        { 
            id: 'pending_content', 
            name: `Verify Submissions (${pendingContentCount})`,
            icon: '📝', 
            count: pendingContentCount 
        },
        { id: 'add_official', name: 'Add Official Material', icon: '➕' },
        { id: 'manage_quizzes', name: 'Manage Quizzes', icon: '❓' },
        { id: 'content_library', name: 'Content Library', icon: '📚' },
        { id: 'quiz_library', name: 'Quiz Library', icon: '📊' },
        // ✅ NEW TAB ADDED
        { id: 'subject_manager', name: 'Subject Manager', icon: '⚙️' },
    ];

    // Renders the component based on the active tab
    const renderTabContent = () => {
        // Helper function to refresh content/subjects across the app
        const refreshAppContent = () => {
            onContentApprovedOrAdded(); // Refresh main dashboard/topic data
            fetchPendingCounts(); // Refresh the tab badges/counts
        };

        switch (activeTab) {
            case 'pending_content':
                // Passing the combined refresh function
                return <PendingContentManager onContentApproved={refreshAppContent} subjectList={subjectList} />; 
                
            case 'add_official':
                return <OfficialContentForm onContentAdded={refreshAppContent} subjectList={subjectList} />;
                
            case 'manage_quizzes':
                // NOTE: This tab currently shows the QUIZ ADD form. We pass the refresh function.
                return <QuizManagement onContentChange={refreshAppContent} subjectList={subjectList} />; 
                
            case 'content_library':
                return <ContentLibrary onContentChange={refreshAppContent} subjectList={subjectList} />; 
            
            case 'quiz_library':
                // QuizLibrary needs the full refresh function for delete/edit operations
                return <QuizLibrary onContentChange={refreshAppContent} subjectList={subjectList} />; 
                
            case 'subject_manager':
                // SubjectManager needs refresh to update the main dashboard topic cards
                return <SubjectManager onSubjectsUpdated={refreshAppContent} />;
                
            default:
                return <PendingContentManager onContentApproved={refreshAppContent} subjectList={subjectList} />;
        }
    };

    return (
        <div className="admin-dashboard-container">
            <h2>Systematic Admin Panel</h2>
            
            {/* Tab Navigation */}
            <div className="tab-navigation admin-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={activeTab === tab.id ? 'active-tab-btn' : ''}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {/* ✅ FINAL FIX: Display icon, name, and pending badge if count > 0 */}
                        {tab.icon} {tab.name}
                        {/* Optionally add a red badge for the count > 0 */}
                        {tab.count > 0 && tab.id !== 'manage_quizzes' && (
                            <span className="pending-badge"></span>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Tab Content Area */}
            <div className="tab-content admin-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
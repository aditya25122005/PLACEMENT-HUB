import React, { useState } from 'react';
import OfficialContentForm from './OfficialContentForm'; 
import PendingContentManager from './PendingContentManager'; 
import QuizManagement from './QuizManagement'; 
import ContentLibrary from './ContentLibrary';
import QuizLibrary from './QuizLibrary';
import '../App.css'

// Tab List
const tabs = [
    { id: 'pending_content', name: 'Verify Submissions' },
    { id: 'add_official', name: 'Add Official Material' },
    { id: 'manage_quizzes', name: 'Manage Quizzes' },
    // ✅ NEW TAB for Full CRUD Control
    { id: 'content_library', name: 'Content Library' },
    { id: 'quiz_library', name: 'Quiz Library' },
];

const AdminDashboard = ({ onContentApprovedOrAdded, fetchApprovedContent }) => {
    const [activeTab, setActiveTab] = useState('pending_content');
    
    // Renders the component based on the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending_content':
                // Handles submissions approval/rejection
                return <PendingContentManager onContentApproved={onContentApprovedOrAdded} />; 
                
            case 'add_official':
                // Handles direct official content creation
                return <OfficialContentForm onContentAdded={onContentApprovedOrAdded} />;
                
            case 'manage_quizzes':
                // Handles adding new quizzes and moderating pending quizzes
                return <QuizManagement />; 
                
            case 'content_library':
                // ✅ NEW CASE: Content Library for CRUD operations
                // We pass fetchApprovedContent to trigger a full content refresh after any Delete/Edit action
                return <ContentLibrary onContentChange={onContentApprovedOrAdded} />; 
            
            case 'quiz_library':
            // Pass the onContentChange prop for refresh logic
            return <QuizLibrary onContentChange={onContentApprovedOrAdded} />;     
                
            default:
                return <PendingContentManager onContentApproved={onContentApprovedOrAdded} />;
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
                        {tab.name}
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
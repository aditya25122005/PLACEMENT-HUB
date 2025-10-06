import React, { useState } from 'react';
import OfficialContentForm from './OfficialContentForm'; // Reuse: Official content input
// Assuming you rename and modify ModeratorDashboard to handle the pending list
import PendingContentManager from './PendingContentManager'; 
import QuizManagement from './QuizManagement'; // NEW Component for quiz adding/approving
import '../App.css'
const AdminDashboard = ({ onContentApprovedOrAdded, fetchApprovedContent }) => {
    const [activeTab, setActiveTab] = useState('pending_content');
    
    // Tab List
    const tabs = [
        { id: 'pending_content', name: 'Verify Student Submissions' },
        { id: 'add_official', name: 'Add Official Material' },
        { id: 'manage_quizzes', name: 'Manage Quizzes' },
    ];

    // Renders the component based on the active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending_content':
                // Reuse the logic from your old ModeratorDashboard but rename it
                return <PendingContentManager onContentApproved={onContentApprovedOrAdded} />; 
            case 'add_official':
                // Reuse the OfficialContentForm
                return <OfficialContentForm onContentAdded={onContentApprovedOrAdded} />;
            case 'manage_quizzes':
                // New component to add/approve quiz questions
                return <QuizManagement />; 
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
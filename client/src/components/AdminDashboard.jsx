import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OfficialContentForm from './OfficialContentForm'; 
import PendingContentManager from './PendingContentManager'; 
import QuizManagement from './QuizManagement'; 
import ContentLibrary from './ContentLibrary';
import QuizLibrary from './QuizLibrary';
import SubjectManager from './SubjectManager'; 

import '../App.css'


const AdminDashboard = ({ onContentApprovedOrAdded, subjectList }) => { 
    const [activeTab, setActiveTab] = useState('pending_content');
    
    
    const [pendingContentCount, setPendingContentCount] = useState(0); 
    const [pendingQuizCount, setPendingQuizCount] = useState(0);

    const fetchPendingCounts = async () => {
        try {
           
            const contentResponse = await axios.get('/api/content/pending');
            setPendingContentCount(contentResponse.data.length);
 
            const quizResponse = await axios.get('/api/quiz/pending');
            setPendingQuizCount(quizResponse.data.length);

        } catch (error) {
            console.error("Failed to fetch pending counts.", error);
            setPendingContentCount('!'); 
            setPendingQuizCount('!');
        }
    };
    
    useEffect(() => {
        fetchPendingCounts();
    }, [onContentApprovedOrAdded]); 
  


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
        { id: 'subject_manager', name: 'Subject Manager', icon: '⚙️' },
    ];

    
    const renderTabContent = () => {
        const refreshAppContent = () => {
            onContentApprovedOrAdded(); 
            fetchPendingCounts(); 
        };

        switch (activeTab) {
            case 'pending_content':
                return <PendingContentManager onContentApproved={refreshAppContent} subjectList={subjectList} />; 
                
            case 'add_official':
                return <OfficialContentForm onContentAdded={refreshAppContent} subjectList={subjectList} />;
                
            case 'manage_quizzes':
        
                return <QuizManagement onContentChange={refreshAppContent} subjectList={subjectList} />; 
                
            case 'content_library':
                return <ContentLibrary onContentChange={refreshAppContent} subjectList={subjectList} />; 
            
            case 'quiz_library':
                
                return <QuizLibrary onContentChange={refreshAppContent} subjectList={subjectList} />; 
                
            case 'subject_manager':
                
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
                       
                        {tab.icon} {tab.name}
                        
                        {tab.count > 0 && tab.id !== 'manage_quizzes' && (
                            <span className="pending-badge"></span>
                        )}
                    </button>
                ))}
            </div>
            
          
            <div className="tab-content admin-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
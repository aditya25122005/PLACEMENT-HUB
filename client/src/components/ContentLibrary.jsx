// client/src/components/ContentLibrary.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 
import EditContentModal from './EditContentModal'; 

// Topics list for filtering (Must match Content.js enum)
const ALL_TOPICS_FILTER = ['All', 'Aptitude', 'DSA', 'HR', 'OS', 'DBMS', 'CN', 'Core CS']; 

const ContentLibrary = ({ onContentChange }) => {
    const [allContent, setAllContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    
    // MODAL STATES
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState(null); 
    
    // ✅ NEW STATE: To track the currently selected topic filter
    const [selectedFilter, setSelectedFilter] = useState('All'); 


    // 1. Fetch ALL Content (Pending, Approved, Rejected)
    const fetchAllContent = async () => {
        setLoading(true);
        try {
            // Hitting the new GET /api/content/all route
            const response = await axios.get('/api/content/all'); 
            setAllContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching all content:", error);
            setMessage("Error fetching content library.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllContent();
    }, []);

    // 2. Delete Handler (The 'D' in CRUD)
    const handleDelete = async (id, question) => {
        // NOTE: We replace alert() with window.confirm() for browser compatibility
        if (!window.confirm(`Are you sure you want to permanently delete: "${question}"?`)) {
            return;
        }

        try {
            await axios.delete(`/api/content/${id}`);
            setMessage(`✅ Content deleted successfully.`);
            
            // Refresh local list and the main student view
            fetchAllContent(); 
            onContentChange(); 
        } catch (error) {
            setMessage(`❌ Error deleting content.`);
            console.error("Delete error:", error);
        }
    };
    
    // 3. Edit Handler (Opens the modal)
    const handleEdit = (contentItem) => {
        setCurrentContent(contentItem); // Load the data
        setIsModalOpen(true);          // Open the modal
    };
    
    // 4. Close Modal Handler (Refreshes data after update)
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentContent(null);
        fetchAllContent(); // Refresh the library list
        onContentChange(); // Notify App.jsx to refresh student view
    };

    // 5. Filter Logic
    const filteredContent = selectedFilter === 'All'
        ? allContent
        : allContent.filter(item => item.topic === selectedFilter);


    if (loading) {
        return <h3 style={{ textAlign: 'center' }}>Loading Full Content Library...</h3>;
    }
    
    // Helper to get status color (remains the same)
    const getStatusColor = (status) => {
        if (status === 'approved') return 'green';
        if (status === 'pending') return 'orange';
        if (status === 'rejected') return 'red';
        return 'gray';
    };

    // 6. Render the Content Table/List AND the Modal
    return (
        <div className="content-library-container">
            <h3>Full Content Library (Total: {allContent.length})</h3>
            {message && <p className="submission-message success">{message}</p>}

            {/* ✅ NEW FILTER UI */}
            <div className="filter-bar-crud">
                <label>Filter by Topic:</label>
                <select 
                    value={selectedFilter} 
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '5px' }}
                >
                    {ALL_TOPICS_FILTER.map(topic => (
                        <option key={topic} value={topic}>{topic}</option>
                    ))}
                </select>
                <span style={{marginLeft: '20px', fontWeight: 'bold'}}>
                    Showing {filteredContent.length} items in view.
                </span>
            </div>
            
            <p style={{marginBottom: '20px'}}>Use this to audit, edit, or permanently remove any content from the system.</p>

            {filteredContent.map((item) => (
                <div key={item._id} className="content-audit-card">
                    <div className="audit-info">
                        <strong>Topic: {item.topic}</strong>
                        <span className="status-badge" style={{backgroundColor: getStatusColor(item.status)}}>
                            {item.status.toUpperCase()}
                        </span>
                        <p className="question-snippet">{item.question_text?.substring(0, 80) || 'No Content'}...</p>
                        <small>ID: {item._id}</small>
                    </div>

                    <div className="audit-actions">
                        <button onClick={() => handleEdit(item)} className="edit-btn">
                            ✏️ Edit
                        </button>
                        <button 
                            onClick={() => handleDelete(item._id, item.question_text)} 
                            className="reject-btn"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            ))}
            
            {/* 7. MODAL RENDERING */}
            {isModalOpen && currentContent && (
                <EditContentModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    contentData={currentContent}
                />
            )}
        </div>
    );
};

export default ContentLibrary;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
// This component manages the verification queue for general study material (Theory, DSA links, etc.)
const PendingContentManager = ({ onContentApproved }) => {
    const [pendingContent, setPendingContent] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch all PENDING content for general moderation
    const fetchPendingContent = async () => {
        try {
            // Hitting the GET /api/content/pending route (This is the general content queue)
            const response = await axios.get('/api/content/pending');
            setPendingContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending content:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingContent();
    }, []);

    // 2. Handle Approval Action
    const handleApproval = async (id) => {
        try {
            await axios.put(`/api/content/approve/${id}`);
            
            fetchPendingContent(); // Refresh the moderation list
            onContentApproved(); // Notify the main App to refresh the student view
            
            alert('✅ Content Approved! It is now live.');
        } catch (error) {
            alert('❌ Failed to approve content.');
        }
    };
    
    // 3. Handle Rejection Action
    const handleRejection = async (id) => {
        try {
            await axios.put(`/api/content/reject/${id}`);
            
            fetchPendingContent(); // Refresh the moderation list
            alert('❌ Content Rejected.');
        } catch (error) {
            alert('❌ Failed to reject content.');
        }
    };


    if (loading) {
        return <h3 style={{ textAlign: 'center' }}>Loading Pending Submissions...</h3>;
    }

    // 4. Render the Pending List
    return (
        <div className="pending-manager-container">
            <h3>Verify Student Submissions (Study Material & DSA)</h3>
            <p>Review these community submissions before they go live on the student dashboard.</p>

            {pendingContent.length === 0 ? (
                <p className="success-message">🎉 The verification queue is clear!</p>
            ) : (
                pendingContent.map((content) => (
                    <div key={content._id} className="pending-card">
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <h4 style={{margin: 0}}>Topic: {content.topic}</h4>
                            <small>Source: <a href={content.source_url} target="_blank" rel="noopener noreferrer">View Link</a></small>
                        </div>
                        <p style={{marginTop: '5px'}}>**Question/Text:** {content.question_text.substring(0, 200)}...</p>
                        <p>Explanation: {content.explanation.substring(0, 100)}...</p>
                        
                        <div className="action-buttons">
                            <button 
                                onClick={() => handleApproval(content._id)} 
                                className="approve-btn"
                            >
                                ✅ Approve & Verify
                            </button>
                            <button 
                                onClick={() => handleRejection(content._id)}
                                className="reject-btn"
                            >
                                ❌ Reject
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default PendingContentManager;
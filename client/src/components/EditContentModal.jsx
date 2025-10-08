// client/src/components/EditContentModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; 

// Topics list for the dropdown
const ALL_TOPICS = ['Aptitude', 'DSA', 'HR', 'OS', 'DBMS', 'CN', 'Core CS'];
const STATUSES = ['approved', 'pending', 'rejected'];

const EditContentModal = ({ isOpen, onClose, contentData }) => {
    // Modal सिर्फ तभी रेंडर होगा जब isOpen true हो
    if (!isOpen || !contentData) return null;

    // State tracks the data being edited (initialized with received data)
    const [formData, setFormData] = useState(contentData);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // useEffect to reset form when contentData changes (important for re-editing)
    useEffect(() => {
        // Ensure formData is updated if a new item is selected for editing
        setFormData(contentData);
        setMessage('');
    }, [contentData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);
        
        try {
            // Hitting the PUT /api/content/:id route (The 'U' in CRUD)
            // Only send the necessary data (excluding _id, createdAt, updatedAt, etc.)
            const dataToSave = {
                topic: formData.topic,
                question_text: formData.question_text,
                explanation: formData.explanation,
                status: formData.status,
                dsaProblemLink: formData.dsaProblemLink,
                youtubeSolutionLink: formData.youtubeSolutionLink,
                youtubeEmbedLink: formData.youtubeEmbedLink,
            };
            
            await axios.put(`/api/content/${contentData._id}`, dataToSave);

            setMessage('✅ Content Updated Successfully!');
            
            // Wait a moment for visual confirmation, then close the modal
            setTimeout(() => {
                onClose(); 
            }, 800);

        } catch (error) {
            console.error('Update error:', error);
            setMessage(`❌ Failed to update: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // Modal Backdrop (Add Modal CSS to App.css if not done)
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>✏️ Edit Content: {contentData.topic}</h3>
                <small>ID: {contentData._id}</small>
                <hr/>

                <form onSubmit={handleSubmit} className="official-form">
                    
                    {/* 1. Status Update (Moderator can change status on edit) */}
                    <label>Content Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange} required>
                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>

                    {/* 2. Topic Category */}
                    <label>Topic Category:</label>
                    <select name="topic" value={formData.topic} onChange={handleChange} required>
                        {ALL_TOPICS.map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>

                    {/* 3. Problem/Text Area */}
                    <label>Question/Content Text:</label>
                    <textarea name="question_text" value={formData.question_text} onChange={handleChange} rows="2" required />

                    {/* 4. Explanation */}
                    <label>Official Explanation:</label>
                    <textarea name="explanation" value={formData.explanation} onChange={handleChange} rows="4" required />

                    <hr style={{margin: '15px 0'}}/> 

                    {/* 5. DSA Problem Link */}
                    <label>DSA Problem Link:</label>
                    <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink || ''} onChange={handleChange} placeholder="https://leetcode.com/" />

                    {/* 6. External Solution Link */}
                    <label>YouTube Solution Link (Button):</label>
                    <input type="url" name="youtubeSolutionLink" value={formData.youtubeSolutionLink || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=" />
                    
                    {/* 7. Video Embed Link */}
                    <label>YouTube Embed Link (Resource Tab):</label>
                    <input type="url" name="youtubeEmbedLink" value={formData.youtubeEmbedLink || ''} onChange={handleChange} placeholder="https://youtube.com/embed/" />


                    {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}

                    <div className="modal-actions">
                        <button type="button" className="reject-btn" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </button>
                        <button type="submit" className="approve-btn" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditContentModal;
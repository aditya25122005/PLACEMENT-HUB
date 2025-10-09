// client/src/components/EditContentModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Global styling

// Topics list is now dynamic, so we remove the hardcoded list.
const STATUSES = ['approved', 'pending', 'rejected'];

// Component now receives the subjectList prop
const EditContentModal = ({ isOpen, onClose, contentData, subjectList }) => { 
    // Modal सिर्फ तभी रेंडर होगा जब isOpen true हो
    if (!isOpen || !contentData) return null;

    // Form state tracks the data being edited (initialized with received data)
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
        
        // Handling input type specific changes (e.g., ensuring numeric types are converted if necessary)
        let finalValue = value;
        
        setFormData({ ...formData, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);
        
        try {
            // Data to send for the PUT request (only fields that can be updated)
            const dataToSave = {
                topic: formData.topic,
                question_text: formData.question_text,
                videoTitle: formData.videoTitle, // New video title field
                explanation: formData.explanation,
                status: formData.status,
                dsaProblemLink: formData.dsaProblemLink,
                youtubeSolutionLink: formData.youtubeSolutionLink,
                youtubeEmbedLink: formData.youtubeEmbedLink,
            };
            
            // Hitting the PUT /api/content/:id route (The 'U' in CRUD)
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
        // Modal Backdrop
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>✏️ Edit Content: {contentData.topic}</h3>
                <small>ID: {contentData._id}</small>
                <hr/>

                <form onSubmit={handleSubmit} className="official-form">
                    
                    {/* 1. Status Update (Moderator can change status on edit) */}
                    <label>Content Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange} required disabled={isSaving}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>

                    {/* 2. Topic Category (Now Dynamic) */}
                    <label>Topic Category:</label>
                    <select name="topic" value={formData.topic} onChange={handleChange} required disabled={isSaving}>
                        {/* ✅ FIX: Use the dynamic subjectList prop */}
                        {subjectList && subjectList.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    {/* 3. Problem/Text Area */}
                    <label>Question/Content Text:</label>
                    <textarea name="question_text" value={formData.question_text || ''} onChange={handleChange} rows="2" required disabled={isSaving} />

                    {/* 4. Video Title (New Dedicated Field) */}
                    <label>Video Title (Required if using Embed Link):</label>
                    <input type="text" name="videoTitle" value={formData.videoTitle || ''} onChange={handleChange} placeholder="e.g., Lec-1 Overview" disabled={isSaving} />

                    {/* 5. Explanation */}
                    <label>Official Explanation:</label>
                    <textarea name="explanation" value={formData.explanation || ''} onChange={handleChange} rows="4" required disabled={isSaving} />

                    <hr style={{margin: '15px 0'}}/> 

                    {/* 6. DSA Problem Link */}
                    <label>DSA Problem Link:</label>
                    <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink || ''} onChange={handleChange} placeholder="https://leetcode.com/" disabled={isSaving} />

                    {/* 7. External Solution Link */}
                    <label>YouTube Solution Link (Button):</label>
                    <input type="url" name="youtubeSolutionLink" value={formData.youtubeSolutionLink || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=" disabled={isSaving} />
                    
                    {/* 8. Video Embed Link (Resource Tab) */}
                    <label>YouTube Embed Link (Resource Tab):</label>
                    <input type="text" name="youtubeEmbedLink" value={formData.youtubeEmbedLink || ''} onChange={handleChange} placeholder="https://youtube.com/embed/" disabled={isSaving} />


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
// client/src/components/ContentSubmissionForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

// Topics list जो App.jsx और Content.js से match करती है
// Note: Core CS को split करने के बाद, यह फाइनल लिस्ट है
const SUBMISSION_TOPICS = ['Aptitude', 'DSA', 'HR', 'OS', 'DBMS', 'CN', 'Core CS'];

const ContentSubmissionForm = ({ onSubmissionSuccess }) => {
    // State to manage the form inputs
    const [formData, setFormData] = useState({
        topic: 'Aptitude',
        question_text: '',
        explanation: '',
        source_url: '',
        // ✅ CRITICAL FIX: DSA Link states added
        dsaProblemLink: '', 
        youtubeSolutionLink: '',
    });
    
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handles input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles form submission to the PENDING review queue
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic frontend validation
        if (!formData.question_text || !formData.topic) {
            setMessage('❌ Please enter the content text and select a topic.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            // Backend API ready for all fields (which will be saved with status: 'pending')
            await axios.post('/api/content/submit', formData);

            setMessage('✅ Success! Your content is submitted for moderator review.');
            
            // Reset the form after successful submission
            setFormData({
                topic: 'Aptitude',
                question_text: '',
                explanation: '',
                source_url: '',
                dsaProblemLink: '', // Reset
                youtubeSolutionLink: '', // Reset
            });
            
            if (onSubmissionSuccess) {
                 // Refresh logic is not needed here as content goes to PENDING, not approved list.
            }

        } catch (error) {
            console.error('Submission error:', error);
            const errorMsg = error.response?.data?.message || '❌ Submission failed. Server error.';
            setMessage(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="submission-container">
            <h2>Found a Great Resource? Submit It!</h2>
            <p>Contribute a link or question you found **"on the net."** It must be **verified by a moderator** before going live. </p>
            
            <form onSubmit={handleSubmit} className="submission-form">
                
                {/* Topic Selection */}
                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                    {/* ✅ FIX: Use the expanded topic list for correct database validation */}
                    {SUBMISSION_TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                {/* Question/Text Area */}
                <label>Question/Content Text (Required):</label>
                <textarea 
                    name="question_text" 
                    value={formData.question_text} 
                    onChange={handleChange} 
                    placeholder="Type the question or key concept found online."
                    rows="3"
                    required
                />
                
                {/* Proposed Solution/Explanation */}
                <label>Your Proposed Solution/Explanation (Optional):</label>
                <textarea 
                    name="explanation" 
                    value={formData.explanation} 
                    onChange={handleChange} 
                    placeholder="Enter the solution or explanation if you have one."
                    rows="2"
                />

                <hr style={{margin: '20px 0', border: '1px solid #f0f0f0'}}/> 

                {/* ======================================================= */}
                {/* ✅ CRITICAL FIX: EXTERNAL LINK INPUTS ADDED */}
                {/* ======================================================= */}
                <h4>External Source Links (Optional)</h4>

                <label>Original Source Link (Where you found it):</label>
                <input 
                    type="url" 
                    name="source_url" 
                    value={formData.source_url} 
                    onChange={handleChange} 
                    placeholder="https://example.com/source-of-info"
                />

                <label>DSA Problem Link (If submitting a coding question):</label>
                <input 
                    type="url" 
                    name="dsaProblemLink" 
                    value={formData.dsaProblemLink} 
                    onChange={handleChange} 
                    placeholder="https://leetcode.com/problem-link"
                />

                <label>YouTube Solution Link (If submitting a resource video):</label>
                <input 
                    type="url" 
                    name="youtubeSolutionLink" 
                    value={formData.youtubeSolutionLink} 
                    onChange={handleChange} 
                    placeholder="https://youtube.com/solution-video"
                />
                
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
            </form>
            
            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        </div>
    );
};

export default ContentSubmissionForm;
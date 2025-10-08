// client/src/components/ContentSubmissionForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

// ❌ NOTE: The hardcoded SUBMISSION_TOPICS array is removed.
// We assume subjectList will be passed as a prop from App.jsx

const ContentSubmissionForm = ({ onSubmissionSuccess, subjectList }) => { // ✅ subjectList received as prop
    // State to manage the form inputs
    const [formData, setFormData] = useState({
        // Set initial topic to the first subject in the dynamic list, or 'Aptitude' as fallback
        topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude', 
        question_text: '',
        explanation: '',
        source_url: '',
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
            // Backend API ready for all fields, which will be saved with status: 'pending'
            await axios.post('/api/content/submit', formData);

            setMessage('✅ Success! Your content is submitted for moderator review.');
            
            // Reset the form after successful submission
            setFormData({
                // Reset topic to the first subject in the dynamic list
                topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude',
                question_text: '',
                explanation: '',
                source_url: '',
                dsaProblemLink: '',
                youtubeSolutionLink: '',
            });
            
            // Note: onSubmissionSuccess is called to refresh the main dashboard counts if needed
            if (onSubmissionSuccess) {
                onSubmissionSuccess();
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
                
                {/* Topic Selection - Now uses dynamic list */}
                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                    {/* ✅ FIX APPLIED: Using dynamic subjectList prop */}
                    {subjectList.map(t => (
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

                {/* External Links */}
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
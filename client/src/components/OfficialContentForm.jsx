// client/src/components/OfficialContentForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

// Topics की expanded list जो App.jsx और Models से match करती है
const ALL_TOPICS = ['Aptitude', 'DSA', 'HR', 'OS', 'DBMS', 'CN', 'Core CS'];

const OfficialContentForm = ({ onContentAdded }) => {
    // State to manage the form inputs
    const [formData, setFormData] = useState({
        topic: 'Aptitude',
        question_text: '',
        explanation: '',
        // ✅ CRITICAL FIX: Add new state fields for DSA links
        dsaProblemLink: '',
        youtubeSolutionLink: '',
    });
    
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handles input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handles form submission to the OFFICIAL route
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.question_text || !formData.topic || !formData.explanation) {
            setMessage('❌ Please fill in the Content Text and Explanation.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {
            // Backend API ready for all fields, including optional DSA links
            await axios.post('/api/content/add-official', formData);

            setMessage('✅ Official Content Added Successfully! It is immediately live.');
            
            // Reset the form
            setFormData({
                topic: 'Aptitude',
                question_text: '',
                explanation: '',
                // ✅ CRITICAL FIX: Reset all fields
                dsaProblemLink: '',
                youtubeSolutionLink: '',
            });
            
            // CRUCIAL: Call the prop function to refresh the main student view immediately
            onContentAdded(); 

        } catch (error) {
            console.error('Submission error:', error);
            const errorMsg = error.response?.data?.message || '❌ Failed to add official content.';
            setMessage(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="official-submission-container">
            <h3>➕ Add Official Verified Content (Faculty Input)</h3>
            <p>Content added here bypasses the queue and goes directly live, fulfilling **Gla Feedback**.</p>
            
            <form onSubmit={handleSubmit} className="official-form">
                
                {/* Topic Selection: Now expanded */}
                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                    {/* ✅ FIX: Use the expanded list */}
                    {ALL_TOPICS.map(t => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>

                {/* Question/Text Area */}
                <label>Official Content Text (Required):</label>
                <textarea 
                    name="question_text" 
                    value={formData.question_text} 
                    onChange={handleChange} 
                    placeholder="Enter the official question or verified key concept (e.g., OOPS principles)."
                    rows="4"
                    required
                />

                {/* Explanation */}
                <label>Official Explanation (Required):</label>
                <textarea 
                    name="explanation" 
                    value={formData.explanation} 
                    onChange={handleChange} 
                    placeholder="Enter the official solution or detailed explanation."
                    rows="3"
                    required
                />
                
                <hr style={{margin: '20px 0'}}/> 

                {/* ======================================================= */}
                {/* ✅ CRITICAL FIX: DSA/CODING PROBLEM INPUTS */}
                {/* ======================================================= */}
                <h4>Optional: Link to External Resources (For DSA/Theory)</h4>
                
                <label>DSA Problem Link (e.g., LeetCode/GFG):</label>
                <input 
                    type="url" 
                    name="dsaProblemLink" 
                    value={formData.dsaProblemLink} 
                    onChange={handleChange} 
                    placeholder="https://leetcode.com/problem-name"
                />

                <label>YouTube Solution Link (Optional):</label>
                <input 
                    type="url" 
                    name="youtubeSolutionLink" 
                    value={formData.youtubeSolutionLink} 
                    onChange={handleChange} 
                    placeholder="https://youtube.com/watch?v=solution_id"
                />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Content Now'}
                </button>
            </form>
            
            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        </div>
    );
};

export default OfficialContentForm;
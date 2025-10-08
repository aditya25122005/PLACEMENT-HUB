// client/src/components/OfficialContentForm.jsx

import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

// Topics list जो App.jsx और Content.js से match करती है
const ALL_TOPICS = ['Aptitude', 'DSA', 'DSA-PLAN','HR', 'OS', 'DBMS', 'CN','REACT JS'];

const OfficialContentForm = ({ onContentAdded }) => {
    // State to manage the form inputs
    const [formData, setFormData] = useState({
        topic: 'Aptitude',
        question_text: '', // Problem/Concept Title
        videoTitle: '',    // New dedicated title field
        explanation: '',   // Internal Solution/Explanation
        dsaProblemLink: '',
        youtubeSolutionLink: '',
        youtubeEmbedLink: '', 
    });
    
    const [message, setMessage] = useState('');
    
    // ✅ FIX 1: Only use isSubmitting for the loading state (isSaving is removed)
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const extractYouTubeID = (url) => {
        // Regex to match both watch?v=ID and embed/ID formats
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?feature=player_embedded&v=|watch\?v=))([^&?/\n]+)/);
        
        // Fallback for clean embed URLs
        if (match) return match[1];
        
        // Check for clean embed URL format (e.g., .../embed/ID)
        const embedMatch = url.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];
        
        return url; // Return original if not recognized
    };



    // Handles input changes (Including the CRITICAL auto-extraction logic)
    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        // Auto-extraction logic for the iframe tag
        if (name === 'youtubeEmbedLink') {
            // If the user pastes a full iframe, extract the src first
        const iframeMatch = value.match(/src="([^"]+)"/);
        const urlToProcess = iframeMatch ? iframeMatch[1] : value;
        
        // Extract the clean video ID
        finalValue = extractYouTubeID(urlToProcess); 
        }
        
        setFormData({ ...formData, [name]: finalValue });
    };

    

    // Handles form submission to the OFFICIAL route
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation: Title and Topic must always be present
        if ( !formData.topic) {
            setMessage('❌ Topic Category is required.');
            return;
        }

        // 🎯 CRITICAL FIX 2: CONDITIONAL VALIDATION LOGIC
        // Check if ANY content body exists (link OR explanation)
        const isContentBodyMissing = (
            !formData.explanation && 
            !formData.dsaProblemLink && 
            !formData.youtubeSolutionLink &&
            !formData.youtubeEmbedLink
        );

        // Check if Video Title is missing when a Video Embed Link is present
        const isVideoTitleMissing = (
            !!formData.youtubeEmbedLink && !formData.videoTitle
        );

        if (isContentBodyMissing) {
            setMessage('❌ Please provide an Internal Solution OR at least one external link (Video/DSA).');
            return;
        }
        
        if (isVideoTitleMissing) {
            setMessage('❌ If you provide an Embed Link, the Video Title is required.');
            return;
        }
        // End of Critical Fix

        setIsSubmitting(true);
        setMessage('');

        try {
            await axios.post('/api/content/add-official', formData);

            setMessage('✅ Official Content Added Successfully! It is immediately live.');
            
            // Reset the form
            setFormData({
                topic: 'Aptitude',
                question_text: '',
                videoTitle: '', // Reset new field
                explanation: '',
                dsaProblemLink: '',
                youtubeSolutionLink: '',
                youtubeEmbedLink: '',
            });
            
            onContentAdded(); 

        } catch (error) {
            console.error('Submission error:', error);
            // This error occurs if backend validation is still too strict. We rely on the fix applied in contentRoutes.js
            const errorMsg = error.response?.data?.message || '❌ Failed to add official content. Check server console.';
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
                
                {/* Topic and Title (REQUIRED) */}
                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                    {ALL_TOPICS.map(t => (<option key={t} value={t}>{t}</option>))}
                </select>

                <label>Problem/Concept Title:</label>
                <textarea name="question_text" value={formData.question_text} onChange={handleChange} placeholder="Enter the main problem statement or theory title." rows="2"  />

                {/* Explanation (NOW OPTIONAL in Frontend) */}
                <label>Internal Solution / Detailed Concepts:</label>
                <textarea 
                    name="explanation" 
                    value={formData.explanation} 
                    onChange={handleChange} 
                    placeholder="Enter the step-by-step solution, algorithm, or full explanation." 
                    rows="4" 
                    // No 'required' attribute, relies on conditional check
                />
                
                <hr style={{margin: '20px 0'}}/> 
                
                {/* External Resources */}
                <h4>Optional: Video & External Resources</h4>
                
                {/* Video Title - REQUIRED IF EMBED LINK IS PRESENT */}
                <label>Video Title (Required if using Embed Link):</label>
                <input 
                    type="text" 
                    name="videoTitle" 
                    value={formData.videoTitle} 
                    onChange={handleChange} 
                    placeholder="e.g., Lec-1: Full DBMS Syllabus Overview"
                />

                <label>YouTube Embed Link (Paste **Full IFRAME Code** or Clean URL):</label>
                <input 
                    type="text" 
                    name="youtubeEmbedLink" 
                    value={formData.youtubeEmbedLink} 
                    onChange={handleChange} 
                    placeholder="Paste the full iframe code OR https://www.youtube.com/embed/VIDEO_ID"
                />

                <label>DSA Problem Link (e.g., LeetCode/GFG):</label>
                <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink} onChange={handleChange} placeholder="https://leetcode.com/problem-name" />

                <label>YouTube Solution Link (For External Button):</label>
                <input type="url" name="youtubeSolutionLink" value={formData.youtubeSolutionLink} onChange={handleChange} placeholder="https://youtube.com/watch?v=solution_id" />

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Content Now'} 
                </button>
            </form>
            
            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        </div>
    );
};

export default OfficialContentForm;
import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 
const OfficialContentForm = ({ onContentAdded, subjectList }) => { 
    
    const [formData, setFormData] = useState({
        topic: 'Aptitude', 
        question_text: '', 
        videoTitle: '',   
        explanation: '', 
        dsaProblemLink: '',
        youtubeSolutionLink: '',
        youtubeEmbedLink: '', 
    });
    
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const extractYouTubeID = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?feature=player_embedded&v=|watch\?v=))([^&?/\n]+)/);
        if (match) return match[1];
        const embedMatch = url.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];
        return url; 
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'youtubeEmbedLink') {
            const iframeMatch = value.match(/src="([^"]+)"/);
            const urlToProcess = iframeMatch ? iframeMatch[1] : value;
            
            finalValue = extractYouTubeID(urlToProcess); 
        }
        
        setFormData({ ...formData, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.topic) {
            setMessage('❌ Topic Category is required.');
            return;
        }

        const isContentBodyMissing = (
            !formData.question_text && 
            !formData.explanation && 
            !formData.dsaProblemLink && 
            !formData.youtubeSolutionLink &&
            !formData.youtubeEmbedLink
        );

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

        setIsSubmitting(true);
        setMessage('');

        try {
            await axios.post('/api/content/add-official', formData);

            setMessage('✅ Official Content Added Successfully! It is immediately live.');

            setFormData({
              
                topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude', 
                question_text: '',
                videoTitle: '',
                explanation: '',
                dsaProblemLink: '',
                youtubeSolutionLink: '',
                youtubeEmbedLink: '',
            });
            
            onContentAdded(); 

        } catch (error) {
            console.error('Submission error:', error);
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
                
                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                
                    {subjectList && subjectList.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                    {!subjectList || subjectList.length === 0 && <option value="">Loading Subjects...</option>}
                </select>

                <label>Problem/Concept Title:</label>
                <textarea name="question_text" value={formData.question_text} onChange={handleChange} placeholder="Enter the main problem statement or theory title. (Optional for video-only)" rows="2" />

                <label>Internal Solution / Detailed Concepts:</label>
                <textarea 
                    name="explanation" 
                    value={formData.explanation} 
                    onChange={handleChange} 
                    placeholder="Enter the step-by-step solution, algorithm, or full explanation." 
                    rows="4" 
                />
                
                <hr style={{margin: '20px 0'}}/> 
                
                <h4>Optional: Video & External Resources</h4>
                
             
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
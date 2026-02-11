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

    // ⭐ NEW STATES
    const [contentType, setContentType] = useState("text");
    const [pdfFile, setPdfFile] = useState(null);

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

        setIsSubmitting(true);
        setMessage('');

        try {

            // ⭐ USE FORMDATA
            const submitData = new FormData();

            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            submitData.append("contentType", contentType);

            if (contentType === "pdf" && pdfFile) {
                submitData.append("pdf", pdfFile);
            }

            await axios.post('/api/content/add-official', submitData);

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

            setContentType("text");
            setPdfFile(null);

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

            <form onSubmit={handleSubmit} className="official-form">

                {/* ⭐ NEW CONTENT TYPE SELECT */}
                <label>Content Type:</label>
                <select value={contentType} onChange={(e)=>setContentType(e.target.value)}>
                    <option value="text">Text Theory</option>
                    <option value="video">Video Resource</option>
                    <option value="pdf">PDF Notes</option>
                </select>

                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                    {subjectList && subjectList.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                {/* ⭐ PDF INPUT */}
                {contentType === "pdf" && (
                    <>
                        <label>Upload PDF Notes:</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e)=>setPdfFile(e.target.files[0])}
                        />
                    </>
                )}

                {/* OLD FIELDS (ONLY IF NOT PDF) */}
                {contentType !== "pdf" && (
                    <>
                        <label>Problem/Concept Title:</label>
                        <textarea name="question_text" value={formData.question_text} onChange={handleChange} rows="2" />

                        <label>Internal Solution / Detailed Concepts:</label>
                        <textarea name="explanation" value={formData.explanation} onChange={handleChange} rows="4" />

                        <hr style={{margin: '20px 0'}}/>

                        <h4>Optional: Video & External Resources</h4>

                        <label>Video Title:</label>
                        <input type="text" name="videoTitle" value={formData.videoTitle} onChange={handleChange} />

                        <label>YouTube Embed Link:</label>
                        <input type="text" name="youtubeEmbedLink" value={formData.youtubeEmbedLink} onChange={handleChange} />

                        <label>DSA Problem Link:</label>
                        <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink} onChange={handleChange} />

                        <label>YouTube Solution Link:</label>
                        <input type="url" name="youtubeSolutionLink" value={formData.youtubeSolutionLink} onChange={handleChange} />
                    </>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Content Now'}
                </button>
            </form>

            {message && <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>{message}</p>}
        </div>
    );
};

export default OfficialContentForm;

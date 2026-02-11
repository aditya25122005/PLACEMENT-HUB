import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const ContentSubmissionForm = ({ onSubmissionSuccess, subjectList }) => {

    const [formData, setFormData] = useState({
        topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude',
        question_text: '',
        explanation: '',
        source_url: '',
        dsaProblemLink: '',
        youtubeSolutionLink: '',
    });

    // ⭐ NEW STATES
    const [contentType, setContentType] = useState("text");
    const [pdfFile, setPdfFile] = useState(null);

    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.topic) {
            setMessage('❌ Please select a topic.');
            return;
        }

        setIsSubmitting(true);
        setMessage('');

        try {

            // ⭐ USE FORMDATA INSTEAD OF JSON
            const submitData = new FormData();

            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            submitData.append("contentType", contentType);

            // ⭐ attach pdf only if selected
            if (contentType === "pdf" && pdfFile) {
                submitData.append("pdf", pdfFile);
            }

            await axios.post('/api/content/submit', submitData);

            setMessage('✅ Success! Your content is submitted for moderator review.');

            // Reset
            setFormData({
                topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude',
                question_text: '',
                explanation: '',
                source_url: '',
                dsaProblemLink: '',
                youtubeSolutionLink: '',
            });

            setContentType("text");
            setPdfFile(null);

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
            <p>Contribute a resource. Moderator approval required before going live.</p>

            <form onSubmit={handleSubmit} className="submission-form">

                {/* ⭐ NEW CONTENT TYPE SELECT */}
                <label>Content Type:</label>
                <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                >
                    <option value="text">Text Theory</option>
                    <option value="video">Video Resource</option>
                    <option value="pdf">PDF Notes</option>
                </select>

                <label>Topic Category:</label>
                <select name="topic" value={formData.topic} onChange={handleChange} required>
                    {subjectList.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                {/* ⭐ Hide text input when PDF selected */}
                {contentType !== "pdf" && (
                    <>
                        <label>Question/Content Text (Required):</label>
                        <textarea
                            name="question_text"
                            value={formData.question_text}
                            onChange={handleChange}
                            placeholder="Type the question or key concept."
                            rows="3"
                        />
                    </>
                )}

                {/* ⭐ PDF FILE INPUT */}
                {contentType === "pdf" && (
                    <>
                        <label>Upload PDF Notes:</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setPdfFile(e.target.files[0])}
                        />
                    </>
                )}

                {contentType !== "pdf" && (
                    <>
                        <label>Your Proposed Solution/Explanation (Optional):</label>
                        <textarea
                            name="explanation"
                            value={formData.explanation}
                            onChange={handleChange}
                            placeholder="Enter explanation if you have one."
                            rows="2"
                        />

                        <hr style={{ margin: '20px 0', border: '1px solid #f0f0f0' }} />

                        <h4>External Source Links (Optional)</h4>

                        <label>Original Source Link:</label>
                        <input
                            type="url"
                            name="source_url"
                            value={formData.source_url}
                            onChange={handleChange}
                        />

                        <label>DSA Problem Link:</label>
                        <input
                            type="url"
                            name="dsaProblemLink"
                            value={formData.dsaProblemLink}
                            onChange={handleChange}
                        />

                        <label>YouTube Solution Link:</label>
                        <input
                            type="url"
                            name="youtubeSolutionLink"
                            value={formData.youtubeSolutionLink}
                            onChange={handleChange}
                        />
                    </>
                )}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                </button>
            </form>

            {message && (
                <p className={`submission-message ${message.startsWith('✅') ? 'success' : 'error'}`}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default ContentSubmissionForm;

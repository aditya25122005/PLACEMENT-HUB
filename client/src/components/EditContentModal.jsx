import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const STATUSES = ['approved', 'pending', 'rejected'];

const EditContentModal = ({ isOpen, onClose, contentData, subjectList }) => {

    if (!isOpen || !contentData) return null;

    const [formData, setFormData] = useState(contentData);

    // ⭐ NEW STATES FOR PDF SUPPORT
    const [contentType, setContentType] = useState(contentData.contentType || "text");
    const [pdfFile, setPdfFile] = useState(null);

    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(contentData);
        setContentType(contentData.contentType || "text");
        setPdfFile(null);
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

            // ⭐ USE FORMDATA NOW
            const submitData = new FormData();

            submitData.append("topic", formData.topic);
            submitData.append("status", formData.status);
            submitData.append("contentType", contentType);

            submitData.append("question_text", formData.question_text || "");
            submitData.append("videoTitle", formData.videoTitle || "");
            submitData.append("explanation", formData.explanation || "");
            submitData.append("dsaProblemLink", formData.dsaProblemLink || "");
            submitData.append("youtubeSolutionLink", formData.youtubeSolutionLink || "");
            submitData.append("youtubeEmbedLink", formData.youtubeEmbedLink || "");

            // ⭐ If new PDF selected
            if (contentType === "pdf" && pdfFile) {
                submitData.append("pdf", pdfFile);
            }

            await axios.put(`/api/content/${contentData._id}`, submitData);

            setMessage('✅ Content Updated Successfully!');

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
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>✏️ Edit Content: {contentData.topic}</h3>
                <small>ID: {contentData._id}</small>
                <hr/>

                <form onSubmit={handleSubmit} className="official-form">

                    {/* ⭐ NEW CONTENT TYPE SELECT */}
                    <label>Content Type:</label>
                    <select value={contentType} onChange={(e)=>setContentType(e.target.value)} disabled={isSaving}>
                        <option value="text">Text Theory</option>
                        <option value="video">Video Resource</option>
                        <option value="pdf">PDF Notes</option>
                    </select>

                    <label>Content Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange} disabled={isSaving}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>

                    <label>Topic Category:</label>
                    <select name="topic" value={formData.topic} onChange={handleChange} disabled={isSaving}>
                        {subjectList && subjectList.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    {/* ⭐ PDF INPUT */}
                    {contentType === "pdf" && (
                        <>
                            <label>Upload New PDF (optional):</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e)=>setPdfFile(e.target.files[0])}
                                disabled={isSaving}
                            />
                        </>
                    )}

                    {/* OLD FIELDS ONLY IF NOT PDF */}
                    {contentType !== "pdf" && (
                        <>
                            <label>Question/Content Text:</label>
                            <textarea name="question_text" value={formData.question_text || ''} onChange={handleChange} rows="2" disabled={isSaving} />

                            <label>Video Title:</label>
                            <input type="text" name="videoTitle" value={formData.videoTitle || ''} onChange={handleChange} disabled={isSaving} />

                            <label>Official Explanation:</label>
                            <textarea name="explanation" value={formData.explanation || ''} onChange={handleChange} rows="4" disabled={isSaving} />

                            <hr style={{margin: '15px 0'}}/>

                            <label>DSA Problem Link:</label>
                            <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink || ''} onChange={handleChange} disabled={isSaving} />

                            <label>YouTube Solution Link:</label>
                            <input type="url" name="youtubeSolutionLink" value={formData.youtubeSolutionLink || ''} onChange={handleChange} disabled={isSaving} />

                            <label>YouTube Embed Link:</label>
                            <input type="text" name="youtubeEmbedLink" value={formData.youtubeEmbedLink || ''} onChange={handleChange} disabled={isSaving} />
                        </>
                    )}

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

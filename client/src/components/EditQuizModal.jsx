// client/src/components/EditQuizModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // For modal styling

// Topics list (Must match QuizQuestion.js enum)
const ALL_TOPICS = ['Aptitude', 'DSA', 'HR', 'OS', 'DBMS', 'CN', 'Core CS', 'React JS'];
const STATUSES = ['approved', 'pending', 'rejected'];

const EditQuizModal = ({ isOpen, onClose, quizData }) => {
    // Modal सिर्फ तभी रेंडर होगा जब isOpen true हो
    if (!isOpen || !quizData) return null;

    // Form state ko initial quiz data se initialize karein
    const [formData, setFormData] = useState(quizData);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // useEffect to reset form when new quizData is loaded
    useEffect(() => {
        setFormData(quizData);
        setMessage('');
    }, [quizData]);


    const handleChange = (e, index) => {
        const { name, value } = e.target;
        
        if (name === 'options') {
            // Options array ko index ke through update karna
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        } else if (name === 'correctAnswer') {
             // correct answer index ko number mein update karna
            setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);
        
        // Final validation check for 4 options and correct answer index
        if (formData.options.some(opt => opt.trim() === '') || formData.options.length !== 4) {
             setMessage('❌ Please ensure all 4 options are filled.');
             setIsSaving(false);
             return;
        }

        try {
            // Hitting the PUT /api/quiz/:id route (The 'U' in CRUD)
            const dataToSave = {
                ...formData,
                // Mongoose ko array update karne ke liye sirf zaroori fields bhejein
                options: formData.options, 
                correctAnswer: Number(formData.correctAnswer),
                // _id field ko API mein nahi bhejna chahiye, woh URL mein jaata hai
            };

            await axios.put(`/api/quiz/${quizData._id}`, dataToSave);

            setMessage('✅ Quiz Updated Successfully!');
            
            // Close modal after successful update and refresh
            setTimeout(() => {
                onClose(); 
            }, 800);

        } catch (error) {
            console.error('Update error:', error.response.data);
            setMessage(`❌ Failed to update: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // Modal Backdrop (Using the CSS styles added earlier)
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>✏️ Edit Quiz: {quizData.topic}</h3>
                <p>Q ID: {quizData._id}</p>
                <hr/>

                <form onSubmit={handleSubmit} className="official-form">
                    
                    {/* Status Update */}
                    <label>Status:</label>
                    <select name="status" value={formData.status} onChange={handleChange} required disabled={isSaving}>
                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>

                    {/* Topic Update */}
                    <label>Topic Category:</label>
                    <select name="topic" value={formData.topic} onChange={handleChange} required disabled={isSaving}>
                        {ALL_TOPICS.map(t => (<option key={t} value={t}>{t}</option>))}
                    </select>

                    {/* Question Text */}
                    <label>Question Text:</label>
                    <textarea name="questionText" value={formData.questionText} onChange={handleChange} rows="2" required disabled={isSaving} />

                    <div style={{marginTop: '20px'}}>
                        <h4>Options (Select Correct Answer)</h4>
                        {formData.options.map((option, index) => (
                            <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '8px'}}>
                                {/* Radio Button (Correct Answer Index) */}
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    value={index}
                                    checked={formData.correctAnswer === index}
                                    onChange={handleChange}
                                    style={{width: 'auto', marginRight: '10px'}}
                                    disabled={isSaving}
                                />
                                {/* Option Input Field */}
                                <input
                                    type="text"
                                    name="options"
                                    value={option}
                                    onChange={(e) => handleChange(e, index)}
                                    placeholder={`Option ${index + 1}`}
                                    required
                                    disabled={isSaving}
                                />
                            </div>
                        ))}
                    </div>


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

export default EditQuizModal;
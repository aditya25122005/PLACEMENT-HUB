import React, { useState, useEffect } from 'react';
import axios from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiSave, FiHelpCircle, FiHash, 
  FiCheckCircle, FiAlertCircle, FiEdit2 
} from 'react-icons/fi';

const STATUSES = ['approved', 'pending', 'rejected'];
const ALL_TOPICS = ['Aptitude', 'DSA', 'HR', 'OS', 'DBMS', 'CN', 'Core CS', 'React JS'];

const EditQuizModal = ({ isOpen, onClose, quizData }) => {
    // Basic safety check
    if (!isOpen || !quizData) return null;

    const [formData, setFormData] = useState(quizData);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(quizData);
        setMessage('');
    }, [quizData]);

    const handleChange = (e, index) => {
        const { name, value } = e.target;
        
        if (name === 'options') {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        } else if (name === 'correctAnswer') {
            setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSaving(true);
        
        if (formData.options.some(opt => opt.trim() === '') || formData.options.length !== 4) {
             setMessage('error:❌ Please ensure all 4 options are filled.');
             setIsSaving(false);
             return;
        }

        try {
            const dataToSave = {
                ...formData,
                options: formData.options, 
                correctAnswer: Number(formData.correctAnswer),
            };

            await axios.put(`/api/quiz/${quizData._id}`, dataToSave);
            setMessage('success:✅ Quiz Updated Successfully!');
    
            setTimeout(() => {
                onClose(); 
            }, 1200);

        } catch (error) {
            setMessage(`error:❌ Failed to update: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* BACKDROP */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                {/* MODAL BODY */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* HEADER */}
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                <FiEdit2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 tracking-tight">Edit MCQ Question</h3>
                                <p className="text-[10px] text-slate-400 font-mono italic">Q-ID: {quizData._id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white hover:text-rose-500 rounded-xl transition-all">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* FORM CONTENT */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                <select 
                                    name="status" 
                                    value={formData.status} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 transition-all appearance-none"
                                >
                                    {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>

                            {/* Topic */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                                <div className="relative">
                                    <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select 
                                        name="topic" 
                                        value={formData.topic} 
                                        onChange={handleChange} 
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 transition-all appearance-none"
                                    >
                                        {ALL_TOPICS.map(t => (<option key={t} value={t}>{t}</option>))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Question Description</label>
                            <textarea 
                                name="questionText" 
                                value={formData.questionText} 
                                onChange={handleChange} 
                                rows="3" 
                                required 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Options & Correct Answer</label>
                            {formData.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-3 group">
                                    <label className={`relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all border-2 ${formData.correctAnswer === index ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}>
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            value={index}
                                            checked={formData.correctAnswer === index}
                                            onChange={handleChange}
                                            className="absolute opacity-0"
                                        />
                                        <span className="text-sm font-black">{String.fromCharCode(65 + index)}</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="options"
                                        value={option}
                                        onChange={(e) => handleChange(e, index)}
                                        placeholder={`Option ${index + 1}`}
                                        required
                                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Message UI */}
                        <AnimatePresence>
                            {message && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.startsWith('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                                >
                                    {message.startsWith('success') ? <FiCheckCircle /> : <FiAlertCircle />}
                                    {message.split(':')[1]}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    {/* ACTIONS */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSaving}
                            className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-200 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <FiSave /> {isSaving ? 'Updating...' : 'Save & Publish'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditQuizModal;
import React, { useState, useEffect } from 'react';
import axios from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlusCircle, FiCheckCircle, FiXCircle, 
  FiList, FiEdit3, FiFilePlus, FiZap 
} from 'react-icons/fi';

const QuizManagement = ({ onContentChange, subjectList }) => { 
    const initialFormState = {
        topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude', 
        questionText: '',
        options: ['', '', '', ''], 
        correctAnswer: 0,
        isOfficial: false, 
    };

    const [formData, setFormData] = useState(initialFormState); 
    const [pendingQuizzes, setPendingQuizzes] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchPendingQuizzes = async () => {
        try {
            const response = await axios.get('/api/quiz/pending'); 
            setPendingQuizzes(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching pending quizzes:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingQuizzes();
    }, []);

    const handleAddChange = (e, index) => {
        const { name, value, type, checked } = e.target;
        if (name === 'options') {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else if (name === 'correctAnswer') {
             setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const dataToSend = { ...formData, status: formData.isOfficial ? 'approved' : 'pending' };
            await axios.post('/api/quiz/add', dataToSend);
            setMessage('success:✅ Quiz Question Added Successfully!');
            setFormData(initialFormState);
            fetchPendingQuizzes();
        } catch (error) {
            setMessage('error:❌ Ensure all 4 options are filled and a correct answer is selected.');
        }
    };

    const handleQuizApproval = async (id) => {
        try {
            await axios.put(`/api/quiz/approve/${id}`);
            fetchPendingQuizzes(); 
            if (onContentChange) onContentChange(); 
        } catch (error) {
            alert('❌ Failed to approve quiz.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. CREATION SECTION */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100">
                        <FiFilePlus size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">MCQ Creation Lab</h3>
                </div>

                <form onSubmit={handleAddSubmit} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    {/* Topic Dropdown */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Topic</label>
                        <select 
                            name="topic" 
                            value={formData.topic} 
                            onChange={handleAddChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700"
                        >
                            {subjectList && subjectList.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {/* Question Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Question Description</label>
                        <textarea 
                            name="questionText" 
                            value={formData.questionText} 
                            onChange={handleAddChange} 
                            placeholder="Enter the MCQ question here..."
                            rows="3" 
                            required 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                        />
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Answer Options (Select Correct)</label>
                        {formData.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-3 group">
                                <label className={`relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all border-2 ${formData.correctAnswer === index ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}>
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        value={index}
                                        checked={formData.correctAnswer === index}
                                        onChange={handleAddChange}
                                        className="absolute opacity-0"
                                    />
                                    <span className="text-sm font-black">{String.fromCharCode(65 + index)}</span>
                                </label>
                                <input
                                    type="text"
                                    name="options"
                                    value={option}
                                    onChange={(e) => handleAddChange(e, index)}
                                    placeholder={`Option ${index + 1}`}
                                    required
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Quick Publish Toggle */}
                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer group hover:bg-indigo-50 transition-colors">
                        <div className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" name="isOfficial" checked={formData.isOfficial} onChange={handleAddChange} className="sr-only peer" />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                           <FiZap className={formData.isOfficial ? "text-amber-500" : "text-slate-400"} /> Publish Immediately
                        </span>
                    </label>

                    <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
                        Deploy Quiz Question
                    </button>
                    
                    {message && (
                        <div className={`text-center font-bold text-sm ${message.startsWith('success') ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {message.split(':')[1]}
                        </div>
                    )}
                </form>
            </div>

            {/* 2. MODERATION SECTION */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-100">
                        <FiCheckCircle size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Review Queue</h3>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="animate-pulse flex space-x-4">Loading...</div>
                    ) : pendingQuizzes.length === 0 ? (
                        <div className="text-center py-20 bg-emerald-50 rounded-[2.5rem] border-2 border-dashed border-emerald-200">
                            <FiCheckCircle size={40} className="mx-auto text-emerald-500 mb-4" />
                            <p className="text-emerald-700 font-bold tracking-tight">All quizzes are verified!</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {pendingQuizzes.map((quiz) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    key={quiz._id} 
                                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                                            {quiz.topic}
                                        </span>
                                    </div>
                                    <h4 className="text-md font-bold text-slate-800 mb-6 leading-relaxed">
                                        {quiz.questionText}
                                    </h4>
                                    
                                    <div className="space-y-2 mb-6">
                                        {quiz.options.map((opt, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-medium ${idx === quiz.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${idx === quiz.correctAnswer ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200'}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => handleQuizApproval(quiz._id)} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-100">
                                            Approve
                                        </button>
                                        <button onClick={() => {}} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs hover:bg-rose-50 hover:text-rose-500 transition-all">
                                            Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizManagement;
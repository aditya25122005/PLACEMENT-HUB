import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiSave, FiFileText, FiVideo, FiFile, 
  FiHash, FiLink, FiYoutube, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';

const STATUSES = ['approved', 'pending', 'rejected'];

const EditContentModal = ({ isOpen, onClose, contentData, subjectList }) => {
    // If modal is not open, return null immediately
    if (!isOpen || !contentData) return null;

    const [formData, setFormData] = useState(contentData);
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

            if (contentType === "pdf" && pdfFile) {
                submitData.append("pdf", pdfFile);
            }

            await axios.put(`/api/content/${contentData._id}`, submitData);
            setMessage('success:✅ Content Updated Successfully!');
            setTimeout(() => onClose(), 1200);
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
                    className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* MODAL HEADER */}
                    <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                <FiEdit3 size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 tracking-tight">Edit Resource</h3>
                                <p className="text-[10px] text-slate-400 font-mono">UUID: {contentData._id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white hover:text-rose-500 rounded-xl transition-all">
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* MODAL CONTENT (SCROLLABLE) */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Type Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Content Type</label>
                                <div className="relative">
                                    <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select 
                                        value={contentType} 
                                        onChange={(e) => setContentType(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none font-medium text-slate-700"
                                    >
                                        <option value="text">Theory Text</option>
                                        <option value="video">Video Resource</option>
                                        <option value="pdf">PDF Document</option>
                                    </select>
                                </div>
                            </div>

                            {/* Status Selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Current Status</label>
                                <div className="relative">
                                    <FiCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select 
                                        name="status" 
                                        value={formData.status} 
                                        onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none font-medium text-slate-700"
                                    >
                                        {STATUSES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Topic Category</label>
                            <div className="relative">
                                <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select 
                                    name="topic" 
                                    value={formData.topic} 
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none font-bold text-slate-700"
                                >
                                    {subjectList?.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* CONDITIONAL PDF UPLOADER */}
                        {contentType === "pdf" ? (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center text-center">
                                <FiFile className="text-slate-300 mb-2" size={32} />
                                <p className="text-sm font-bold text-slate-600 mb-2">Update PDF Document</p>
                                <input 
                                    type="file" 
                                    accept="application/pdf" 
                                    onChange={(e) => setPdfFile(e.target.files[0])}
                                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                />
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Content Text</label>
                                    <textarea 
                                        name="question_text" 
                                        value={formData.question_text || ''} 
                                        onChange={handleChange} 
                                        rows="2"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Official Explanation</label>
                                    <textarea 
                                        name="explanation" 
                                        value={formData.explanation || ''} 
                                        onChange={handleChange} 
                                        rows="4"
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><FiLink/> Problem Link</label>
                                        <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1"><FiYoutube className="text-rose-500"/> YT Embed</label>
                                        <input type="text" name="youtubeEmbedLink" value={formData.youtubeEmbedLink || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STATUS MESSAGE */}
                        {message && (
                            <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.startsWith('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {message.startsWith('success') ? <FiCheckCircle/> : <FiAlertCircle/>}
                                {message.split(':')[1]}
                            </div>
                        )}
                    </form>

                    {/* MODAL FOOTER */}
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
                            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <FiSave /> {isSaving ? 'Saving Changes...' : 'Save & Publish'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EditContentModal;

// Utility Icon missing in imports but added in JSX
const FiEdit3 = (props) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
);
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiTrash2, FiLayers, FiAlertTriangle, 
  FiBook, FiCheckCircle, FiInfo 
} from 'react-icons/fi';

const SubjectManager = ({ onSubjectsUpdated }) => {
    const [subjects, setSubjects] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/subjects/all');
            // Filter out 'All' to manage specific categories only
            setSubjects(response.data.filter(s => s.name !== 'All')); 
            setLoading(false);
        } catch (error) {
            setMessage('error:❌ Failed to fetch subjects.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        const name = newSubjectName.trim();
        if (name.length < 2) {
            setMessage('error:❌ Subject name must be at least 2 characters.');
            return;
        }
        
        setIsSaving(true);
        setMessage('');

        try {
            await axios.post('/api/subjects/add', { name });
            setNewSubjectName('');
            setMessage(`success:✅ Subject "${name}" added successfully!`);
            fetchSubjects(); 
            if (onSubjectsUpdated) onSubjectsUpdated(); 
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'error:❌ Error adding subject.';
            setMessage(errorMsg);
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This will break associated content and quizzes!`)) {
            return;
        }

        try {
            await axios.delete(`/api/subjects/${id}`);
            setMessage(`success:✅ Subject "${name}" removed.`);
            fetchSubjects(); 
            if (onSubjectsUpdated) onSubjectsUpdated(); 
        } catch (error) {
            setMessage('error:❌ Error deleting subject.');
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} 
                className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            
            {/* SECTION 1: ADD SUBJECT */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                        <FiPlus size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Expand Curriculum</h3>
                        <p className="text-sm text-slate-500">Create a new category for study materials and quizzes.</p>
                    </div>
                </div>

                <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 bg-white p-3 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div className="relative flex-grow">
                        <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            value={newSubjectName} 
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="E.g., Cloud Computing or Data Science"
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-[1.5rem] outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-semibold text-slate-700"
                            disabled={isSaving}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSaving}
                        className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? 'Processing...' : 'Add Category'}
                    </button>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0 }}
                            className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${message.startsWith('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                        >
                            {message.startsWith('success') ? <FiCheckCircle /> : <FiAlertTriangle />}
                            {message.split(':')[1]}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* SECTION 2: SUBJECT LIST */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FiBook className="text-indigo-600" /> Live Categories 
                        <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">{subjects.length}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                        <FiInfo /> Warning: Deletion is Permanent
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {subjects.map((sub) => (
                            <motion.div 
                                layout
                                key={sub._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 hover:shadow-md transition-all"
                            >
                                <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                    {sub.name}
                                </span>
                                <button 
                                    onClick={() => handleDelete(sub._id, sub.name)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                    title="Delete Subject"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {subjects.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium italic">No subjects added yet. Start by expanding the curriculum above.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SubjectManager;
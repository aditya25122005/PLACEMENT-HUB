import React, { useState, useEffect } from 'react';
import axios from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiEdit3, FiTrash2, 
  FiCheckCircle, FiClock, FiXCircle, FiList, 
  FiHelpCircle, FiMoreHorizontal 
} from 'react-icons/fi';
import EditQuizModal from './EditQuizModal'; 

const QuizLibrary = ({ onContentChange, subjectList }) => { 
    const [allQuizzes, setAllQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState(null); 
    const [selectedFilter, setSelectedFilter] = useState('All'); 
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAllQuizzes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/quiz/all'); 
            setAllQuizzes(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching all quizzes:", error);
            setMessage("error:Error fetching Quiz Library.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllQuizzes();
    }, []);

    const handleDelete = async (id, question) => {
        if (!window.confirm(`Are you sure you want to permanently delete quiz: "${question}"?`)) return;

        try {
            await axios.delete(`/api/quiz/${id}`); 
            setMessage(`success:Quiz deleted successfully.`);
            fetchAllQuizzes(); 
            onContentChange(); 
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`error:Error deleting quiz.`);
        }
    };

    const handleEdit = (quizItem) => {
        setCurrentQuiz(quizItem); 
        setIsModalOpen(true);     
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentQuiz(null);
        fetchAllQuizzes();
        onContentChange(); 
    };

    // Filter & Search Logic
    const filteredQuizzes = allQuizzes.filter(item => {
        const matchesTopic = selectedFilter === 'All' || item.topic === selectedFilter;
        const matchesSearch = item.questionText?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTopic && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch(status) {
            case 'approved': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <FiCheckCircle /> };
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <FiClock /> };
            case 'rejected': return { bg: 'bg-rose-50', text: 'text-rose-600', icon: <FiXCircle /> };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: <FiMoreHorizontal /> };
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} 
                className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Quiz Question Bank</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage and audit the active MCQ pool across all subjects.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200">
                    <FiList /> {allQuizzes.length} Questions
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {message && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${message.startsWith('success') ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {message.split(':')[1]}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="grid md:grid-cols-2 gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search question text..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-medium"
                    />
                </div>
                <div className="relative">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                        value={selectedFilter} 
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border-none rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-bold text-slate-700 appearance-none"
                    >
                        <option value="All">All Topics</option>
                        {subjectList?.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Data Grid */}
            <div className="grid gap-4">
                <AnimatePresence mode='popLayout'>
                    {filteredQuizzes.map((item) => {
                        const style = getStatusStyles(item.status);
                        return (
                            <motion.div 
                                layout
                                key={item._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-indigo-500 transition-colors shadow-sm group"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg tracking-widest">
                                                {item.topic}
                                            </span>
                                            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase ${style.bg} ${style.text}`}>
                                                {style.icon} {item.status}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                <FiHelpCircle size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 leading-snug">
                                                    {item.questionText}
                                                </p>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        Options: <span className="text-slate-600">{item.options?.length || 0}</span>
                                                    </span>
                                                    <span className="text-[10px] font-bold text-emerald-600">
                                                        Correct Key: <span className="bg-emerald-100 px-1.5 rounded">Index {item.correctAnswer}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0">
                                        <button 
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            <FiEdit3 /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item._id, item.questionText)}
                                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-50 text-rose-500 rounded-2xl font-bold text-xs hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <FiTrash2 /> Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {filteredQuizzes.length === 0 && (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                            <FiSearch size={24} />
                        </div>
                        <p className="text-slate-500 font-bold tracking-tight">No quiz questions match your criteria.</p>
                    </div>
                )}
            </div>
            
            {/* Modal Rendering */}
            {isModalOpen && currentQuiz && (
                <EditQuizModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal}
                    quizData={currentQuiz}
                    subjectList={subjectList} 
                />
            )}
        </div>
    );
};

export default QuizLibrary;
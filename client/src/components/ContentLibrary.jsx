import React, { useState, useEffect } from 'react';
import axios from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiEdit3, FiTrash2, 
  FiBook, FiCheckCircle, FiClock, FiXCircle, FiMoreVertical 
} from 'react-icons/fi';
import EditContentModal from './EditContentModal'; 

const ContentLibrary = ({ onContentChange, subjectList }) => {
    const [allContent, setAllContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentContent, setCurrentContent] = useState(null); 
    const [selectedFilter, setSelectedFilter] = useState('All'); 
    const [searchQuery, setSearchQuery] = useState('');

    const fetchAllContent = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/content/all'); 
            setAllContent(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching all content:", error);
            setMessage("error:Error fetching content library.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllContent();
    }, []);

    const handleDelete = async (id, question) => {
        if (!window.confirm(`Are you sure you want to permanently delete: "${question}"?`)) return;

        try {
            await axios.delete(`/api/content/${id}`);
            setMessage(`success:Content deleted successfully.`);
            fetchAllContent(); 
            onContentChange(); 
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`error:Error deleting content.`);
        }
    };
    
    const handleEdit = (contentItem) => {
        setCurrentContent(contentItem);
        setIsModalOpen(true);          
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentContent(null);
        fetchAllContent(); 
        onContentChange(); 
    };

    // Filter & Search Logic
    const filteredContent = allContent.filter(item => {
        const matchesFilter = selectedFilter === 'All' || item.topic === selectedFilter;
        const matchesSearch = item.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.topic?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusStyles = (status) => {
        switch(status) {
            case 'approved': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <FiCheckCircle /> };
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600', icon: <FiClock /> };
            case 'rejected': return { bg: 'bg-rose-50', text: 'text-rose-600', icon: <FiXCircle /> };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: <FiMoreVertical /> };
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
            {/* Library Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Content Library</h3>
                    <p className="text-sm text-slate-500">Audit and manage the entire repository of study materials.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl font-bold text-sm">
                    <FiBook /> {allContent.length} Total Items
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {message && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${message.startsWith('success') ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {message.split(':')[1]}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control Bar */}
            <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search questions or topics..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm"
                    />
                </div>
                <div className="relative">
                    <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                        value={selectedFilter} 
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none text-sm font-medium text-slate-700"
                    >
                        <option value="All">All Topics</option>
                        {subjectList && subjectList.map(topic => (
                            <option key={topic} value={topic}>{topic}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-3">
                <AnimatePresence mode='popLayout'>
                    {filteredContent.map((item) => {
                        const style = getStatusStyles(item.status);
                        return (
                            <motion.div 
                                layout
                                key={item._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white border border-slate-200 rounded-[1.5rem] p-4 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-indigo-300 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`hidden sm:flex p-3 rounded-xl ${style.bg} ${style.text}`}>
                                        {style.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{item.topic}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${style.bg} ${style.text}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 truncate max-w-[300px] lg:max-w-md">
                                            {item.question_text || 'No preview text available'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {item._id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                                    >
                                        <FiEdit3 size={16}/> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item._id, item.question_text)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <FiTrash2 size={16}/> Delete
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                
                {filteredContent.length === 0 && (
                    <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium italic">No content found matching your search.</p>
                    </div>
                )}
            </div>
            
            {/* Modal Rendering */}
            {isModalOpen && currentContent && (
                <EditContentModal 
                    isOpen={isModalOpen} 
                    onClose={handleCloseModal} 
                    contentData={currentContent}
                    subjectList={subjectList} 
                />
            )}
        </div>
    );
};

export default ContentLibrary;
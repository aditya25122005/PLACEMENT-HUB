import React, { useState } from 'react';
import axios from 'axios';
import YouTube from 'react-youtube';
import QuizComponent from './QuizComponent';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBookOpen, FiCode, FiVideo, FiFileText, 
  FiZap, FiExternalLink, FiPlayCircle, FiDownload 
} from 'react-icons/fi';

// Filters
const getDsaContent = (content) => content.filter(item => item.dsaProblemLink);
const getVideoResources = (content) => content.filter(item => item.youtubeEmbedLink);
const getStudyMaterial = (content) => content.filter(item =>
    !item.dsaProblemLink && !item.youtubeEmbedLink && item.contentType !== "pdf"
);
const getPdfNotes = (content) => content.filter(item => item.contentType === "pdf");

const TopicPage = ({ topicName, content, userId }) => {
    const [activeTab, setActiveTab] = useState('study');

    const studyMaterial = getStudyMaterial(content);
    const dsaContent = getDsaContent(content);
    const videoResources = getVideoResources(content);
    const pdfNotes = getPdfNotes(content);

    const handleVideoClick = async (contentId) => {
        try {
            await axios.put(`/api/auth/watch-content/${userId}`, { contentId });
            // Optional: update local state instead of reload for smoother UX
        } catch (error) {
            console.error("Failed to mark video watched:", error);
        }
    };

    // --- TAB BUTTON COMPONENT ---
    const TabBtn = ({ id, label, icon: Icon }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="inline-block px-4 py-1.5 bg-indigo-500/20 rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-500/30">
                        Preparation Hub
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {topicName} <span className="text-indigo-400">Mastery</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
                        Follow our systematic curriculum to crack top-tier technical interviews. 
                        Theory, practice, and assessment—all in one place.
                    </p>
                </motion.div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                <TabBtn id="study" label="Study Material" icon={FiBookOpen} />
                <TabBtn id="notes" label="PDF Notes" icon={FiFileText} />
                <TabBtn id="quiz" label="Take Quiz" icon={FiZap} />
                <TabBtn id="dsa" label="DSA Problems" icon={FiCode} />
                <TabBtn id="resources" label="Video Library" icon={FiVideo} />
            </div>

            {/* CONTENT AREA */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* STUDY MATERIAL TAB */}
                        {activeTab === 'study' && (
                            <div className="grid gap-6">
                                <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
                                    <FiBookOpen className="text-indigo-600"/> Theory & Concepts
                                </h3>
                                {studyMaterial.length === 0 ? (
                                    <EmptyState msg="No theory content yet." />
                                ) : (
                                    studyMaterial.map(item => (
                                        <div key={item._id} className="group bg-white p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                            <h4 className="text-lg font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors">
                                                {item.question_text}
                                            </h4>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 text-sm leading-relaxed mb-4">
                                                {item.explanation}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Source: <span className="text-indigo-500">{item.source_url || 'Verified Internal'}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* PDF NOTES TAB */}
                        {activeTab === 'notes' && (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pdfNotes.map(item => (
                                    <div key={item._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-400 transition-all">
                                        <div className="mb-6">
                                            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                                                <FiFileText size={24} />
                                            </div>
                                            <h4 className="font-bold text-slate-800 mb-2">{item.question_text || "Revision Notes"}</h4>
                                            <p className="text-xs text-slate-500">Official faculty notes in PDF format.</p>
                                        </div>
                                        <a 
                                            href={`http://localhost:5000${item.pdfUrl}`} 
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                                        >
                                            <FiDownload /> View PDF
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* QUIZ TAB */}
                        {activeTab === 'quiz' && (
                            <QuizComponent topicName={topicName} userId={userId} />
                        )}

                        {/* DSA TAB */}
                        {activeTab === 'dsa' && (
                            <div className="grid gap-4">
                                {dsaContent.map(item => (
                                    <div key={item._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                                                <FiCode size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{item.question_text}</h4>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Practice Problem</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <a href={item.dsaProblemLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                                                Solve <FiExternalLink />
                                            </a>
                                            <a href={item.youtubeSolutionLink} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">
                                                Solution <FiPlayCircle />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* RESOURCES TAB */}
                        {activeTab === 'resources' && (
                            <div className="grid sm:grid-cols-2 gap-8">
                                {videoResources.map(item => (
                                    <div key={item._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group">
                                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                            <h4 className="font-bold text-slate-800 truncate pr-4">{item.videoTitle || "Lecture Video"}</h4>
                                            <FiVideo className="text-slate-300 group-hover:text-rose-500 transition-colors" />
                                        </div>
                                        <div className="aspect-video">
                                            <YouTube
                                                videoId={item.youtubeEmbedLink}
                                                opts={{ width: '100%', height: '100%', playerVars: { controls: 1, modestbranding: 1 } }}
                                                onPlay={() => handleVideoClick(item._id)}
                                            />
                                        </div>
                                        <div className="p-6">
                                            <p className="text-xs text-slate-500 italic leading-relaxed">
                                                {item.explanation?.substring(0, 100)}...
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

const EmptyState = ({ msg }) => (
    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
        <FiBookOpen size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-slate-500 font-bold italic">{msg}</p>
    </div>
);

export default TopicPage;
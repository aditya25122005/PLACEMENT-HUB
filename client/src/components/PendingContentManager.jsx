import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheck, FiX, FiExternalLink, FiClock, 
  FiHash, FiBookOpen, FiAlertCircle 
} from 'react-icons/fi';

const PendingContentManager = ({ onContentApproved }) => {
  const [pendingContent, setPendingContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingContent = async () => {
    try {
      const response = await axios.get('/api/content/pending');
      setPendingContent(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending content:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const handleApproval = async (id) => {
    try {
      await axios.put(`/api/content/approve/${id}`);
      fetchPendingContent(); 
      onContentApproved(); 
    } catch (error) {
      alert('❌ Failed to approve content.');
    }
  };

  const handleRejection = async (id) => {
    if(!window.confirm("Are you sure you want to reject this submission?")) return;
    try {
      await axios.put(`/api/content/reject/${id}`);
      fetchPendingContent();
    } catch (error) {
      alert('❌ Failed to reject content.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-slate-500 font-medium italic">Loading queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Verification Queue <span className="text-sm bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg">{pendingContent.length}</span>
          </h3>
          <p className="text-slate-500 text-sm mt-1">Review student contributions before they go live on the platform.</p>
        </div>
        <button 
          onClick={fetchPendingContent}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Refresh Queue"
        >
          <FiClock size={20} />
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {pendingContent.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <FiCheck size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-800">All caught up!</h4>
            <p className="text-slate-500 text-sm">The verification queue is currently empty.</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {pendingContent.map((content) => (
              <motion.div
                layout
                key={content._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <FiHash size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {content.topic}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-tighter">
                        <FiBookOpen /> Study Material Submission
                      </div>
                    </div>
                  </div>
                  
                  <a 
                    href={content.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                  >
                    <FiExternalLink /> Source Link
                  </a>
                </div>

                {/* Content Body */}
                <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Question / Problem</span>
                    <p className="text-slate-700 leading-relaxed text-sm font-medium">
                      {content.question_text}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Provided Explanation</span>
                    <p className="text-slate-600 italic text-sm">
                      {content.explanation}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight">
                    <FiAlertCircle /> Needs Review
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleRejection(content._id)}
                      className="flex items-center gap-2 px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                    >
                      <FiX /> Reject
                    </button>
                    <button 
                      onClick={() => handleApproval(content._id)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      <FiCheck /> Approve & Verify
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PendingContentManager;
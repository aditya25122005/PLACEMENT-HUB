import React, { useState } from 'react';
import axios from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilePlus, FiType, FiVideo, FiFile, 
  FiLayers, FiLink, FiYoutube, FiCheckCircle, FiInfo, FiRefreshCw 
} from 'react-icons/fi';

// Define initial state outside to easily reset form
const INITIAL_FORM_STATE = {
    question_text: '',
    videoTitle: '',
    explanation: '',
    dsaProblemLink: '',
    youtubeSolutionLink: '',
    youtubeEmbedLink: '',
};

const OfficialContentForm = ({ onContentAdded, subjectList }) => {
    const [formData, setFormData] = useState({
        ...INITIAL_FORM_STATE,
        topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude',
    });

    const [contentType, setContentType] = useState("text");
    const [pdfFile, setPdfFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const extractYouTubeID = (url) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?feature=player_embedded&v=|watch\?v=))([^&?/\n]+)/);
        if (match) return match[1];
        const embedMatch = url.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];
        return url;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'youtubeEmbedLink') {
            const iframeMatch = value.match(/src="([^"]+)"/);
            const urlToProcess = iframeMatch ? iframeMatch[1] : value;
            finalValue = extractYouTubeID(urlToProcess);
        }

        setFormData({ ...formData, [name]: finalValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        try {
            const submitData = new FormData();
            // Filter out empty topics or generic 'All'
            submitData.append("topic", formData.topic);
            
            Object.keys(formData).forEach(key => {
                if(key !== "topic") submitData.append(key, formData[key]);
            });
            
            submitData.append("contentType", contentType);

            if (contentType === "pdf" && pdfFile) {
                submitData.append("pdf", pdfFile);
            }

            await axios.post('/api/content/add-official', submitData);
            setMessage('success:✅ Content Published Successfully!');

            // Reset Form properly
            setFormData({
                ...INITIAL_FORM_STATE,
                topic: subjectList && subjectList.length > 0 ? subjectList[0] : 'Aptitude',
            });
            setContentType("text");
            setPdfFile(null);
            onContentAdded();

        } catch (error) {
            setMessage('error:❌ Failed to publish official content.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            
            {/* STUDIO HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                        <FiFilePlus size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Content Creation Studio</h3>
                        <p className="text-sm text-slate-500 font-medium italic">Publishing verified faculty materials</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100">
                    <FiCheckCircle /> Official Verified
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SELECT FORMAT CARDS */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { id: 'text', label: 'Theory', icon: FiType, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { id: 'video', label: 'Video', icon: FiVideo, color: 'text-rose-600', bg: 'bg-rose-50' },
                        { id: 'pdf', label: 'PDF Notes', icon: FiFile, color: 'text-amber-600', bg: 'bg-amber-50' }
                    ].map((format) => (
                        <button
                            key={format.id}
                            type="button"
                            onClick={() => setContentType(format.id)}
                            className={`flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all duration-300 ${
                                contentType === format.id 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-md scale-105' 
                                : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                            }`}
                        >
                            <div className={`p-3 rounded-xl ${format.bg} ${format.color}`}>
                                <format.icon size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${contentType === format.id ? 'text-indigo-700' : 'text-slate-500'}`}>
                                {format.label}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                    
                    {/* TOPIC SELECT */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <FiLayers /> Target Subject Category
                        </label>
                        <select 
                            name="topic" 
                            value={formData.topic} 
                            onChange={handleChange} 
                            required
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer hover:bg-slate-100"
                        >
                            {/* Filter out 'All' topic to prevent faculty from posting there */}
                            {subjectList?.filter(t => t !== "All").map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <AnimatePresence mode="wait">
                        {contentType === "pdf" ? (
                            <motion.div 
                                key="pdf-view"
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-2"
                            >
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload PDF File</label>
                                <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-colors">
                                    <FiFile className="text-slate-300 mb-4 group-hover:text-indigo-400 transition-colors" size={48} />
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setPdfFile(e.target.files[0])}
                                        className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                    />
                                    <p className="mt-2 text-xs text-slate-400 font-medium italic">{pdfFile ? `Selected: ${pdfFile.name}` : "Max size: 10MB (PDF Only)"}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="text-view"
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FiType /> Concept Title / Heading
                                    </label>
                                    <textarea 
                                        name="question_text" 
                                        placeholder="e.g. Introduction to Dynamic Programming"
                                        value={formData.question_text} 
                                        onChange={handleChange} 
                                        rows="1" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-slate-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FiInfo /> Detailed Explanation
                                    </label>
                                    <textarea 
                                        name="explanation" 
                                        placeholder="Explain the concept in detail for the students..."
                                        value={formData.explanation} 
                                        onChange={handleChange} 
                                        rows="5" 
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-sm leading-relaxed"
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-100 grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <FiLink /> Problem Link
                                        </label>
                                        <input type="url" name="dsaProblemLink" value={formData.dsaProblemLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <FiYoutube className="text-rose-500" /> YouTube ID / Embed
                                        </label>
                                        <input type="text" name="youtubeEmbedLink" value={formData.youtubeEmbedLink} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:border-indigo-500" />
                                        
                                        {/* Real-time YouTube Preview */}
                                        {formData.youtubeEmbedLink && (
                                            <div className="mt-2 rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm relative group">
                                                 <img 
                                                    src={`https://img.youtube.com/vi/${formData.youtubeEmbedLink}/mqdefault.jpg`} 
                                                    alt="Video Preview" 
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiYoutube className="text-white text-3xl" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* STATUS MESSAGE */}
                    <AnimatePresence>
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0 }}
                                className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${message.startsWith('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
                            >
                                {message.startsWith('success') ? <FiCheckCircle /> : <FiInfo />}
                                {message.split(':')[1]}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ACTION BUTTON */}
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {isSubmitting ? <FiRefreshCw className="animate-spin" /> : 'Deploy Content Live'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OfficialContentForm;
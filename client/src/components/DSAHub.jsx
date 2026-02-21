import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiCode, FiPlayCircle, FiCheck, FiX, 
  FiInfo, FiHash, FiSearch 
} from "react-icons/fi";

const DSAHub = ({ userId }) => {
  const [dsaProblems, setDsaProblems] = useState([]);
  const [solvedStatus, setSolvedStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  // NEW: Search State
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDsaData = async () => {
      try {
        const problemsResponse = await axios.get("/api/quiz/all-dsa");
        setDsaProblems(problemsResponse.data);

        const userResponse = await axios.get(`/api/auth/profile/${userId}`);
        setSolvedStatus(userResponse.data.solvedDSA || []);
      } catch (error) {
        console.error("Error fetching DSA Hub data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchDsaData();
  }, [userId]);

  const handleToggleSolve = async (problemId) => {
    const isCurrentlySolved = solvedStatus.includes(problemId);
    try {
      const response = await axios.put(`/api/auth/solve-dsa/${userId}`, {
        problemId,
        isSolved: !isCurrentlySolved,
      });
      setSolvedStatus(response.data.solvedDSA);
    } catch (error) {
      console.error("Failed to update solved status:", error);
    }
  };

  // NEW: Filter Logic
  const filteredProblems = dsaProblems.filter((problem) => {
    const title = problem.question_text?.toLowerCase() || "";
    const topic = problem.topic?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return title.includes(query) || topic.includes(query);
  });

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} 
        className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FiCode className="text-indigo-600" /> Coding Vault
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
            Level up your algorithmic skills
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Total</p>
            <p className="text-lg font-bold text-slate-800">{dsaProblems.length}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-black text-emerald-500 uppercase leading-none">Solved</p>
            <p className="text-lg font-bold text-emerald-600">{solvedStatus.length}</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="relative group max-w-xl">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
          <FiSearch size={20} />
        </div>
        <input 
          type="text"
          placeholder="Search by problem name or topic (e.g. Arrays, Recursion)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* PROBLEM LIST */}
      <div className="grid gap-4">
        <AnimatePresence mode='popLayout'>
          {filteredProblems.length > 0 ? (
            filteredProblems.map((problem) => {
              const isSolved = solvedStatus.includes(problem._id);
              const isExpanded = expandedId === problem._id;

              return (
                <motion.div
                  layout
                  key={problem._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`bg-white border rounded-[2rem] p-1 transition-all duration-300 ${
                    isSolved ? "border-emerald-200 shadow-emerald-50 shadow-lg" : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* LEFT: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-tighter flex items-center gap-1">
                          <FiHash size={10}/> {problem.topic || "Algorithm"}
                        </span>
                        {isSolved && (
                          <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                            Solved
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                        {problem.question_text || "Untitled Problem"}
                      </h4>
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : problem._id)}
                        className="mt-3 flex items-center gap-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
                      >
                        <FiInfo /> {isExpanded ? "Hide Approach" : "View Approach"}
                      </button>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="flex items-center gap-2">
                      <a href={problem.dsaProblemLink} target="_blank" rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        Practice
                      </a>
                      <a href={problem.youtubeSolutionLink} target="_blank" rel="noopener noreferrer"
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shadow-sm">
                        <FiPlayCircle /> Video
                      </a>
                      <button
                        onClick={() => handleToggleSolve(problem._id)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          isSolved 
                            ? "bg-emerald-500 text-white shadow-emerald-200 shadow-lg" 
                            : "bg-slate-900 text-white hover:bg-indigo-600"
                        }`}
                      >
                        {isSolved ? <FiCheck strokeWidth={3}/> : <FiX strokeWidth={3}/>}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE APPROACH AREA */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mx-6 mb-6 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Logic & Approach</p>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                            {problem.explanation || "No approach documented yet."}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"
            >
              <FiSearch size={40} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-bold tracking-tight">No problems found matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
              >
                Clear search results
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DSAHub;
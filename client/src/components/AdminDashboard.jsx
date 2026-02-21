import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiFileText, FiPlusCircle, FiHelpCircle, FiInbox, 
  FiLayers, FiSettings, FiGrid, FiBell, FiSearch 
} from "react-icons/fi";

// Modular Components
import OfficialContentForm from "./OfficialContentForm";
import PendingContentManager from "./PendingContentManager";
import QuizManagement from "./QuizManagement";
import ContentLibrary from "./ContentLibrary";
import QuizLibrary from "./QuizLibrary";
import SubjectManager from "./SubjectManager";

/* ---------- UI COMPONENTS ---------- */

const StatCard = ({ title, count, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-xl`}>
      <Icon className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-slate-800">{count}</p>
    </div>
  </div>
);

const NavItem = ({ id, name, icon: Icon, isActive, onClick, count }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
      isActive 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={isActive ? "text-white" : "group-hover:text-indigo-600"} />
      <span className="font-semibold text-sm">{name}</span>
    </div>
    {count > 0 && (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
        isActive ? "bg-white text-indigo-600" : "bg-rose-500 text-white"
      }`}>
        {count}
      </span>
    )}
  </button>
);

/* ---------- MAIN DASHBOARD ---------- */

const AdminDashboard = ({ onContentApprovedOrAdded, subjectList }) => {
  const [activeTab, setActiveTab] = useState("pending_content");
  const [pendingContentCount, setPendingContentCount] = useState(0);
  const [pendingQuizCount, setPendingQuizCount] = useState(0);

  const fetchPendingCounts = async () => {
    try {
      const contentResponse = await axios.get("/api/content/pending");
      setPendingContentCount(contentResponse.data.length);

      const quizResponse = await axios.get("/api/quiz/pending");
      setPendingQuizCount(quizResponse.data.length);
    } catch (error) {
      console.error("Failed to fetch pending counts.", error);
      setPendingContentCount(0);
      setPendingQuizCount(0);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
  }, [onContentApprovedOrAdded]);

  const refreshAppContent = () => {
    onContentApprovedOrAdded();
    fetchPendingCounts();
  };

  const tabs = [
    { id: "pending_content", name: "Verify Submissions", icon: FiInbox, count: pendingContentCount },
    { id: "add_official", name: "Add Official Material", icon: FiPlusCircle },
    { id: "manage_quizzes", name: "Manage Quizzes", icon: FiHelpCircle },
    { id: "content_library", name: "Content Library", icon: FiFileText },
    { id: "quiz_library", name: "Quiz Library", icon: FiGrid },
    { id: "subject_manager", name: "Subject Manager", icon: FiSettings },
  ];

  const renderTabContent = () => {
    const props = { onContentChange: refreshAppContent, subjectList };
    switch (activeTab) {
      case "pending_content": return <PendingContentManager onContentApproved={refreshAppContent} subjectList={subjectList} />;
      case "add_official": return <OfficialContentForm onContentAdded={refreshAppContent} subjectList={subjectList} />;
      case "manage_quizzes": return <QuizManagement {...props} />;
      case "content_library": return <ContentLibrary {...props} />;
      case "quiz_library": return <QuizLibrary {...props} />;
      case "subject_manager": return <SubjectManager onSubjectsUpdated={refreshAppContent} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <FiLayers size={22} />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">Systematic</span>
        </div>

        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Main Menu</p>
          {tabs.map((tab) => (
            <NavItem
              key={tab.id}
              {...tab}
              isActive={activeTab === tab.id}
              onClick={setActiveTab}
            />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Admin User</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Super Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8">
        
        {/* TOP NAVBAR */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
            <p className="text-slate-500 text-sm font-medium">Platform Management & Resource Control</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-64 text-sm transition-all"
              />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 transition-colors relative shadow-sm">
              <FiBell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Pending Content" 
            count={pendingContentCount} 
            icon={FiFileText} 
            color="bg-amber-500" 
          />
          <StatCard 
            title="Live Quizzes" 
            count={124} // Placeholder: You can pass real data here
            icon={FiHelpCircle} 
            color="bg-emerald-500" 
          />
          <StatCard 
            title="Active Subjects" 
            count={subjectList?.length || 0} 
            icon={FiLayers} 
            color="bg-indigo-500" 
          />
        </div>

        {/* TAB CONTENT WITH ANIMATION */}
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden min-h-[600px]">
          <div className="border-b border-slate-100 px-8 py-5 bg-slate-50/30 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest">
               {tabs.find(t => t.id === activeTab)?.icon({ size: 14 })}
               {tabs.find(t => t.id === activeTab)?.name}
            </h3>
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            </div>
          </div>
          
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
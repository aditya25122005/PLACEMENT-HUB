import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiGrid, FiBook, FiUser, FiLogOut, FiLayout, 
  FiTerminal, FiChevronRight, FiPlusCircle, FiMenu, FiArrowLeft
} from "react-icons/fi";

// Components
import AdminDashboard from "./components/AdminDashboard";
import AuthScreen from "./components/AuthScreen";
import ContentSubmissionForm from "./components/ContentSubmissionForm";
import TopicPage from "./components/TopicPage";
import UserDashboard from "./components/UserDashboard";
import DSAHub from "./components/DSAHub";
import ProfilePage from "./components/ProfilePage";

const NEUTRAL_AVATAR = "https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=cbd5e1";

const App = () => {
  const [userInfo, setUserInfo] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModeratorView, setIsModeratorView] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvedContent, setApprovedContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [subjectList, setSubjectList] = useState([]);

  const fetchApprovedContent = async () => {
    try {
      const res = await axios.get("/api/content/approved");
      setApprovedContent(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const refreshUserInfo = async () => {
    if (!userInfo?._id) return;
    try {
      const res = await axios.get(`/api/auth/profile/${userInfo._id}`);
      localStorage.setItem("userInfo", JSON.stringify(res.data));
      setUserInfo(res.data);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    window.location.reload();
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get("/api/subjects/all");
        setSubjectList(res.data.filter((s) => s.name !== "All").map((s) => s.name));
      } catch (err) { console.error(err); }
    };
    if (userInfo) {
      setIsModeratorView(userInfo.role === "moderator");
      fetchSubjects();
      fetchApprovedContent();
    } else {
      setLoading(false);
    }
  }, [userInfo]);

  if (!userInfo) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans flex">

      {/* --- SIDEBAR --- */}
      <motion.aside 
        animate={{ width: isCollapsed ? 80 : 288 }}
        className="bg-slate-900 text-white flex flex-col sticky top-0 h-screen hidden lg:flex shadow-2xl z-50 overflow-hidden"
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-6 -right-0 bg-indigo-600 p-1.5 rounded-l-lg hover:bg-indigo-700 transition-colors z-50"
        >
          {isCollapsed ? <FiChevronRight size={18}/> : <FiArrowLeft size={18}/>}
        </button>

        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="min-w-[40px] h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <FiTerminal size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xl font-black tracking-tight uppercase whitespace-nowrap">
              Placement<span className="text-indigo-400">Hub</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-3 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? "•••" : "Main Navigation"}
          </p>

          <SidebarLink icon={<FiLayout />} label="Overview"
            active={activeView === "dashboard"} collapsed={isCollapsed}
            onClick={() => { setSelectedTopic(null); setActiveView("dashboard"); }}
          />

          <SidebarLink icon={<FiGrid />} label="DSA Hub"
            active={activeView === "dsa"} collapsed={isCollapsed}
            onClick={() => { setSelectedTopic(null); setActiveView("dsa"); }}
          />

          <SidebarLink icon={<FiUser />} label="Profile"
            active={activeView === "profile"} collapsed={isCollapsed}
            onClick={() => { setSelectedTopic(null); setActiveView("profile"); }}
          />

          {userInfo.role === "moderator" && (
            <div className={`mt-8 pt-8 border-t border-slate-800`}>
              {!isCollapsed && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-4">Admin</p>}
              <SidebarLink 
                icon={<FiPlusCircle />} 
                label={isModeratorView ? "Student View" : "Admin Panel"} 
                active={isModeratorView} 
                collapsed={isCollapsed}
                onClick={() => setIsModeratorView(!isModeratorView)} 
              />
            </div>
          )}
        </nav>

        <div className="p-4 mb-4">
          <button onClick={handleLogout}
            className={`flex items-center group w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <FiLogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 bg-slate-100 rounded-lg"><FiMenu size={20}/></button>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
              {isModeratorView ? "Control Center" : `${activeView}`}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{userInfo.username}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">{userInfo.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-indigo-100 shadow-sm overflow-hidden bg-slate-200 flex items-center justify-center cursor-pointer hover:ring-4 hover:ring-indigo-500/10 transition-all"
              onClick={() => { setSelectedTopic(null); setActiveView("profile"); }}>
              {userInfo?.dp ? (
                <img src={`http://localhost:5000${userInfo.dp}`} className="w-full h-full object-cover" alt="profile"
                  onError={(e) => { e.target.src = NEUTRAL_AVATAR }} />
              ) : (
                <FiUser className="text-slate-500 text-xl" />
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {isModeratorView ? (
            <AdminDashboard onContentApprovedOrAdded={fetchApprovedContent} subjectList={subjectList} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTopic ? "topic" : activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >

                {activeView === "profile" && (
                  <ProfilePage
                    userId={userInfo._id}
                    onBack={async () => {
                      await refreshUserInfo();
                      setActiveView("dashboard");
                    }}
                  />
                )}

                {activeView === "dsa" && <DSAHub userId={userInfo._id} />}

                {selectedTopic && (
                  <>
                    <button
                      onClick={() => setSelectedTopic(null)}
                      className="mb-6 flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
                      ← Back to Overview
                    </button>
                    <TopicPage
                      topicName={selectedTopic}
                      content={approvedContent.filter(c => c.topic === selectedTopic)}
                      userId={userInfo._id}
                    />
                  </>
                )}

                {!selectedTopic && activeView === "dashboard" && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <UserDashboard userId={userInfo._id} approvedContent={approvedContent} subjectList={subjectList} />
                    <section>
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase text-lg">Curriculum</h3>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border px-4 py-1.5 rounded-full uppercase tracking-widest">
                          {subjectList.length} Modules
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjectList.map((topic) => (
                          <motion.div key={topic} whileHover={{ y: -8 }}
                            onClick={() => setSelectedTopic(topic)}
                            className="group bg-white border border-slate-200 p-8 rounded-[2.5rem] cursor-pointer hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden">
                            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:rotate-6">
                              <FiBook size={28} />
                            </div>
                            <h4 className="text-xl font-black text-slate-800 mb-2">{topic}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                              {approvedContent.filter(c => c.topic === topic).length} Resources
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </section>

                    <ContentSubmissionForm onSubmissionSuccess={fetchApprovedContent} subjectList={subjectList} />
                  </motion.div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick, collapsed }) => (
  <button 
    onClick={onClick}
    title={collapsed ? label : ""}
    className={`w-full flex items-center transition-all duration-200 font-medium text-sm h-11 rounded-xl ${
      active ? "bg-indigo-600 text-white shadow-md"
      : "text-slate-400 hover:bg-white/10 hover:text-slate-200"
    } ${collapsed ? 'justify-center px-0' : 'px-4 gap-3'}`}
  >
    <span className={`text-xl shrink-0 ${active ? "text-white" : "text-slate-500"}`}>{icon}</span>
    {!collapsed && (
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap overflow-hidden">
        {label}
      </motion.span>
    )}
  </button>
);

export default App;
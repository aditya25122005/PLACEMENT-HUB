import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiBookOpen, FiCode, FiCalendar, 
  FiCamera, FiRefreshCw, FiSave, FiArrowLeft, FiCheckCircle 
} from "react-icons/fi";

/* ---------- PREMIUM PROGRESS RING (FIXED HORIZONTAL TEXT) ---------- */
const ProgressRing = ({ value = 0, total = 100, label, color }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.min(value, total) / total) * circumference;

  return (
    <div className="group flex flex-col items-center p-4 rounded-2xl transition-all duration-300 hover:bg-white/50">
      <div className="relative w-[100px] h-[100px] flex items-center justify-center">
        {/* SVG is rotated, but we keep the text container independent */}
        <svg width="100" height="100" className="-rotate-90 drop-shadow-sm absolute">
          <circle stroke="#f1f5f9" fill="transparent" strokeWidth="8" r={radius} cx="50" cy="50" />
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth="8"
            strokeLinecap="round"
            r={radius}
            cx="50"
            cy="50"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* TEXT CONTAINER: No rotation here, ensuring horizontal text */}
        <div className="relative flex items-center justify-center w-full h-full">
          <span className="text-2xl font-black text-slate-800 tracking-tighter">
            {value}
          </span>
        </div>
      </div>
      <span className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-800 transition-colors">
        {label}
      </span>
    </div>
  );
};

/* ---------- MODERN INPUT FIELD ---------- */
const ModernInput = ({ icon: Icon, label, ...props }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
      <Icon size={18} />
    </div>
    <input
      {...props}
      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none transition-all focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 font-medium"
    />
    <label className="absolute -top-2.5 left-4 px-2 bg-white text-xs font-semibold text-slate-500 rounded">
      {label}
    </label>
  </div>
);

/* ---------- MAIN PROFILE PAGE ---------- */
const ProfilePage = ({ userId, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/auth/profile/${userId}`);
        setProfile(res.data);
        setPreview(res.data?.dp || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`/api/auth/update-profile/${userId}`, profile);
      setMessage("success:Profile Updated Successfully");
    } catch {
      setMessage("error:Update Failed");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleSyncLeetcode = async () => {
    try {
      setMessage("success:Syncing LeetCode...");
      const res = await axios.post(`/api/leetcode/sync/${userId}`, {
        leetcodeId: profile.leetcodeId,
      });
      setProfile(res.data);
      setMessage("success:Stats Synced Successfully");
    } catch {
      setMessage("error:Sync Failed");
    }
  };

  if (loading || !profile) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  const stats = profile.leetcodeStats || {};

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }} 
            animate={{ y: 20, opacity: 1 }} 
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-semibold text-white ${message.startsWith('success') ? 'bg-indigo-600' : 'bg-rose-500'}`}
          >
            <FiCheckCircle /> {message.split(':')[1]}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold group mb-2">
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Profile</h1>
          </div>
          <div className="flex gap-3">
             <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50">
              <FiSave /> {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200/60 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative">
                <div className="relative inline-block mt-4">
                  <img
                    src={preview ? `http://localhost:5000${preview}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    className="w-36 h-36 rounded-[2.5rem] border-4 border-white shadow-xl group-hover:rotate-3 transition-transform duration-500 object-cover overflow-hidden"
                    alt="Profile"
                  />
                  <label className="absolute -bottom-2 -right-2 bg-white text-indigo-600 p-3 rounded-2xl shadow-lg cursor-pointer hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-110">
                    <FiCamera size={20} />
                    <input type="file" hidden />
                  </label>
                </div>
                <h2 className="mt-6 text-2xl font-bold text-slate-800 tracking-tight">{profile.username}</h2>
                <p className="text-slate-400 font-medium">@{profile.username?.toLowerCase().replace(/\s/g, '')}</p>
                <div className="flex justify-center gap-3 mt-8">
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                    <p className="text-xl font-black text-indigo-600 leading-none mt-1">{Math.floor(stats.contestRating || 0)}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solved</p>
                    <p className="text-xl font-black text-emerald-500 leading-none mt-1">{stats.totalSolved || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={handleSyncLeetcode} className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-[2rem] font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              <FiRefreshCw /> Sync LeetCode Data
            </button>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FiUser size={24}/></div>
                <h3 className="text-xl font-bold text-slate-800">Academic Information</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
                <ModernInput icon={FiCalendar} label="Date of Birth" type="date" name="dob" value={profile.dob?.substring(0,10)||""} onChange={handleChange} />
                <ModernInput icon={FiBookOpen} label="University / College" placeholder="Enter College Name" name="college" value={profile.college||""} onChange={handleChange} />
                <ModernInput icon={FiCode} label="Specialization / Branch" placeholder="e.g. Computer Science" name="branch" value={profile.branch||""} onChange={handleChange} />
                <ModernInput icon={FiCode} label="LeetCode Username" placeholder="leetcode_id" name="leetcodeId" value={profile.leetcodeId||""} onChange={handleChange} />
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  Coding Performance <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full uppercase tracking-tighter">Live Stats</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <ProgressRing label="Easy" value={stats.easySolved||0} total={1000} color="#10b981"/>
                  <ProgressRing label="Medium" value={stats.mediumSolved||0} total={1000} color="#f59e0b"/>
                  <ProgressRing label="Hard" value={stats.hardSolved||0} total={500} color="#ef4444"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
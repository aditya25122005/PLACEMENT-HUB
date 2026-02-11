import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "../App.css";

const ProgressRing = ({ value = 0, total = 100, label, color = "#00ffd0" }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (value / total) * circumference;

  return (
    <div className="ring-box">
      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth="8"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth="8"
          strokeLinecap="round"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="ring-label">
        <h4 style={{ margin: 0, fontSize: "18px" }}>{value}</h4>
        <small style={{ color: "#64748b", fontWeight: "600" }}>{label}</small>
      </div>
    </div>
  );
};

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

  const handleDpUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      const formData = new FormData();
      formData.append("dp", file);
      const res = await axios.post(`/api/auth/upload-dp/${userId}`, formData);
      setPreview(res.data.dp);
      setMessage("✅ DP Updated");
    } catch {
      setMessage("❌ Upload Failed");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.put(`/api/auth/update-profile/${userId}`, profile);
      setMessage("✅ Profile Updated Successfully");
    } catch {
      setMessage("❌ Update Failed");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSyncLeetcode = async () => {
    try {
      setMessage("🔄 Syncing LeetCode...");
      const res = await axios.post(`/api/leetcode/sync/${userId}`, {
        leetcodeId: profile.leetcodeId,
      });
      setProfile(res.data);
      setMessage("✅ Stats Synced");
    } catch {
      setMessage("❌ Sync Failed");
    }
  };

  if (loading || !profile) return <h2 className="center">Loading Profile...</h2>;

  const stats = profile.leetcodeStats || {};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}
    >
      <button onClick={onBack} className="back-btn" style={{
        background: "#f1f5f9", border: "none", padding: "10px 20px", borderRadius: "8px",
        color: "#475569", fontWeight: "600", cursor: "pointer", marginBottom: "20px"
      }}>
        ← Back to Dashboard
      </button>

      <div className="profile-card" style={{
        display: "flex", flexWrap: "wrap", gap: "40px", borderRadius: "24px",
        padding: "40px", boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
      }}>
        
        {/* LEFT SECTION: AVATAR */}
        <div style={{ flex: "1 1 250px", textAlign: "center", borderRight: "1px solid #f1f5f9", paddingRight: "20px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={preview ? `http://localhost:5000${preview}` : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
              style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover", border: "4px solid #6d28d9", padding: "4px" }}
              alt="Profile"
            />
            <label style={{
              position: "absolute", bottom: "5px", right: "5px", background: "#6d28d9", 
              borderRadius: "50%", width: "35px", height: "35px", display: "flex", 
              alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white"
            }}>
              + <input type="file" hidden onChange={handleDpUpload} />
            </label>
          </div>
          <h2 style={{ margin: "15px 0 5px", color: "#1e293b" }}>{profile.username}</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginTop: "10px" }}>
            <div style={{ background: "#f5f3ff", padding: "8px 15px", borderRadius: "10px" }}>
              <span style={{ display: "block", fontSize: "12px", color: "#6d28d9" }}>RATING</span>
              <strong style={{ color: "#5b21b6" }}>{Math.floor(stats.contestRating || 0)}</strong>
            </div>
            <div style={{ background: "#f0fdf4", padding: "8px 15px", borderRadius: "10px" }}>
              <span style={{ display: "block", fontSize: "12px", color: "#16a34a" }}>SOLVED</span>
              <strong style={{ color: "#15803d" }}>{stats.totalSolved || 0}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: FORM & STATS */}
        <div style={{ flex: "2 1 400px" }}>
          <h3 style={{ marginBottom: "20px", color: "#334155" }}>Personal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="input-group">
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>DATE OF BIRTH</label>
              <input type="date" name="dob" className="input-field" value={profile.dob?.substring(0, 10) || ""} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>COLLEGE</label>
              <input name="college" placeholder="IIT Delhi" className="input-field" value={profile.college || ""} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>BRANCH</label>
              <input name="branch" placeholder="Computer Science" className="input-field" value={profile.branch || ""} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b" }}>LEETCODE ID</label>
              <input name="leetcodeId" placeholder="username123" className="input-field" value={profile.leetcodeId || ""} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "30px" }}>
            <button onClick={handleSave} disabled={isSaving} style={{
              flex: 1, background: "linear-gradient(135deg, #6d28d9 0%, #3b82f6 100%)",
              color: "white", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "600", cursor: "pointer"
            }}>
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
            <button onClick={handleSyncLeetcode} style={{
              flex: 1, background: "#1e293b", color: "white", border: "none", 
              padding: "12px", borderRadius: "12px", fontWeight: "600", cursor: "pointer"
            }}>
              Sync LeetCode
            </button>
          </div>

          {message && (
            <p style={{ marginTop: "15px", padding: "10px", borderRadius: "8px", background: "#f8fafc", textAlign: "center", fontSize: "14px", fontWeight: "500" }}>
              {message}
            </p>
          )}

          {/* PROGRESS RINGS */}
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: "40px", 
            paddingTop: "30px", borderTop: "1px solid #f1f5f9"
          }}>
            <ProgressRing label="Easy" value={stats.easySolved || 0} total={1000} color="#22c55e" />
            <ProgressRing label="Medium" value={stats.mediumSolved || 0} total={1000} color="#f59e0b" />
            <ProgressRing label="Hard" value={stats.hardSolved || 0} total={1000} color="#ef4444" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from "react";
import axios from "../api";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { FiActivity, FiAward } from "react-icons/fi";

const MAX_QUIZ_SCORE = 5;

/* ---------- PROGRESS RING ---------- */
const ProgressRing = ({ percentage, color }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" className="-rotate-90 absolute">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2 }}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs font-black text-slate-700">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};

/* ---------- DASHBOARD ---------- */

const UserDashboard = ({ userId, approvedContent, subjectList }) => {
  const [chartData, setChartData] = useState([]);
  const [activeTopic, setActiveTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const contentSource = Array.isArray(approvedContent) ? approvedContent : [];
        const userResponse = await axios.get(`/api/auth/profile/${userId}`);
        const data = userResponse.data;
        const watchedIds = data.watchedContent || [];

        const chartList = subjectList.map((topic) => {
          const topicVideos = contentSource.filter(
            (i) => i.topic === topic && i.youtubeEmbedLink
          );
          const watchedCount = topicVideos.filter((i) => watchedIds.includes(i._id)).length;
          const videoPerc = topicVideos.length > 0 ? (watchedCount / topicVideos.length) * 100 : 0;
          const scoreData = data.scores?.find((s) => s.topic === topic);

          const totalQuestions = scoreData?.totalQuestions || 0;
          const lastScore = scoreData?.lastScore || 0;

          const quizPerc =
            totalQuestions > 0
              ? (lastScore / totalQuestions) * 100
              : 0;

          return {
            topic,
            quiz: Math.round(quizPerc),
            videos: Math.round(videoPerc),
            totalVideos: topicVideos.length,
            watched: watchedCount,
            lastScore: scoreData?.lastScore || 0,
            totalQuestions
          };
        });

        setChartData(chartList);
        if (chartList.length > 0) setActiveTopic(chartList[0].topic);
        setLoading(false);
      } catch (error) {
        console.error("Dashboard error:", error);
        setLoading(false);
      }
    };

    if (userId && subjectList?.length > 0) fetchAllData();
  }, [userId, approvedContent, subjectList]);

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center bg-slate-50/50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-10 p-6 bg-[#f8fafc] rounded-3xl"
    >
      {/* HEADER - Added Gradient Text & Background Softness */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <FiActivity className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg box-content" /> 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600">
            Performance Overview
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium italic">
          Detailed breakdown of your learning milestones
        </p>
      </div>

      {/* SUBJECT CARDS - Added subtle Blue-tinted BG and hover shadow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chartData.map((data) => (
          <motion.div
            key={data.topic}
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              activeTopic === data.topic
                ? "border-indigo-400 bg-indigo-50/30 shadow-indigo-100 shadow-xl"
                : "border-slate-200 bg-white/80 hover:bg-white hover:border-indigo-200 shadow-sm"
            }`}
            onClick={() => setActiveTopic(data.topic)}
          >
            <div className="flex justify-between items-start mb-5">
              <h4 className="text-lg font-bold text-slate-800">
                {data.topic}
              </h4>
              <FiAward className={activeTopic === data.topic ? "text-indigo-600 animate-pulse" : "text-slate-400"} />
            </div>

            <div className="flex justify-around bg-slate-100/50 rounded-2xl py-5 border border-slate-200/60 backdrop-blur-sm">
              <div className="text-center">
                <ProgressRing percentage={data.quiz} color="#4f46e5" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Quiz Accuracy
                </p>
              </div>

              <div className="text-center">
                <ProgressRing percentage={data.videos} color="#f59e0b" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Watch Time
                </p>
              </div>
            </div>

            <div className="mt-5 text-xs flex justify-between font-semibold">
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
                Score: {data.lastScore}/{data.totalQuestions || 0}
              </span>
              <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                Videos: {data.watched}/{data.totalVideos}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GLOBAL PROGRESS CHART - Glassmorphism look */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-8 shadow-md">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
           <h3 className="text-xl font-bold text-slate-800">
             Global Progress Across Subjects
           </h3>
        </div>

        <div className="w-full h-[320px] bg-slate-50/50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="topic" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}} 
              />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />

              <Bar dataKey="quiz" radius={[6, 6, 0, 0]} barSize={30}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.topic === activeTopic ? "#6366f1" : "#cbd5e1"}
                  />
                ))}
              </Bar>

              <Bar dataKey="videos" fill="#fbbf24" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../App.css";

const MAX_QUIZ_SCORE = 5;

// Helper function to render the circular progress ring
const renderProgressRing = (percentage, color) => {
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ marginRight: "10px" }}>
      <circle cx="30" cy="30" r={radius} fill="none" stroke="#e0e0e0" strokeWidth="6" />
      <circle
        cx="30"
        cy="30"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1s ease-in-out",
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="10"
        fill="var(--text-dark)"
        fontWeight="700"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

const UserDashboard = ({ userId, approvedContent, subjectList }) => {
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState([]);
  const [chartData, setChartData] = useState([]);

  const getScorePercentage = (score) => (score / MAX_QUIZ_SCORE) * 100;

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const contentSource = Array.isArray(approvedContent) ? approvedContent : [];

        // ✅ FIXED LINE: use backticks for template literal
        const userResponse = await axios.get(`/api/auth/profile/${userId}`);
        const userData = userResponse.data;

        setUserScores(userData.scores || []);
        const watchedIds = userData.watchedContent || [];
        const progressData = [];
        const chartList = [];

        subjectList.forEach((topic) => {
          const allTopicVideos = contentSource.filter(
            (item) => item.topic === topic && item.youtubeEmbedLink
          );

          const totalVideos = allTopicVideos.length;
          const watchedCount = allTopicVideos.filter((item) =>
            watchedIds.includes(item._id)
          ).length;

          const videoPercentage =
            totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0;

          const scoreData = userData.scores?.find((s) => s.topic === topic);
          const quizPercentage = scoreData
            ? getScorePercentage(scoreData.highScore)
            : 0;

          progressData.push({
            topic,
            total: totalVideos,
            watched: watchedCount,
            percentage: videoPercentage,
          });

          chartList.push({
            topic,
            quiz: Math.round(quizPercentage),
            videos: Math.round(videoPercentage),
          });
        });

        setVideoProgress(progressData);
        setChartData(chartList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    if (
      userId &&
      Array.isArray(approvedContent) &&
      approvedContent.length > 0 &&
      subjectList.length > 0
    ) {
      fetchAllData();
    } else if (userId && Array.isArray(subjectList) && subjectList.length > 0) {
      setLoading(false);
    }
  }, [userId, approvedContent, subjectList]);

  const getVideoProgress = (topic) =>
    videoProgress.find((p) => p.topic === topic);

  if (loading) {
    return <p className="dashboard-loading">Loading your placement progress...</p>;
  }

  return (
    <section className="dashboard-section" style={{ padding: "20px" }}>
      <h2 className="section-title">📘 Your Systematic Progress Dashboard</h2>

      {/* --- Individual Subject Progress --- */}
      <div className="score-visual-grid">
        {subjectList.map((topic) => {
          const scoreData = userScores.find((s) => s.topic === topic);
          const scoreToLast = scoreData ? scoreData.lastScore : 0;
          const quizPercentage = getScorePercentage(scoreToLast);

          const videoData = getVideoProgress(topic);
          const videoPercentage = videoData ? videoData.percentage : 0;

          return (
            <div key={topic} className="score-card">
              <h3>{topic} Mastery</h3>

              {/* Quiz Progress */}
              <div className="progress-section quiz-section">
                {renderProgressRing(quizPercentage, "var(--primary-color)")}
                <div className="metric-text-area">
                  <h4>Last Quiz Score</h4>
                  <p className="score-value">
                    {scoreToLast} / {MAX_QUIZ_SCORE}
                  </p>
                  <small>
                    Last Attempt:{" "}
                    {scoreData
                      ? new Date(scoreData.lastAttempt).toLocaleDateString()
                      : "N/A"}
                  </small>
                </div>
              </div>

              <hr
                style={{
                  margin: "15px 0",
                  borderStyle: "dashed",
                  borderColor: "#e0e0e0",
                }}
              />

              {/* Video Progress */}
              {videoData && videoData.total > 0 ? (
                <div className="progress-section video-section">
                  {renderProgressRing(videoPercentage, "var(--progress-orange)")}
                  <div className="metric-text-area">
                    <h4>Video Learning</h4>
                    <p className="score-value">
                      {videoData.watched} / {videoData.total} Watched
                    </p>
                    <small>Total Resources: {videoData.total}</small>
                  </div>
                </div>
              ) : (
                <small
                  style={{
                    color: "#6c757d",
                    display: "block",
                    marginTop: "10px",
                  }}
                >
                  No video resources available for tracking.
                </small>
              )}
            </div>
          );
        })}
      </div>

      {/* --- Performance Graph: Bar Chart --- */}
      <div
        className="performance-graph"
        style={{
          background: "#fefefe",
          padding: "20px",
          borderRadius: "15px",
          marginTop: "30px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
          📊 Overall Learning Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quiz" fill="#4f9dff" name="Quiz %" />
            <Bar dataKey="videos" fill="#f1b45f" name="Videos %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default UserDashboard;

const express = require("express");
const axios = require("axios");
const User = require("../models/User");

const router = express.Router();

router.post("/sync/:userId", async (req, res) => {
  try {
    const { leetcodeId } = req.body;
    const { userId } = req.params;

    if (!leetcodeId) {
      return res.status(400).json({ message: "LeetCode ID required" });
    }

    const query = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            profile {
              ranking
            }
          }
          userContestRanking(username: $username) {
            rating
            attendedContestsCount
          }
        }
      `,
      variables: { username: leetcodeId },
    };

    const response = await axios.post("https://leetcode.com/graphql", query);

    const data = response.data.data;

    if (!data.matchedUser) {
      return res.status(404).json({ message: "Invalid LeetCode Username" });
    }

    const stats = data.matchedUser.submitStatsGlobal.acSubmissionNum;

    const totalSolved = stats.find(s => s.difficulty === "All")?.count || 0;
    const easySolved = stats.find(s => s.difficulty === "Easy")?.count || 0;
    const mediumSolved = stats.find(s => s.difficulty === "Medium")?.count || 0;
    const hardSolved = stats.find(s => s.difficulty === "Hard")?.count || 0;

    const ranking = data.matchedUser.profile?.ranking || 0;
    const contestRating = data.userContestRanking?.rating || 0;
    const totalContests = data.userContestRanking?.attendedContestsCount || 0;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        leetcodeId,
        leetcodeStats: {
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
          ranking,
          contestRating,
          totalContests,
        },
      },
      { new: true }
    );

    res.json(updatedUser);

  } catch (error) {
    console.error("LeetCode Sync Error:", error.message);
    res.status(500).json({ message: "Failed to fetch LeetCode stats" });
  }
});

module.exports = router;

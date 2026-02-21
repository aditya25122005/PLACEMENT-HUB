📝 Verified Placement Prep Hub
A systematic, full-stack web application designed to solve the problem of unverified content and chaotic preparation by providing students with a moderator-validated learning platform.

The application enforces a Quality Gate (Moderation Loop) for all content sourced from the community or the internet, ensuring students only study reliable, high-relevance material.

✨ Unique Selling Proposition (USP)
Our primary competitive advantage over platforms like GeeksforGeeks or public forums is Trust and Accountability.

Feature	Impact
Gla-Validated Content	Content is submitted by the community but only goes live after faculty/admin approval, ensuring 100% relevance to campus drives and syllabus requirements.
Systematic Progress Tracking	Visual Dashboards use dynamic Progress Rings to show real-time scores (Quiz Mastery) and Video Progress for every subject.
Dynamic CMS Architecture	Admins can add new subjects (e.g., 'React JS', 'Machine Learning') and manage all content and quizzes without touching the codebase.
Integrated Learning	Centralized hub for Theory, Topic-wise MCQs, and direct links to external DSA problems and solutions.

Export to Sheets
💻 Tech Stack
This is a modern, high-performance MERN stack application built for stability and scalability.

Frontend
Framework: React.js (using Vite for fast development).

UI/Styling: Custom CSS (Professional Emerald/Navy Theme) and SVG for dynamic Progress Rings.

API Client: Axios.

Video Tracking: react-youtube (Used for reliable onEnd event tracking for video progress).

Backend & Database
Runtime: Node.js with Express.js (RESTful API).

Database: MongoDB Atlas (Cloud-hosted).

Security: JWT for token-based authentication and Bcrypt for password hashing.

Data Structure: Normalized schema across three collections (Users, Content, QuizQuestion) to support scalable tracking and modularity.

🔒 Key Features & Workflow
1. The Moderation Loop (The Core USP)
This is the central workflow for ensuring quality control:

Submission: Students use the Content Submission Form to propose new external links or theory (e.g., a new DSA problem found online).

Admin Review: The content lands in the Verify Submissions pending queue.

Quality Gate: The Moderator logs in, reviews the content (on the Admin Dashboard), and uses the Approve button.

Result: The item instantly goes live with a "Verified" status.

2. User Dashboard (Systematic Feedback)
Quiz Mastery: Visualized by Circular Progress Rings showing the user's last score (X/5) and percentage mastery in each subject.

Video Learning: A separate progress ring tracks the percentage of approved video resources the user has marked as watched.

Topic Hub: Dynamic list of subjects fetched from the database (not hardcoded).

3. Admin Tools (Full Control)
Content Library: Full CRUD (Create, Read, Update, Delete) control over all study materials.

Quiz Library: Full CRUD control over all quiz questions and options.

Subject Manager: Ability to add new subjects dynamically (e.g., Machine Learning) without code changes.

⚙ Setup and Installation
Prerequisites
Node.js (v18+)

MongoDB Atlas Account

Active Internet Connection (VPN/Hotspot may be needed for Atlas access)

Local Setup
Clone the repository:

Bash

git clone [Your GitHub Repo URL]
cd verified-placement-hub
Install Dependencies:

Bash

cd server && npm install
cd ../client && npm install
Configure Atlas URI: Create a server/.env file and set your Atlas connection string:

Code snippet

# server/.env
MONGO_URI="mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.xxx.mongodb.net/PlacementDB?retryWrites=true&w=majority"
JWT_SECRET="Your_Secret_Key"
Seed the Database (Load Data): Run the seeder script to create initial content and user accounts (modadmin, teststudent):

Bash

cd server
node seed.js
Start Servers:

Bash

# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
cd client
npm run dev

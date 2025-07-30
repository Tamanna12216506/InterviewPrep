
# Interview Prep

An AI-powered full-stack platform to help students and job seekers prepare for technical interviews. Users can solve coding problems, get real-time AI-generated hints and explanations using Gemini API, and simulate mock interviews via chat (AI or peer).

---

## Tech Stack

**Frontend:**

* React.js (Vite)
* TailwindCSS
* ShadCN/UI
* Monaco Editor

**Backend:**

* Node.js + Express.js
* MongoDB (Mongoose)
* JWT Authentication
* Gemini AI API

**Real-time Communication:**

* Socket.io

**Deployment:**

* Vercel (Frontend)
* Render (Backend)

---

## 🔑 Key Features

* 🧠 **AI-Powered Assistance**: Get code hints, solutions, and explanations from Gemini AI.
* 💻 **Coding Interface**: Monaco editor with test cases, descriptions, and toggle for AI help.
* 🗣️ **Mock Interviews**: Real-time chat-based mock interviews with AI or peer.
* 🔐 **Authentication**: Secure login/signup using JWT tokens.
* 📊 **Performance Tracker**: Save session history and view progress dashboard.

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/interview-prep.git
cd interview-prep
```

### 2. Environment Variables

 Backend (`/backend/.env`)

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:3000
```

 Frontend (`/frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Install dependencies

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

 Future Scope

* Voice-based AI interview assistant
* Resume analysis with feedback
* Admin dashboard for moderation
* Leaderboard and community features
* Multi-language coding support

---

Contact

Created by [Tamanna](https://github.com/your-github-profile) – feel free to reach out for suggestions or collaboration!


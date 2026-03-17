<div align="center">

# 🚀 ResumeAI

### AI-Powered ATS & Resume Tailoring System

[![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
[![Groq](https://img.shields.io/badge/AI-Llama%203.3%2070B-FF6B35)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

**ResumeAI bridges the gap between job seekers and recruiters using deep semantic resume analysis.**  
It combines programmatic scoring with Llama 3.3 (via Groq) to simulate how real ATS systems and recruiters evaluate resumes.

[Features](#-features) · [Architecture](#-technical-architecture) · [Scoring Logic](#-scoring-logic) · [Getting Started](#-getting-started) · [Deployment](#-deployment)

</div>

---

## ✨ Features

### 🎓 For Students

| Feature | Description |
|---|---|
| 🔎 **Deep ATS Scanning** | Hybrid engine combining regex-based programmatic scoring + semantic AI evaluation for high-accuracy ATS compatibility scores |
| ✍️ **AI Resume Tailoring** | Llama 3.3 rewrites bullet points using the STAR method, aligned to specific job descriptions |
| 📄 **PDF Parsing** | Seamless resume uploads with text extraction via `pdf2json`, fed into a custom ATS scoring engine |
| 📊 **Personal Dashboard** | Track resume history, view ATS score trends, and store multiple resume versions securely |

### 👔 For Recruiters

| Feature | Description |
|---|---|
| 📂 **Candidate Pool Management** | View all submitted resumes, automatically sorted by ATS score |
| ⚡ **Instant Pre-Screening** | Identify top-tier candidates based on technical skill alignment, project complexity, and resume quality |
| 🔐 **Secure Role-Based Access** | Recruiter dashboard fully protected from student access via RBAC |

---

## 🏗 Technical Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│      Frontend       │  REST   │       Backend        │
│   React.js (Vite)   │◄───────►│  Node.js / Express  │
│    Tailwind CSS     │   API   │     MongoDB Atlas    │
│     [ Vercel ]      │         │      [ Render ]      │
└─────────────────────┘         └────────┬────────────┘
                                          │
                              ┌───────────▼───────────┐
                              │     AI Engine          │
                              │  Groq SDK              │
                              │  Llama 3.3 – 70B       │
                              └───────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **AI Engine** | Groq SDK — Llama 3.3 70B |
| **File Handling** | Multer, pdf2json |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## 📊 Scoring Logic — *"The Harsh Engine"*

Unlike generic resume checkers, ResumeAI simulates real recruiter behavior using a stricter, two-part scoring methodology.

```
Total ATS Score
├── ⚙️  Programmatic Score  ── 70%
│     ├── Resume structure
│     ├── Contact info completeness
│     ├── Impact metrics
│     ├── Action verbs
│     └── Section formatting
│
└── 🧠  Semantic AI Score   ── 30%
      ├── Project complexity
      ├── Skill relevance
      ├── Resume clarity
      └── Professional tone
```

### ⚠️ Realism Penalties

The engine introduces real-world ATS penalties for:

- Missing professional titles
- Weak or vague project descriptions
- Excessive *"ongoing student"* indicators

This ensures scores that reflect genuine industry ATS behavior.

---

## 🛡 Security & Best Practices

| Measure | Implementation |
|---|---|
| 🔐 **JWT Authentication** | Secure login with Role-Based Access Control (RBAC) |
| 🌐 **CORS Protection** | Strict origin validation between Vercel (frontend) and Render (backend) |
| 🍪 **Secure Cookies** | `httpOnly`, `secure`, `sameSite: "none"` for safe cross-domain session management |

---

## 🚦 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Groq API key

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/sunilravulapati/AI-Resume-App.git
cd AI-Resume-App
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PORT=4000
```

Start the backend:

```bash
npm start
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

---

## 🌐 Deployment

| Layer | Platform |
|---|---|
| **Frontend** | Vercel |
| **Backend** | Render |
| **Database** | MongoDB Atlas |
| **AI Model** | Groq (Llama 3.3 70B) |

---

## ⭐ Why ResumeAI?

ResumeAI goes beyond simple keyword matching. It combines:

- ✅ ATS logic
- ✅ AI semantic reasoning
- ✅ Real recruiter evaluation patterns

...to deliver one of the most realistic resume analysis systems built for students and developers.

---

## 👨‍💻 Developer

**Sunil Ravulapati**  
B.Tech Computer Science — Anurag University | CGPA: 9.05  
💻 Full-Stack Developer &nbsp;·&nbsp; 🏆 Competitive Programmer

| Platform | Stats |
|---|---|
| LeetCode | 450+ problems solved |
| CodeChef | 760+ problems solved |

---

<div align="center">

⭐ **If you find this project useful, consider starring the repository!** ⭐

</div>

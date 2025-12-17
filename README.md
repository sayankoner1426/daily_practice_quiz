# 🧠 UPSC Quiz Hub - AI-Powered Daily Practice Site

A full-stack **Next.js 14 (App Router)** application designed for **UPSC & competitive exam preparation**, powered by **Google Gemini AI**.  
The platform generates **real-time, topic-specific quizzes**, evaluates responses automatically, and provides performance analytics — all using a **non-blocking async architecture**.

---

## ✨ Key Highlights

- ⚡ **AI-Generated MCQs** using Google Gemini 1.5 Flash  
- 🔄 **Fire-and-Forget Architecture** to handle AI latency  
- ⏱️ **Strict 5-Minute Exam Timer** (UPSC-style discipline)  
- 📊 **Auto-Grading & Analytics Dashboard**  
- 🛡️ **Robust JSON Cleaning** for AI safety  
- 🧪 **Fully Tested** (Logic, API, UI)

---

## 📸 Application Screenshots

### 🏠 Landing Page

::contentReference[oaicite:0]{index=0}


### 📊 User Dashboard & Performance Analytics

::contentReference[oaicite:1]{index=1}


### 📚 Subject Selection (UPSC Categories)

::contentReference[oaicite:2]{index=2}


### ❓ Live Quiz Interface (Timed)

::contentReference[oaicite:3]{index=3}


### 🏆 Results & Answer Review

::contentReference[oaicite:4]{index=4}


---

## 🚀 Features

### ⚡ AI-Generated Content
- Generates **10 high-quality MCQs** per quiz
- Topic-specific UPSC-oriented questions
- Powered by **Google Gemini 1.5 Flash**

### 🔄 Asynchronous Polling Architecture
- Non-blocking generation workflow
- Frontend polls server **every 1 second**
- Prevents browser/server timeouts

### ⏱️ Strict Examination Timer
- Hard **300-second (5 min)** limit
- Auto-submission on timeout
- Prevents post-time answer changes

### 🛡️ Robust Error Handling
- Custom `cleanAndParseJSON()` utility
- Strips Markdown, backticks, invisible characters
- Prevents crashes from malformed AI output

### 📊 Auto-Grading & Analytics
- Instant evaluation after submission
- Correct / Incorrect / Attempted breakdown
- Historical performance tracking

### 🧪 Test-Driven Reliability
- Unit Tests (logic & utilities)
- Integration Tests (API routes)
- Component Tests (UI rendering)

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React Hooks (`useState`, `useEffect`, `useRef`)

### Backend
- **Runtime:** Next.js API Routes (Serverless)
- **Database:** MongoDB Atlas (Mongoose ORM)
- **AI Engine:** Google Gemini SDK (`gemini-1.5-flash`)

### Testing
- **Runner:** Jest
- **UI Testing:** React Testing Library

---

## 🔄 System Architecture & Workflow

### 1️⃣ Async Generation Loop

1. **Initiation**  
   User selects topic →  
   `POST /api/quiz/generate`  
   → Creates Quiz with `status: generating`

2. **Background Job (Fire-and-Forget)**  
   Gemini AI is triggered asynchronously  
   Server immediately returns `quizId`

3. **Smart Polling**
   - Frontend polls:  
     `GET /api/quiz/questions/[quizId]`
   - `202` → Still generating  
   - `200` → Questions ready → Timer starts

4. **Data Cleaning**
   - AI output cleaned using `cleanAndParseJSON`
   - Markdown & invalid tokens removed before DB save

---

## 🗄️ Database Schema (MongoDB)

### Quiz Collection

{
  _id,
  subject,
  status: "generating" | "ready" | "failed",
  requestedBy,
  createdAt
}

 ### Question Collection
{
  quizId,
  text,
  options: [String],
  correctOption,
  explanation
}

### 📡 API Documentation
Method	  Endpoint	                Description
POST	/api/quiz/generate	       Starts AI generation
GET	    /api/quiz/questions/:id	   Polls quiz status
POST	/api/quiz/submit	       Submits answers


🧪 Testing Strategy

Located inside __test__/ directory:

cleaner.test.js → JSON cleaner reliability

scoring.test.js → Score calculation accuracy

Header.test.js → UI & auth flow validation

Run Tests
npm test


⚙️ Run Locally
1️⃣ Prerequisites

Node.js v18+

MongoDB Atlas account

Google Gemini API Key

2️⃣ Clone & Install
git clone https://github.com/your-username/daily-quiz-ai.git
cd daily-quiz-ai
npm install

3️⃣ Environment Setup (.env.local)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/quizdb
GEMINI_API_KEY=your_gemini_api_key

4️⃣ Start Server
npm run dev


Visit 👉 http://localhost:3000

# OpportunityAI — Your Daily Career Assistant
### AI-Powered Opportunity Intelligence Platform for Students

OpportunityAI is an end-to-end, intelligent web platform designed to help university and college students discover, verify, prioritize, and act on high-impact career opportunities (internships, hackathons, scholarships, fellowships, competitions, workshops, certifications, research programs, and entry-level jobs).

---

## 🌟 Key Features

### 1. Personalized Student Dashboard
- **Dynamic Profile Summary**: Real-time academic background status (Degree, Major, Academic Year, CGPA).
- **6 Key Metrics Counters**:
  - Matched Opportunities (≥60% fit)
  - Total Verified Openings
  - Applications Tracked in Kanban Pipeline
  - Opportunities Closing Soon (≤14 days)
  - Saved Bookmarks
  - Urgent Imminent Deadlines (≤3 days, pulsing indicator)
- **Daily Career Action Plan**: Personalized checklist derived from approaching deadlines, application follow-ups, and targeted skill gaps.
- **Urgent Opportunities Carousel**: Visual prioritization for listings closing in 1 to 3 days.

### 2. Weighted AI Recommendation & Explicit Eligibility Engine
- **Transparent Weighted Scoring Algorithm (100% total)**:
  - Technical & Soft Skills Match: **35%**
  - Academic & Eligibility Criteria Match: **25%**
  - Interest & Preferred Category Match: **15%**
  - Location & Work Mode Preferences: **15%**
  - Deadline Urgency Priority: **10%**
- **Strict, Separate Eligibility Checker**:
  - Mandatory checks for Degree, Academic Year, Minimum CGPA, and Eligible Branches.
  - Returns `Eligible`, `Potentially Eligible`, `Not Eligible`, or `Eligibility Information Unavailable`.
  - Ineligible candidates are never labeled eligible solely due to high skill match.
- **Detailed Recommendation Rationale & Recommended Next Actions**: Direct explanations why an opportunity fits the student.

### 3. Natural Language Search
- Students can search naturally, e.g.:
  > *"Find remote software engineering internships for third-year CSE students that accept beginners and close within two weeks"*
- The engine translates natural language into structured filters (`category`, `work_mode`, `academic_year`, `max_days_remaining`, `keywords`) and ranks results by AI compatibility.

### 4. Interactive Opportunity Map
- Built with **Leaflet** and **OpenStreetMap**.
- Custom color-coded pulsing SVG markers:
  - 🔴 **Red**: Urgent (≤3 days remaining)
  - 🟡 **Yellow**: Approaching (4–14 days remaining)
  - 🟢 **Green**: Open (>14 days remaining)
- **Radius Slider**: Filter opportunities within 10 km to 150 km of major tech hubs (Bengaluru, Hyderabad, Mumbai, New Delhi, Pune, Chennai).
- **Split-View Drawer**: Click markers to preview stipend, required skills, verification trust score, and open official application pages.

### 5. Application Tracking System (ATS)
- **Kanban Board & Table View Toggle**:
  - 8 Pipeline Stages: *Interested*, *Planning to apply*, *Application in progress*, *Applied*, *Assessment or interview*, *Offer received*, *Rejected*, *Withdrawn*.
  - Private notes editor for SOP drafts and recruiter contacts.
  - Follow-up dates and interview scheduling calendar.
  - Automatic status transition history & audit log.
  - Per-student database persistence in MongoDB.

### 6. Skill-Gap Intelligence & Learning Roadmaps
- Identifies **Acquired Skills** vs. **High-ROI Missing Skills**.
- **Market Demand Analysis**: Frequency of skill requests across all active opportunities.
- **Opportunity Unlocking Potential**: Shows exactly how many opportunities learning a skill (e.g., Docker, AWS, PyTorch, Kubernetes) will unlock.
- **Curated Step-by-Step Learning Roadmaps**: Estimated study hours, difficulty ratings, and direct links to free interactive tutorials and official documentation.

### 7. Daily Career Assistant Chatbot
- Interactive career assistant grounded in real database records and the student's authorized profile.
- Context-aware responses answering:
  - *"Which opportunities should I apply for first?"*
  - *"What are my biggest skill gaps?"*
  - *"Generate today's career action plan"*
  - *"Am I eligible for Google Summer of Code or Amazon AWS?"*
- Configurable **Google Gemini LLM** integration with grounded fallback.

### 8. Analytics & Visual Reports
- **Recharts Data Visualizations**:
  - Applications by Pipeline Status
  - Opportunity Category Breakdown
  - Most In-Demand Skills in Current Market
  - Weekly Student Application Cadence
  - Match Score Distribution

### 9. Verification & Trust Scoring System
- Transparent badges: *Verified Source*, *Source Identified*, *Verification Required*, *Expired*, *Potential Warning*.
- Evaluates TLS/SSL certificates, domain authority (.gov.in, .ac.in, official corporate career portals), and publication freshness.
- Student Report modal allowing immediate community flagging of outdated or broken listings.

### 10. Deadline Intelligence & Multi-Channel Alerts
- Non-duplicate notification generator triggered at 7-day, 3-day, and final-day intervals.
- In-app notification center with read/unread filtering.
- SMTP email notification dispatch when email credentials are configured.

### 11. Unstop Integration & Company Official Webpage Guarantee
- **Live Unstop Aggregator (`unstop_service.py`)**: Fetches active competitions, hackathons, internships, hiring drives, and scholarships directly from Unstop (`unstop.com`).
- **Official Company Portal Guarantee**: Every opportunity is mapped and verified to direct users straight to each company's authenticated career portal (e.g. Polycab, Learntricks, Flipkart, Walmart, Amber, Tata, Amazon, Google, Microsoft, Adobe, etc.).
- **Live Synchronization**: Instant "Sync Unstop Feed" trigger directly on the Explore and Sources pages to fetch new opportunities anytime.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, TypeScript, Tailwind CSS v4, Lucide Icons, React Router 7, Recharts, Leaflet, React-Leaflet |
| **Backend** | Python 3.14 / 3.11+, FastAPI, Pydantic v2, Pydantic-Settings, Uvicorn, Motor, PyMongo, PyJWT, Bcrypt, HTTPX, Pytest |
| **Database** | MongoDB (v8.2.1 running locally or MongoDB Atlas) |
| **AI / NLP** | Rule & Weighted Scoring Engine, NLP Query Parser, Google Gemini API (optional) |

---

## 📂 Project Structure

```
project(wt)/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints (auth, profile, opportunities, recommendations, map, applications, saved, notifications, skills, assistant, analytics, sources, reports)
│   │   ├── core/            # Configuration, database connection, JWT & password security
│   │   ├── models/          # MongoDB models & enums
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── seeds/           # Multi-category sample opportunities seed dataset
│   │   ├── services/        # Weighted matching, eligibility checker, NLP search, assistant, deadline intelligence, skill gap, unstop_service
│   │   ├── tests/           # Automated pytest test suites
│   │   └── main.py          # FastAPI application entry point with CORS & lifespan hooks
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, OpportunityCard, OpportunityModal, ReportModal
│   │   ├── context/         # AuthContext with session persistence
│   │   ├── pages/           # Dashboard, Explore, Map, Applications, Saved, Assistant, SkillGap, Analytics, Notifications, Profile, Sources, Auth
│   │   ├── services/        # Typed API client
│   │   ├── types/           # TypeScript interfaces
│   │   ├── index.css        # Tailwind v4 dark theme styling & custom scrollbars
│   │   └── App.tsx          # Root layout and routing
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts       # Tailwind v4 plugin + API proxy to backend
├── .env.example
└── README.md
```

---

## 🚀 Quickstart & Installation Instructions

### Prerequisites
- **Node.js** (v18+ or v20+) and **npm**
- **Python** (v3.10+)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string)

### 1. Database Setup
Ensure MongoDB is running locally:
```powershell
# Check MongoDB service status (Windows)
Get-Service -Name *mongo*
# Port 27017 should be listening
```

### 2. Backend Setup
```powershell
# Navigate to backend and activate virtual environment
.\venv\Scripts\activate

# Install requirements (if not already installed)
pip install -r backend\requirements.txt

# Run the backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
Backend API interactive documentation is available at:
👉 **http://127.0.0.1:8000/docs**

### 3. Frontend Setup
In a new terminal window:
```powershell
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```
Access the application at:
👉 **http://localhost:5173/**

---

## 🧪 Automated Testing

Run the full backend automated test suite:
```powershell
$env:PYTHONPATH="backend"
.\venv\Scripts\pytest backend\app\tests
```
**Results:** `8 passed in 1.40s`
- `test_core_engines.py`: Tests eligibility rules, weighted match calculation, deadline urgency (Red/Yellow/Green), NLP natural language parser, and skill-gap extraction.
- `test_api_endpoints.py`: Tests API health, opportunities seeding and category filtering, registration and login JWT flow, profile update, bookmarking, and Kanban application lifecycle.

Run frontend production build verification:
```powershell
cd frontend
npm run build
```
**Result:** `✓ built in 10.09s` without any errors.

---

## 🔑 Environment Variables (`.env`)

Create a `.env` file in the root or `backend/` directory:
```env
PROJECT_NAME="OpportunityAI — Your Daily Career Assistant"
API_V1_STR=/api
SECRET_KEY=opportunityai-super-secret-jwt-key-2026-production-ready
MONGODB_URL=mongodb://127.0.0.1:27017
DATABASE_NAME=opportunity_ai_db

# Optional AI Assistant Key
# GEMINI_API_KEY=your_gemini_api_key_here

# Optional SMTP Settings for Email Alerts
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# EMAILS_FROM_EMAIL=notifications@opportunityai.local
```

---

## 🎯 Instant Hackathon Demonstration Mode
- When opening **http://localhost:5173/**, you can explore immediately as a guest student or sign in.
- Click **"Instant Demo Student Sign-In"** on the Auth page to log in as *Aarav Sharma* (B.Tech 3rd Year CSE student with Python, React, and SQL).
- Use the **"Seed Demo Data"** button in the top navbar to repopulate or refresh the sample dataset with 15+ verified multi-category programs.
- Try changing your academic year or skills in **My Profile** and watch the **Dashboard** and **Explore** match scores immediately recalculate!

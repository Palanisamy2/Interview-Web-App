# Candidate Skill Assessment Platform

A role-based, stack-based technical assessment platform built according to the specification plan in `skill-assessment-platform-plan.md.pdf`.

- **Frontend**: Next.js 14 (React, TypeScript, Tailwind CSS, Recharts, Monaco code runner)
- **Backend**: Node.js, Express.js (MVC Pattern)
- **Database & ORM**: PostgreSQL via Sequelize ORM (with seamless SQLite development fallback)
- **Interactive Coding & Telemetry**: In-browser code runner evaluating unit tests against isolated sandboxes, with full behavioral telemetry tracking (thinking time before first edit, active typing vs idle pauses, keystroke churn/backspaces, paste detection, and test run progression).

---

## Architecture Overview (MVC Pattern)

```
Interview Web/
├── backend/                       # Node.js + Express + Sequelize ORM
│   ├── src/
│   │   ├── config/database.js     # Sequelize configuration (PostgreSQL / SQLite)
│   │   ├── models/                # Sequelize Models (User, Role, Stack, Sector, Question, TestSession, CodingTelemetry, etc.)
│   │   ├── controllers/           # MVC Controllers (auth, role, session, admin, question)
│   │   ├── routes/                # Express API Routes
│   │   ├── services/              # Core Domain Services (scoringEngine, roleFitEngine, testGenerator, codeRunner)
│   │   ├── middlewares/           # JWT verification, RBAC, anti-cheating tracking
│   │   ├── seeders/index.js       # Database seeder (React & Node.js questions, roles, blueprints)
│   │   └── server.js              # Server entry point (port 5000)
│   ├── tests/                     # Automated unit and API integration tests
│   └── package.json
│
├── frontend/                      # Next.js App Router + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── (candidate flow)/  # /register, /select, /consent, /test/[id], /completed
│   │   │   └── (admin portal)/    # /admin/login, /admin/dashboard, /admin/candidates, /admin/reports/[id], /admin/questions
│   │   ├── components/            # Navbar, layout, test controls
│   │   └── lib/api.ts             # Central API client
│   └── package.json
```

---

## Key Features

1. **Role & Stack Tailored Assessments**:
   - Primary launch stacks: **React** (Frontend Engineer) and **Node.js** (Backend Engineer).
   - Blueprints distribute questions across sectors: `frontend`, `backend`, `database`, `debugging`, `architecture`, and `fundamentals`.
2. **Interactive Code Runner & Telemetry**:
   - Bug-fix and algorithmic questions include starter code and test execution.
   - **Thinking Time**: Measures candidate duration before first keystroke (planning/reading phase).
   - **Active vs Idle Time**: Differentiates hands-on typing from contemplation pauses.
   - **Keystrokes & Backspaces**: Analyzes code churn, refactoring hesitation, and paste blocks.
   - **Debug Progression**: Records chronological test case passes/failures across candidate run attempts.
3. **Sector Scoring & Role-Fit Engine (Section 3.5 & 3.6 of Plan)**:
   - Evaluates Single MCQ, Multi MCQ (with partial credit), Output prediction, and Code bug-fix.
   - Sector tiers: `STRONG` ($\ge 75\%$), `MEDIUM` ($50\text{--}74\%$), `LOW` ($< 50\%$), and `INSUFFICIENT_DATA` ($< 5$ questions).
   - Verdicts: `RECOMMENDED`, `BORDERLINE`, or `NOT_RECOMMENDED`.
   - Experience levels: Senior / Independent, Mid-Level, Junior (needs mentorship).
   - Alternative role suggestions dynamically computed from all system role profiles.
4. **Proctoring & Anti-Cheating**:
   - Server-owned countdown timer with automatic submission on expiry.
   - Window blur, tab switches, and clipboard events logged to `audit_events`.
   - Answer keys and hidden test cases are never delivered to the browser.
5. **Recruiter & Admin Tools**:
   - Executive dashboard with pass rates and composite score averages.
   - Candidate list with search and status filters.
   - Visual candidate report with Recharts radar charts, sector breakdown, proctoring log, and coding telemetry.
   - Bulk JSON question importer matching the format in Section 6.2 of the plan.

---

## Quick Start Guide

### 1. Start the Backend API

```bash
cd backend
npm install
npm run seed     # Seeds roles, blueprints, admin account & question bank
npm start        # Runs Express API on http://localhost:5000
```

> **Default Admin Account**:
> - Email: `admin@skillassessment.com`
> - Password: `admin123`

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev      # Runs Next.js on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Candidate Journey**: Click "Start Candidate Assessment" or go to `/register`.
- **Recruiter Dashboard**: Click "Admin Dashboard" or go to `/admin/dashboard`.

---

## Running Automated Tests

```bash
cd backend
npm test
```
All unit tests for the scoring formula, multi-choice partial credit, sector aggregation, boundary conditions, mandatory sector failures, and API routes will execute.


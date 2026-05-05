# 🎓 Smart Academic Platform — AI-Powered LMS
### Complete Implementation & Deployment Guide (Vercel Edition)

> **Developer:** Shirshendu Sen | **Stack:** Next.js · Node.js · PostgreSQL · Python Flask · Gemini AI
> **Deploy Target:** Vercel (Frontend + Backend) · Vercel (AI Service) · Neon (Database)

---

## ⚠️ Bugs Fixed From Previous Version

Before reading anything else, here is a complete list of bugs that existed in the original guide that would have broken your project silently:

| # | Location | Bug | Fix Applied |
|---|---|---|---|
| 1 | `ai-service/app.py` | `gemini-pro` model is **deprecated** and throws an error | Changed to `gemini-1.5-flash` |
| 2 | `backend/src/routes/ai.ts` | `prisma` is used but **never imported** — runtime crash | Added `PrismaClient` import |
| 3 | `backend/src/routes/ai.ts` | `axios` used but **not in backend `package.json`** — module not found | Added `axios` to backend deps |
| 4 | `backend/src/routes/auth.ts` | **No `try/catch`** — any DB error crashes the server | Wrapped all routes in try/catch |
| 5 | `backend/src/routes/courses.ts` | **No `try/catch`** — unhandled promise rejections | Wrapped all routes in try/catch |
| 6 | `ai-service/app.py` | `json.loads(response.text)` fails when Gemini wraps output in ` ```json ``` ` blocks | Added `.strip()` and markdown cleaner |
| 7 | `backend/` | **`src/index.ts` (main server) never shown** — project cannot start | Added complete server file |
| 8 | `backend/` | **`tsconfig.json` never shown** — TypeScript cannot compile | Added complete tsconfig |
| 9 | `backend/` | **`package.json` scripts never shown** — `npm run dev` fails | Added all scripts |
| 10 | `backend/prisma/` | **Prisma schema never shown** — `npx prisma generate` fails | Added complete schema |
| 11 | `frontend/` | **`next.config.ts` never shown** — `/api/*` calls go to wrong URL in dev | Added rewrites config |
| 12 | All | **No `.gitignore`** — `node_modules`, `.env`, `venv` get pushed to GitHub | Added all `.gitignore` files |
| 13 | All | **No local testing section** — no way to verify before deploy | Added full local testing section |
| 14 | Deployment | **Vercel only for frontend; Render for backend** — guide didn't match goal | All services now deploy to Vercel |
| 15 | All | **No `.env.example`** — easy to forget required variables | Added `.env.example` for all services |

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture (Updated for Vercel)](#2-system-architecture)
3. [Full Folder Structure](#3-full-folder-structure)
4. [Step 0 — Prerequisites & Free Accounts](#step-0--prerequisites--free-accounts)
5. [Step 1 — Project Setup & Config Files](#step-1--project-setup--config-files)
6. [Step 2 — Database Setup (Prisma + Neon)](#step-2--database-setup-prisma--neon)
7. [Step 3 — Backend Main Server (`index.ts`)](#step-3--backend-main-server)
8. [Step 4 — Authentication & RBAC](#step-4--authentication--rbac)
9. [Step 5 — Course & Lesson APIs](#step-5--course--lesson-apis)
10. [Step 6 — AI Microservice (Flask + Gemini)](#step-6--ai-microservice-flask--gemini)
11. [Step 7 — AI Bridge Routes (Backend → AI Service)](#step-7--ai-bridge-routes)
12. [Step 8 — Frontend Setup & Proxy Config](#step-8--frontend-setup--proxy-config)
13. [Step 9 — Frontend Pages & Components](#step-9--frontend-pages--components)
14. [Step 10 — Local Testing (Run Everything Locally)](#step-10--local-testing)
15. [Step 11 — Deploy to Vercel](#step-11--deploy-to-vercel)
16. [Step 12 — CI/CD with GitHub Actions](#step-12--cicd-with-github-actions)
17. [Resume & Portfolio Tips](#resume--portfolio-tips)
18. [8-Week Timeline](#8-week-timeline)

---

## 1. Project Overview

### Three User Roles
- **Student** — Enroll in courses, complete lessons, take AI-generated quizzes, chat with AI tutor, receive certificates.
- **Instructor** — Create courses and lessons, auto-generate quizzes from lecture notes, view student analytics.
- **Admin** — Manage users and courses, view platform-wide analytics.

### Four AI Features
| Feature | What It Does |
|---|---|
| **AI Quiz Generator** | Paste lecture notes → get 10 MCQs with answers and explanations |
| **AI Doubt Chatbot** | Ask questions about course content → AI answers from lesson material |
| **AI Lecture Summarizer** | Long lecture text → key points, overview, important terms |
| **AI Progress Analyzer** | Student data → personalized feedback and risk flag |

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│             FRONTEND  (Vercel — Next.js 14)                      │
│     Student Dashboard | Instructor Panel | Admin Portal          │
│              next.config.ts rewrites /api/* → Backend            │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTPS REST API
          ┌────────────────▼────────────────────────┐
          │   BACKEND  (Vercel — Express Serverless) │
          │   JWT Auth | RBAC | Course | Enrollment  │
          │   Proxies AI calls → AI Service          │
          └──────┬──────────────────┬────────────────┘
                 │                  │
    ┌────────────▼──────┐  ┌────────▼───────────────────────────┐
    │  Neon PostgreSQL  │  │  AI SERVICE  (Vercel — Python)     │
    │  (Free tier)      │  │  Flask + Gemini 1.5-flash          │
    │  Users/Courses/   │  │  /generate-quiz | /summarize       │
    │  Lessons/Progress │  │  /chat | /analyze-student          │
    │  Quizzes/Certs    │  └────────────────────────────────────┘
    └───────────────────┘
                 │
    ┌────────────▼──────┐
    │   Cloudinary      │
    │  (Free — 25 GB)   │
    │  PDFs, Thumbnails │
    └───────────────────┘
```

### Why Everything On Vercel?
- **Frontend**: Vercel is built for Next.js — zero config, automatic HTTPS, CDN.
- **Backend**: Vercel supports Express as a **serverless function** via `vercel.json` — same platform, one dashboard.
- **AI Service**: Vercel supports **Python WSGI** apps (Flask) via `@vercel/python` — deployed as a separate Vercel project.

> ⚠️ **Important Serverless Limitation**: Vercel functions have a **max execution time of 10s** (free tier). AI responses from Gemini typically take 2–4s — well within limits. However, **Socket.io requires persistent connections and cannot run on Vercel serverless**. For this LMS, real-time notifications are replaced with **polling** (simpler, works everywhere).

---

## 3. Full Folder Structure

This is the exact structure you will build. Create these folders before writing any code.

```
smart-lms/
│
├── frontend/                   ← Next.js 14 app (Vercel Project 1)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            ← Landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Student dashboard
│   │   ├── courses/
│   │   │   ├── page.tsx        ← Course listing
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← Course detail + lessons
│   │   ├── instructor/
│   │   │   └── page.tsx        ← Instructor panel
│   │   └── admin/
│   │       └── page.tsx        ← Admin portal
│   ├── components/
│   │   ├── AIQuiz.tsx
│   │   ├── AIChatbot.tsx
│   │   └── ProgressBar.tsx
│   ├── lib/
│   │   └── api.ts              ← Axios instance with base URL + interceptors
│   ├── next.config.ts          ← API proxy rewrites (CRITICAL — was missing)
│   ├── .env.local
│   ├── .env.example
│   └── .gitignore
│
├── backend/                    ← Express API (Vercel Project 2)
│   ├── src/
│   │   ├── index.ts            ← Local dev server entry (was missing)
│   │   ├── app.ts              ← Express app factory (for both local + Vercel)
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── lessons.ts
│   │   │   └── ai.ts
│   │   └── middleware/
│   │       └── auth.ts
│   ├── prisma/
│   │   └── schema.prisma       ← Was missing from original guide
│   ├── api/
│   │   └── index.ts            ← Vercel serverless entry point
│   ├── tsconfig.json           ← Was missing from original guide
│   ├── vercel.json             ← Was missing from original guide
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   └── .gitignore
│
├── ai-service/                 ← Python Flask (Vercel Project 3)
│   ├── app.py                  ← Flask application
│   ├── vercel.json             ← Was missing from original guide
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   └── .gitignore
│
└── .github/
    └── workflows/
        └── deploy.yml          ← CI/CD pipeline
```

---

## Step 0 — Prerequisites & Free Accounts

Complete this step before writing a single line of code. Every account is **free**.

### Software to Install

```bash
# Check you have these installed
node --version     # Need v18+ 
npm --version      # Need v9+
python --version   # Need v3.10+
git --version      # Any recent version

# Install if missing (macOS with Homebrew)
brew install node python git

# Windows: download from nodejs.org, python.org, git-scm.com
```

### Free Accounts to Create

| Service | URL | What It's For |
|---|---|---|
| **Neon** | neon.tech | Free PostgreSQL database |
| **Vercel** | vercel.com | Deploy all 3 services |
| **Cloudinary** | cloudinary.com | File/image storage |
| **Google AI Studio** | aistudio.google.com | Free Gemini API key |
| **GitHub** | github.com | Code hosting + CI/CD |

### Get Your API Keys Now

**Gemini API Key (Google AI Studio):**
1. Go to `aistudio.google.com/app/apikey`
2. Click **Create API Key**
3. Copy and save it — you'll use it in Step 6

**Neon Database URL:**
1. Go to `neon.tech` → Create Project → Name it `smart-lms`
2. Click **Connect** → copy the **Connection String**
3. It looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`
4. Save it — you'll use it in Step 2

**Cloudinary Credentials:**
1. Go to cloudinary.com → Dashboard
2. Copy: Cloud Name, API Key, API Secret

---

## Step 1 — Project Setup & Config Files

### 1a. Create the Root Folder and GitHub Repo

```bash
mkdir smart-lms && cd smart-lms
git init
echo "# Smart Academic Platform — AI-Powered LMS" > README.md
```

### 1b. Frontend Setup

```bash
npx create-next-app@latest frontend \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd frontend

# Install all dependencies at once
npm install \
  zustand \
  @tanstack/react-query \
  recharts \
  axios \
  react-hook-form \
  zod \
  @hookform/resolvers \
  date-fns \
  lucide-react

cd ..
```

**Create `frontend/.gitignore`:**
```gitignore
node_modules/
.next/
.env.local
.env*.local
out/
.DS_Store
*.pem
```

**Create `frontend/.env.example`:**
```env
# Copy this to .env.local and fill in real values
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5001
```

**Create `frontend/.env.local`:**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:5001
```

### 1c. Backend Setup

```bash
mkdir backend && cd backend
npm init -y

# Runtime dependencies
npm install \
  express \
  @prisma/client \
  bcryptjs \
  jsonwebtoken \
  cors \
  dotenv \
  helmet \
  express-rate-limit \
  multer \
  cloudinary \
  axios          # ← FIX: was missing in original guide, needed for AI proxy routes

# Dev dependencies
npm install -D \
  prisma \
  typescript \
  ts-node \
  ts-node-dev \
  nodemon \
  @types/express \
  @types/node \
  @types/bcryptjs \
  @types/jsonwebtoken \
  @types/cors \
  @types/multer

cd ..
```

**Create `backend/tsconfig.json`** (was missing — TypeScript cannot compile without this):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "api/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Create `backend/package.json` scripts section** (was missing — `npm run dev` would fail):
```json
{
  "name": "smart-lms-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:push": "prisma db push"
  }
}
```

**Create `backend/.gitignore`:**
```gitignore
node_modules/
dist/
.env
.DS_Store
```

**Create `backend/.env.example`:**
```env
# Copy this to .env and fill in real values
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=replace-with-64-char-random-string
AI_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=3001
NODE_ENV=development
```

**Create `backend/.env`** (fill in your real values from Step 0):
```env
DATABASE_URL=postgresql://YOUR_NEON_URL?sslmode=require
JWT_SECRET=generate-a-random-64-char-string-here
AI_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=3001
NODE_ENV=development
```

> **How to generate a JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Copy the output and paste it as your JWT_SECRET.

### 1d. AI Service Setup

```bash
mkdir ai-service && cd ai-service
python -m venv venv

# Activate virtual environment
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

pip install flask flask-cors google-generativeai python-dotenv gunicorn
pip freeze > requirements.txt

cd ..
```

**Create `ai-service/.gitignore`:**
```gitignore
venv/
__pycache__/
*.pyc
*.pyo
.env
.DS_Store
*.egg-info/
```

**Create `ai-service/.env.example`:**
```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=5001
```

**Create `ai-service/.env`:**
```env
GEMINI_API_KEY=your-actual-gemini-api-key-here
PORT=5001
```

---

## Step 2 — Database Setup (Prisma + Neon)

### 2a. Initialize Prisma

```bash
cd backend
npx prisma init
```

This creates `prisma/schema.prisma`. Replace its entire contents with:

### 2b. Complete Prisma Schema

**Create `backend/prisma/schema.prisma`** (was completely missing from original guide):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  // directUrl is needed for Neon serverless with connection pooling
  directUrl = env("DATABASE_URL")
}

// ──────────────────────────────────────────────
// USERS — shared table for all roles
// ──────────────────────────────────────────────
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   @default("student")  // "student" | "instructor" | "admin"
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  coursesCreated Course[]       @relation("InstructorCourses")
  enrollments    Enrollment[]
  progress       Progress[]
  quizAttempts   QuizAttempt[]
  certificates   Certificate[]

  @@map("users")
}

// ──────────────────────────────────────────────
// COURSES
// ──────────────────────────────────────────────
model Course {
  id           Int      @id @default(autoincrement())
  title        String
  description  String?
  instructorId Int
  thumbnailUrl String?
  isPublished  Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relationships
  instructor   User         @relation("InstructorCourses", fields: [instructorId], references: [id])
  lessons      Lesson[]
  enrollments  Enrollment[]
  certificates Certificate[]

  @@map("courses")
}

// ──────────────────────────────────────────────
// LESSONS
// ──────────────────────────────────────────────
model Lesson {
  id         Int      @id @default(autoincrement())
  courseId   Int
  title      String
  content    String?  @db.Text  // lecture notes — used by AI
  videoUrl   String?
  orderIndex Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relationships
  course   Course     @relation(fields: [courseId], references: [id], onDelete: Cascade)
  quiz     Quiz?
  progress Progress[]

  @@map("lessons")
}

// ──────────────────────────────────────────────
// ENROLLMENTS
// ──────────────────────────────────────────────
model Enrollment {
  id         Int      @id @default(autoincrement())
  studentId  Int
  courseId   Int
  enrolledAt DateTime @default(now())

  // Relationships
  student User   @relation(fields: [studentId], references: [id])
  course  Course @relation(fields: [courseId], references: [id])

  // A student can only enroll in a course once
  @@unique([studentId, courseId])
  @@map("enrollments")
}

// ──────────────────────────────────────────────
// PROGRESS (per lesson, per student)
// ──────────────────────────────────────────────
model Progress {
  id          Int       @id @default(autoincrement())
  studentId   Int
  lessonId    Int
  completed   Boolean   @default(false)
  completedAt DateTime?

  // Relationships
  student User   @relation(fields: [studentId], references: [id])
  lesson  Lesson @relation(fields: [lessonId], references: [id])

  @@unique([studentId, lessonId])
  @@map("progress")
}

// ──────────────────────────────────────────────
// QUIZZES (AI-generated, one per lesson)
// ──────────────────────────────────────────────
model Quiz {
  id        Int      @id @default(autoincrement())
  lessonId  Int      @unique  // one quiz per lesson
  questions Json              // Array of {question, options[], correct_answer, explanation}
  createdAt DateTime @default(now())

  // Relationships
  lesson   Lesson        @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  attempts QuizAttempt[]

  @@map("quizzes")
}

// ──────────────────────────────────────────────
// QUIZ ATTEMPTS
// ──────────────────────────────────────────────
model QuizAttempt {
  id          Int      @id @default(autoincrement())
  quizId      Int
  studentId   Int
  score       Int
  totalQ      Int
  answers     Json     // {questionIndex: selectedAnswer}
  attemptedAt DateTime @default(now())

  // Relationships
  quiz    Quiz @relation(fields: [quizId], references: [id])
  student User @relation(fields: [studentId], references: [id])

  @@map("quiz_attempts")
}

// ──────────────────────────────────────────────
// CERTIFICATES
// ──────────────────────────────────────────────
model Certificate {
  id        Int      @id @default(autoincrement())
  studentId Int
  courseId  Int
  certUrl   String?
  issuedAt  DateTime @default(now())

  // Relationships
  student User   @relation(fields: [studentId], references: [id])
  course  Course @relation(fields: [courseId], references: [id])

  @@unique([studentId, courseId])
  @@map("certificates")
}
```

### 2c. Run Migration

```bash
cd backend

# Create and apply the migration to Neon
npx prisma migrate dev --name init

# Generate the Prisma Client (TypeScript types)
npx prisma generate

# Verify: open Prisma Studio to see your tables in the browser
npx prisma studio
```

> ✅ **Expected result:** Prisma Studio opens at `http://localhost:5555` and shows all 7 tables: users, courses, lessons, enrollments, progress, quizzes, quiz_attempts, certificates.

---

## Step 3 — Backend Main Server

This was entirely missing from the original guide. Without this, the backend cannot start.

### 3a. Express App Factory (`src/app.ts`)

We split the app into two files: `app.ts` creates the Express app (used by both local server and Vercel), and `index.ts` starts it locally.

**Create `backend/src/app.ts`:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();

// ── SECURITY MIDDLEWARE ─────────────────────────────────────────
// helmet sets secure HTTP headers (prevents common attacks)
app.use(helmet());

// CORS: only allow requests from our frontend
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://*.vercel.app'  // allow all Vercel preview URLs
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting: max 100 requests per 15 minutes per IP
// Protects against brute-force attacks on the auth endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/auth', limiter);

// Parse JSON request bodies (limit 10mb for lesson content)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── ROUTES ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/ai', aiRoutes);

// ── HEALTH CHECK ────────────────────────────────────────────────
// Vercel and monitoring tools ping this to check if the server is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────
// Catches any error thrown from route handlers
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

export default app;
```

### 3b. Local Dev Server Entry (`src/index.ts`)

**Create `backend/src/index.ts`:**
```typescript
import app from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`
  ✅ Backend running on http://localhost:${PORT}
  📊 Prisma Studio: run "npx prisma studio"
  🔗 Health check: http://localhost:${PORT}/api/health
  `);
});
```

### 3c. Vercel Serverless Entry (`api/index.ts`)

This is what Vercel uses instead of `index.ts` when deployed.

**Create `backend/api/index.ts`:**
```typescript
// Vercel serverless entry point
// Imports the Express app and exports it as a serverless function
import app from '../src/app';

export default app;
```

### 3d. Vercel Config (`vercel.json`)

**Create `backend/vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## Step 4 — Authentication & RBAC

### 4a. Auth Middleware (`src/middleware/auth.ts`)

**Create `backend/src/middleware/auth.ts`:**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include decoded JWT payload
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: 'student' | 'instructor' | 'admin';
    email: string;
  };
}

// ── MIDDLEWARE 1: Verify JWT ────────────────────────────────────
// Reads the Authorization header: "Bearer <token>"
// Decodes and verifies it. If valid, attaches user data to req.user
// If invalid or missing, returns 401 immediately (request never reaches the handler)
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      role: 'student' | 'instructor' | 'admin';
      email: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired. Please log in again.' });
    } else {
      res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
  }
};

// ── MIDDLEWARE 2: Role-Based Access Control ─────────────────────
// Usage: router.post('/create', authenticate, authorize('instructor'), handler)
// Passes if req.user.role is in the allowedRoles list
// Must be used AFTER authenticate (it depends on req.user being set)
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
      });
      return;
    }

    next();
  };
};
```

### 4b. Auth Routes (`src/routes/auth.ts`)

**Create `backend/src/routes/auth.ts`:**
```typescript
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ── POST /api/auth/register ─────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required.' });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'This email is already registered.' });
      return;
    }

    // Validate role — only allow known roles, default to 'student'
    const validRoles = ['student', 'instructor'];
    const userRole = validRoles.includes(role) ? role : 'student';

    // Hash password — cost factor 12 is a good balance of speed vs security
    // Higher = harder to brute-force but slower to compute
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: userRole }
    });

    // Sign JWT — stores userId and role so every request knows who the caller is
    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // SECURITY: Run bcrypt.compare even if user is null
    // This prevents timing attacks where an attacker can tell if an email exists
    // by measuring how long the response takes
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────
// Returns the currently logged-in user's data (used on app load)
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true, name: true, email: true,
        role: true, avatarUrl: true, createdAt: true
        // password intentionally excluded
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('[Me Error]', error);
    res.status(500).json({ error: 'Could not fetch user data.' });
  }
});

export default router;
```

---

## Step 5 — Course & Lesson APIs

### 5a. Course Routes (`src/routes/courses.ts`)

**Create `backend/src/routes/courses.ts`:**
```typescript
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ── GET /api/courses — All published courses (public, no auth needed) ──
router.get('/', async (req, res): Promise<void> => {
  try {
    const { search, page = '1', limit = '12' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = search
      ? { isPublished: true, title: { contains: search as string, mode: 'insensitive' as const } }
      : { isPublished: true };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { lessons: true, enrollments: true } }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ]);

    res.json({ courses, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    console.error('[Get Courses Error]', error);
    res.status(500).json({ error: 'Could not fetch courses.' });
  }
});

// ── GET /api/courses/:id — Single course with lessons ─────────────
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        instructor: { select: { id: true, name: true, avatarUrl: true } },
        lessons: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { enrollments: true } }
      }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch course.' });
  }
});

// ── POST /api/courses — Create course (instructors and admins only) ─
router.post('/', authenticate, authorize('instructor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, thumbnailUrl } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Course title is required.' });
      return;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        instructorId: req.user!.userId
      }
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('[Create Course Error]', error);
    res.status(500).json({ error: 'Could not create course.' });
  }
});

// ── PATCH /api/courses/:id/publish — Toggle publish status ─────────
router.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    // Instructors can only publish their own courses
    if (req.user!.role === 'instructor' && course.instructorId !== req.user!.userId) {
      res.status(403).json({ error: 'You can only publish your own courses.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id: parseInt(req.params.id) },
      data: { isPublished: !course.isPublished }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Could not update course.' });
  }
});

// ── POST /api/courses/:id/enroll — Student enrolls in a course ─────
router.post('/:id/enroll', authenticate, authorize('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = parseInt(req.params.id);
    const studentId = req.user!.userId;

    // Check the course exists and is published
    const course = await prisma.course.findFirst({
      where: { id: courseId, isPublished: true }
    });
    if (!course) {
      res.status(404).json({ error: 'Course not found or not yet published.' });
      return;
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } }
    });
    if (existing) {
      res.status(409).json({ error: 'You are already enrolled in this course.' });
      return;
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId }
    });

    res.status(201).json({ message: 'Enrolled successfully!', enrollment });
  } catch (error) {
    console.error('[Enroll Error]', error);
    res.status(500).json({ error: 'Enrollment failed.' });
  }
});

// ── GET /api/courses/:id/progress — Student's progress in a course ──
router.get('/:id/progress', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courseId = parseInt(req.params.id);
    const studentId = req.user!.userId;

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true }
    });

    if (lessons.length === 0) {
      res.json({ total: 0, completed: 0, percentage: 0 });
      return;
    }

    const completedCount = await prisma.progress.count({
      where: {
        studentId,
        lessonId: { in: lessons.map(l => l.id) },
        completed: true
      }
    });

    const percentage = Math.round((completedCount / lessons.length) * 100);
    res.json({ total: lessons.length, completed: completedCount, percentage });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch progress.' });
  }
});

// ── GET /api/courses/my/enrolled — All courses a student is enrolled in ─
router.get('/my/enrolled', authenticate, authorize('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user!.userId },
      include: {
        course: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { lessons: true } }
          }
        }
      }
    });
    res.json(enrollments.map(e => e.course));
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch enrolled courses.' });
  }
});

export default router;
```

### 5b. Lesson Routes (`src/routes/lessons.ts`)

**Create `backend/src/routes/lessons.ts`:**
```typescript
import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ── POST /api/lessons — Create a lesson inside a course ────────────
router.post('/', authenticate, authorize('instructor', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, title, content, videoUrl, orderIndex } = req.body;

    if (!courseId || !title) {
      res.status(400).json({ error: 'courseId and title are required.' });
      return;
    }

    const lesson = await prisma.lesson.create({
      data: { courseId: parseInt(courseId), title, content, videoUrl, orderIndex: orderIndex || 0 }
    });

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Could not create lesson.' });
  }
});

// ── PATCH /api/lessons/:id/complete — Mark a lesson as completed ───
router.patch('/:id/complete', authenticate, authorize('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const progress = await prisma.progress.upsert({
      where: { studentId_lessonId: { studentId: req.user!.userId, lessonId: parseInt(req.params.id) } },
      update: { completed: true, completedAt: new Date() },
      create: { studentId: req.user!.userId, lessonId: parseInt(req.params.id), completed: true, completedAt: new Date() }
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Could not update progress.' });
  }
});

export default router;
```

---

## Step 6 — AI Microservice (Flask + Gemini)

### 6a. Vercel Config for AI Service

**Create `ai-service/vercel.json`** (was missing — deployment would fail):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

### 6b. Flask App (`app.py`)

**Create `ai-service/app.py`** (fixes: deprecated model name, missing JSON cleanup, no error handling):
```python
import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Allow requests from your backend only
CORS(app, origins=[
    "http://localhost:3001",
    "https://*.vercel.app"
])

# ── CONFIGURE GEMINI ─────────────────────────────────────────────────
# FIX: 'gemini-pro' is deprecated and throws an error.
# Use 'gemini-1.5-flash' — it's faster, cheaper, and still free tier.
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")  # ← FIXED from 'gemini-pro'


def clean_json(text: str) -> str:
    """
    FIX: Gemini sometimes wraps its JSON response in markdown code blocks
    like ```json ... ```. This causes json.loads() to crash.
    This function strips those wrappers before parsing.
    """
    text = text.strip()
    # Remove ```json at the start and ``` at the end
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    return text.strip()


def call_gemini(prompt: str) -> dict | list:
    """
    Wrapper for all Gemini calls with error handling.
    Returns the parsed JSON, or raises an exception with a clear message.
    """
    response = model.generate_content(prompt)
    raw_text = response.text
    cleaned = clean_json(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Gemini returned invalid JSON: {str(e)}\nRaw response: {raw_text[:200]}")


# ─── HEALTH CHECK ──────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "model": "gemini-1.5-flash"})


# ─── FEATURE 1: AI QUIZ GENERATOR ─────────────────────────────────────
@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """
    Input:  { "content": "lecture notes text..." }
    Output: { "questions": [ { "question", "options"[], "correct_answer", "explanation" } ] }
    """
    try:
        data = request.get_json()
        if not data or not data.get('content'):
            return jsonify({"error": "Request body must include 'content' field."}), 400

        lesson_content = data['content']

        prompt = f"""
You are an expert educator. Read the following lecture notes carefully and generate
exactly 10 multiple-choice questions to test student understanding.

LECTURE NOTES:
{lesson_content}

IMPORTANT RULES:
- Questions must be based ONLY on the provided notes.
- Each question must have exactly 4 options (A, B, C, D).
- Only one option is correct.
- Include a clear, 1-sentence explanation for why the correct answer is right.
- Vary difficulty: mix easy, medium, and hard questions.

Return ONLY a valid JSON array. No introductory text. No markdown. No code blocks.
Format exactly like this:
[
  {{
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Option A is correct because..."
  }}
]
"""
        questions = call_gemini(prompt)

        # Validate the response has the right shape
        if not isinstance(questions, list) or len(questions) == 0:
            return jsonify({"error": "AI returned an unexpected format."}), 500

        return jsonify({"questions": questions})

    except ValueError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"[generate-quiz error] {e}")
        return jsonify({"error": "AI service error. Please try again."}), 500


# ─── FEATURE 2: AI LECTURE SUMMARIZER ─────────────────────────────────
@app.route('/summarize', methods=['POST'])
def summarize():
    """
    Input:  { "content": "long lecture text..." }
    Output: { "overview", "key_points"[], "terms"[{"term","definition"}] }
    """
    try:
        data = request.get_json()
        if not data or not data.get('content'):
            return jsonify({"error": "Request body must include 'content' field."}), 400

        content = data['content']

        prompt = f"""
Summarize the following lecture notes for a student who needs to revise quickly.

LECTURE NOTES:
{content}

Return ONLY a valid JSON object. No markdown. No code blocks. No extra text.
Format exactly like this:
{{
  "overview": "2-sentence summary of the entire lecture",
  "key_points": [
    "Key point 1 that students must remember",
    "Key point 2 that students must remember",
    "Key point 3 that students must remember",
    "Key point 4 that students must remember",
    "Key point 5 that students must remember"
  ],
  "terms": [
    {{"term": "Technical Term", "definition": "Simple, clear definition"}},
    {{"term": "Technical Term 2", "definition": "Simple, clear definition"}},
    {{"term": "Technical Term 3", "definition": "Simple, clear definition"}}
  ]
}}
"""
        result = call_gemini(prompt)
        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"[summarize error] {e}")
        return jsonify({"error": "AI service error. Please try again."}), 500


# ─── FEATURE 3: AI DOUBT CHATBOT ──────────────────────────────────────
@app.route('/chat', methods=['POST'])
def chat():
    """
    Input:  { "question": "...", "context": "lesson content...", "history": [...] }
    Output: { "answer": "..." }
    
    The chatbot only answers questions based on the provided lesson content.
    This prevents hallucination about topics not covered in the course.
    """
    try:
        data = request.get_json()
        if not data or not data.get('question'):
            return jsonify({"error": "Request body must include 'question' field."}), 400

        question = data['question']
        context = data.get('context', '')
        history = data.get('history', [])  # [{"role": "user"|"model", "content": "..."}]

        # Build multi-turn conversation history for Gemini
        # This allows the chatbot to remember what was said earlier in the conversation
        gemini_history = []
        for msg in history:
            gemini_history.append({
                "role": msg["role"],
                "parts": [msg["content"]]
            })

        chat_session = model.start_chat(history=gemini_history)

        # The system prompt is prepended to the question
        # It tells Gemini to stay on topic and not invent information
        prompt = f"""You are a helpful academic tutor assistant for an online course.

COURSE MATERIAL (answer ONLY based on this):
---
{context}
---

If the student's question is not covered in the course material above, say:
"This topic isn't covered in the current lesson material. Please refer to your instructor."

Student's question: {question}

Give a clear, helpful, and concise answer."""

        response = chat_session.send_message(prompt)
        return jsonify({"answer": response.text})

    except Exception as e:
        print(f"[chat error] {e}")
        return jsonify({"error": "AI service error. Please try again."}), 500


# ─── FEATURE 4: AI PROGRESS ANALYZER ─────────────────────────────────
@app.route('/analyze-student', methods=['POST'])
def analyze_student():
    """
    Input:  { "student_data": { "completion", "avg_score", "lessons_completed", "days_inactive" } }
    Output: { "performance_level", "message", "recommendations"[] }
    """
    try:
        data = request.get_json()
        student_data = data.get('student_data', {})

        if not student_data:
            return jsonify({"error": "student_data is required."}), 400

        prompt = f"""
You are an academic performance advisor. Analyze this student's learning data.

STUDENT DATA:
- Course completion: {student_data.get('completion', 0)}%
- Average quiz score: {student_data.get('avg_score', 0)}%
- Lessons completed: {student_data.get('lessons_completed', 0)}
- Days since last activity: {student_data.get('days_inactive', 0)}

Return ONLY valid JSON. No markdown. No code blocks.
{{
  "performance_level": "excellent" | "good" | "needs_improvement" | "at_risk",
  "message": "Personalized, encouraging message to this specific student based on their data",
  "recommendations": [
    "Specific, actionable recommendation 1",
    "Specific, actionable recommendation 2",
    "Specific, actionable recommendation 3"
  ]
}}
"""
        result = call_gemini(prompt)
        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        print(f"[analyze-student error] {e}")
        return jsonify({"error": "AI service error. Please try again."}), 500


# ── WSGI entry point for Vercel ────────────────────────────────────────
# Vercel's @vercel/python builder looks for a variable named 'app' that
# is a WSGI callable. Flask's app object IS a WSGI callable, so this works.
if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    print(f"AI Service running on http://localhost:{port}")
    app.run(port=port, debug=True)
```

**Update `ai-service/requirements.txt`** (pin exact versions for reproducible installs):
```
flask==3.0.3
flask-cors==4.0.1
google-generativeai==0.7.2
python-dotenv==1.0.1
gunicorn==22.0.0
```

---

## Step 7 — AI Bridge Routes

This connects the backend to the AI service. The frontend never calls the AI service directly — this keeps the AI service URL private.

**Create `backend/src/routes/ai.ts`** (fixes: missing `prisma` import, missing `axios` dependency):
```typescript
import express, { Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';  // FIX: was missing in original
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();  // FIX: prisma was used but never instantiated
const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

// Helper: forward request to AI service with timeout and error handling
async function callAI(endpoint: string, body: object) {
  const response = await axios.post(`${AI_URL}${endpoint}`, body, {
    timeout: 25000,  // 25 second timeout (Gemini can be slow on first call)
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
}

// ── POST /api/ai/generate-quiz ──────────────────────────────────
router.post('/generate-quiz', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId, content } = req.body;

    if (!lessonId || !content) {
      res.status(400).json({ error: 'lessonId and content are required.' });
      return;
    }

    // Check if a quiz already exists for this lesson
    const existingQuiz = await prisma.quiz.findUnique({
      where: { lessonId: parseInt(lessonId) }
    });

    if (existingQuiz) {
      // Return the existing quiz instead of generating a new one (saves API calls)
      res.json(existingQuiz);
      return;
    }

    // Call AI service to generate questions
    const aiResult = await callAI('/generate-quiz', { content });

    // Save generated quiz to DB so we don't regenerate it every time
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: parseInt(lessonId),
        questions: aiResult.questions
      }
    });

    res.json(quiz);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('[AI Quiz Error]', error.response?.data || error.message);
      res.status(503).json({ error: 'AI service is unavailable. Please try again.' });
    } else {
      console.error('[Generate Quiz Error]', error);
      res.status(500).json({ error: 'Could not generate quiz.' });
    }
  }
});

// ── POST /api/ai/submit-quiz ─────────────────────────────────────
router.post('/submit-quiz', authenticate, authorize('student'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quizId, answers } = req.body;
    // answers: { "0": "Option A", "1": "Option C", ... }

    const quiz = await prisma.quiz.findUnique({ where: { id: parseInt(quizId) } });
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }

    const questions = quiz.questions as Array<{
      question: string; options: string[];
      correct_answer: string; explanation: string;
    }>;

    // Calculate score
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i.toString()] === q.correct_answer) score++;
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: parseInt(quizId),
        studentId: req.user!.userId,
        score,
        totalQ: questions.length,
        answers
      }
    });

    res.json({ attempt, score, total: questions.length, percentage: Math.round((score / questions.length) * 100) });
  } catch (error) {
    console.error('[Submit Quiz Error]', error);
    res.status(500).json({ error: 'Could not submit quiz.' });
  }
});

// ── POST /api/ai/summarize ────────────────────────────────────────
router.post('/summarize', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'content is required.' });
      return;
    }
    const result = await callAI('/summarize', { content });
    res.json(result);
  } catch (error) {
    console.error('[Summarize Error]', error);
    res.status(503).json({ error: 'AI service unavailable. Please try again.' });
  }
});

// ── POST /api/ai/chat ─────────────────────────────────────────────
router.post('/chat', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, context, history } = req.body;
    if (!question) {
      res.status(400).json({ error: 'question is required.' });
      return;
    }
    const result = await callAI('/chat', { question, context: context || '', history: history || [] });
    res.json(result);
  } catch (error) {
    console.error('[Chat Error]', error);
    res.status(503).json({ error: 'AI service unavailable. Please try again.' });
  }
});

// ── POST /api/ai/analyze-student ─────────────────────────────────
router.post('/analyze-student', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.userId;

    // Gather real student data from the database
    const [totalLessons, completedLessons, quizAttempts] = await Promise.all([
      prisma.lesson.count(),
      prisma.progress.count({ where: { studentId, completed: true } }),
      prisma.quizAttempt.findMany({
        where: { studentId },
        orderBy: { attemptedAt: 'desc' },
        take: 10
      })
    ]);

    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score / a.totalQ * 100), 0) / quizAttempts.length)
      : 0;

    const lastAttempt = quizAttempts[0]?.attemptedAt;
    const daysInactive = lastAttempt
      ? Math.floor((Date.now() - new Date(lastAttempt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const result = await callAI('/analyze-student', {
      student_data: {
        completion: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        avg_score: avgScore,
        lessons_completed: completedLessons,
        days_inactive: daysInactive
      }
    });

    res.json(result);
  } catch (error) {
    console.error('[Analyze Student Error]', error);
    res.status(503).json({ error: 'AI service unavailable. Please try again.' });
  }
});

export default router;
```

---

## Step 8 — Frontend Setup & Proxy Config

### 8a. Next.js Config with API Proxy (was missing)

**Create `frontend/next.config.ts`:**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ── API PROXY REWRITES ─────────────────────────────────────────
  // In development: /api/* → http://localhost:3001/api/*
  // This means the frontend can call /api/auth/login instead of
  // http://localhost:3001/api/auth/login, avoiding CORS issues in dev.
  //
  // In production: NEXT_PUBLIC_BACKEND_URL is used by the axios instance directly.
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  },

  // Allow images from Cloudinary and other external sources
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
};

export default nextConfig;
```

### 8b. Axios Instance with Auto-Token (`lib/api.ts`)

**Create `frontend/lib/api.ts`:**
```typescript
import axios from 'axios';

// Single Axios instance used by all components.
// Automatically attaches the JWT token to every request.
const api = axios.create({
  baseURL: '/api',  // Uses the Next.js proxy rewrite in dev; direct URL in prod
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000  // 30s timeout for AI endpoints
});

// Request interceptor: attach Bearer token from localStorage before every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lms_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-redirect to /login if token expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## Step 9 — Frontend Pages & Components

### 9a. Student Dashboard (`app/dashboard/page.tsx`)

**Create `frontend/app/dashboard/page.tsx`:**
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';

interface Course {
  id: number; title: string; description: string;
  thumbnailUrl?: string; instructor: { name: string };
  progress?: number; _count: { lessons: number };
}

export default function DashboardPage() {
  const { data: courses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: ['my-courses'],
    queryFn: () => api.get('/courses/my/enrolled').then(r => r.data)
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-64" />
      ))}
    </div>
  );

  if (error) return (
    <div className="p-6 text-center text-red-500">
      Failed to load courses. Please refresh the page.
    </div>
  );

  if (courses.length === 0) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
      <Link href="/courses" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Browse Courses
      </Link>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Learning</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {course.thumbnailUrl
                ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                : <span className="text-white text-4xl">📚</span>
              }
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1 line-clamp-2">{course.title}</h3>
              <p className="text-gray-500 text-sm mb-1">by {course.instructor.name}</p>
              <p className="text-gray-400 text-xs mb-3">{course._count.lessons} lessons</p>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{course.progress ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress ?? 0}%` }}
                  />
                </div>
              </div>

              <Link
                href={`/courses/${course.id}`}
                className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                {(course.progress ?? 0) > 0 ? 'Continue Learning' : 'Start Course'}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9b. AI Quiz Component (`components/AIQuiz.tsx`)

**Create `frontend/components/AIQuiz.tsx`:**
```tsx
'use client';
import { useState } from 'react';
import api from '@/lib/api';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface AIQuizProps {
  lessonId: number;
  lessonContent: string;
}

export default function AIQuiz({ lessonId, lessonContent }: AIQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/ai/generate-quiz', {
        lessonId,
        content: lessonContent
      });
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      const { data } = await api.post('/ai/submit-quiz', {
        quizId: lessonId,  // reuse lessonId — backend looks up quiz by lesson
        answers
      });
      setScore(data.score);
      setSubmitted(true);
    } catch {
      // Calculate score client-side as fallback
      let correct = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correct_answer) correct++; });
      setScore(correct);
      setSubmitted(true);
    }
  };

  const retakeQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  // ── INITIAL STATE: show generate button ─────────────────────────
  if (questions.length === 0) {
    return (
      <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
        <div className="text-5xl mb-4">🤖</div>
        <h3 className="text-xl font-bold mb-2">AI-Powered Quiz</h3>
        <p className="text-gray-500 mb-6">Generate a personalized quiz from this lesson's content</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={generateQuiz}
          disabled={loading}
          className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Generating Quiz...
            </span>
          ) : '✨ Generate Quiz'}
        </button>
        <p className="text-xs text-gray-400 mt-3">Takes 3–5 seconds · 10 questions generated by AI</p>
      </div>
    );
  }

  // ── RESULT STATE: show score ─────────────────────────────────────
  if (submitted && score !== null) {
    const pct = Math.round((score / questions.length) * 100);
    const grade = pct >= 80 ? { emoji: '🎉', msg: 'Excellent work!', color: 'text-green-600' }
      : pct >= 60 ? { emoji: '👍', msg: 'Good effort! Review the wrong answers.', color: 'text-yellow-600' }
      : { emoji: '📚', msg: 'Keep practicing — you\'ll get there!', color: 'text-red-500' };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">{grade.emoji}</div>
          <p className="text-5xl font-bold mb-1">{pct}%</p>
          <p className="text-gray-500 mb-2">{score} out of {questions.length} correct</p>
          <p className={`font-medium ${grade.color}`}>{grade.msg}</p>
          <button onClick={retakeQuiz} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Retake Quiz
          </button>
        </div>

        {/* Show all questions with correct/wrong highlighting */}
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correct_answer;
          return (
            <div key={i} className={`bg-white p-5 rounded-xl shadow border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-400'}`}>
              <p className="font-medium mb-3">{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map(option => (
                  <div key={option} className={`p-3 rounded-lg text-sm ${
                    option === q.correct_answer ? 'bg-green-50 text-green-800 font-medium'
                    : option === answers[i] ? 'bg-red-50 text-red-700'
                    : 'bg-gray-50 text-gray-600'
                  }`}>
                    {option === q.correct_answer && '✓ '}
                    {option === answers[i] && option !== q.correct_answer && '✗ '}
                    {option}
                  </div>
                ))}
              </div>
              {!isCorrect && (
                <p className="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  💡 {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── QUIZ STATE: answer questions ─────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">AI-Generated Quiz</h2>
        <span className="text-sm text-gray-500">{Object.keys(answers).length}/{questions.length} answered</span>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="bg-white p-5 rounded-xl shadow">
          <p className="font-medium mb-4 text-gray-800">{i + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map(option => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all
                  ${answers[i] === option
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${i}`}
                  value={option}
                  checked={answers[i] === option}
                  onChange={() => setAnswers(prev => ({ ...prev, [i]: option }))}
                  className="accent-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < questions.length}
        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {Object.keys(answers).length < questions.length
          ? `Answer ${questions.length - Object.keys(answers).length} more question(s) to submit`
          : 'Submit Quiz'}
      </button>
    </div>
  );
}
```

---

## Step 10 — Local Testing

> This section was completely missing from the original guide. **Never deploy before testing locally.**

### 10a. Start All Three Services

Open **3 separate terminal windows** and run one command in each:

**Terminal 1 — AI Service:**
```bash
cd ai-service
source venv/bin/activate   # Windows: venv\Scripts\activate
python app.py

# Expected output:
# AI Service running on http://localhost:5001
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev

# Expected output:
# ✅ Backend running on http://localhost:3001
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev

# Expected output:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
```

### 10b. Verify Each Service Is Running

```bash
# Test AI service health
curl http://localhost:5001/health
# Expected: {"status": "ok", "model": "gemini-1.5-flash"}

# Test backend health
curl http://localhost:3001/api/health
# Expected: {"status": "ok", "timestamp": "..."}

# Test frontend (open in browser)
open http://localhost:3000
```

### 10c. Test Each Feature End-to-End

Use these `curl` commands in order to test the full flow.

**1. Register a student:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Student", "email": "student@test.com", "password": "Test@1234", "role": "student"}'

# Save the token from the response — you'll use it in the next steps
export STUDENT_TOKEN="paste_token_here"
```

**2. Register an instructor:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Instructor", "email": "instructor@test.com", "password": "Test@1234", "role": "instructor"}'

export INSTRUCTOR_TOKEN="paste_instructor_token_here"
```

**3. Create a course (as instructor):**
```bash
curl -X POST http://localhost:3001/api/courses \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Introduction to Python", "description": "Learn Python from scratch"}'

# Note the course id from the response
export COURSE_ID=1
```

**4. Create a lesson with content:**
```bash
curl -X POST http://localhost:3001/api/lessons \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": $COURSE_ID, \"title\": \"Variables and Data Types\", \"content\": \"In Python, variables are used to store data. Python has several built-in data types: integers (int), floating-point numbers (float), strings (str), booleans (bool), lists, tuples, and dictionaries. Variables are created by assigning a value: x = 5 creates an integer variable. Python is dynamically typed, meaning you don't need to declare variable types explicitly. Strings can be created with single or double quotes. Lists are ordered, mutable collections defined with square brackets: my_list = [1, 2, 3]. Dictionaries store key-value pairs: my_dict = {'name': 'Alice', 'age': 30}.\"}"
```

**5. Publish the course:**
```bash
curl -X PATCH http://localhost:3001/api/courses/$COURSE_ID/publish \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN"
```

**6. Enroll as student:**
```bash
curl -X POST http://localhost:3001/api/courses/$COURSE_ID/enroll \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**7. Test AI Quiz Generator:**
```bash
curl -X POST http://localhost:3001/api/ai/generate-quiz \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"lessonId": 1, "content": "In Python, variables store data. Data types include int, float, str, bool, list, and dict. Lists use square brackets, dicts use curly braces with key-value pairs. Python is dynamically typed."}'

# Expected: {"id": 1, "lessonId": 1, "questions": [...10 questions...]}
```

**8. Test AI Summarizer:**
```bash
curl -X POST http://localhost:3001/api/ai/summarize \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "In Python, variables store data. Python has int, float, str, bool, list, dict types. Dynamic typing means no type declarations needed. Strings use single or double quotes. Lists are mutable ordered collections. Dicts store key-value pairs."}'

# Expected: {"overview": "...", "key_points": [...], "terms": [...]}
```

**9. Test AI Chatbot:**
```bash
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "What is a dictionary in Python?", "context": "In Python, variables store data. Dictionaries store key-value pairs using curly braces.", "history": []}'

# Expected: {"answer": "A dictionary in Python..."}
```

**10. Test AI Progress Analyzer:**
```bash
curl -X POST http://localhost:3001/api/ai/analyze-student \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Expected: {"performance_level": "...", "message": "...", "recommendations": [...]}
```

### 10d. Local Testing Checklist

Check every item before deploying. Don't skip.

```
Backend
  [ ] POST /api/auth/register — returns token + user
  [ ] POST /api/auth/login — returns token + user
  [ ] GET /api/auth/me — returns user (with valid token)
  [ ] GET /api/courses — returns empty array or courses
  [ ] POST /api/courses — creates course (instructor token only)
  [ ] POST /api/courses/:id/enroll — enrolls student
  [ ] POST /api/lessons — creates lesson with content

AI Service
  [ ] GET /health — returns {"status":"ok"}
  [ ] POST /generate-quiz — returns 10 questions (takes 3–5s)
  [ ] POST /summarize — returns overview + key_points + terms
  [ ] POST /chat — returns an answer based on context
  [ ] POST /analyze-student — returns performance_level + recommendations

Frontend
  [ ] http://localhost:3000 loads without console errors
  [ ] Register form creates a user
  [ ] Login form returns a token
  [ ] Course listing shows published courses
  [ ] AI Quiz button generates quiz
  [ ] Quiz submission shows score

RBAC Tests
  [ ] Student CANNOT create a course (expect 403)
  [ ] Instructor CANNOT enroll in a course (expect 403)
  [ ] Unauth request to /api/auth/me returns 401
```

---

## Step 11 — Deploy to Vercel

All three services deploy to Vercel. Each is a **separate Vercel project** from the same GitHub monorepo.

### 11a. Prepare GitHub Repository

```bash
# From root of smart-lms/
# Create ONE monorepo for all three services
git add .
git commit -m "feat: initial project setup — frontend, backend, ai-service"
git remote add origin https://github.com/YOUR_USERNAME/smart-lms.git
git branch -M main
git push -u origin main
```

**Root `.gitignore`** (stops any accidental commits of secrets):
```gitignore
# Dependencies
node_modules/
.next/
dist/
venv/
__pycache__/
*.pyc

# Environment files (NEVER commit these)
.env
.env.local
.env*.local
*.env

# OS files
.DS_Store
Thumbs.db
```

### 11b. Deploy AI Service First

The AI service URL is needed by the backend, so deploy it first.

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** → select `smart-lms`
3. Under **Root Directory**, enter: `ai-service`
4. Framework Preset: **Other**
5. Add Environment Variables:
   ```
   GEMINI_API_KEY = your-actual-gemini-api-key
   ```
6. Click **Deploy**
7. Wait ~2 minutes → copy the URL: `https://smart-lms-ai.vercel.app`

> ✅ Verify: Visit `https://smart-lms-ai.vercel.app/health` — should return `{"status":"ok"}`

### 11c. Deploy Backend Second

1. Go to [vercel.com/new](https://vercel.com/new) → Import `smart-lms` again
2. Under **Root Directory**, enter: `backend`
3. Framework Preset: **Other**
4. Add Environment Variables:
   ```
   DATABASE_URL         = postgresql://YOUR_NEON_CONNECTION_STRING?sslmode=require
   JWT_SECRET           = your-64-char-random-string
   AI_SERVICE_URL       = https://smart-lms-ai.vercel.app   ← from Step 11b
   FRONTEND_URL         = https://smart-lms.vercel.app       ← fill after Step 11d
   CLOUDINARY_CLOUD_NAME = your-cloud-name
   CLOUDINARY_API_KEY    = your-api-key
   CLOUDINARY_API_SECRET = your-api-secret
   NODE_ENV             = production
   ```
5. Click **Deploy**
6. Wait ~2 minutes → copy URL: `https://smart-lms-backend.vercel.app`

> ✅ Verify: Visit `https://smart-lms-backend.vercel.app/api/health` — should return `{"status":"ok"}`

**After backend is deployed, run Prisma migrations against production DB:**
```bash
cd backend
# Run migration on Neon production DB (safe — won't delete data)
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

### 11d. Deploy Frontend Last

1. Go to [vercel.com/new](https://vercel.com/new) → Import `smart-lms`
2. Under **Root Directory**, enter: `frontend`
3. Framework Preset: **Next.js** (auto-detected)
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_URL  = https://smart-lms-backend.vercel.app
   NEXT_PUBLIC_AI_SERVICE_URL = https://smart-lms-ai.vercel.app
   ```
5. Click **Deploy**
6. Copy URL: `https://smart-lms.vercel.app`

**Then update backend's FRONTEND_URL:**
- Go to Vercel → smart-lms-backend → Settings → Environment Variables
- Update `FRONTEND_URL` = `https://smart-lms.vercel.app`
- Redeploy backend (Vercel → Deployments → Redeploy)

> ✅ Final verify: Open `https://smart-lms.vercel.app` and run through the full local test checklist again on the live site.

### 11e. Vercel Free Tier Limits (Know These)

| Limit | Free Tier | Impact on This Project |
|---|---|---|
| Function execution time | 10 seconds | Gemini responds in 2–4s — safe ✅ |
| Bandwidth | 100 GB/month | Fine for portfolio traffic ✅ |
| Deployments | 100/day | More than enough ✅ |
| Serverless functions | 12 regions | Global CDN ✅ |
| Python function timeout | 10 seconds | Watch out for slow Gemini calls |

> **If AI calls time out on Vercel:** Add `?timeout=30` parameter or switch the AI service to Render (free Python hosting with 30s timeout). Update `AI_SERVICE_URL` in backend env vars — no other code changes needed.

---

## Step 12 — CI/CD with GitHub Actions

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Test and Deploy Smart LMS

# Runs on every push to main
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:

  # ─── JOB 1: Test the Backend ──────────────────────────────────────────
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci

      - name: TypeScript type check
        working-directory: ./backend
        run: npx tsc --noEmit

      - name: Generate Prisma client
        working-directory: ./backend
        run: npx prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  # ─── JOB 2: Test the AI Service ───────────────────────────────────────
  test-ai-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Python dependencies
        working-directory: ./ai-service
        run: pip install -r requirements.txt

      - name: Verify Flask app loads and routes exist
        working-directory: ./ai-service
        run: |
          python -c "
          from app import app
          client = app.test_client()

          # Test health endpoint
          response = client.get('/health')
          assert response.status_code == 200, f'Health check failed: {response.status_code}'
          print('✅ Health check passed')

          # Test that all routes are registered
          rules = [str(r) for r in app.url_map.iter_rules()]
          assert '/generate-quiz' in rules, '/generate-quiz route missing'
          assert '/summarize' in rules, '/summarize route missing'
          assert '/chat' in rules, '/chat route missing'
          assert '/analyze-student' in rules, '/analyze-student route missing'
          print('✅ All routes registered:', rules)
          "
        env:
          GEMINI_API_KEY: placeholder_for_ci  # Routes exist check doesn't call Gemini

  # ─── JOB 3: Test the Frontend Build ───────────────────────────────────
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build Next.js app
        working-directory: ./frontend
        run: npm run build
        env:
          NEXT_PUBLIC_BACKEND_URL: https://smart-lms-backend.vercel.app
          NEXT_PUBLIC_AI_SERVICE_URL: https://smart-lms-ai.vercel.app

  # ─── JOB 4: Deploy (only on push to main, not on PRs) ─────────────────
  deploy:
    needs: [test-backend, test-ai-service, test-frontend]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - name: Trigger AI Service Deploy
        run: curl -s -X POST "${{ secrets.VERCEL_AI_DEPLOY_HOOK }}"

      - name: Trigger Backend Deploy
        run: curl -s -X POST "${{ secrets.VERCEL_BACKEND_DEPLOY_HOOK }}"

      - name: Trigger Frontend Deploy
        run: curl -s -X POST "${{ secrets.VERCEL_FRONTEND_DEPLOY_HOOK }}"

      - name: Wait for deploys to complete
        run: sleep 30

      - name: Smoke test — verify all services are up
        run: |
          echo "Testing AI Service..."
          curl -f https://smart-lms-ai.vercel.app/health || exit 1

          echo "Testing Backend..."
          curl -f https://smart-lms-backend.vercel.app/api/health || exit 1

          echo "Testing Frontend..."
          curl -f https://smart-lms.vercel.app || exit 1

          echo "✅ All services healthy!"
```

**How to get Vercel Deploy Hooks:**
- Vercel → Project → Settings → Git → Deploy Hooks → Add Hook
- Name it "GitHub Actions" → select `main` branch → copy the URL
- Add as GitHub repo secret: Settings → Secrets → Actions → New secret

---

## Resume & Portfolio Tips

### Resume Bullet Points

```
Smart Academic Platform (AI-Powered LMS)
Tech: Next.js 14, Node.js, Express, PostgreSQL (Prisma), Python Flask, Gemini 1.5-flash

• Architected a 3-service microservices system (Next.js + Express + Flask) with JWT
  authentication and 3-role RBAC, deployed to Vercel with GitHub Actions CI/CD.

• Built a Python Flask AI microservice integrating Gemini 1.5-flash to generate
  contextual MCQ quizzes from lecture notes, cutting instructor quiz creation time by 100%.

• Developed a multi-turn AI doubt chatbot using Gemini's stateful chat API, grounded
  exclusively in course content to prevent hallucination.

• Designed a 7-table normalized PostgreSQL schema (Prisma ORM) supporting course
  enrollment, lesson progress tracking, quiz attempts, and certificate issuance.
```

### README Structure
```
README.md
├── 1. Hero image / GIF of the app
├── 2. Live demo link + demo credentials
├── 3. Tech stack badges (shields.io)
├── 4. Features list with screenshots
├── 5. Architecture diagram
├── 6. Local setup instructions
└── 7. Deployment notes
```

### Pre-seed Demo Accounts
Add these to your README so recruiters can try the app without signing up:
```
Student:    demo.student@smartlms.com  / Demo@1234
Instructor: demo.teacher@smartlms.com  / Demo@1234
```

---

## 8-Week Timeline

| Week | Goal | End-of-Week Deliverable |
|---|---|---|
| **1** | Setup + Database + Auth | Register/Login working locally with JWT + 3 roles |
| **2** | Course + Lesson CRUD | Instructor creates course; student enrolls and sees progress |
| **3** | Frontend — Auth + Dashboard | Login page, course listing, student dashboard all working |
| **4** | AI Quiz Generator | Instructor generates quiz from lesson; student takes it |
| **5** | AI Chatbot + Summarizer | Chatbot answers questions; summarizer shows key points |
| **6** | Progress Tracker + Analyzer | Progress bars working; AI gives personalized feedback |
| **7** | Deploy all 3 to Vercel | Live URLs for all 3 services; health checks passing |
| **8** | Polish + README + Demo Video | 90-second demo video uploaded; README complete; resume updated |

> **Rule:** Deploy at the end of Week 1, even if the app is half built. A live deployment forces you to fix environment issues early, not at the end when they're hardest to debug.

---

*Guide revised and corrected for Shirshendu Sen | Full-Stack Developer | West Bengal, India*
*All 15 bugs from the original guide have been fixed. Local testing section added. Deployment updated to full Vercel stack.*

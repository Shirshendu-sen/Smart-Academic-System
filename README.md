# 🎓 Smart Academic Platform - AI-Powered LMS

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.9+-yellow.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)
![Prisma](https://img.shields.io/badge/Prisma-ORM-purple.svg)

**A Modern, AI-Enhanced Learning Management System Built with Microservices Architecture**

[Live Demo](#) • [Documentation](#documentation) • [API Reference](#api-documentation) • [Deployment Guide](#-deployment)

</div>

## ✨ Overview

The **Smart Academic Platform** is a cutting-edge Learning Management System that combines traditional LMS features with AI-powered tools to create an immersive, personalized learning experience. Built with a microservices architecture, this platform scales effortlessly while providing robust features for students, instructors, and administrators.

### 🎯 **Why This Project Stands Out**

| Feature | Traditional LMS | Smart Academic Platform |
|---------|----------------|-------------------------|
| **AI Integration** | Limited or none | Four AI-powered features (Quiz, Summarizer, Chatbot, Insights) |
| **Architecture** | Monolithic | Microservices (Frontend + Backend + AI Service) |
| **Real-time Progress** | Basic tracking | AI-driven personalized insights |
| **Deployment** | Complex | One-click deployment to Render & Vercel |
| **Database** | Basic SQL | PostgreSQL with Prisma ORM & migrations |

## 🚀 **Live Demo & Quick Links**

- **Frontend Demo**: [Coming Soon](#)
- **API Documentation**: [Swagger UI](#)
- **GitHub Repository**: [https://github.com/Shirshendu-sen/Smart-Academic-System](https://github.com/Shirshendu-sen/Smart-Academic-System)
- **Project Board**: [Kanban Board](#)

## 🏆 **Key Features**

### 🎓 **Core LMS Features**
- **🔐 Multi-role Authentication** - JWT-based auth for Students, Instructors, and Admins
- **📚 Course Management** - Create, organize, and deliver structured courses
- **📖 Lesson System** - Rich content with videos, text, quizzes, and assignments
- **📊 Progress Tracking** - Real-time progress visualization and analytics
- **👥 Enrollment System** - Seamless course enrollment with payment integration
- **🏆 Certificate Generation** - Automated certificate issuance upon course completion

### 🤖 **AI-Powered Features**
- **🧠 AI Quiz Generator** - Automatically generates quizzes from lesson content using Google Gemini
- **📝 AI Summarizer** - Creates concise summaries of lengthy lessons for quick review
- **💬 AI Doubt Chatbot** - 24/7 interactive chatbot for instant student support
- **📈 AI Progress Insights** - Personalized learning recommendations and performance analytics

### 🛠️ **Developer Features**
- **📁 Microservices Architecture** - Independent scaling of frontend, backend, and AI services
- **🔒 Type Safety** - Full TypeScript implementation with Zod validation
- **🗄️ Database Migrations** - Prisma ORM with automatic schema migrations
- **🧪 Comprehensive Testing** - API test suites with HTTP test files
- **🚀 CI/CD Ready** - GitHub Actions workflow for automated deployment

## 🏗️ **System Architecture**

```mermaid
graph TB
    A[User Browser] --> B[Next.js 14 Frontend]
    B --> C[Express.js Backend API]
    B --> D[Python Flask AI Service]
    C --> E[(PostgreSQL Database)]
    D --> F[Google Gemini API]
    
    subgraph "Microservices"
        B
        D
    end
    
    subgraph "External Services"
        E
        F
    end
```

### **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI | Modern, responsive user interface |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM | REST API with business logic |
| **AI Service** | Python, Flask, Google Gemini API | AI-powered features and processing |
| **Database** | PostgreSQL (Neon.tech) | Relational data storage |
| **Authentication** | JWT with role-based access control | Secure user management |
| **Validation** | Zod schema validation | Type-safe data validation |
| **Deployment** | Vercel (Frontend), Render (Backend/AI) | Scalable cloud hosting |

## 📊 **Database Schema**

The system uses 8 optimized tables with proper relationships:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(STUDENT)
  courses   Course[] // Courses created by instructor
  enrollments Enrollment[]
  progress  Progress[]
}

model Course {
  id          String   @id @default(cuid())
  title       String
  description String
  instructor  User     @relation(fields: [instructorId], references: [id])
  lessons     Lesson[]
  enrollments Enrollment[]
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  content     String
  course      Course   @relation(fields: [courseId], references: [id])
  order       Int
  progress    Progress[]
}

model Enrollment {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  course    Course   @relation(fields: [courseId], references: [id])
  enrolledAt DateTime @default(now())
  progress  Progress[]
}

model Progress {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  lesson    Lesson   @relation(fields: [lessonId], references: [id])
  completed Boolean  @default(false)
  completedAt DateTime?
}
```

## 🛠️ **Quick Start Guide**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database (or [Neon.tech](https://neon.tech) account)
- Google Gemini API key ([Get it here](https://makersuite.google.com/app/apikey))

### **1. Clone & Setup**
```bash
# Clone the repository
git clone https://github.com/Shirshendu-sen/Smart-Academic-System.git
cd smart-lms

# Install all dependencies
./setup.sh  # Or follow manual setup below
```

### **2. Backend Setup**
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

### **3. Frontend Setup**
```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### **4. AI Service Setup**
```bash
cd ai-service
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Gemini API key

# Start Flask server
python app.py
```

## 📚 **API Documentation**

### **Authentication Endpoints**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login user | No |
| `GET` | `/api/auth/me` | Get current user profile | Yes |

### **Course Management**
| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/courses` | Get all courses | Any |
| `GET` | `/api/courses/:id` | Get specific course | Any |
| `POST` | `/api/courses` | Create new course | Instructor/Admin |
| `PUT` | `/api/courses/:id` | Update course | Instructor/Admin |
| `DELETE` | `/api/courses/:id` | Delete course | Instructor/Admin |

### **AI Service Endpoints**
| Method | Endpoint | Description | Input |
|--------|----------|-------------|-------|
| `POST` | `/ai/quiz/generate` | Generate quiz from content | `{ "content": "lesson text", "difficulty": "medium" }` |
| `POST` | `/ai/summarize` | Summarize lesson content | `{ "content": "long text", "length": "short" }` |
| `POST` | `/ai/chat` | Chat with AI doubt solver | `{ "question": "student question", "context": "lesson context" }` |
| `POST` | `/ai/insights` | Get learning insights | `{ "userId": "user-id", "courseId": "course-id" }` |

## 🧪 **Testing & Quality Assurance**

### **Run Tests**
```bash
# Test database connection
cd backend
npx tsx scripts/test-db.ts

# Test authentication APIs
# Use the provided HTTP test files:
# - backend/scripts/test-auth.http
# - backend/scripts/test-courses.http
```

### **API Testing with VS Code REST Client**
The project includes ready-to-use `.http` files for testing all endpoints. Simply install the "REST Client" extension in VS Code and run the requests directly.

## 🚀 **Deployment Guide**

### **1. Database Deployment (Neon.tech)**
1. Create a free account at [Neon.tech](https://neon.tech)
2. Create a new PostgreSQL project
3. Copy the connection string to `backend/.env`
4. Run migrations: `npx prisma db push`

### **2. Backend Deployment (Render)**
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `npm start`
5. Add environment variables from `backend/.env`

### **3. Frontend Deployment (Vercel)**
1. Import your GitHub repository to [Vercel](https://vercel.com)
2. Framework: **Next.js**
3. Build Command: `npm run build`
4. Add environment variables from `frontend/.env.local`

### **4. AI Service Deployment (Render)**
1. Create a new **Web Service** on Render
2. Runtime: **Python 3.9**
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `python app.py`
5. Add environment variables from `ai-service/.env`

## 📁 **Project Structure**

```
smart-lms/
├── frontend/                 # Next.js 14 Application
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities and hooks
│   └── public/              # Static assets
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication & validation
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema & migrations
│   └── scripts/            # Test scripts
└── ai-service/             # Python Flask AI Service
    ├── app.py              # Flask application
    ├── requirements.txt    # Python dependencies
    └── services/           # AI service implementations
```

## 🔐 **Environment Variables**

### **Backend (`backend/.env`)**
```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
PORT=5000
NODE_ENV="production"
CORS_ORIGIN="https://your-frontend.vercel.app"
```

### **Frontend (`frontend/.env.local`)**
```env
NEXT_PUBLIC_API_URL="https://your-backend.onrender.com"
NEXT_PUBLIC_AI_SERVICE_URL="https://your-ai-service.onrender.com"
```

### **AI Service (`ai-service/.env`)**
```env
GEMINI_API_KEY="your-google-gemini-api-key"
FLASK_PORT=5001
BACKEND_URL="https://your-backend.onrender.com"
```

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation accordingly
- Use meaningful commit messages

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Google Gemini API** for powerful AI capabilities
- **Next.js Team** for the amazing React framework
- **Prisma Team** for the excellent ORM experience
- **Render & Vercel** for free tier hosting
- **The Open Source Community** for countless libraries and tools

## 📞 **Support & Contact**

- **GitHub Issues**: [Report bugs or request features](https://github.com/Shirshendu-sen/Smart-Academic-System/issues)
- **Email**: [Your Email Here]
- **LinkedIn**: [Your LinkedIn Profile]

## 🌟 **Show Your Support**

If you find this project useful, please give it a ⭐️ on GitHub!

---

<div align="center">

**Built with ❤️ for the future of education**

*"Empowering learners with AI-driven personalized education"*

</div>
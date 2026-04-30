# 🚀 Smart Academic Platform - Deployment Guide

## 📋 **Deployment Overview**

This guide provides step-by-step instructions to deploy all three services of the Smart Academic Platform LMS:

1. **Database**: PostgreSQL on Neon.tech (Free Tier)
2. **Backend API**: Node.js/Express on Render (Free Tier)
3. **AI Service**: Python/Flask on Render (Free Tier)
4. **Frontend**: Next.js on Vercel (Free Tier)

## 🗓️ **Deployment Timeline**

| Step | Service | Platform | Estimated Time |
|------|---------|----------|----------------|
| 1 | Database | Neon.tech | 10 minutes |
| 2 | Backend API | Render | 15 minutes |
| 3 | AI Service | Render | 10 minutes |
| 4 | Frontend | Vercel | 10 minutes |
| 5 | Configuration | Environment Variables | 5 minutes |
| **Total** | **All Services** | **Multiple** | **~50 minutes** |

---

## 🗄️ **Step 1: Deploy Database (Neon.tech)**

### **1.1 Create Neon.tech Account**
1. Go to [Neon.tech](https://neon.tech)
2. Sign up with GitHub or email
3. Verify your email address

### **1.2 Create PostgreSQL Database**
1. Click **"New Project"**
2. Name your project: `smart-academic-db`
3. Select region closest to your users (e.g., `Asia Pacific (Mumbai)`)
4. Click **"Create Project"**

### **1.3 Get Connection String**
1. In your project dashboard, go to **"Connection Details"**
2. Copy the **"Connection string"** (starts with `postgresql://`)
3. Save it securely - you'll need it for backend deployment

### **1.4 Database Configuration**
Your connection string will look like:
```
postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-xxxx-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

**Important**: Keep this connection string secure. Never commit it to GitHub.

---

## ⚙️ **Step 2: Deploy Backend API (Render)**

### **2.1 Prepare Backend for Deployment**
1. **Update `backend/package.json`** - Ensure these scripts exist:
```json
"scripts": {
  "start": "node dist/index.js",
  "build": "tsc && npx prisma generate",
  "dev": "tsx watch src/index.ts"
}
```

2. **Create `backend/Dockerfile`** (optional but recommended):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

### **2.2 Deploy to Render**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `Smart-Academic-System`

### **2.3 Configure Backend Service**
| Setting | Value |
|---------|-------|
| **Name** | `smart-academic-backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

### **2.4 Add Environment Variables**
Add these environment variables in Render dashboard:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon.tech connection string |
| `JWT_SECRET` | A strong secret key (min 32 chars) |
| `PORT` | `10000` (Render assigns port automatically) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` (update after frontend deploy) |

### **2.5 Deploy & Get Backend URL**
1. Click **"Create Web Service"**
2. Wait for deployment to complete (5-10 minutes)
3. Copy your backend URL (e.g., `https://smart-academic-backend.onrender.com`)

---

## 🤖 **Step 3: Deploy AI Service (Render)**

### **3.1 Prepare AI Service for Deployment**
1. **Update `ai-service/requirements.txt`** - Ensure it includes:
```
flask==2.3.3
flask-cors==4.0.0
google-generativeai==0.3.2
python-dotenv==1.0.0
gunicorn==21.2.0
```

2. **Create `ai-service/Dockerfile`**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 5001

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app"]
```

### **3.2 Deploy to Render**
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository
3. Select the `ai-service` directory

### **3.3 Configure AI Service**
| Setting | Value |
|---------|-------|
| **Name** | `smart-academic-ai` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT app:app` |
| **Plan** | `Free` |

### **3.4 Add Environment Variables**
| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `PORT` | `10000` |
| `BACKEND_URL` | Your backend URL from Step 2 |
| `FLASK_ENV` | `production` |

### **3.5 Deploy & Get AI Service URL**
1. Click **"Create Web Service"**
2. Wait for deployment
3. Copy your AI service URL (e.g., `https://smart-academic-ai.onrender.com`)

---

## 🎨 **Step 4: Deploy Frontend (Vercel)**

### **4.1 Prepare Frontend for Deployment**
1. **Update `frontend/.env.local`** with production values:
```env
NEXT_PUBLIC_API_URL=https://smart-academic-backend.onrender.com
NEXT_PUBLIC_AI_SERVICE_URL=https://smart-academic-ai.onrender.com
```

2. **Update `frontend/next.config.js`**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-host.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_AI_SERVICE_URL: process.env.NEXT_PUBLIC_AI_SERVICE_URL,
  },
}

module.exports = nextConfig
```

### **4.2 Deploy to Vercel**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Authorize Vercel to access your repository

### **4.3 Configure Frontend Project**
| Setting | Value |
|---------|-------|
| **Framework Preset** | `Next.js` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |

### **4.4 Add Environment Variables**
In Vercel project settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your backend URL |
| `NEXT_PUBLIC_AI_SERVICE_URL` | Your AI service URL |

### **4.5 Deploy & Get Frontend URL**
1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Copy your frontend URL (e.g., `https://smart-academic-platform.vercel.app`)

---

## 🔗 **Step 5: Update Service URLs**

### **5.1 Update Backend CORS**
1. Go back to Render backend service
2. Update `CORS_ORIGIN` environment variable:
   - Value: `https://smart-academic-platform.vercel.app`
3. Redeploy backend

### **5.2 Update Frontend Environment**
1. In Vercel, update environment variables if needed
2. Redeploy frontend

### **5.3 Update AI Service Backend URL**
1. In Render AI service, update `BACKEND_URL`
2. Redeploy AI service

---

## 🧪 **Step 6: Test Deployment**

### **6.1 Test Backend API**
```bash
# Test health endpoint
curl https://smart-academic-backend.onrender.com/health

# Expected response: {"status":"ok","timestamp":"..."}
```

### **6.2 Test AI Service**
```bash
# Test AI service health
curl https://smart-academic-ai.onrender.com/health

# Expected response: {"status":"AI Service is running"}
```

### **6.3 Test Frontend**
1. Open your frontend URL in browser
2. Verify the homepage loads
3. Test authentication flow

### **6.4 Test Database Connection**
Use the test script:
```bash
cd backend
DATABASE_URL="your-neon-connection-string" npx tsx scripts/test-db.ts
```

---

## 🔧 **Step 7: Post-Deployment Configuration**

### **7.1 Run Database Migrations**
```bash
# Connect to your deployed backend
cd backend

# Set DATABASE_URL environment variable
export DATABASE_URL="your-neon-connection-string"

# Run migrations
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### **7.2 Create Admin User**
Use the API to create an admin user:
```bash
curl -X POST https://smart-academic-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "name": "Admin User",
    "role": "admin"
  }'
```

### **7.3 Set Up SSL/HTTPS**
All services automatically have SSL:
- Render: HTTPS enabled by default
- Vercel: HTTPS enabled by default
- Neon.tech: SSL required in connection string

---

## 📊 **Step 8: Monitoring & Maintenance**

### **8.1 Monitor Services**
- **Render Dashboard**: Monitor backend and AI service logs
- **Vercel Analytics**: Track frontend performance
- **Neon.tech Metrics**: Monitor database performance

### **8.2 Set Up Alerts**
1. **Render Alerts**: Set up email alerts for service downtime
2. **Vercel Alerts**: Configure deployment notifications
3. **Neon.tech Alerts**: Set up database monitoring

### **8.3 Backup Strategy**
1. **Database Backups**: Neon.tech provides automatic backups
2. **Code Backups**: GitHub repository is your primary backup
3. **Environment Variables**: Store securely in password manager

---

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: Database Connection Failed**
**Symptoms**: Backend fails to start with database error
**Solution**:
1. Verify DATABASE_URL is correct
2. Check if Neon.tech database is running
3. Ensure SSL is enabled (`?sslmode=require`)

### **Issue 2: CORS Errors**
**Symptoms**: Frontend can't call backend API
**Solution**:
1. Update backend `CORS_ORIGIN` with frontend URL
2. Redeploy backend
3. Clear browser cache

### **Issue 3: AI Service Timeout**
**Symptoms**: AI requests timeout on free tier
**Solution**:
1. Render free tier has cold starts (up to 50 seconds)
2. Consider upgrading to paid tier for production
3. Implement client-side timeout handling

### **Issue 4: Memory Limits**
**Symptoms**: Services crash with memory errors
**Solution**:
1. Render free tier: 512MB RAM
2. Optimize memory usage
3. Consider paid tier for production

---

## 📈 **Step 9: Scaling for Production**

### **9.1 Upgrade Plans**
| Service | Free Tier Limits | Recommended Production Plan |
|---------|------------------|-----------------------------|
| **Backend** | 512MB RAM, 100 hours/month | Render Starter ($7/month) |
| **AI Service** | 512MB RAM, 100 hours/month | Render Starter ($7/month) |
| **Database** | 0.5GB storage, 10k rows | Neon Pro ($10/month) |
| **Frontend** | Unlimited, 100GB bandwidth | Vercel Pro ($20/month) |

### **9.2 Performance Optimization**
1. **Enable Caching**: Vercel edge caching for frontend
2. **Database Indexing**: Add indexes for frequent queries
3. **CDN**: Use Vercel's global CDN
4. **Image Optimization**: Next.js Image component

### **9.3 Security Hardening**
1. **Rate Limiting**: Implement API rate limits
2. **Input Validation**: All endpoints validate input
3. **SQL Injection Prevention**: Prisma ORM protects against SQLi
4. **XSS Protection**: React automatically escapes content

---

## 🎯 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All code committed to GitHub
- [ ] Database schema finalized
- [ ] Environment variables documented
- [ ] API tests passing locally

### **During Deployment**
- [ ] Database deployed (Neon.tech)
- [ ] Backend deployed (Render)
- [ ] AI service deployed (Render)
- [ ] Frontend deployed (Vercel)
- [ ] Environment variables configured
- [ ] CORS settings updated

### **Post-Deployment**
- [ ] Database migrations run
- [ ] Admin user created
- [ ] All endpoints tested
- [ ] Frontend integration verified
- [ ] Monitoring configured

---

## 📞 **Support & Resources**

### **Platform Support**
- **Render Support**: [docs.render.com](https://docs.render.com)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Neon.tech Docs**: [neon.tech/docs](https://neon.tech/docs)

### **Project Documentation**
- **GitHub Repository**: [Smart-Academic-System](https://github.com/Shirshendu-sen/Smart-Academic-System)
- **API Documentation**: See README.md for API endpoints
- **Setup Guide**: Run `./setup.sh` for local development

### **Contact for Help**
- **GitHub Issues**: Report deployment issues
- **Render Community**: Community forum for deployment questions
- **Vercel Discord**: Real-time support community

---

## 🎉 **Deployment Complete!**

Your Smart Academic Platform LMS is now live at:
- **Frontend**: `https://smart-academic-platform.vercel.app`
- **Backend API**: `https://smart-academic-backend.onrender.com`
- **AI Service**: `https://smart-academic-ai.onrender.com`
- **Database**: Neon.tech PostgreSQL

**Next Steps**:
1. Share your deployed application with users
2. Monitor performance and usage
3. Gather feedback for improvements
4. Plan feature enhancements

**Congratulations!** 🎓 You've successfully deployed a full-stack, AI-powered Learning Management System.
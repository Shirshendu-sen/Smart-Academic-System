# 🔧 Render Deployment Fix Guide

## **Problem**
You're getting this error when trying to deploy:
```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/opt/render/project/src/package.json'
```

## **Root Cause**
Render is trying to run Node.js commands on the AI service (which is Python), or you selected the wrong directory when creating the web service.

## **Solution**

### **Option 1: Use Render Blueprint (Recommended)**
1. Delete any existing services on Render
2. Push the `render.yaml` file to GitHub:
   ```bash
   git add render.yaml
   git commit -m "Add Render blueprint configuration"
   git push origin main
   ```
3. Go to [Render Dashboard](https://dashboard.render.com)
4. Click **"New +"** → **"Blueprint"**
5. Connect your GitHub repository
6. Render will automatically detect `render.yaml` and create both services

### **Option 2: Manual Setup (Step-by-Step)**

#### **Step 1: Delete Existing Services**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find any services named `smart-academic-*`
3. Click on each service → Settings → Delete

#### **Step 2: Deploy Backend API**
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. **CRITICAL**: In the configuration page:
   - **Name**: `smart-academic-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend` ⭐ **IMPORTANT**

4. Add environment variables:
   - `DATABASE_URL`: Your Neon.tech connection string
   - `JWT_SECRET`: A strong secret (min 32 chars)
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

5. Click **"Create Web Service"**

#### **Step 3: Deploy AI Service**
1. Click **"New +"** → **"Web Service"** again
2. Connect same GitHub repository
3. **CRITICAL**: In the configuration page:
   - **Name**: `smart-academic-ai`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Root Directory**: `ai-service` ⭐ **IMPORTANT**

4. Add environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `BACKEND_URL`: `https://smart-academic-backend.onrender.com` (after backend deploys)
   - `PORT`: `10000`
   - `FLASK_ENV`: `production`

5. Click **"Create Web Service"**

## **Verification**

### **Check Backend Health**
```bash
curl https://smart-academic-backend.onrender.com/health
```
**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "smart-lms-backend",
  "version": "1.0.0"
}
```

### **Check AI Service Health**
```bash
curl https://smart-academic-ai.onrender.com/health
```
**Expected Response**:
```json
{
  "status": "AI Service is running",
  "timestamp": "production",
  "service": "smart-lms-ai-service",
  "version": "1.0.0"
}
```

## **Common Issues & Fixes**

### **Issue 1: "Could not read package.json"**
**Cause**: Wrong root directory selected
**Fix**: Ensure Root Directory is `backend` for backend, `ai-service` for AI service

### **Issue 2: Database Connection Failed**
**Fix**: 
1. Verify DATABASE_URL is correct
2. Add `?sslmode=require` to the end of connection string
3. Check if Neon.tech database is running

### **Issue 3: CORS Errors**
**Fix**: 
1. After frontend deploys, update backend `CORS_ORIGIN` environment variable
2. Value: `https://your-frontend.vercel.app`

### **Issue 4: Cold Starts (Free Tier)**
**Note**: Render free tier has ~50 second cold starts after inactivity
**Workaround**: 
1. Use paid tier for production
2. Implement client-side retry logic

## **Next Steps After Successful Deployment**

1. **Deploy Frontend to Vercel**
2. **Update CORS_ORIGIN** in backend with frontend URL
3. **Run Database Migrations**:
   ```bash
   cd backend
   export DATABASE_URL="your-neon-connection-string"
   npx prisma db push
   ```
4. **Create Admin User** via API
5. **Test Complete System**

## **Quick Commands to Push Fixes**
```bash
# Add all fixes to Git
git add .
git commit -m "Fix Render deployment: Add health endpoints, update build scripts"
git push origin main

# After pushing, Render will auto-deploy if auto-deploy is enabled
```

## **Need Help?**
- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **GitHub Issues**: Report deployment issues
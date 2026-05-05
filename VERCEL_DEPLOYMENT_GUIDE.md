# 🚀 Smart Academic Platform - Frontend Deployment to Vercel

## 📋 **Prerequisites**

Before deploying to Vercel, ensure you have:
1. ✅ Backend deployed on Render (URL: `https://smart-academic-backend.onrender.com`)
2. ✅ AI Service deployed on Render (URL: `https://smart-academic-ai.onrender.com`)
3. ✅ GitHub repository with your frontend code
4. ✅ Vercel account (Sign up at [vercel.com](https://vercel.com))

## 🎯 **Step-by-Step Deployment Guide**

### **Step 1: Prepare Frontend for Production**

1. **Update Environment Variables**:
   - Create/update `frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL=https://smart-academic-backend.onrender.com
   NEXT_PUBLIC_AI_SERVICE_URL=https://smart-academic-ai.onrender.com
   ```

2. **Verify Next.js Configuration**:
   - Ensure `frontend/next.config.js` is properly configured:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     images: {
       domains: ['res.cloudinary.com'],
     },
   }
   module.exports = nextConfig
   ```

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard**

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click **"Add New..."** → **"Project"**

2. **Import GitHub Repository**:
   - Connect your GitHub account if not already connected
   - Select your repository: `Smart-Academic-System`
   - Click **"Import"**

3. **Configure Project Settings**:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | `Next.js` |
   | **Root Directory** | `frontend` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` |
   | **Install Command** | `npm install` |

4. **Add Environment Variables**:
   - Go to **Settings** → **Environment Variables**
   - Add the following variables:
     - `NEXT_PUBLIC_API_URL`: `https://smart-academic-backend.onrender.com`
     - `NEXT_PUBLIC_AI_SERVICE_URL`: `https://smart-academic-ai.onrender.com`

5. **Deploy**:
   - Click **"Deploy"**
   - Wait 3-5 minutes for deployment to complete
   - Copy your frontend URL (e.g., `https://smart-academic-platform.vercel.app`)

#### **Option B: Deploy via Vercel CLI**

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to frontend directory**:
   ```bash
   cd smart-lms/frontend
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```
   - Follow the prompts to configure your project

### **Step 3: Update Backend CORS Settings**

After getting your frontend URL:

1. **Go to Render Dashboard**:
   - Navigate to your backend service
   - Go to **Environment** section

2. **Update CORS_ORIGIN**:
   - Add your frontend URL to `CORS_ORIGIN`:
     ```
     https://smart-academic-platform.vercel.app
     ```
   - If you want to allow multiple origins, separate with commas

3. **Redeploy Backend**:
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

### **Step 4: Test Your Deployment**

1. **Test Frontend**:
   - Open your frontend URL in browser
   - Verify the application loads without errors

2. **Test API Connectivity**:
   - Open browser developer tools (F12)
   - Check Network tab for API calls
   - Ensure no CORS errors

3. **Test AI Service**:
   - Navigate to any AI-powered feature
   - Verify AI responses work correctly

### **Step 5: Configure Custom Domain (Optional)**

1. **Add Domain in Vercel**:
   - Go to **Settings** → **Domains**
   - Add your custom domain (e.g., `lms.yourdomain.com`)

2. **Configure DNS**:
   - Add CNAME record pointing to Vercel
   - Wait for DNS propagation (up to 48 hours)

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: Build Failures**
**Symptoms**: Deployment fails during build
**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility (use 18.x)

### **Issue 2: CORS Errors**
**Symptoms**: Frontend can't call backend API
**Solutions**:
1. Update backend `CORS_ORIGIN` with frontend URL
2. Clear browser cache
3. Redeploy both frontend and backend

### **Issue 3: Environment Variables Not Loading**
**Symptoms**: API URLs not working in production
**Solutions**:
1. Verify environment variables in Vercel settings
2. Ensure variable names match code (prefix with `NEXT_PUBLIC_`)
3. Redeploy after updating variables

### **Issue 4: Slow AI Responses**
**Symptoms**: AI features timeout or are slow
**Solutions**:
1. Render free tier has cold starts (up to 50 seconds)
2. Implement loading states in frontend
3. Consider upgrading to paid tier for production

## 📊 **Post-Deployment Checklist**

- [ ] Frontend deployed successfully
- [ ] Environment variables configured
- [ ] Backend CORS updated with frontend URL
- [ ] All features tested
- [ ] Custom domain configured (if needed)
- [ ] Analytics/monitoring set up

## 🔧 **Vercel Features to Enable**

1. **Analytics**:
   - Enable Vercel Analytics for performance monitoring
   - Track page views and user behavior

2. **Speed Insights**:
   - Enable Speed Insights for performance metrics
   - Identify slow pages

3. **Automatic Deployments**:
   - Configure automatic deployments on Git push
   - Set up preview deployments for PRs

4. **Edge Functions** (Optional):
   - Consider using Vercel Edge Functions for faster API calls
   - Implement middleware for authentication

## 📈 **Performance Optimization**

1. **Image Optimization**:
   - Use Next.js Image component for automatic optimization
   - Configure `next.config.js` for external image domains

2. **Caching**:
   - Leverage Vercel edge caching
   - Set appropriate cache headers

3. **Bundle Optimization**:
   - Analyze bundle size with `@next/bundle-analyzer`
   - Implement code splitting

## 🔐 **Security Considerations**

1. **Environment Variables**:
   - Never commit sensitive data to GitHub
   - Use Vercel environment variables for all secrets

2. **HTTPS**:
   - Vercel provides automatic HTTPS
   - Ensure all API calls use HTTPS

3. **CSP Headers**:
   - Consider adding Content Security Policy headers
   - Configure in `next.config.js`

## 📞 **Support Resources**

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment Guide**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **GitHub Repository**: Your project repo for code issues
- **Render Documentation**: For backend/AI service issues

## 🎉 **Deployment Complete!**

Your Smart Academic Platform frontend is now live at:
**`https://smart-academic-platform.vercel.app`** (or your custom domain)

**Next Steps**:
1. Share your application with users
2. Monitor performance using Vercel Analytics
3. Gather feedback for improvements
4. Set up CI/CD for automatic deployments

**Congratulations!** 🚀 Your AI-powered Learning Management System is now fully deployed and ready for use.
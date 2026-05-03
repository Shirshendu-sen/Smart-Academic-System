# ⚡ Quick Vercel Deployment Checklist

## 🚀 **5-Minute Deployment Steps**

### **1. Prerequisites**
- [ ] Backend deployed: `https://smart-academic-backend.onrender.com`
- [ ] AI Service deployed: `https://smart-academic-ai.onrender.com`
- [ ] GitHub repository ready

### **2. Vercel Setup**
1. **Sign up/Login**: [vercel.com](https://vercel.com)
2. **Import Repository**: 
   - Click "Add New Project"
   - Select your GitHub repo
3. **Configure**:
   - Framework: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### **3. Environment Variables**
Add these in Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://smart-academic-backend.onrender.com
NEXT_PUBLIC_AI_SERVICE_URL=https://smart-academic-ai.onrender.com
```

### **4. Deploy**
- Click **"Deploy"**
- Wait 3-5 minutes
- Copy your frontend URL (e.g., `https://smart-academic-platform.vercel.app`)

### **5. Update Backend CORS**
1. Go to Render backend service
2. Update `CORS_ORIGIN` environment variable:
   ```
   https://smart-academic-platform.vercel.app
   ```
3. Redeploy backend

### **6. Test**
- Open frontend URL
- Test login/registration
- Test AI features
- Verify no CORS errors

## 🔧 **Troubleshooting Quick Fixes**

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js version (use 18.x) |
| CORS errors | Update backend CORS_ORIGIN |
| API not working | Verify environment variables |
| Slow AI responses | Render free tier cold starts (wait up to 50s) |

## 📞 **Quick Support**
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Build Logs**: Check in Vercel dashboard
- **Environment**: Verify in Project Settings

## ✅ **Deployment Complete!**
Your frontend is now live at: `https://your-project.vercel.app`

**Next**: Share with users and monitor performance!
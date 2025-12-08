# Railway Deployment Guide - Backend

## 📋 Prerequisites
- GitHub account
- Railway account (sign up at railway.app)
- Your backend code pushed to GitHub

---

## 🚀 Step-by-Step Deployment

### 1. Push to GitHub (if not already done)

```bash
cd c:\prime-motors
git init
git add .
git commit -m "Prepare for Railway deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/prime-motors.git
git push -u origin main
```

### 2. Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign in** with GitHub
3. **Click "New Project"**
4. **Choose "Deploy from GitHub repo"**
5. **Select your `prime-motors` repository**
6. **Railway will detect the Node.js project**

### 3. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will provision a PostgreSQL database
4. Database connection string is auto-added as `DATABASE_URL`

### 4. Configure Environment Variables

In Railway project settings → **Variables**, add:

```bash
# Auto-provided by Railway:
DATABASE_URL=(already set by PostgreSQL service)
PORT=4000

# You need to add:
NODE_ENV=production
JWT_SECRET=<generate-with-command-below>
SHADOW_DATABASE_URL=(leave empty for production)
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Configure Backend Service

In Railway, select your **backend service** → **Settings**:

- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`

### 6. Deploy Database Schema

After first deployment, open Railway **backend service** terminal:

```bash
npx prisma migrate deploy
```

Or use the Railway CLI locally:
```bash
railway login
railway link
railway run npx prisma migrate deploy
```

### 7. Get Your Backend URL

1. In Railway → backend service → **Settings**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `your-app.up.railway.app`)
4. **Save this URL** - you'll need it for frontend

---

## ✅ Verification

Test your deployed backend:

```bash
curl https://your-app.up.railway.app/api/health
# Should return: {"status":"ok"}
```

---

## 🔧 Common Issues & Solutions

### Issue: Build fails
**Solution**: Check Railway logs for errors. Ensure all dependencies are in `package.json`

### Issue: Database connection fails
**Solution**: Verify `DATABASE_URL` variable is set. Railway auto-provides this.

### Issue: Prisma migrations fail
**Solution**: Run migrations manually via Railway CLI or service terminal

### Issue: 502 Bad Gateway
**Solution**: Check that `PORT` variable is set and app listens on `process.env.PORT`

---

## 💰 Expected Costs

- **PostgreSQL Database**: ~$5/month (shared)
- **Backend Service**: ~$5/month (512MB)
- **Total**: ~$10/month

First $5 credit is free!

---

## 📱 Railway CLI (Optional but Recommended)

```bash
npm install -g @railway/cli
railway login
railway link
railway logs
railway run npx prisma migrate deploy
```

---

## 🎯 Next Steps After Backend Deployment

1. ✅ Get your Railway backend URL
2. ⏭️ Update frontend `.env` with backend URL:
   ```env
   VITE_API_URL=https://your-app.up.railway.app
   ```
3. ⏭️ Deploy frontend to Vercel/Netlify

---

## 🔒 Security Checklist

- [x] JWT_SECRET is unique and strong
- [x] DATABASE_URL is secure (Railway provides SSL)
- [ ] Configure CORS to allow only your frontend domain
- [ ] Add rate limiting in production
- [ ] Enable Railway IP allowlisting (optional)

---

**Estimated deployment time**: 10-15 minutes

**Your backend URL will be**: `https://[random-name].up.railway.app`

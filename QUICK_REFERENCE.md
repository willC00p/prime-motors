# Quick Deployment Reference

## 🚀 Production Environment Variables

### Frontend (Vite)
```bash
VITE_API_URL=https://your-backend-url.com
```

### Backend (Node.js)
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
PORT=4000
NODE_ENV=production
JWT_SECRET=<generate-strong-32-char-secret>
```

## 📋 Deployment Checklist

### Before Deployment
- [x] Prisma schema backed up ✓
- [x] All localhost URLs replaced with env vars ✓
- [x] .env files created ✓
- [x] .gitignore updated ✓
- [ ] Update production API URL in frontend/.env
- [ ] Set strong JWT_SECRET in backend/.env
- [ ] Configure production database URL

### Backend Deployment
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
# Deploy to hosting platform
```

### Frontend Deployment
```bash
cd frontend
# Update VITE_API_URL in .env first!
npm install
npm run build
# Deploy dist/ folder to static hosting
```

## 🔧 Quick Commands

### Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Environment Variables (Frontend)
```bash
cd frontend
npm run dev
# Open browser console and check: import.meta.env.VITE_API_URL
```

### Check Database Connection (Backend)
```bash
cd backend
npx prisma db push
```

## 🌐 Hosting Providers

| Service | Best For | Free Tier |
|---------|----------|-----------|
| **Vercel** | Frontend | Yes (generous) |
| **Railway** | Backend + DB | $5 credit |
| **Render** | Backend + DB | Yes (limited) |
| **Supabase** | PostgreSQL | Yes (500MB) |

## ⚠️ Common Issues

**Issue**: API calls fail after deployment  
**Fix**: Check VITE_API_URL is set correctly and backend CORS allows frontend domain

**Issue**: Database connection fails  
**Fix**: Verify DATABASE_URL format and database is accessible from hosting platform

**Issue**: 401 Unauthorized errors  
**Fix**: Ensure JWT_SECRET matches between deployments

## 📞 Support Resources

- Frontend logs: Check browser console
- Backend logs: Check hosting platform logs
- Database: Check connection string format
- CORS: Verify backend allows frontend origin

---

## 🎯 File Changes Summary

**Modified Files:**
- frontend/src/services/api.ts
- frontend/src/utils/api.ts
- frontend/src/services/ltoRegistrationApi.ts
- frontend/src/components/InteractivePresentation.tsx
- frontend/src/pages/Sales.tsx
- frontend/.gitignore

**Created Files:**
- frontend/.env
- frontend/.env.example
- backend/.env.example
- DEPLOYMENT.md
- HOSTING_CHANGES.md
- QUICK_REFERENCE.md (this file)

**Backed Up:**
- backend/prisma/schema.prisma.backup_2025-12-08_144528

---

**Total Changes:** 19 hardcoded URLs → environment variables  
**Status:** ✅ Ready for production deployment

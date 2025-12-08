# Deployment Guide for Prime Motors System

## Pre-Deployment Checklist

✅ Prisma schema backed up to: `backend/prisma/schema.prisma.backup_2025-12-08_144528`
✅ All hardcoded localhost URLs replaced with environment variables
✅ Environment configuration files created

## Environment Variables Setup

### Frontend (.env)
```env
# Development
VITE_API_URL=http://localhost:4000

# Production (Update before deploying)
VITE_API_URL=https://api.yourdomain.com
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prime_motors

# Server
PORT=4000
NODE_ENV=production

# JWT Secret (Generate a strong secret)
JWT_SECRET=your_secure_jwt_secret_key_here
```

## Deployment Steps

### 1. Database Setup
- Set up PostgreSQL database on your hosting provider
- Update `DATABASE_URL` in backend `.env` with production database credentials
- Run Prisma migrations:
  ```bash
  cd backend
  npx prisma migrate deploy
  ```

### 2. Backend Deployment
- Build the backend:
  ```bash
  cd backend
  npm install
  npm run build
  ```
- Deploy to your hosting service (Heroku, Railway, Render, etc.)
- Ensure `NODE_ENV=production` is set
- Set all required environment variables on your hosting platform

### 3. Frontend Deployment
- Update `VITE_API_URL` in frontend `.env` to point to your deployed backend
- Build the frontend:
  ```bash
  cd frontend
  npm install
  npm run build
  ```
- Deploy the `dist` folder to your static hosting service (Vercel, Netlify, Cloudflare Pages, etc.)
- Ensure environment variables are configured in your hosting platform

### 4. CORS Configuration
Update your backend to allow requests from your frontend domain. In your backend CORS settings:
```javascript
cors({
  origin: [
    'http://localhost:5173', // Development
    'https://yourdomain.com' // Production frontend URL
  ]
})
```

## Hosting Provider Recommendations

### Backend Options
- **Railway**: Easy PostgreSQL + Node.js deployment
- **Render**: Free tier available with PostgreSQL
- **Heroku**: Mature platform with good PostgreSQL support
- **DigitalOcean App Platform**: Scalable with managed databases

### Frontend Options
- **Vercel**: Best for Vite/React, automatic deployments
- **Netlify**: Great free tier, easy environment variables
- **Cloudflare Pages**: Fast CDN, generous free tier
- **GitHub Pages**: Free, but requires custom domain for API calls

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use strong database passwords
- [ ] Enable HTTPS for both frontend and backend
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting on API endpoints
- [ ] Review and update Prisma security settings
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Use environment variables on hosting platforms, never commit secrets

## Post-Deployment Verification

1. Test user authentication and authorization
2. Verify all API endpoints are accessible
3. Check inventory management functions
4. Test sales creation and reporting
5. Verify PDF generation works
6. Test LTO registration forms
7. Check dashboard analytics load correctly

## Rollback Plan

If deployment issues occur:
1. Frontend: Redeploy previous build from your hosting dashboard
2. Backend: Revert to previous deployment
3. Database: Restore from backup (ensure regular backups are configured)
4. Prisma schema backup available at: `backend/prisma/schema.prisma.backup_2025-12-08_144528`

## Monitoring

Set up monitoring for:
- API response times
- Database connection health
- Error rates and logs
- User authentication success/failure rates

## Support

For deployment issues, check:
- Hosting provider logs
- Browser console for frontend errors
- Backend server logs
- Database connection status

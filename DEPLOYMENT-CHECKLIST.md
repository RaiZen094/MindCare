# 🚀 Backend Deployment Checklist

## ✅ Files Ready for Deployment

### Required Files (✅ Created/Updated):
- [x] `Dockerfile` - Optimized for Render deployment
- [x] `application-production.properties` - Production database config
- [x] `application.properties` - Updated JWT secret property
- [x] `DEPLOYMENT.md` - Step-by-step deployment guide
- [x] `render.yaml` - Optional Render configuration
- [x] `.dockerignore` - Optimized Docker build

## 🎯 Next Steps

### 1. Commit Changes
```bash
git add .
git commit -m "feat: prepare backend for Render deployment"
git push origin main
```

### 2. Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Create new Web Service
4. Connect your repository
5. Configure:
   - Root Directory: `backend`
   - Runtime: Docker
   - Start Command: `java -jar app.jar`

### 3. Add PostgreSQL Database
- Create PostgreSQL service in Render
- Copy the DATABASE_URL

### 4. Set Environment Variables
```env
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET_KEY=MindCare_Connect_Super_Secret_Key_2025_Bangladesh_Mental_Health_Platform_Production_256_Bit_Key
JWT_EXPIRATION=86400000
ADMIN_EMAIL=admin@mindcareconnect.bd
ADMIN_PASSWORD=MindCare@AdminProd2025!
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
PORT=8080
```

### 5. Deploy & Test
- Wait for build completion (5-10 minutes)
- Test health endpoint: `https://your-app.onrender.com/api/public/health`
- Test admin login with your credentials

## 🔧 Environment Variables Explanation

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `SPRING_PROFILES_ACTIVE` | Activates production profile | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens (256-bit) | `your_256_bit_secret_key_here...` |
| `JWT_EXPIRATION` | Token expiration time in milliseconds | `86400000` (24 hours) |
| `ADMIN_EMAIL` | Default admin user email | `admin@mindcareconnect.bd` |
| `ADMIN_PASSWORD` | Default admin user password | `MindCare@AdminProd2025!` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend URLs | `https://your-frontend.vercel.app` |
| `PORT` | Server port (Render provides this) | `8080` |

## ⚠️ Important Security Notes

1. **JWT Secret**: Must be at least 32 characters (256 bits)
2. **Admin Password**: Use a strong password for production
3. **CORS Origins**: Update with your actual frontend URL
4. **Database**: Render provides managed PostgreSQL with automatic backups

## 🎉 Success Indicators

Your backend is successfully deployed when:
- ✅ Render shows "Live" status (green)
- ✅ Health check returns: `{"status":"UP",...}`
- ✅ Admin user is created automatically
- ✅ Database tables are created automatically
- ✅ No errors in deployment logs

Your backend will be available at: `https://mindcare-backend-[random].onrender.com`

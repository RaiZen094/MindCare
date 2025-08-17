# Backend Deployment to Render.com

## 🚀 Deployment Steps

### 1. Go to Render Dashboard
- Visit [render.com](https://render.com)
- Sign in with GitHub
- Click "New +" → "Web Service"

### 2. Connect Repository
- Select "Build and deploy from a Git repository"
- Choose your `MindCare` repository
- Click "Connect"

### 3. Configure Service
```
Service Name: mindcare-backend
Region: Oregon (US West)
Branch: main (or master)
Root Directory: backend
Runtime: Docker
Build Command: (leave empty)
Start Command: java -jar app.jar
```

### 4. Add PostgreSQL Database
- In Render dashboard, click "New +" → "PostgreSQL"
- Name: mindcare-database
- Database: mindcare
- User: mindcare_user
- Plan: Free
- Click "Create Database"

### 5. Set Environment Variables
In your web service → Environment tab, add:

```env
SPRING_PROFILES_ACTIVE=production
DATABASE_URL=<copy from your PostgreSQL database>
JWT_SECRET_KEY=MindCare_Connect_Super_Secret_Key_2025_Bangladesh_Mental_Health_Platform_Production_256_Bit_Key
JWT_EXPIRATION=86400000
ADMIN_EMAIL=admin@mindcareconnect.bd
ADMIN_PASSWORD=MindCare@AdminProd2025!
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
PORT=8080
```

### 6. Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your service will be available at: https://mindcare-backend-xxx.onrender.com

### 7. Test Deployment
```bash
# Test health check
curl https://your-service-url.onrender.com/api/public/health

# Expected response:
# {"status":"UP","timestamp":"2025-01-XX...","service":"MindCare Connect Backend","version":"1.0.0"}
```

### 8. Test Admin Login
```bash
curl -X POST https://your-service-url.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mindcareconnect.bd",
    "password": "MindCare@AdminProd2025!"
  }'
```

## 🔧 Important Notes

1. **Database URL**: Copy the exact DATABASE_URL from your PostgreSQL database in Render
2. **JWT Secret**: Use a secure 256-bit secret key (at least 32 characters)
3. **Admin Password**: Use a strong password for production
4. **CORS Origins**: Update with your actual frontend URL after deploying frontend

## 🚨 Troubleshooting

### Build Fails
- Check that Dockerfile is in backend directory
- Verify Java 21 is being used
- Check build logs for Maven errors

### Database Connection Error
- Verify DATABASE_URL is correctly set
- Ensure PostgreSQL database is running
- Check database logs in Render dashboard

### Health Check Fails
- Verify /api/public/health endpoint exists
- Check application logs for startup errors
- Ensure port 8080 is properly exposed

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Service status shows "Live" (green indicator)
- ✅ Health check endpoint returns 200 OK
- ✅ Application logs show "Started MindCareConnectApplication"
- ✅ Database tables are created automatically
- ✅ Admin user is created on first startup

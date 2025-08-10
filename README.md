# MindCare Connect 🧠💚

A comprehensive mental health platform connecting patients with verified mental health professionals in Bangladesh.

## 🏃‍♂️ TL;DR - Quick Start for Teammates

```bash
# 1. Clone the repo
git clone https://github.com/RaiZen094/MindCare.git
cd MindCare

# 2. Start everything with Docker
docker-compose -f docker-compose.dev.yml up -d --build

# 3. Open http://localhost:3000 and login with:
# Email: admin@mindcareconnect.bd
# Password: MindCare@Admin2025
```

**That's it! 🎉** Your development environment is ready.

---

## 🚀 Detailed Setup Guide

### 📋 Prerequisites
- **Docker** and **Docker Compose** installed on your system
- **Git** for cloning the repository

### 🐳 Running the Project Locally (Recommended)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RaiZen094/MindCare.git
   cd MindCare
   ```

2. **Start the Development Environment**
   ```bash
   # Start all services (backend + frontend + database)
   docker-compose -f docker-compose.dev.yml up -d --build
   
   # Or run with logs visible (non-detached)
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080/api
   - **H2 Database Console**: http://localhost:8080/api/h2-console (if needed)

4. **Stop the Application**
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## 📱 Application URLs

### Development Environment (Docker)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **H2 Database Console**: http://localhost:8080/api/h2-console
- **Health Check**: http://localhost:8080/api/public/health

## 🔐 Default Login Credentials

**Admin Account:**
- **Email**: `admin@mindcareconnect.bd`
- **Password**: `MindCare@Admin2025`
- **Role**: Administrator (full access)

**For Regular Users:**
- Go to http://localhost:3000/auth/register to create a new account
- New users get PATIENT role by default

## 🧪 Testing the Application

### Quick Test Steps:
1. Open http://localhost:3000
2. Click "Login"
3. Use admin credentials above
4. Explore the admin dashboard
5. Test registration by creating a new user account

### API Testing:
- **Health Check**: GET http://localhost:8080/api/public/health
- **Public Wellness Hub**: GET http://localhost:8080/api/public/wellness-hub
- **Authentication**: POST http://localhost:8080/api/auth/login

## 🔧 Development Commands

```bash
# View logs of all services
docker-compose -f docker-compose.dev.yml logs -f

# View logs of specific service
docker-compose -f docker-compose.dev.yml logs -f backend-dev
docker-compose -f docker-compose.dev.yml logs -f frontend-dev

# Restart services
docker-compose -f docker-compose.dev.yml restart

# Rebuild and restart (when you make changes)
docker-compose -f docker-compose.dev.yml up --build

# Check service status
docker-compose -f docker-compose.dev.yml ps
```

## 🔄 Development Workflow

### Making Changes
1. Make your code changes in `backend/` or `frontend/` directories
2. Restart containers to see changes: `docker-compose -f docker-compose.dev.yml restart`
3. For major changes, rebuild: `docker-compose -f docker-compose.dev.yml up --build`

### Database Reset
- The development setup uses H2 in-memory database
- Data resets on container restart (perfect for development)
- No need to manage database migrations in development

## 🚨 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # for frontend
lsof -i :8080  # for backend

# Kill the process or stop conflicting services
```

### Issue: Docker Build Fails
```bash
# Clean Docker cache and rebuild
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Issue: Database Connection Error
```bash
# The development setup uses H2 in-memory database
# If you see database errors, restart the backend container:
docker-compose -f docker-compose.dev.yml restart backend-dev
```

### Issue: Login/Registration Fails
- Ensure you're using the correct admin credentials
- Check backend logs: `docker-compose -f docker-compose.dev.yml logs backend-dev`
- Verify the JWT secret is properly configured (automatically handled in Docker setup)

### Issue: Frontend Not Loading
```bash
# Check if frontend container is running
docker-compose -f docker-compose.dev.yml ps

# Restart frontend container
docker-compose -f docker-compose.dev.yml restart frontend-dev
```

## 👥 Team Development Guidelines

### Code Changes
1. Always test your changes with: `docker-compose -f docker-compose.dev.yml up --build`
2. Check logs for errors before committing
3. Ensure both frontend and backend start successfully

### Git Workflow
```bash
# Before making changes
git pull origin main

# Create a new branch for your feature
git checkout -b feature/your-feature-name

# After making changes
git add .
git commit -m "feat: your descriptive commit message"
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

### Environment Consistency
- **Always use Docker** for development to ensure consistency
- Never commit `.env` files or sensitive credentials
- Use the provided Docker setup - don't modify ports unless necessary
- Report any Docker setup issues to the team lead immediately

## 🛠️ Alternative Setup (Manual)

If you prefer running services individually without Docker:

### Prerequisites
- **Java 21**
- **Node.js 18+**
- **npm** or **yarn**

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
# Windows: mvnw.cmd spring-boot:run
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## 🚀 Production Deployment

For production deployment, use:
```bash
docker-compose -f docker-compose.yml up -d --build
```

This uses PostgreSQL database and production optimizations.

## 🏗️ Project Structure

```
MindCare/
├── frontend/                 # Next.js 15 React Application
│   ├── src/app/             # App Router pages
│   ├── src/contexts/        # React contexts (Auth)
│   ├── src/lib/            # Utilities (API, Auth)
│   └── Dockerfile          # Frontend Docker configuration
│
├── backend/                 # Spring Boot 3.2 Application  
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Configuration files
│   └── Dockerfile          # Backend Docker configuration
│
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
└── README.md               # This file
```

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios

### Backend  
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Security**: Spring Security + JWT
- **Database**: H2 (development) / PostgreSQL (production)
- **ORM**: Hibernate JPA

## 📝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Make your changes and test with Docker
4. Commit your changes: `git commit -m 'Add some AmazingFeature'`
5. Push to the branch: `git push origin feature/AmazingFeature`
6. Open a Pull Request

## 🆘 Support

For support and questions:
- Check this README first
- Look at container logs: `docker-compose -f docker-compose.dev.yml logs -f`
- Create an issue in this repository
- Contact the development team

## ⚠️ Important Notes

- **Never commit sensitive data** like passwords or API keys
- **Always use Docker** for development to ensure team consistency
- **Test your changes** before pushing to the repository
- **Change default passwords** before deploying to production

---

**Happy Coding! 🚀** Built with ❤️ for Bangladesh's mental health community 🇧��

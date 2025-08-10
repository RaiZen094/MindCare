# MindCare Connect 🧠💚

A comprehensive mental health platform connecting patients with verified mental health professionals in Bangladesh.

## 🚀 Quick Start

### Prerequisites
- **Java 21** (installed at `C:\Program Files\Java\jdk-21`)
- **Node.js 18+** 
- **npm** or **yarn**

### 🎯 One-Click Startup
```powershell
# Start both frontend and backend automatically
.\start-mindcare.ps1
```

### 🔧 Manual Startup

#### Backend (Spring Boot)
```powershell
# Option 1: Use startup script
cd backend
.\start-backend.ps1

# Option 2: Manual command
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
.\mvnw.cmd spring-boot:run
```

#### Frontend (Next.js)
```powershell
# Option 1: Use startup script  
cd frontend
.\start-frontend.ps1

# Option 2: Manual command
cd frontend
npm run dev
```

## 📱 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **H2 Database Console**: http://localhost:8080/api/h2-console

## 🔐 Default Credentials

**Admin Account:**
- Email: `admin@mindcareconnect.bd`
- Password: `MindCare@Admin2025`

> ⚠️ **Security Notice**: Change the default admin password after first login!

## Features

### 🎭 User Roles & Features

#### 👤 General User (Anonymous)
- ✅ Browse Wellness Hub articles and resources
- ✅ View professional profiles and specializations  
- ✅ Use AI Assistant for initial mental health assessment
- ✅ Access FAQ and platform information

#### 🏥 Patient (Registered User) 
- ✅ All general user features
- ✅ Create secure, private profile
- ✅ Book and manage appointments (online/physical)
- ✅ Private mood journal and wellness tools
- ✅ AI Wellness Companion
- ✅ Participate in peer support community
- ✅ Secure messaging with chosen professionals

#### 👨‍⚕️ Mental Health Professional
- ✅ Verified profile with credentials and specializations
- ✅ Personal dashboard for practice management
- ✅ Calendar management for availability
- ✅ Secure patient messaging and communication
- ✅ Contribute articles to Wellness Hub (admin approved)

#### 🛡️ Administrator
- ✅ Professional verification and onboarding
- ✅ Wellness Hub content management
- ✅ Community moderation and user support
- ✅ Platform analytics and monitoring
- ✅ Data privacy and security compliance

### 🔒 Security Features
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin, Professional, Patient, Moderator)
- **Password encryption** using BCrypt with strength 12
- **Account lockout protection** after 5 failed login attempts
- **Input validation** with comprehensive error handling
- **CORS protection** with configurable allowed origins
- **Session management** with secure cookies

### User Management
- **User registration** with email verification
- **Account status tracking** (Active, Suspended, Banned, Pending Verification)
- **Phone number validation** for Bangladesh (+8801XXXXXXXXX)
- **Password complexity requirements**
- **Default admin user creation**

### 💻 Frontend Features
- **Responsive authentication pages** (Login/Register)
- **Form validation** with React Hook Form and Yup
- **Authentication context** for state management
- **Protected routes** and role-based navigation
- **Role-specific dashboards** (Patient, Professional, Admin)
- **Professional and Admin portals** with unique features

## 🏗️ Project Structure

```
MindCare/
├── frontend/                 # Next.js 15 React Application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── dashboard/   # User dashboards
│   │   │   ├── admin/       # Admin portal
│   │   │   └── professional/ # Professional portal
│   │   ├── contexts/        # React contexts (Auth)
│   │   └── lib/            # Utilities (API, Auth)
│   ├── start-frontend.ps1   # Frontend startup script
│   └── package.json
│
├── backend/                 # Spring Boot 3.2 Application  
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/mindcare/connect/
│   │       │       ├── config/      # Security & JWT config
│   │       │       ├── controller/  # REST endpoints
│   │       │       ├── dto/         # Data Transfer Objects
│   │       │       ├── entity/      # JPA entities
│   │       │       ├── repository/  # Data repositories
│   │       │       └── service/     # Business logic
│   │       └── resources/
│   │           └── application.properties
│   ├── start-backend.ps1    # Backend startup script
│   ├── start-backend.bat    # Windows batch script
│   └── pom.xml
│
├── start-mindcare.ps1       # Full-stack startup script
├── .gitignore              # Combined gitignore
└── README.md               # This file
```

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: JavaScript (converted from TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: React Context (Auth)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup validation
- **Authentication**: JWT with secure cookie storage

### Backend  
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 21
- **Security**: Spring Security + JWT
- **Database**: H2 (development) / PostgreSQL (production)
- **ORM**: Hibernate JPA
- **Build Tool**: Maven
- **Password Encryption**: BCrypt

## 🔌 API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/public/status` - Application status check
- `GET /api/public/info` - Basic application information
- `GET /api/public/health` - Health check endpoint

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (clears session)

### Protected Endpoints (Authentication Required)
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/dashboard` - Role-specific dashboard data

### Admin Endpoints (ADMIN role required)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/{id}/role` - Update user role
- `DELETE /api/admin/users/{id}` - Delete user account

## 👥 User Roles & Permissions

### 🔑 ADMIN (Administrator)
- Full system access and control
- User management and role assignment
- Professional verification and approval
- Platform configuration and monitoring
- Access to all features and endpoints

### 👨‍⚕️ PROFESSIONAL (Mental Health Professional)
- Manage patient appointments and schedules
- Patient communication and consultation
- Professional profile and credentials management
- Contribute educational content and resources
- Access professional dashboard and tools

### 🧑‍💼 PATIENT (General User/Client)
- Book appointments with professionals
- Access wellness tools and resources
- Use AI-powered mental health features
- Join peer support communities and forums
- Personal health tracking and records

### 🛡️ MODERATOR (Community Moderator)
- Community forum moderation
- Content oversight and approval
- User support and assistance
- Report management and resolution

## 🚀 Deployment

### 🐳 **Docker Deployment**

#### Development Environment
```bash
# Start all services with Docker
./scripts/dev-docker.sh        # Linux/Mac
scripts\dev-docker.bat         # Windows

# Or manually with docker-compose
docker-compose up --build -d
```

#### Production Environment
```bash
# Production deployment with PostgreSQL
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### 🏗️ **VM Deployment**

1. **Prepare your VM:**
   ```bash
   # Run the setup script on your VM
   chmod +x scripts/deploy-vm.sh
   ./scripts/deploy-vm.sh
   ```

2. **Configure environment:**
   ```bash
   # Edit production environment variables
   nano /opt/mindcare-connect/.env
   ```

3. **Set up SSL (recommended):**
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d yourdomain.com
   ```

4. **Start the application:**
   ```bash
   sudo systemctl start mindcare-connect
   ```

### ⚙️ **CI/CD Pipeline**

#### GitHub Actions Setup

1. **Add Repository Secrets:**
   - `VM_HOST` - Your VM IP address
   - `VM_USERNAME` - SSH username  
   - `VM_SSH_KEY` - Private SSH key
   - `VM_PORT` - SSH port (default: 22)
   - `SLACK_WEBHOOK` - Slack notification webhook (optional)

2. **Automated Pipeline:**
   - ✅ **Test** - Frontend & Backend tests on PR/Push
   - ✅ **Build** - Docker images built and pushed to GitHub Container Registry
   - ✅ **Deploy** - Automatic deployment to VM on main branch push
   - ✅ **Monitor** - Health checks and notifications

3. **Manual Deployment:**
   ```bash
   # Trigger deployment workflow
   git push origin main
   ```

### Environment Configuration

#### Development (PostgreSQL with Docker)
```bash
# Start development environment with PostgreSQL
./scripts/dev-docker.sh        # Linux/Mac
scripts\dev-docker.bat         # Windows

# Database URLs:
# - Application: http://localhost:8080/api
# - Direct DB: postgresql://localhost:5432/mindcare_connect
```

#### Production (PostgreSQL)

**Option 1: Automated Setup**
```bash
# Setup PostgreSQL database (Linux/Mac)
chmod +x scripts/setup-postgresql.sh
./scripts/setup-postgresql.sh

# Setup PostgreSQL database (Windows)
scripts\setup-postgresql.bat
```

**Option 2: Manual Setup**
```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE mindcare_connect;
CREATE USER mindcare_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mindcare_connect TO mindcare_user;

-- Run initialization script
\i database/init.sql
```

**Environment Configuration:**
```properties
# Production - application-production.properties
DATABASE_URL=jdbc:postgresql://localhost:5432/mindcare_connect
DATABASE_USERNAME=mindcare_user
DATABASE_PASSWORD=your_secure_password
DATABASE_DRIVER=org.postgresql.Driver
HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect
JPA_DDL_AUTO=update
SPRING_PROFILES_ACTIVE=production
```

### Environment Variables
Create `.env.local` in frontend directory:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Production Build

#### Frontend Build
```powershell
cd frontend
npm run build
npm start
```

#### Backend Build  
```powershell
cd backend
./mvnw clean package
java -jar target/mindcare-connect-0.0.1-SNAPSHOT.jar
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🙏 Acknowledgments

- Built for Javafest - advancing mental health technology in Bangladesh
- Spring Boot and Next.js communities for excellent documentation
- All contributors and supporters of the MindCare Connect platform

---

**MindCare Connect** - Bridging the gap in mental health support across Bangladesh 🇧🇩

### Backend Setup
1. Navigate to backend directory
2. Configure database in `application.properties`
3. Run: `mvn spring-boot:run`
4. Backend will be available at `http://localhost:8080`

### Frontend Setup
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`
4. Run: `npm run dev`
5. Frontend will be available at `http://localhost:3000`

### Default Admin Account
- Email: `admin@mindcareconnect.bd`
- Password: `MindCare@Admin2025`
- **⚠️ Change default password immediately after first login!**

## Security Considerations

### For Development
- Use HTTP for local development
- Default credentials are acceptable for testing
- Database can be local PostgreSQL or H2

### For Production
- **Change all default passwords**
- Use HTTPS only
- Configure proper CORS origins
- Use environment variables for secrets
- Set up proper database with backups
- Enable rate limiting
- Configure monitoring and logging

## API Security Features

### JWT Token
- Secure token generation with configurable expiration
- Automatic token refresh capability
- Token validation on protected routes

### Password Security
- BCrypt encryption with salt rounds 12
- Minimum 8 characters with complexity requirements
- Account lockout after failed attempts

### Input Validation
- Email format validation
- Phone number validation for Bangladesh
- Password strength enforcement
- XSS protection with input sanitization

## Database Schema

### Users Table
- id (Primary Key)
- first_name, last_name
- email (Unique)
- phone (Unique, Optional)
- password (Encrypted)
- roles (Set of Role enum)
- status (UserStatus enum)
- email_verified, phone_verified
- login_attempts, locked_until
- created_at, updated_at

## Deployment Notes

### Environment Configuration
- Never commit `.env` files to version control
- Use separate configurations for dev/staging/production
- Configure proper database URLs and credentials
- Set secure JWT secrets in production

### CORS Configuration
- Update `CORS_ALLOWED_ORIGINS` for production domains
- Remove localhost origins in production
- Configure proper headers and methods

### Database Migration
- Use proper database migration tools
- Set up database backups
- Configure connection pooling
- Monitor database performance

## Contributing
1. Follow Spring Boot and Next.js best practices
2. Maintain consistent code formatting
3. Add proper error handling
4. Include comprehensive tests
5. Update documentation for changes

## Support
For technical support or questions about the authentication system, please contact the development team.

---

**Built with ❤️ for Bangladesh's mental health community**

# MindCare Connect - Authentication System

## Overview
A comprehensive full-stack authentication system for the MindCare Connect mental health platform, built with Spring Boot (backend) and Next.js (frontend).

## Features

### Security Features
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

### Frontend Features
- **Responsive authentication pages** (Login/Register)
- **Form validation** with React Hook Form and Yup
- **Authentication context** for state management
- **Protected routes** and role-based navigation
- **User dashboard** with role-specific content

## Project Structure

```
mindcare/
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/mindcare/connect/
│   │   ├── config/                   # Security & JWT configuration
│   │   ├── controller/               # REST API endpoints
│   │   ├── dto/                      # Data Transfer Objects
│   │   ├── entity/                   # JPA entities
│   │   ├── repository/               # Data access layer
│   │   └── service/                  # Business logic
│   └── src/main/resources/
│       └── application.properties    # Configuration
├── frontend/                         # Next.js Application
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── auth/                 # Authentication pages
│   │   │   └── dashboard/            # User dashboard
│   │   ├── contexts/                 # React contexts
│   │   └── lib/                      # Utilities & API client
│   └── .env.local                    # Environment variables
└── README.md
```

## Backend API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/validate` - Token validation
- `GET /api/auth/health` - Health check

### Protected Routes
- `/api/admin/**` - Admin only (ROLE_ADMIN)
- `/api/professional/**` - Professionals (ROLE_PROFESSIONAL, ROLE_ADMIN)
- `/api/patient/**` - Patients (ROLE_PATIENT, ROLE_PROFESSIONAL, ROLE_ADMIN)
- `/api/community/moderate/**` - Moderators (ROLE_MODERATOR, ROLE_ADMIN)

## User Roles

### ADMIN
- Full system access
- User management
- Professional verification
- Platform configuration

### PROFESSIONAL
- Manage appointments
- Patient communication
- Profile management
- Contribute content

### PATIENT
- Book appointments
- Access wellness tools
- Use AI features
- Join peer support

### MODERATOR
- Community moderation
- Content oversight
- User support

## Environment Variables

### Backend (application.properties)
```properties
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/mindcare_connect
DATABASE_USERNAME=mindcare_user
DATABASE_PASSWORD=mindcare_pass

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Admin
ADMIN_EMAIL=admin@mindcareconnect.bd
ADMIN_PASSWORD=your-secure-admin-password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_NAME=MindCare Connect
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Maven 3.6+

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

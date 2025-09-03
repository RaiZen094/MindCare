# MindCare Connect - Production Deployment Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Deployment Architecture](#deployment-architecture)
3. [Problems Encountered & Solutions](#problems-encountered--solutions)
4. [Final Configuration](#final-configuration)
5. [Security Configuration](#security-configuration)
6. [API Mapping Documentation](#api-mapping-documentation)
7. [Environment Variables](#environment-variables)
8. [Admin Credentials](#admin-credentials)
9. [Testing Procedures](#testing-procedures)
10. [Future Maintenance Guidelines](#future-maintenance-guidelines)

---

## 1. Project Overview

**Project Name:** MindCare Connect  
**Description:** Mental Health Platform with Professional Verification System  
**Technology Stack:**
- **Backend:** Spring Boot 3.x, Java 21, PostgreSQL
- **Frontend:** Next.js 15, React 18, TailwindCSS
- **Deployment:** Render.com (Backend), Vercel (Frontend)
- **Authentication:** JWT-based authentication with role-based access control

**Production URLs:**
- **Frontend:** https://mind-care-zeta.vercel.app/
- **Backend:** https://mindcare-backend-uyos.onrender.com
- **Health Check:** https://mindcare-backend-uyos.onrender.com/api/public/health

---

## 2. Deployment Architecture

```
┌─────────────────┐    HTTPS    ┌─────────────────┐
│                 │   ────────  │                 │
│  Vercel         │             │  Render.com     │
│  (Frontend)     │             │  (Backend)      │
│  Next.js App    │             │  Spring Boot    │
│                 │             │                 │
└─────────────────┘             └─────────────────┘
                                          │
                                          │ SSL
                                          ▼
                                ┌─────────────────┐
                                │                 │
                                │  PostgreSQL     │
                                │  Database       │
                                │  (Render)       │
                                │                 │
                                └─────────────────┘
```

---

## 3. Problems Encountered & Solutions

### Problem 1: Backend Deployment Failure - DocumentService Dependency Injection

**❌ Error:**
```
org.springframework.beans.factory.UnsatisfiedDependencyException: 
Error creating bean with name 'documentController' defined in URL 
[jar:nested:/app/app.jar/!/BOOT-INF/classes!/com/mindcare/connect/controller/DocumentController.class]: 
Unsatisfied dependency expressed through constructor parameter 0: 
Error creating bean with name 'documentService': Injection of autowired dependencies failed
```

**🔍 Root Cause Analysis:**
- DocumentService was trying to inject properties using `@Value` annotations
- Properties were not available in production environment
- Missing bean configuration or circular dependencies

**✅ Solution Applied:**
1. **Fixed Property Injection:**
   ```java
   @Service
   public class DocumentService {
       @Value("${app.base-url:${APP_BASE_URL:http://localhost:8080}}")
       private String baseUrl;
       
       @Value("${storage.local.path:${STORAGE_LOCAL_PATH:./uploads}}")
       private String uploadPath;
   }
   ```

2. **Added Missing Environment Variables in render.yaml:**
   ```yaml
   - key: APP_BASE_URL
     value: "https://mindcare-backend-uyos.onrender.com"
   - key: STORAGE_LOCAL_PATH
     value: "/tmp/uploads"
   - key: STORAGE_MAX_FILE_SIZE
     value: "10485760"
   ```

**🎯 Result:** DocumentService bean creation successful, backend deployment completed.

---

### Problem 2: Duplicate Health Endpoint Mappings

**❌ Error:**
```
Spring Boot startup failure due to ambiguous mapping. 
Cannot map 'healthController' method public ResponseEntity HealthController.health() 
to {GET /api/public/health}: There is already 'publicController' bean method 
public ResponseEntity PublicController.healthCheck() mapped.
```

**🔍 Root Cause Analysis:**
Multiple controllers had health endpoints mapping to the same URL:
- HealthController: `@RequestMapping("/public")` + `@GetMapping("/health")` → `/api/public/health`
- PublicController: `@RequestMapping("/public")` + `@GetMapping("/health")` → `/api/public/health`
- AuthController: `@RequestMapping("/auth")` + `@GetMapping("/health")` → `/api/auth/health`
- RootController: `@RequestMapping("/")` + `@GetMapping("/health")` → `/health`

**✅ Solution Applied:**
1. **Removed Duplicate Health Endpoint:**
   ```java
   // REMOVED from PublicController.java
   @GetMapping("/health")
   public ResponseEntity<Map<String, Object>> healthCheck() {
       // This method was deleted
   }
   ```

2. **Kept Single Health Endpoint:**
   ```java
   // KEPT in HealthController.java
   @RestController
   @RequestMapping("/public")
   public class HealthController {
       @GetMapping("/health")
       public ResponseEntity<Map<String, Object>> health() {
           // Implementation kept
       }
   }
   ```

3. **Removed Unnecessary RootController:**
   ```bash
   rm backend/src/main/java/com/mindcare/connect/controller/RootController.java
   ```

**🎯 Result:** Spring Boot startup successful with single health endpoint at `/api/public/health`.

---

### Problem 3: API Path Inconsistency - Double /api Prefix

**❌ Issue:**
```
Frontend calls: https://mindcare-backend-uyos.onrender.com/api/api/auth/login (404 Not Found)
Double /api prefix in production URLs causing 404 errors
```

**🔍 Root Cause Analysis:**
- **Backend Configuration:** `server.servlet.context-path=/api` in `application.properties`
- **Controller Mapping:** `@RequestMapping("/auth")` in AuthController
- **Frontend API Calls:** `${API_BASE_URL}/api/auth/login`
- **Final URL:** Base + Context + Controller + Method = `/api` + `/api` + `/auth/login` = `/api/api/auth/login`

**✅ Solution Applied:**
1. **Kept Context Path (Working Solution):**
   ```properties
   # application.properties
   server.servlet.context-path=/api
   ```

2. **Removed /api Prefix from Controller Mappings:**
   ```java
   // AuthController.java
   @RequestMapping("/auth")  // NOT /api/auth
   
   // AdminController.java  
   @RequestMapping("/admin") // NOT /api/admin
   
   // ProfessionalController.java
   @RequestMapping("/professional") // NOT /api/professional
   
   // PublicController.java
   @RequestMapping("/public") // NOT /api/public
   ```

3. **Updated SecurityConfig to Match:**
   ```java
   .authorizeHttpRequests(authz -> authz
       .requestMatchers("/auth/**").permitAll()
       .requestMatchers("/public/**").permitAll()
       .requestMatchers("/admin/**").hasRole("ADMIN")
       .requestMatchers("/professional/**").hasAnyRole("PATIENT", "PROFESSIONAL", "ADMIN")
       // ...
   )
   ```

4. **Frontend API Calls Remained Same:**
   ```javascript
   // api.js - These work correctly now
   await api.post('/api/auth/login', credentials);
   await api.get('/api/professional/verification/status');
   ```

**🎯 Result:** Clean API URLs without double prefix. Frontend calls `/api/auth/login` → Backend serves at `/api/auth/login` ✅

---

### Problem 4: CORS Configuration Issues

**❌ Error:**
```
Access to fetch at 'https://mindcare-backend-uyos.onrender.com/api/auth/login' 
from origin 'https://mind-care-zeta.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check
```

**🔍 Root Cause Analysis:**
- CORS origins didn't include actual production frontend URLs
- Missing PATCH method in allowed methods
- Incorrect Vercel domain in CORS configuration

**✅ Solution Applied:**
1. **Updated CORS Configuration:**
   ```java
   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
       CorsConfiguration configuration = new CorsConfiguration();
       
       // Parse allowed origins from environment variable
       List<String> origins = Arrays.asList(allowedOrigins.split(","));
       configuration.setAllowedOrigins(origins);
       
       // Added PATCH method
       configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
       configuration.setAllowedHeaders(Arrays.asList("*"));
       configuration.setAllowCredentials(true);
       configuration.setExposedHeaders(Arrays.asList("Authorization"));
       configuration.setMaxAge(3600L);
       
       UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
       source.registerCorsConfiguration("/**", configuration);
       return source;
   }
   ```

2. **Updated Environment Variables:**
   ```yaml
   # render.yaml
   - key: CORS_ALLOWED_ORIGINS
     value: "https://mind-care-zeta.vercel.app,https://mind-care-git-master-raiyanfzs845-3659s-projects.vercel.app"
   ```

3. **Updated Production Properties:**
   ```properties
   # application-production.properties
   cors.allowed.origins=${CORS_ALLOWED_ORIGINS:https://mind-care-zeta.vercel.app}
   ```

**🎯 Result:** CORS working correctly, frontend can communicate with backend in production.

---

### Problem 5: Professional Verification Authorization

**❌ Error:**
```
403 Forbidden for /api/professional/verification/status
User with PATIENT role cannot access professional endpoints
XMLHttpRequest at 'https://mindcare-backend-uyos.onrender.com/api/professional/verification/status' 
has been blocked by CORS policy
```

**🔍 Root Cause Analysis:**
- **SecurityConfig:** Required `hasAnyRole("PROFESSIONAL", "ADMIN")` for `/professional/**`
- **User Role:** Regular users only had `PATIENT` role after registration
- **Method Security:** `@PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")` was overridden by URL-level security
- **Logic:** Users with PATIENT role should be able to submit professional verification applications

**✅ Solution Applied:**
1. **Updated SecurityConfig to Allow PATIENT Role:**
   ```java
   .authorizeHttpRequests(authz -> authz
       // Professional endpoints - Allow PATIENT role for verification applications
       .requestMatchers("/professional/**").hasAnyRole("PATIENT", "PROFESSIONAL", "ADMIN")
       // ...
   )
   ```

2. **Verified Method-Level Security Still Works:**
   ```java
   // ProfessionalController.java
   @PostMapping("/verification/apply")
   @PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")
   public ResponseEntity<?> applyForVerification(/*...*/) { /*...*/ }
   
   @GetMapping("/verification/status")
   @PreAuthorize("hasRole('PATIENT') or hasRole('PROFESSIONAL')")
   public ResponseEntity<?> getVerificationStatus(/*...*/) { /*...*/ }
   ```

3. **Confirmed User Role Assignment:**
   ```java
   // User.java constructor
   public User(String firstName, String lastName, String email, String password) {
       // ...
       this.roles.add(Role.PATIENT); // Default role for new users
   }
   ```

**🎯 Result:** Users can successfully submit and check professional verification applications.

---

### Problem 6: Production Environment Configuration

**❌ Issues:**
- Health check path mismatch in render.yaml
- Missing critical environment variables
- Admin password inconsistency between development and production

**🔍 Root Cause Analysis:**
- render.yaml health check path didn't match actual endpoint
- Some environment variables were missing or had wrong names
- Production admin credentials were undefined

**✅ Solution Applied:**
1. **Fixed Health Check Path:**
   ```yaml
   # render.yaml
   healthCheckPath: "/api/public/health"  # Matches actual endpoint
   ```

2. **Added All Required Environment Variables:**
   ```yaml
   envVars:
     - key: SPRING_PROFILES_ACTIVE
       value: production
     - key: SPRING_DATASOURCE_URL
       value: jdbc:postgresql://dpg-d2h2jf75r7bs73fl9k1g-a.oregon-postgres.render.com/mindcare_iky2?sslmode=require
     - key: SPRING_DATASOURCE_USERNAME
       value: mindcare_user
     - key: SPRING_DATASOURCE_PASSWORD
       value: tECpz6lKn0b0hIqTWNsbTE1U26UoCQQh
     - key: JWT_SECRET_KEY
       value: MindCare_Connect_Super_Secret_Key_2025_Bangladesh_Mental_Health_Platform_Production_256_Bit_Key
     - key: JWT_EXPIRATION
       value: "86400000"
     - key: ADMIN_EMAIL
       value: admin@mindcareconnect.bd
     - key: ADMIN_PASSWORD
       value: MindCare@AdminProd2025!
     - key: CORS_ALLOWED_ORIGINS
       value: "https://mind-care-zeta.vercel.app,https://mind-care-git-master-raiyanfzs845-3659s-projects.vercel.app"
     - key: PORT
       value: "8080"
     - key: APP_BASE_URL
       value: "https://mindcare-backend-uyos.onrender.com"
     - key: STORAGE_LOCAL_PATH
       value: "/tmp/uploads"
     - key: STORAGE_MAX_FILE_SIZE
       value: "10485760"
   ```

3. **Updated Frontend Environment:**
   ```json
   // vercel.json
   {
     "framework": "nextjs",
     "env": {
       "NEXT_PUBLIC_API_URL": "https://mindcare-backend-uyos.onrender.com",
       "NEXT_PUBLIC_ENVIRONMENT": "production"
     }
   }
   ```

**🎯 Result:** All environment variables properly configured, health checks passing, admin access working.

---

## 4. Final Configuration

### Backend Configuration (Working)

**application.properties:**
```properties
# Server Configuration
server.port=${PORT:8080}
server.servlet.context-path=/api

# Development Database (H2)
spring.datasource.url=jdbc:h2:mem:mindcare_connect
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# H2 Console (Development only)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JWT Configuration
jwt.secret.key=${JWT_SECRET_KEY:MindCare_Connect_Secret_Key_2025_Bangladesh_Mental_Health_Development}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Admin Configuration
admin.email=${ADMIN_EMAIL:admin@mindcareconnect.bd}
admin.password=${ADMIN_PASSWORD:MindCare@Admin2025}

# CORS Configuration
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Security Configuration
security.password.min-length=8
security.session.timeout=1800
security.max-login-attempts=5
```

**application-production.properties:**
```properties
# Production Database Configuration
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool Configuration for Render Free Tier
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.validation-timeout=5000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000

# H2 Console (Disabled in production)
spring.h2.console.enabled=false

# JPA Configuration for PostgreSQL
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Production JWT Configuration
jwt.secret.key=${JWT_SECRET_KEY}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Production Admin Configuration
admin.email=${ADMIN_EMAIL}
admin.password=${ADMIN_PASSWORD}

# Production CORS Configuration
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:https://mind-care-zeta.vercel.app}

# Storage Configuration for Production
app.base-url=${APP_BASE_URL:https://mindcare-backend-uyos.onrender.com}
storage.local.path=${STORAGE_LOCAL_PATH:/tmp/uploads}
storage.max.file.size=${STORAGE_MAX_FILE_SIZE:10485760}

# Security Configuration
security.password.min-length=8
security.session.timeout=1800
security.max-login-attempts=5

# Additional security headers for production
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=none
```

### Frontend Configuration (Working)

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  images: {
    unoptimized: false,
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001', '*.vercel.app']
    },
  },
  
  reactStrictMode: true,
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

**vercel.json:**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://mindcare-backend-uyos.onrender.com",
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "https://mindcare-backend-uyos.onrender.com"
    }
  }
}
```

---

## 5. Security Configuration

### SecurityConfig.java (Final Working Version)

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(@Lazy JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, UserDetailsService userDetailsService) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/public/**").permitAll()
                        .requestMatchers("/health").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        
                        // Admin only endpoints
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        
                        // Professional endpoints - Allow PATIENT role for verification applications
                        .requestMatchers("/professional/**").hasAnyRole("PATIENT", "PROFESSIONAL", "ADMIN")
                        
                        // Patient endpoints (authenticated users)
                        .requestMatchers("/patient/**").hasAnyRole("PATIENT", "PROFESSIONAL", "ADMIN")
                        .requestMatchers("/appointments/**").hasAnyRole("PATIENT", "PROFESSIONAL", "ADMIN")
                        .requestMatchers("/wellness/**").hasAnyRole("PATIENT", "PROFESSIONAL", "ADMIN")
                        
                        // Community moderation
                        .requestMatchers("/community/moderate/**").hasAnyRole("MODERATOR", "ADMIN")
                        .requestMatchers("/community/**").hasAnyRole("PATIENT", "PROFESSIONAL", "MODERATOR", "ADMIN")
                        
                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider(userDetailsService))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Parse allowed origins from environment variable
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setMaxAge(3600L); // 1 hour cache for preflight requests
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

---

## 6. API Mapping Documentation

### Complete API Endpoint Mapping

| **Controller** | **Base Mapping** | **Method** | **Full URL** | **Roles Required** |
|----------------|------------------|------------|--------------|-------------------|
| **AuthController** | `/auth` | `POST /login` | `/api/auth/login` | Public |
| | | `POST /register` | `/api/auth/register` | Public |
| | | `POST /refresh-token` | `/api/auth/refresh-token` | Authenticated |
| | | `POST /logout` | `/api/auth/logout` | Authenticated |
| | | `GET /health` | `/api/auth/health` | Public |
| **AdminController** | `/admin` | `GET /verifications` | `/api/admin/verifications` | ADMIN |
| | | `POST /verifications/{id}/approve` | `/api/admin/verifications/{id}/approve` | ADMIN |
| | | `POST /verifications/{id}/reject` | `/api/admin/verifications/{id}/reject` | ADMIN |
| | | `POST /verifications/upload-csv` | `/api/admin/verifications/upload-csv` | ADMIN |
| | | `GET /pre-approved-professionals` | `/api/admin/pre-approved-professionals` | ADMIN |
| **ProfessionalController** | `/professional` | `POST /verification/apply` | `/api/professional/verification/apply` | PATIENT, PROFESSIONAL |
| | | `GET /verification/status` | `/api/professional/verification/status` | PATIENT, PROFESSIONAL |
| | | `GET /verification/track/{id}` | `/api/professional/verification/track/{id}` | PATIENT, PROFESSIONAL |
| **PublicController** | `/public` | `GET /wellness-hub` | `/api/public/wellness-hub` | Public |
| | | `GET /professionals` | `/api/public/professionals` | Public |
| | | `POST /ai-assessment` | `/api/public/ai-assessment` | Public |
| | | `GET /faq` | `/api/public/faq` | Public |
| | | `GET /platform-info` | `/api/public/platform-info` | Public |
| **HealthController** | `/public` | `GET /health` | `/api/public/health` | Public |
| **DocumentController** | `/documents` | `POST /upload` | `/api/documents/upload` | PATIENT, PROFESSIONAL |

### Frontend API Service Methods

```javascript
// api.js - Frontend API calls that map to backend endpoints

// Authentication
await api.post('/api/auth/login', credentials);        // → AuthController.login()
await api.post('/api/auth/register', userData);        // → AuthController.register()

// Professional Verification
await api.post('/api/professional/verification/apply', data);    // → ProfessionalController.apply()
await api.get('/api/professional/verification/status');          // → ProfessionalController.getStatus()
await api.get('/api/professional/verification/track/${id}');     // → ProfessionalController.track()

// Admin Operations
await api.get('/api/admin/verifications');                       // → AdminController.getPending()
await api.post('/api/admin/verifications/${id}/approve');        // → AdminController.approve()
await api.post('/api/admin/verifications/${id}/reject');         // → AdminController.reject()

// Public Endpoints
await api.get('/api/public/health');                            // → HealthController.health()
await api.get('/api/public/wellness-hub');                      // → PublicController.getWellnessHub()

// Document Upload
await api.post('/api/documents/upload', formData);              // → DocumentController.upload()
```

---

## 7. Environment Variables

### Production Environment Variables (render.yaml)

```yaml
envVars:
  # Spring Configuration
  - key: SPRING_PROFILES_ACTIVE
    value: production
    
  # Database Configuration
  - key: SPRING_DATASOURCE_URL
    value: jdbc:postgresql://dpg-d2h2jf75r7bs73fl9k1g-a.oregon-postgres.render.com/mindcare_iky2?sslmode=require
  - key: SPRING_DATASOURCE_USERNAME
    value: mindcare_user
  - key: SPRING_DATASOURCE_PASSWORD
    value: tECpz6lKn0b0hIqTWNsbTE1U26UoCQQh
    
  # JWT Configuration
  - key: JWT_SECRET_KEY
    value: MindCare_Connect_Super_Secret_Key_2025_Bangladesh_Mental_Health_Platform_Production_256_Bit_Key
  - key: JWT_EXPIRATION
    value: "86400000"
    
  # Admin Configuration
  - key: ADMIN_EMAIL
    value: admin@mindcareconnect.bd
  - key: ADMIN_PASSWORD
    value: MindCare@AdminProd2025!
    
  # CORS Configuration
  - key: CORS_ALLOWED_ORIGINS
    value: "https://mind-care-zeta.vercel.app,https://mind-care-git-master-raiyanfzs845-3659s-projects.vercel.app"
    
  # Server Configuration
  - key: PORT
    value: "8080"
  - key: APP_BASE_URL
    value: "https://mindcare-backend-uyos.onrender.com"
    
  # Storage Configuration
  - key: STORAGE_LOCAL_PATH
    value: "/tmp/uploads"
  - key: STORAGE_MAX_FILE_SIZE
    value: "10485760"
```

### Development Environment Variables

```properties
# Automatically set by application.properties for development
JWT_SECRET_KEY=MindCare_Connect_Secret_Key_2025_Bangladesh_Mental_Health_Development
JWT_EXPIRATION=86400000
ADMIN_EMAIL=admin@mindcareconnect.bd
ADMIN_PASSWORD=MindCare@Admin2025
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables (Vercel)

```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://mindcare-backend-uyos.onrender.com",
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  }
}
```

---

## 8. Admin Credentials

### Production Admin Access

**Admin Login Credentials:**
- **Email:** `admin@mindcareconnect.bd`
- **Password:** `MindCare@AdminProd2025!`

**Admin Dashboard URL:**
- **Production:** https://mind-care-zeta.vercel.app/admin
- **Development:** http://localhost:3000/admin

### Development Admin Access

**Admin Login Credentials:**
- **Email:** `admin@mindcareconnect.bd`
- **Password:** `MindCare@Admin2025`

### Admin Capabilities

1. **Professional Verification Management:**
   - View all pending verification applications
   - Approve/reject professional applications
   - View verification statistics
   - Upload pre-approved professionals CSV

2. **System Administration:**
   - Access to all system endpoints
   - Database administration through Spring Boot admin endpoints
   - Log monitoring and health checks

---

## 9. Testing Procedures

### Health Check Testing

```bash
# Production Health Check
curl https://mindcare-backend-uyos.onrender.com/api/public/health

# Expected Response:
{
  "status": "UP",
  "timestamp": "2025-09-03T...",
  "service": "MindCare Backend",
  "version": "1.0.0"
}
```

### Authentication Testing

```bash
# Test User Registration
curl -X POST https://mindcare-backend-uyos.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "phone": "+8801234567890"
  }'

# Test User Login
curl -X POST https://mindcare-backend-uyos.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Professional Verification Testing

```bash
# Test Professional Application (requires JWT token)
curl -X POST https://mindcare-backend-uyos.onrender.com/api/professional/verification/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "professionalType": "PSYCHOLOGIST",
    "specialization": "Clinical Psychology",
    "bmdcNumber": "12345",
    "degreeTitle": "Master of Psychology",
    "degreeInstitution": "University of Dhaka",
    "experienceYears": 5,
    "licenseDocumentUrl": "https://example.com/license.pdf"
  }'
```

### Frontend Testing Checklist

- [ ] Homepage loads successfully
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Professional verification form submission works
- [ ] Admin verification approval/rejection works
- [ ] Responsive design works on mobile/desktop
- [ ] All API endpoints return expected responses

---

## 10. Future Maintenance Guidelines

### 🔮 Preventing Future Issues

#### 1. API Consistency Rules
- **NEVER change context path without updating all related configurations**
- **Always verify frontend API calls match backend endpoint mappings**
- **Test both development and production environments after any API changes**
- **Use consistent naming conventions between frontend and backend**

#### 2. Deployment Best Practices
- **Environment Parity:** Keep development and production as similar as possible
- **Environment Variables:** Always use environment variables for configuration
- **Health Checks:** Ensure health endpoint matches deployment platform expectations
- **CORS Configuration:** Always include actual production domains in CORS origins

#### 3. Security Maintenance
- **Role-based Access:** Test with actual user roles, not just admin
- **JWT Configuration:** Regularly rotate JWT secret keys in production
- **Password Policies:** Enforce strong password requirements
- **Security Headers:** Keep security headers updated for latest best practices

#### 4. Database Maintenance
- **Connection Pooling:** Monitor database connection usage
- **Schema Updates:** Use `spring.jpa.hibernate.ddl-auto=update` in production
- **Backup Strategy:** Implement regular database backups
- **Performance Monitoring:** Monitor query performance and optimize as needed

#### 5. Monitoring and Alerts
- **Health Monitoring:** Set up alerts for health check failures
- **Error Tracking:** Implement error tracking (e.g., Sentry)
- **Performance Monitoring:** Monitor API response times
- **Log Aggregation:** Centralize logs from both frontend and backend

### 🚨 Emergency Procedures

#### If Health Checks Fail:
1. Check backend logs in Render dashboard
2. Verify environment variables are set correctly
3. Ensure database connection is working
4. Check if context path changes broke health endpoint

#### If CORS Errors Occur:
1. Verify frontend domain in CORS_ALLOWED_ORIGINS
2. Check if frontend deployment changed domains
3. Ensure all HTTP methods are allowed in CORS config
4. Verify credentials and headers are properly configured

#### If Authentication Fails:
1. Check JWT secret key in production environment
2. Verify token expiration settings
3. Check user roles and permissions
4. Ensure SecurityConfig paths match controller mappings

#### If API Endpoints Return 404:
1. Verify controller request mappings
2. Check if context path configuration is consistent
3. Ensure frontend API calls use correct base URL
4. Verify SecurityConfig permits access to endpoints

### 📚 Documentation Updates

When making changes, always update:
- [ ] This deployment documentation
- [ ] API endpoint documentation
- [ ] Environment variable documentation
- [ ] Security role documentation
- [ ] Testing procedures

### 🔄 Regular Maintenance Tasks

**Weekly:**
- Check health endpoints are responding
- Verify SSL certificates are valid
- Monitor database performance
- Review error logs

**Monthly:**
- Review and update dependencies
- Check security vulnerabilities
- Update environment variables if needed
- Review access logs

**Quarterly:**
- Rotate JWT secret keys
- Review and update security configurations
- Perform penetration testing
- Update documentation

---

## 📞 Support Information

**Project Repository:** https://github.com/RaiZen094/MindCare  
**Documentation Location:** `/DEPLOYMENT-DOCUMENTATION.md`  
**Last Updated:** September 3, 2025  
**Status:** ✅ Production Ready  

**Production URLs:**
- **Frontend:** https://mind-care-zeta.vercel.app/
- **Backend:** https://mindcare-backend-uyos.onrender.com
- **Health Check:** https://mindcare-backend-uyos.onrender.com/api/public/health

---

**🎉 The MindCare Connect application is now fully functional in both development and production environments with consistent API mappings, proper authentication, and secure CORS configuration.**

@echo off
REM PostgreSQL Database Setup Script for MindCare Connect (Windows)

echo 🗄️ Setting up PostgreSQL for MindCare Connect...

REM Database configuration
set DB_NAME=mindcare_connect
set DB_USER=mindcare_user
set /p DB_PASSWORD="Enter password for database user (leave blank for auto-generated): "

if "%DB_PASSWORD%"=="" (
    REM Generate random password
    for /f %%i in ('powershell -command "[System.Web.Security.Membership]::GeneratePassword(16,4)"') do set DB_PASSWORD=%%i
    echo Generated password: %DB_PASSWORD%
)

echo.
echo Database configuration:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Password: [HIDDEN]

echo.
echo 📋 Creating database and user...

REM Create database (you may need to run this as postgres user)
createdb -U postgres %DB_NAME% 2>nul
if errorlevel 1 echo ⚠️ Database may already exist

REM Create user and set permissions
psql -U postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';" 2>nul
if errorlevel 1 (
    echo ⚠️ User may already exist, updating password...
    psql -U postgres -c "ALTER USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"
)

psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"
psql -U postgres -c "ALTER DATABASE %DB_NAME% OWNER TO %DB_USER%;"

REM Run initialization script
if exist "database\init.sql" (
    echo 📝 Running database initialization script...
    set PGPASSWORD=%DB_PASSWORD%
    psql -h localhost -U %DB_USER% -d %DB_NAME% -f database\init.sql
    echo ✅ Database schema created successfully
) else (
    echo ⚠️ Database initialization script not found at database\init.sql
)

REM Create environment configuration file
echo 📋 Creating environment configuration...
(
echo # Database Configuration - PostgreSQL Production
echo DATABASE_URL=jdbc:postgresql://localhost:5432/%DB_NAME%
echo DATABASE_USERNAME=%DB_USER%
echo DATABASE_PASSWORD=%DB_PASSWORD%
echo DATABASE_DRIVER=org.postgresql.Driver
echo HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect
echo.
echo # JPA Configuration
echo JPA_DDL_AUTO=update
echo JPA_SHOW_SQL=false
echo JPA_FORMAT_SQL=false
echo H2_CONSOLE_ENABLED=false
echo.
echo # Connection Pool Configuration
echo DB_POOL_SIZE=20
echo DB_POOL_MIN_IDLE=5
echo DB_CONNECTION_TIMEOUT=30000
echo DB_IDLE_TIMEOUT=600000
echo DB_MAX_LIFETIME=1800000
echo.
echo # JWT Configuration ^(CHANGE THESE IN PRODUCTION!^)
echo JWT_SECRET=CHANGE_THIS_JWT_SECRET_IN_PRODUCTION_%RANDOM%%RANDOM%
echo JWT_EXPIRATION=86400000
echo.
echo # CORS Configuration ^(UPDATE WITH YOUR DOMAIN^)
echo CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
echo.
echo # Admin Configuration ^(CHANGE THESE IN PRODUCTION!^)
echo ADMIN_EMAIL=admin@mindcareconnect.bd
echo ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD_%RANDOM%
echo.
echo # API Configuration ^(UPDATE WITH YOUR DOMAIN^)
echo API_URL=https://api.yourdomain.com
echo.
echo # Spring Profile
echo SPRING_PROFILES_ACTIVE=production
) > .env.production

echo.
echo ✅ PostgreSQL setup completed successfully!
echo.
echo ⚠️ IMPORTANT SECURITY NOTES:
echo 1. 🔑 Update JWT_SECRET in .env.production with a secure value
echo 2. 🔐 Update ADMIN_PASSWORD in .env.production with a secure password  
echo 3. 🌐 Update CORS_ALLOWED_ORIGINS and API_URL with your actual domain
echo 4. 🗄️ Database Password: %DB_PASSWORD%
echo 5. 📁 Configuration saved to: .env.production
echo.
echo 🚀 Your PostgreSQL database is ready for MindCare Connect!

REM Test connection
echo 📡 Testing database connection...
set PGPASSWORD=%DB_PASSWORD%
psql -h localhost -U %DB_USER% -d %DB_NAME% -c "SELECT version();" >nul 2>&1
if errorlevel 1 (
    echo ❌ Database connection test failed
    pause
    exit /b 1
) else (
    echo ✅ Database connection test successful
)

pause

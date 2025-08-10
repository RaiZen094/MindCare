@echo off
REM MindCare Connect - Windows Development with Docker

echo 🏗️ Starting MindCare Connect Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

REM Create development environment file if it doesn't exist
if not exist ".env" (
    echo 📋 Creating development environment file...
    copy .env.dev .env
    echo ⚠️ Using development configuration. Edit .env for custom settings.
)

REM Stop any running containers
echo 🛑 Stopping any existing containers...
docker-compose down 2>nul

REM Build and start development environment
echo 🚀 Building and starting development environment...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Health checks
echo 🔍 Performing health checks...

REM Check backend
curl -f http://localhost:8080/api/public/health >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Backend might not be ready yet
) else (
    echo ✅ Backend is ready
)

REM Check frontend
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Frontend might not be ready yet
) else (
    echo ✅ Frontend is ready
)

echo.
echo 🎉 Development environment is ready!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8080/api
echo 🗄️ Database Console: http://localhost:8080/api/h2-console
echo 📊 Nginx: http://localhost
echo.
echo 📋 Default Admin Credentials:
echo    Email: admin@localhost
echo    Password: admin123
echo.
echo 🛠️ Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart: docker-compose restart
echo    Rebuild: docker-compose up --build
echo.
echo 🚀 Happy coding!
pause

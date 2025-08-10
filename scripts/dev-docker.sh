#!/bin/bash

# MindCare Connect - Local Development with Docker
# This script sets up the development environment using Docker

set -e

echo "🏗️ Starting MindCare Connect Development Environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_warning "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create development environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating development environment file..."
    cp .env.dev .env
    print_warning "Using development configuration. Edit .env for custom settings."
fi

# Stop any running containers
print_status "Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start development environment
print_status "Building and starting development environment..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check database
if docker-compose exec -T database pg_isready -U mindcare_user -d mindcare_connect > /dev/null 2>&1; then
    print_status "✅ Database is ready"
else
    print_warning "⚠️ Database might not be ready yet"
fi

# Check backend
if curl -f http://localhost:8080/api/public/health > /dev/null 2>&1; then
    print_status "✅ Backend is ready"
else
    print_warning "⚠️ Backend might not be ready yet"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Frontend is ready"
else
    print_warning "⚠️ Frontend might not be ready yet"
fi

print_status "🎉 Development environment is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080/api"
echo "🗄️ Database Console: http://localhost:8080/api/h2-console"
echo "📊 Nginx: http://localhost"
echo ""
echo "📋 Default Admin Credentials:"
echo "   Email: admin@localhost"
echo "   Password: admin123"
echo ""
echo "🛠️ Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Rebuild: docker-compose up --build"
echo ""
print_status "Happy coding! 🚀"

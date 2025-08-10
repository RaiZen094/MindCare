#!/bin/bash

# PostgreSQL Database Setup Script for MindCare Connect
# This script sets up PostgreSQL database and user for production

set -e

echo "🗄️ Setting up PostgreSQL for MindCare Connect..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Database configuration
DB_NAME="mindcare_connect"
DB_USER="mindcare_user"
DB_PASSWORD="${DATABASE_PASSWORD:-mindcare_secure_password_$(date +%s)}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"

print_status "Database configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Password: [HIDDEN]"

# Prompt for postgres password
echo ""
print_warning "You will be prompted for the PostgreSQL admin password"

# Create database and user
print_status "Creating database and user..."

# Create database
sudo -u postgres createdb "$DB_NAME" 2>/dev/null || {
    print_warning "Database '$DB_NAME' may already exist"
}

# Create user and set password
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
    print_warning "User '$DB_USER' may already exist"
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
}

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

# Run initialization script
if [ -f "database/init.sql" ]; then
    print_status "Running database initialization script..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/init.sql
    print_status "Database schema created successfully"
else
    print_warning "Database initialization script not found at database/init.sql"
fi

# Create .env file with database configuration
print_status "Creating environment configuration..."
cat > .env.production << EOF
# Database Configuration - PostgreSQL Production
DATABASE_URL=jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME
DATABASE_USERNAME=$DB_USER
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_DRIVER=org.postgresql.Driver
HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect

# JPA Configuration
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_FORMAT_SQL=false
H2_CONSOLE_ENABLED=false

# Connection Pool Configuration
DB_POOL_SIZE=20
DB_POOL_MIN_IDLE=5
DB_CONNECTION_TIMEOUT=30000
DB_IDLE_TIMEOUT=600000
DB_MAX_LIFETIME=1800000

# JWT Configuration (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=CHANGE_THIS_JWT_SECRET_IN_PRODUCTION_$(openssl rand -base64 32)
JWT_EXPIRATION=86400000

# CORS Configuration (UPDATE WITH YOUR DOMAIN)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Admin Configuration (CHANGE THESE IN PRODUCTION!)
ADMIN_EMAIL=admin@mindcareconnect.bd
ADMIN_PASSWORD=CHANGE_THIS_ADMIN_PASSWORD_$(openssl rand -base64 12)

# API Configuration (UPDATE WITH YOUR DOMAIN)
API_URL=https://api.yourdomain.com

# Spring Profile
SPRING_PROFILES_ACTIVE=production
EOF

print_status "✅ PostgreSQL setup completed successfully!"
echo ""
print_warning "IMPORTANT SECURITY NOTES:"
echo "1. 🔑 Update JWT_SECRET in .env.production with a secure value"
echo "2. 🔐 Update ADMIN_PASSWORD in .env.production with a secure password"
echo "3. 🌐 Update CORS_ALLOWED_ORIGINS and API_URL with your actual domain"
echo "4. 🗄️ Database Password: $DB_PASSWORD"
echo "5. 📁 Configuration saved to: .env.production"
echo ""
print_status "🚀 Your PostgreSQL database is ready for MindCare Connect!"

# Test connection
print_status "Testing database connection..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    print_status "✅ Database connection test successful"
else
    print_error "❌ Database connection test failed"
    exit 1
fi

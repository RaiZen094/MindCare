#!/bin/bash

# MindCare Connect - VM Deployment Script
# This script sets up the production environment on a VM

set -e

echo "🚀 Starting MindCare Connect VM Deployment..."

# Configuration
APP_DIR="/opt/mindcare-connect"
DOCKER_COMPOSE_VERSION="2.20.0"
NODE_VERSION="18"
JAVA_VERSION="21"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Install Node.js (for potential local builds)
print_status "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed successfully"
else
    print_status "Node.js already installed"
fi

# Install Java (for potential local builds)
print_status "Installing Java..."
if ! command -v java &> /dev/null; then
    sudo apt install -y openjdk-${JAVA_VERSION}-jdk
    print_status "Java installed successfully"
else
    print_status "Java already installed"
fi

# Install Nginx (if not using containerized version)
print_status "Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    print_status "Nginx installed successfully"
else
    print_status "Nginx already installed"
fi

# Install certbot for SSL certificates
print_status "Installing Certbot for SSL..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    print_status "Certbot installed successfully"
else
    print_status "Certbot already installed"
fi

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone repository (if not already present)
if [ ! -d "$APP_DIR/.git" ]; then
    print_status "Cloning repository..."
    cd $APP_DIR
    # Replace with your actual repository URL
    git clone https://github.com/yourusername/mindcare-connect.git .
else
    print_status "Repository already exists, pulling latest changes..."
    cd $APP_DIR
    git pull origin main
fi

# Create environment file
print_status "Setting up environment configuration..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp $APP_DIR/.env.example $APP_DIR/.env
    print_warning "Please edit $APP_DIR/.env with your production values"
    print_warning "Don't forget to set secure passwords and JWT secrets!"
fi

# Create SSL directory
print_status "Setting up SSL directory..."
sudo mkdir -p $APP_DIR/ssl
sudo chown $USER:$USER $APP_DIR/ssl

# Set up firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create systemd service for auto-restart
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/mindcare-connect.service > /dev/null <<EOF
[Unit]
Description=MindCare Connect Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable mindcare-connect.service

# Create backup script
print_status "Creating backup script..."
sudo tee /usr/local/bin/mindcare-backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/opt/backups/mindcare"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup database
docker exec mindcare-database-prod pg_dump -U mindcare_user mindcare_connect > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz -C /opt mindcare-connect

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

sudo chmod +x /usr/local/bin/mindcare-backup.sh

# Set up daily backup cron job
print_status "Setting up daily backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mindcare-backup.sh") | crontab -

# Create monitoring script
print_status "Creating monitoring script..."
sudo tee /usr/local/bin/mindcare-monitor.sh > /dev/null <<EOF
#!/bin/bash
# Health check script for MindCare Connect

APP_URL="http://localhost/health"
EMAIL="admin@yourdomain.com"

if ! curl -f \$APP_URL > /dev/null 2>&1; then
    echo "MindCare Connect is down! Attempting restart..." | mail -s "MindCare Connect Alert" \$EMAIL
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml restart
fi
EOF

sudo chmod +x /usr/local/bin/mindcare-monitor.sh

# Set up monitoring cron job (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/mindcare-monitor.sh") | crontab -

print_status "✅ VM deployment setup completed!"
print_warning "Next steps:"
echo "1. Edit $APP_DIR/.env with your production values"
echo "2. Set up SSL certificates: sudo certbot --nginx -d yourdomain.com"
echo "3. Start the application: sudo systemctl start mindcare-connect"
echo "4. Check status: sudo systemctl status mindcare-connect"
echo "5. View logs: docker-compose -f $APP_DIR/docker-compose.prod.yml logs -f"

print_status "🎉 Your VM is ready for MindCare Connect deployment!"

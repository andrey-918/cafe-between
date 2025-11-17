# Deployment Guide

This guide explains how to deploy the Cafe Between application to a VPS using Docker.

## Prerequisites

- VPS with Ubuntu/Debian (recommended)
- Root access or sudo privileges
- Internet connection

### Install Required Software

Update package list and install necessary packages:

```bash
apt update
apt install -y git curl

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

Start and enable Docker service:

```bash
systemctl start docker
systemctl enable docker
```

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/andrey-918/cafe-between.git
cd cafe-between
```

### 2. Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Database Configuration
POSTGRES_DSN=postgres://postgres:your_secure_password_here@db:5432/cafe_between?sslmode=disable
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=8080
JWT_SECRET=your_jwt_secret_here

# Frontend Configuration
FRONTEND_HTTP_PORT=80
FRONTEND_HTTPS_PORT=443
```

**Important:** The `.env` file is already in `.gitignore`, so it won't be committed to the repository. The `docker-compose.yml` uses environment variables from this file.

### 4. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check if services are running
docker-compose ps
```

### 5. Run Database Migrations

The database migrations are automatically applied when the database container starts (via init scripts in `/docker-entrypoint-initdb.d`).

If you need to run additional migrations manually:

```bash
# Run migrations manually (if needed)
docker-compose exec backend ./migrate
```

### 6. Access the Application

- Frontend: `https://karganov-online.ru`
- Backend API: `https://karganov-online.ru/api`

## Production Considerations

### Security
- Change default PostgreSQL password
- Use strong JWT secret
- Configure firewall to only allow necessary ports (80, 443, 22)
- SSL certificate is configured in nginx (replace snakeoil certs with real ones from Let's Encrypt)

#### SSL Certificate Setup (Let's Encrypt)

Install certbot:

```bash
apt install -y certbot
```

Generate certificate (replace with your actual domain):

```bash
certbot certonly --standalone -d karganov-online.ru
```

Update nginx configuration to use real certificates:

```bash
# Edit frontend/nginx.conf and replace:
ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
ssl_certificate_key /etc/ssl/private/ssl-cert-key-snakeoil.key;

# With:
ssl_certificate /etc/letsencrypt/live/karganov-online.ru/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/karganov-online.ru/privkey.pem;
```

Restart services:

```bash
docker-compose restart frontend
```

### Database
- Regular backups of PostgreSQL data
- Monitor database performance
- Consider using managed PostgreSQL for production

### Monitoring
- Set up logs monitoring
- Configure health checks
- Monitor resource usage

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up -d --build
```

### Domain Configuration

Make sure your domain `karganov-online.ru` points to your VPS IP address. Update DNS records:

- A record: `karganov-online.ru` -> YOUR_VPS_IP
- A record: `www.karganov-online.ru` -> YOUR_VPS_IP (optional)

## Troubleshooting

### Check Logs
```bash
# View all service logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Database Connection Issues
- Ensure PostgreSQL is running: `docker-compose ps`
- Check database logs: `docker-compose logs db`
- Verify POSTGRES_DSN in .env file

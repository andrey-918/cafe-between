# Deployment Guide

This guide explains how to deploy the Cafe Between application to a VPS using Docker.

## Prerequisites

- Docker and Docker Compose installed on your VPS
- Git (to clone the repository)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd cafe-between
```

### 2. Environment Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Set a strong PostgreSQL password
- Generate a secure JWT secret
- Update CORS_ORIGIN for your domain (e.g., `https://yourdomain.com`)

### 3. Update Docker Compose for Production

Edit `docker-compose.yml` and replace `your_password_here` with your actual PostgreSQL password in both places.

### 4. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check if services are running
docker-compose ps
```

### 5. Run Database Migrations

```bash
# Run migrations (if needed)
docker-compose exec backend ./migrate
```

### 6. Access the Application

- Frontend: `http://your-vps-ip`
- Backend API: `http://your-vps-ip:8080`

## Production Considerations

### Security
- Change default PostgreSQL password
- Use strong JWT secret
- Configure firewall to only allow necessary ports (80, 443, 22)
- Use HTTPS with SSL certificate (Let's Encrypt recommended)

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

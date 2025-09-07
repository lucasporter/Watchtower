# Development Environment Setup Guide

## Prerequisites

### Windows + WSL Environment
1. **WSL2** - Make sure you have WSL2 installed and configured
2. **Docker Desktop** - Install Docker Desktop for Windows with WSL2 backend enabled
3. **Git** - Ensure Git is available in your WSL environment

### Verify Prerequisites
```bash
# Check WSL version
wsl --version

# Check Docker
docker --version
docker-compose --version

# Check Git
git --version
```

## Project Setup

### 1. Clone/Open the Project
```bash
# Navigate to your project directory
cd /path/to/watchtower

# If you need to clone it
git clone <repository-url>
cd watchtower
```

### 2. Environment Setup
The project uses Docker Compose for all services, so no local Python/Node.js installation is required.

### 3. Start the Development Environment
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d

# To see logs when running in detached mode
docker-compose logs -f
```

### 4. Access the Applications
Once all services are running:

- **Frontend (React)**: http://localhost:5173
- **Backend API (FastAPI)**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs
- **PostgreSQL Database**: localhost:5432
  - Username: `watchtower`
  - Password: `watchtower`
  - Database: `watchtower`

### 5. Database Migrations
The backend includes Alembic for database migrations. Run migrations if needed:
```bash
# Run migrations
docker-compose exec monitor-api alembic upgrade head
```

## Development Workflow

### Making Changes
- **Frontend**: Changes in `frontend/src/` will hot-reload automatically
- **Backend**: Changes in `backend/app/` will restart the FastAPI server
- **Database**: Changes to models require new Alembic migrations

### Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild a specific service
docker-compose build monitor-api

# View logs for a specific service
docker-compose logs monitor-api

# Execute commands in running containers
docker-compose exec monitor-api python -c "print('Hello from container')"
docker-compose exec postgres psql -U watchtower -d watchtower

# Run tests (if available)
docker-compose exec monitor-api python -m pytest
```

### Service Architecture
- **monitor-api**: FastAPI backend server
- **celery-worker**: Background task processing
- **redis**: Message broker for Celery
- **postgres**: PostgreSQL database
- **monitor-ui**: React frontend with Vite

## Troubleshooting

### Common Issues

1. **Port conflicts**: If ports 8080, 5173, or 5432 are already in use:
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :8080
   
   # Modify docker-compose.yml to use different ports
   ```

2. **Docker not starting**: Ensure Docker Desktop is running and WSL2 backend is enabled

3. **Permission issues**: Make sure your WSL user has proper permissions

4. **Database connection issues**: Wait for PostgreSQL to fully start before accessing the API

### Reset Everything
```bash
# Complete reset (removes all containers, volumes, and images)
docker-compose down -v --rmi all
docker system prune -a
```

## Quick Start Script
Create a `start-dev.sh` script for easy startup:
```bash
#!/bin/bash
echo "Starting Watchtower development environment..."
docker-compose up --build
```

Make it executable: `chmod +x start-dev.sh`

## Notes
- The project uses volume mounts for live code reloading
- All services are networked together via `watchtower_net`
- Database data persists in a Docker volume (`pgdata`)
- Frontend uses polling for file watching (better for WSL environments) 

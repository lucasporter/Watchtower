#!/bin/bash

echo "🐕 Starting Watchtower development environment..."
echo "📦 Building and starting all services..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if Docker Compose V2 is available
if ! docker compose version > /dev/null 2>&1; then
    echo "❌ Docker Compose V2 is not available."
    echo ""
    echo "📦 Installing Docker Compose V2..."
    echo ""
    
    # Install Docker Compose V2
    if command -v curl > /dev/null 2>&1; then
        echo "Downloading Docker Compose V2..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        # Verify installation
        if docker compose version > /dev/null 2>&1; then
            echo "✅ Docker Compose V2 installed successfully!"
        else
            echo "❌ Failed to install Docker Compose V2. Please install manually:"
            echo "   https://docs.docker.com/compose/install/"
            exit 1
        fi
    else
        echo "❌ curl is not available. Please install Docker Compose V2 manually:"
        echo "   https://docs.docker.com/compose/install/"
        exit 1
    fi
fi

# Check if user wants to start dummy machines
echo ""
echo "🤖 Do you want to start dummy Linux machines for testing? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "🚀 Starting with dummy machines..."
    # Build and start all services including dummy machines
    docker compose up --build --force-recreate -d
    
    echo ""
    echo "⏳ Waiting for dummy machines to initialize (this may take a minute)..."
    sleep 45
    
    echo ""
    echo "✅ Development environment started with dummy machines!"
    echo ""
    echo "🌐 Access your applications:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:8080"
    echo "   API Docs: http://localhost:8080/docs"
    echo ""
    echo "🤖 Dummy Linux Machines:"
    echo "   Web Server: http://localhost:8081 (SSH: localhost:2221)"
    echo "   App Server: http://localhost:3000 (SSH: localhost:2223)"
    echo "   Load Balancer: http://localhost:8082 (SSH: localhost:2224)"
    echo "   Monitoring Server: http://localhost:9090 (SSH: localhost:2225)"
    echo "   Database Server: MySQL on localhost:3306 (SSH: localhost:2222)"
    echo ""
    echo "🔧 Manage dummy machines: ./manage-dummy-machines.sh"
    echo "📝 SSH password for all machines: password123"
else
    echo "🚀 Starting without dummy machines..."
    # Build and start only the main services
    docker compose up --build --force-recreate -d monitor-api celery-worker redis postgres monitor-ui
    
    echo ""
    echo "✅ Development environment started!"
    echo ""
    echo "🌐 Access your applications:"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend API: http://localhost:8080"
    echo "   API Docs: http://localhost:8080/docs"
    echo ""
    echo "💡 To start dummy machines later: ./manage-dummy-machines.sh start"
fi

echo ""
echo "📝 To stop services: docker compose down"
echo "📝 To view logs: docker compose logs -f" 

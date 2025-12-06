#!/bin/bash

COMMAND=${1:-"status"}

case $COMMAND in
    "start")
        echo "🚀 Starting BookMyTime infrastructure..."
        cd ../infrastructure
        docker-compose up -d
        echo ""
        echo "✅ Infrastructure started"
        ;;
        
    "stop")
        echo "🛑 Stopping BookMyTime infrastructure..."
        cd ../infrastructure
        docker-compose down
        echo "✅ Infrastructure stopped"
        ;;
        
    "restart")
        echo "🔄 Restarting BookMyTime infrastructure..."
        cd ../infrastructure
        docker-compose restart
        echo "✅ Infrastructure restarted"
        ;;
        
    "status")
        echo "🔍 BookMyTime Infrastructure Status"
        echo "==================================="
        
        cd ../infrastructure
        
        # Check Docker Compose services
        echo ""
        echo "📦 Docker Compose Services:"
        docker-compose ps
        
        # Check PostgreSQL
        echo ""
        echo "🐘 PostgreSQL:"
        if docker-compose ps | grep -q "postgres.*Up"; then
            echo "  Status: ✅ Running"
            echo "  Port:   5432"
            echo "  DB:     bookmytime"
            echo "  User:   bookmytime"
            
            # Test connection
            if docker-compose exec -T postgres pg_isready -U bookmytime > /dev/null 2>&1; then
                echo "  Connection: ✅ OK"
            else
                echo "  Connection: ❌ Failed"
            fi
        else
            echo "  Status: ❌ Not running"
        fi
        
        # Check Redis
        echo ""
        echo "🔴 Redis:"
        if docker-compose ps | grep -q "redis.*Up"; then
            echo "  Status: ✅ Running"
            echo "  Port:   6379"
            
            # Test connection
            if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
                echo "  Connection: ✅ OK"
            else
                echo "  Connection: ❌ Failed"
            fi
        else
            echo "  Status: ❌ Not running"
        fi
        
        # Check Spring Boot connection
        echo ""
        echo "⚙️  Spring Boot API:"
        if curl -s http://localhost:8080/api/health > /dev/null; then
            echo "  Status: ✅ Connected"
            echo "  Port:   8080"
            
            # Test database connection
            DB_STATUS=$(curl -s http://localhost:8080/api/database/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
            if [ "$DB_STATUS" = "UP" ]; then
                echo "  Database: ✅ Connected"
            else
                echo "  Database: ❌ Not connected"
            fi
        else
            echo "  Status: ❌ Not running"
        fi
        ;;
        
    "logs")
        echo "📋 Infrastructure logs:"
        cd ../infrastructure
        docker-compose logs -f
        ;;
        
    "clean")
        echo "🧹 Cleaning up infrastructure..."
        cd ../infrastructure
        docker-compose down -v
        echo "✅ All containers and volumes removed"
        ;;
        
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|clean}"
        echo ""
        echo "Commands:"
        echo "  start    - Start infrastructure services"
        echo "  stop     - Stop infrastructure services"
        echo "  restart  - Restart infrastructure services"
        echo "  status   - Show status of all services"
        echo "  logs     - Show logs (follow mode)"
        echo "  clean    - Remove all containers and volumes"
        exit 1
        ;;
esac

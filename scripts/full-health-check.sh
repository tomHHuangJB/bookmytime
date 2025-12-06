#!/bin/bash

echo "🔍 BookMyTime Full Stack Health Check"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

check_service() {
    local name=$1
    local url=$2
    local command=$3
    
    echo -n "${BLUE}$name:${NC} "
    
    if eval "$command" > /dev/null 2>&1; then
        echo "${GREEN}✅ UP${NC}"
        echo "   ↳ $url"
        return 0
    else
        echo "${RED}❌ DOWN${NC}"
        echo "   ↳ $url"
        return 1
    fi
}

echo "📦 Infrastructure Services:"
echo "--------------------------"
check_service "PostgreSQL" "localhost:5432" "docker exec bookmytime-postgres pg_isready -U bookmytime"
check_service "OpenSearch" "http://localhost:9200" "curl -s http://localhost:9200 > /dev/null"
check_service "OpenSearch Dashboards" "http://localhost:5601" "curl -s http://localhost:5601 > /dev/null"
check_service "Redis" "localhost:6379" "docker exec bookmytime-redis redis-cli ping > /dev/null"

echo ""
echo "⚙️  Application Services:"
echo "-----------------------"
check_service "Backend API" "http://localhost:8080/api/health" "curl -s http://localhost:8080/api/health > /dev/null"
check_service "Frontend" "http://localhost:5173" "curl -s http://localhost:5173 > /dev/null"

echo ""
echo "🔗 Connection Tests:"
echo "-------------------"

# Test database connection via backend
echo -n "Database via Backend: "
DB_RESPONSE=$(curl -s http://localhost:8080/api/database/health 2>/dev/null || echo '{"status":"DOWN"}')
if echo "$DB_RESPONSE" | grep -q '"status":"UP"'; then
    echo "${GREEN}✅ Connected${NC}"
else
    echo "${RED}❌ Failed${NC}"
fi

# Test Redis connection via backend
echo -n "Redis via Backend: "
if curl -s http://localhost:8080/api/redis/health > /dev/null 2>&1; then
    echo "${GREEN}✅ Connected${NC}"
else
    echo "${YELLOW}⚠️  Not configured${NC}"
fi

# Test proxy connection
echo -n "Frontend → Backend Proxy: "
if curl -s http://localhost:5173/api/health > /dev/null 2>&1; then
    echo "${GREEN}✅ Working${NC}"
else
    echo "${RED}❌ Failed${NC}"
fi

echo ""
echo "🌐 Access URLs:"
echo "--------------"
echo "${BLUE}Frontend App:${NC}    http://localhost:5173"
echo "${BLUE}Backend API:${NC}     http://localhost:8080"
echo "${BLUE}API Health:${NC}      http://localhost:8080/api/health"
echo "${BLUE}PostgreSQL:${NC}      localhost:5432 (bookmytime/changeme123)"
echo "${BLUE}OpenSearch:${NC}      http://localhost:9200"
echo "${BLUE}OpenSearch UI:${NC}   http://localhost:5601"
echo "${BLUE}Redis:${NC}           localhost:6379"
echo ""

echo "📊 Container Status:"
echo "------------------"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep bookmytime

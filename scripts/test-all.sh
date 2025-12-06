#!/bin/bash

echo "🧪 BookMyTime Integration Test Suite"
echo "==================================="
echo ""

test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    response=$(curl -s -w "%{http_code}" "$url")
    http_code=${response: -3}
    body=${response%???}
    
    if [ "$http_code" = "200" ]; then
        if [ -n "$expected" ] && echo "$body" | grep -q "$expected"; then
            echo "✅ PASS"
            echo "   Response: $body" | head -c 100
            echo "..."
        elif [ -z "$expected" ]; then
            echo "✅ PASS (HTTP 200)"
        else
            echo "⚠️  WARN (Unexpected response)"
            echo "   Got: $body" | head -c 100
        fi
    else
        echo "❌ FAIL (HTTP $http_code)"
        echo "   Response: $body"
    fi
    echo ""
}

# Test infrastructure
test_endpoint "PostgreSQL" "http://localhost:8080/api/database/health" "UP"
test_endpoint "Redis" "http://localhost:8080/api/redis/health" "UP"
test_endpoint "OpenSearch" "http://localhost:8080/api/opensearch/health" "UP"

# Test core API
test_endpoint "Backend Health" "http://localhost:8080/api/health" "OK"
test_endpoint "Actuator Health" "http://localhost:8080/actuator/health" "UP"

# Test proxy
test_endpoint "Frontend Proxy" "http://localhost:5173/api/health" "OK"

echo ""
echo "🌐 Direct Infrastructure Tests:"
echo "-----------------------------"
echo -n "OpenSearch Direct: "
if curl -s http://localhost:9200 > /dev/null; then
    echo "✅ UP"
else
    echo "❌ DOWN"
fi

echo -n "OpenSearch Dashboards: "
if curl -s http://localhost:5601 > /dev/null; then
    echo "✅ UP"
else
    echo "❌ DOWN"
fi

echo ""
echo "📊 Summary:"
echo "----------"
echo "All services should be ✅ GREEN"
echo "If any are ❌ RED, check the service logs"

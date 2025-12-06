#!/bin/bash

echo "🔍 BookMyTime Infrastructure Health Check"
echo "========================================"

# Check Docker
echo -n "Docker: "
if docker info > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running"
    exit 1
fi

echo ""
echo "📦 Container Status:"
echo "-------------------"

# PostgreSQL
echo -n "PostgreSQL: "
if docker ps --format "{{.Names}}" | grep -q "bookmytime-postgres"; then
    echo "✅ Running"
    echo -n "  Connection: "
    if docker exec bookmytime-postgres pg_isready -U bookmytime > /dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ Failed"
    fi
else
    echo "❌ Not running"
fi

# OpenSearch
echo -n "OpenSearch: "
if docker ps --format "{{.Names}}" | grep -q "bookmytime-opensearch"; then
    echo "✅ Running"
    echo -n "  Connection: "
    if curl -s http://localhost:9200 > /dev/null; then
        echo "✅ OK"
        echo -n "  Cluster health: "
        HEALTH=$(curl -s http://localhost:9200/_cluster/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo "✅ $HEALTH"
    else
        echo "❌ Failed"
    fi
else
    echo "❌ Not running"
fi

# pgAdmin (optional)
echo -n "pgAdmin: "
if docker ps --format "{{.Names}}" | grep -q "bookmytime-pgadmin"; then
    echo "✅ Running (http://localhost:5050)"
else
    echo "⚠️  Not running (optional)"
fi

echo ""
echo "🔌 Connection URLs:"
echo "  PostgreSQL:  jdbc:postgresql://localhost:5432/bookmytime"
echo "  OpenSearch:  http://localhost:9200"
echo "  pgAdmin:     http://localhost:5050 (admin@bookmytime.com / admin123)"
echo "  Dashboard:   http://localhost:5601"

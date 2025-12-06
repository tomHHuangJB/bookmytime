#!/bin/bash

echo "🚀 Starting BookMyTime Infrastructure..."

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Starting Docker..."
    open -a Docker
    echo "⏳ Waiting 15 seconds for Docker to start..."
    sleep 15
fi

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker run -d \
  --name bookmytime-postgres \
  -e POSTGRES_DB=bookmytime \
  -e POSTGRES_USER=bookmytime \
  -e POSTGRES_PASSWORD=changeme123 \
  -p 5432:5432 \
  -v bookmytime_postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine

# Start OpenSearch
echo "🔍 Starting OpenSearch..."
docker run -d \
  --name bookmytime-opensearch \
  -e "cluster.name=bookmytime-cluster" \
  -e "node.name=opensearch-node1" \
  -e "discovery.type=single-node" \
  -e "plugins.security.disabled=true" \
  -e "OPENSEARCH_JAVA_OPTS=-Xms512m -Xmx512m" \
  -p 9200:9200 \
  -p 9600:9600 \
  -v bookmytime_opensearch_data:/usr/share/opensearch/data \
  opensearchproject/opensearch:2.11

echo ""
echo "✅ Infrastructure started!"
echo ""
echo "🌐 Services:"
echo "  PostgreSQL:  localhost:5432"
echo "  OpenSearch:  http://localhost:9200"
echo ""
echo "📊 Check status:"
echo "  docker ps"
echo "  curl http://localhost:9200"

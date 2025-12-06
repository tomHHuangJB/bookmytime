# Create scripts/start-backend.sh
cat > /Users/tomhuang/prog/bookmytime/scripts/start-backend.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting BookMyTime Backend..."

cd apps/api

# Check if port 8080 is free
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is busy, using 8081 instead"
    PORT=8081
else
    PORT=8080
fi

echo "📡 Starting on port: $PORT"

# Start Spring Boot
mvn spring-boot:run -Dserver.port=$PORT
EOF

chmod +x /Users/tomhuang/prog/bookmytime/scripts/start-backend.sh

# Run it
cd /Users/tomhuang/prog/bookmytime
./scripts/start-backend.sh
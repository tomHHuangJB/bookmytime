# Terminal 1: Infrastructure
cd /Users/tomhuang/prog/bookmytime/infrastructure
docker-compose up -d  # or ./start-infra.sh

# Terminal 2: Backend (already running on port 8080)
# If not running, start it:
cd /Users/tomhuang/prog/bookmytime/apps/api
mvn spring-boot:run

# Terminal 3: Frontend (already running on port 5173)
# If not running, start it:
cd /Users/tomhuang/prog/bookmytime/apps/web
npm run dev

# if spring boot failed to start due to port not available:
sudo lsof -ti:9200 | xargs kill -9
or
sudo lsof -ti:8080 | xargs kill -9

# Test database connection via Spring Boot
curl http://localhost:8080/api/database/health

What's Most Important Right Now:
For your immediate development, you mainly need:

✅ PostgreSQL - For database (port 5432)

✅ Spring Boot - Backend API (port 8080)

✅ Vite/React - Frontend (port 5173)

Summary of what's running:

✅ Frontend: React + TypeScript with Vite (port 5173)

✅ Backend: Spring Boot + Java 21 (port 8080)

✅ Database: PostgreSQL in Docker (port 5432)

✅ Search: OpenSearch in Docker (port 9200)

✅ Proxy: Vite proxying API calls to backend
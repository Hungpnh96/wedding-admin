# Wedding Admin Docker Management
# Makefile để quản lý Docker containers

.PHONY: help build up down restart logs shell clean dev prod

# Default target
help:
	@echo "🎉 Wedding Admin Docker Commands"
	@echo "================================"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev          - Khởi động development environment"
	@echo "  make build        - Build Docker image"
	@echo "  make up           - Khởi động containers"
	@echo "  make down         - Dừng containers"
	@echo "  make restart      - Restart containers"
	@echo "  make logs         - Xem logs"
	@echo "  make shell        - Vào container shell"
	@echo ""
	@echo "Production Commands:"
	@echo "  make prod         - Khởi động production với Nginx"
	@echo "  make prod-build   - Build production image"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Xóa containers và images"
	@echo "  make clean-data   - Xóa data volumes"
	@echo ""

# Development environment
dev:
	@echo "🚀 Khởi động Development Environment..."
	docker-compose up --build

# Build image
build:
	@echo "🔨 Building Docker image..."
	docker-compose build

# Start containers
up:
	@echo "⬆️  Starting containers..."
	docker-compose up -d

# Stop containers
down:
	@echo "⬇️  Stopping containers..."
	docker-compose down

# Restart containers
restart:
	@echo "🔄 Restarting containers..."
	docker-compose restart

# View logs
logs:
	@echo "📋 Viewing logs..."
	docker-compose logs -f

# Shell access
shell:
	@echo "🐚 Accessing container shell..."
	docker-compose exec wedding-admin bash

# Production environment
prod:
	@echo "🚀 Khởi động Production Environment với Nginx..."
	docker-compose --profile production up --build -d

# Production build
prod-build:
	@echo "🔨 Building production image..."
	docker-compose --profile production build

# Clean up
clean:
	@echo "🧹 Cleaning up containers and images..."
	docker-compose down --rmi all --volumes --remove-orphans

# Clean data volumes
clean-data:
	@echo "🗑️  Cleaning data volumes..."
	docker-compose down -v
	docker volume prune -f

# Database operations
db-backup:
	@echo "💾 Creating database backup..."
	docker-compose exec wedding-admin python -c "from api.app_sqlite import create_backup; create_backup()"

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -f http://localhost:5001/api/health || echo "❌ Service is not healthy"

# Quick start (development)
start: dev

# Quick stop
stop: down


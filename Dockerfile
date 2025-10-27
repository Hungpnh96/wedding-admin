# Dockerfile với system dependencies
FROM python:3.11-slim

WORKDIR /app

# Cài đặt system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Tạo thư mục cần thiết
RUN mkdir -p /app/data /app/public/uploads /app/public/images

# Copy source code
COPY api/ ./api/
COPY admin.html ./
COPY admin/ ./admin/
COPY index.html ./
COPY public/ ./public/
COPY sections/ ./sections/
COPY assets/ ./assets/

# Expose port
EXPOSE 5001

# Default command
CMD ["python", "api/app_sqlite.py"]

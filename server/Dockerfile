# Production Hardware Configuration for PPTX Rendering & PDF Processing

# Use a lean Node.js image
FROM node:20-slim

# Install system dependencies
# 1. LibreOffice for PPTX -> PDF conversion
# 2. Fonts for professional rendering
# 3. Canvas dependencies (for any image processing)
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-java-common \
    fonts-liberation \
    fonts-dejavu \
    fonts-noto \
    ghostscript \
    python3 \
    make \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]

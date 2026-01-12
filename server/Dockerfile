# Production Hardware Configuration for PPTX Rendering & PDF Processing

# Use a full Node.js image to ensure all build tools are available
FROM node:20

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libnss3 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libcups2 \
    libdrm2 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxshmfence1 \
    libomp-dev \
    libblas-dev \
    liblapack-dev \
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

# Skip Puppeteer browser download to avoid failures and reduce size
# We will use the system-installed chrome or configure Puppeteer later
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Switch back to npm install for better cross-platform compatibility
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]

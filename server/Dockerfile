# Production Optimized Dockerfile for PDFx Server

# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies required for native modules
# We include python3, make, g++ for node-gyp if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install all dependencies (including devDependencies errors/building)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# ==========================================
# Stage 2: Runner
# ==========================================
FROM node:20-slim AS runner

WORKDIR /app

# Install runtime system dependencies (LibreOffice, Poppler, etc.)
# We explicitly install only what is needed for running the rendering tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
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
    libreoffice \
    libreoffice-java-common \
    fonts-liberation \
    fonts-dejavu \
    fonts-noto \
    ghostscript \
    python3 \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Optimize Node.js for production
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
# This drastically reduces image size
RUN npm install --only=production --legacy-peer-deps && \
    npm cache clean --force

# Copy source code from builder (ensures we only get what we need)
COPY --from=builder /app/src ./src

# Expose port
EXPOSE 4000

# Command to run the application
CMD ["npm", "start"]

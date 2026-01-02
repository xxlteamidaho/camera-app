FROM golang:1.21-alpine AS builder

# Install git for go get
RUN apk add --no-cache git

# Clone and build RTSPtoWebRTC
WORKDIR /build
RUN git clone https://github.com/deepch/RTSPtoWebRTC.git .
RUN go build -o RTSPtoWebRTC .

# Final image
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache ffmpeg

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy RTSPtoWebRTC binary
COPY --from=builder /build/RTSPtoWebRTC /app/RTSPtoWebRTC

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Make start script executable
RUN chmod +x /app/start.sh

# Set ownership
RUN chown -R nodejs:nodejs /app

# Expose ports: 3000 (web), 8083 (RTSPtoWebRTC)
EXPOSE 3000 8083

# Set production environment
ENV NODE_ENV=production

# Start both services
CMD ["/app/start.sh"]

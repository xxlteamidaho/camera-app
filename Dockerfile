FROM node:18-alpine

# Install dependencies, go2rtc, and FFmpeg for transcoding
RUN apk add --no-cache wget supervisor ffmpeg

# Download go2rtc binary
RUN wget -O /usr/local/bin/go2rtc https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_linux_amd64 && \
    chmod +x /usr/local/bin/go2rtc

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create supervisor config
RUN mkdir -p /etc/supervisor.d
COPY supervisord.conf /etc/supervisor.d/app.ini

# Set ownership
RUN chown -R nodejs:nodejs /app

# Expose ports: 3000 (web), 1984 (go2rtc API), 8555 (WebRTC)
EXPOSE 3000 1984 8555/udp

# Set production environment
ENV NODE_ENV=production

# Start with supervisor (runs both go2rtc and node)
CMD ["supervisord", "-c", "/etc/supervisor.d/app.ini", "-n"]

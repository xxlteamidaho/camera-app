FROM node:18-alpine

# Install go2rtc and ffmpeg
RUN apk add --no-cache wget ffmpeg && \
    wget -O /usr/local/bin/go2rtc https://github.com/AlexxIT/go2rtc/releases/latest/download/go2rtc_linux_amd64 && \
    chmod +x /usr/local/bin/go2rtc

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create startup script
RUN echo '#!/bin/sh' > /app/run.sh && \
    echo 'envsubst < /app/go2rtc.yaml.template > /app/go2rtc.yaml' >> /app/run.sh && \
    echo '/usr/local/bin/go2rtc -config /app/go2rtc.yaml &' >> /app/run.sh && \
    echo 'sleep 2' >> /app/run.sh && \
    echo 'node /app/server.js' >> /app/run.sh && \
    chmod +x /app/run.sh

RUN apk add --no-cache gettext

EXPOSE 3000 1984

ENV NODE_ENV=production

CMD ["/app/run.sh"]

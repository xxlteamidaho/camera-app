#!/bin/sh

# Generate config.json from environment variables
cat > /app/config.json << EOF
{
  "server": {
    "http_port": ":8083",
    "ice_servers": ["stun:stun.l.google.com:19302"]
  },
  "streams": {
    "camera1": {
      "on_demand": true,
      "url": "${CAMERA_1_URL}"
    },
    "camera2": {
      "on_demand": true,
      "url": "${CAMERA_2_URL}"
    },
    "camera3": {
      "on_demand": true,
      "url": "${CAMERA_3_URL}"
    },
    "camera4": {
      "on_demand": true,
      "url": "${CAMERA_4_URL}"
    }
  }
}
EOF

# Start RTSPtoWebRTC in background
/app/RTSPtoWebRTC &

# Start Node.js web server
node /app/server.js

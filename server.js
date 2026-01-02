const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// Security headers (relaxed for internal WebRTC/MSE app)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Parse camera configs from environment variables
const cameras = [];
for (let i = 1; i <= 10; i++) {
    if (process.env[`CAMERA_${i}_URL`]) {
        cameras.push({
            id: i,
            name: process.env[`CAMERA_${i}_NAME`] || `Camera ${i}`,
            stream: `camera${i}`,
        });
    }
}

app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to get cameras
app.get('/api/cameras', (req, res) => {
    res.json(cameras);
});

app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
    console.log(`Cameras configured: ${cameras.length}`);
});

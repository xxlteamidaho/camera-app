const express = require('express');
const app = express();
const { proxy } = require('rtsp-relay')(app);
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const port = process.env.PORT || 3000;

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "wss:", "ws:", "https://api.open-meteo.com"],
            imgSrc: ["'self'", "data:"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Parse camera configs from environment variables
// Format: CAMERA_1_NAME=Backyard, CAMERA_1_URL=rtsp://...
const cameras = [];
let i = 1;
while (process.env[`CAMERA_${i}_URL`]) {
    cameras.push({
        id: i,
        name: process.env[`CAMERA_${i}_NAME`] || `Camera ${i}`,
        url: process.env[`CAMERA_${i}_URL`]
    });
    i++;
}

// Fallback for testing if no env vars provided
if (cameras.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
        console.log('No cameras configured. Using test stream.');
        cameras.push({
            id: 1,
            name: 'Test Stream',
            url: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4'
        });
    }
}

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get list of cameras
app.get('/api/cameras', (req, res) => {
    res.json(cameras.map(c => ({ id: c.id, name: c.name })));
});

// WebSocket relay for each camera (with validation)
cameras.forEach(camera => {
    if (Number.isInteger(camera.id) && camera.id > 0) {
        app.ws(`/stream/${camera.id}`, proxy({
            url: camera.url,
            verbose: false,
            transport: 'tcp',
        }));
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Cameras loaded: ${cameras.length}`);
});

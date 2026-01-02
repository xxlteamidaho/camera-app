const express = require('express');
const { proxy } = require('rtsp-relay')(express());
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;

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
    console.log('No cameras found in environment variables. Using a test stream.');
    cameras.push({
        id: 1,
        name: 'Test Stream (Big Buck Bunny)',
        url: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4'
    });
}

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get list of cameras
app.get('/api/cameras', (req, res) => {
    res.json(cameras.map(c => ({ id: c.id, name: c.name })));
});

// WebSocket relay for each camera
cameras.forEach(camera => {
    app.ws(`/stream/${camera.id}`, proxy({
        url: camera.url,
        verbose: false, // set to true for debugging
        transport: 'tcp', // RTSP over TCP is usually more reliable for NVRs
    }));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Loaded ${cameras.length} cameras`);
});

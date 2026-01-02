# NVR Camera Viewer

A basic website to view NVR cameras using RTSP, designed for hosting on Coolify.

## Features

- Converts RTSP streams to WebSocket for browser viewing (using `rtsp-relay` and `ffmpeg`).
- Simple grid layout.
- Easy deployment with Docker.

## Configuration

The application uses Environment Variables to configure the cameras.

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (default: 3000) | `3000` |
| `CAMERA_1_NAME` | Name of the first camera | `Front Door` |
| `CAMERA_1_URL` | RTSP URL of the first camera | `rtsp://user:pass@192.168.1.10:554/stream` |
| `CAMERA_2_NAME` | Name of the second camera | `Backyard` |
| `CAMERA_2_URL` | RTSP URL of the second camera | `rtsp://...` |

Add as many cameras as you need by incrementing the number (e.g., `CAMERA_3_NAME`, `CAMERA_3_URL`).

## Local Development

1.  **Prerequisites**: Node.js and FFmpeg installed.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the server:
    ```bash
    # Example with a test stream
    npm start
    ```
4.  Open `http://localhost:3000`.

## Deployment on Coolify

1.  **Source**: Connect your Git repository to Coolify.
2.  **Build Pack**: Select **Docker** (it will use the provided `Dockerfile`).
3.  **Environment Variables**:
    - Go to the **Environment Variables** tab in your Coolify service.
    - Add your camera configurations (`CAMERA_1_URL`, `CAMERA_1_NAME`, etc.).
4.  **Ports**: Expose port `3000`.
5.  **Deploy**: Click deploy.

## Troubleshooting

-   **FFmpeg**: Ensure `ffmpeg` is installed in the environment (the Dockerfile handles this automatically).
-   **Performance**: RTSP transcoding can be CPU intensive. Ensure your server has enough resources if you have many cameras.
-   **Stream Lag**: There is typically a 2-3 second delay due to buffering.

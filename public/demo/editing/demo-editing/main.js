const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Load the demo video
video.src = '../z2c-demo.mp4';

video.addEventListener('loadedmetadata', () => {
  // Portrait canvas: 9:16 aspect ratio
  canvas.width = 360;
  canvas.height = 640;
});

// Render function that will be reused in export pipeline
function renderFrame(frame, ctx) {
  const cropX = 117;
  const cropWidth = 406; // 360 / (320/360) ≈ 406

  // Top participant (left side of source, green screen)
  ctx.drawImage(
    frame,
    cropX, 180,           // source x, y
    cropWidth, 360,       // source width, height
    0, 0,                 // dest x, y
    360, 320              // dest width, height
  );

  // Bottom participant (right side of source, office)
  ctx.drawImage(
    frame,
    640 + cropX, 180,     // source x, y
    cropWidth, 360,       // source width, height
    0, 320,               // dest x, y
    360, 320              // dest width, height
  );
}

// Use requestVideoFrameCallback to grab frames
video.requestVideoFrameCallback(function renderLoop() {
  // Create VideoFrame from video element
  const frame = new VideoFrame(video, { timestamp: video.currentTime * 1e6 });

  renderFrame(frame, ctx);

  frame.close();

  // Continue loop
  video.requestVideoFrameCallback(renderLoop);
});

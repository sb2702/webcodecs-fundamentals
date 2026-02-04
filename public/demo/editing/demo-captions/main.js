import { CaptionRenderer } from './caption_renderer.js';
import { LogoRenderer } from './logo_renderer.js';

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let captionRenderer;
let logoRenderer;

// Load the demo video
video.src = '../z2c-demo.mp4';

// Load transcript
fetch('../transcript.json')
  .then(res => res.json())
  .then(transcript => {
    // Set up font before creating caption renderer
    ctx.font = '700 24px Arial';
    captionRenderer = new CaptionRenderer(transcript, ctx);
  });

// Create logo renderer
logoRenderer = new LogoRenderer('../z2c-logo.png', ctx);

video.addEventListener('loadedmetadata', () => {
  // Portrait canvas: 9:16 aspect ratio
  canvas.width = 360;
  canvas.height = 640;
});

// Render function that will be reused in export pipeline
function renderFrame(frame, ctx, time) {
  // Source crop dimensions to maintain 16:9 aspect in a 360x320 box
  // Scale factor: 320/360 ≈ 0.889
  // Scaled width would be 640 * (320/360) ≈ 568
  // Center crop: take middle 360px from that 568, which is (568-360)/2 = 104 offset
  // In original coords: 104 / (320/360) ≈ 117
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

  // Draw logo
  if (logoRenderer) {
    logoRenderer.draw();
  }

  // Draw captions
  if (captionRenderer) {
    captionRenderer.draw(time);
  }
}

// Use requestVideoFrameCallback to grab frames
video.requestVideoFrameCallback(function renderLoop() {
  // Create VideoFrame from video element
  const frame = new VideoFrame(video, { timestamp: video.currentTime * 1e6 });

  // Convert timestamp from microseconds to seconds
  const time = frame.timestamp / 1e6;

  renderFrame(frame, ctx, time);

  frame.close();

  // Continue loop
  video.requestVideoFrameCallback(renderLoop);
});

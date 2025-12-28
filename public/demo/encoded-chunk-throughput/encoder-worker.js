// Encoder worker: generates frames and encodes them

const width = 320;
const height = 240;
const frameRate = 30;
let frameNumber = 0;
let encoder;

self.addEventListener('message', (e) => {
  if (e.data.type === 'start') {
    startEncoding();
  }
});

function startEncoding() {
  encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      // Send encoded chunk to main thread
      self.postMessage({
        type: 'chunk',
        chunk: chunk
      });
    },
    error: (e) => console.error('Encoder error:', e)
  });

  encoder.configure({
    codec: 'vp09.00.10.08',
    width,
    height,
    bitrate: 500_000,
    framerate: frameRate
  });

  generateFrames();
}

function generateFrames() {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');

  function render() {
    // Draw frame
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = '24px monospace';
    ctx.fillText(`Frame ${frameNumber}`, 20, height / 2);

    // Create VideoFrame from canvas
    const videoFrame = new VideoFrame(canvas, {
      timestamp: frameNumber * (1e6 / frameRate)
    });

    // Encode
    encoder.encode(videoFrame, { keyFrame: frameNumber % 60 === 0 });
    videoFrame.close();

    frameNumber++;

    if (frameNumber < 300) {
      setTimeout(render, 1000 / frameRate);
    } else {
      encoder.flush();
    }
  }

  render();
}

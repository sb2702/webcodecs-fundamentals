// Raw source worker: generates VideoFrames without encoding

const width = 320;
const height = 240;
const frameRate = 30;
let frameNumber = 0;

self.addEventListener('message', (e) => {
  if (e.data.type === 'start') {
    startGenerating();
  }
});

function startGenerating() {
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

    // Send raw VideoFrame to main thread
    self.postMessage({
      type: 'frame',
      frame: videoFrame
    }, [videoFrame]);

    frameNumber++;

    if (frameNumber < 300) {
      setTimeout(render, 1000 / frameRate);
    }
  }

  render();
}

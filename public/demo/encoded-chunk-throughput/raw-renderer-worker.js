// Raw renderer worker: receives VideoFrames and renders to offscreen canvas

let canvas;
let ctx;

self.addEventListener('message', (e) => {
  if (e.data.type === 'init') {
    canvas = e.data.canvas;
    ctx = canvas.getContext('2d');
  } else if (e.data.type === 'render') {
    renderFrame(e.data.frame);
  }
});

function renderFrame(frame) {
  ctx.drawImage(frame, 0, 0);
  frame.close();
}

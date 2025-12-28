// Decoder worker: receives encoded chunks and renders to offscreen canvas

let canvas;
let ctx;
let decoder;

self.addEventListener('message', (e) => {
  if (e.data.type === 'init') {
    canvas = e.data.canvas;
    ctx = canvas.getContext('2d');
    initDecoder();
  } else if (e.data.type === 'decode') {
    decodeChunk(e.data.chunk);
  }
});

function initDecoder() {
  decoder = new VideoDecoder({
    output: (frame) => {
      ctx.drawImage(frame, 0, 0);
      frame.close();
    },
    error: (e) => console.error('Decoder error:', e)
  });

  decoder.configure({
    codec: 'vp09.00.10.08'
  });
}

function decodeChunk(chunk) {
  decoder.decode(chunk);
}

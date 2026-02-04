
import { WebDemuxer } from 'https://cdn.jsdelivr.net/npm/web-demuxer/+esm';
import { CaptionRenderer } from './caption_renderer.js';
import { LogoRenderer } from './logo_renderer.js';


console.log(`MP4Muxer`, Mp4Muxer);

console.log('Web Demuxer', WebDemuxer)

const exportBtn = document.getElementById('exportBtn');
const progress = document.getElementById('progress');

let transcript;
let captionRenderer;
let logoRenderer;

// Load transcript
fetch('../transcript.json')
  .then(res => res.json())
  .then(data => {
    transcript = data;
  });

// Render function (same as in caption demo)
function renderFrame(frame, ctx, time) {
  const cropX = 117;
  const cropWidth = 406;

  // Top participant
  ctx.drawImage(frame, cropX, 180, cropWidth, 360, 0, 0, 360, 320);

  // Bottom participant
  ctx.drawImage(frame, 640 + cropX, 180, cropWidth, 360, 0, 320, 360, 320);

  // Draw logo
  if (logoRenderer) {
    logoRenderer.draw();
  }

  // Draw captions
  if (captionRenderer) {
    captionRenderer.draw(time);
  }
}

// TransformStream classes
class DemuxerTrackingStream extends TransformStream {
  constructor() {
    let chunkIndex = 0;
    super(
      {
        async transform(chunk, controller) {
          while (controller.desiredSize !== null && controller.desiredSize < 0) {
            await new Promise(r => setTimeout(r, 10));
          }
          controller.enqueue({ chunk, index: chunkIndex++ });
        }
      },
      { highWaterMark: 20 }
    );
  }
}

class VideoDecoderStream extends TransformStream {
  constructor(config) {
    let decoder;
    let pendingIndices = [];
    super(
      {
        start(controller) {
          decoder = new VideoDecoder({
            output: (frame) => {
              const index = pendingIndices.shift();
              controller.enqueue({ frame, index });
            },
            error: (e) => controller.error(e)
          });
          decoder.configure(config);
        },
        async transform(item, controller) {
          while (decoder.decodeQueueSize >= 20) {
            await new Promise(r => setTimeout(r, 10));
          }
          while (controller.desiredSize !== null && controller.desiredSize < 0) {
            await new Promise(r => setTimeout(r, 10));
          }
          pendingIndices.push(item.index);
          decoder.decode(item.chunk);
        },
        async flush() {
          await decoder.flush();
          if (decoder.state !== 'closed') decoder.close();
        }
      },
      { highWaterMark: 10 }
    );
  }
}

class VideoRenderStream extends TransformStream {
  constructor(canvas, ctx, clipStart) {
    super(
      {
        async transform(item, controller) {
          const time = item.frame.timestamp / 1e6;

          // Render to canvas
          renderFrame(item.frame, ctx, time);

          // Create new frame from canvas
          const newFrame = new VideoFrame(canvas, {
            timestamp: item.frame.timestamp - clipStart*1e6,
            duration: item.frame.duration
          });

          

          item.frame.close();

          if(newFrame.timestamp <0) {
            newFrame.close();
            return;
          }
          controller.enqueue({
            frame: newFrame,
            index: item.index
          });
        }
      },
      { highWaterMark: 5 }
    );
  }
}

class VideoEncoderStream extends TransformStream {
  constructor(config,clipDuration, progressCallback) {
    let encoder;
    super(
      {
        start(controller) {
          encoder = new VideoEncoder({
            output: (chunk, meta) => {
              controller.enqueue({ chunk, meta });
            },
            error: (e) => controller.error(e)
          });
          encoder.configure(config);
        },
        async transform(item, controller) {
          while (encoder.encodeQueueSize >= 20) {
            await new Promise(r => setTimeout(r, 10));
          }
          while (controller.desiredSize !== null && controller.desiredSize < 0) {
            await new Promise(r => setTimeout(r, 10));
          }
          encoder.encode(item.frame, { keyFrame: item.index % 60 === 0 });

          // Update progress based on timestamp
          if (progressCallback && clipDuration) {
            const timeInSeconds = item.frame.timestamp / 1e6;
            const percent = Math.round(((timeInSeconds) / clipDuration) * 100);
            progressCallback(percent);
          }

          item.frame.close();
        },
        async flush() {
          await encoder.flush();
          if (encoder.state !== 'closed') encoder.close();
        }
      },
      { highWaterMark: 10 }
    );
  }
}

function createMuxerWriter(muxer) {
  return new WritableStream({
    async write(value) {
      muxer.addVideoChunk(value.chunk, value.meta);
    }
  });
}

function createAudioMuxerWriter(muxer) {
  return new WritableStream({
    async write(chunk) {

      if(chunk.timestamp >= 0){
        muxer.addAudioChunk(chunk);
      }
   
    }
  });
}

exportBtn.addEventListener('click', async () => {
  exportBtn.disabled = true;
  progress.textContent = 'Loading video...';

  try {
    // Load source video
    const response = await fetch('../z2c-demo.mp4');
    const arrayBuffer = await response.arrayBuffer();
    const file = new File([arrayBuffer], 'z2c-demo.mp4', { type: 'video/mp4' });

    progress.textContent = 'Setting up demuxer...';

    // Set up demuxer
    const demuxer = new WebDemuxer({
      wasmFilePath: "https://cdn.jsdelivr.net/npm/web-demuxer@latest/dist/wasm-files/web-demuxer.wasm"
    });
    await demuxer.load(file);

    const mediaInfo = await demuxer.getMediaInfo();
    const videoTrack = mediaInfo.streams.filter(s => s.codec_type_string === 'video')[0];
    const audioTrack = mediaInfo.streams.filter(s => s.codec_type_string === 'audio')[0];
    const decoderConfig = await demuxer.getDecoderConfig('video');
    const audioConfig = audioTrack ? await demuxer.getDecoderConfig('audio') : null;


    const clipStart = 318;
    const clipEnd = 360;
    const clipDuration = clipEnd - clipStart; // 42 seconds

    // Set up canvas for rendering
    const canvas = new OffscreenCanvas(360, 640);
    const ctx = canvas.getContext('2d');
    ctx.font = '700 24px Arial';

    // Set up caption and logo renderers
    captionRenderer = new CaptionRenderer(transcript, ctx);
    logoRenderer = new LogoRenderer('../z2c-logo.png', ctx);

    // Wait for logo to load
    await new Promise(resolve => {
      if (logoRenderer.logoLoaded) {
        resolve();
      } else {
        logoRenderer.logo.onload = resolve;
      }
    });

    progress.textContent = 'Setting up muxer...';

    // Set up muxer with audio if available
    const muxerOptions = {
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: {
        codec: 'avc',
        width: 360,
        height: 640
      },
      firstTimestampBehavior: 'offset',
      fastStart: 'in-memory'
    };

    if (audioConfig) {
      muxerOptions.audio = {
        codec: 'aac',
        numberOfChannels: audioConfig.numberOfChannels,
        sampleRate: audioConfig.sampleRate
      };
    }

    const muxer = new Mp4Muxer.Muxer(muxerOptions);

    // Encoder config
    const encoderConfig = {
      codec: 'avc1.42001f',
      width: 360,
      height: 640,
      bitrate: 2_000_000,
      framerate: 30
    };

    progress.textContent = 'Processing video...';

    // Get stream from demuxer - it returns a native ReadableStream
    const chunkStream = demuxer.read('video', clipStart, clipEnd);



    // Build and run pipeline with progress tracking
    const pipeline = chunkStream
      .pipeThrough(new DemuxerTrackingStream())
      .pipeThrough(new VideoDecoderStream(decoderConfig))
      .pipeThrough(new VideoRenderStream(canvas, ctx, clipStart))
      .pipeThrough(new VideoEncoderStream(encoderConfig, clipDuration, (percent) => {
        progress.textContent = `Processing video... ${percent}%`;
      }))
      .pipeTo(createMuxerWriter(muxer));

    await pipeline;

    progress.textContent = 'Processing audio...';

    // Pipe audio through (pass-through, no transcoding)
    if (audioConfig) {
      const audioStream = demuxer.read('audio', clipStart, clipEnd);



      await audioStream.pipeTo(createAudioMuxerWriter(muxer));
    }

    progress.textContent = 'Finalizing...';

    muxer.finalize();
    const buffer = muxer.target.buffer;
    const blob = new Blob([buffer], { type: 'video/mp4' });

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-video.mp4';
    a.click();

    progress.textContent = 'Done! Video downloaded.';
  } catch (error) {
    progress.textContent = `Error: ${error.message}`;
    console.error(error);
  } finally {
    exportBtn.disabled = false;
  }
});

---
title: Sources & References
description: Key references and resources used throughout this documentation
---

This page lists the main sources, references, and resources cited throughout WebCodecs Fundamentals.

## W3C Specifications & Standards

- [W3C WebCodecs Specification](https://w3c.github.io/webcodecs/)
- [W3C WebCodecs Codec Registry](https://www.w3.org/TR/webcodecs-codec-registry/)
- [W3C WebCodecs AAC Codec Registration](https://www.w3.org/TR/webcodecs-aac-codec-registration/)
- [WebGPU Specification](https://gpuweb.github.io/gpuweb/)

## MDN Web Docs

- [VideoEncoder API](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder)
- [VideoDecoder API](https://developer.mozilla.org/en-US/docs/Web/API/VideoDecoder)
- [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Canvas 2D Rendering Context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)
- [getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MediaStreamTrackProcessor](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackProcessor)
- [FileSystemWritableFileStream](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream)
- [ImageBitmapRenderingContext](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapRenderingContext)

## Libraries & Tools

### Core Libraries

- [Mediabunny](https://mediabunny.dev/) - Media processing library for WebCodecs
  - [Source Code](https://github.com/Vanilagy/mediabunny)
  - [Discord Community](https://discord.com/invite/hmpkyYuS4U)
- [web-demuxer](https://github.com/bilibili/web-demuxer/) - WebAssembly-based demuxer
- [mp4-muxer](https://www.npmjs.com/package/mp4-muxer) - MP4 muxing library
- [webcodecs-utils](https://www.npmjs.com/package/webcodecs-utils) - Utility functions and polyfills

### Media Over QUIC (MoQ)

- [MoQ Specification](https://datatracker.ietf.org/wg/moq/about/)
- [moq-dev GitHub](https://github.com/moq-dev/moq)
- [Hang Protocol Library](https://github.com/moq-dev/moq/tree/main/js/hang)
- [@moq/lite](https://www.npmjs.com/package/@moq/lite) - JavaScript MoQ client

### Video Players

- [hls.js](https://github.com/video-dev/hls.js) - HLS player
- [Shaka Player](https://github.com/shaka-project/shaka-player) - DASH/HLS player

### Server-Side Media Processing

- [PyAV](https://github.com/PyAV-Org/PyAV) - Python FFmpeg bindings
- [NodeAV](https://github.com/seydx/node-av) - Node.js FFmpeg bindings
- [GStreamer MoQ Plugin](https://github.com/moq-dev/gstreamer)

## Performance & Architecture Articles

- [CPU vs GPU with Canvas API](https://www.middle-engine.com/blog/posts/2020/08/21/cpu-versus-gpu-with-the-canvas-web-api) - Analysis of Canvas rendering performance
- [WebCodecs Performance (Paul Adenot)](https://www.w3.org/2021/03/media-production-workshop/talks/paul-adenot-webcodecs-performance.html) - W3C workshop talk
- [GPU Memory Management](https://people.ece.ubc.ca/sasha/papers/ismm-2017.pdf) - Academic paper on GPU/CPU memory
- [WebGPU Explainer](https://gpuweb.github.io/gpuweb/explainer/) - GPU memory model
- [Browser Process Architecture](https://sunandakarunajeewa.medium.com/how-web-browsers-use-processes-and-threads-5ddbea938b1c)

## Video Streaming Protocols

- [HLS vs DASH Comparison (Mux)](https://www.mux.com/articles/hls-vs-dash-what-s-the-difference-between-the-video-streaming-protocols)
- [Media over QUIC (Cloudflare)](https://blog.cloudflare.com/moq/) - CDN provider perspective
- [Facebook MoQ Encoder-Player](https://github.com/facebookexperimental/moq-encoder-player)
- [QUIC Protocol](https://en.wikipedia.org/wiki/QUIC)
- [RTMP Protocol](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- [WebTransport](https://caniuse.com/webtransport) - Browser support

## Codec & Compression Resources

- [YouTube Bitrate Recommendations](https://support.google.com/youtube/answer/1722171#zippy=%2Cbitrate)
- [Spectral Band Replication (SBR)](https://en.wikipedia.org/wiki/Spectral_band_replication) - AAC enhancement
- [Parametric Stereo](https://en.wikipedia.org/wiki/Parametric_stereo) - AAC stereo encoding

## Test Videos & Media

- [Big Buck Bunny](https://peach.blender.org/) - Open-source test video (Blender Foundation)
  - [Download](https://download.blender.org/demo/movies/BBB/)
- [Jellyfish Test Video](https://larmoire.org/jellyfish/) - 1080p quality comparison test

## Example Code & Demos

All example code and demos are open source:

- [WebCodecs Examples Repository](https://github.com/sb2702/webcodecs-examples)
  - [Video Player](https://github.com/sb2702/webcodecs-examples/tree/main/src/player)
  - [Transcoding Pipeline](https://github.com/sb2702/webcodecs-examples/blob/main/src/transcoding/transcode-pipeline.ts)
  - [MoQ Streaming](https://github.com/sb2702/webcodecs-examples/tree/main/src/moq)
  - [Webcam Recording](https://github.com/sb2702/webcodecs-examples/blob/main/src/webcam-recording/recorder.ts)

- [webcodecs-utils Repository](https://github.com/sb2702/webcodecs-utils)
  - [MP4 Demuxer](https://github.com/sb2702/webcodecs-utils/blob/main/src/demux/mp4-demuxer.ts)
  - [MediaStreamTrackProcessor Polyfill](https://github.com/sb2702/webcodecs-utils/blob/main/src/polyfills/media-stream-track-processor.ts)

## Production Applications

Real-world WebCodecs applications referenced:

- [free.upscaler.video](https://free.upscaler.video) - Open-source video upscaling tool
  - [Technical Architecture](https://free.upscaler.video/technical/architecture/)
  - [Source Code](https://github.com/sb2702/free-ai-video-upscaler)
- [Katana.video](https://katana.video) - Professional video editor
  - [Technical Overview](https://katana.video/blog/what-does-katana-actually-do)

## Other Technical Resources

- [WebGPU Fundamentals](https://webgpufundamentals.org/) - WebGPU learning resource
- [Publish-Subscribe Pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
- [Rube Goldberg Machine](https://en.wikipedia.org/wiki/Rube_Goldberg_machine) - Metaphor used for encoder/decoder architecture

## Dataset & Research

- [upscaler.video Codec Support Dataset](/datasets/codec-support/) - Empirical WebCodecs codec support data
  - [Full Codec Support Table](/datasets/codec-support-table/)
  - [Dataset Methodology](https://free.upscaler.video/research/methodology/)

---

*This documentation is open source and continuously updated. If you notice any missing or incorrect references, please contribute on [GitHub](https://github.com/sb2702/webcodecs-fundamentals).*

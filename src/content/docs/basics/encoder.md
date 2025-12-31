---
title: VideoEncoder
description: Why WebCodecs is harder than it looks
---


The `VideoEncoder` allows transforming [VideoFrame](./video-frame) objects into [EncodedVideoChunk](./encoded-video-chunk) objects allowing you to write rendered / raw video frames to a compressed/encoded video stream or file.

![](/src/assets/content/basics/encoder/video-encoder.png)


The basic "hello world" API for the decoder works like this:

```typescript
// Just capture the contents of a dummy canvas
const canvas = new OffscreenCanvas(1280, 720);
const encoder = new VideoEncoder({
    output: function(chunk: EncodedVideoChunk, meta: any){
        // Do something with the chunk
    },
    error: function(e: any)=> console.warn(e);
});

encoder.configure({
    'codec': 'vp9.00.10.08.00',
     width: 1280,
     height: 720,
     bitrate: 1000000 //1 MBPS,
     framerate: 25
});

let framesSent = 0;
const start = performance.now();

setInterval(function(){
    const currentTimeMicroSeconds = (performance.now() - start)*1e3;
    const frame = new VideoFrame(canvas, {timestamp: currenTimeMicroSeconds });
    encoder.encode(frame, {keyFrame: framesSent%60 ==0}); //Key Frame every 60 frames;
}, 40);  // Capture a frame every 40 ms (25fps)

```

The `VideoEncoder` is the mirror operation to the `VideoDecoder`, but API and usage is a bit different, and like with the `VideoDecoder`, there is a big gap between hello world APIs and production.

In this article we'll focus specifically on the `VideoEnocder` and how to actually manage an encoder in a production pipeline.

[MediaBunny](../media-bunny/intro) abstracts the `VideoEncoder` away, simplifying a lot of the pipeline and process management,  so if you want to use MediaBunny, this section isn't necessary, but might still be helpful to understand how WebCodecs works.




## Configuration

Unlike the `VideoDecoder`, where you get the decoding config from the video source file/stream, you have a choice on how to encode your video, and you'd specify your encoding proferences via `encoder.configure(config)` as shown below 


```typescript

encoder.configure({
    'codec': 'vp9.00.10.08.00', // Codec string
     width: 1280,
     height: 720,
     bitrate: 1000000 //bitrate is related to quality
     framerate: 25,
     latencyMode: "quality" 

```

You can see a more comprehensive summary of the options on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/configure) but I'll cover the practical ones here:


##### Codec
You need to specify a *codec string* such as  'vp9.00.10.08.00' or 'avc1.42003e'.  Choosing a codec is a whole *thing*,  you can see the [codecs](../codecs) page for practical guidance on how to choose one.



##### Bitrate
Video codecs apply a trade-off between file size and video quality, where you can have high quality video with large file sizes, or you can have compact files with low quality video. This tradeoff is specified in the bitrate, where higher bitrates result in larger files but higher quality. 

Here's an visualization of how bitrate affects quality, with the same [1080p file](https://larmoire.org/jellyfish/) transcoded at different bitrates

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 600px;">
  <div style="text-align: center;">
    <img src="/src/assets/content/basics/encoder/jellyfish_300k_crop.png" alt="300 kbps">
    <p><strong>300 kbps</strong></p>
  </div>
  <div style="text-align: center;">
    <img src="/src/assets/content/basics/encoder/jellyfish_1M_crop.png" alt="1 Mbps">
    <p><strong>1 Mbps</strong></p>
  </div>
  <div style="text-align: center;">
    <img src="/src/assets/content/basics/encoder/jellyfish_3M_crop.png" alt="3 Mbps">
    <p><strong>3 Mbps</strong></p>
  </div>
  <div style="text-align: center;">
    <img src="/src/assets/content/basics/encoder/jellyfish_10M_crop.png" alt="10 Mbps">
    <p><strong>10 Mbps</strong></p>
  </div>
</div>

Here are typical recommendations for bitrate settings [[1](https://support.google.com/youtube/answer/1722171#zippy=%2Cbitrate)]


| Resolution | Bitrate (30fps) | Bitrate (60fps)
|------------|-----------------|-----------------|
| 4K         | 13-20 Mbps      | 20-30 Mbps      | 
| 1080p      | 4.5-6 Mbps      | 6-9 Mbps        | 
| 720p       | 2-4 Mbps        | 3-6 Mbps        | 
| 480p       | 1.5-2 Mbps      | 2-3 Mbps        |
| 360p       | 0.5-1 Mbps      | 1-1.5 Mbps      | 
| 240p       | 300-500 kbps    | 500-800 kbps    | 


If you just want something quick and easy that works, here is a quick utility function:

```typescript

function getBitrate(width, height, fps, quality = 'good') {
    const pixels = width * height;

    const qualityFactors = {
      'low': 0.05,
      'good': 0.08,
      'high': 0.10,
      'very-high': 0.15
    };

    const factor = qualityFactors[quality] || qualityFactors['good'];

    // Returns bitrate in bits per second
    return pixels * fps * factor;
  }

```



##### Latency mode

Video encoders also have a tradeoff between speed and quality, where you can sacrifice some quality for faster encoding, which would be helpful in the scenario of streaming.

Basically, if you are live streaming or really need to improve encoding speed, use   latencyMode: "realtime" , otherwise if you expect to output a video file, use latencyMode: "quality"  (the default).


###  Practical Considerations

Before we go ahead and set up an actual encoding loop, here are a few things to keep in mind:

#### Encoding can be slow

Encoding performance varies dramatically across devices and browsers, and is in general much slower than decoding. Here are some benchmarks for encoding and decoding of 1080p, 30fps, h264 video across a variety of devices and browsers


| Device | Tier | Browser | Encode FPS | Decode FPS |
|--------|------|---------|------------|------------|
| Windows Netbook | Low | Chrome | 11 | 540 |
| Windows Netbook | Low | Firefox | 25 | 30 |
| Samsung Chromebook | Low | Chrome | 60 | 600 |
| Ubuntu Lenovo | Mid | Chrome | 100 | 350 |
| Ubuntu Lenovo | Mid | Firefox | 80 | 300 |
| iPhone 16 Pro | High | Chrome | 120 | 600 |
| iPhone 16 Pro | High | Safari | 12 | 600 |
| Samsung Galaxy S25 | High | Chrome | 200 | 600 |
| Macbook Pro M4 | High | Chrome | 200 | 1200 |
| Macbook Pro M4 | High | Firefox | 80 | 600 |
| Macbook Pro M4 | High | Safari | 200 | 600 |




#### Encoding queue and flush

#### Finishing conditions






## Encoding Loop



* renderFn
* encoderFree
* isFinished
* muxer
* Full demo
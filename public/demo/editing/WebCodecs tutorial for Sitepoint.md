

# How to do video processing in the browser with WebCodecs

WebCodecs is a new-ish browser API that enables frontend web applications to access hardware-accelerated video encoding and decoding.

This not only makes it possible to build performant browser-based video editing or live streaming apps, it also enables entirely new use cases like programmatic video generation.

If you’re doing, or considering doing anything with video in the browser, you should definitely be aware of WebCodecs and the kinds of things you can do with it.	

In this article we will cover:

* What WebCodecs actually is  
* Review major use cases for WebCodecs  
* Go over the basics of WebCodecs  
* Build a simple video editing application

## What is WebCodecs

Before we get into WebCodecs, you should first be aware of what codecs are. You’re likely already aware that a video is just a series of images:

| ![][image1] | ![][image2] |
| :---- | :---: |

Moreover, every video frame is made up of pixels, so that each frame of a 1080p video has 1920x1080= 2073600 pixels. Each pixel also has 3 bytes, denoting the RGB value.

![][image3]

If you do the math, a raw, hour-long 1080p video (at 30 frames per second) would be about 625 GB. If you’ve ever downloaded large videos before, you’d know that actual video files are \~100x smaller than that.

A codec is an algorithm for compressing video (or audio) data. Some common codecs include h264, vp9 and av1. If you ever download an mp4 file, it’s most often compressed with the ‘h264’ codec.

The core of WebCodecs is to allow to decode compressed video into raw video frames, and to compress raw video frames into encoded video.

![][image4]

Other browser APIs like  HTMLVideoElement and MediaRecorder also enable decoding and encoding video in the browser, but they are high level APIs which are easy to use but lack low level control. 

WebCodecs gives much lower level control, enabling you to decode and encode video on a per-frame basis, which is necessary for some use cases like video editing and programmatic video generation. 

## Use cases for WebCodecs

##### 

The low-level control over video encoding/decoding enables developers to build high performance browser-based video applications that were previously either the domain of desktop software or which required server-side video processing.

A few categories of WebCodecs applications include:

Video Editing: Browser based video editing tools like Capcut and ClipChamp allow users to edit video with as much flexibility and performance as desktop software like Adobe Premiere Pro, but without the need to install or configure anything.

Live Streaming: Browser based recording studios like Streamyard or Riverside use WebCodecs to record and stream higher-quality video streams than would be possible with WebRTC alone, providing content creators with the quality and performance of desktop studio software like OBS without the need for installation or configuration.

Video Utilities. Many companies (like Veed, Canva) use free video utilities as a lead-generation mechanism. Whereas previously free video utilities had usage limits or ads (to account for server processing costs),  WebCodecs enables 100% client-side video processing, making it much easier to build free video utilities. A good example is [http://free.upscaler.video](http://free.upscaler.video/), an open-source video enhancement tool which upscales thousands of hours of video a day with zero server costs thanks to WebCodecs. 

Programmatic Video Generation: WebCodecs is increasingly used to create programmatic videos, enabling developers to to vibe code animated videos, or generate parameterized videos on the fly.  Tools like Remotion.dev enable developers to programmatically construct video with React, 

In this article, we’ll use WebCodecs to create a simple video editing application to generate a portrait clip from a landscape talking head video, along with a logo and captions. Clipping is both a very common type of video editing utility, and touches a bit of all the above mentioned use cases.

## Basic of WebCodecs

The two main data types we’ll be working with in WebCodecs are the VideoFrame object and EncodedVideoChunk object.

![][image5]

**Video Frames**

VideoFrame objects contain the image data for a video frame, as well as key metadata like format, timestamp and duration.

When decoding video, a VideoDecoder will generate VideoFrame objects and we can then render these to a canvas as so:

```javascript
const canvas = new OffscreenCanvas(640, 480);
const ctx = canvas.getContext('2d');

const decoder = new VideoDecoder({
     output(frame: VideoFrame) {
            ctx.drawImage(frame, 0, 0);
            frame.close()
     },
       error(e) {}
});
```

When encoding, you can construct raw video frames from a canvas, which you would then feed to an encoder

```javascript
const videoFrame = new VideoFrame(canvas, { timestamp }); //time is in µs
encoder.encode(videoFrame, {keyFrame: frameIndex%60==0});
```

You can also grab raw video frames from an HTMLVideoElement, which can be useful if you want the browser to handle playback, audio & demuxing, while still manipulating the video frame in a canvas (we’ll do this for our demo). 

```javascript
const videoFrame = new VideoFrame(video,{ timestamp: video.currentTime*1e6 }); 
```

Keep in mind that VideoFrame objects take up a lot of memory (10 MB for a 1080p frame), and when playing 30fps video, that memory quickly adds up.

You’ll need to close each VideoFrame after you are done with it to avoid memory issues

```javascript
videoFrame.close()
```

**EncodedVideoChunk**

EncodedVideoChunks are compressed versions of each VideoFrame.  A video file itself is composed of metadata, as well as encoded audio and video.  
![][image6]

You will need to use a library like [MediaBunny](https://mediabunny.dev/) to read EncodedVideoChunks from a file, or write EncodedVideoChunks to a file. Here’s a demo example:

```javascript
import { getVideoChunks, ExampleMuxer }  from 'webcodecs-utils'

// Read EncodedVideChunks from a video file
const chunks = <EncodedVideoChunk[]> await getVideoChunks(<File> file);

//Write EncodedVideoChunks to a video file
const muxer = new ExampleMuxer();

for (const chunk of chunks){
  muxer.addChunk(chunk);
}

const arrayBuffer =  await muxer.finish();
const blob = new Blob([arrayBuffer], {type: 'video/mp4'}); // Your output file
```

**Decoding**

The VideoDecoder turns EncodedVideoChunks into VideoFrames. A proper ‘decode’ loop would involve reading EncodedVideoChunks from a file, feeding them to a VideoDecoder, and then rendering the result to a canvas.

![][image7]

You would start be defining a new video decoder

```javascript
const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){
        //do something with the VideoFrame
    },
    error: function(e: any)=> console.warn(e);
});
```

You need then configure the decoder

```javascript
decoder.configure(config)
```

There are several libraries that can extract the decoderConfig for a specific file

```javascript
import { MP4Demuxer } from 'webcodecs-utils'

const demuxer = new MP4Demuxer(file);
await demuxer.load();
const config = demuxer.getVideoDecoderConfig();
```

Finally, you can send chunks to the decoder, and the decoder will start generating VideoFrame objects

```javascript
for (const chunk of chunks){
    decoder.decode(chunk);
}
```

A full working demuxing \+ decoding “hello world”, rendering the video to a canvas would look like this:

```javascript
import { MP4Demuxer } from 'webcodecs-utils'

const canvas = new OffscreenCanvas(640, 480);
const ctx = canvas.getContext('2d');

const demuxer = new MP4Demuxer(file);
await demuxer.load();

const config = demuxer.getVideoDecoderConfig();
const chunks = await demuxer.extractSegment('video', 0);


const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){
         ctx.drawImage(frame, 0, 0);
         frame.close()
    },
    error: function(e: any)=> console.warn(e);
});

decoder.configure(config)

for (const chunk of chunks){
    decoder.decode(chunk);
}
```

**Encoding**

The VideoEncoder turns VideoFrame objects into EncodedVideoChunk objects, and this is what you’d use to “render” a video, turning a canvas animation into a video file. 

**![][image8]**

You’d start be defining a video encoder

```javascript
const encoder = new VideoEncoder({
    output: function(chunk: EncodedVideoChunk, meta: any){
        // Do something with the chunk
    },
    error: function(e: any)=> console.warn(e);
});
```

You’d then encode a video. Here you actually decide how to configure the encoder based on your codec choice. Here we’ll just choose one of the most common for H264 (the most common codec for MP4 files).

```javascript
encoder.configure({
    'codec': 'avc1.4d0034',
     width: 1280,
     height: 720,
     bitrate: 1000000 //1 MBPS,
     framerate: 25
});
```

You can find a full list of codecs [here](https://webcodecsfundamentals.org/datasets/codec-support-table/). Presumably you know what the width, height and framerate of your video will be. As for bitrate, here is a handy function

```javascript
function getBitrate(width, height, fps, quality = 'good') {
    const pixels = width * height;
    const qualityFactors = {
      'low': 0.05,
      'good': 0.08,
      'high': 0.10,
      'very-high': 0.15
    };
    const factor = qualityFactors[quality] || qualityFactors['good'];
    return pixels * fps * factor;
}
```

To showcase how to encode video, we can start with creating a canvas

```javascript
const canvas = new OffscreenCanvas(640, 360);
const ctx = canvas.getContext('2d');
const TOTAL_FRAMES=300;
let frameNumber = 0;
let chunksMuxed = 0;
const fps = 30;
```

We’ll then  create a render function to draw something to the canvas

```javascript
function renderFrame(){
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw frame number
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.min(canvas.width / 10, 72)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Frame ${frameNumber}`, canvas.width / 2, canvas.height / 2);
}
```

We’ll then define the encoder

```javascript
const encoder = new VideoEncoder({
    output: function(chunk, meta){
        muxVideoChunk(chunk, meta) // we'll define this later
    },
    error: function(e){}
})
encoder.configure({
    'codec': 'avc1.4d0034',
     width: 1280,
     height: 720,
     bitrate: 1000000 //1 MBPS,
     framerate: 25
});
```

Then we do the encode loop, which will render each frame encode the contents of canvas

```javascript
let flushed = false;
async function encodeLoop(){

    renderFrame();

    const frame = new VideoFrame(canvas, {timestamp: frameNumber/fps*1e6});
    encoder.encode(frame, {keyFrame: frameNumber %60 ===0});
    frame.close();

    frameNumber++;


    if(frameNumber === TOTAL_FRAMES) {
        if (!flushed) encoder.flush();
    }
    else return requestAnimationFrame(encodeLoop);
}
```

Finally, we’ll use MediaBunny to mux the video to a file

```javascript
import { EncodedPacket,  EncodedVideoPacketSource, BufferTarget Mp4OutputFormat,  Output } from 'mediabunny';

const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
});

const source = new EncodedVideoPacketSource('avc');
output.addVideoTrack(source);

await output.start();

function muxVideo(chunk, meta){
        source.add(EncodedPacket.fromEncodedChunk(chunk))
        chunksMuxed++;
        if(chunksMuxed === TOTAL_FRAMES) finish(); // Get our file
}
```

And last we define the finish function

```javascript
await output.finalize();
const buffer = <ArrayBuffer> output.target.buffer;
encoder.close();
const blob =  new Blob([buffer], { type: 'video/mp4' });
```

And then to start, all we’ll need to do is to start the encodeLoop

```javascript
encodeLoop()
```

And you’d be able to render the canvas animation to an mp4 video. You can see a live demo below:

\<insert iframe demo\>  
[https://webcodecsfundamentals.org/demo/encode-loop/index.html](https://webcodecsfundamentals.org/demo/encode-loop/index.html)

Source code: [https://webcodecsfundamentals.org/demo/encode-loop/index.html](https://webcodecsfundamentals.org/demo/encode-loop/index.html)

## Video Editing Tutorial

Now that we’ve gotten the basics of encoding and decoding and WebCodecs, we’ll walk through building a basic video editing application.

**…**


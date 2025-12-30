---
title: VideoDecoder
description: Why WebCodecs is harder than it looks
---

The `VideoDecoder` allows transforming [EncodedVideoChunk](./encoded-video-chunk) objects into [VideoFrame](./video-frame) objects, allowing you to read and render raw video frames from a video file or video stream.

![](/src/assets/content/basics/decoder/video-decoder.png)


The basic "hello world" API for the decoder works like this:

```typescript
//Pseudocode, demuxing libraries provide the same info but syntax varies.
const {chunks, metaData} = await demuxFile(<File> file);


const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){
        //do something with the VideoFrame
    },
    error: function(e: any)=> console.warn(e);
});

decoder.configure({
    codec: metaData.codec,
})

for (const chunk of chunks){
    decoder.decode(chunk);
}

```

The hello world looks pretty simple, and these docs already have multiple code examples for basic decoding with the `VideoDecoder`, but there's a big gap between these hello world examples and what you'd actually write in a production pipeline.

In this article we'll focus specifically on the `VideoDecoder` and how to actually manage decoders in a production decoding pipeline.

[MediaBunny](../media-bunny/intro) abstracts the `VideoDecoder` away, simplifying a lot of the pipeline and process management,  so if you want to use MediaBunny, this section isn't necessary, but might still be helpful to understand how WebCodecs works.

### Configuration

Before you even get started decoding, you need to configure it via `decoder.configure(config)`, which tells the decoder about the encoded video data you are going to feed it.

There's no "settings" you choose in this config, it's just metadata from the video you want to decode, principally the codec string: `decoder.configure({codec: /*codec string*/})`

Most demuxing libraries will give you the info needed to configure the decoder. Here's a few demuxing libraries and how you'd get the decoder config:

##### MediaBunny 

```typescript
import {Input, BlobSource, MP4} from 'mediabunny'

const input = new Input({
    formats: [MP4],
    source: new BlobSource(file),
});

const videoTrack = await input.getPrimaryVideoTrack();
const decoderConfig = await videoTrack.getDecoderConfig();

decoder.configure(decoderConfig)
```


###### web-demuxer

```typescript

import { WebDemuxer } from 'web-demuxer';

const demuxer = new WebDemuxer({
    wasmFilePath: "https://cdn.jsdelivr.net/npm/web-demuxer@latest/dist/wasm-files/web-demuxer.wasm",
});

await demuxer.load(file);
const mediaInfo = await demuxer.getMediaInfo();
const videoTrack = mediaInfo.streams.filter((s)=>s.codec_type_string === 'video')[0];

decoder.configure({codec: videoTrack.codec_string})
```

###### MP4Box

You can use the same utility MP4Box reader provided earlier (only for MP4 files)


```typescript

const {trackData} = await parseMP4Metadata(file);
decoder.configure(trackData.video)

```


<details>
<summary>Custom MP4Box Reader</summary>

```typescript
import MP4Box, {
    MP4File,
    MP4Info,
    MP4MediaTrack,
    MP4ArrayBuffer,
    MP4Sample,
    MP4Track,
    DataStream,
  } from "mp4box";
  
  // Types
  export interface TrackData {
    duration: number;
    audio?: AudioTrackData;
    video?: VideoTrackData;
  }
  
  export interface AudioTrackData {
    codec: string;
    sampleRate: number;
    numberOfChannels: number;
  }
  
  export interface VideoTrackData {
    codec: string;
    codedHeight: number;
    codedWidth: number;
    description: Uint8Array;
    frameRate: number;
  }
  
  export interface MP4Data {
    mp4: MP4File;
    trackData: TrackData;
    info: MP4Info;
  }
  
  // Constants
  const CHUNK_SIZE = 100; // Samples per extraction batch
  const FRAME_RATE_THRESHOLD = 0.5; // Seconds tolerance for frame rate calculation
  const DURATION_BUFFER = 0.1; // Prevent reading beyond actual duration
  
  /**
   * Extract codec description box from MP4 track.
   * Handles avcC (H.264), hvcC (HEVC), vpcC (VP8/VP9), and av1C (AV1).
   */
  function extractCodecDescription(
    mp4: MP4File,
    track: MP4MediaTrack
  ): Uint8Array {
    const trak = mp4.getTrackById(track.id);
  
    for (const entry of trak.mdia.minf.stbl.stsd.entries) {
      const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
      if (box) {
        const stream = new DataStream(
          undefined,
          0,
          DataStream.BIG_ENDIAN
        );
        box.write(stream);
        // Skip 8-byte box header (4 bytes size + 4 bytes type)
        return new Uint8Array(stream.buffer, 8);
      }
    }
  
    throw new Error(
      "Codec description box (avcC, hvcC, vpcC, or av1C) not found"
    );
  }
  
  /**
   * Extract track metadata from MP4 file.
   * Returns duration, codec, dimensions, and frame rate for both audio and video.
   */
  function extractTrackData(mp4: MP4File, info: MP4Info): TrackData {
    const trackData: TrackData = {
      duration: info.duration / info.timescale,
    };
  
    // Video track
    if (info.videoTracks.length > 0) {
      const videoTrack = info.videoTracks[0];
      const sampleDurationInSeconds =
        videoTrack.samples_duration / videoTrack.timescale;
  
      trackData.video = {
        codec: videoTrack.codec,
        codedHeight: videoTrack.video.height,
        codedWidth: videoTrack.video.width,
        description: extractCodecDescription(mp4, videoTrack),
        frameRate: videoTrack.nb_samples / sampleDurationInSeconds,
      };
    }
  
    // Audio track
    if (info.audioTracks.length > 0) {
      const audioTrack = info.audioTracks[0];
      const sampleRate =
        audioTrack.audio?.sample_rate ?? audioTrack.timescale;
      const channelCount = audioTrack.audio?.channel_count ?? 2;
  
      trackData.audio = {
        codec: audioTrack.codec,
        sampleRate,
        numberOfChannels: channelCount,
      };
    }
  
    return trackData;
  }
  
  /**
   * Stream an MP4 file and extract metadata.
   * Reads file in chunks and reports progress via postMessage.
   * Resolves when MP4Box signals readiness.
   */
  async function parseMP4Metadata(file: File): Promise<MP4Data> {
    return new Promise((resolve, reject) => {
      const reader = file.stream().getReader();
      let offset = 0;
      const mp4 = MP4Box.createFile(false);
      let metadataReady = false;
  
      mp4.onReady = (info: MP4Info) => {
        metadataReady = true;
        const trackData = extractTrackData(mp4, info);
        resolve({ info, trackData, mp4 });
      };
  
      mp4.onError = (err: unknown) => {
        reject(
          new Error(
            `MP4Box parsing error: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      };
  
      const readNextChunk = async (): Promise<void> => {
        try {
          const { done, value } = await reader.read();
  
          if (done) {
            if (!metadataReady) {
              throw new Error("Invalid MP4 file: metadata not available");
            }
            mp4.flush();
            return;
          }
  
          if (metadataReady) {
            // Once metadata is ready, stop reading more chunks
            reader.releaseLock();
            mp4.flush();
            return;
          }
  
          const buffer = value.buffer as MP4ArrayBuffer;
          buffer.fileStart = offset;
          offset += value.length;
  
          // Report progress
          postMessage({
            request_id: "load_progress",
            res: offset / file.size,
          });
  
          mp4.appendBuffer(buffer);
  
          // Continue reading
          if (offset < file.size) {
            return readNextChunk();
          } else {
            mp4.flush();
            if (!metadataReady) {
              throw new Error("Invalid MP4 file: metadata not available");
            }
          }
        } catch (error) {
          reject(error);
        }
      };
  
      readNextChunk().catch(reject);
    });
  }
  
  /**
   * Extract encoded samples (audio or video) from a time range.
   * Uses MP4Box's extraction API to get chunks efficiently.
   * Handles message passing for progress reporting.
   */
  async function extractEncodedSegment(
    file: File,
    mp4Data: MP4Data,
    trackType: "audio" | "video",
    startTime: number,
    endTime: number
  ): Promise<EncodedVideoChunk[] | EncodedAudioChunk[]> {
    const { mp4, info } = mp4Data;
  
    return new Promise((resolve, reject) => {
      let fileOffset = 0;
      let extractionFinished = false;
      let trackId = 0;
  
      const EncodedChunk =
        trackType === "audio" ? EncodedAudioChunk : EncodedVideoChunk;
      const chunks: (EncodedVideoChunk | EncodedAudioChunk)[] = [];
  
      // Find the appropriate track
      const selectedTrack =
        trackType === "audio"
          ? info.audioTracks[0] ?? null
          : info.videoTracks[0] ?? null;
  
      if (!selectedTrack) {
        resolve([]);
        return;
      }
  
      trackId = selectedTrack.id;
  
      // Normalize time bounds
      const maxDuration = info.duration / info.timescale - DURATION_BUFFER;
      const normalizedEnd = Math.min(endTime || maxDuration, maxDuration);
  
      // Clear previous extraction options for all tracks
      for (const trackIdStr in info.tracks) {
        const track = info.tracks[trackIdStr];
        mp4.unsetExtractionOptions(track.id);
      }
  
      // Set up sample extraction callback
      mp4.onSamples = (id: number, _user: unknown, samples: MP4Sample[]) => {
        for (const sample of samples) {
          const sampleTime = sample.cts / sample.timescale;
  
          // Only include samples within the requested time range
          if (sampleTime < normalizedEnd) {
            chunks.push(
              new EncodedChunk({
                type: sample.is_sync ? "key" : "delta",
                timestamp: Math.round(1e6 * sampleTime),
                duration: Math.round(
                  1e6 * (sample.duration / sample.timescale)
                ),
                data: sample.data,
              })
            );
          }
        }
  
        // Release processed samples to free memory
        if (samples.length > 0) {
          mp4.releaseUsedSamples(trackId, samples[samples.length - 1].number);
        }
  
        // Check if we've reached the end
        if (chunks.length > 0) {
          const lastChunk = chunks[chunks.length - 1];
          const lastChunkTime = lastChunk.timestamp / 1e6;
  
          if (
            Math.abs(lastChunkTime - normalizedEnd) < FRAME_RATE_THRESHOLD ||
            lastChunkTime > normalizedEnd
          ) {
            extractionFinished = true;
            mp4.stop();
            mp4.flush();
            resolve(chunks);
          }
        }
      };
  
      mp4.onError = (err: unknown) => {
        reject(
          new Error(
            `Extraction error: ${err instanceof Error ? err.message : String(err)}`
          )
        );
      };
  
      // Configure extraction: request 100 samples at a time
      mp4.setExtractionOptions(trackId, null, { nbSamples: CHUNK_SIZE });
  
      // Seek to start position
      const seekResult = mp4.seek(startTime, true);
  
      // Stream the file starting from seek position
      const contentReader = file
        .slice(seekResult.offset)
        .stream()
        .getReader();
      fileOffset = seekResult.offset;
  
      const readNextSegment = async (): Promise<void> => {
        try {
          const { done, value } = await contentReader.read();
  
          if (done || extractionFinished) {
            contentReader.releaseLock();
            mp4.flush();
            return;
          }
  
          const buffer = value.buffer as MP4ArrayBuffer;
          buffer.fileStart = fileOffset;
          fileOffset += value.length;
  
          mp4.appendBuffer(buffer);
          return readNextSegment();
        } catch (error) {
          reject(error);
        }
      };
  
      mp4.start();
      readNextSegment().catch(reject);
    });
  }
  
  // Cache for parsed MP4 data to avoid re-parsing the same file
  let cachedMP4Data: MP4Data | null = null;
 
  /**
   * Extract encoded samples from an MP4 file.
   * Caches parsed metadata to avoid re-parsing on multiple extractions.
   * @param file - The MP4 file to extract from
   * @param trackType - "audio" or "video"
   * @param startTime - Start time in seconds
   * @param endTime - End time in seconds (0 or undefined = entire track)
   */
  export async function extractMP4Segment(
    file: File,
    trackType: "audio" | "video",
    startTime: number,
    endTime: number
  ): Promise<EncodedVideoChunk[] | EncodedAudioChunk[]> {
    // Parse metadata if not cached or file changed
    if (!cachedMP4Data) {
      cachedMP4Data = await parseMP4Metadata(file);
    }
  
    return extractEncodedSegment(file, cachedMP4Data, trackType, startTime, endTime);
  }
```


</details>




### Rube Goldberg Machine

When building a decoding pipeline, the first thing to keep in mind is that decoding isn't just some async process. You can't just decode individual chunks and await for the results.

```typescript
// Does not work like this
const frame  = await decoder.decode(chunk); 
```

Because decoding isn't just some compute-heavy function. The `VideoDecoder` is a wrapper around actual hardware which works with frames in batches, and also requires multiple internal async calls between the CPU and the GPU. 

It might be easier to visualize the decoder as like a [Rube-Goldberg machine](https://en.wikipedia.org/wiki/Rube_Goldberg_machine), where you continuously feed in chunks to decode, and video frames come out the other end.

![](/src/assets/content/basics/decoder/rube-goldberg.png)

You don't need to know how it works internally, but you do need to feed a few chunks to get it started, processing is non-linear, and you get frames when you get them.

#### Warmup chunks

I'm very much not joking with the contraption analogy. If you set up your decoder and then send 2 chunks for decoding, the decoder may never generate a single frame.

```typescript
const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){
        // This will never fire
    },
    error: function(e: any)=> console.warn(e);
});

decoder.configure(/*config*/)
decoder.decode(chunks[0]);
decoder.decode(chunks[1]);
```

You may need to send 3 to 5 chunks for decoding before the first rendered frame comes out, and the number of chunks you need to send depends on the device, browser, codec and video.

As you send more chunks for decoding, it 'pushes' the chunks inside the decoder along, and the number of frames rendered sometimes lagging behind the number of chunk sent for decoding.

#### Chunks can get stuck

A consequence of this is that frames can sometimes get stuck. If you send all your chunks for decoding, and you have no more 'chunks' to push the decoder along, the last few frames may never generate.

![](/src/assets/content/basics/decoder/rube-goldberg-2.png)

The solution is to call `decoder.flush()` which will force everything along, with the limitation that when you do this, the next chunk that you send for processing needs to be a *key frame* (`chunk.type === 'key'`) or the decoder will throw an error.


#### Pipelines

As a consequence, instead of treading decoding as an async task (e.g. `for frame of framesInVideo`), it's better to think of decoding as a pipeline, where you will be continously decoding chunks and generating frames, and you need to need to track the data flows:
* Where chunks are sent for decoding
* Where frames are generated
* Where frames are consumed

As well as keep track of state (how many chunks have been sent for decoding, how many frames have been generated etc..), and manage memory (the decode queue size, how many frames are in memory).

### Decoding Loop

Let's move from theory and hello world examples to practical code. Let's say you just want to play back a 10 minute video in the browser. The hello world examples thus far won't help because:

* You shouldn't feed 10 minutes worth of video chunks to the decoder at once
* Decoders work very quickly, so if you render frames as soon as they generate, it will playback at 20x-100x speed.
* If you generate too many frames without closing them, the browser will crash

To simplify, we won't jump to a full web-codecs video player (covered in Design patterns), but we'll build up to it.  For now let's simplify:
* Forget about playback control, just play the video back at 30fps
* No audio
* Read all the chunks into memory at init (fine for a 10 minute 360p video).


So we'll pretend we already have chunks and metadata
```typescript
const {chunks, metaData} = await demuxFile(<File> file);
```



Here are some core concepts we'll need to start with:

**decodeChunkIndex**: A variable keeping track of how many chunks have been sent for decoding.

```typescript
let decodeChunkIndex=0;
```

**BATCH_DECODE_SIZE**: We will send chunks for decoding in batches. You can set the batch size, if it' too low (below 5) the decoder might get stuck. If it's too high, you might run into memory issues. 10 is a safe value.

```typescript
const BATCH_DECODE_SIZE=10;
```

**DECODE_QUEUE_LIMIT**: We need to limit the number of chunks being handled by the decoder at a given time, to avoid now overwhelming the decoder. This is not a big risk for the decoder, (this is very much a risk for encoders) but for a production pipeline it's better to have it than not.

```typescript
const DECODE_QUEUE_LIMIT=20;
```


**fillBuffer()**: A function which we will use to send chunks for decoding, which limits the number of chunks sent to the decode size and limits the size of the decode_que.

```typescript


function fillBuffer(){

    for(let i=0; i < BATCH_DECODE_SIZE; i++){
        if(decodeChunkIndex  < chunks.length){

            if(decoder.decodeQueueSize > DECODE_QUEUE_LIMIT) continue;
            try{
                decoder.decode(decodeChunkIndex);
                decodeChunkIndex +=1;

                if(decodeChunkIndex === chunks.length) decoder.flush();
            } catch (e) {
                console.log(e);
            }
        }
        
    }
}

```

**Render Buffer**: We can't render `VideoFrame` objects as soon as they are decoded by the decoder, otherwise the video will play back at 20x to 100x speed. We therefore need to store rendered frames in a buffer, and consume frames from the buffer.

```typescript 
const render_buffer = [];
```


**lastRenderedTime**: For playback and decoder stability, we add a `lastRenderedTime` which we will use to make sure that we don't add frames to the frame buffer that are before the current playback position.
```typescript 
let lastRenderedTime = 0;
```

**render(time)**  We will create a render function, which takes a timestamp as as argument. It will then take the latest frame in the render_buffer whose timestamp is less than the render time, and render that. Note that we only call fillBuffer in the render function.


```typescript

const canvas = new OffscreenCanvas(metaData.width, metaData.height);
const ctx = canvas.getContext('2d');


render(time: number){

    lastRenderedTime = time;
    if(render_buffer.length ===0) return;

    const latest_frame = getLatestFrame(time);

    if(latest_frame < 0) return;


    for(let i=0; i < latest_frame-1; i++){
        render_buffer[i].close()
    }
    render_buffer.splice(0, latest_frame-1); //Drop frames

    const frame_to_render = render_buffer.shift();
    ctx.drawImage(frame_to_render, 0, 0);
    frame_to_render.close();

    if(render_buffer.length < BATCH_DECODE_SIZE/2) fillBuffer();

}

```


**getLatestFrame(time)** We'll create the utility function mentioned in the render function to get the index of the latest frame in the render_buffer

```typescript

getLatestFrame(time: number){


    for (let i=0; i < render_buffer.length-1; i++){

        if(render_buffer[i+1].timestamp < render_buffer[i].timestamp){
            return i+1;
        }
    }

    if(render_buffer[0].timestamp/1e6 > time) return -1;

    let latest_frame_buffer_index = 0;

    for (let i=0; i < render_buffer.length; i++){

        if (render_buffer[i].timestamp/1e6 < time &&  render_buffer[i].timestamp > render_buffer[latest_frame_buffer_index].timestamp){
            latest_frame_buffer_index = i
        }
    }

    return latest_frame_buffer_index;



}

```


**decoder** It's only now that we can finally define our decoder, which will take frames than then fill the render buffer. If the frames generated are behind the last rendered time, we need to close them, and fill the buffer as necessary so the decoder can catch up to the playback head.

```typescript


const decoder = new VideoDecoder({
    output: function (frame: VideoFrame){

        if(frame.timestamp/1e6 < lastRenderedTime) {
            frame.close();
            if(render_buffer.length < BATCH_DECODE_SIZE) {
                fillBuffer();
            }
            return;
        }
        
        render_buffer.push(frame)

    }

    error: function (error: Error){
        console.warn(error);
    }
},

)

decoder.configure(metaData.video);

```

**render loop** In the real world, we'd have audio playback dictate the current time of the player, and use that in the argument to the render function. Here for this simple example, we'll set an interval to run render every 30ms.


```typescript
function start(){

  const start_time = performance.now();

  fillBuffer();

  setInterval(function(){

    const current_time = (performance.now() - start_time)/1000; //Convert from seconds to milliseconds;

    render(current_time)


  }, 30);


}

```





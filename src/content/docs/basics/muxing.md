---
title: Muxing and Demuxing
description: Why WebCodecs is harder than it looks
---

As mentioned before, WebCodecs by itself cannot read or write playable video files. You can't just take a bunch of `EncodedVideoChunk` objects, put them in a `Blob` and call it a day.

```typescript
// This will not work!
async function encodeVideo(frames: VideoFrame[]){
  const chunks = <EncodedVideoChunk[]>await encodeFrames(<VideoFrame[]> frames);
  return new Blob(chunks, {type: "video/mp4"}); //Not how this works
}
```

To work with actual video files, you need an additional step called Demuxing (to read video files) or Muxing (to write video files).


```typescript
// This is psuedocode
const chunks = <EncodedVideoChunk[]> await getChunks(file);

const muxer = new ExampleMuxer(/**configuration */);

for (const chunk of chunks){
  muxer.addVideoChunk(chunk);
}

const arrayBuffer =  muxer.finish();

const blob = new Blob([arrayBuffer], {type: 'video/mp4'})

```


### Containers

When a video player reads a video file for playback, it needs more info than just encoded video frames and encoded audio, it needs metadata about the video, such as the tracks, video duration, frame rate, resolution, etc..

![](/src/assets/content/basics/muxing/video-container.png)

It also need to have enough info to tell the video player where each encoded chunk is in the source file.

```javascript
const chunk = new EncodedChunk({
      data: file.slice(start, end), //Calculate offsets from metadata
      //...
});

```

Each video file format, such as MP4 and WebM, has it's own specification for how to store metadata and audio/video data in a file, as well as how to extract that information. 

Storing data into a file (according to the specification) is called muxing, and extracting data from a file (according to the specification) is called demuxing.


The format specifications are complex, and **the point of muxing/demuxing libraries is to follow these specifications**, so you can read/write video to files without worrying about the details.

In the video world, we call file itself a *container* and the format (e.g. WebM, MP4) a *container format*.  For the curious, here are the docs for each container format:
* [WebM](https://www.webmproject.org/docs/container/)
* [MP4](https://developer.apple.com/documentation/quicktime-file-format)




#### Codecs are not containers

*Containers*  are different from *codecs*, which are the compression algorithms for actually encoding/decoding each Video/Audio chunk into raw audio/video.


**Containers**:
* Provide meta data
* Where in the file to extract individual encoded chunks

**Codecs**:
* Turn encoded chunks into raw video or audio (and vice versa)

A given container format can actually support video encoded in various different formats, here is a table for the most common containers and video codecs used in browsers:

|Codec| **MP4** | **WebM** |
|---|---|---|
| **H.264** | ✅  | ❌  |
| **H.265** | ✅  | ❌  |
| **VP8** | ❌ | ✅ |
| **VP9** | 🟡  | ✅  |
| **AV1** | 🟡   | ✅ |

Though as the 🟡 suggests, support depends on the invidual video player or encoding software.

### Demuxing

To read `EncodedVideoChunk` objects from video file, the easiest way would be to use a demuxing library like [Media Bunny](https://mediabunny.dev/), though I'll present a few different options.

##### MediaBunny

```typescript

import { EncodedPacketSink, Input, ALL_FORMATS, BlobSource } from 'mediabunny';

const input = new Input({
	formats: ALL_FORMATS,
	source: new BlobSource(<File> file),
});

const videoTrack = await input.getPrimaryVideoTrack();
const sink = new EncodedPacketSink(videoTrack);

for await (const packet of sink.packets()) {
	const chunk = <EncodedVideoChunk> packet.toEncodedVideoChunk();
}
```

You'd first import the relevant functions from MediaBunny, and then create an `Input` reference to a file, extract the `VideoTrack`.

From there, to read individual source chunks, you could create an `EncodedPacketSink`, and get packets from the sink, but as we'll see in the [MediaBunny Section](../media-bunny/use-cases.md), you don't actually need to touch `EncodedVideoChunk` directly, the library can handle decoding you can directly go to reading `VideoFrame` objects without dealing with a `VideoDecoder`, making MediaBunny by far the most user-friendly option.

##### web-demuxer

If you want more control and want to manage the `VideoDecoder`, `EncodedVideoChunk` objects and file reading process yourself, you can use [web-demuxer](https://github.com/bilibili/web-demuxer)


```typescript
import { WebDemuxer } from "web-demuxer";

const demuxer = new WebDemuxer();
await demuxer.load(<File> file);

const mediaInfo = await demuxer.getMediaInfo();
const videoTrack = mediaInfo.streams.filter((s)=>s.codec_type_string === 'video')[0];


const chunks: EncodedVideoChunk[] = [];

const reader = demuxer.read('video', start, end).getReader();
reader.read().then(async function processPacket({ done:boolean, value: EncodedVideoChunk }) {
    if(value) chunks.push(value);
    if(done) return resolve(chunks);
    return reader.read().then(processPacket)
});
```


##### MP4Box

If you want even more control, and are okay with just using MP4 inputs, you can use [MP4Box.js](https://github.com/gpac/mp4box.js).

Unlike the other two libraries, MP4Box wasn't built to integrate with WebCodecs, so while it gives you all the right info, you need to add some extra wrapper code to read and extract `EncodedVideoChunk` objects.

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



##### Manual demuxer

~~Don't build your own demuxer~~, I'm not your boss, maybe you have some custom use case for manual demuxing. That said, building your own demuxing library is complex and error prone, but if you want to, or if you're just curious, here's some guidance.

**MP4 Files**:

MP4 files store data in the form of 'boxes', and there are different types of boxes, like *mdat* (audio/video data) and *moov* (metadata) which each contain different types of data, and syntax for storing or parsing that data. Boxes can be nested, and so you'd need to read through a file, seperate out all the boxes, and parse the data from each box.

Here is a [list](https://mp4ra.org/registered-types/boxes) of boxes, and you can inspect the [source code](https://github.com/gpac/mp4box.js) of MP4Box to see how they parse boxes and how they handle [each box type](https://github.com/gpac/mp4box.js/tree/main/src/boxes).

<br/>
<small>
I personally don't have much experience with this, but from my initial attempts at manually parsing MP4s in pure Javascript, it is more complex than parsing WebM files. </small>


**WebM Files** 

WebM files use format called [Extensible Binary Meta Language](https://en.wikipedia.org/wiki/Extensible_Binary_Meta_Language), which is like a binary version of XML. You can use an [EBML parser](https://github.com/legokichi/ts-ebml) to read a WebM file and extract all the EBML elements

```javascript
import * as EBML from 'ts-ebml';
const decoder = new ebml.Decoder();
const arrayBufer = await file.arrayBuffer();
const ebmlElms = decoder.decode(arrayBuffer);
```

You can refer to the [official docs](https://www.webmproject.org/docs/container/) for what each Element name is and does, or can just read in a WebM file in a browser and inspect for yourself.  

Here is a very barebones example of manually parsing a WebM file purely for illustrative purposes.

<details>
<summary>Demo WebM Parser (proof of concept)</summary>

```javascript

/**   Demo WebM Parser
Do not use this in production or as the basis for production code. 
This is only for learning purposes and should be treated as pseudocode.
**/
import * as EBML from 'ts-ebml';

/**
 * @typedef {Object} VideoTrack
 * @property {number} trackNumber
 * @property {string} codecId
 * @property {'video' | 'audio'} type
 * @property {Uint8Array} [description]
 */

/**
 * @typedef {Object} VIntResult
 * @property {number} value
 * @property {number} size
 */

export class DemoWebMParser {
  constructor() {
    this.ebmlDecoder = new EBML.Decoder();
  }

  /**
   * @param {ArrayBuffer} buffer
   * @returns {{ tracks: VideoTrack[], videoTrack: VideoTrack | undefined, chunks: EncodedVideoChunk[] }}
   */
  parse(buffer) {
    const ebmlElements = this.ebmlDecoder.decode(buffer);
    const tracks = this.getTracks(ebmlElements);
    const videoTrack = tracks.find(t => t.type === 'video');
    const chunks = this.getVideoChunks(ebmlElements, videoTrack);

    return { tracks, videoTrack, chunks };
  }

  /**
   * @param {any[]} ebmlElements
   * @returns {VideoTrack[]}
   */
  getTracks(ebmlElements) {
    const tracks = [];

    for (let i = 0; i < ebmlElements.length; i++) {
      const el = ebmlElements[i];

      if (el.name === 'TrackEntry') {
        const track = {};

        for (let j = i + 1; j < ebmlElements.length; j++) {
          const trackEl = ebmlElements[j];

          if (trackEl.name === 'TrackEntry') break;

          if (trackEl.name === 'TrackNumber') {
            track.trackNumber = trackEl.value;
          } else if (trackEl.name === 'CodecID') {
            track.codecId = trackEl.value;
          } else if (trackEl.name === 'TrackType') {
            track.type = trackEl.value === 1 ? 'video' : 'audio';
          } else if (trackEl.name === 'CodecPrivate') {
            track.description = trackEl.data;
          }
        }

        if (track.trackNumber) {
          tracks.push(track);
        }
      }
    }

    return tracks;
  }

  /**
   * @param {any[]} ebmlElements
   * @param {VideoTrack} track
   * @returns {EncodedVideoChunk[]}
   */
  getVideoChunks(ebmlElements, track) {
    const chunks = [];

    for (let i = 0; i < ebmlElements.length; i++) {
      const el = ebmlElements[i];

      if (el.name !== 'Cluster') continue;

      let tsEl;
      let k;

      for (let j = i; j < ebmlElements.length; j++) {
        const elJ = ebmlElements[j];

        if (elJ.name === 'Timestamp') {
          tsEl = elJ;
          k = j;
          break;
        }
      }

      if (tsEl && k) {
        const clusterTimestamp = tsEl.value;

        for (let j = k + 1; j < ebmlElements.length; j++) {
          const elJ = ebmlElements[j];

          if (elJ.name !== 'SimpleBlock') break;

          const data = new Uint8Array(elJ.data);
          let offset = 0;

          const { value: trackNum, size } = this.readVInt(data, offset);
          offset += size;

          const relativeTs = (data[offset] << 8) | data[offset + 1];
          offset += 2;

          const flags = data[offset];
          offset += 1;

          const isKeyframe = (flags & 0x80) !== 0;
          const frameData = data.slice(offset);
          const blockTimestamp = relativeTs + clusterTimestamp;

          if (trackNum === track.trackNumber) {
            const chunk = new EncodedVideoChunk({
              type: isKeyframe ? "key" : "delta",
              timestamp: blockTimestamp * 1e3,
              data: frameData,
              duration: 42 * 1e3 // Hard coded
            });

            chunks.push(chunk);
          }
        }
      }
    }

    return chunks;
  }

  /**
   * @param {Uint8Array} data
   * @param {number} offset
   * @returns {VIntResult}
   */
  readVInt(data, offset) {
    const firstByte = data[offset];

    let size = 1;
    let mask = 0x80;
    while (size <= 8 && (firstByte & mask) === 0) {
      size++;
      mask >>= 1;
    }

    let value = firstByte & (mask - 1);

    for (let i = 1; i < size; i++) {
      value = (value << 8) | data[offset + i];
    }

    return { value, size };
  }
}


```


</details>




### Muxing

To write `EncodedVideoChunk` objects to a file, you need a muxer. Here the primary option is [MediaBunny](https://mediabunny.dev/)


##### MediaBunny

```typescript

import {
  EncodedPacket,
  EncodedPacketVideoSource,
  BufferTarget,
  Mp4OutputFormat,
  Output
} from 'mediabunny';

async function muxChunks(function(chunks: EncodedVideoChunk[]): Promise <Blob>{

    const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
    });

    const source = new EncodedVideoPacketSource({codec: 'avc'});
    output.addVideoTrack(source);

    await output.start();

    for (const chunk of chunks){
        source.add(EncodedPacket.fromEncodedChunk(chunk))
    }

    await output.finalize();
    const buffer = <ArrayBuffer> output.target.buffer;
    return new Blob([buffer], { type: 'video/mp4' });

});

```

Though as with demuxing with MediaBunny, in most cases, you don't even need to deal with `EncodedVideoChunk` or `VideoEncoder` objects, MediaBunny is actually *less verbose* for writing video frames to a file as we'll see in the [MediaBunny Section](../media-bunny/use-cases.md).


##### WebMMuxer/MP4Muxer

If you do want to work directly with `EncodedVideoChunk` objects, you might consider [WebMMuxer](https://github.com/Vanilagy/webm-muxer) and [MP4Muxer](https://github.com/Vanilagy/mp4-muxer) which are actually from the same author and are deprecated in favor of MediaBunny, but which more directly work with `EncodedVideoChunk`objects directly.


```typescript

import {ArrayBufferTarget,  Muxer} from "mp4-muxer";
async function muxChunks(function(chunks: EncodedVideoChunk[]): Promise <Blob>{

    const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
            codec: 'avc',
            width: chunks[0].codedWidth,
            height: chunks[0].codedHeight
        }
    });

    for (const chunk of chunks){
        muxer.addVideoChunk(chunk);
    }

    await muxer.finalize();
    const buffer = <ArrayBuffer> output.target.buffer;
    return new Blob([buffer], { type: 'video/mp4' });

});


```

##### Manual Muxing

~~No~~  

~~Don't do it~~

~~Just.. No...~~

See [above](#manual-demuxer)
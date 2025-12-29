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
- Reading the metadata
- Reading finding each video file
- Finding each sample

Each container has it's own storage format
- WebM
- MP4



### Demuxing Libraries

MediaBunny




###  Encoding
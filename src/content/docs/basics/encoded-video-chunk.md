---
title: EncodedVideoChunk
description: EncodedVideoChunk
---

The `EncodedVideoChunk` class, the other main type in WebCodecs, repesents the compressed (or "encoded") version of a single `VideoFrame`

![](/src/assets/content/basics/chunks/encoded-chunk.svg)

The `EncodedVideoChunk` contains binary data (the encoded `VideoFrame`) and some metadata, and there is a 1:1 correspondence between `EncodedVideoChunk` and `VideoFrame` objects - if you encode 100 `VideoFrame` objects, you should expect 100 `EncodedVideoChunk` objects from the encoder.

Unlike a `VideoFrame`, an `EncodedVideoChunk` objects can't be directly rendered or displayed because the data is enocoded,but they can be directly read from, or written to video files (via [muxing](../muxing)).



### Compession, not muxing

<mark>EncodedVideoChunks are not by themselves video files </mark>. 

You can not just encode a bunch of video frames, store the chunks in a blob and call it a day.


```typescript
// This will not work!
async function encodeVideo(frames: VideoFrame[]){
  const chunks = <EncodedVideoChunk[]>await encodeFrames(<VideoFrame[]> frames);
  return new Blob(chunks, {type: "video/mp4"}); //Not how this works
}
```

If you want to write your encoded video chunks to a video file, that requires an additional step called [muxing](../muxing), there are [libraries](https://mediabunny.dev/) that do this for you, we'll get to those in the next section.


For now, keep in mind that WebCodecs focuses on just on codecs, and [codecs means compression](../../intro/what-are-codecs), so WebCodecs will only help you with transforming raw video data into compressed (encoded) video data and vice versa.

You might think "that's annoying", as if WebCodecs doesn't provide a complete solution, but keep in mind that muxing and other utilities are easily implemented as 3rd party libraries. What a library can't do is access hardware-accelerated video encoding or decoding without the browser's help, and so that is exactly what WebCodecs is helps with.




### Why compression is still helpful

-- Streaming example

<iframe src="/demo/encoded-chunk-throughput/encoded-pipeline.html" width="800" height="350" frameBorder="0"  style="height: 380px;"
></iframe>


### Raw Video

<iframe src="/demo/encoded-chunk-throughput/raw-pipeline.html" width="800" height="350" frameBorder="0"  style="height: 380px;"
></iframe>


## Key Frames
-- Key Frames vs Delta Frames, order matters
-- Delta frames


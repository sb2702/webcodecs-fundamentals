---
title: How to transcode video with WebCodecs
description: A comprehensive guide for to use WebCodecs to transcode video in the browser
---

In the [Video Decoder](../../basics/decoder) section, we learned how to decode video, and in the [Video Encoder](../../basics/decoder) section, we learned how to encode video, and so naturally you'd think that transcoding is just chaining those two things together.

![](/assets/basics/encoder/rube-goldberg-2.png)


Conceptually yes, transcoding is just chaining a decde process to an encode process, but as we discussed earlier, a `VideoEncoder` and `VideoDecoder` aren't simple `async` calls, but rather more like Rube Goldberg machines that you have to push chunks and frames through.

To properly implement transcoding in WebCodecs, we can't just think of it as a simple for loop:

```typescript
//Pseudocode. This is NOT how transcoding works
for (let i=0; i< numChunks; i++){
    const chunk = await demuxer.getChunk(i);
    const frame = await decoder.decodeFrame(frame);
    const processed = await render(frame);
    const encoded = await encoder.encode(processed);
    muxer.mux(encoded);
}
```

Instead, we need to think of it as a pipeline, where you are chaining stages together, and each stage is simultanoeusly holding multiple chunks or frames.

![](/assets/basics/encoder/rube-goldberg-3.png)

As we'll see in this section, I'm not mentioning pipelines just as an anology, we'll build a Javascript transcoding pipeline via the [Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/).


## Stages in our Pipeline

In reality, our pipeline is more than just a decoder and an encoder, there are actually 5 stages.

**File Reader**: First, we need to read `EncodedVideoChunk` objects from the file. While in previous examples we've loaded the entire video's worth of chunks at once, in production we want to read `EncodedVideoChunk` objects progressively, ideally as a "Read Stream", where we're streaming chunks from the file's hard disk. The demuxing library [web-demuxer](https://github.com/bilibili/web-demuxer/) explicitly returns a Javascript `ReadableStream` while [MediaBunny](https://mediabunny.dev/) does streaming internally, but both read from the source file on hard disk and return a stream of `EncodedVideoChunk` objects.


![](/assets/patterns/transcoding/pipeline-1.svg)



**Decoding**: Next we need to decode the `EncodedVideoChunk` objects into `VideoFrame`, consider this a 'data transformation' stage of the pipeline.

![](/assets/patterns/transcoding/pipeline-2.svg)


**Render**: You may optionally want to do some kind of processing on the frame, like adding a filter, taking in one `VideoFrame` and returning another `VideoFrame` object.

![](/assets/patterns/transcoding/pipeline-3.svg)


**Encoding** You then need to take in the `VideoFrame` objects, and encode them, and return `EncodedVideoChunk` objects.

![](/assets/patterns/transcoding/pipeline-4.svg)



**Muxing** Finally, we need to take each `EncodedVideoChunk` object and mux it by inserting the data and metadata into an `ArrayBuffer` or potentially to an actual file on hard disk. You would consider this a 'write stream'.



![](/assets/patterns/transcoding/pipeline-5.svg)

Overall this gives us a complete transcoding pipeline of 5 stages, from the source file to the destination file:

![](/assets/patterns/transcoding/pipeline.svg)



## Javascript Streams API

* ReadStream
* Write Stream
* Transform Stream
* Pipeline
* Transform Stream API

## Transcoding Stream

## File Reader

### Decoder

### Processor

### 

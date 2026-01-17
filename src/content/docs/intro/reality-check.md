---
title: Why WebCodecs is harder than it looks
description: Why WebCodecs is harder than it looks
---



If you're sold on building with WebCodecs, great! I now want to moderate your expectations a bit, because building with WebCodecs is more difficult than it looks.

Consider this deceptively simple "hello world" example in ~20 lines of code to decode and play a video.

```typescript
import { demuxVideo } from 'webcodecs-utils'

async function playFile(file: File){

    const {chunks, config} =  await demuxVideo(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const decoder = new VideoDecoder({
        output(frame: VideoFrame) {
            ctx.drawImage(frame, 0, 0);
            frame.close()
        },
        error(e) {}
    });

    decoder.configure(config);

    for (const chunk of chunks){
        decoder.decode(chunks)
    }

}

```

Where you read a file, extract `EncodedVideoChunk` objects, decode them, and paint the resulting `VideoFrame` objects to a canvas. While this code isn't objectively wrong, it's a proof-of-concept, not a video player, and there are so many issues with it.


### Basic issues


Let's start with the obvious:


##### Muxing/Demuxing
How do you extract `EncodedVideoChunk` objects from a `File`? I put this mysterious `getChunks` method as a placeholder, but in reality the process of going from `File` to `EncodedVideoChunk[]` is a whole other thing called [demuxing](../../basics/muxing), involving parsing the source video, and extracting byte ranges for each frame, and constructing an `EncodedVideoChunk` object. 

The WebCodecs API **doesn't help you at all there**, you need to "Bring your own chunks", but fortunately there are [libraries](../media-bunny/) that help with this, which we'll get to.



##### Audio

This code doesn't handle audio. There are audio equivalents to each one of the video classes previously mentioned. 

| Video    | Audio |
| -------- | ------- |
| `VideoDecoder`  | `AudioDecoder`    |
| `VideoEncoder` | `AudioEncoder`     |
| `VideoFrame`    | `AudioData`    |
| `EncodedVideoChunk`    | `EncodedAudioChunk`    |


Fortunately the API for `AudioEncoder`, `AudioDecoder` and `EncodedAudioChunk` are nearly identical to their video equivalents, but `AudioData` is quite different from `VideoFrame`.

You not only need to extract raw audio from video, you'd also need to play it back using WebAudio, and you also need to synchronize the audio and video. There are established [patterns](../../patterns/playback/) for this which we'll get to.

##### VideoFrame memory

`VideoFrame` objects are memory intensive - a single 4K video frame would take about 24 MB of Video memory on a graphics card, meaning that a modest graphics card (~5GB of Video Memory)  would at most be able to have 200 frames in memory (~7 seconds of video) in the best case scenario.

So if you have a 4K video that is longer than 7 seconds, the above code would crash most computers. Managing lifecycle memory for `VideoFrame` objects isn't a 'performance optimization', WebCodecs code just won't work without managing memory.

You can very easily free up memory by calling `frame.close()` to free up the video memory from a `VideoFrame` once you are done using it, which is fine enough for this use case, but keep in mind that real world implementations will involve keeping a buffer of `VideoFrame` objects in memory where memory management is an ongoing concern.



### Less Obvious issues

After years of working on WebCodecs, I can assure you that the above concerns are just scratching the surface. I'm going to throw a laundry list of less obvious concerns that you'd need to keep in mind:


**Decode/Encode queue** 

On top of managing the lifecycle of `VideoFrame` objects, you also need to keep in mind that `VideoEncoder` and `VideoDecoder` objects have a queue, called `decoder.decodeQueueSize`  and `encoder.encodeQueueSize`.

You can't just do:

```typescript
import { getVideoChunks } from 'webcodecs-utils'

const chunks = <EncodedVideoChunk[]> await getVideoChunks(file);
for (const chunk of chunks){
    decoder.decode(chunks)
}

```

You have to progressively send chunks for decoding (or frames for encoding), managing the queue size so as to not overwhelm the encoder/decoder, otherwise the application might crash.


**Encoding Settings** 

If you're encoding video, the same encoding settings won't work on different browsers, on different devices, or even on the same video but with different resolutions.

You almost certainly need something like this in your code

```typescript
const configs = [setting1, setting2, setting3, setting4, setting5...]

let encoderConfig;

for (config of configs){

    const isSupported = await VideoEncoder.isConfigSupported(config);
    if(isSupported.supported){
        encoderConfig = config;
    }
}

```

**Warmup and Flush** 

If you start sending chunks for decoding, you can't just send one chunk for decoding, and then wait for the first frame to decode. Decoders will typically need 3 to 5 chunks to be sent, at a minimum, before `VideoFrame` objects start being rendered. The number of chunks to be sent will depend on the device, browser etc...


Even when you send all the chunks for decoding (or all the chunks for encoding), the last few results might never generate, and you'd need to call `decoder.flush()` or `encoder.flush()` to move them out of the queue.



**Decoder / Encoder failure** 

Some times, a video might have a corrupted frame, and the decoder will just fail and stop decoding subsequent frames. You need to gracefully recover from decoder failures, which will happen.


### Making your life easier

I omitted a ton of issues from just off the top of my head because there are so many, and I don't want to overwhelm you. Hopefully I convinced you that WebCodecs is complex, and honestly, that's why I'm creating this whole website, to go over all this stuff not covered in hello-world tutorials.

That said, there's another way to make your life significantly easier with WebCodecs, and that is to use a library like [Mediabunny](https://mediabunny.dev/), which handles many of these implementation details for you, which we'll cover in later sections.


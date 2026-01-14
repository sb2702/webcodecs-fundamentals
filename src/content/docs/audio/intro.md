---
title: Intro to Audio
description: How and when to use Audio
---

Up until now we've been exclusively focusing on Video because, well, video is hard enough on its own, without the additional challenge of also managing audio, let alone handling audio-video sync.

I also saved it for later because, and I can't emphasize this enough:

## You may not need WebCodecs for Audio

Let me explain

#### What WebCodecs Audio does

WebCodecs has the `AudioEncoder` and `AudioDecoder` which let you encode raw audio into encoded audio, and decode encoded audio into raw audio.

That may seem obvious, but here is a key limitation:

WebCodecs only supports `AAC` audio for MP4 files, and `Opus` audio for WebM file, which are the most typical audio codecs used with those types of video files, but it won't handle MP3, or other [Audio Formats](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs).


If you're only working with MP4 or WebM video files, this is fine.  If you want to export standalone audio, you'll need separate libraries to handle MP3 encoding (covered [here](../mp3))

If you're only working with audio, you might be better off with the WebAudio API.


#### Web Audio API

The [WebAudio API](./web-audio.md) is a completely different API for decoding and playing audio in the browser, as well as applying custom audio processing and filters.


Unhelpfully, while there is some overlap in these APIs (both can be used to decode audio), they also don't really talk to each other. For example, WebCodecs represents raw audio via the `AudioData` object, but you can't play back `AudioData` in the browser. You need WebAudio to play audio in the browser, and WebAudio uses `AudioBuffer`, a completely different class for representing raw audio.

You can convert `AudioData` to `AudioBuffer` with some hacky `Float32Array` gymnastics, but it takes cpu effort to do so and you can't do this in a worker because WebAudio is only available on the main thread.


You're better off just ignoring WebCodecs, and just using WebAudio for playback, which we'll cover in the [WebAudio section](./web-audio.md)

#### When to use which


##### Transcoding
If you are just transcoding a video (or applying a video filter), you may not even need to decode and re-encode the audio. You can literally pass source `EncodedAudioChunk` objects from a demuxer straight into the muxer for the video file you want to write.

```typescript
// This is using an a demo muxer & demuxer, for prod use a library like MediaBunny
import {getAudioChunks, ExampleMuxer} from 'webcodecs-utils'

async function transcodeFile(file: File){

    const audio_chunks = <EncodedAudioChunk[]> await getAudioChunks(file);
    const muxer = new ExampleMuxer('audio');

    for (const chunk of audio_chunks){
        muxer.addChunk(chunk); // That's it!
    }
}
```

This is what I do with my [free upscaling tool](https://free.upscaler.video), see the source code [here](https://github.com/sb2702/free-ai-video-upscaler/blob/main/src/worker.ts#L100).

We'll cover this pattern in more detail [here](../../patterns/transcoding)

##### Playback
If you're building a video player, or building  a video editor where you play the current composition, you likely wouldn't touch WebCodecs for the audio, it'd be much better to use WebAudio which will talk about [here](../web-audio).

We'll playback in more detail [here](../../patterns/playback)

##### Audio Only
If you want to, say, do audio editing or audio transcoding, where you read in, process and export audio files as MP3, `AudioEncoder` and `AudioDecoder` won't help here. You'd need to use 3rd party libraries to handle those files (more on that [here](../mp3))


##### Audio + Video

If you're building transcoding software to handle video inputs and standalone audio inputs,  and/or your application works outputs video as well as standalone audio outputs, you'll likely need to use both WebCodecs and 3rd party libraries to handle MP3 encoding/decoding.

Here, audio only **is not** a subset / simpler case vs **video+audio**,  instead audio-only imports/exports require additional pipelines and complexity.

##### MultiMedia Editing

If you're building software enabling users to input audio-only and video sources, providing real-time playback/preview of the composition, and enabling exporting to video and audio-only exports, then you'll need to combine a number of things together.

* WebCodecs for real-time playback of video
* WebAudio for real-time playback of audio
* WebCodecs for video exports
* 3rd party libraries for audio-only exports

We'll provide more detail on editing [here](../../patterns/editing)

### Choose your own adventure

Because the solutions for audio are different based on use case, I wanted to provide this section up front as not all the following sections may be necessary. Consider the audio section of this guide a "Choose your own adventure".

* You can skip this entire section if you use [MediaBunny](../../media-bunny/intro), though the docs may still be helpful to understand fundamentals
* If you don't need to re-encode audio at all (e.g. video transcoding), feel free to skip the section entirely
* If you only care about playback and aren't encoding audio, feel free to skip straight to [playback](../playback)
* If you only will be working with audio, feel free to skip straight to [this section](../mp3)

Otherwise, let's continue and in the next section I'll actually start talking about WebCodecs audio.

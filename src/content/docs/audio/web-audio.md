---
title: WebAudio Playback
description: How to play audio in the browser with WebAudio
---

WebAudio is a browser API for playing audio in the browser. Just like WebCodecs enables low-level control of video playback compared to the `<video>` element, WebAudio enables low level control of audio playback compared to the `<audio>` element.

WebAudio contains all the components to create a custom audio rendering pipeline, including the audio equivalent of `<VideoFrame>` (source), `<canvas>` (destination) and WebGPU/ (processing).


| Stage | Video Rendering | Audio Rendering |
|-------|-----------------|-----------------|
| **Raw Data** | `VideoFrame` | `AudioBuffer` |
| **Processing Pipeline** | WebGL / WebGPU | Web Audio API nodes |
| **Output Destination** |`<cavas>`| AudioContext.destination (speakers) |



Unlike for video, audio processing is done one API (WebAudio). And while in video, you'd normally think of doing *per-frame* operations in a loop, as in


```javascript
for (const frame of frames){
    render(frame)
}
```

In WebAudio, you need to think of audio processing as a pipeline, with *sources*, *destinations* and *nodes* (intermemediate effects / filters).

![](/src/assets/content/audio/web-audio/pipeline.svg)

Where `GainNode` just multiplies the audio signal by a constant (volume control), which is the simplest filter you can add. Here is what this pipeline actually looks like in code:


```typescript

const ctx = new AudioContext(); //Kind of like audio version of 'canvas context'

const rawFileBinary = <ArrayBuffer> await file.arrayBuffer();
const audioBuffer = <AudioBuffer> await ctc.decodeAudioData(rawFileBinary);

const sourceNode = <AudioNode> ctx.createBufferSource();
const gainNode  = <AudioNode> ctx.createGain();

sourceNode.connect(gainNode);
gainNode.connect(ctx.destination);

sourceNode.start(); //Starts playing audio in your speakers!
```


Because WebAudio provides the only interface to output custom audio to the user's speakers, you'll **need** to use WebAudio for audio/video playback.

In this article we'll explain the main componens of WebAudio, and then provide some working code examples to play audio in the browser and add basic controls like volume, playback speed and start/stop/seek.

That should provide enough background to then build a full video player with webcodecs and webaudio, which we'll cover [here](../../patterns/playback/).

# Concepts

## Buffers

## Context

## Nodes

## Timeline

## Play/pause


# Concrete examples

** Basic Playback**

** Start/stop, timeline**


** Seek **


# Extra functionality

## Gain

## Speed / playback


# 


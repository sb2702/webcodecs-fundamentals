---
title: How to build a Video Player in WebCodecs
description: High level architectural explanation of how to build a video player in WebCodecs
---


![](/src/assets/content/patterns/player/webcodecs-player.png)

In the [Video Decoder](../../basics/decoder) section, we showed how to to build a [video decoding loop](../../basics/decoder#decoding-loop) in WebCodecs.

<details>
<summary>Decode Loop Demo</summary>
<iframe src="/demo/decode-loop/index.html" frameBorder="0" width="720" height="600" style="height:580px" ></iframe>
</details>


In the [WebAudio](../../audio/web-audio) section, we showed how to build an [audio player](../../audio/web-audio#webaudio-audio-player) with WebAudio.

<details>
<summary>Web Audio Player</summary>
<iframe src="/demo/web-audio/playback-speed.html" frameBorder="0" width="720" height="550" style="height: 415px;"></iframe>
</details>


In this guide, we'll go over how to put these two components together to create a working video player in WebCodecs. 


I don't expect anyone to actually use this demo video player as-is in their projects. If you are working with WebCodecs, you presumably have some custom requirements that you can't accomplish with the `<video>` tag. 

Instead, the goal is to explain all the components you'll need, and how to integrate them together into a working video player based on best practices.


The architecture is derived from my battle-tested production apps [[1](https://katana.video)][[2](https://free.upscaler.video)].  It's not the only way to build a WebCodecs based video player, but there aren't other good guides on how to do this, and LLMs are phenomenally bad at WebCodecs. 

So consider this a starting point for building a player, and as you get more comfortable with WebCodecs, you can adjust as needed for your own use cases.

The full source code is available [here](https://github.com/sb2702/webcodecs-examples/tree/main/src/player).


## Webcodecs Player Architecture

Given we've already covered how to play audio and to render video, the main task is to now synchronize audio and video playback.

### Synchronizing Audio and Video

#### Audio as ground truth

We need a ground source of truth, and we're going to choose the **audio timeline as our ground source of truth**. Specifically, the audio player has a `AudioContext`  whose `currentTime` property is the reference point used to construct our audio timeline, as we covered in the ([audio player](../../audio/web-audio#webaudio-audio-player)).

<iframe src="/demo/web-audio/simple-player.html" frameBorder="0" width="720" height="550" style="height: 225px;"></iframe>

We just focus on making sure the audio timeline is consistent, and we'll know exactly where in playback we are. 

Even if there is no audio track, the `AudioContext` will still have a `currentTime` property, and the audio renderer can still create a consistent timeline.

#### Video as a receiver

We're then going to construct the video renderer to render video at a given timestamp via a render function `render(time)`.

```typescript
function render(time: number){
    //try to render the closest VideoFrame to time
}
```
The key word here is 'try'. If you remember from the [decoding loop](../../basics/decoder#decoding-loop), we have a *render buffer*  of `VideoFrame` objects which have been decoded. 

We **cannot** guarantee that there is a `VideoFrame` corresponding to the requested timestamp, or even that there is a `VidoeFrame` that is close to the requested timestamp.

The approach is to *try* to find the latest `VideoFrame` that is before the current requested time, and render that.  It is almost guaranteed that some render calls won't be able to find a suitable `VideoFrame` and that's okay, it's normal, it's expected.

In practice, you'll end up skipping some frames (if playback is faster than the video framerate), or dropping some frames (if the decoder can't keep up with playback), but this architecture will keep the video synchronized to the audio.

#### Clock

While the audio renderer has it's own consistent timeline, we still need to regularly poll the current time from the audio renderer, and regularly make `render` calls to the video renderer.


For this, we're going to create a **Clock** interface, for which we'll create a regular poll mechanism called `tick`

```javascript
function tick(){
    // Poll current time from audio renderer
    // run render(time)
    // Update ui
    // whatever else
    requestAnimationFrame(tick)
}
```

In the actual player code, we'll have an event broadcast/listener system so that we do

```javascript
function tick(){
    //Calculate currentTime
    this.emit('tick', currentTime)
    requestAnimationFrame(tick)
}
```
and everything else can subscribe to events

```javascript 
clock.on('tick', function(time: number){ /** Do whatever */})
```

#### Render Loop

Putting them together, we have a Clock object which regularly polls the current time from the audio render, and calls the render() function of the video renderer on every call of `tick`.

![](/src/assets/content/patterns/player/player-architecture-0.svg)

This will be the core of our render loop, to play both audio and video back in sync.


### Loading File Data

For the audio renderer and video renderer to work, we actually need to feed them encoded audio and video data (each render handles it's own decoding).

In the previous hello world examples, we just loaded the entire video's worth of `EncodedAudioChunk` and `EncodedVideoChunk` data, which is fine for very small demo videos. If we want to handle large videos though, we'll need to progressively load data from our source file.

#### Demuxer
 What we can do is to create a standalone file reader / demuxer, which we instantiate with a `File` handle, and from which we can extract track data and audio/video track segments.


![](/src/assets/content/patterns/player/player-architecture-1.svg)


#### Worker setup

We'll set up this demuxer in it's own worker thread to isolate it from other processes. We'll then give this worker to both the audio renderer and video renderer, so, they can fetch encoded chunks from the demuxer.


![](/src/assets/content/patterns/player/player-architecture-2.svg)


Each renderer will manage it's own data lifecycle independently, independently fetching chunks from the worker, decododing and buffering data as needed, so we can keep the architecture clean and isolate concerns.

With this, the render loop should be able to indefinitely fetch and render audio and video in a synchronized fashion indefinitely.

### Player object

Now that we have our core render loop and data fetching, we need to handle for primary player events such as *play*, *pause* and *seek*.

To manage all of this, we'll have a master `Player` interface, which will:

* Instantiate the `Demuxer`, `Clock`, `AudioRenderer` and `VideoRenderer`
* Call setup functions for each
* Extract track data from the `Demuxer`
* Expose `play()`, `pause()` and `seek()` events

#### Utilities
This is more just my personal architecture style, but we're going to use an `event` based architecture, so that components can 'listen' for events like pause/play/seek, via an `EventEmitter` class we will create.

We'll also a utility `WorkerController` class that lets us treat calls to workers (like the `Demuxer`) as async calls (e.g. await `demuxer.getTrackSegment('video', start, end)`)


#### Pulling it all together

Putting all of these together, we now have our basic, barebones architecture for our WebCodecs video player.

![](/src/assets/content/patterns/player/player-architecture-3.svg)


Play / pause / seek events will go to our clock, which will in turn propogate events to the `AudioRenderer`.

The player also exposes utilities for fetching the current playback time, and video metadata (such as duration), which should be everything we need to actually build a functional WebCodecs player and build a UI inteface for it.


## WebCodecs Player Components


#### File Loader


#### Audio Renderer


#### VideoRenderer


#### Clock

#### Player





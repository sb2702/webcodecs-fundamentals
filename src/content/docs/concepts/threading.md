---
title: Offscreen Processing
description: Main thread vs workers and transferable objects
---

When doing video processing in the browser, most of the processing should be done in a worker. This may already be obvious to many of you, and if so feel free to go to the [next section](../file-handling) but if not, I'll provide a quick explanation of workers, offscreen processing for video processing, and why it's important.


### CPU Cores and Threads

Most devices actually have 4 to 16 CPU processors called *cores*, allowing them to run multiple things in parallel. The operating system has something called a "scheduler" which determines how to spread work across these cores.

Work comes in the form of a *thread*, which is the smallest schedulable unit of work.

Each application runs as a *process*, with it's own sandbox of memory, and each process can run multiple threads, all with access to the processes' sandboxed memory, but which can be run by different CPU cores in parallel. 

An example would be a server script (like a NodeJS or python script) that could download multiple files in parallel, where the main script is a single process, but which can span multiple threads which run in parallel, often each on a different CPU core.

Many browsers (like Chromium browsers) actually run in multiple processes [[1]](https://sunandakarunajeewa.medium.com/how-web-browsers-use-processes-and-threads-5ddbea938b1c), with each tab running it's own process. 

When a user opens your website in a Chromium browser, their task manager (or equivalent) will show a specific process that was created just for your browsing website.



### Everything is on the main thread by default

When a user opens a new tab and navigates to your website, the browser allocates a *main thread*, where the UI (HTML / CSS), event handlers, and (unless otherwise specified) all the javascript is run.

This means that the browser cannot update the UI at the same time that it is executing Javascript. Modern Browsers use [optimized engines](https://v8.dev/) execute Javascript so quickly that UI delays aren't noticeable, unless the web-app is doing particularly heavy processing.

Video Processing absolutely counts as "particularly heavy processing", which is why running everything on the main thread (the default) is not ideal. A web-application using WebCodecs, implemented without workers, would in practice have a very laggy UI that would freeze or crash the tab during key moments when reading large files, rendering or encoding.


### Workers and Offscreen Canvas

The solution to this problem is to use [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), which let you run javascript is a separate thread, so that you can run compute intensive processes such as reading large files, running AI models or encoding video without making the UI freeze / unresponsive.




The downside of workers is that:
* They do not have access to the DOM - e.g. they cannot modify HTML/CSS or directly react to UI event handlers
* Many web APIs and interfaces, like `HTMLVideoElement` and [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), cannot be accessed in a worker thread
* Workers do not share the same memory scope as the main thread, so you either define variables in the worker thread, or you can transfer [some types](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects) of objects.


`OffscreenCanvas` is a special case where you can update what the user visually sees from a worker thread, and this will be the primary way to render video in WebCodecs applications.


You would first create a `<canvas>` element on the main thread, turn it into an [OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) using the `transferControlToOffscreen()` method, transfer it to a worker, and then render to the `OffscreenCanvas` in the worker thread. We'll cover how to do rendering [later](../../basics/rendering).



You can see a demo of offscreen rendering, and the difference running rendering in a worker thread makes [here](https://devnook.github.io/OffscreenCanvasDemo/index.html).

<iframe src="https://devnook.github.io/OffscreenCanvasDemo/index.html"  width="860" height="540" style="height: 540px; margin:0;  transform:scale(0.80) translate(-110px, 0); max-width: 860px" frameBorder="0"> </iframe>


### What to do in a worker

For video processing, there are a few key steps you'd be better off doing inside of a worker:

**File Loading**: For a video editing application for example, a user may have source videos that are several GB in size, and you'll regularly need to read portions of the file (covered in more detail in the [next section](../file-handling)), and even just reading file data from hard disk to memory takes quite a lot of CPU cycles.

**Rendering**: If you have a video player, and especially if you are applying visual effects (like filters or transforms in a video editing pipeline), you would be best off having your decoder and rendering pipeline work entirely in an a worker thread. Canvas2d rendering is CPU intensive, and even if working with a fully WebGL or WebGPU pipeline, coordinating the movement of decoded frames to a shader context and coordinating which shaders still requires lots of CPU calls,

**Decoding**: Decoding is typically not that compute intensive, but since fetching file data and rendering can be compute intensive, depending on the architecture, it'd probably be a good idea to keep the decoder in the same thread as your file loader or renderer to minimize data transfers.

**Encoding**: While decoding is typically not that compute intensive, encoding absolutely is, and can be 100x slower than decoding


### What stays on the main thread

**Audio Playback**

Some key things cannot be done in a worker thread. Annoyingly, the [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) API is not available in worker threads, which is especially annoying because for best practices in [player design](../../patterns/playback), your master timeline should be dictated by audio playback, and what video frame to render should be determined by the main thread, so you'll almost always be sending some kind of render call from the main thread to a worker during playback.


**File loading and downloading**

You'll also need to handle file inputs on the main thread, and we'll cover best practices for [transferring files](../file-handling), and if you want a user to download an encoded video file as a 'Blob download', you'll need to transfer the blob object from the worker back to a main thread, though you can optionally write directly to the hard disk from a worker if using the [FileSystem API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) covered in the next section.


### Architectures

We'll cover these in more detail in the Design Patterns section, but for a simple high-level breakdown of how you might architect an app:

##### Transcoding

To transcode a file, you would typically take in a user supplied `File` object or `FileSystemFileHandle`from a user interaction (unless you already have a file object in which case this isn't necessary). You'd then send that to a worker thread where the demuxing, decoding, any video transformations, encoding and muxing are all done. 

A very simplified example might look like this:

![](/assets/basics/offscreen/transcoding-arch.svg)

Where all the muxing, `VideoEncoder`, `VideoDecoder` and everything else is done on the worker thread. We'll cover actual real-world examples [subsequent sections](../../patterns/transcoding).

##### Playback

Building a video player is quite a bit more complex, but here's the simplest version of how an offscreen / main thread architecture might look.

![](/assets/basics/offscreen/player.png)


Where the `OffscreenCanvas` and `File` are sent to the worker thread on initialization, and the `VideoDecoder` and render logic are implemented in the worker thread, while audio info is returned to the main thread, and the audio player (implemented with WebAudio) dictate current time, which is sent to the worker thread on every render cycle to render the next frame at current time.


We'll cover actual real-world examples in [subsequent sections](../../patterns/playback), but just keep in mind that much of your code should run in a worker, and especially since the Player UI and WebAudio need to run on the main thread, you will need quite a bit of main thread <> worker communication.

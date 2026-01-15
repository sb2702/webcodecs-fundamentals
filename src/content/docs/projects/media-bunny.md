---
title: Mediabunny - ffmpeg for the web
description: How Mediabunny helps with this
---

Hopefully you are convinced that WebCodecs is [more complex than it looks](../reality-check), but you can make your life significantly easier by using [Mediabunny](https://mediabunny.dev/), which can be thought of as the "ffmpeg for the web";


Mediabunny is an open source library that:

* Handles muxing/demuxing
* Provides a much more intuitive interface for working with decoders and encoders
* Handles many of the memory and state management issues [mentioned previously](../reality-check)
* Implements best practices for file & memory management


Let's take a look at how decoding would work with Mediabunny


```typescript

import { VideoSampleSink, Input, BlobSource, MP4 } from 'mediabunny';

async function decodeFile(file: File){

    const input = new Input({
        formats: [MP4],
        source: new BlobSource(file),
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const videoTrack = await input.getPrimaryVideoTrack();
    const sink = new VideoSampleSink(videoTrack);
    for await (const sample of sink.samples()) {
	    sample.draw(ctx, 0, 0);
    }
}
```


In the Mediabunny example, you can see off the bat that it:

✅ Handles Demuxing <br>
✅ Turns reading VideoFrames from a callback pattern to an iterator pattern <br>
✅ Handles decoder queue, and progressive reading from file<br>
✅ Handles edge cases like corrupted frames


If you were to do any other code example, like transcoding or streaming, you'd immediately see how much easier it is using Mediabunny than vanilla WebCodecs because it simplifies so many details and handles a lot of the 'gotchas'.


#### The emerging standard

As of writing this article in December 2025, Mediabunny is still new but emerging as the defacto standard for working with WebCodecs because it simplifies so many implementation details, and also implements best practices.

In my own WebCodecs applications, I manually implemented my own implementations of decoder /encoder management, progressive file reading, etc..., so I understand how complex it is to build all of that functionality, and it doesn't make sense for every application to re-invent the same core logic that almost every video application would need.

If this guide in any way becomes considered authoritative, I am putting in my vote that Mediabunny should be the standard go-to library for web application developers working with WebCodecs, and I would highly recommend using it unless you really need specific low-level control.


#### I'll cover both

To that end, this guide will cover how to build production-grade WebCodecs applications both with vanilla WebCodecs and with Mediabunny. I've included a whole section on design patterns for common use cases like Video Players and transcoding pipelines, and I'll include specific code tutorials with both a Vanilla WebCodecs version and a Mediabunny version.

Because this guide is focused more on core concepts (like CPU vs GPU), design patterns and architecture, as well as best practices, most of this guide will still be helpful regardless of whether or not you use Mediabunny, though some of the 'gotchas' and practical deployment details will only be relevant if working with vanilla WebCodecs.

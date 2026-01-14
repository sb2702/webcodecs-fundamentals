---
title: What are Codecs?
description: Beyond the spec - understanding the WebCodecs API and its place in web video engineering
---


Many readers will be well aware of what codecs are, so if you already have a good grasp of video processing feel free to [skip this section](../what-is-webcodecs/).

Presumably if you are reading this, you are interested in doing some form of video processing in the browser, and when working with video, you need to understand what codecs are, and what video encoding / decoding is, and how those fit into a video application.

##### Raw Video Data

The reason we even need a "codec" is because raw video is impractically large, even with the most advanced hardware and fastest internet connections. 

Consider the simplest possible video, a simple bouncing ball:

![](/assets/basics/codecs/bouncing-ball.gif)

This video is made of 8 different frames which are looped, with each frame looking like this:

![](/assets/basics/codecs/pixels.svg)

This "video" is essentially 24 pixels by 13 pixels, and each pixel is represented by an RGB color value, where the value for each color is typically represented as 8-bit integer (a byte).

Each frame therefore has 3 bytes per pixel, and 24*13 = 312 pixels, resulting in 936 bytes per frame. The video also played back at 10 frames per second, so each second of this video is  (936 bytes/frame)(10 frames/second) = 9.14 kilobytes / second. With 3600 seconds in an hour, an hour of this 24p video would be 32 megabytes.

###### This doesn't scale well


Most videos are not that small, so instead, consider a 240p video, which is probably the lowest possible resolution you'd ever encounter in the real world. At 240x320 pixels per frame, you'd have 225 kilobytes per frame. At 24 frames per second, the video would be at about 5.27 megabytes per second, or 18 gigabytes per hour of video.


Let's go to a reasonable viewing size, 720p at 30fps, that would be 79.1 megabytes/second or 278 Gigabytes per hour.

Finally, a 4K video at 60fps would be 1.39 Gigabytes per second, or 5.4 Terabytes per hour of video.


Most standard consumer hard drives aren't even big enough to store a single hour of raw 4K video, and even the best internet connections in the world would struggle with streaming raw 4K video.

##### Codecs === Compression

If you've ever downloaded large videos before, you'd know that actual video files are much smaller, usually several gigabytes per hour for a single hour of HD video, which is ~100x smaller than raw video.

A video codec is essentially an algorithm (or software/hardware implementation of one) to turn raw video into a compressed format (Video Encoding) and to parse compressed video data back into raw video (Video Decoding).

How these algorithms manage to 'compress' video files by 100x while still looking pretty good is a whole other interesting topic outside the scope of this guide, but here are a few interesting resources if you are curious [[1](https://www.youtube.com/watch?v=Q2aEzeMDHMA)]

###### Some popular codecs

For someone getting started with video processing, there are a few popular codecs which are fairly standard in the industry which you should know about:

* H264 - By far the most common codec. Most "mp4" files that you will find will typically use the h264 codec. This is a patented codec, so while users can freely use h264 players to watch video, large organizations which encode lots of video using h264 may be liable to pay patent royalties.

* H265 - Less common, newer, and has better compression than h264. Fairly widely supported but with major exceptions, same patent concerns as the h264.

* VP8 - Open source video codec, used often in WebRTC because it is very fast for encoding, though the quality of compression is not as good as other codecs.

* VP9 - Successor to VP8, also open source, developed at Google, many videos on YouTube are encoded with VP9 and also fairly well supported

* AV1 - The latest, most advanced open source codec, with better compression than all the above options, developed by an independent consortium of organizations. Decoding/playback is widely supported across devices and browsers, but because decoding is significantly slower / more expensive than VP9,
it is still being rolled out, with the encoding speed making it not very relevant for client-side WebCodecs applications.

* ProRes - ProRes is a propriety compression format by Apple which is often used in Video Editing circles, but as it is not part of the WebCodecs spec or supported by browsers for playback or encoding, it is not relevant for WebCodecs


You can find more about video codecs [here](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs)

##### When to use codecs

There are a number of reasons where you might build an application that needs to deal specifically with video codecs, here are a few examples:

###### Video Decoding

If you are building a video player software, like [VLC](https://www.videolan.org/vlc/) you will likely only need to deal with video decoding, as either you have videos being supplied by a user, which are almost always encoded/compressed, or you and/or your organization stores encoded/compressed videos on your servers.

If you do any kind of machine learning analysis on a video (like detecting objects in a video) you will need some kind of codec to decode compressed video into raw video frames, as Machine Learning models almost always work on raw, uncompressed image or video data.


###### Video Encoding

If you are building video recording software like [OBS](https://obsproject.com/), you will primarily deal with video encoding, as you likely are grabbing raw video data from a camera, or a computer screen share, or some other raw video source, and your application will need to compress that raw video to encoded video.

Also, if you render video, either by rendering complex 3d graphics, or generate video using generative AI models, you would still need a video encoder to turn the raw video generated by the graphics engine / AI model into a video file that can actually be stored / sent over a network and/or played back by users.


###### Both Decoding and Encoding

Some common use cases for encoding and decoding are when building video editing software (where source videos need to be decoded and the frames painted onto some kind of canvas, and then encoded when exporting the video), or with video processing utilities like [ffmpeg](https://www.ffmpeg.org/) or [handbrake](https://handbrake.fr/) which can convert video from one format to another, or even [upscaling software](https://github.com/k4yt3x/video2x).
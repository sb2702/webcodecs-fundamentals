---
title: An intro to mediabunny
description: Managing encoder queues and flushing
---

WebCodecs gives low-level access to hardware.


MediaBunny builds on top of it, and is a library to do video processing in the browser

Differences:
- No need to work directly with VideoEncoder/Decoder
- Instead, you have two new concepts: Sources and Sinks - more logical if you think about video processing as pipelines, which as the application developer you do.
- Some terminology


Sections:
- Samples: VideoFrames / AudioDate
- Packets: EncodedChunks



- Inputs/Outputs
- Tracks: Demuxing libraries treat tracks at metadata, but Mediabunny makes tracks an actual object representing the track


- Sources
- Sinks



Display

Encoding

Transcoding

More docs and examples
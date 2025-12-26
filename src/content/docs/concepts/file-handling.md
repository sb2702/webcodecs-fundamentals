---
title: File Handling
description: Streams, buffers, and file system handles
---

To many this may be obvious


- Small files can be read in RAM

- WebRTC/Streaing, video usually never touches disk


- Video Editing, might be working with large files

- 2GB Limit


- Muxing and Demuxing data takes longer

- FileSystemFileHandle
    - Have it stay on disk
    - If Using MediaBunny, it will intelligently read files from a stream
    - If not, here is an implementation

- File Object (okay for small files)





# WebCodecs Tutorial Demo

Demo code for the SitePoint WebCodecs tutorial article.

## Overview

This repository contains two demo applications that show how to reframe a landscape Zoom recording (two participants side-by-side) into a portrait format (participants stacked vertically):

1. **Live Preview Demo** (`/demo-editing/`) - Real-time canvas preview using `<video>` element and `requestVideoFrameCallback()`
2. **Export Demo** (`/demo-export/`) - Full encode pipeline using WebCodecs streaming architecture

## Project Structure

```
/demo-editing/
  index.html       # Live preview demo
  main.js          # Canvas rendering with video element

/demo-export/
  index.html       # Export demo
  main.js          # Full decode → render → encode pipeline

/shared/
  utils.js         # Shared utility functions (if needed)
```

## Architecture

### Live Preview (`/demo-editing/`)
- Uses native `<video>` element for playback and controls
- `requestVideoFrameCallback()` captures frames during playback
- Canvas draws portrait layout in real-time
- No encoding - just visualization

### Export (`/demo-export/`)
- Streaming architecture: Demux → Decode → Render → Encode → Mux
- Uses `TransformStream` for each pipeline stage with backpressure
- Outputs actual MP4 file with portrait layout

## Dependencies

Both demos use CDN-loaded dependencies:
- `mp4-muxer` - For writing MP4 files
- `web-demuxer` - For reading MP4 files

No build system required - just ES modules loaded from CDN.

## Running the Demos

Open `demo-editing/index.html` or `demo-export/index.html` directly in a browser. No build step needed.

## Code Philosophy

The code is intentionally barebones and tutorial-focused:
- No CSS styling
- Minimal error handling
- No abstractions or classes unless necessary
- Linear, easy-to-follow code structure
- Comments explain WebCodecs-specific concepts

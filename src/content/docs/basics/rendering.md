---
title: Rendering
description: Different rendering options
---

When decoding video and rendering it to a `<canvas>`, as in [previous examples](../decoder#decoding-loop), we defaulted to using the [canvas's 2d rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) which is a very developer-friendly graphics api.


```typescript

const canvas = new OffscreenCanvas(width, height);
const ctx = canvas.getContext('2d');

const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){
        ctx.drawImage(frame, 0, 0);
        frame.close();
    },
    error: function(e: any)=> console.warn(e);
});

```

And for "hello world" demos, here or in other documentation websites, this is fine, because  2d Canvas context is simple, and works well enough.  That said, there are other ways to render a `VideoFrame` to canvas, and the '2d' canvas context is by far the least efficient, so we'll cover the other options.



### Context2D

Canvas2D context is a generic graphics library, and the most common one for drawing to a canvas. It has a relatively beginner very friendly API.  It's pretty easy to use it to draw things like shapes and text:


```javascript
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Draw a rectangle
ctx.fillStyle = '#3498db';
ctx.fillRect(50, 50, 200, 150);

// Draw a circle
ctx.fillStyle = '#e74c3c';
ctx.beginPath();
ctx.arc(400, 100, 75, 0, Math.PI * 2);
ctx.fill();

// Draw text
ctx.fillStyle = 'white';
ctx.font = 'bold 24px Arial';
ctx.fillText('Hello Canvas', 100, 120);

// Draw a line
ctx.strokeStyle = '#2ecc71';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(50, 250);
ctx.lineTo(450, 250);
ctx.stroke();

```


and as we saw, it's pretty easy to draw a frame to an image

```javascript
ctx.drawImage(frame, 0, 0);
```

The problem with the 2d canvas is that, to enable it's simple graphics API, many operations in the canvas 2d API are implemented using CPU rendering. Because the web standard doesn't specify how 2d canvas should be implemented, and at least Chromium seems to dynamically decide how to implement each function depending on a number of factors [[1](https://www.middle-engine.com/blog/posts/2020/08/21/cpu-versus-gpu-with-the-canvas-web-api)], it's not clear or consistent how `drawImage` will behave, and as we'll see, it's performance varies greatly between browsers.

Benchmarking the speed of decoding + `drawImage` [Big Buck Bunny](https://download.blender.org/demo/movies/BBB/) at 1080p on my Macbook M4 Laptop on 3 browsers*

| Device    | Browser | Decode Speed |
| -------- | ------- | -------  |
| Macbook Pro M4 | Firefox   | 70fps  |
| Macbook Pro M4 | Chrome    | 960fps|
| MacbookPro M4    | Safari    | 230fps |

You can see how different browser implementations vary dramatically in performance. Chromium browsers seem to implement some form of optimization that the others don't, but as we'll see, even for Chromium Canvas2d is not as efficient as other methods.

\* I'm not testing on other browsers, because the vast majority of other popular browsers (Edge, Opera, Brave etc..)  are built on Chromium, the same engine used by Chrome. Safari and Firefox are the two main popular browsers not built on Chromium.


### Bitmap Renderer

Bitmap renderer is a very infrequently used canvas rendering context, though it's very simple to use for this use case, and has clear performance advantages.


```javascript

const canvas = new OffscreenCanvas(width, height);
const ctx = canvas.getContext('bitmaprenderer');

const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){

        const bitmap = await createImageBitmap(frame);
        ctx.transferFromImageBitmap(bitmap);
        frame.close();
        bitmap.close();
    },
    error: function(e: any)=> console.warn(e);
});


```

Where you have to use `await createImageBitmap(frame)` to create an [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap) version of the frame, and then use `ctx.transferFromImageBitmap(bitmap)` to render the bitmap to the canvas.

Creating the `ImageBitmap` in the first place requires 1 full frame copy operation, but this is a GPU Memory -> GPU Memory copy so it's much faster than a CPU -> GPU copy. The 2nd `transferFromImageBitmap` is a zero-copy operation, and so has little to no performance overhead.


| Device    | Browser | Decode Speed |
| -------- | ------- | -------  |
| Macbook Pro M4 | Firefox   | 230fps  |
| Macbook Pro M4 | Chrome    | 1120fps|
| MacbookPro M4    | Safari    | 220fps |


Where you can see that the firefox performance improves dramatically, almost certainly be reducing the CPU <> GPU bottleneck. Chrome is also noticeably faster.

### WebGPU importExternalTexture

[WebGPU](https://webgpufundamentals.org/) is a fairly complicated graphics API enabling highly performance graphics (or machine learning workloads) in the browser, but it has a steep learning curve.

One key advantage that it has though is the `importExternalTexture` method, which enables rendering `VideoFrame` objects to a canvas in a true *zero-copy* fashion, meaning that the video frame isn't copied anywhere, it moves directly from where it is in GPU memory to the canvas.

If you are building a complex video editing pipeline you may end up needing to use WebGPU anyway, but if you just want something quick and easy that works and don't want to learn WebGPU, I built a quick utility called `GPUFrameRenderer` in [webcodecs-utils](https://www.npmjs.com/package/webcodecs-utils), which uses WebGPU when available (falling back to BitmapRenderer when not available).


```javascript

import { GPUFrameRenderer } from 'webcodecs-utils'

const canvas = new OffscreenCanvas(width, height);
const  gpuRenderer = new GPUFrameRenderer(canvas);
await gpuRenderer.init();

const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){
        gpuRenderer.drawImage(frame);
        frame.close();
    },
    error: function(e: any)=> console.warn(e);
});

```

It may seem like a lot of programming overhead, but the zero copy operation makes a clear performance difference


| Device    | Browser | Decode Speed |
| -------- | ------- | -------  |
| Macbook Pro M4 | Firefox   | 430fps  |
| Macbook Pro M4 | Chrome    | 1230fps|
| MacbookPro M4    | Safari    | 610fps |





### Conclusion

If you can, use WebGPU with `importExternalTexture` to decode and render video, check the [source code](/demo/gpu-draw-image/GPUDrawImage.js) if that's helpful, and if not, at least try to use [BitmapRenderer](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapRenderingContext).
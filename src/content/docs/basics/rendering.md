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

If you are building a complex video editing pipeline you may end up needing to use WebGPU anyway, but if you just want something quick and easy that works and don't want to learn WebGPU, here is a quick utility class called `GPUDrawImage`


```javascript

const canvas = new OffscreenCanvas(width, height);
const  gpuRenderer = new GPUDrawImage(canvas));
await gpuRenderer.init();

const decoder = new VideoDecoder({
    output: function(frame: VideoFrame){

        gpuRenderer.drawImage(frame)
        frame.close();
    },
    error: function(e: any)=> console.warn(e);
});

```

<details>
<summary>GPUDrawImage source</summary> 


```javascript
/**
 * GPUDrawImage - A simple drawImage()-like API that uses WebGPU for zero-copy rendering
 * with bicubic scaling, falling back to ImageBitmapRenderer when WebGPU is unavailable.
 *
 * Usage:
 *   const renderer = new GPUDrawImage(canvas);
 *   await renderer.init();
 *   renderer.drawImage(videoFrame, 0, 0, width, height);
 */

export class GPUDrawImage {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.mode = null; // 'webgpu' or 'bitmap'
    this.filterMode = options.filterMode || 'linear'; // 'linear' or 'bicubic'

    // WebGPU state
    this.device = null;
    this.context = null;
    this.linearPipeline = null;
    this.bicubicPipeline = null;
    this.sampler = null;
    this.uniformBuffer = null;

    // Bitmap renderer fallback
    this.bitmapCtx = null;
  }

  async init() {
    // Try to initialize WebGPU first
    if (navigator.gpu) {
      try {
        await this.initWebGPU();
        this.mode = 'webgpu';
        console.log('GPUDrawImage: Using WebGPU (zero-copy)');
        return;
      } catch (e) {
        console.warn('GPUDrawImage: WebGPU initialization failed, falling back to ImageBitmap', e);
      }
    }

    // Fall back to ImageBitmapRenderer
    this.initBitmapRenderer();
    this.mode = 'bitmap';
    console.log('GPUDrawImage: Using ImageBitmapRenderer (fallback)');
  }

  async initWebGPU() {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) throw new Error('No GPU adapter found');

    this.device = await adapter.requestDevice();
    this.context = this.canvas.getContext('webgpu');

    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: presentationFormat,
      alphaMode: 'opaque',
    });

    // Create sampler for texture sampling
    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });

    // Create uniform buffer for texture dimensions (2 floats = 8 bytes)
    this.uniformBuffer = this.device.createBuffer({
      size: 8,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const vertexShader = `
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) texCoord: vec2f,
      }

      @vertex
      fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
        var pos = array<vec2f, 6>(
          vec2f(-1.0, -1.0),
          vec2f(1.0, -1.0),
          vec2f(-1.0, 1.0),
          vec2f(-1.0, 1.0),
          vec2f(1.0, -1.0),
          vec2f(1.0, 1.0)
        );

        var texCoord = array<vec2f, 6>(
          vec2f(0.0, 1.0),
          vec2f(1.0, 1.0),
          vec2f(0.0, 0.0),
          vec2f(0.0, 0.0),
          vec2f(1.0, 1.0),
          vec2f(1.0, 0.0)
        );

        var output: VertexOutput;
        output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
        output.texCoord = texCoord[vertexIndex];
        return output;
      }
    `;

    // Linear sampling shader (hardware accelerated)
    const linearShaderModule = this.device.createShaderModule({
      code: vertexShader + `
        @group(0) @binding(0) var videoTexture: texture_external;
        @group(0) @binding(1) var texSampler: sampler;

        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
          return textureSampleBaseClampToEdge(videoTexture, texSampler, input.texCoord);
        }
      `
    });

    // Bicubic sampling shader (multiple texture reads)
    const bicubicShaderModule = this.device.createShaderModule({
      code: vertexShader + `
        @group(0) @binding(0) var videoTexture: texture_external;
        @group(0) @binding(1) var<uniform> texSize: vec2f;

        // Bicubic weight function (Catmull-Rom)
        fn cubic(x: f32) -> f32 {
          let x_abs = abs(x);
          if (x_abs <= 1.0) {
            return 1.5 * x_abs * x_abs * x_abs - 2.5 * x_abs * x_abs + 1.0;
          } else if (x_abs < 2.0) {
            return -0.5 * x_abs * x_abs * x_abs + 2.5 * x_abs * x_abs - 4.0 * x_abs + 2.0;
          }
          return 0.0;
        }

        @fragment
        fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
          let texCoord = input.texCoord;

          let coord = texCoord * texSize;
          let coordFloor = floor(coord);
          let f = coord - coordFloor;

          var result = vec4f(0.0, 0.0, 0.0, 0.0);
          var weightSum = 0.0;

          // Read exact pixel values from 4x4 neighborhood using textureLoad
          for (var y = -1; y <= 2; y++) {
            for (var x = -1; x <= 2; x++) {
              let pixelCoord = vec2i(i32(coordFloor.x) + x, i32(coordFloor.y) + y);

              // Clamp to valid texture coordinates
              let clampedCoord = clamp(pixelCoord, vec2i(0, 0), vec2i(i32(texSize.x) - 1, i32(texSize.y) - 1));

              let weight = cubic(f.x - f32(x)) * cubic(f.y - f32(y));
              result += textureLoad(videoTexture, clampedCoord) * weight;
              weightSum += weight;
            }
          }

          return result / weightSum;
        }
      `
    });

    this.linearPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: linearShaderModule,
        entryPoint: 'vertexMain',
      },
      fragment: {
        module: linearShaderModule,
        entryPoint: 'fragmentMain',
        targets: [{
          format: presentationFormat,
        }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });

    this.bicubicPipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: bicubicShaderModule,
        entryPoint: 'vertexMain',
      },
      fragment: {
        module: bicubicShaderModule,
        entryPoint: 'fragmentMain',
        targets: [{
          format: presentationFormat,
        }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    });
  }

  initBitmapRenderer() {
    this.bitmapCtx = this.canvas.getContext('bitmaprenderer');
  }

  /**
   * Draw a VideoFrame to the canvas
   * @param {VideoFrame} source - The VideoFrame to draw
   * @param {number} dx - Destination x coordinate (ignored in current implementation)
   * @param {number} dy - Destination y coordinate (ignored in current implementation)
   * @param {number} dWidth - Destination width (uses canvas.width if not specified)
   * @param {number} dHeight - Destination height (uses canvas.height if not specified)
   */
  drawImage(source, dx = 0, dy = 0, dWidth = null, dHeight = null) {
    if (this.mode === 'webgpu') {
      this.drawImageWebGPU(source);
    } else if (this.mode === 'bitmap') {
      this.drawImageBitmap(source);
    } else {
      throw new Error('GPUDrawImage not initialized. Call init() first.');
    }
  }

  drawImageWebGPU(videoFrame) {
    const pipeline = this.filterMode === 'bicubic' ? this.bicubicPipeline : this.linearPipeline;
    const useBicubic = this.filterMode === 'bicubic';

    const entries = [
      {
        binding: 0,
        resource: this.device.importExternalTexture({
          source: videoFrame,
        }),
      }
    ];

    // Add sampler for linear filtering, uniform buffer for bicubic
    if (useBicubic) {
      // Update uniform buffer with actual texture dimensions
      const texSize = new Float32Array([videoFrame.displayWidth, videoFrame.displayHeight]);
      this.device.queue.writeBuffer(this.uniformBuffer, 0, texSize);

      entries.push({
        binding: 1,
        resource: {
          buffer: this.uniformBuffer,
        },
      });
    } else {
      entries.push({
        binding: 1,
        resource: this.sampler,
      });
    }

    const bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: entries,
    });

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        loadOp: 'clear',
        storeOp: 'store',
      }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindGroup);
    renderPass.draw(6);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
  }

  async drawImageBitmap(videoFrame) {
    // Create ImageBitmap from VideoFrame and transfer to canvas
    const bitmap = await createImageBitmap(videoFrame);
    this.bitmapCtx.transferFromImageBitmap(bitmap);
  }

  /**
   * Get the current rendering mode
   * @returns {'webgpu'|'bitmap'|null}
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get the current filter mode
   * @returns {'linear'|'bicubic'}
   */
  getFilterMode() {
    return this.filterMode;
  }

  /**
   * Set the filter mode (only applies to WebGPU mode)
   * @param {'linear'|'bicubic'} mode
   */
  setFilterMode(mode) {
    if (mode !== 'linear' && mode !== 'bicubic') {
      throw new Error('Filter mode must be "linear" or "bicubic"');
    }
    this.filterMode = mode;
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.device) {
      this.device.destroy();
    }
  }
}

```

</details>

It may seem like a lot of programming overhead, but the zero copy operation makes a clear performance difference


| Device    | Browser | Decode Speed |
| -------- | ------- | -------  |
| Macbook Pro M4 | Firefox   | 430fps  |
| Macbook Pro M4 | Chrome    | 1230fps|
| MacbookPro M4    | Safari    | 610fps |





### Conclusion

If you can, use WebGPU with `importExternalTexture` to decode and render video, check the [source code](/demo/gpu-draw-image/GPUDrawImage.js) if that's helpful, and if not, at least try to use [BitmapRenderer](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmapRenderingContext).
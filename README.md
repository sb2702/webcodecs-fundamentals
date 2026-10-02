# WebCodecs Fundamentals

**The missing manual for WebCodecs** - comprehensive documentation, production patterns, and real-world datasets for building browser-based video applications.

🌐 **Live site:** [webcodecsfundamentals.org](https://webcodecsfundamentals.org)

## What is this?

WebCodecs Fundamentals is the authoritative resource for building production WebCodecs applications. Unlike fragmented W3C specs and outdated blog posts, this provides:

- **Complete documentation** - From basics to advanced production patterns
- **Real-world datasets** - Empirical codec support data from 7.6M+ user sessions
- **Working examples** - Production-tested code you can actually use
- **Best practices** - Patterns that work at scale

![Codec Support Table](public/assets/references/about/codec-support-table.png)

## Key Resources

### 📚 Core Documentation

- **[Introduction](/intro/why-use-webcodecs)** - Why WebCodecs and when to use it
- **[Basics](/basics/intro)** - VideoEncoder, VideoDecoder, and core APIs
- **[Concepts](/concepts/intro)** - CPU vs GPU memory, threading, file handling
- **[Patterns](/patterns/intro)** - Production-tested design patterns for:
  - Video playback
  - Transcoding pipelines
  - Live streaming
  - Frame-by-frame processing
- **[Performance](/performance/intro)** - Zero-copy rendering, memory management, optimization
- **[Audio](/audio/intro)** - AudioEncoder, AudioDecoder, and audio processing
- **[Troubleshooting](/troubleshooting/intro)** - Common issues and debugging

### 📊 Datasets

**[The Codec Support Dataset](/datasets/codec-support/)**

The world's first empirical registry of WebCodecs hardware support:
- **2.4+ billion** codec tests
- **7,655,853** unique user sessions
- **1,087** codec variants tested
- **5 major browsers** × **5 platforms**

[**Interactive Codec Registry →**](/datasets/codec-support-table/)

[**Dataset Methodology →**](https://free.upscaler.video/research/methodology/)

[**Download (Zenodo) →**](https://doi.org/10.5281/zenodo.23107451) · [**Hugging Face →**](https://huggingface.co/datasets/katana-video/webcodecs-codec-support)

### 💻 Live Examples

Interactive demos hosted at [webcodecsfundamentals.org](https://webcodecsfundamentals.org):

- **[Transcoding Pipeline](/demo/transcoding/)** - Complete transcode example using Streams API
- **[Codec String Generation](/demo/codec-strings/)** - Generate valid codec strings
- **[Media Bunny Demos](/media-bunny/intro)** - Production demuxing/muxing examples

## Production Applications

Real-world applications built with these patterns:

- [**free.upscaler.video**](https://free.upscaler.video) - Open-source video upscaling tool ([architecture](https://free.upscaler.video/technical/architecture/))
- [**Katana.video**](https://katana.video) - Professional podcast editor ([technical overview](https://katana.video/blog/what-does-katana-actually-do))

## Contributing

Found an issue, error, or have a suggestion?

- **Report issues:** [Open an issue](https://github.com/sb2702/webcodecs-fundamentals/issues)
- **Submit corrections:** [Create a pull request](https://github.com/sb2702/webcodecs-fundamentals/pulls)
- **Contact:** [sam@webcodecsfundamentals.org](mailto:sam@webcodecsfundamentals.org)

### How to Contribute

1. Fork this repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Make your changes to markdown files in `src/content/docs/`
4. Test locally with `npm run dev`
5. Commit your changes (`git commit -am 'Add new content'`)
6. Push to your branch (`git push origin feature/my-feature`)
7. Open a Pull Request

All contributions must follow the existing documentation style and include working code examples where applicable.

## Documentation Structure

```
src/content/docs/
├── intro/           # Introduction and "Why WebCodecs?"
├── basics/          # VideoEncoder, VideoDecoder, codec strings
├── concepts/        # Core concepts (memory, threading, file handling)
├── patterns/        # Design patterns (playback, transcoding, streaming)
├── performance/     # Optimization techniques
├── audio/           # Audio processing with WebCodecs
├── datasets/        # Codec support dataset and registry
├── projects/        # Ecosystem projects (Mediabunny, etc.)
├── reference/       # About, sources, inside jokes
└── troubleshooting/ # Debugging and common issues
```

## Local Development

Built with [Astro Starlight](https://starlight.astro.build/).

### Prerequisites

- Node.js 18+
- npm or pnpm

### Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT License - see [LICENSE](LICENSE) for details.

Content is freely available for educational and commercial use with attribution.

## About

Created by [Sam Bhattacharyya](https://sambhattacharyya.com) based on years of building production WebCodecs applications. Special thanks to the 700,000+ monthly users of free.upscaler.video who contributed to the codec support dataset.

---

**[View the full site →](https://webcodecsfundamentals.org)**

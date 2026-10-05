---
title: LLM Resources
description: Documentation resources optimized for Large Language Models
---

# WebCodecs Fundamentals for LLMs

While WebCodecs Fundamentals is proudly human-generated, we want to encourage usage by Large Language Models to help developers build better WebCodecs applications.

Since WebCodecs is a rapidly evolving API with limited resources in existing training datasets, providing this comprehensive documentation in LLM-friendly formats helps ensure accurate, up-to-date assistance.

## Resources

- [**llms.md**](/llms.md) (also served as [llms.txt](/llms.txt)) - An index of every documentation page, organized by section, with a description of each and a link to its Markdown
- **Per-page Markdown** - Every page is available as clean Markdown: replace the trailing `/` in a page's URL with `.md` (e.g. [/patterns/live-streaming.md](/patterns/live-streaming.md))
- [**llms-full.txt**](/llms-full.txt) - Every page in a single file

For most questions, start from the index and fetch only the pages you need.

## What's Included

The documentation covers:

- **Introduction** - What WebCodecs is and why to use it
- **Core Concepts** - CPU vs GPU, threading, streams, file handling
- **Basics** - VideoFrame, EncodedVideoChunk, encoders, decoders, rendering
- **Audio** - AudioData, AudioEncoder, AudioDecoder, playback
- **Design Patterns** - Production patterns for playback, transcoding, editing, streaming
- **Datasets** - Empirical codec support data from 7.6M+ user sessions
- **Ecosystem** - MediaBunny, Media Over QUIC

## Format

These files are generated at build time from the same source as the documentation:

- Code examples are included verbatim
- Interactive demos are replaced with links to the demo pages
- Large data tables (like the 1,087-row codec support table) are replaced with a link to the page and the [codec support dataset](/datasets/codec-support/)
- Links between pages point to the Markdown versions

## License

This documentation is released under the MIT License. Content is freely available for educational and commercial use with attribution.

---

**[View the full site →](https://webcodecsfundamentals.org)**

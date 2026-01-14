# WebCodecs Fundamentals

The missing manual for the WebCodecs API - from basics to production patterns.

## About

WebCodecs Fundamentals is a comprehensive documentation site covering real-world WebCodecs implementation. Current documentation is fragmented between abstract W3C specs and outdated blog posts. This site serves as the production manual covering:

- Core concepts (CPU vs GPU memory, threading, file handling)
- Design patterns (playback, transcoding, live streaming)
- High-performance optimization (zero-copy rendering, memory management)
- Troubleshooting common issues

## Development

Built with [Astro Starlight](https://starlight.astro.build/).

### Prerequisites

- Node.js 18+
- npm or pnpm

### Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Make your changes to the markdown files in `src/content/docs/`
4. Commit your changes (`git commit -am 'Add new content'`)
5. Push to your branch (`git push origin feature/my-feature`)
6. Open a Pull Request

## Documentation Structure

```
src/content/docs/
├── intro/           # Introduction to WebCodecs
├── concepts/        # Core concepts and mental models
├── patterns/        # Design patterns for common use cases
├── performance/     # High-performance optimization techniques
└── troubleshooting/ # Debugging and common issues
```

## License

MIT

---


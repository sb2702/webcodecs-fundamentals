// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'WebCodecs Fundamentals',
			description: 'The missing manual for the WebCodecs API - from basics to production patterns.',
			tableOfContents: false,
			customCss: [
				'./src/styles/custom.css',
			],
			logo: {
         
				src: './src/assets/logo.svg',
				replacesTitle: true
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/yourusername/webcodecs-fundamentals' }
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'What are Codecs?', slug: 'intro/what-are-codecs' },
						{ label: 'What is WebCodecs?', slug: 'intro/what-is-webcodecs' },
						{ label: 'Why use WebCodecs?', slug: 'intro/why-use-webcodecs' },
						{ label: 'Harder than it looks', slug: 'intro/reality-check' },
						{ label: 'MediaBunny: ffmpeg for the web', slug: 'intro/media-bunny' },
					],
				},


				{
					label: 'Core Concepts',
					items: [
						{ label: 'CPU vs GPU', slug: 'concepts/cpu-vs-gpu' },
						{ label: 'Offscreen vs Main thread', slug: 'concepts/threading' },
						{ label: 'File Handling', slug: 'concepts/file-handling' },
					],
				},

				{
					label: 'Basics',
					items: [
						{ label: 'VideoFrame', slug: 'basics/video-frame' },
						{ label: 'EncodedVideoChunk', slug: 'basics/encoded-video-chunk' },
						{ label: 'Muxing', slug: 'basics/muxing' },
						{ label: 'Codecs', slug: 'basics/codecs' },		
						{ label: 'Decoder', slug: 'basics/decoder' },
						{ label: 'Encoder', slug: 'basics/encoder' },
						{ label: 'Rendering', slug: 'basics/rendering' },

					],
				},

				{
					label: 'Audio',
					items: [
						{ label: 'EncodedAudioChunk', slug: 'audio/encoded-audio-chunk' },
						{ label: 'AudioData', slug: 'audio/audio-data' },
						{ label: 'Codecs', slug: 'audio/codecs' },
						{ label: 'Muxing', slug: 'audio/muxing' },
						{ label: 'Playback', slug: 'audio/web-audio' },
					],
				},

				{
					label: 'Design Patterns',
					items: [
						{ label: 'Common use cases', slug: 'patterns/use-cases' },
						{ label: 'Video Player', slug: 'patterns/playback' },
						{ label: 'Transcoding', slug: 'patterns/transcoding' },
						{ label: 'Video Editing', slug: 'patterns/editing' },
						{ label: 'Live Streaming', slug: 'patterns/live-streaming' },
					],
				},

				{
					label: 'Media Bunny',
					items: [
						{ label: 'Video Player', slug: 'media-bunny/playback' },
						{ label: 'Transcoding', slug: 'media-bunny/transcoding' },
						{ label: 'Video Editing', slug: 'media-bunny/editing' },
						{ label: 'Live Streaming', slug: 'media-bunny/live-streaming' },
					],
				},
				{
					label: 'High-Performance',
					items: [
						{ label: 'Zero-Copy Rendering', slug: 'performance/zero-copy' },
						{ label: 'Memory Management', slug: 'performance/memory' },
						{ label: 'Compute Optimization', slug: 'performance/compute' },
					],
				},
				{
					label: 'Troubleshooting',
					items: [
						{ label: 'Common Issues', slug: 'troubleshooting/common-issues' },
						{ label: 'Codec Compatibility', slug: 'troubleshooting/codec-compatibility' },
					],
				},

				{
					label: 'Datasets',
					items: [
						{ label: 'About', slug: 'datasets/intro' },
						{ label: 'Codec Strings', slug: 'datasets/codec-strings' },
						{ label: 'Codec Support', slug: 'datasets/codec-support' },
						{ label: 'Encode/Decode Performance', slug: 'datasets/performance' },
						{ label: 'Key Frames vs Delta frames', slug: 'datasets/key-delta' },
					],
				},
			],
		}),
	],
});

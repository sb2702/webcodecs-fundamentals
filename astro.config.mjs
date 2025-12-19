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
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/yourusername/webcodecs-fundamentals' }
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'What is WebCodecs?', slug: 'intro/what-is-webcodecs' },
						{ label: 'Why use WebCodecs?', slug: 'intro/why-use-webcodecs' },
						{ label: 'The Reality Check', slug: 'intro/reality-check' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'CPU vs GPU Memory', slug: 'concepts/cpu-vs-gpu' },
						{ label: 'Threading Model', slug: 'concepts/threading' },
						{ label: 'File Handling', slug: 'concepts/file-handling' },
					],
				},
				{
					label: 'Design Patterns',
					items: [
						{ label: 'The Decoding Loop', slug: 'patterns/decoding-loop' },
						{ label: 'Playback Architecture', slug: 'patterns/playback' },
						{ label: 'Transcoding', slug: 'patterns/transcoding' },
						{ label: 'Live Streaming', slug: 'patterns/live-streaming' },
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
			],
		}),
	],
});

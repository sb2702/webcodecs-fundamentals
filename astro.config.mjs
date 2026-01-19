// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://webcodecsfundamentals.org',

	markdown: {
		shikiConfig: {
		  theme: 'github-light',
		  themes: {
			light: 'github-light'
		  },
		},
	  },
	vite: {
		server: {
			watch: {
				ignored: ['**/codec_results/**']
			}
		}
	},
	server: {

	        allowedHosts: ['katana.ngrok.dev', 'localhost', '192.168.1.100'],
		host: true,
		headers: {
			'Access-Control-Allow-Origin': '*'
		}
	},
	integrations: [
		starlight({
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
			  },
			head: [
				{
					tag: 'script',
					attrs: {
						src: 'https://cdn.usefathom.com/script.js',
						'data-site': 'XAWNAHQY',
						defer: true,
					},
				},
				{
					tag: 'script',
					attrs: {
						src: 'https://www.googletagmanager.com/gtag/js?id=G-0F8V54T690',
						async: true,
					},
				},
				{
					tag: 'script',
					content: `
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-0F8V54T690');
					`,
				},
			],
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
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/sb2702/webcodecs-fundamentals' }
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'What are Codecs?', slug: 'intro/what-are-codecs' },
						{ label: 'What is WebCodecs?', slug: 'intro/what-is-webcodecs' },
						{ label: 'Why use WebCodecs?', slug: 'intro/why-use-webcodecs' },
						{ label: 'Harder than it looks', slug: 'intro/reality-check' },
					],
				},




				{
					label: 'Core Concepts',
					items: [
						{ label: 'CPU vs GPU', slug: 'concepts/cpu-vs-gpu' },
						{ label: 'Offscreen vs Main thread', slug: 'concepts/threading' },
						{ label: 'Streams', slug: 'concepts/streams' },
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
						{ label: 'Intro', slug: 'audio/intro' },
						{ label: 'AudioData', slug: 'audio/audio-data' },
						{ label: 'EncodedAudioChunk', slug: 'audio/encoded-audio-chunk' },
						{ label: 'Decoding & Encoding', slug: 'audio/decoding-encoding' },
						{ label: 'Playback', slug: 'audio/web-audio' },
						{ label: 'MP3', slug: 'audio/mp3' },
					],
				},

				{
					label: 'Design Patterns',
					items: [
						{ label: 'Common use cases', slug: 'patterns/use-cases' },
						{ label: 'Video Player', slug: 'patterns/playback' },
						{ label: 'Transcoding', slug: 'patterns/transcoding' },
						{ label: 'Video Editing', slug: 'patterns/editing' },
						{ label: 'Programmatic Video Generation', slug: 'patterns/generation' },
						{ label: 'Live Streaming', slug: 'patterns/live-streaming' },
					],
				},
/*
				{
					label: 'Mediabunny',
					items: [
						{ label: 'Intro', slug: 'media-bunny/intro' },
						{ label: 'Video Player', slug: 'media-bunny/playback' },
						{ label: 'Transcoding', slug: 'media-bunny/transcoding' },
						{ label: 'Video Editing', slug: 'media-bunny/editing' },
						{ label: 'Live Streaming', slug: 'media-bunny/live-streaming' },
					],
				},
*/
				{
					label: 'Datasets',
					items: [

						{ label: 'Codec Support Table', slug: 'datasets/codec-support-table' },
						{ label: 'Codec Support Dataset', slug: 'datasets/codec-support' },

					],
				},

				{
					label: 'Ecosystem',
					items: [
						{ label: 'MediaBunny: ffmpeg for the web', slug: 'projects/media-bunny' },
						{ label: 'Media Over Quic', slug: 'projects/moq' },
						{ label: 'Remotion', slug: 'projects/remotion' }
					],
				},


				{
					label: 'Reference',
					items: [
						{ label: 'About', slug: 'reference/about' },
						{ label: 'Sources', slug: 'reference/sources' },
						{ label: 'Inside Jokes', slug: 'reference/inside-jokes' },
					],
				},
			],
		}),
	],
});

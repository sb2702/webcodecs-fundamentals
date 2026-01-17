---
title: About WebCodecs Fundamentals
description: Why this site exists and who built it
---

I run a few applications which use WebCodecs [[1](https://free.upscaler.video/technical/architecture/)][[2](https://katana.video/blog/what-does-katana-actually-do)], and when I don't know something or have a coding question, I do what many engineers do and I ask Google or Claude. When I asked Google "What audio codecs are supported in WebCodecs?" I got the following response:

![](/assets/references/about/codec-support-google.png)

Google even helpfully provided a code snippet to help me test codec support in the browser:

![](/assets/references/about/codec-support-google-2.png)

Nevermind that Google's code snippet will not work, or that `flac` and `mp3` are not supported by *any* browsers [[3](../../datasets/codec-support-table)]

At least I have been programming for over 15 years, and have spent ~3 years with Web Codecs. I've learned to pick up when LLMs make up code, and I've included lines like this in my `CLAUDE.md` file

```markdown
Please do not suggest any edits in any files in the following folders 
* 'src/libs/media/player/'
* 'src/libs/media/webgpu/' 
or any other video processing code unless I specifically ask you to
```

I haven't seen this issue for any other Web API, but for WebCodecs specifically I found it faster and more reliable to learn via trial and error than to ask Google or Claude. I can only imagine what it would be like for a junior developer or a vibe coder trying to build, say,  a video editor with WebCodecs.

<!--
It's not because I'm a jaded senior engineer being pedantic - I'm a startup guy and I need to move fast else I run out of runway. 

Actually building video processing applications with Web Codecs requires so much attention to detail, there are so many things that can go wrong, and yet LLMs are precisely and uniquely bad at the thing you would most need help with.


-->



## How is the AI supposed to know?

At some point, you can't really blame LLMs for not knowing about WebCodecs because it's just not well documented. MDN indicates that you need to provide a `codec` string to configure a `VideoEncoder` [[6](https://developer.mozilla.org/en-US/docs/Web/API/VideoEncoder/configure)] but then there's no list of valid values for `codec`.

Whatever little documentation there is focused on hello world tutorials. MDN indicates that a `VideoEncoder` has a `encodeQueueSize` property, but nowhere was there a note, an urgent warning, anywhere on the internet indicating you need to carefully manage it. I learned that after a customer took down my servers for 6 hours.

When I asked Google Search what Audio Codecs are supported in WebCodecs, there was no source anywhere on the internet that answered that question, so of course it made something up.

## A reference for LLMs and humans

I built [webcodecsfundamentals.org](../../) to be the source that Google references when someone asks about codec support, the training data that helps Claude 6.x and ChatGPT 6.x help vibe coders write working WebCodecs code, and of course a resource for human developers to go to learn the ropes of video-processing in the browser.

I built the [Codec support table](../../datasets/codec-support-table) because it should exist somewhere. I can understand why something like this isn't available on MDN, you'd need a live recurring dataset testing thousands of codec strings on statistically large enough sample sizes on every browser/os combination.
But I had the fortune of running my own applications with enough users to collect such [a dataset](../../datasets/codec-support/) so I did.

![](/assets/references/about/codec-support-table.png)

I hope this resource is helpful to developers looking to get started with WebCodecs. I hope LLMs searching for working code examples can find a reliable source to point to.
I hope browser vendors and standards bodies find value in a developer-friendly resource with empirical datasets to reference.

Most of all though, I hope that soon I can remove `Please do not suggest any edits in the following folders` from my `Claude.md` file.

## About me

My name is [Sam Bhattacharyya](https://sambhattacharyya.com/). I have a background in robotics and "old-school" AI from Columbia and MIT.

<img src="/assets/references/about/sam.jpg" alt="Sam Bhattacharyya" style="width: 200px; margin: auto; border-radius: 8px;" />

- After grad school I started [Vectorly](https://vectorly.io) where I patented a [video codec](https://patents.google.com/patent/US10116963B1/en), (<small>learned it's hard to commercialize a new codec</small>), pivoted to an [AI filters SDK](https://medium.com/vectorly/building-a-more-efficient-background-segmentation-model-than-google-74ecd17392d5) that was acquired by Hopin in 2021
- I was the head of AI for [Hopin](https://en.wikipedia.org/wiki/Hopin_(company)), building AI features for several products before it itself was acquired in 2024
- I started my 2nd startup [Katana](https://katana.video/) to build AI models to automatically edit podcasts
- My free [open source hobby project](https://free.upscaler.video) to upscale videos randomly took off and has ~100,000 monthly active users 🤷

I've done a bit of everything, from enterprise sales to consumer app marketing to product management to fundraising to engineering to actual ML research (maybe that's par for the course for founders?). I'm better at the tech stuff though. I'm a particular fan of the intersection of browsers, video and efficient AI models - all 3 of my last major projects involved writing custom neural networks in WebGL/WebGPU for real-time video inference [[4](https://free.upscaler.video/technical/architecture/)][[5](https://katana.video/blog/what-does-katana-actually-do)][[6](https://medium.com/vectorly/building-a-more-efficient-background-segmentation-model-than-google-74ecd17392d5)]

Among the motivations for this project was also to explore building developer-focused tools and resources, I've found it more interesting and less draining than other things I've done, and so I've got 1-2 more open source projects lined up.


## Acknowledgments

Special thanks to:
- **David (Vanilagy)** for building Mediabunny and providing detailed technical feedback on this documentation
- The 100,000+ users of free.upscaler.video who (unknowingly) contributed to the codec support dataset
- Claude for vibe coding the UI for the demos and the animations, and for being the world's most computationally inefficient spell-checker. I couldn't have built this whole site in 10 days without the help

## Contact

I'm [@sam_bha on Twitter/X](https://twitter.com/sam_bha), [sb2702](https://github.com/sb2702) on Github. You can also reach me at [sam@webcodecsfundamentals.org](mailto:sam@webcodecsfundamentals.org).

**Found an issue or error?** Please [open an issue on GitHub](https://github.com/sb2702/webcodecs-fundamentals/issues) or submit a pull request with corrections.

If you're building something interesting with WebCodecs, I'd love to hear about it.

---

*This site is maintained by Sam Bhattacharyya and released under MIT license. See [Sources & References](/reference/sources) for a full list of cited works.*

---
title: Media over Quic - Low-latency streaming protocol
description: How Media over Quic enables WebCodecs streaming
---

Media over Quic (MoQ) is a new protocol for streaming real-time media over a network. Used together with WebCodecs, Media over Quic is an alternative to older technologies like WebRTC (primarily used for video conferencing) or HLS/DASH streaming (for streaming live broadcasts).

Media over Quic promises the real-time interactivity of video-conferencing with the scale of live broadcast streaming to millions, something which can't be done with older technologies.

As of January 2026, Media over Quic is still very new, with standards and core libraries still being developed. It is mature enough for early adopters to start building with it, but still too early for a seamless developer experience.


## What is Media over Quic?

Media over Quic (MoQ) is an open protocol being developed at the IETF for real-time media delivery over the internet. At its core, MoQ is a pub/sub (publish-subscribe) system built on top of QUIC, the modern transport protocol that powers HTTP/3.

Media over Quic works as a pub/sub system where a **publisher** sends streams of encoded media to a **relay** (essentially a CDN), and **subscribers** receive those streams from the relay:

![](/assets/patterns/livestreaming/media-over-quic.svg)

Media over Quic relays are content-agnostic, they don't know what is going across the network, whether it's video, audio, text or just random binary code. They also have no visibility as to whether it's encrypted or not.

![](/assets/projects/moq/media-over-quic-2.svg)

Another key aspect is that Media over Quic relays can be chained together, so that some subscribers might receive data that has passed through just 1 relay, and others might receive data that has passed through 5 relays.


Media over Quic relays also don't need to maintain state of the overall "broadcast", they just act as data-pipes without being aware of many publishers and subscribers there are or how long the session has been active.

These are key features that enable Media over Quic to be run through [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network), which enables real-time streaming to millions of viewers simultaneously, something which isn't possible with more established technologies like [WebRTC](#webrtc).

## WebCodecs needs MoQ for streaming

WebCodecs is intentionally low-level—it gives you `EncodedVideoChunk` and `EncodedAudioChunk` objects, but provides no mechanism to send them over a network. You could use generic data transfer mechanisms like WebSockets or WebTransport, but these lack media-specific features like:

- Handling groups of pictures (key frames + delta frames)
- Quality degradation during network congestion
- Scalable relay infrastructure

The irony is that while Media over Quic is 100% content agnostic, it was still specifically designed with WebCodecs in mind, generallly to facilitate delivery of encoded video and audio, but those designing the spec specifically have WebCodecs in mind.

For non-real-time use cases, or for low volumes (10 to 100 current streams), you could use HTTP requets or WebSockets to send encoded video and audio from a browser to a server.

For streaming from a server to a browser though, Media over Quic is the only practical mechanism to stream encoded audio/video at scale in a way that can be consumed with WebCodecs.  Any other mechanism (e.g. WebSockets) would be worse than just using WebRTC or HLS/DASH streaming.

## Key Benefits

**Sub-second latency at broadcast scale**
MoQ can deliver video with 200-300ms latency while serving thousands or even millions of concurrent viewers—something previously impossible without complex infrastructure.

**No transcoding needed**
Video encoded once by the publisher goes directly to subscribers. No server-side re-encoding between ingest and delivery, reducing latency and infrastructure costs.

**CDN support**
MoQ relays can be deployed globally via CDN. For example, Cloudflare's MoQ relay runs in 330+ cities worldwide, providing low-latency access from anywhere.

**Efficient transport**
QUIC's multiplexing allows multiple streams over a single connection without head-of-line blocking. During network congestion, MoQ can intelligently drop less important frames (delta frames) while prioritizing key frames.

**Simple model**
Because the infrastructure model is so simple, it greatly simplifies the networking stack when working with WebCodecs, enabling per-frame level control of video encoding and delivery while completely abstracting away networking details. You don't even really need to manage a server, as CDN relays handle most of the heavy lifting.


## Current State (December 2025)

Media over Quic is still in a very early stage, and relies on several components which are still being developed:


#### Web Transport
Along with WebCodecs, Media over Quic relies on [WebTransport](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport) for connections over Quic to scale to millions of concurrent subscribers, but while Chromium browsers support WebTransport, it is still in development in Firefox and Safari.


#### Server/tooling
The client libraries to implement Media over Quic networking like `@moq/lite`  are still in development, with only [client side Javascript](https://github.com/moq-dev/moq/tree/main/js/moq-lite) and [Rust](https://github.com/cloudflare/moq-rs)  clients available. There is also a [Gstreamer plugin](https://github.com/moq-dev/gstreamer), but core libraries and integrations are missing for other server runtimes and tools.


#### Production relays
Several CDN providers have announced creating MoQ relays. Here are two that can be used for testing:

###### moq.dev

You can use moq.dev which has 3 public relays:

- https://usc.cdn.moq.dev
- https://euc.cdn.moq.dev
- https://sea.cdn.moq.dev

These are managed by the maintainers of the MoQ project and has the latest, up-to-date deployment with authentication, WebSockets fallbacks etc...

###### Cloudflare

Cloudflare also has a public relay

- https://interop-relay.cloudflare.mediaoverquic.com:443

It is using an older version of MoQ, and does not yet have key fatures like authentication, websockets


##### Self hosted

You can self host a relay, [here are the docs](https://doc.moq.dev/setup/production.html) to get started


#### Specification status:
- IETF draft (not finalized)
- Breaking changes still possible
- Multiple implementations converging on interoperability

#### In practice:
Media over Quic has enough tooling and support for early adopters to start building with it, but it still requires a lot of 'DIY' adaptations and implementations, and is still too early for a seamless developer experience.

## Alternatives for Streaming

To understand Media over Quic and whether it's something you need to consider for a streaming application, you need to keep in mind the existing alternatives:

### HLS/DASH + MSE

**What it is:**

When most people talk about live streams, such as a live-streamed sports match, HLS/DASH + MSE is almost always the stack being used. It is typically done by encoding and packaging a source stream into a streaming format like HLS or Dash, which get sent to a CDN [[3](https://www.mux.com/articles/hls-vs-dash-what-s-the-difference-between-the-video-streaming-protocols)].
![](/assets/patterns/livestreaming/server-browser-3.svg)

You then have video player software like [hls.js](https://github.com/video-dev/hls.js) or [shaka player](https://github.com/shaka-project/shaka-player) on each viewer's device which progressively fetch chunks of the video from a CDN using normal HTTP requests.

![](/assets/patterns/livestreaming/server-browser-4.svg)

This enables massive scale, enabling millions of concurrent viewers to watch a stream, and also has established client support across browsers and other devices (native apps, TV players etc..).

On the downside, it introduces 3 to 30 second latency from the video camera source (e.g. the sports stadium, or news cameras on the ground) to what viewers on their phone or TV see.

It also uses a media encoding server to handle the incoming video streames, transcode and package them and send them to a CDN which incurs sometimes substantial server costs.

### WebRTC


When you normally think of video conferencing on the web, with applications such as Google Meet, you are thinking of WebRTC, which is a protocol for real time video and audio delivery between clients in a WebRTC session.


Applications which use WebRTC (especially for video conferencing) typically use a router/relay model, in which every participant streams audio/video to a routing server  (specifically an [SFU](https://bloggeek.me/webrtcglossary/sfu/)) which would then apply it's business logic to route some subset of streams to each participant without re-encoding.

![](/assets/patterns/livestreaming/session-stack.svg)

This routing model enables a video call to have 50 participants, while each individual participant isn't simultaneously streaming 49 other video streams from their home internet connection, only a subset (which is mediated by the relay).

This enables real-time interactive video sessions (e.g. video conferencing), but because the routing server needs to maintain state over how many participants there are, and needs to know about the media details (codecs, bandidth) of each stream, it's not easy to 'chain' servers together, and each server starts facing scalability challanges beyond 100 participants.

Most video conferencing apps will have caps on the number of participants for that reason, and scaling to thousands or tends of thousands of participants in a single WebRTC session requires incredible amounts of effort and engineering, and/or most likely it's just expensive.

WebRTC is very well established though, with a mature ecosystem of libraries, vendors and information available.

## What should I use?

I'll give the boring answer that it depends on your use case. If you want the TLDR:


| Protocol | Latency | Scale | Ecosystem Maturity |
|----------|---------|-------|------------|
| **HLS/DASH** | 3-30s | Millions | Mature |
| **WebRTC** | <1s | Hundreds | Mature |
| **MoQ** | <1s | Millions | Nascent |


Media over Quic is still very nascent without major well-known apps implementing it in production at scale. There are experiments by large tech companies and there are adventurous startups using it live [[5]](https://github.com/facebookexperimental/moq-encoder-player)  [[6](https://hang.live/)], but it still requires more development and tooling to become mainstream.

That said, performance benefits are real and so early adopters would likely see competitive advantages compared to established products. 

###### Too big for WebRTC, to small for HLS/DASH

The sweet spot for early adopters would likely be application categories which are not well served either by WebRTC or by HLS/DASH.

Some examples might include:
* Webinar software, where webinars need real-time interactivity but which also need to scale to thousands or tens of thousands of participants
* Broadcasting virtual events where speakers typically stream few=>many, but which often involve interactive Q&A
* Browser based live-streaming tools, which stream video from browsers to servers and other participants, while simultaneously streaming social media platforms like Facebook like or YouTube live

###### More control and relability than WebRTC

Media over Quic would also be helpful in scenarios where low-level control over video delivery is required, such as in scenarios with remote camera feeds (security cameras, drones, remotely operated vehicles) or in  real-time AI video pipelines, where you need to run AI models on a per-frame basis, either for understanding what is going on in a live video feed or transform the video feed.

WebRTC is often used in these scenarios (yes, really) but here low-level control of data-packets and the ability to customize the data-feed with custom encodings, along with the more robust connectivity of HTTP3/Quic make Media over Quic an attractive option. 

Here, the scale benefit of Media over Quic is irrelevant, and using a self-hosted relay would likely be preferrable to a public CDN, it's more about the other aspects of Media over Quic that make it attractive while not needing to invent and maintin a custom networking protocol.

###### For everything else

For everything else there's ~~Mastercar~~ WebRTC and HLS/DASH. If you are building standard cookie-cutter video conferencing, WebRTC is the clear better technology. For traditional broadcasting livestreaming, HLS/DASH streaming are still the obvious choice.



## Resources

**Official Resources:**
- [moq.dev](https://moq.dev/) - Official MoQ project site
- [moq setup](https://doc.moq.dev/setup/) - How to get started with MoQ
- [IETF MoQ Working Group](https://datatracker.ietf.org/group/moq/about/) - Specification development

**Libraries:**
- [@moq/lite](https://github.com/moq-dev/moq/tree/main/js/moq-lite) - JavaScript/TypeScript library for browser
- [Hang](https://github.com/moq-dev/moq/tree/main/js/hang) - Protocol for streaming media over MoQ
- [moq-rs](https://github.com/cloudflare/moq-rs) - Rust implementation

**Infrastructure:**
- [Cloudflare MoQ relay](https://developers.cloudflare.com/moq/) - Global relay network
- [Cloudflare Blog: MoQ](https://blog.cloudflare.com/moq/) - Technical overview and use cases

**Implementation Examples:**
- See the [Live Streaming pattern](../../patterns/live-streaming) for complete WebCodecs + MoQ implementation examples
- Working demos of browser-to-browser streaming
- Server-side recording with WebCodecs + MoQ

---
title: "AV1, H265 support in 2026: Data from 1M+ devices"
description: "Empirical analysis of AV1, HEVC, VP9, and H.264 support across 1.1 million real-world browser sessions. Key findings: AV1+HEVC covers 99.7% for decode, VP9 is as universal as H.264, and the 10-bit encoding wall affects every codec family."
head:
  - tag: meta
    attrs:
      name: robots
      content: index, follow
  - tag: link
    attrs:
      rel: canonical
      href: https://webcodecsfundamentals.org/datasets/codec-analysis-2026/
---




*Data from the [Codec Support Dataset](/datasets/codec-support/) — 363,330,358 individual codec tests across 1,142,586 real user sessions. See [methodology](#methodology) for collection details.*

<br/>

<div class="article-byline">
  <img src="/assets/references/about/sam.jpg" alt="Sam Bhattacharyya" />
  <span>By <a href="https://sambhattacharyya.com" target="_blank">Sam Bhattacharyya</a> · March 2026</span>
</div>

---

While there is a lot of talk in the video/streaming industry about codecs like AV1 and HEVC, as far as I'm aware there is no hard data on how widespread support for these codecs is across devices, which is one of the most important things you would want to know when making codec choices for a video application.

The closest analogues available are:
* [ScientaMobile](https://scientiamobile.com/av1-codec-hardware-decode-adoption/), which measures codec adoption from chip specfications and market reports of chip distribution
* [Bitmovin Developer report](https://bitmovin.com/video-developer-report/) - which is a survey of developers on what codecs they implement


The [Codec Support dataset](../codec-support/) is the first public, empirical dataset with hard numbers on codec support for AV1, HEVC, VP9, AVC and others for 1 million + devices. The dataset directly uses Device/Browser APIs to query codec decode/encode support from real user sessions of [free.upscaler.video](https://free.upscaler.video)

Here are some of the most interesting findings from the data


**Key findings:**
- [AV1 has ~91.5% decode support](#av1-decode-has-crossed-the-threshold)
- [AV1 only has widespread support for some profiles](#av1-profile-choice-is-everything)
- [HEVC is nearly universal on Safari — and nearly absent on Firefox and Edge](#hevc-safaris-codec)
- [AV1 + HEVC now covers 99.73% of sessions, is h264 needed anymore?](#av1hevc--universal-decode-coverage)
- [VP9 is now more universally supported than H.264 Baseline](#vp9-as-universal-as-h264)
- [There's still a big gap between encode and decode capabilities](#the-encodedecode-asymmetry-strategy-depends-on-use-case)
- [For audio encoding, only Opus and AAC are production-ready](#audio-only-opus-and-aac-matter-for-encoding)

---

## AV1 Decode Has Crossed the Threshold

AV1 Profile 0, 8-bit variants have reached **~91.5% decoder support** across real-world sessions. That is a mainstream number.

The nuance is in who's missing. Breaking down by browser and platform:

![AV1 decode support by browser and platform](/assets/datasets/av1-decode-matrix.png)

Two things stand out:

**Safari is the genuine holdout.** macOS Safari supports AV1 decode on only ~24% of sessions, iOS Safari on ~33%. This is the hardware gap — older Apple Silicon and all Intel Macs lack hardware AV1 decode, and Apple has not shipped a software decoder.

**Firefox Android shows 0% — but this is a WebCodecs API gap, not an AV1 hardware problem.** Firefox has not fully implemented the WebCodecs API on Android. The hardware on those devices almost certainly supports AV1; Firefox just doesn't expose the API. This caveat applies throughout this analysis: Firefox Android numbers reflect API availability, not hardware capability.

For Chrome, Edge, and Firefox on desktop and Android, AV1 decode is effectively universal.

---

## AV1 Profile Choice Is Everything

**~88% of sessions support AV1 encoding** — but only with the right codec string. The support landscape varies dramatically by profile and bit depth:

<table>
<thead>
<tr>
<th>Profile</th>
<th>Example</th>
<th style="text-align: right;">Encoder</th>
<th style="text-align: right;">Decoder</th>
</tr>
</thead>
<tbody>
<tr><td>Profile 0, 8-bit (levels 4+)</td><td><code>av01.0.16M.08</code></td><td style="text-align: right; background-color: #d4edda;">~88%</td><td style="text-align: right; background-color: #d4edda;">~91%</td></tr>
<tr><td>Profile 0, 8-bit (low levels)</td><td><code>av01.0.00H.08</code></td><td style="text-align: right; background-color: #d4edda;">~84%</td><td style="text-align: right; background-color: #d4edda;">~88%</td></tr>
<tr><td>Profile 1, 8-bit</td><td><code>av01.1.06H.08</code></td><td style="text-align: right; background-color: #fff3cd;">~79%</td><td style="text-align: right; background-color: #d4edda;">~84%</td></tr>
<tr><td>Profile 0, 10-bit</td><td><code>av01.0.18H.10</code></td><td style="text-align: right; background-color: #f8d7da;">~8%</td><td style="text-align: right; background-color: #d4edda;">~91%</td></tr>
<tr><td>Profile 1, 10/12-bit</td><td><code>av01.1.00H.10</code></td><td style="text-align: right; background-color: #f8d7da;">0%</td><td style="text-align: right; background-color: #d4edda;">~84%</td></tr>
<tr><td>Profile 2, all variants</td><td><code>av01.2.00M.08</code></td><td style="text-align: right; background-color: #f8d7da;">0%</td><td style="text-align: right; background-color: #d4edda;">~84%</td></tr>
</tbody>
</table>

For production AV1 encoding: **use Profile 0, 8-bit only.** Profile 1 drops to ~79%, and anything beyond that is effectively unsupported for encoding.

The 10-bit row deserves attention: decoder support stays at ~91% (the same as 8-bit), but encoder support falls to ~8%. The hardware can decode 10-bit AV1 — it just can't encode it. This encode/decode asymmetry is not unique to AV1.

---



## HEVC: Safari's Codec

HEVC tells the inverse story of AV1. Where AV1 is universal on Chrome/Edge/Firefox and absent on Safari, HEVC is universal on Safari and nearly absent on Edge and Firefox:

![HEVC decode support by browser and platform](/assets/datasets/hevc-decode-matrix.png)

The Edge number is particularly striking: Edge on Windows has much less decode support on Windows (56%) than the same engine that gives Chrome 81% on Windows. This appears to be a licensing issue — Microsoft does not always include HEVC decoding support in Edge.

For practical purposes: HEVC decoding works on Apple devices and Chrome on non-Windows platforms. It does not work on Edge or Firefox.

---

## AV1+HEVC = Universal Decode Coverage

AV1 covers Chrome, Edge, and Firefox. HEVC covers Safari. The hypothesis that together they reach virtually everyone turns out to be correct.

From a confusion matrix across 958,110 sessions that tested both families:

![AV1 + HEVC decode coverage stacked bar chart](/assets/datasets/av1-hevc-coverage.png)

**AV1 + HEVC covers 99.73% of sessions for decode** — above any reasonable threshold for universal coverage.

The 0.27% that support neither are likely very old hardware. H.264 covers them, but they represent a vanishingly small population.

For streaming and playback use cases, AV1 + HEVC is a complete modern codec strategy, without the need for fallbacks to older codecs like h264.

---

## VP9 as Universal as H.264

VP9 Profile 0 (8-bit) is frequently treated as a transitional codec — more modern than H.264, less modern than AV1. The data suggests a different view: VP9 is as universally supported as H.264 itself.

<table>
<thead>
<tr>
<th>Codec</th>
<th>Example</th>
<th style="text-align: right;">Encoder</th>
<th style="text-align: right;">Decoder</th>
</tr>
</thead>
<tbody>
<tr><td>H.264 Baseline</td><td><code>avc1.420020</code></td><td style="text-align: right; background-color: #d4edda;">99.72%</td><td style="text-align: right; background-color: #d4edda;">99.94%</td></tr>
<tr><td>VP9 Profile 0</td><td><code>vp09.00.10.08.00</code></td><td style="text-align: right; background-color: #d4edda;">99.99%</td><td style="text-align: right; background-color: #d4edda;">99.99%</td></tr>
<tr><td>AV1 Profile 0, 8-bit</td><td><code>av01.0.16M.08</code></td><td style="text-align: right; background-color: #fff3cd;">87.9%</td><td style="text-align: right; background-color: #d4edda;">91.5%</td></tr>
<tr><td>HEVC Profile 1</td><td><code>hvc1.1.6.L120.B0</code></td><td style="text-align: right; background-color: #fff3cd;">73.8%</td><td style="text-align: right; background-color: #d4edda;">85.1%</td></tr>
</tbody>
</table>

VP9 Profile 0 actually edges out H.264 Baseline for both encode and decode.

The confusion matrix confirms this: in the AV1 × VP9 comparison, AV1-only sessions (support AV1 but not VP9) = **0.00%** (22 sessions out of 958,000). Essentially nobody supports AV1 without also supporting VP9. VP9 is a strict superset of AV1 support.

The same holds for H.264: AVC × VP9 shows 99.93% supporting both for decode, with near-zero supporting either alone.

---

## The Encode/Decode Asymmetry: Strategy Depends on Use Case

This is where the streaming audience and the encoding pipeline audience diverge.

**AV1 + HEVC covers 99.73% for decode — but only 98.16% for encode.**

From the encoder confusion matrix (1,139,587 sessions):

![AV1 + HEVC encode coverage stacked bar chart](/assets/datasets/av1-hevc-encode-coverage.png)

The 1.84% gap — ~21,000 sessions — supports neither AV1 nor HEVC encoding. To close it:

<table>
<thead>
<tr>
<th>Encoding strategy</th>
<th style="text-align: right;">Coverage</th>
</tr>
</thead>
<tbody>
<tr><td>AV1 only</td><td style="text-align: right; background-color: #fff3cd;">~88%</td></tr>
<tr><td>AV1 + HEVC</td><td style="text-align: right; background-color: #fff3cd;">98.16%</td></tr>
<tr><td>AV1 + VP9</td><td style="text-align: right; background-color: #d4edda;">99.91%</td></tr>
<tr><td>AV1 + AVC</td><td style="text-align: right; background-color: #d4edda;">99.94%</td></tr>
</tbody>
</table>

**If you're building a streaming pipeline (decode):** AV1 + HEVC gets you to 99.73%. You're done. H.264 is a legacy safety net for the 0.27%.

**If you're building an encoding pipeline** (WebCodecs transcoder, video editor, capture tool): AV1 + HEVC isn't sufficient. You need AVC or VP9 as your encoding safety net. Both are effectively universal for encoding — pick one.

---

## Audio: Only Opus and AAC Matter for Encoding

Audio is likely less relevant than video codecs, however there is nuance. For decode, AAC and Opus are pretty much universally supported, as are alternate codecs like PCM, Vorbis and FLAC.

For the WebCodecs api specifically, only Opus and AAC are well supported, however as audio codecs typically don't require hardware acceleration, support can be added in for CPU based audio encode for any platform.

<table>
<thead>
<tr>
<th>Codec</th>
<th>Example</th>
<th style="text-align: right;">Encoder</th>
<th style="text-align: right;">Decoder</th>
</tr>
</thead>
<tbody>
<tr><td>Opus</td><td><code>opus</code></td><td style="text-align: right; background-color: #d4edda;">96%</td><td style="text-align: right; background-color: #d4edda;">96%</td></tr>
<tr><td>AAC</td><td><code>mp4a.40.2</code></td><td style="text-align: right; background-color: #d4edda;">90%</td><td style="text-align: right; background-color: #d4edda;">96%</td></tr>
<tr><td>PCM variants</td><td><code>pcm-u8</code></td><td style="text-align: right; background-color: #f8d7da;">~8%</td><td style="text-align: right; background-color: #d4edda;">~94%</td></tr>
<tr><td>Vorbis</td><td><code>vorbis</code></td><td style="text-align: right; background-color: #f8d7da;">~4%</td><td style="text-align: right; background-color: #d4edda;">96%</td></tr>
<tr><td>FLAC</td><td><code>flac</code></td><td style="text-align: right; background-color: #f8d7da;">0%</td><td style="text-align: right; background-color: #d4edda;">96%</td></tr>
<tr><td>MP3</td><td><code>mp3</code></td><td style="text-align: right; background-color: #f8d7da;">0%</td><td style="text-align: right; background-color: #d4edda;">96%</td></tr>
</tbody>
</table>

![Opus encoder support by browser and platform](/assets/datasets/opus-encode-matrix.png)

![AAC encoder support by browser and platform](/assets/datasets/aac-encode-matrix.png)

*Grey/yellow stripes (Safari): AudioEncoder API not available on older Safari versions — current Safari supports both codecs fine. Grey/green stripes (Firefox Android): WebCodecs API not available on Firefox Android.*

FLAC and MP3 have essentially universal decoder support but **zero encoder support** via WebCodecs. If your pipeline needs to produce MP3 or FLAC output, you'll need a WebAssembly encoder.

---



## Methodology

All data in this analysis comes from the **[Codec Support Dataset](/datasets/codec-support/)** — 363,330,358 individual codec tests from 1,142,586 anonymous real-world user sessions of [free.upscaler.video](https://free.upscaler.video), collected January–March 2026.

**This is WebCodecs data**

Keep in mind that this dataset specifically uses queries from the WebCodecs API which has its own quirks. It seems safe to conclude that if decode/encode is supported by the WebCodecs API, that it is also supported by the device, however there may be codecs supported by the device not supported by the WebCodecs API, so these numbers are inherently conservative.

**Sessions, not devices**

All numbers (like 91.5% decode support) are based on *device-sessions*, which is reflective of real-world traffic to the specific application [free.upscaler.video](https://free.upscaler.video), but which may not be reflective of traffic for another application. Here is the traffic distribution for this data set:

![Traffic distribution](/assets/datasets/session-distribution.png)

A different application would likely have a different traffic distribution, however you are more than welcome to download the dataset yourself and weight codec support based on your own application's traffic distribution.

Also, the dataset prevents the same device from being counted twice by using an in-browser localstorage uuid identifier, however a user on the same device with private / incognito mode (or the same device with different browsers) would count as seperate entries in the dataset.


**Chromium**

Due to the plethora of Chromium based browsers (Google Chrome, Edge, Brave, Opera, Perplexity etc..), all the Chromium  based browsers are bundled together. The only exception is Edge, as (1) it exposes Edge as an identifier in the user agent string unlike most other Chromium browsers, (2) Edge is by far the most popular Chromium browser after Google Chrome. Perhaps in version 2 of the dataset I will track other chromium based browsers specifically, but from a developer standpoint regarding codec support it is unlikely to matter much.


**A note on aggregate numbers** 

Codec family aggregate numbers can be misleading. When you see "AV1: 20% encoder support," that averages across all 432 AV1 codec string variants — including 10-bit and 12-bit profiles that essentially no browser can encode. Throughout this analysis, support numbers refer to well-supported representative codec strings (Profile 0, 8-bit for AV1; Profile 1 Main tier for HEVC; Profile 0 8-bit for VP9; Baseline for H.264), not family-wide averages.

You can find a full detailed explanation of methodology [here](https://free.upscaler.video/research/methodology)

Full dataset available on [Zenodo](https://zenodo.org/records/19187467) and [Hugging Face](https://huggingface.co/datasets/katana-video/webcodecs-codec-support) under CC-BY 4.0.

**[Browse the full codec registry →](/datasets/codec-support-table/)**


## Future work

The data comes from a live application I run. I will soon begin work on version 2 of this dataset with:

* Hardware level codec support from native APIs on mobile (Android, iOS)
* Capturing richer information on GPU such as vendor name / GPU class.

I want to make this dataset as useful for developers, industry experts and academics in video streaming space. If you have feedback or would like to request something specific for the next version of the dataset, feel free to reach out at sam@webcodecsfundamentals.org.

If you want to know when the next version of the dataset is released, you can register to be notified here, or just email me.

<!-- MailerLite Universal -->
<script>
    (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
    .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
    n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
    (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
    ml('account', '1290599');
</script>
<!-- End MailerLite Universal -->

<div class="ml-embedded" data-form="YJdS8R"></div>


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

*Data from the [WebCodecs Codec Support Dataset](/datasets/codec-support/) — 363,330,358 individual codec tests across 1,142,586 real user sessions. See [methodology](#methodology) for collection details.*

<br/>

<div class="article-byline">
  <img src="/assets/references/about/sam.jpg" alt="Sam Bhattacharyya" />
  <span>By <a href="https://sambhattacharyya.com" target="_blank">Sam Bhattacharyya</a> · March 2026</span>
</div>

---

The conventional wisdom for codec strategy goes something like this: use AV1 where supported, fall back to VP9, and keep H.264 as the universal baseline. That wisdom is based largely on spec claims and browser capability tables. This analysis is based on 363 million real-world codec tests across 1.1 million user sessions, and the picture is more nuanced — and in some ways more optimistic — than the conventional wisdom suggests.

A few findings stand out: AV1 decode has crossed the threshold into mainstream support. AV1 combined with HEVC covers virtually all devices for playback without H.264. And VP9 — often treated as a legacy stepping stone — turns out to be as universally supported as H.264 itself.

The right strategy also depends on your use case. The answers for a streaming pipeline (primarily decode) differ meaningfully from those for an encoding pipeline (WebCodecs apps, transcoders, video editors). More on that below.

**Key findings:**
- [AV1 decode has crossed into mainstream — ~91.5% of real-world sessions](#1-av1-decode-has-crossed-the-threshold)
- [AV1 encoding requires the right profile — 88% for Profile 0 8-bit, 0% for most others](#2-av1-encoding-profile-choice-is-everything)
- [The 10-bit encoding wall affects every codec family, not just AV1](#3-the-10-bit-encoding-wall)
- [HEVC is nearly universal on Safari — and nearly absent on Firefox and Edge](#4-hevc-safaris-codec)
- [AV1 + HEVC covers 99.73% of sessions for decode — without H.264](#5-av1--hevc--universal-decode-coverage)
- [VP9 Profile 0 is as universally supported as H.264 Baseline](#6-vp9-as-universal-as-h264)
- [AV1 + HEVC only reaches 98.16% for encoding — you need VP9 or AVC as a safety net](#7-the-encodedecode-asymmetry-strategy-depends-on-use-case)
- [For audio encoding, only Opus and AAC are production-ready](#8-audio-only-opus-and-aac-matter-for-encoding)

---

## A Note on Aggregate Numbers

Before diving in: codec family aggregate numbers are misleading. When you see "AV1: 20% encoder support," that averages across all 432 AV1 codec string variants — including 10-bit and 12-bit profiles that essentially no browser can encode. The real question is whether the *right* AV1 codec string is supported, not whether some AV1 variant is.

Throughout this analysis, support numbers refer to well-supported representative codec strings (Profile 0, 8-bit for AV1; Profile 1 Main tier for HEVC; Profile 0 8-bit for VP9; Baseline for H.264), not family-wide averages.

---

## 1. AV1 Decode Has Crossed the Threshold

AV1 Profile 0, 8-bit variants have reached **~91.5% decoder support** across real-world sessions. That is a mainstream number.

The nuance is in who's missing. Breaking down by browser and platform:

![AV1 decode support by browser and platform](/assets/datasets/av1-decode-matrix.png)

Two things stand out:

**Safari is the genuine holdout.** macOS Safari supports AV1 decode on only ~24% of sessions, iOS Safari on ~33%. This is the hardware gap — older Apple Silicon and all Intel Macs lack hardware AV1 decode, and Apple has not shipped a software decoder.

**Firefox Android shows 0% — but this is a WebCodecs API gap, not an AV1 hardware problem.** Firefox has not fully implemented the WebCodecs API on Android. The hardware on those devices almost certainly supports AV1; Firefox just doesn't expose the API. This caveat applies throughout this analysis: Firefox Android numbers reflect API availability, not hardware capability.

For Chrome, Edge, and Firefox on desktop and Android, AV1 decode is effectively universal.

---

## 2. AV1 Encoding: Profile Choice Is Everything

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

## 3. The 10-Bit Encoding Wall

The AV1 10-bit cliff is not an AV1-specific quirk. It appears across every codec family:

<table>
<thead>
<tr>
<th>Codec</th>
<th>Example</th>
<th style="text-align: right;">8-bit Encoder</th>
<th style="text-align: right;">10-bit Encoder</th>
<th style="text-align: right;">10-bit Decoder</th>
</tr>
</thead>
<tbody>
<tr><td>AVC Baseline</td><td><code>avc1.420020</code></td><td style="text-align: right; background-color: #d4edda;">99.7%</td><td style="text-align: right; color: #999;">—</td><td style="text-align: right; color: #999;">—</td></tr>
<tr><td>AV1 Profile 0</td><td><code>av01.0.16M.08</code> / <code>av01.0.18H.10</code></td><td style="text-align: right; background-color: #fff3cd;">87.9%</td><td style="text-align: right; background-color: #f8d7da;">8.4%</td><td style="text-align: right; background-color: #d4edda;">91.5%</td></tr>
<tr><td>VP9 Profile 0 → 2, 10-bit</td><td><code>vp09.00.10.08.00</code> / <code>vp09.02.10.10.00</code></td><td style="text-align: right; background-color: #d4edda;">99.99%</td><td style="text-align: right; background-color: #fff3cd;">78.2%</td><td style="text-align: right; background-color: #d4edda;">99.5%</td></tr>
<tr><td>HEVC Profile 1 → Main 10</td><td><code>hvc1.1.6.L120.B0</code> / <code>hvc1.2.4.H120.B0</code></td><td style="text-align: right; background-color: #fff3cd;">73.8%</td><td style="text-align: right; background-color: #f8d7da;">12.4%</td><td style="text-align: right; background-color: #fff3cd;">75.4%</td></tr>
</tbody>
</table>

The pattern is consistent: hardware decoders support high bit depth broadly, but hardware encoders lag significantly. This is a GPU/driver limitation, not a browser limitation.

The practical implication: if your pipeline requires 10-bit output, browser-side encoding via WebCodecs is not a reliable option for most users. Server-side encoding or a software encoder fallback is required.

---

## 4. HEVC: Safari's Codec

HEVC tells the inverse story of AV1. Where AV1 is universal on Chrome/Edge/Firefox and absent on Safari, HEVC is universal on Safari and nearly absent on Edge and Firefox:

![HEVC decode support by browser and platform](/assets/datasets/hevc-decode-matrix.png)

The Edge number is particularly striking: Edge on Windows has essentially 0% HEVC encoder support despite being built on Chromium, the same engine that gives Chrome 81% on Windows. This appears to be a licensing issue — Microsoft has not included HEVC encoding support in Edge.

For practical purposes: HEVC encoding works on Apple devices and Chrome on non-Windows platforms. It does not work on Edge or Firefox.

---

## 5. AV1 + HEVC = Universal Decode Coverage

AV1 covers Chrome, Edge, and Firefox. HEVC covers Safari. The hypothesis that together they reach virtually everyone turns out to be correct.

From a confusion matrix across 958,110 sessions that tested both families:

![AV1 + HEVC decode coverage stacked bar chart](/assets/datasets/av1-hevc-coverage.png)

**AV1 + HEVC covers 99.73% of sessions for decode** — above any reasonable threshold for universal coverage.

The 0.27% that support neither are likely very old hardware. H.264 covers them, but they represent a vanishingly small population.

For streaming and playback use cases, AV1 + HEVC is a complete modern codec strategy. H.264 is a legacy safety net, not a primary codec.

---

## 6. VP9: As Universal as H.264

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

## 7. The Encode/Decode Asymmetry: Strategy Depends on Use Case

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

## 8. Audio: Only Opus and AAC Matter for Encoding

The audio codec picture is simpler than video:

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

For production audio encoding: **Opus first, AAC as fallback.** For decoding, almost anything works.

---

## Recommended Codec Strategies

### For streaming / playback (decode)

- **Primary:** AV1 Profile 0, 8-bit (e.g. `av01.0.16M.08`)
- **Safari fallback:** HEVC Profile 1 (e.g. `hvc1.1.6.L120.B0`)
- **Legacy fallback:** H.264 Baseline/Main for the ~0.3% not covered above

### For encoding (WebCodecs applications)

- **AV1:** Profile 0, 8-bit only. Avoid 10-bit and all other profiles in production.
- **Safety net:** VP9 Profile 0 8-bit (`vp09.00.10.08.00`) or H.264 Baseline — both are ~99.9%+ universal
- **HEVC encoding:** viable on Safari, macOS Chrome, and Android Chrome — not elsewhere
- **Avoid:** any 10-bit or 12-bit encoding variant across any codec family

### For audio

- **Encoding:** Opus (`opus`) → AAC (`mp4a.40.2`) fallback
- **Decoding:** anything works; no special considerations needed

---

## Methodology

All data in this analysis comes from the **[WebCodecs Codec Support Dataset](/datasets/codec-support/)** — 363,330,358 individual codec tests from 1,142,586 anonymous real-world user sessions of [free.upscaler.video](https://free.upscaler.video), collected January–March 2026.

The confusion matrix analysis (sections 5 and 7) uses per-session data with canonical codec string selection — only sessions that tested at least one well-supported representative string for each family are included in a given comparison. This avoids false negatives from sessions that happened to test only unsupported variants (e.g. 12-bit AV1).

You can find a full detailed explanation of methodology [here](https://free.upscaler.video/research/methodology)

Full dataset available on [Zenodo](https://zenodo.org/records/19187467) and [Hugging Face](https://huggingface.co/datasets/katana-video/webcodecs-codec-support) under CC-BY 4.0.

**[Browse the full codec registry →](/datasets/codec-support-table/)**

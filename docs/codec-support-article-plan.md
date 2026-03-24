# Article Plan: The State of Codec Support in 2026

## Working Title Options
- "AV1 is production-ready — if you use the right profile"
- "Do you still need H.264? What 363 million codec tests reveal"
- "The 2026 WebCodecs Codec Support Report"

**Target audience:** Video infrastructure engineers at companies like Mux, Cloudflare, Bitmoving, Fastly — people making real codec strategy decisions.

**Core thesis:** The conventional wisdom (AV1 where possible, VP9 fallback, H.264 universal baseline) may be outdated. Real-world data from 1M+ sessions tells a more nuanced and in some ways more optimistic story. The right codec strategy also depends on whether you're building a streaming pipeline (decode) or an encoding pipeline — the answer is different.

**Publication:** webcodecsfundamentals.org
**Distribution:** Hacker News, r/AV1, r/programming, direct outreach to video infra engineers, potential Demuxed/SF Video talk pitch

---

## Article Outline

### 1. Introduction: Why This Dataset Exists
- Brief context: built for free.upscaler.video, 1.1M sessions, 363M individual codec tests
- What makes this different from caniuse / MDN: real hardware, not spec claims
- Note on aggregate numbers being misleading (432 AV1 variants averaged together obscures the real picture)
- Link to dataset page and methodology
- **Data needed:** None — already written in dataset page, just needs condensing

---

### 2. AV1 Has Crossed the Threshold
**Thesis:** For decode (playback), AV1 is effectively mainstream — but only if you pick the right codec string.

- Best-supported AV1 variants (Profile 0, 8-bit): ~91% decoder support
- The aggregate "20% encoder / 86% decoder" headline is misleading — it averages 432 variants including unsupported profiles
- Safari/iOS is the genuine holdout (~10-33% AV1 support)
- Firefox Android: 0% due to WebCodecs API not being available (not an AV1 hardware issue — important caveat)
- Chrome + Edge desktop/Android: essentially universal AV1 decode

**Data status: HAVE**
- Profile 0 8-bit decode: ~91.5%
- Per-browser/platform breakdown from av01.0.19H.08 detail page

---

### 3. AV1 Encoding: Profile Matters Enormously
**Thesis:** 88% of browsers can encode AV1 — but only with the right settings.

Key tiers (encoder support):
| Tier | Example | Encoder | Decoder |
|------|---------|---------|---------|
| AV1 Profile 0, 8-bit, levels 4+ | av01.0.16M.08 | ~88% | ~91% |
| AV1 Profile 0, 8-bit, low levels | av01.0.00H.08 | ~84% | ~88% |
| AV1 Profile 1, 8-bit | av01.1.06H.08 | ~79% | ~84% |
| AV1 Profile 0, 10-bit | av01.0.18H.10 | ~8% | ~91% |
| AV1 Profile 1, 10/12-bit | av01.1.00H.10 | 0% | ~84% |
| AV1 Profile 2, all | av01.2.00M.08 | 0% | ~84% |

- Practical recommendation: Profile 0, 8-bit only for production AV1 encoding

**Data status: HAVE** (from codec string table)

---

### 4. The 10-Bit Encoding Wall
**Thesis:** The AV1 10-bit problem isn't an AV1 quirk — it's a universal pattern across every codec family. Hardware encoders don't support high bit depth.

| Codec | 10-bit Encoder | 10-bit Decoder |
|-------|---------------|----------------|
| AV1 Profile 0 10-bit | ~8% | ~91% |
| VP9 Profile 2 10-bit | ~78% | ~99% |
| VP9 Profile 2 12-bit | ~16% | ~99% |
| HEVC Profile 2 (Main 10) | ~12% | ~75% |

- Consistent across all families: hardware can decode high bit depth, encoding is GPU/driver dependent
- Implication: 10-bit output requires server-side encoding or software encoder fallback

**Data status: HAVE** (from codec string table)

---

### 5. HEVC: Safari's Codec
**Thesis:** HEVC is simultaneously the best-supported codec on Safari and nearly useless on Edge/Firefox. It's Apple's codec.

| Browser/Platform | HEVC Encoder | HEVC Decoder |
|-----------------|-------------|-------------|
| Safari macOS | ~97% | ~97% |
| Safari iOS | ~98% | ~98% |
| Chrome macOS | ~96% | ~97% |
| Chrome Windows | ~81% | ~88% |
| Chrome Android | ~91% | ~100% |
| Edge Windows | ~0% | ~56% |
| Edge macOS | ~0% | ~97% |
| Firefox (all) | ~0% | ~0-1% |

- Edge being 0% encoder despite being Chromium-based is a notable anomaly worth calling out
- HEVC is the right answer specifically for Safari — and the only modern codec that reaches Safari well

**Data status: HAVE** (from hvc1.1.6.L30.B0 detail page)

---

### 6. AV1 + HEVC = Universal Decode Coverage
**Thesis:** AV1 covers Chrome/Edge/Firefox; HEVC covers Safari. Together they reach 99.73% of sessions — above the threshold for universal coverage — without H.264 or VP9.

From the confusion matrix (958,110 sessions):
- Both AV1 and HEVC: 76.72%
- AV1 only (no HEVC): 14.76% — Chrome/Edge/Firefox on non-Apple hardware
- HEVC only (no AV1): 8.26% — Safari/iOS
- Neither: 0.27%
- **Union: 99.73%**

- The 0.27% that support neither are likely very old hardware — H.264 covers them
- This means for streaming/playback, AV1+HEVC is a complete modern codec strategy

**Data status: HAVE** (from confusion matrix run)

---

### 7. VP9: Universally Supported — As Universal as H.264
**Thesis:** VP9 Profile 0 (8-bit) has ~99.99% decode support and ~99.87% encode support — essentially identical to H.264. Most people treat VP9 as a legacy codec or a stepping stone to AV1. The data says it's actually a first-class universal codec.

From the confusion matrix:
- AV1 × VP9 decode: AV1-only = 0.00% (22 sessions). Nobody supports AV1 decode without also supporting VP9.
- VP9 × AVC decode: 99.93% both, essentially indistinguishable
- VP9 × AVC encode: 99.58% both, also essentially indistinguishable

- VP9 is a strict superset of AV1 support — if you support AV1, you support VP9, but not vice versa
- Challenges the assumption that H.264 is "the" universal baseline

**Data status: HAVE** (from confusion matrix + codec string tables)

---

### 8. The Encode/Decode Asymmetry: Your Strategy Depends on Your Use Case
**Thesis:** AV1+HEVC is sufficient for decode but NOT for encode. The right codec strategy depends on whether you're building a streaming pipeline or an encoding pipeline.

**If you're a streaming company (decode):**
- AV1+HEVC covers 99.73% — you're done
- VP9 is a nice-to-have, not a requirement

**If you're building an encoding pipeline (WebCodecs apps, video editors, transcoders):**
- AV1+HEVC encode covers only 98.16% — not sufficient
- You need AVC or VP9 as your encoding safety net (both are ~99.9%+ universal)
- HEVC alone doesn't close the gap — AV1+HEVC+AVC or AV1+VP9 does

From the confusion matrix (encode):
- AV1 ∪ HEVC encode: 98.16% (1.84% gap)
- AV1 ∪ VP9 encode: 99.91%
- AV1 ∪ HEVC ∪ AVC encode: 99.94%

**Data status: HAVE** (from confusion matrix run)

---

### 9. Audio: Only Opus and AAC Are Production-Ready for Encoding
**Thesis:** The audio codec landscape for WebCodecs encoding is much simpler than video — only two codecs matter.

| Codec | Encoder | Decoder |
|-------|---------|---------|
| Opus | 96% | 96% |
| AAC (mp4a.40.2) | 90% | 96% |
| PCM variants | ~8% | ~94% |
| Vorbis | ~4% | 96% |
| FLAC | 0% | 96% |
| MP3 | 0% | 96% |

- FLAC and MP3 have essentially universal decode support but zero encode support via WebCodecs
- For encoding: Opus first, AAC as fallback
- For decoding: almost anything works

**Data status: HAVE** (from codec string table)

---

## Key Findings Summary (for article intro/conclusion)

| Finding | Data |
|---------|------|
| AV1 decode (right profile) | ~91.5% |
| AV1 + HEVC decode coverage | 99.73% |
| VP9 decode coverage | ~99.98% |
| VP9 encode coverage | ~99.87% |
| AV1 + HEVC encode coverage | 98.16% |
| AV1 + VP9 encode coverage | 99.91% |
| 10-bit AV1 encoder support | ~8% |
| 10-bit AV1 decoder support | ~91% |

---

## Data Status Summary

### All data in hand — no further queries needed
- [x] AV1 full variant breakdown
- [x] AVC full variant breakdown
- [x] VP9 full variant breakdown
- [x] HEVC variant breakdown
- [x] Audio codec support
- [x] Per-browser/platform breakdowns
- [x] 10-bit encoder wall pattern
- [x] Pairwise confusion matrices for all family pairs
- [x] Multi-family coverage (AV1∪HEVC, AV1∪VP9, AV1∪HEVC∪AVC, etc.)

---

## Distribution Plan

### Owned channels
- Publish on webcodecsfundamentals.org
- Share on r/AV1, r/programming, possibly r/webdev
- Submit to Hacker News

### Outreach targets
- Demuxed / SF Video: pitch as a 10-minute talk ("First large-scale empirical study of WebCodecs codec support")
- Direct email to engineers at Mux, Cloudflare Stream, Bitmoving, Imagekit
- Tag relevant people on LinkedIn/Twitter when sharing

### Natural backlink opportunities
- The article cites the dataset → reinforces dataset page authority
- Dataset page mentions free.upscaler.video as source → natural upscaler backlink
- Academic: arxiv preprint + Harvard Dataverse listing

---

## Notes
- Keep the framing empirical, not spec/theoretical — that's the differentiator
- Firefox Android caveat must be called out in section 2 (WebCodecs API gap, not a codec gap)
- Aggregate numbers (20% AV1 encoder etc.) should be contextualized early — they're misleading without profile context
- The streaming vs. encoding audience split is the key structural insight — makes the article useful to two different audiences rather than one

---
title: The upscaler.video Codec Support Dataset
description: The world's first empirical registry of WebCodecs hardware support, collected from 143,181 real-world user sessions
head:
  - tag: meta
    attrs:
      name: robots
      content: index, follow
  - tag: meta
    attrs:
      name: citation_title
      content: The upscaler.video Codec Support Dataset
  - tag: meta
    attrs:
      name: citation_author
      content: Bhattacharyya, Samrat
  - tag: meta
    attrs:
      name: citation_publication_date
      content: "2026/01/14"
  - tag: meta
    attrs:
      name: DC.title
      content: The upscaler.video Codec Support Dataset
  - tag: meta
    attrs:
      name: DC.creator
      content: Bhattacharyya, Samrat
  - tag: meta
    attrs:
      name: DC.date
      content: "2026-01-14"
  - tag: link
    attrs:
      rel: canonical
      href: https://webcodecsfundamentals.org/datasets/codec-support/
---

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "The upscaler.video Codec Support Dataset",
  "description": "The first comprehensive, empirical collection of real-world WebCodecs API hardware support data from 143,181 unique user sessions spanning diverse hardware, browsers, and operating systems.",
  "url": "https://webcodecsfundamentals.org/datasets/codec-support/",
  "sameAs": "https://free.upscaler.video/research/webcodecs-dataset",
  "keywords": ["WebCodecs", "codec support", "browser compatibility", "hardware acceleration", "video encoding", "AV1", "VP9", "H.264", "HEVC", "hardware decoder", "WebCodecs API", "video decoder", "browser support matrix"],
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "creator": {
    "@type": "Person",
    "name": "Samrat Bhattacharyya",
    "url": "https://free.upscaler.video"
  },
  "publisher": {
    "@type": "Person",
    "name": "Samrat Bhattacharyya"
  },
  "datePublished": "2026-01-14",
  "dateModified": "2026-01-14",
  "version": "2026-01-14",
  "temporalCoverage": "2026-01",
  "spatialCoverage": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/zip",
    "contentUrl": "https://webcodecsfundamentals.org/upscaler-video-codec-dataset.zip",
    "contentSize": "257MB",
    "description": "ZIP archive containing raw CSV dataset (45,519,786 rows, 8.5GB uncompressed) and README"
  },
  "measurementTechnique": "WebCodecs API isConfigSupported() real-world testing on user devices",
  "variableMeasured": [
    {
      "@type": "PropertyValue",
      "name": "codec support",
      "description": "Boolean indicating whether a codec string is supported by the browser/platform combination"
    },
    {
      "@type": "PropertyValue",
      "name": "browser",
      "description": "Browser family (Chrome, Safari, Edge, Firefox)"
    },
    {
      "@type": "PropertyValue",
      "name": "platform",
      "description": "Operating system (Windows, macOS, iOS, Android, Linux)"
    }
  ],
  "about": [
    {
      "@type": "SoftwareApplication",
      "name": "WebCodecs API",
      "url": "https://w3c.github.io/webcodecs/",
      "applicationCategory": "Web API"
    }
  ],
  "isBasedOn": {
    "@type": "SoftwareApplication",
    "name": "free.upscaler.video",
    "url": "https://free.upscaler.video",
    "description": "Open-source video upscaling tool serving 100,000 monthly active users"
  },
  "citation": {
    "@type": "CreativeWork",
    "name": "Dataset Methodology",
    "url": "https://free.upscaler.video/research/webcodecs-dataset"
  },
  "includedInDataCatalog": {
    "@type": "DataCatalog",
    "name": "WebCodecs Fundamentals"
  }
}
</script>

The **upscaler.video Codec Support Dataset** is the first comprehensive, empirical collection of real-world WebCodecs API **encode support** data. Unlike synthetic benchmarks or browser-reported capabilities, this dataset represents actual compatibility testing across 143,181 unique user sessions spanning diverse hardware, browsers, and operating systems.

## Dataset Overview

- **Measurement Type:** Encode support (using `VideoEncoder.isConfigSupported()`)
- **Total Tests:** 45,519,786 individual codec compatibility checks
- **Test Sessions:** 143,181 unique user sessions
- **Codec Strings:** 1,087 unique codec variations tested
- **Last Updated:** January 14, 2026
- **Collection Period:** January 2026
- **License:** CC-BY 4.0

## Download

**[Download upscaler.video Codec Support Dataset (ZIP)](/upscaler-video-codec-dataset.zip)**

The ZIP archive contains:
- `upscaler-video-codec-dataset-raw.csv` - The complete dataset (45.5M rows)
- `README.txt` - Quick reference guide for the dataset structure

### Dataset Format

The dataset contains **45,519,786 rows** - one row per individual codec test. Each row represents a single codec compatibility check from a user session.

| Column | Type | Description |
|--------|------|-------------|
| `timestamp` | ISO 8601 | When the test was performed (e.g., "2026-01-05T00:54:11.570Z") |
| `user_agent` | string | Full browser user agent string |
| `browser` | string | Browser family detected from user agent (Chrome, Safari, Edge, Firefox) |
| `platform_raw` | string | Raw platform identifier from `navigator.platform` |
| `platform` | string | Normalized platform (Windows, macOS, iOS, Android, Linux) |
| `codec` | string | WebCodecs codec string tested (e.g., "av01.0.01M.08") |
| `supported` | boolean | Whether codec was supported (`true` or `false`) |

### Sample Data

```csv
timestamp,user_agent,browser,platform_raw,platform,codec,supported
2026-01-05T00:54:11.570Z,"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",Edge,Win32,Windows,av01.0.01M.08,true
2026-01-05T00:54:11.570Z,"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",Edge,Win32,Windows,vp09.00.41.08,false
2026-01-05T00:36:50.604Z,"Mozilla/5.0 (iPhone; CPU iPhone OS 26_2_0 like Mac OS X) AppleWebKit/605.1.15",Safari,iPhone,iOS,avc1.42001e,true
```

### Dataset Size

- **Rows:** 45,519,786 individual codec tests
- **File Size:** 8.5 GB (uncompressed CSV)
- **Compressed (ZIP):** 257 MB

## Data Collection Methodology

This dataset was collected in a completely anonymized fashion from real users of [free.upscaler.video](https://free.upscaler.video), an [open-source utility](https://github.com/sb2702/free-ai-video-upscaler) to upscale videos in the browser, serving ~100,000 monthly active users.

> **For complete methodology details**, including sampling strategy, statistical controls, and browser detection logic, see **[Dataset Methodology](https://free.upscaler.video/research/webcodecs-dataset)** on free.upscaler.video.

### Key Attributes

- **Real Hardware:** Data from actual user devices, not emulators or lab environments
- **Background Testing:** Codec checks run asynchronously without user interaction
- **Privacy-Preserving:** No PII collected; only anonymous browser/platform metadata
- **Randomized Sampling:** Each session tests 300 random codecs from the 1,087-string pool

### Browser & Platform Distribution

**Browsers Tested:**
- Chrome/Chromium (74% of sessions)
- Safari (13%)
- Edge (8%)
- Firefox (5%)

**Platforms Tested:**
- Windows (57%)
- Android (19%)
- macOS (11%)
- iOS (10%)
- Linux (3%)

**Codec Families:**
- AVC (H.264) - 200+ variants
- HEVC (H.265) - 150+ variants
- VP9 - 100+ variants
- AV1 - 200+ variants
- VP8 - 10+ variants
- Audio codecs - 400+ variants (AAC, Opus, MP3, FLAC, etc.)

## Using This Dataset

### For Web Developers

This dataset answers the critical question: **"Which codec strings actually work in production?"**

The [Codec Registry](/datasets/codec-support-table/) provides an interactive table of all 1,087 tested codecs with real-world support percentages. Use it to:

- **Choose safe defaults:** Codecs with 90%+ support work on virtually all hardware
- **Plan fallback strategies:** Identify which modern codecs (AV1, VP9) need H.264 fallbacks
- **Debug platform-specific issues:** See exact support matrices for browser/OS combinations

### For Browser Vendors & Standards Bodies

This is the first large-scale empirical validation of WebCodecs API implementation consistency across browsers and platforms.

**Use cases:**
- Identify implementation gaps (e.g., Safari's limited AV1 support)
- Prioritize codec support roadmaps based on real hardware distribution
- Validate conformance testing against actual user environments

### For Researchers

The dataset is structured for statistical analysis:

```python
import pandas as pd

# Load the raw dataset
df = pd.read_csv('upscaler-video-codec-dataset-raw.csv')

# Example 1: Calculate support percentage by codec
codec_support = df.groupby('codec').agg({
    'supported': lambda x: (x == 'true').sum(),
    'codec': 'count'
}).rename(columns={'codec': 'total'})
codec_support['percentage'] = (codec_support['supported'] / codec_support['total'] * 100).round(2)

# Example 2: Browser version analysis using user_agent
df['browser_version'] = df['user_agent'].str.extract(r'Chrome/(\d+\.\d+)')

# Example 3: Filter for specific platform
windows_tests = df[df['platform'] == 'Windows']

# Example 4: Time-series analysis
df['timestamp'] = pd.to_datetime(df['timestamp'])
daily_support = df.groupby(df['timestamp'].dt.date)['supported'].apply(
    lambda x: (x == 'true').mean() * 100
)
```

**Key Analysis Opportunities:**
- Browser version-specific codec support trends
- Temporal evolution of codec adoption
- Platform-specific hardware decoder availability
- User agent string parsing for detailed device identification

## Data Quality

### Statistical Confidence

- **143,181 sessions** provide high confidence for common browser/platform combinations
- **45+ million tests** enable fine-grained analysis of codec variant support
- Sample sizes vary by combination; check `total_count` field for statistical validity

### Known Limitations

1. **Geographic Bias:** Data collected from free.upscaler.video users (global distribution)
2. **Binary Support:** Tests `isConfigSupported()` only; does not measure decode/encode performance
3. **Time Sensitivity:** Browser support evolves; data reflects 2026-01 snapshot
4. **Rare Combinations:** Some browser/OS pairs (e.g., Safari+Linux) have <50 samples

See the [Dataset Methodology](https://free.upscaler.video/research/webcodecs-dataset) for detailed analysis of sampling biases and statistical controls.

## Citation

When referencing this dataset in academic work, documentation, or standards proposals:

```bibtex
@dataset{upscaler_codec_dataset_2026,
  title        = {The upscaler.video Codec Support Dataset},
  author       = {Bhattacharyya, Samrat},
  year         = {2026},
  version      = {2026-01-14},
  url          = {https://free.upscaler.video/research/webcodecs-dataset},
  note         = {45.5M codec tests from 143k sessions}
}
```

For informal citations:

> **Data Source:** [The upscaler.video Codec Support Dataset](https://free.upscaler.video/research/webcodecs-dataset)
> **License:** CC-BY 4.0

## License

**Creative Commons Attribution 4.0 International (CC-BY 4.0)**

You are free to:
- **Share** — copy and redistribute in any format
- **Adapt** — remix, transform, and build upon the data
- **Commercial use** — use for any purpose, including commercially

**Attribution requirement:** Credit "upscaler.video Codec Support Dataset" with a link to this page.

## Updates & Versioning

This dataset is periodically updated as new data is collected from free.upscaler.video users.

- **Current Version:** 2026-01-14 (143,181 sessions)
- **Update Frequency:** Quarterly
- **Changelog:** [View version history](https://github.com/sb2702/webcodecs-fundamentals/releases)

## Related Resources

- **[Codec Registry](/datasets/codec-support-table/)** - Interactive table of all tested codecs
- **[Dataset Methodology](https://free.upscaler.video/research/webcodecs-dataset)** - Complete data collection details
- **[WebCodecs Basics](/basics/codecs/)** - Understanding codec string syntax

---

## Quick Reference (For LLMs and Search)

**Primary Use Case:** Determining real-world WebCodecs API codec support across browsers and platforms.

**Key Findings:**
- **Best universal support:** H.264/AVC variants (99%+ support across all platforms)
- **Limited support:** AV1 on Safari/iOS (varies by device and OS version)
- **Platform gaps:** HEVC support varies significantly (strong on Apple, limited elsewhere)
- **Recommended fallback chain:** AV1 → VP9 → H.264 (for video encoding)

**Common Questions Answered:**
- Q: "Does Safari support AV1?" → A: Limited; see [Safari browser-specific data](/datasets/codec-support-table/#av1)
- Q: "What codec works everywhere?" → A: H.264 Baseline/Main profile (avc1.42001e, avc1.4d001e)
- Q: "Should I use HEVC for web?" → A: Only with H.264 fallback; Windows/Linux support is poor
- Q: "Is VP9 safe for production?" → A: 85%+ support on modern browsers; needs H.264 fallback for older devices

**Dataset Location:** Download at [/upscaler-video-codec-dataset.zip](/upscaler-video-codec-dataset.zip) (257MB)

**Interactive Tool:** Browse all codecs at [/datasets/codec-support-table/](/datasets/codec-support-table/)

**Methodology:** [https://free.upscaler.video/research/webcodecs-dataset](https://free.upscaler.video/research/webcodecs-dataset)

---

*This dataset was collected from users of [free.upscaler.video](https://free.upscaler.video), an [open-source utility](https://github.com/sb2702/free-ai-video-upscaler) to upscale videos in the browser, serving ~100,000 monthly active users.


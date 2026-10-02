---
title: Codec Support Dataset
description: The world's first empirical registry of WebCodecs hardware support, collected from 7,655,853 real-world user sessions
head:
  - tag: meta
    attrs:
      name: robots
      content: index, follow
  - tag: meta
    attrs:
      name: citation_title
      content: Codec Support Dataset
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
      content: Codec Support Dataset
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
  "name": "The Codec Support Dataset",
  "description": "The first comprehensive, empirical collection of real-world WebCodecs API hardware support data from 7,655,853 unique user sessions spanning diverse hardware, browsers, and operating systems.",
  "url": "https://webcodecsfundamentals.org/datasets/codec-support/",
  "sameAs": "https://free.upscaler.video/research/methodology/",
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
  "dateModified": "2026-10-02",
  "version": "2026-10-01",
  "identifier": "https://doi.org/10.5281/zenodo.23107451",
  "temporalCoverage": "2026-01/2026-10",
  "spatialCoverage": {
    "@type": "Place",
    "name": "Worldwide"
  },
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/vnd.apache.parquet",
      "contentUrl": "https://zenodo.org/records/23107451",
      "name": "Zenodo",
      "description": "Version 2026-10-01: Parquet dataset (2,434,549,264 rows, 3.85 GB, one file per month) hosted on Zenodo"
    },
    {
      "@type": "DataDownload",
      "encodingFormat": "application/vnd.apache.parquet",
      "contentUrl": "https://huggingface.co/datasets/katana-video/webcodecs-codec-support",
      "name": "Hugging Face",
      "description": "Parquet dataset hosted on Hugging Face Datasets"
    }
  ],
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
    "description": "Open-source video upscaling tool serving ~700,000 monthly active users"
  },
  "citation": {
    "@type": "CreativeWork",
    "name": "Dataset Methodology",
    "url": "https://free.upscaler.video/research/methodology/"
  },
  "includedInDataCatalog": {
    "@type": "DataCatalog",
    "name": "WebCodecs Fundamentals"
  }
}
</script>

The **Codec Support Dataset** is the first comprehensive, empirical collection of real-world WebCodecs API support data. Unlike synthetic benchmarks or browser-reported capabilities, this dataset represents actual compatibility testing across 7,655,853 unique user sessions spanning diverse hardware, browsers, and operating systems.

The dataset includes both **encoder support** (using `VideoEncoder.isConfigSupported()`) and **decoder support** (using `VideoDecoder.isConfigSupported()`), with encoder data collected from all sessions and decoder data collected starting January 14th 2026.

## Dataset Overview

- **Measurement Types:**
  - Encoder support (using `VideoEncoder.isConfigSupported()`) - all sessions
  - Decoder support (using `VideoDecoder.isConfigSupported()`) - sessions from January 14th 2026 onwards (98% of sessions)
- **Total Tests:** 2,434,549,264 individual codec compatibility checks
- **Test Sessions:** 7,655,853 unique user sessions
- **Codec Strings:** 1,087 unique codec variations tested
- **Last Updated:** October 2026
- **Collection Period:** January 2026 – October 2026 (ongoing)
- **License:** CC-BY 4.0

## Download

The current version (2026-10-01) is available at:

- **[Zenodo](https://zenodo.org/records/23107451)** — archival DOI [10.5281/zenodo.23107451](https://doi.org/10.5281/zenodo.23107451), suitable for citation
- **[Hugging Face](https://huggingface.co/datasets/katana-video/webcodecs-codec-support)** — works with the `datasets` library and the in-browser dataset viewer

Each release contains:
- `codec-support-YYYY-MM.parquet` - One Parquet file per month (10 files, 3.85 GB total)
- `README.md` - Documentation of the dataset structure, with usage examples
- `SHA256SUMS` - Checksums for the data files

The previous version (2026-03-22, 1,142,586 sessions, CSV) remains available on [Zenodo](https://zenodo.org/records/19187467). The DOI [10.5281/zenodo.19187466](https://doi.org/10.5281/zenodo.19187466) always resolves to the latest version.

### Dataset Format

The dataset contains **2,434,549,264 rows** - one row per individual codec string test. Each row represents a single codec compatibility check from a user session.

| Column | Type | Description |
|--------|------|-------------|
| `session_id` | string | Unique ID of the test session, for grouping a session's rows (new in 2026-10-01; not in the CSV release) |
| `timestamp` | timestamp (UTC) | When the test was performed (e.g., "2026-01-05T00:54:11.570Z") |
| `user_agent` | string | Full browser user agent string |
| `browser` | string | Browser family detected from user agent (Chrome, Safari, Edge, Firefox, Unknown) |
| `platform_raw` | string | Raw platform identifier from `navigator.platform` |
| `platform` | string | Normalized platform (Windows, macOS, iOS, Android, Linux, Other) |
| `codec` | string | WebCodecs codec string tested (e.g., "av01.0.01M.08") |
| `encoder_supported` | boolean | Whether VideoEncoder supports this codec |
| `decoder_supported` | boolean (nullable) | Whether VideoDecoder supports this codec (null if not tested) |

**Note:** `decoder_supported` is null (empty in the CSV release) for sessions collected before January 14th 2026. All rows have `encoder_supported` data.

### Sample Data

| timestamp | browser | platform_raw | platform | codec | encoder_supported | decoder_supported |
|---|---|---|---|---|---|---|
| 2026-01-05T00:54:11.570Z | Edge | Win32 | Windows | av01.0.01M.08 | true | *null* |
| 2026-01-16T23:58:08.560Z | Chrome | Win32 | Windows | avc1.420833 | true | true |
| 2026-01-16T23:58:08.560Z | Chrome | Win32 | Windows | avc1.64040c | false | true |

In the third row, you can see a codec that is **not** supported for encoding but **is** supported for decoding - this asymmetry is why separate measurements are important.

### Dataset Size

- **Rows:** 2,434,549,264 individual codec tests
- **File Size:** ~4 GB (Parquet, zstd-compressed). The equivalent uncompressed CSV would be roughly 450 GB, which is why the format changed from CSV.

## Data Collection Methodology

This dataset was collected in a completely anonymized fashion from real users of [free.upscaler.video](https://free.upscaler.video), an [open-source utility](https://github.com/sb2702/free-ai-video-upscaler) to upscale videos in the browser, serving ~700,000 monthly active users.

> **For complete methodology details**, including sampling strategy, statistical controls, and browser detection logic, see **[Dataset Methodology](https://free.upscaler.video/research/methodology/)** on free.upscaler.video.

### Key Attributes

- **Real Hardware:** Data from actual user devices, not emulators or lab environments
- **Background Testing:** Codec checks run asynchronously without user interaction
- **Privacy-Preserving:** No PII collected; only anonymous browser/platform metadata
- **Randomized Sampling:** Each session tests ~300 random codecs from the 1,087-string pool

### Browser & Platform Distribution

**Browsers Tested:**
- Chrome/Chromium (77% of sessions)
- Safari (12%)
- Edge (7%)
- Firefox (3%)

**Platforms Tested:**
- Windows (50%)
- Android (30%)
- iOS (10%)
- macOS (7%)
- Linux (2%)

**Codec Families:**
- AVC (H.264) - 342 variants
- HEVC (H.265) - 84 variants
- VP9 - 210 variants
- AV1 - 432 variants
- VP8 - 1 variant
- Audio codecs - 18 formats (AAC, Opus, MP3, FLAC, Vorbis, PCM, etc.)

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

At 2.4 billion rows the dataset is too large to load into pandas, so query the Parquet files in place with [DuckDB](https://duckdb.org/) (or Polars / Spark):

```python
import duckdb

# Query the Parquet files in place (2.4B rows; no need to load into memory)
con = duckdb.connect()
con.sql("SET TimeZone = 'UTC'")
con.sql("CREATE VIEW tests AS SELECT * FROM read_parquet('codec-support-dataset/**/*.parquet')")

# Example 1: Encoder and decoder support percentage by codec
support = con.sql("""
    SELECT codec,
           round(100 * avg(encoder_supported::INT), 2) AS encoder_pct,
           round(100 * avg(decoder_supported::INT), 2) AS decoder_pct,  -- NULLs (not tested) are ignored
           count(*) AS tests
    FROM tests
    GROUP BY codec
    ORDER BY encoder_pct DESC
""").df()

# Example 2: Support for one codec by browser and platform
av1_by_combo = con.sql("""
    SELECT browser, platform, round(100 * avg(decoder_supported::INT), 1) AS decoder_pct, count(*) AS n
    FROM tests
    WHERE codec = 'av01.0.16M.08'
    GROUP BY ALL
    ORDER BY n DESC
""").df()

# Example 3: Chrome version from the user agent
by_chrome_version = con.sql("""
    SELECT regexp_extract(user_agent, 'Chrome/(\\d+)', 1) AS chrome_version,
           count(DISTINCT session_id) AS sessions
    FROM tests
    WHERE browser = 'Chrome'
    GROUP BY ALL
    ORDER BY sessions DESC
""").df()

# Example 4: Daily encoder support for a codec
daily = con.sql("""
    SELECT date_trunc('day', timestamp) AS day, round(100 * avg(encoder_supported::INT), 2) AS encoder_pct
    FROM tests
    WHERE codec = 'hvc1.1.6.L120.B0'
    GROUP BY ALL
    ORDER BY day
""").df()

# Example 5: Per-session view - which sessions can decode both AV1 and HEVC?
sessions = con.sql("""
    SELECT session_id,
           bool_or(decoder_supported) FILTER (WHERE codec LIKE 'av01.0.%.08') AS av1,
           bool_or(decoder_supported) FILTER (WHERE codec LIKE 'hvc1.1.%') AS hevc
    FROM tests
    GROUP BY session_id
""").df()
```

**Key Analysis Opportunities:**
- Browser version-specific codec support trends
- Temporal evolution of codec adoption
- Platform-specific hardware decoder availability
- User agent string parsing for detailed device identification

## Data Quality

### Statistical Confidence

- **7,655,853 sessions** provide high confidence for common browser/platform combinations
- **2.4+ billion tests** enable fine-grained analysis of codec variant support
- Sample sizes vary by combination; check the number of tests behind a percentage before relying on it

### Known Limitations

1. **Geographic Bias:** Data collected from free.upscaler.video users (global distribution)
2. **Binary Support:** Tests `isConfigSupported()` only; does not measure actual encode/decode performance or quality
3. **Time Sensitivity:** Browser support evolves; data reflects snapshot from collection period
4. **Rare Combinations:** Some browser/OS pairs (e.g., Safari+Linux) have <50 samples
5. **Decoder Data Coverage:** Decoder support data only available for sessions from January 14th 2026 onwards (98% of sessions)

See the [Dataset Methodology](https://free.upscaler.video/research/methodology/) for detailed analysis of sampling biases and statistical controls.

## Citation

When referencing this dataset in academic work, documentation, or standards proposals:

```bibtex
@dataset{upscaler_codec_dataset_2026,
  title        = {The Codec Support Dataset},
  author       = {Bhattacharyya, Samrat},
  year         = {2026},
  version      = {2026-10-01},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.23107451},
  url          = {https://doi.org/10.5281/zenodo.23107451},
  note         = {2.43B codec tests from 7.66M sessions}
}
```

For informal citations:

> **Data Source:** [The Codec Support Dataset](https://free.upscaler.video/research/methodology/)
> **License:** CC-BY 4.0

## License

**Creative Commons Attribution 4.0 International (CC-BY 4.0)**

You are free to:
- **Share** — copy and redistribute in any format
- **Adapt** — remix, transform, and build upon the data
- **Commercial use** — use for any purpose, including commercially

**Attribution requirement:** Credit "Codec Support Dataset" with a link to this page.

## Updates & Versioning

This dataset is periodically updated as new data is collected from free.upscaler.video users.

- **Current Version:** 2026-10-01 (7,655,853 sessions)
- **Previous Version:** 2026-03-22 (1,142,586 sessions)
- **Update Frequency:** Quarterly
- **Changelog:** [View version history](https://github.com/sb2702/webcodecs-fundamentals/releases)

## Related Resources

- **[Codec Registry](/datasets/codec-support-table/)** - Interactive table of all tested codecs
- **[Dataset Methodology](https://free.upscaler.video/research/methodology/)** - Complete data collection details
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
- Q: "Is VP9 safe for production?" → A: Yes; VP9 Profile 0 has 99.9% encode and decode support, on par with H.264

**Dataset Location:** [Zenodo](https://zenodo.org/records/23107451) and [Hugging Face](https://huggingface.co/datasets/katana-video/webcodecs-codec-support)

**Interactive Tool:** Browse all codecs at [/datasets/codec-support-table/](/datasets/codec-support-table/)

**Methodology:** [https://free.upscaler.video/research/methodology/](https://free.upscaler.video/research/methodology/)

---

*This dataset was collected from users of [free.upscaler.video](https://free.upscaler.video), an [open-source utility](https://github.com/sb2702/free-ai-video-upscaler) to upscale videos in the browser, serving ~700,000 monthly active users.


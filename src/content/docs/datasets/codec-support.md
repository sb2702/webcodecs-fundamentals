---
title: Codec Support Dataset
description: The upscaler.video Codec Support Dataset - real-world WebCodecs compatibility data from 143,181 user sessions
---

# upscaler.video Codec Support Dataset

The **upscaler.video Codec Support Dataset** is a comprehensive collection of real-world codec support data for the WebCodecs API, gathered from actual user sessions across diverse browsers, platforms, and devices.

## Dataset Statistics

- **Total Tests:** 45,519,786 individual codec compatibility tests
- **Test Sessions:** 143,181 unique user sessions
- **Codec Strings Tested:** 1,087 unique codec variations
- **Last Updated:** January 14, 2026
- **Collection Period:** January 2026
- **Data Source:** [free.upscaler.video](https://free.upscaler.video)

## Download

**[Download upscaler.video Codec Support Dataset (ZIP)](/upscaler-video-codec-dataset.zip)**

The dataset is provided as a ZIP file containing a CSV with the following columns:
- `codec` - The codec string (e.g., "av01.0.01M.08", "avc1.42001e")
- `browser` - Browser name (Chrome, Safari, Edge, Firefox, Unknown)
- `platform` - Normalized platform (Windows, macOS, iOS, Android, Linux)
- `supported_count` - Number of sessions where the codec was supported
- `total_count` - Total number of sessions that tested this codec
- `support_percentage` - Percentage of support (0-100)

## Methodology

### Data Collection

The dataset was collected through [free.upscaler.video](https://free.upscaler.video), a video processing web application with approximately 100,000 monthly active users. When users visit the site, a background script randomly tests a subset of 300 codec strings from a pool of ~1,000 variations.

**Testing Method:**
- Each codec is tested using `VideoEncoder.isConfigSupported()` and `VideoDecoder.isConfigSupported()`
- Tests run in the background without impacting user experience
- Results are automatically uploaded and aggregated
- No personal information is collected - only browser/platform metadata

**Platform Detection:**
Raw platform identifiers from `navigator.platform` are normalized:
- `Win32`, `Win64` → `Windows`
- `MacIntel` → `macOS`
- `iPhone`, `iPad` → `iOS`
- `Linux armv81`, `Linux armv8l`, `Linux armv7l` → `Android`
- `Linux x86_64`, `Linux aarch64` → `Linux`

### Coverage

The dataset covers:

**Browsers:**
- Chrome (74% of sessions)
- Safari (13%)
- Edge (8%)
- Firefox (5%)
- Unknown (<1%)

**Platforms:**
- Windows (57%)
- Android (19%)
- macOS (11%)
- iOS (10%)
- Linux (3%)

**Codec Families:**
- AVC (H.264) variants
- HEVC (H.265) variants
- VP8 variants
- VP9 variants
- AV1 variants
- Audio codecs (AAC, Opus, MP3, etc.)

## Using This Dataset

### For Web Developers

Use this data to make informed decisions about codec selection:

1. **Universal compatibility?** Choose codecs with 90%+ support (typically H.264 baseline profiles)
2. **Modern features with fallbacks?** Target 70%+ support codecs (VP9, some AV1 profiles)
3. **Bleeding edge?** Understand which browser/platform combinations support newer codecs

Browse the [Codec Registry](/datasets/codec-strings/) to explore support for specific codec strings.

### For Browser Vendors

This dataset provides real-world usage patterns that can inform:
- Implementation priorities for codec support
- Performance optimization targets
- Compatibility testing coverage

### For Researchers

The CSV format makes it easy to analyze:
- Cross-browser codec support patterns
- Platform-specific compatibility issues
- Adoption trends for newer codecs
- Statistical significance of test results

## Data Quality & Limitations

### Strengths

- **Real-world data:** Tests from actual user devices, not controlled lab environments
- **Large sample size:** 143,181 sessions provide statistical confidence
- **Diverse coverage:** Wide range of browsers, platforms, and devices
- **Continuous updates:** Data collection is ongoing

### Limitations

- **Sampling bias:** Users of free.upscaler.video may not represent all web users
- **Uneven distribution:** Some browser/platform combinations have low sample sizes
- **Time-bound:** Data reflects codec support as of the collection period
- **Binary results:** Tests only "supported" vs "not supported", not performance metrics

**Sample Size Considerations:**
- Combinations with <50 tests should be interpreted with caution
- Some rare combinations (e.g., "Safari+Linux") may have statistical noise
- The [Codec Registry](/datasets/codec-strings/) shows test counts for transparency

## Citation

If you use this dataset in research, documentation, or publications, please cite:

```
upscaler.video Codec Support Dataset (2026-01-14)
45,519,786 codec compatibility tests across 143,181 sessions
Collected from free.upscaler.video users
Available at: https://webcodecsfundamentals.org/datasets/codec-support/
```

## License

This dataset is released under the **MIT License**. You are free to:
- Use the data commercially or non-commercially
- Modify and redistribute the data
- Include it in research or products

Attribution is appreciated but not required.

## Updates

This dataset will be updated periodically as new data is collected. Check the "Last Updated" date above for the current version.

## Related Resources

- [Codec Registry](/datasets/codec-strings/) - Browse all tested codec strings
- [Codec Basics](/basics/codecs/) - Understanding codec strings
- [Pattern Guide](/patterns/use-cases/) - Choosing the right codec for your use case

## Contact

Questions or feedback about this dataset? Open an issue on [GitHub](https://github.com/sb2702/webcodecs-fundamentals/issues).

---

*Dataset collected and maintained by the WebCodecs Fundamentals project*

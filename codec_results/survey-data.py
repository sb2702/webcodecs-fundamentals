#!/usr/bin/env python3
"""
Survey script to analyze codec test results and count unique browsers, platforms, and combos.
"""

import json
import sys
from pathlib import Path
from collections import Counter
from tqdm import tqdm

def normalize_platform(platform):
    """Normalize platform names to human-readable format."""
    platform_map = {
        'Win32': 'Windows',
        'Win64': 'Windows',
        'MacIntel': 'macOS',
        'iPhone': 'iOS',
        'iPad': 'iOS',
        'Linux armv81': 'Android',
        'Linux armv8l': 'Android',
        'Linux armv7l': 'Android',
        'Android': 'Android',
        'Android64': 'Android',
        'Linux x86_64': 'Linux',
        'Linux aarch64': 'Linux',
        'Linux amd64': 'Linux'
    }
    return platform_map.get(platform, platform)

def survey_results(results_dir, max_files=None):
    """Survey the codec results to count browsers, platforms, and combos."""

    # Counters for different dimensions
    browser_counts = Counter()
    platform_counts = Counter()
    platform_counts_raw = Counter()  # Track original platform names too
    combo_counts = Counter()

    # Find all JSON files
    results_path = Path(results_dir)
    json_files = list(results_path.rglob("*.json"))

    if max_files:
        json_files = json_files[:max_files]

    print(f"Surveying {len(json_files)} files...")

    total_tests = 0
    total_codec_strings = set()

    # Process each file with progress bar
    for json_file in tqdm(json_files, desc="Processing files"):
        try:
            with open(json_file, 'r') as f:
                data = json.load(f)

            metadata = data.get('testMetadata', {})
            results = data.get('results', [])

            browser = metadata.get('browser', 'Unknown')
            platform_raw = metadata.get('platform', 'Unknown')
            platform = normalize_platform(platform_raw)
            combo = f"{browser}+{platform}"

            # Count this session
            browser_counts[browser] += 1
            platform_counts[platform] += 1
            platform_counts_raw[platform_raw] += 1
            combo_counts[combo] += 1

            # Count individual codec tests
            total_tests += len(results)

            # Collect unique codec strings
            for result in results:
                total_codec_strings.add(result.get('string'))

        except Exception as e:
            print(f"\nError processing {json_file}: {e}", file=sys.stderr)
            continue

    # Build summary
    summary = {
        "filesProcessed": len(json_files),
        "totalTestSessions": sum(browser_counts.values()),
        "totalIndividualTests": total_tests,
        "uniqueCodecStrings": len(total_codec_strings),
        "browsers": {
            "unique": len(browser_counts),
            "breakdown": dict(browser_counts.most_common())
        },
        "platforms": {
            "unique": len(platform_counts),
            "breakdown": dict(platform_counts.most_common())
        },
        "platformsRaw": {
            "unique": len(platform_counts_raw),
            "breakdown": dict(platform_counts_raw.most_common())
        },
        "combos": {
            "unique": len(combo_counts),
            "breakdown": dict(combo_counts.most_common(50))  # Top 50 combos
        }
    }

    return summary

def main():
    results_dir = "s3-results"

    # Check if user wants to limit files (for testing)
    max_files = None
    if len(sys.argv) > 1:
        max_files = int(sys.argv[1])
        print(f"Limiting to {max_files} files for testing")

    summary = survey_results(results_dir, max_files)

    # Write summary to file
    output_file = "data-survey.json"

    with open(output_file, 'w') as f:
        json.dump(summary, f, indent=2)

    print(f"\n✓ Survey complete! Results written to {output_file}")
    print(f"\nSummary:")
    print(f"  Files processed: {summary['filesProcessed']:,}")
    print(f"  Test sessions: {summary['totalTestSessions']:,}")
    print(f"  Individual tests: {summary['totalIndividualTests']:,}")
    print(f"  Unique codec strings: {summary['uniqueCodecStrings']:,}")
    print(f"  Unique browsers: {summary['browsers']['unique']}")
    print(f"  Unique platforms: {summary['platforms']['unique']}")
    print(f"  Unique combos: {summary['combos']['unique']}")

    print(f"\nTop 5 Browsers:")
    for browser, count in list(summary['browsers']['breakdown'].items())[:5]:
        print(f"  {browser}: {count:,}")

    print(f"\nTop 5 Platforms:")
    for platform, count in list(summary['platforms']['breakdown'].items())[:5]:
        print(f"  {platform}: {count:,}")

if __name__ == "__main__":
    main()

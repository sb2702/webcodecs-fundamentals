#!/usr/bin/env python3
"""
Generate raw CSV dataset from individual test sessions.
Creates one row per codec test (session × codec).
"""

import json
import csv
from pathlib import Path
from tqdm import tqdm


def normalize_platform(platform):
    """Normalize platform names to human-readable format."""
    platform_map = {
        'Win32': 'Windows',
        'Win64': 'Windows',
        'Windows': 'Windows',
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


def generate_raw_csv(results_dir, output_file):
    """Generate raw CSV from individual test sessions."""

    results_path = Path(results_dir)
    json_files = list(results_path.rglob("*.json"))

    print(f"Generating raw CSV from {len(json_files)} session files...")
    print(f"This will create ~45 million rows. This may take several minutes...")

    # Open CSV for writing
    with open(output_file, 'w', newline='') as csvfile:
        fieldnames = [
            'timestamp',
            'user_agent',
            'browser',
            'platform_raw',
            'platform',
            'codec',
            'encoder_supported',
            'decoder_supported'
        ]

        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        rows_written = 0
        sessions_processed = 0

        # Process each session file with progress bar
        with tqdm(total=len(json_files), desc="Processing sessions", unit="file") as pbar:
            for json_file in json_files:
                try:
                    with open(json_file, 'r') as f:
                        data = json.load(f)

                    metadata = data.get('testMetadata', {})
                    results = data.get('results', [])

                    timestamp = metadata.get('timestamp', '')
                    user_agent = metadata.get('userAgent', '')
                    browser = metadata.get('browser', 'Unknown')
                    platform_raw = metadata.get('platform', 'Unknown')
                    platform = normalize_platform(platform_raw)

                    # Write one row per codec test in this session
                    for result in results:
                        codec = result.get('string', '')

                        # Check if this file has encoder/decoder split or old format
                        has_encode_field = 'encode' in result
                        has_decode_field = 'decode' in result

                        # Handle encoder support
                        if has_encode_field:
                            encoder_supported = result.get('encode', False)
                        else:
                            # Old format - treat 'supported' as encoder support
                            encoder_supported = result.get('supported', False)

                        # Handle decoder support (only if field exists)
                        if has_decode_field:
                            decoder_supported = result.get('decode', False)
                        else:
                            decoder_supported = None  # Not tested

                        writer.writerow({
                            'timestamp': timestamp,
                            'user_agent': user_agent,
                            'browser': browser,
                            'platform_raw': platform_raw,
                            'platform': platform,
                            'codec': codec,
                            'encoder_supported': 'true' if encoder_supported else 'false',
                            'decoder_supported': 'true' if decoder_supported else ('false' if decoder_supported is False else '')
                        })

                        rows_written += 1

                    sessions_processed += 1

                    # Update progress bar with row count
                    pbar.set_postfix({'rows': f'{rows_written:,}'})
                    pbar.update(1)

                    # Flush to disk every 10k sessions
                    if sessions_processed % 10000 == 0:
                        csvfile.flush()

                except Exception as e:
                    print(f"\nError processing {json_file}: {e}")
                    pbar.update(1)
                    continue

    print(f"\n✓ Raw CSV generation complete!")
    print(f"  Sessions processed: {len(json_files):,}")
    print(f"  Rows written: {rows_written:,}")
    print(f"  Output file: {output_file}")

    # Calculate file size
    file_size = Path(output_file).stat().st_size
    if file_size > 1024 * 1024 * 1024:
        print(f"  File size: {file_size / (1024 * 1024 * 1024):.2f} GB")
    elif file_size > 1024 * 1024:
        print(f"  File size: {file_size / (1024 * 1024):.2f} MB")
    else:
        print(f"  File size: {file_size / 1024:.2f} KB")


def main():
    results_dir = "s3-results"
    output_file = "upscaler-video-codec-dataset-raw.csv"

    generate_raw_csv(results_dir, output_file)

    print(f"\n📊 The raw 'upscaler.video Codec Support Dataset' is ready!")
    print(f"   This dataset contains individual test results with full user agent strings.")
    print(f"   Each row represents one codec test from one user session.")


if __name__ == "__main__":
    main()

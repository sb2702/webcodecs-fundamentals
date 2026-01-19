#!/usr/bin/env python3
"""
Aggregate codec test results into per-codec JSON files and master index.
"""

import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime
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


def categorize_codec(codec_string):
    """Categorize codec by family."""
    codec_lower = codec_string.lower()

    if codec_lower.startswith('vp8'):
        return 'vp8'
    elif codec_lower.startswith('vp09') or codec_lower.startswith('vp9'):
        return 'vp9'
    elif codec_lower.startswith('av01'):
        return 'av1'
    elif codec_lower.startswith('avc1') or codec_lower.startswith('avc3'):
        return 'avc'
    elif codec_lower.startswith('hev1') or codec_lower.startswith('hvc1'):
        return 'hevc'
    else:
        # Audio codecs and others
        return 'audio'


FAMILY_DISPLAY_NAMES = {
    'vp8': 'VP8',
    'vp9': 'VP9',
    'av1': 'AV1',
    'avc': 'AVC (H.264)',
    'hevc': 'HEVC (H.265)',
    'audio': 'Audio'
}


def aggregate_codecs(results_dir, output_dir, max_files=None):
    """Aggregate codec results into per-codec stats."""

    # Data structure: codec -> encoder/decoder -> dimension -> key -> {supported, total}
    codec_stats = defaultdict(lambda: {
        'encoder': {
            'global': {'supported': 0, 'total': 0},
            'byBrowser': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byPlatform': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byCombo': defaultdict(lambda: {'supported': 0, 'total': 0})
        },
        'decoder': {
            'global': {'supported': 0, 'total': 0},
            'byBrowser': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byPlatform': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byCombo': defaultdict(lambda: {'supported': 0, 'total': 0})
        }
    })

    # Family stats: family -> encoder/decoder -> dimension -> key -> {supported, total}
    family_stats = defaultdict(lambda: {
        'codecs': set(),  # Track which codecs belong to this family
        'encoder': {
            'global': {'supported': 0, 'total': 0},
            'byBrowser': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byPlatform': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byCombo': defaultdict(lambda: {'supported': 0, 'total': 0})
        },
        'decoder': {
            'global': {'supported': 0, 'total': 0},
            'byBrowser': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byPlatform': defaultdict(lambda: {'supported': 0, 'total': 0}),
            'byCombo': defaultdict(lambda: {'supported': 0, 'total': 0})
        }
    })

    # Find all JSON files
    results_path = Path(results_dir)
    json_files = list(results_path.rglob("*.json"))

    if max_files:
        json_files = json_files[:max_files]

    print(f"Aggregating {len(json_files)} files...")

    total_sessions = 0
    total_tests = 0

    # Process each file
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

            total_sessions += 1

            # Process each codec test result
            for result in results:
                codec = result.get('string')

                if not codec:
                    continue

                total_tests += 1

                # Categorize codec into family
                family = categorize_codec(codec)
                family_stats[family]['codecs'].add(codec)

                # Check if this file has encoder/decoder split or old format
                has_encode_field = 'encode' in result
                has_decode_field = 'decode' in result

                # Handle encoder support
                if has_encode_field:
                    encode_supported = result.get('encode', False)
                else:
                    # Old format - treat 'supported' as encoder support
                    encode_supported = result.get('supported', False)

                # Update encoder stats (all files contribute)
                codec_stats[codec]['encoder']['global']['total'] += 1
                if encode_supported:
                    codec_stats[codec]['encoder']['global']['supported'] += 1

                codec_stats[codec]['encoder']['byBrowser'][browser]['total'] += 1
                if encode_supported:
                    codec_stats[codec]['encoder']['byBrowser'][browser]['supported'] += 1

                codec_stats[codec]['encoder']['byPlatform'][platform]['total'] += 1
                if encode_supported:
                    codec_stats[codec]['encoder']['byPlatform'][platform]['supported'] += 1

                codec_stats[codec]['encoder']['byCombo'][combo]['total'] += 1
                if encode_supported:
                    codec_stats[codec]['encoder']['byCombo'][combo]['supported'] += 1

                # Update family encoder stats
                family_stats[family]['encoder']['global']['total'] += 1
                if encode_supported:
                    family_stats[family]['encoder']['global']['supported'] += 1

                family_stats[family]['encoder']['byBrowser'][browser]['total'] += 1
                if encode_supported:
                    family_stats[family]['encoder']['byBrowser'][browser]['supported'] += 1

                family_stats[family]['encoder']['byPlatform'][platform]['total'] += 1
                if encode_supported:
                    family_stats[family]['encoder']['byPlatform'][platform]['supported'] += 1

                family_stats[family]['encoder']['byCombo'][combo]['total'] += 1
                if encode_supported:
                    family_stats[family]['encoder']['byCombo'][combo]['supported'] += 1

                # Handle decoder support (only if decode field exists)
                if has_decode_field:
                    decode_supported = result.get('decode', False)

                    codec_stats[codec]['decoder']['global']['total'] += 1
                    if decode_supported:
                        codec_stats[codec]['decoder']['global']['supported'] += 1

                    codec_stats[codec]['decoder']['byBrowser'][browser]['total'] += 1
                    if decode_supported:
                        codec_stats[codec]['decoder']['byBrowser'][browser]['supported'] += 1

                    codec_stats[codec]['decoder']['byPlatform'][platform]['total'] += 1
                    if decode_supported:
                        codec_stats[codec]['decoder']['byPlatform'][platform]['supported'] += 1

                    codec_stats[codec]['decoder']['byCombo'][combo]['total'] += 1
                    if decode_supported:
                        codec_stats[codec]['decoder']['byCombo'][combo]['supported'] += 1

                    # Update family decoder stats
                    family_stats[family]['decoder']['global']['total'] += 1
                    if decode_supported:
                        family_stats[family]['decoder']['global']['supported'] += 1

                    family_stats[family]['decoder']['byBrowser'][browser]['total'] += 1
                    if decode_supported:
                        family_stats[family]['decoder']['byBrowser'][browser]['supported'] += 1

                    family_stats[family]['decoder']['byPlatform'][platform]['total'] += 1
                    if decode_supported:
                        family_stats[family]['decoder']['byPlatform'][platform]['supported'] += 1

                    family_stats[family]['decoder']['byCombo'][combo]['total'] += 1
                    if decode_supported:
                        family_stats[family]['decoder']['byCombo'][combo]['supported'] += 1

        except Exception as e:
            print(f"\nError processing {json_file}: {e}", file=sys.stderr)
            continue

    # Calculate percentages and format output
    print("\nFormatting results...")

    # Create output directory structure
    output_path = Path(output_dir)
    codecs_path = output_path / "codecs"
    codecs_path.mkdir(parents=True, exist_ok=True)

    # Build master index
    master_index = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "totalTests": total_tests,
        "totalSessions": total_sessions,
        "codecCount": len(codec_stats),
        "codecs": []
    }

    # Write per-codec files
    for codec, stats in tqdm(codec_stats.items(), desc="Writing codec files"):
        # Calculate percentages for all dimensions
        def calc_percentage(supported, total):
            return round(supported / total * 100, 2) if total > 0 else 0.0

        # Helper function to format stats for encoder or decoder
        def format_support_stats(support_data):
            global_stats = {
                "supportedCount": support_data['global']['supported'],
                "totalCount": support_data['global']['total'],
                "supportPercentage": calc_percentage(
                    support_data['global']['supported'],
                    support_data['global']['total']
                )
            }

            browser_stats = {}
            for browser, counts in support_data['byBrowser'].items():
                browser_stats[browser] = {
                    "supportedCount": counts['supported'],
                    "totalCount": counts['total'],
                    "supportPercentage": calc_percentage(counts['supported'], counts['total'])
                }

            platform_stats = {}
            for platform, counts in support_data['byPlatform'].items():
                platform_stats[platform] = {
                    "supportedCount": counts['supported'],
                    "totalCount": counts['total'],
                    "supportPercentage": calc_percentage(counts['supported'], counts['total'])
                }

            combo_stats = {}
            for combo, counts in support_data['byCombo'].items():
                combo_stats[combo] = {
                    "supportedCount": counts['supported'],
                    "totalCount": counts['total'],
                    "supportPercentage": calc_percentage(counts['supported'], counts['total'])
                }

            return {
                "global": global_stats,
                "byBrowser": browser_stats,
                "byPlatform": platform_stats,
                "byCombo": combo_stats
            }

        # Build per-codec output with both encoder and decoder
        codec_output = {
            "codec": codec,
            "encoder": format_support_stats(stats['encoder']),
            "decoder": format_support_stats(stats['decoder'])
        }

        # Write codec file (sanitize filename)
        codec_filename = codec.replace('/', '_') + ".json"
        codec_file_path = codecs_path / codec_filename

        with open(codec_file_path, 'w') as f:
            json.dump(codec_output, f, indent=2)

        # Add to master index (with both encoder and decoder stats)
        master_index["codecs"].append({
            "string": codec,
            "encoder": {
                "supportedCount": codec_output["encoder"]["global"]["supportedCount"],
                "totalCount": codec_output["encoder"]["global"]["totalCount"],
                "supportPercentage": codec_output["encoder"]["global"]["supportPercentage"]
            },
            "decoder": {
                "supportedCount": codec_output["decoder"]["global"]["supportedCount"],
                "totalCount": codec_output["decoder"]["global"]["totalCount"],
                "supportPercentage": codec_output["decoder"]["global"]["supportPercentage"]
            },
            "file": f"codecs/{codec_filename}"
        })

    # Sort master index by codec string
    master_index["codecs"].sort(key=lambda x: x["string"])

    # Write family files
    print("\nWriting family files...")
    families_path = output_path / "families"
    families_path.mkdir(parents=True, exist_ok=True)

    master_index["families"] = []

    def calc_percentage(supported, total):
        return round(supported / total * 100, 2) if total > 0 else 0.0

    for family_name, stats in family_stats.items():
        # Helper function to format family support stats (encoder or decoder)
        def format_family_support(support_data):
            family_global = {
                "supportedCount": support_data['global']['supported'],
                "totalCount": support_data['global']['total'],
                "supportPercentage": calc_percentage(support_data['global']['supported'], support_data['global']['total'])
            }

            family_browser_stats = {}
            for browser, counts in support_data['byBrowser'].items():
                family_browser_stats[browser] = {
                    "supportedCount": counts['supported'],
                    "totalCount": counts['total'],
                    "supportPercentage": calc_percentage(counts['supported'], counts['total'])
                }

            family_platform_stats = {}
            for platform, counts in support_data['byPlatform'].items():
                family_platform_stats[platform] = {
                    "supportedCount": counts['supported'],
                    "totalCount": counts['total'],
                    "supportPercentage": calc_percentage(counts['supported'], counts['total'])
                }

            family_combo_stats = {}
            for combo, counts in support_data['byCombo'].items():
                family_combo_stats[combo] = {
                    "supportedCount": counts['supported'],
                    "totalCount": counts['total'],
                    "supportPercentage": calc_percentage(counts['supported'], counts['total'])
                }

            return {
                "global": family_global,
                "byBrowser": family_browser_stats,
                "byPlatform": family_platform_stats,
                "byCombo": family_combo_stats
            }

        # Build family output with both encoder and decoder
        family_output = {
            "family": family_name,
            "displayName": FAMILY_DISPLAY_NAMES[family_name],
            "codecCount": len(stats['codecs']),
            "codecs": sorted(list(stats['codecs'])),
            "encoder": format_family_support(stats['encoder']),
            "decoder": format_family_support(stats['decoder'])
        }

        # Write family file
        family_filename = f"{family_name}.json"
        family_file_path = families_path / family_filename

        with open(family_file_path, 'w') as f:
            json.dump(family_output, f, indent=2)

        # Add to master index
        master_index["families"].append({
            "name": family_name,
            "displayName": FAMILY_DISPLAY_NAMES[family_name],
            "codecCount": len(stats['codecs']),
            "encoder": {
                "supportPercentage": family_output["encoder"]["global"]["supportPercentage"],
                "totalCount": family_output["encoder"]["global"]["totalCount"]
            },
            "decoder": {
                "supportPercentage": family_output["decoder"]["global"]["supportPercentage"],
                "totalCount": family_output["decoder"]["global"]["totalCount"]
            },
            "file": f"families/{family_filename}"
        })

    # Sort families by name
    master_index["families"].sort(key=lambda x: x["name"])

    # Write master index
    index_path = output_path / "index.json"
    with open(index_path, 'w') as f:
        json.dump(master_index, f, indent=2)

    print(f"\n✓ Aggregation complete!")
    print(f"  Total sessions: {total_sessions:,}")
    print(f"  Total tests: {total_tests:,}")
    print(f"  Unique codecs: {len(codec_stats):,}")
    print(f"  Codec families: {len(family_stats):,}")
    print(f"  Output directory: {output_dir}")
    print(f"  Master index: {index_path}")
    print(f"  Codec files: {codecs_path}/ ({len(codec_stats)} files)")
    print(f"  Family files: {families_path}/ ({len(family_stats)} files)")


def main():
    results_dir = "s3-results"
    output_dir = "aggregated"

    # Check if user wants to limit files (for testing)
    max_files = None
    if len(sys.argv) > 1:
        max_files = int(sys.argv[1])
        print(f"Limiting to {max_files} files for testing")

    aggregate_codecs(results_dir, output_dir, max_files)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Generate static Markdown page with codec registry table.
"""

import json
from pathlib import Path
from datetime import datetime


def categorize_codec(codec_string):
    """Categorize codec by family."""
    codec_lower = codec_string.lower()

    if codec_lower.startswith('vp8'):
        return 'VP8'
    elif codec_lower.startswith('vp09') or codec_lower.startswith('vp9'):
        return 'VP9'
    elif codec_lower.startswith('av01'):
        return 'AV1'
    elif codec_lower.startswith('avc1') or codec_lower.startswith('avc3'):
        return 'AVC (H.264)'
    elif codec_lower.startswith('hev1') or codec_lower.startswith('hvc1'):
        return 'HEVC (H.265)'
    else:
        # Audio codecs and others
        return 'Audio'


def get_cell_color(percentage):
    """Get background color based on support percentage."""
    if percentage >= 90:
        return "#d4edda"  # light green
    elif percentage >= 60:
        return "#fff3cd"  # light yellow
    else:
        return "#f8d7da"  # light red


def generate_codec_table(codecs, title, family_data=None):
    """Generate a Markdown table for a specific codec family."""
    if not codecs:
        return ""

    table = f"""
## {title}

<div class="codec-registry-table">
<table>
<thead>
<tr>
<th>Codec String</th>
<th style="text-align: right;">Global Encode Support</th>
<th style="text-align: right;">Tests</th>
<th>Details</th>
</tr>
</thead>
<tbody>
"""

    # Add family aggregate row if available
    if family_data:
        family_name = family_data['name']
        support_pct = family_data['supportPercentage']
        codec_count = family_data['codecCount']

        bg_color = get_cell_color(support_pct)
        table += f'<tr style="background-color: #f0f0f0; font-weight: bold;">'
        table += f'<td>All variants</td>'
        table += f'<td style="text-align: right; background-color: {bg_color};">{support_pct}%</td>'
        table += f'<td style="text-align: right;">{codec_count} variants</td>'
        table += f'<td><a href="/codecs/{family_name}.html">View Family Support</a></td>'
        table += '</tr>\n'

    # Sort codecs by support percentage (descending), then by name
    sorted_codecs = sorted(codecs, key=lambda x: (-x['supportPercentage'], x['string']))

    for codec in sorted_codecs:
        codec_string = codec['string']
        support_pct = codec['supportPercentage']
        total_tests = codec['totalCount']

        # Create filename for detail page
        detail_filename = codec_string.replace('/', '_') + '.html'
        detail_link = f"/codecs/{detail_filename}"

        # Format support percentage with color indication
        bg_color = get_cell_color(support_pct)

        table += f'<tr><td><code>{codec_string}</code></td><td style="text-align: right; background-color: {bg_color};">{support_pct}%</td><td style="text-align: right;">{total_tests:,}</td><td><a href="{detail_link}">View Details</a></td></tr>\n'

    table += "</tbody>\n</table>\n</div>\n"
    return table


def generate_registry_page(aggregated_dir, output_file):
    """Generate static Markdown page with full codec registry table."""

    aggregated_path = Path(aggregated_dir)
    index_file = aggregated_path / "index.json"

    # Read master index
    with open(index_file, 'r') as f:
        index = json.load(f)

    print(f"Generating codec registry page with {index['codecCount']} codecs...")

    # Build family lookup
    family_lookup = {}
    if 'families' in index:
        for family in index['families']:
            family_lookup[family['displayName']] = family

    # Categorize all codecs
    codec_families = {
        'VP8': [],
        'VP9': [],
        'AV1': [],
        'AVC (H.264)': [],
        'HEVC (H.265)': [],
        'Audio': []
    }

    for codec in index['codecs']:
        family = categorize_codec(codec['string'])
        codec_families[family].append(codec)

    # Start building Markdown content
    md_content = f"""---
title: Codec Support Table
description: Complete table of {index['codecCount']:,} codec strings tested across real-world browsers and platforms
---

This page contains a comprehensive table of **{index['codecCount']:,} codec strings** tested with the WebCodecs API across real-world browsers and platforms.

> **About this dataset:** This data comes from {index['totalSessions']:,} real user sessions testing {index['totalTests']:,} codecs. See the [Codec Support Dataset](/datasets/codec-support/) page for methodology, download links, and usage information. 
## Codec Families

**Video Codecs:**
- [AVC (H.264)](#avc-h264) - {len(codec_families['AVC (H.264)'])} variants
- [HEVC (H.265)](#hevc-h265) - {len(codec_families['HEVC (H.265)'])} variants
- [VP8](#vp8) - {len(codec_families['VP8'])} variants
- [VP9](#vp9) - {len(codec_families['VP9'])} variants
- [AV1](#av1) - {len(codec_families['AV1'])} variants

**Audio Codecs:**
- [Audio Codecs](#audio) - {len(codec_families['Audio'])} formats

---
"""

    # Generate tables for each family in desired order
    family_order = ['AVC (H.264)', 'HEVC (H.265)', 'VP8', 'VP9', 'AV1', 'Audio']

    for family in family_order:
        family_data = family_lookup.get(family, None)
        md_content += generate_codec_table(codec_families[family], family, family_data)

    # Write to file
    with open(output_file, 'w') as f:
        f.write(md_content)

    print(f"\n✓ Codec registry page generated!")
    print(f"  Codecs: {index['codecCount']:,}")
    print(f"  Output: {output_file}")


def main():
    aggregated_dir = "aggregated"
    output_file = "../src/content/docs/datasets/codec-support-table.md"

    # Check if aggregated data exists
    if not Path(aggregated_dir).exists():
        print(f"Error: {aggregated_dir}/ directory not found!")
        print("Please run aggregate-codecs.py first.")
        return

    generate_registry_page(aggregated_dir, output_file)


if __name__ == "__main__":
    main()

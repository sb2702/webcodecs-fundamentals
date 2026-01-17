#!/usr/bin/env python3
"""
Generate individual HTML pages for each codec with browser/platform support matrix.
"""

import json
from pathlib import Path
from codec_parser import parse_codec_string


def get_cell_color(percentage):
    """Get background color based on support percentage."""
    if percentage >= 90:
        return "#d4edda"  # light green
    elif percentage >= 60:
        return "#fff3cd"  # light yellow
    else:
        return "#f8d7da"  # light red


def generate_codec_page(codec_data, output_file):
    """Generate HTML page for a single codec."""

    codec_string = codec_data['codec']
    global_stats = codec_data['global']

    # Parse codec string for specs
    codec_specs = parse_codec_string(codec_string)

    # Define platform and browser order
    platforms = ['Windows', 'macOS', 'iOS', 'Android', 'Linux']
    browsers = ['Chrome', 'Safari', 'Edge', 'Firefox']
    browser_labels = {
        'Chrome': 'Chrome/Chromium',
        'Safari': 'Safari',
        'Edge': 'Edge',
        'Firefox': 'Firefox'
    }
    browser_icons = {
        'Chrome': '/assets/icons/chromium.svg',
        'Safari': '/assets/icons/safari.svg',
        'Edge': '/assets/icons/edge.svg',  # Edge is Chromium-based
        'Firefox': '/assets/icons/firefox.svg'
    }
    platform_icons = {
        'Windows': '/assets/icons/windows.svg',
        'macOS': '/assets/icons/osx.svg',
        'iOS': '/assets/icons/ios.svg',
        'Android': '/assets/icons/android.svg',
        'Linux': '/assets/icons/linux.svg'
    }

    # Build support matrix
    matrix = {}
    for browser in browsers:
        matrix[browser] = {}
        for platform in platforms:
            combo_key = f"{browser}+{platform}"
            if combo_key in codec_data['byCombo']:
                stats = codec_data['byCombo'][combo_key]
                matrix[browser][platform] = {
                    'percentage': stats['supportPercentage'],
                    'count': stats['supportedCount'],
                    'total': stats['totalCount']
                }
            else:
                matrix[browser][platform] = None

    # Generate HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{codec_string} - Codec Support | WebCodecs Fundamentals</title>
    <meta name="description" content="Browser and platform support data for {codec_string} codec. Real-world compatibility testing from {global_stats['totalCount']:,} sessions.">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background: #f9f9f9;
        }}

        header {{
            background: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}

        h1 {{
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
        }}

        .codec-string {{
            font-family: 'Monaco', 'Courier New', monospace;
            background: #f0f0f0;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 1.1rem;
        }}

        .global-support {{
            font-size: 1.5rem;
            font-weight: bold;
            margin: 1rem 0;
        }}

        .stats {{
            color: #666;
            font-size: 0.9rem;
        }}

        .support-matrix {{
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            overflow-x: auto;
        }}

        h2 {{
            margin-bottom: 1.5rem;
            color: #1a1a1a;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
        }}

        th {{
            background: #f5f5f5;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
        }}

        td {{
            padding: 1rem;
            border-bottom: 1px solid #eee;
        }}

        td:first-child {{
            font-weight: 600;
        }}

        .browser-cell {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}

        .browser-icon {{
            width: 24px;
            height: 24px;
        }}

        .platform-icon {{
            width: 20px;
            height: 20px;
            margin-bottom: -3px;
        }}

        .support-cell {{
            text-align: center;
            font-weight: 600;
        }}

        .no-data {{
            color: #999;
            font-style: italic;
            font-weight: normal;
        }}

        .count {{
            display: block;
            font-size: 0.8rem;
            font-weight: normal;
            color: #666;
            margin-top: 0.25rem;
        }}

        .back-link {{
            display: inline-block;
            margin-bottom: 1rem;
            color: #0066cc;
            text-decoration: none;
        }}

        .back-link:hover {{
            text-decoration: underline;
        }}

        footer {{
            text-align: center;
            color: #666;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #ddd;
        }}

        footer a {{
            color: #0066cc;
            text-decoration: none;
        }}

        footer a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <a href="/datasets/codec-support-table/" class="back-link">← Back to Codec Support Table</a>

    <header>
        <h1>Codec: <span class="codec-string">{codec_string}</span></h1>
        <div class="global-support" style="color: {'#28a745' if global_stats['supportPercentage'] >= 90 else '#ffc107' if global_stats['supportPercentage'] >= 70 else '#dc3545'}">
            {global_stats['supportPercentage']}% Global Encoder Support
        </div>
        <div class="stats">
            {global_stats['supportedCount']:,} of {global_stats['totalCount']:,} sessions supported this codec
        </div>
    </header>
"""

    # Add codec specifications section if available
    if codec_specs:
        html += f"""
    <div class="support-matrix" style="margin-bottom: 2rem;">
        <h2>Codec Specifications</h2>
        <table style="width: auto;">
            <tbody>
                <tr>
                    <td style="font-weight: 600; width: 200px;">Codec Family</td>
                    <td>{codec_specs['family']}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Profile</td>
                    <td>{codec_specs['profile']}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Level</td>
                    <td>{codec_specs['level']}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Maximum Resolution</td>
                    <td>{codec_specs['maxResolution']}</td>
                </tr>
                <tr>
                    <td style="font-weight: 600;">Maximum Bitrate</td>
                    <td>{codec_specs['maxBitrate']}</td>
                </tr>
            </tbody>
        </table>
    </div>
"""

    html += """
    <div class="support-matrix">
        <h2>Browser × Platform Support Matrix</h2>
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
            Browser detection based on user agent strings. See the <a href="/datasets/codec-support/">dataset page</a> for details.
        </p>
        <table>
            <thead>
                <tr>
                    <th>Browser</th>
"""

    # Add platform headers with icons
    for platform in platforms:
        icon_path = platform_icons[platform]
        html += f'                    <th style="text-align: center;"><img src="{icon_path}" alt="{platform}" class="platform-icon"> {platform}</th>\n'

    html += """                </tr>
            </thead>
            <tbody>
"""

    # Add rows for each browser
    for browser in browsers:
        icon_path = browser_icons[browser]
        html += f'''                <tr>
                    <td><div class="browser-cell"><img src="{icon_path}" alt="{browser}" class="browser-icon">{browser_labels[browser]}</div></td>
'''

        for platform in platforms:
            data = matrix[browser][platform]

            if data is None or data['total'] < 10:
                # No data or insufficient sample size (< 10 tests)
                html += '                    <td class="support-cell no-data">—</td>\n'
            else:
                bg_color = get_cell_color(data['percentage'])
                html += f'''                    <td class="support-cell" style="background-color: {bg_color};">
                        {data['percentage']}%
                        <span class="count">{data['count']:,} / {data['total']:,}</span>
                    </td>
'''

        html += "                </tr>\n"

    html += """            </tbody>
        </table>
    </div>

    <footer>
        <p>Data from the <a href="/datasets/codec-support/">upscaler.video Codec Support Dataset</a></p>
        <p><a href="/">WebCodecs Fundamentals</a> | <a href="/datasets/codec-support-table/">Codec Support Table</a></p>
    </footer>
</body>
</html>
"""

    # Write HTML file
    with open(output_file, 'w') as f:
        f.write(html)


def generate_all_codec_pages(aggregated_dir, output_dir):
    """Generate HTML pages for all codecs."""

    aggregated_path = Path(aggregated_dir)
    codecs_path = aggregated_path / "codecs"
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Read master index
    index_file = aggregated_path / "index.json"
    with open(index_file, 'r') as f:
        index = json.load(f)

    print(f"Generating {index['codecCount']} codec pages...")

    count = 0
    for codec_entry in index['codecs']:
        codec_file = aggregated_path / codec_entry['file']

        # Read codec data
        with open(codec_file, 'r') as f:
            codec_data = json.load(f)

        # Generate output filename
        codec_filename = codec_entry['string'].replace('/', '_') + '.html'
        output_file = output_path / codec_filename

        # Generate page
        generate_codec_page(codec_data, output_file)
        count += 1

        if count % 100 == 0:
            print(f"  Generated {count}/{index['codecCount']} pages...")

    print(f"\n✓ Generated {count} codec pages!")
    print(f"  Output directory: {output_dir}")


def generate_family_page(family_data, output_file):
    """Generate HTML page for a codec family."""

    family_name = family_data['family']
    display_name = family_data['displayName']
    global_stats = family_data['global']
    codecs = family_data['codecs']

    # Define platform and browser order
    platforms = ['Windows', 'macOS', 'iOS', 'Android', 'Linux']
    browsers = ['Chrome', 'Safari', 'Edge', 'Firefox']
    browser_labels = {
        'Chrome': 'Chrome/Chromium',
        'Safari': 'Safari',
        'Edge': 'Edge',
        'Firefox': 'Firefox'
    }
    browser_icons = {
        'Chrome': '/assets/icons/chromium.svg',
        'Safari': '/assets/icons/safari.svg',
        'Edge': '/assets/icons/edge.svg',
        'Firefox': '/assets/icons/firefox.svg'
    }
    platform_icons = {
        'Windows': '/assets/icons/windows.svg',
        'macOS': '/assets/icons/osx.svg',
        'iOS': '/assets/icons/ios.svg',
        'Android': '/assets/icons/android.svg',
        'Linux': '/assets/icons/linux.svg'
    }

    # Build support matrix
    matrix = {}
    for browser in browsers:
        matrix[browser] = {}
        for platform in platforms:
            combo_key = f"{browser}+{platform}"
            if combo_key in family_data['byCombo']:
                stats = family_data['byCombo'][combo_key]
                matrix[browser][platform] = {
                    'percentage': stats['supportPercentage'],
                    'count': stats['supportedCount'],
                    'total': stats['totalCount']
                }
            else:
                matrix[browser][platform] = None

    # Generate HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{display_name} Family - Codec Support | WebCodecs Fundamentals</title>
    <meta name="description" content="Browser and platform support data for {display_name} codec family. Real-world compatibility testing from {global_stats['totalCount']:,} sessions across {len(codecs)} codec variants.">
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background: #f9f9f9;
        }}

        header {{
            background: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}

        h1 {{
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #1a1a1a;
        }}

        .global-support {{
            font-size: 1.5rem;
            font-weight: bold;
            margin: 1rem 0;
        }}

        .stats {{
            color: #666;
            font-size: 0.9rem;
        }}

        .support-matrix {{
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
            overflow-x: auto;
        }}

        h2 {{
            margin-bottom: 1.5rem;
            color: #1a1a1a;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            background: white;
        }}

        th {{
            background: #f5f5f5;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
        }}

        td {{
            padding: 1rem;
            border-bottom: 1px solid #eee;
        }}

        .browser-cell {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}

        .browser-icon {{
            width: 24px;
            height: 24px;
        }}

        .platform-icon {{
            width: 20px;
            height: 20px;
            margin-bottom: -3px;
        }}

        .support-cell {{
            text-align: center;
            font-weight: 600;
        }}

        .no-data {{
            color: #999;
            font-style: italic;
            font-weight: normal;
        }}

        .count {{
            display: block;
            font-size: 0.8rem;
            font-weight: normal;
            color: #666;
            margin-top: 0.25rem;
        }}

        .back-link {{
            display: inline-block;
            margin-bottom: 1rem;
            color: #0066cc;
            text-decoration: none;
        }}

        .back-link:hover {{
            text-decoration: underline;
        }}

        footer {{
            text-align: center;
            color: #666;
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #ddd;
        }}

        footer a {{
            color: #0066cc;
            text-decoration: none;
        }}

        footer a:hover {{
            text-decoration: underline;
        }}

        .codec-list {{
            columns: 3;
            column-gap: 2rem;
        }}

        .codec-list li {{
            margin-bottom: 0.5rem;
            break-inside: avoid;
        }}

        .codec-list a {{
            color: #0066cc;
            text-decoration: none;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.9rem;
        }}

        .codec-list a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <a href="/datasets/codec-support-table/" class="back-link">← Back to Codec Support Table</a>

    <header>
        <h1>{display_name} Codec Family</h1>
        <div class="global-support" style="color: {'#28a745' if global_stats['supportPercentage'] >= 90 else '#ffc107' if global_stats['supportPercentage'] >= 70 else '#dc3545'}">
            {global_stats['supportPercentage']}% Global Encoder Support
        </div>
        <div class="stats">
            {global_stats['supportedCount']:,} of {global_stats['totalCount']:,} tests supported {display_name} across {len(codecs)} codec variants
        </div>
    </header>

    <div class="support-matrix">
        <h2>Browser × Platform Support Matrix</h2>
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
            Aggregate support across all {display_name} variants. Browser detection based on user agent strings.
        </p>
        <table>
            <thead>
                <tr>
                    <th>Browser</th>
"""

    # Add platform headers with icons
    for platform in platforms:
        icon_path = platform_icons[platform]
        html += f'                    <th style="text-align: center;"><img src="{icon_path}" alt="{platform}" class="platform-icon"> {platform}</th>\n'

    html += """                </tr>
            </thead>
            <tbody>
"""

    # Add rows for each browser
    for browser in browsers:
        icon_path = browser_icons[browser]
        html += f'''                <tr>
                    <td><div class="browser-cell"><img src="{icon_path}" alt="{browser}" class="browser-icon">{browser_labels[browser]}</div></td>
'''

        for platform in platforms:
            data = matrix[browser][platform]

            if data is None or data['total'] < 10:
                html += '                    <td class="support-cell no-data">—</td>\n'
            else:
                bg_color = get_cell_color(data['percentage'])
                html += f'''                    <td class="support-cell" style="background-color: {bg_color};">
                        {data['percentage']}%
                        <span class="count">{data['count']:,} / {data['total']:,}</span>
                    </td>
'''

        html += "                </tr>\n"

    html += """            </tbody>
        </table>
    </div>

    <div class="support-matrix">
"""
    html += f'        <h2>Codec Variants ({len(codecs)})</h2>\n'
    html += """        <ul class="codec-list">
"""

    for codec in codecs:
        codec_filename = codec.replace('/', '_') + '.html'
        html += f'            <li><a href="/codecs/{codec_filename}">{codec}</a></li>\n'

    html += """        </ul>
    </div>

    <footer>
        <p>Data from the <a href="/datasets/codec-support/">upscaler.video Codec Support Dataset</a></p>
        <p><a href="/">WebCodecs Fundamentals</a> | <a href="/datasets/codec-support-table/">Codec Support Table</a></p>
    </footer>
</body>
</html>
"""

    # Write HTML file
    with open(output_file, 'w') as f:
        f.write(html)


def generate_all_family_pages(aggregated_dir, output_dir):
    """Generate HTML pages for all codec families."""

    aggregated_path = Path(aggregated_dir)
    families_path = aggregated_path / "families"
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Read master index
    index_file = aggregated_path / "index.json"
    with open(index_file, 'r') as f:
        index = json.load(f)

    if 'families' not in index:
        print("No families found in index.json")
        return

    print(f"Generating {len(index['families'])} family pages...")

    count = 0
    for family_entry in index['families']:
        family_file = aggregated_path / family_entry['file']

        # Read family data
        with open(family_file, 'r') as f:
            family_data = json.load(f)

        # Generate output filename
        family_filename = f"{family_entry['name']}.html"
        output_file = output_path / family_filename

        # Generate page
        generate_family_page(family_data, output_file)
        count += 1

    print(f"✓ Generated {count} family pages!")


def main():
    aggregated_dir = "aggregated"
    output_dir = "../public/codecs"

    # Check if aggregated data exists
    if not Path(aggregated_dir).exists():
        print(f"Error: {aggregated_dir}/ directory not found!")
        print("Please run aggregate-codecs.py first.")
        return

    generate_all_codec_pages(aggregated_dir, output_dir)
    generate_all_family_pages(aggregated_dir, output_dir)


if __name__ == "__main__":
    main()

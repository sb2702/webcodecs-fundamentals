#!/usr/bin/env python3
"""
Parse codec strings and extract profile, level, and capability information.
Based on MediaBunny codec.ts: https://github.com/Vanilagy/mediabunny/blob/main/src/codec.ts
"""

import re
from typing import Optional, Dict, Any


# Level tables from MediaBunny
AVC_LEVEL_TABLE = [
    {"maxMacroblocks": 99, "maxBitrate": 64000, "level": 0x0A, "name": "1"},
    {"maxMacroblocks": 396, "maxBitrate": 192000, "level": 0x0B, "name": "1.1"},
    {"maxMacroblocks": 396, "maxBitrate": 384000, "level": 0x0C, "name": "1.2"},
    {"maxMacroblocks": 396, "maxBitrate": 768000, "level": 0x0D, "name": "1.3"},
    {"maxMacroblocks": 396, "maxBitrate": 2000000, "level": 0x14, "name": "2"},
    {"maxMacroblocks": 792, "maxBitrate": 4000000, "level": 0x15, "name": "2.1"},
    {"maxMacroblocks": 1620, "maxBitrate": 4000000, "level": 0x16, "name": "2.2"},
    {"maxMacroblocks": 1620, "maxBitrate": 10000000, "level": 0x1E, "name": "3"},
    {"maxMacroblocks": 3600, "maxBitrate": 14000000, "level": 0x1F, "name": "3.1"},
    {"maxMacroblocks": 5120, "maxBitrate": 20000000, "level": 0x20, "name": "3.2"},
    {"maxMacroblocks": 8192, "maxBitrate": 20000000, "level": 0x28, "name": "4"},
    {"maxMacroblocks": 8192, "maxBitrate": 50000000, "level": 0x29, "name": "4.1"},
    {"maxMacroblocks": 8704, "maxBitrate": 50000000, "level": 0x2A, "name": "4.2"},
    {"maxMacroblocks": 22080, "maxBitrate": 135000000, "level": 0x32, "name": "5"},
    {"maxMacroblocks": 36864, "maxBitrate": 240000000, "level": 0x33, "name": "5.1"},
    {"maxMacroblocks": 36864, "maxBitrate": 240000000, "level": 0x34, "name": "5.2"},
    {"maxMacroblocks": 139264, "maxBitrate": 240000000, "level": 0x3C, "name": "6"},
    {"maxMacroblocks": 139264, "maxBitrate": 480000000, "level": 0x3D, "name": "6.1"},
    {"maxMacroblocks": 139264, "maxBitrate": 800000000, "level": 0x3E, "name": "6.2"},
]

HEVC_LEVEL_TABLE = [
    {"maxPictureSize": 36864, "maxBitrate": 128000, "tier": "L", "level": 30, "name": "1"},
    {"maxPictureSize": 122880, "maxBitrate": 1500000, "tier": "L", "level": 60, "name": "2"},
    {"maxPictureSize": 245760, "maxBitrate": 3000000, "tier": "L", "level": 63, "name": "2.1"},
    {"maxPictureSize": 552960, "maxBitrate": 6000000, "tier": "L", "level": 90, "name": "3"},
    {"maxPictureSize": 983040, "maxBitrate": 10000000, "tier": "L", "level": 93, "name": "3.1"},
    {"maxPictureSize": 2228224, "maxBitrate": 12000000, "tier": "L", "level": 120, "name": "4"},
    {"maxPictureSize": 2228224, "maxBitrate": 30000000, "tier": "H", "level": 120, "name": "4"},
    {"maxPictureSize": 2228224, "maxBitrate": 20000000, "tier": "L", "level": 123, "name": "4.1"},
    {"maxPictureSize": 2228224, "maxBitrate": 50000000, "tier": "H", "level": 123, "name": "4.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 25000000, "tier": "L", "level": 150, "name": "5"},
    {"maxPictureSize": 8912896, "maxBitrate": 100000000, "tier": "H", "level": 150, "name": "5"},
    {"maxPictureSize": 8912896, "maxBitrate": 40000000, "tier": "L", "level": 153, "name": "5.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 160000000, "tier": "H", "level": 153, "name": "5.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 60000000, "tier": "L", "level": 156, "name": "5.2"},
    {"maxPictureSize": 8912896, "maxBitrate": 240000000, "tier": "H", "level": 156, "name": "5.2"},
    {"maxPictureSize": 35651584, "maxBitrate": 60000000, "tier": "L", "level": 180, "name": "6"},
    {"maxPictureSize": 35651584, "maxBitrate": 240000000, "tier": "H", "level": 180, "name": "6"},
    {"maxPictureSize": 35651584, "maxBitrate": 120000000, "tier": "L", "level": 183, "name": "6.1"},
    {"maxPictureSize": 35651584, "maxBitrate": 480000000, "tier": "H", "level": 183, "name": "6.1"},
    {"maxPictureSize": 35651584, "maxBitrate": 240000000, "tier": "L", "level": 186, "name": "6.2"},
    {"maxPictureSize": 35651584, "maxBitrate": 800000000, "tier": "H", "level": 186, "name": "6.2"},
]

VP9_LEVEL_TABLE = [
    {"maxPictureSize": 36864, "maxBitrate": 200000, "level": 10, "name": "1"},
    {"maxPictureSize": 73728, "maxBitrate": 800000, "level": 11, "name": "1.1"},
    {"maxPictureSize": 122880, "maxBitrate": 1800000, "level": 20, "name": "2"},
    {"maxPictureSize": 245760, "maxBitrate": 3600000, "level": 21, "name": "2.1"},
    {"maxPictureSize": 552960, "maxBitrate": 7200000, "level": 30, "name": "3"},
    {"maxPictureSize": 983040, "maxBitrate": 12000000, "level": 31, "name": "3.1"},
    {"maxPictureSize": 2228224, "maxBitrate": 18000000, "level": 40, "name": "4"},
    {"maxPictureSize": 2228224, "maxBitrate": 30000000, "level": 41, "name": "4.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 60000000, "level": 50, "name": "5"},
    {"maxPictureSize": 8912896, "maxBitrate": 120000000, "level": 51, "name": "5.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 180000000, "level": 52, "name": "5.2"},
    {"maxPictureSize": 35651584, "maxBitrate": 180000000, "level": 60, "name": "6"},
    {"maxPictureSize": 35651584, "maxBitrate": 240000000, "level": 61, "name": "6.1"},
    {"maxPictureSize": 35651584, "maxBitrate": 480000000, "level": 62, "name": "6.2"},
]

AV1_LEVEL_TABLE = [
    {"maxPictureSize": 147456, "maxBitrate": 1500000, "tier": "M", "level": 0, "name": "2.0"},
    {"maxPictureSize": 278784, "maxBitrate": 3000000, "tier": "M", "level": 1, "name": "2.1"},
    {"maxPictureSize": 665856, "maxBitrate": 6000000, "tier": "M", "level": 4, "name": "3.0"},
    {"maxPictureSize": 1065024, "maxBitrate": 10000000, "tier": "M", "level": 5, "name": "3.1"},
    {"maxPictureSize": 2359296, "maxBitrate": 12000000, "tier": "M", "level": 8, "name": "4.0"},
    {"maxPictureSize": 2359296, "maxBitrate": 30000000, "tier": "H", "level": 8, "name": "4.0"},
    {"maxPictureSize": 2359296, "maxBitrate": 20000000, "tier": "M", "level": 9, "name": "4.1"},
    {"maxPictureSize": 2359296, "maxBitrate": 50000000, "tier": "H", "level": 9, "name": "4.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 30000000, "tier": "M", "level": 12, "name": "5.0"},
    {"maxPictureSize": 8912896, "maxBitrate": 100000000, "tier": "H", "level": 12, "name": "5.0"},
    {"maxPictureSize": 8912896, "maxBitrate": 40000000, "tier": "M", "level": 13, "name": "5.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 160000000, "tier": "H", "level": 13, "name": "5.1"},
    {"maxPictureSize": 8912896, "maxBitrate": 60000000, "tier": "M", "level": 14, "name": "5.2"},
    {"maxPictureSize": 8912896, "maxBitrate": 240000000, "tier": "H", "level": 14, "name": "5.2"},
    {"maxPictureSize": 35651584, "maxBitrate": 60000000, "tier": "M", "level": 15, "name": "5.3"},
    {"maxPictureSize": 35651584, "maxBitrate": 240000000, "tier": "H", "level": 15, "name": "5.3"},
    {"maxPictureSize": 35651584, "maxBitrate": 60000000, "tier": "M", "level": 16, "name": "6.0"},
    {"maxPictureSize": 35651584, "maxBitrate": 240000000, "tier": "H", "level": 16, "name": "6.0"},
    {"maxPictureSize": 35651584, "maxBitrate": 100000000, "tier": "M", "level": 17, "name": "6.1"},
    {"maxPictureSize": 35651584, "maxBitrate": 480000000, "tier": "H", "level": 17, "name": "6.1"},
    {"maxPictureSize": 35651584, "maxBitrate": 160000000, "tier": "M", "level": 18, "name": "6.2"},
    {"maxPictureSize": 35651584, "maxBitrate": 800000000, "tier": "H", "level": 18, "name": "6.2"},
    {"maxPictureSize": 35651584, "maxBitrate": 160000000, "tier": "M", "level": 19, "name": "6.3"},
    {"maxPictureSize": 35651584, "maxBitrate": 800000000, "tier": "H", "level": 19, "name": "6.3"},
]

# AVC Profile names
AVC_PROFILES = {
    0x42: "Baseline",
    0x4D: "Main",
    0x58: "Extended",
    0x64: "High",
    0x6E: "High 10",
    0x7A: "High 4:2:2",
    0xF4: "High 4:4:4",
}

# HEVC Profile names
HEVC_PROFILES = {
    1: "Main",
    2: "Main 10",
    3: "Main Still Picture",
}


def pixels_to_resolution(pixels: int) -> str:
    """Convert pixel count to common resolution names."""
    if pixels <= 147456:  # 384×384
        return "SD (384×384 or smaller)"
    elif pixels <= 245760:  # 512×480
        return "SD (512×480)"
    elif pixels <= 552960:  # 720×480 (DVD)
        return "SD/DVD (720×480)"
    elif pixels <= 983040:  # 1024×960
        return "HD ready (1024×960)"
    elif pixels <= 2228224:  # 1920×1160
        return "1080p (1920×1080)"
    elif pixels <= 8912896:  # 4096×2176 (4K)
        return "4K (4096×2176)"
    elif pixels <= 35651584:  # 8192×4352 (8K)
        return "8K (8192×4352)"
    else:
        return "Beyond 8K"


def format_bitrate(bitrate: int) -> str:
    """Format bitrate in human-readable units."""
    if bitrate < 1000000:
        return f"{bitrate / 1000:.0f} Kbps"
    else:
        return f"{bitrate / 1000000:.0f} Mbps"


def parse_avc_codec(codec_string: str) -> Optional[Dict[str, Any]]:
    """Parse AVC/H.264 codec string (e.g., avc1.64001e)."""
    match = re.match(r'avc[13]\.([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})', codec_string)
    if not match:
        return None

    profile_hex = match.group(1)
    level_hex = match.group(3)

    profile_idc = int(profile_hex, 16)
    level_idc = int(level_hex, 16)

    # Find profile name
    profile_name = AVC_PROFILES.get(profile_idc, f"Profile {profile_idc}")

    # Find level info
    level_info = next((l for l in AVC_LEVEL_TABLE if l["level"] == level_idc), None)

    if level_info:
        # Convert macroblocks to pixels (each macroblock is 16x16 = 256 pixels)
        max_pixels = level_info["maxMacroblocks"] * 256
        return {
            "family": "AVC (H.264)",
            "profile": profile_name,
            "level": level_info["name"],
            "maxResolution": pixels_to_resolution(max_pixels),
            "maxBitrate": format_bitrate(level_info["maxBitrate"]),
        }

    return {
        "family": "AVC (H.264)",
        "profile": profile_name,
        "level": f"Level {level_idc:02x}",
        "maxResolution": "Unknown",
        "maxBitrate": "Unknown",
    }


def parse_hevc_codec(codec_string: str) -> Optional[Dict[str, Any]]:
    """Parse HEVC/H.265 codec string (e.g., hev1.1.6.L93.B0)."""
    match = re.match(r'hev[c1]\.([ABC])?(\d+)\.([0-9A-F]+)\.([LH])(\d+)', codec_string)
    if not match:
        return None

    profile_idc = int(match.group(2))
    tier = match.group(4)
    level_num = int(match.group(5))

    # Find profile name
    profile_name = HEVC_PROFILES.get(profile_idc, f"Profile {profile_idc}")

    # Find level info
    level_info = next((l for l in HEVC_LEVEL_TABLE if l["tier"] == tier and l["level"] == level_num), None)

    if level_info:
        tier_name = "Main Tier" if tier == "L" else "High Tier"
        return {
            "family": "HEVC (H.265)",
            "profile": profile_name,
            "level": f"{level_info['name']} ({tier_name})",
            "maxResolution": pixels_to_resolution(level_info["maxPictureSize"]),
            "maxBitrate": format_bitrate(level_info["maxBitrate"]),
        }

    return {
        "family": "HEVC (H.265)",
        "profile": profile_name,
        "level": f"Level {level_num}",
        "maxResolution": "Unknown",
        "maxBitrate": "Unknown",
    }


def parse_vp9_codec(codec_string: str) -> Optional[Dict[str, Any]]:
    """Parse VP9 codec string (e.g., vp09.00.41.08)."""
    match = re.match(r'vp0?9\.(\d+)\.(\d+)\.(\d+)', codec_string)
    if not match:
        return None

    profile = int(match.group(1))
    level = int(match.group(2))
    bit_depth = int(match.group(3))

    # Find level info
    level_info = next((l for l in VP9_LEVEL_TABLE if l["level"] == level), None)

    profile_name = f"Profile {profile}"
    if bit_depth == 8:
        profile_name += " (8-bit)"
    elif bit_depth == 10:
        profile_name += " (10-bit)"
    elif bit_depth == 12:
        profile_name += " (12-bit)"

    if level_info:
        return {
            "family": "VP9",
            "profile": profile_name,
            "level": level_info["name"],
            "maxResolution": pixels_to_resolution(level_info["maxPictureSize"]),
            "maxBitrate": format_bitrate(level_info["maxBitrate"]),
        }

    return {
        "family": "VP9",
        "profile": profile_name,
        "level": f"Level {level}",
        "maxResolution": "Unknown",
        "maxBitrate": "Unknown",
    }


def parse_av1_codec(codec_string: str) -> Optional[Dict[str, Any]]:
    """Parse AV1 codec string (e.g., av01.0.04M.08)."""
    match = re.match(r'av01\.(\d+)\.(\d+)([MH])\.(\d+)', codec_string)
    if not match:
        return None

    profile = int(match.group(1))
    level_num = int(match.group(2))
    tier = match.group(3)
    bit_depth = int(match.group(4))

    # Find level info
    level_info = next((l for l in AV1_LEVEL_TABLE if l["tier"] == tier and l["level"] == level_num), None)

    profile_name = f"Profile {profile}"
    if bit_depth == 8:
        profile_name += " (8-bit)"
    elif bit_depth == 10:
        profile_name += " (10-bit)"
    elif bit_depth == 12:
        profile_name += " (12-bit)"

    if level_info:
        tier_name = "Main Tier" if tier == "M" else "High Tier"
        return {
            "family": "AV1",
            "profile": profile_name,
            "level": f"{level_info['name']} ({tier_name})",
            "maxResolution": pixels_to_resolution(level_info["maxPictureSize"]),
            "maxBitrate": format_bitrate(level_info["maxBitrate"]),
        }

    return {
        "family": "AV1",
        "profile": profile_name,
        "level": f"Level {level_num}",
        "maxResolution": "Unknown",
        "maxBitrate": "Unknown",
    }


def parse_vp8_codec(codec_string: str) -> Optional[Dict[str, Any]]:
    """Parse VP8 codec string."""
    if codec_string.lower() == 'vp8':
        return {
            "family": "VP8",
            "profile": "N/A",
            "level": "N/A",
            "maxResolution": "N/A",
            "maxBitrate": "N/A",
        }
    return None


def parse_codec_string(codec_string: str) -> Optional[Dict[str, Any]]:
    """
    Parse any video codec string and return profile/level information.

    Returns dict with:
    - family: Codec family name
    - profile: Profile name
    - level: Level name
    - maxResolution: Human-readable max resolution
    - maxBitrate: Human-readable max bitrate
    """
    codec_lower = codec_string.lower()

    if codec_lower.startswith('avc'):
        return parse_avc_codec(codec_string)
    elif codec_lower.startswith('hev') or codec_lower.startswith('hvc'):
        return parse_hevc_codec(codec_string)
    elif codec_lower.startswith('vp09') or codec_lower.startswith('vp9'):
        return parse_vp9_codec(codec_string)
    elif codec_lower.startswith('av01'):
        return parse_av1_codec(codec_string)
    elif codec_lower == 'vp8':
        return parse_vp8_codec(codec_string)

    # Not a video codec or unrecognized
    return None

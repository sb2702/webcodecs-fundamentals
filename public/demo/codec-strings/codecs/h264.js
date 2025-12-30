/**
 * H.264/AVC CODEC STRING GENERATION
 *
 * Reference: RFC 6381 - https://datatracker.ietf.org/doc/html/rfc6381
 * Reference: ISO/IEC 14496-10 (ITU-T H.264)
 * Reference: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter
 *
 * Format: avc1.{profile}{constraint}{level}
 *
 * The codec parameters are represented as six hexadecimal digits (PPCCLL):
 * - PP: profile_idc (2 hex digits)
 * - CC: constraint_set flags (2 hex digits)
 * - LL: level_idc (2 hex digits)
 *
 * These three bytes come directly from the H.264 Sequence Parameter Set (SPS).
 *
 * Profile (profile_idc):
 * The profile_idc identifies the profile used for encoding.
 * Common profiles:
 * - 0x42 (66): Baseline Profile - Most compatible, used for low-complexity applications
 * - 0x4D (77): Main Profile - Mid-range, good balance of complexity and quality
 * - 0x64 (100): High Profile - Best compression, higher computational complexity
 *
 * Constraint Set Flags (profile_iop):
 * Six constraint flags that modify the profile behavior:
 * - constraint_set0_flag through constraint_set5_flag
 * - reserved_zero_2bits (must be 0)
 * Common values:
 * - 0x00: No constraints
 * - 0x04, 0x08, 0x0C, 0x10, 0x14: Various constraint combinations
 *
 * Level (level_idc):
 * The level_idc specifies the level of the profile, which determines
 * maximum picture size, bitrate, and decoder processing requirements.
 *
 * Levels and their capabilities:
 * - 1.0 (0x0A): Up to 128×96 @ 64 kbps
 * - 1.1 (0x0B): Up to 176×144 @ 192 kbps (mobile/CIF)
 * - 1.2 (0x0C): Up to 352×288 @ 384 kbps (CIF)
 * - 1.3 (0x0D): Up to 352×288 @ 768 kbps
 * - 2.0 (0x14): Up to 352×288 @ 2 Mbps
 * - 2.1 (0x15): Up to 352×576 @ 4 Mbps
 * - 2.2 (0x16): Up to 720×576 @ 4 Mbps
 * - 3.0 (0x1E): Up to 720×576 @ 10 Mbps (SD)
 * - 3.1 (0x1F): Up to 1280×720 @ 14 Mbps (720p)
 * - 3.2 (0x20): Up to 1280×1024 @ 20 Mbps
 * - 4.0 (0x28): Up to 2048×1024 @ 20 Mbps (1080p)
 * - 4.1 (0x29): Up to 2048×1024 @ 50 Mbps (1080p high bitrate)
 * - 4.2 (0x2A): Up to 2048×1080 @ 50 Mbps
 * - 5.0 (0x32): Up to 2560×1920 @ 135 Mbps (4K)
 * - 5.1 (0x33): Up to 4096×2048 @ 240 Mbps (4K)
 * - 5.2 (0x34): Up to 4096×2160 @ 240 Mbps (4K)
 * - 6.0 (0x3C): Up to 8192×4320 @ 240 Mbps (8K)
 * - 6.1 (0x3D): Up to 8192×4320 @ 480 Mbps (8K)
 * - 6.2 (0x3E): Up to 8192×4320 @ 800 Mbps (8K)
 *
 * Example: avc1.640028
 * - 64: High Profile
 * - 00: No constraints
 * - 28: Level 4.0 (1080p capable)
 *
 * Total variants: 342 (3 profiles × 6 constraints × 19 levels)
 */

export function generateAVCCodecStrings() {
    const codecs = [];

    // H.264 profiles with their hex values and names
    const profiles = {
        '42': 'Baseline',  // 0x42 = 66 decimal
        '4d': 'Main',      // 0x4D = 77 decimal
        '64': 'High'       // 0x64 = 100 decimal
    };

    // Constraint set flags
    // These modify the profile behavior with additional restrictions
    const constraints = ['00', '04', '08', '0c', '10', '14'];

    // H.264 levels with their hex values and descriptive names
    const levels = {
        '0a': '1.0',   // 0x0A = 10 decimal
        '0b': '1.1',   // 0x0B = 11 decimal
        '0c': '1.2',   // 0x0C = 12 decimal
        '0d': '1.3',   // 0x0D = 13 decimal
        '14': '2.0',   // 0x14 = 20 decimal
        '15': '2.1',   // 0x15 = 21 decimal
        '16': '2.2',   // 0x16 = 22 decimal
        '1e': '3.0',   // 0x1E = 30 decimal
        '1f': '3.1',   // 0x1F = 31 decimal
        '20': '3.2',   // 0x20 = 32 decimal
        '28': '4.0',   // 0x28 = 40 decimal
        '29': '4.1',   // 0x29 = 41 decimal
        '2a': '4.2',   // 0x2A = 42 decimal
        '32': '5.0',   // 0x32 = 50 decimal
        '33': '5.1',   // 0x33 = 51 decimal
        '34': '5.2',   // 0x34 = 52 decimal
        '3c': '6.0',   // 0x3C = 60 decimal
        '3d': '6.1',   // 0x3D = 61 decimal
        '3e': '6.2'    // 0x3E = 62 decimal
    };

    // Generate all valid combinations
    for (const [profileHex, profileName] of Object.entries(profiles)) {
        for (const constraint of constraints) {
            for (const [levelHex, levelName] of Object.entries(levels)) {
                // Build codec string: avc1.{profile}{constraint}{level}
                const codecString = `avc1.${profileHex}${constraint}${levelHex}`;

                codecs.push({
                    string: codecString,
                    family: 'avc',
                    profile: profileName,
                    constraint: constraint,
                    level: levelName
                });
            }
        }
    }

    return codecs;
}

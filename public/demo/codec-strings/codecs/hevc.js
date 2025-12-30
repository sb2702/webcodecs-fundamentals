/**
 * H.265/HEVC CODEC STRING GENERATION
 *
 * Reference: https://www.w3.org/TR/webcodecs-hevc-codec-registration/
 * Reference: ISO/IEC 14496-15:2024 Section E.3
 * Reference: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter
 *
 * Format: hev1.{general_profile_space}{general_profile_idc}.{profile_compatibility}.{tier}{general_level_idc}.{constraint_flags}
 *
 * The codec string begins with either "hev1." or "hvc1." prefix:
 * - hev1: Parameter sets stored out-of-band (in decoder configuration record)
 * - hvc1: Parameter sets stored in-band (in the video stream)
 *
 * According to ISO/IEC 14496-15 Section 8.4.1, the difference relates to
 * parameter set storage location in the container format.
 *
 * Four dot-separated fields follow the prefix:
 *
 * Field 1: Profile Information
 * - general_profile_space: Profile space (typically empty/0)
 * - general_profile_idc: Profile number
 *   - 1: Main Profile (8-bit, 4:2:0)
 *   - 2: Main 10 Profile (10-bit, 4:2:0)
 *   - 3: Main Still Picture Profile
 *
 * Field 2: Profile Compatibility Flags
 * - 32-bit flags indicating profile compatibility
 * - Common value: "6" for general compatibility
 * - Taken from general_profile_compatibility_flags in VPS
 *
 * Field 3: Tier and Level
 * - Tier:
 *   - L: Low (Main) Tier - Lower bitrate limits
 *   - H: High Tier - Higher bitrate limits
 * - Level: Two or three digit value representing the level
 *   - 30: Level 1.0    - 60: Level 2.0    - 90: Level 3.0
 *   - 93: Level 3.1    - 120: Level 4.0   - 123: Level 4.1
 *   - 150: Level 5.0   - 153: Level 5.1   - 156: Level 5.2
 *   - 180: Level 6.0   - 183: Level 6.1   - 186: Level 6.2
 *
 * Field 4: Constraint Indicator Flags
 * - Hexadecimal representation of constraint flags
 * - Common value: "B0" for progressive source
 *
 * Level Capabilities:
 * - Level 1.0: Up to 128×96 @ 128 kbps
 * - Level 2.0: Up to 352×288 @ 1.5 Mbps
 * - Level 3.0: Up to 720×576 @ 6 Mbps
 * - Level 4.0: Up to 2048×1080 @ 12-30 Mbps (1080p)
 * - Level 5.0: Up to 4096×2160 @ 25-100 Mbps (4K)
 * - Level 6.0: Up to 8192×4320 @ 60-240 Mbps (8K)
 *
 * Example: hev1.1.6.L120.B0
 * - hev1: Out-of-band parameter sets
 * - 1: Main Profile
 * - 6: Profile compatibility flags
 * - L120: Low tier, Level 4.0
 * - B0: Progressive source constraint
 *
 * Note: Using simplified common configurations based on MediaBunny reference
 * implementation for practical WebCodecs usage.
 *
 * Total variants: 84 (2 profiles × 21 tier/level combinations × 2 tiers)
 */

export function generateHEVCCodecStrings() {
    const codecs = [];

    // HEVC level table with tier and level values
    // Reference: https://en.wikipedia.org/wiki/High_Efficiency_Video_Coding_tiers_and_levels
    // Reference: https://github.com/Vanilagy/mediabunny/blob/main/src/codec.ts
    const levels = [
        { tier: 'L', level: 30, name: '1.0' },    // Level 1 (Low Tier)
        { tier: 'L', level: 60, name: '2.0' },    // Level 2 (Low Tier)
        { tier: 'L', level: 63, name: '2.1' },    // Level 2.1 (Low Tier)
        { tier: 'L', level: 90, name: '3.0' },    // Level 3 (Low Tier)
        { tier: 'L', level: 93, name: '3.1' },    // Level 3.1 (Low Tier)
        { tier: 'L', level: 120, name: '4.0' },   // Level 4 (Low Tier)
        { tier: 'H', level: 120, name: '4.0' },   // Level 4 (High Tier)
        { tier: 'L', level: 123, name: '4.1' },   // Level 4.1 (Low Tier)
        { tier: 'H', level: 123, name: '4.1' },   // Level 4.1 (High Tier)
        { tier: 'L', level: 150, name: '5.0' },   // Level 5 (Low Tier)
        { tier: 'H', level: 150, name: '5.0' },   // Level 5 (High Tier)
        { tier: 'L', level: 153, name: '5.1' },   // Level 5.1 (Low Tier)
        { tier: 'H', level: 153, name: '5.1' },   // Level 5.1 (High Tier)
        { tier: 'L', level: 156, name: '5.2' },   // Level 5.2 (Low Tier)
        { tier: 'H', level: 156, name: '5.2' },   // Level 5.2 (High Tier)
        { tier: 'L', level: 180, name: '6.0' },   // Level 6 (Low Tier)
        { tier: 'H', level: 180, name: '6.0' },   // Level 6 (High Tier)
        { tier: 'L', level: 183, name: '6.1' },   // Level 6.1 (Low Tier)
        { tier: 'H', level: 183, name: '6.1' },   // Level 6.1 (High Tier)
        { tier: 'L', level: 186, name: '6.2' },   // Level 6.2 (Low Tier)
        { tier: 'H', level: 186, name: '6.2' },   // Level 6.2 (High Tier)
    ];

    // Profile configurations
    const profiles = [
        {
            profileIdc: '1',
            compatibilityFlags: '6',
            name: 'Main',
            description: '8-bit 4:2:0'
        },
        {
            profileIdc: '2',
            compatibilityFlags: '4',
            name: 'Main 10',
            description: '10-bit 4:2:0'
        }
    ];

    // Constraint flags
    // B0: Progressive source (most common)
    const constraintFlags = 'B0';

    // Generate all valid combinations
    for (const profile of profiles) {
        for (const levelInfo of levels) {
            // Build codec string: hev1.{profile}.{compatibility}.{tier}{level}.{constraint}
            const codecString = `hev1.${profile.profileIdc}.${profile.compatibilityFlags}.${levelInfo.tier}${levelInfo.level}.${constraintFlags}`;

            codecs.push({
                string: codecString,
                family: 'hevc',
                profile: profile.name,
                tier: levelInfo.tier === 'L' ? 'Low' : 'High',
                level: levelInfo.name
            });
        }
    }

    return codecs;
}

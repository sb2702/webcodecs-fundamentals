/**
 * AV1 CODEC STRING GENERATION
 *
 * Reference: https://aomediacodec.github.io/av1-isobmff/
 * Reference: https://aomediacodec.github.io/av1-spec/
 * Reference: https://github.com/AOMediaCodec/av1-spec/blob/master/annex.a.levels.md
 * Reference: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter
 *
 * Format: av01.{profile}.{level}{tier}.{bitDepth}[.{monochrome}.{chromaSubsampling}.{colorPrimaries}.{transferCharacteristics}.{matrixCoefficients}.{videoFullRangeFlag}]
 *
 * Mandatory Parameters:
 * - sample entry 4CC: 'av01'
 * - profile: One-digit profile number (0-2)
 * - level: Two-digit seq_level_idx value (00-23, 31)
 * - tier: Single character tier indicator (M or H)
 * - bitDepth: Two-digit bit depth (08, 10, 12)
 *
 * Optional Parameters (mutually inclusive - all or none):
 * - monochrome: Monochrome flag (0 or 1)
 * - chromaSubsampling: Three-digit chroma subsampling format
 * - colorPrimaries: Two-digit color primaries (cp)
 * - transferCharacteristics: Two-digit transfer characteristics (tc)
 * - matrixCoefficients: Two-digit matrix coefficients (mc)
 * - videoFullRangeFlag: Video full range flag (0 or 1)
 *
 * Profile:
 * - 0: Main Profile - Most common, 8-10 bit, YUV 4:2:0
 * - 1: High Profile - Professional, supports 4:4:4
 * - 2: Professional Profile - Full feature set including 12-bit
 *
 * Note: Profile 1 has known compatibility issues on Android Chrome
 * and should generally be avoided unless specifically needed.
 *
 * Level (seq_level_idx):
 * The seq_level_idx is an integer from 0 to 31 that specifies the level.
 * Each level defines maximum picture size, bitrate, and other constraints.
 *
 * Level mapping (from AV1 specification Annex A):
 * - 00: Level 2.0   - 01: Level 2.1   - 02: Level 2.2   - 03: Level 2.3
 * - 04: Level 3.0   - 05: Level 3.1   - 06: Level 3.2   - 07: Level 3.3
 * - 08: Level 4.0   - 09: Level 4.1   - 10: Level 4.2   - 11: Level 4.3
 * - 12: Level 5.0   - 13: Level 5.1   - 14: Level 5.2   - 15: Level 5.3
 * - 16: Level 6.0   - 17: Level 6.1   - 18: Level 6.2   - 19: Level 6.3
 * - 20: Level 7.0   - 21: Level 7.1   - 22: Level 7.2   - 23: Level 7.3
 * - 24-30: Reserved for future use
 * - 31: Maximum parameters (no level-based constraints)
 *
 * Note: Not all level numbers are defined. For example, levels 2.2, 2.3, 3.2, 3.3,
 * 4.2, 4.3, 5.3, 6.3, and all level 7.x values are reserved but not yet formally
 * specified in the current version of the specification.
 *
 * Tier:
 * - M: Main Tier - Standard bitrate limits
 * - H: High Tier - Higher bitrate limits (typically 2-4x Main Tier)
 *
 * Bit Depth:
 * - 08: 8-bit (most common for web delivery)
 * - 10: 10-bit (HDR content, better quality)
 * - 12: 12-bit (professional workflows)
 *
 * Level Capabilities (Main Tier examples):
 * - Level 2.0 (00M): Up to 428×240 @ 1.5 Mbps
 * - Level 3.0 (04M): Up to 854×480 @ 6 Mbps (SD)
 * - Level 4.0 (08M): Up to 1920×1080 @ 12 Mbps (1080p)
 * - Level 5.0 (12M): Up to 3840×2160 @ 30 Mbps (4K)
 * - Level 6.0 (16M): Up to 7680×4320 @ 60 Mbps (8K)
 *
 * Examples:
 * - av01.0.04M.08: Main profile, Level 3.0, Main tier, 8-bit
 * - av01.0.08M.10: Main profile, Level 4.0, Main tier, 10-bit (common for 1080p)
 * - av01.0.12M.10: Main profile, Level 5.0, Main tier, 10-bit (common for 4K HDR)
 *
 * Total variants: 1,152 (3 profiles × 24 levels × 2 tiers × 8 bit depths)
 * Note: Some combinations may not be valid (e.g., Profile 0 with 12-bit)
 * but are included for comprehensive testing.
 */

export function generateAV1CodecStrings() {
    const codecs = [];

    // AV1 profiles
    const profiles = [
        {
            value: '0',
            name: 'Main',
            description: 'Main Profile - 8-10 bit, 4:2:0'
        },
        {
            value: '1',
            name: 'High',
            description: 'High Profile - Supports 4:4:4'
        },
        {
            value: '2',
            name: 'Professional',
            description: 'Professional Profile - Full feature set'
        }
    ];

    // Complete AV1 level table from specification
    // Reference: https://github.com/AOMediaCodec/av1-spec/blob/master/annex.a.levels.md
    const levels = [
        { idx: '00', name: '2.0' }, { idx: '01', name: '2.1' },
        { idx: '02', name: '2.2' }, { idx: '03', name: '2.3' },
        { idx: '04', name: '3.0' }, { idx: '05', name: '3.1' },
        { idx: '06', name: '3.2' }, { idx: '07', name: '3.3' },
        { idx: '08', name: '4.0' }, { idx: '09', name: '4.1' },
        { idx: '10', name: '4.2' }, { idx: '11', name: '4.3' },
        { idx: '12', name: '5.0' }, { idx: '13', name: '5.1' },
        { idx: '14', name: '5.2' }, { idx: '15', name: '5.3' },
        { idx: '16', name: '6.0' }, { idx: '17', name: '6.1' },
        { idx: '18', name: '6.2' }, { idx: '19', name: '6.3' },
        { idx: '20', name: '7.0' }, { idx: '21', name: '7.1' },
        { idx: '22', name: '7.2' }, { idx: '23', name: '7.3' }
        // Note: 24-30 are reserved, 31 is "maximum parameters" (no constraints)
    ];

    // AV1 tiers
    const tiers = [
        { value: 'M', name: 'Main' },
        { value: 'H', name: 'High' }
    ];

    // Bit depths
    const bitDepths = ['08', '10', '12'];

    // Generate all valid combinations
    for (const profile of profiles) {
        for (const level of levels) {
            for (const tier of tiers) {
                for (const bitDepth of bitDepths) {
                    // Build codec string: av01.{profile}.{level}{tier}.{bitDepth}
                    const codecString = `av01.${profile.value}.${level.idx}${tier.value}.${bitDepth}`;

                    codecs.push({
                        string: codecString,
                        family: 'av1',
                        profile: profile.name,
                        level: level.name,
                        tier: tier.name,
                        bitDepth: bitDepth + '-bit'
                    });
                }
            }
        }
    }

    return codecs;
}

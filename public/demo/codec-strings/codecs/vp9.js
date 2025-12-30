/**
 * VP9 CODEC STRING GENERATION
 *
 * Reference: https://github.com/webmproject/vp9-dash/blob/main/VPCodecISOMediaFileFormatBinding.md
 * Reference: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/codecs_parameter
 *
 * Format: vp09.{profile}.{level}.{bitDepth}[.{chromaSubsampling}.{colorPrimaries}.{transferCharacteristics}.{matrixCoefficients}.{videoFullRangeFlag}]
 *
 * All parameter values are expressed as two-digit decimals.
 *
 * Mandatory Parameters:
 * - sample entry 4CC: 'vp09'
 * - profile: Two-digit profile number (00-03)
 * - level: Two-digit level number (10-62)
 * - bitDepth: Bit depth value (08, 10, or 12)
 *
 * Optional Parameters (mutually inclusive - all or none):
 * - chromaSubsampling: Chroma subsampling format
 * - colourPrimaries: Color primaries (cp)
 * - transferCharacteristics: Transfer characteristics (tc)
 * - matrixCoefficients: Matrix coefficients (mc)
 * - videoFullRangeFlag: Video full range flag
 *
 * Profile Details:
 * - Profile 0: 8-bit, 4:2:0 chroma subsampling only
 * - Profile 1: 8-bit, 4:2:2 and 4:4:4 chroma subsampling
 * - Profile 2: 10-12 bit, 4:2:0 chroma subsampling only
 * - Profile 3: 10-12 bit, 4:2:2 and 4:4:4 chroma subsampling
 *
 * Levels: 10, 11, 20, 21, 30, 31, 40, 41, 50, 51, 52, 60, 61, 62
 * (Representing Level 1.0 through Level 6.2)
 *
 * Chroma Subsampling Values:
 * - 00: 4:2:0 vertical
 * - 01: 4:2:0 colocated with luma (0,0)
 * - 02: 4:2:2
 * - 03: 4:4:4
 *
 * Note: If matrixCoefficients is 0 (RGB), then chromaSubsampling must be 3 (4:4:4)
 *
 * Example: vp09.02.10.10.01.09.16.09.01
 * - VP9 profile 2
 * - Level 1.0
 * - 10-bit YUV content
 * - 4:2:0 chroma subsampling
 * - ITU-R BT.2020 color primaries
 * - ST 2084 EOTF transfer characteristics
 * - ITU-R BT.2020 non-constant luminance matrix
 * - Full-range encoding
 *
 * Total variants: ~768 (without optional color parameters)
 */

export function generateVP9CodecStrings() {
    const codecs = [];

    // VP9 Profile definitions with constraints
    const profiles = [
        {
            value: '00',
            name: 'Profile 0',
            bitDepths: ['08'],
            chromas: ['00'],
            description: '8-bit YUV 4:2:0'
        },
        {
            value: '01',
            name: 'Profile 1',
            bitDepths: ['08'],
            chromas: ['00', '01', '02', '03'],
            description: '8-bit with extended chroma'
        },
        {
            value: '02',
            name: 'Profile 2',
            bitDepths: ['10', '12'],
            chromas: ['00'],
            description: '10-12 bit YUV 4:2:0'
        },
        {
            value: '03',
            name: 'Profile 3',
            bitDepths: ['10', '12'],
            chromas: ['00', '01', '02', '03'],
            description: '10-12 bit with extended chroma'
        }
    ];

    // VP9 levels from specification
    const levels = [
        '10', '11',           // Level 1.0, 1.1
        '20', '21',           // Level 2.0, 2.1
        '30', '31',           // Level 3.0, 3.1
        '40', '41',           // Level 4.0, 4.1
        '50', '51', '52',     // Level 5.0, 5.1, 5.2
        '60', '61', '62'      // Level 6.0, 6.1, 6.2
    ];

    // Chroma subsampling format names
    const chromaNames = {
        '00': '4:2:0',
        '01': '4:2:0 colocated',
        '02': '4:2:2',
        '03': '4:4:4'
    };

    // Generate all valid combinations
    for (const profile of profiles) {
        for (const level of levels) {
            for (const bitDepth of profile.bitDepths) {
                for (const chroma of profile.chromas) {
                    // Build codec string: vp09.{profile}.{level}.{bitDepth}.{chroma}
                    const codecString = `vp09.${profile.value}.${level}.${bitDepth}.${chroma}`;

                    codecs.push({
                        string: codecString,
                        family: 'vp9',
                        profile: profile.name,
                        level: level,
                        bitDepth: bitDepth + '-bit',
                        chroma: chromaNames[chroma]
                    });
                }
            }
        }
    }

    return codecs;
}

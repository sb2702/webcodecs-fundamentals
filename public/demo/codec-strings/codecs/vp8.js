/**
 * VP8 CODEC STRING GENERATION
 *
 * Reference: https://www.w3.org/TR/webcodecs-vp8-codec-registration/
 *
 * VP8 uses a simple codec string with no additional parameters.
 * Unlike VP9, AV1, H.264, and H.265, VP8 does not support parameterized
 * codec strings in the WebCodecs specification.
 *
 * Format: "vp8"
 *
 * Total variants: 1
 */

export function generateVP8CodecStrings() {
    return [{
        string: 'vp8',
        family: 'vp8',
        description: 'VP8'
    }];
}

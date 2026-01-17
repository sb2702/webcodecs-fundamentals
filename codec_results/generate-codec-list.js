#!/usr/bin/env node

/**
 * Generate Canonical Codec String List
 *
 * Runs all codec string generators and outputs a single definitive JSON file
 * containing all possible codec strings for WebCodecs testing.
 *
 * This file becomes the "source of truth" for:
 * - Production silent testing workers
 * - Manual testing tools
 * - Documentation/registry generation
 *
 * Usage:
 *   node generate-codec-list.js [output-file]
 */

import { generateVP8CodecStrings } from '../public/demo/codec-strings/codecs/vp8.js';
import { generateVP9CodecStrings } from '../public/demo/codec-strings/codecs/vp9.js';
import { generateAVCCodecStrings } from '../public/demo/codec-strings/codecs/h264.js';
import { generateHEVCCodecStrings } from '../public/demo/codec-strings/codecs/hevc.js';
import { generateAV1CodecStrings } from '../public/demo/codec-strings/codecs/av1.js';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = process.argv[2] || './codec-strings.json';

function main() {
    console.log('Generating canonical codec string list...\n');

    // Generate all codec strings
    const vp8Codecs = generateVP8CodecStrings();
    const vp9Codecs = generateVP9CodecStrings();
    const avcCodecs = generateAVCCodecStrings();
    const hevcCodecs = generateHEVCCodecStrings();
    const av1Codecs = generateAV1CodecStrings();

    // Combine all codecs
    const allCodecs = [
        ...vp8Codecs,
        ...vp9Codecs,
        ...avcCodecs,
        ...hevcCodecs,
        ...av1Codecs
    ];



    console.log(vp8Codecs);

    console.log(vp9Codecs)

    const output = allCodecs.map(c=>c.string);


 

    
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null));

    // Print summary
    console.log('✓ Codec string generation complete!\n');
    console.log('Summary by codec family:');
    console.log(`  VP8:        ${vp8Codecs.length.toString().padStart(5)} codec strings`);
    console.log(`  VP9:        ${vp9Codecs.length.toString().padStart(5)} codec strings`);
    console.log(`  H.264/AVC:  ${avcCodecs.length.toString().padStart(5)} codec strings`);
    console.log(`  H.265/HEVC: ${hevcCodecs.length.toString().padStart(5)} codec strings`);
    console.log(`  AV1:        ${av1Codecs.length.toString().padStart(5)} codec strings`);
    console.log(`  ─────────────────────`);
    console.log(`  Total:      ${allCodecs.length.toString().padStart(5)} codec strings`);
    console.log(`\n✓ Output written to: ${OUTPUT_FILE}`);

    // Show some example entries
    console.log('\nExample codec strings:');
    console.log(`  VP8:   ${vp8Codecs[0].string}`);
    console.log(`  VP9:   ${vp9Codecs[0].string}`);
    console.log(`  H.264: ${avcCodecs[0].string}`);
    console.log(`  HEVC:  ${hevcCodecs[0].string}`);
    console.log(`  AV1:   ${av1Codecs[0].string}`);
}

main();

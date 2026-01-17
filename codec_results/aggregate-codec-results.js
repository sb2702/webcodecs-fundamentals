#!/usr/bin/env node

/**
 * Aggregate codec test results from S3
 * Reads all JSON files from S3 bucket and aggregates by codec string
 *
 * Usage:
 *   node aggregate-codec-results.js [output-file]
 *
 * Environment variables:
 *   AWS_REGION - AWS region (default: us-east-1)
 *   CODEC_TEST_S3_BUCKET - S3 bucket name (default: katana-misc-files)
 */

import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';

const OUTPUT_FILE = process.argv[2] || './aggregated-results.json';
const S3_BUCKET = process.env.CODEC_TEST_S3_BUCKET || 'katana-misc-files';
const S3_PREFIX = 'codec-test-results/';

// Configure AWS
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1'
});

async function listAllS3Objects(bucket, prefix) {
  const allObjects = [];
  let continuationToken = null;

  do {
    const params = {
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken
    };

    const response = await s3.listObjectsV2(params).promise();

    // Filter for JSON files only
    const jsonObjects = response.Contents.filter(obj => obj.Key.endsWith('.json'));
    allObjects.push(...jsonObjects);

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return allObjects;
}

async function downloadS3Object(bucket, key) {
  const params = {
    Bucket: bucket,
    Key: key
  };

  const response = await s3.getObject(params).promise();
  return JSON.parse(response.Body.toString('utf8'));
}

async function aggregateResults() {
  const aggregated = {};

  // List all JSON files from S3
  console.log(`Fetching test results from s3://${S3_BUCKET}/${S3_PREFIX}`);
  const s3Objects = await listAllS3Objects(S3_BUCKET, S3_PREFIX);

  console.log(`Found ${s3Objects.length} test result files in S3`);

  // Download and process each file
  for (let i = 0; i < s3Objects.length; i++) {
    const obj = s3Objects[i];

    if (i % 10 === 0) {
      console.log(`Processing ${i + 1}/${s3Objects.length}...`);
    }

    try {
      const data = await downloadS3Object(S3_BUCKET, obj.Key);

    const { testMetadata, results } = data;

      // Process each codec result
      for (const codecResult of results) {
        const codecString = codecResult.string;

        // Initialize codec entry if it doesn't exist
        if (!aggregated[codecString]) {
          aggregated[codecString] = {
            codecString,
            family: codecResult.family,
            profile: codecResult.profile,
            level: codecResult.level,
            tier: codecResult.tier,
            bitDepth: codecResult.bitDepth,
            chroma: codecResult.chroma,
            constraint: codecResult.constraint,
            prefix: codecResult.prefix,
            tests: []
          };
        }

        // Add this test result
        aggregated[codecString].tests.push({
          timestamp: testMetadata.timestamp,
          browser: testMetadata.browser,
          userAgent: testMetadata.userAgent,
          platform: testMetadata.platform,
          codecTab: testMetadata.codecTab,
          supported: codecResult.supported,
          resolutions: codecResult.resolutions
        });
      }
    } catch (error) {
      console.error(`Error processing ${obj.Key}:`, error.message);
    }
  }

  // Sort tests by timestamp (newest first) and calculate stats
  for (const codecString in aggregated) {
    aggregated[codecString].tests.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Calculate support statistics
    const totalTests = aggregated[codecString].tests.length;
    const supportedTests = aggregated[codecString].tests.filter(t => t.supported).length;
    aggregated[codecString].supportPercentage = ((supportedTests / totalTests) * 100).toFixed(1);
    aggregated[codecString].totalTests = totalTests;
    aggregated[codecString].supportedDevices = supportedTests;
  }

  return aggregated;
}

async function main() {
  try {
    console.log(`Aggregating results from s3://${S3_BUCKET}/${S3_PREFIX}`);

    const aggregated = await aggregateResults();

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write aggregated results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(aggregated, null, 2));

    const codecCount = Object.keys(aggregated).length;
    const totalTests = Object.values(aggregated).reduce((sum, codec) => sum + codec.tests.length, 0);

    console.log(`\nAggregation complete!`);
    console.log(`- Total codecs tested: ${codecCount}`);
    console.log(`- Total test results: ${totalTests}`);
    console.log(`- Output written to: ${OUTPUT_FILE}`);

    // Show some sample statistics
    const sortedBySupport = Object.values(aggregated)
      .sort((a, b) => parseFloat(b.supportPercentage) - parseFloat(a.supportPercentage))
      .slice(0, 5);

    console.log(`\nTop 5 most supported codecs:`);
    sortedBySupport.forEach(codec => {
      console.log(`  ${codec.codecString}: ${codec.supportPercentage}% (${codec.supportedDevices}/${codec.totalTests} devices)`);
    });

  } catch (error) {
    console.error('Error aggregating results:', error);
    process.exit(1);
  }
}

main();

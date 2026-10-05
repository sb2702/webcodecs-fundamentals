#!/usr/bin/env node
/**
 * Snippet sync — rewrites code blocks in the docs from the webcodecs-examples repo,
 * so the code on the site is always the code that runs (and is tested) in the demos.
 *
 * In an .mdx file, put a marker on the line before a fenced code block:
 *
 *   {/* snippet: src/moq/moq-publisher.ts *\/}           whole file
 *   {/* snippet: src/moq/hang.ts#varint *\/}             lines between `#region varint` and `#endregion varint`
 *
 * Paths are relative to the examples repo (default: ../webcodecs-examples, next to this repo).
 *
 * Usage: node scripts/sync-snippets.cjs [--check] [--examples <dir>]
 *
 *   --check     don't write anything; exit 1 if any snippet is out of date (for CI)
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../src/content/docs');
const argExamples = process.argv.indexOf('--examples');
const EXAMPLES_DIR = argExamples !== -1
  ? path.resolve(process.argv[argExamples + 1])
  : path.join(__dirname, '../../webcodecs-examples');
const CHECK = process.argv.includes('--check');

const MARKER = /^\s*\{\/\*\s*snippet:\s*([^\s#*]+)(?:#([\w-]+))?\s*\*\/\}\s*$/;
const FENCE_OPEN = /^\s*(`{3,})\S*/;
const REGION_LINE = /^\s*(\/\/|<!--)\s*#(end)?region\b/;

function readSnippet(file, region) {
  const fullPath = path.join(EXAMPLES_DIR, file);
  if (!fs.existsSync(fullPath)) throw new Error(`missing source file: ${fullPath}`);
  let lines = fs.readFileSync(fullPath, 'utf8').replace(/\s+$/, '').split('\n');

  if (region) {
    const start = lines.findIndex((l) => l.includes(`#region ${region}`));
    const end = lines.findIndex((l) => l.includes(`#endregion ${region}`));
    if (start === -1 || end === -1 || end < start) throw new Error(`missing region "${region}" in ${file}`);
    lines = lines.slice(start + 1, end);
  }

  // Region markers are for this script, not for readers
  lines = lines.filter((l) => !REGION_LINE.test(l));

  // Dedent to the least-indented non-empty line
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
  return lines.map((l) => l.slice(indent));
}

function syncFile(mdxPath) {
  const original = fs.readFileSync(mdxPath, 'utf8');
  const lines = original.split('\n');
  const out = [];
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    const marker = lines[i].match(MARKER);
    if (!marker) continue;

    // Copy blank lines up to the code block's opening fence
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) out.push(lines[j++]);
    const open = lines[j]?.match(FENCE_OPEN);
    if (!open) throw new Error(`${mdxPath}:${i + 1}: snippet marker is not followed by a code block`);
    out.push(lines[j]);

    // Find the closing fence (at least as many backticks as the opening one)
    const close = new RegExp(`^\\s*${open[1]}\`*\\s*$`);
    let k = j + 1;
    while (k < lines.length && !close.test(lines[k])) k++;
    if (k === lines.length) throw new Error(`${mdxPath}:${j + 1}: unclosed code block`);

    out.push(...readSnippet(marker[1], marker[2]), lines[k]);
    count++;
    i = k;
  }

  const updated = out.join('\n');
  return { changed: updated !== original, updated, count };
}

function mdxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return mdxFiles(full);
    return entry.name.endsWith('.mdx') ? [full] : [];
  });
}

let stale = 0;
for (const file of mdxFiles(DOCS_DIR)) {
  const { changed, updated, count } = syncFile(file);
  if (!count) continue;
  const rel = path.relative(process.cwd(), file);
  if (!changed) {
    console.log(`  ok       ${rel} (${count} snippets)`);
  } else if (CHECK) {
    console.log(`  STALE    ${rel} (${count} snippets)`);
    stale++;
  } else {
    fs.writeFileSync(file, updated);
    console.log(`  updated  ${rel} (${count} snippets)`);
  }
}

if (CHECK && stale) {
  console.error(`\n${stale} file(s) out of date with ${EXAMPLES_DIR}. Run: node scripts/sync-snippets.cjs`);
  process.exit(1);
}

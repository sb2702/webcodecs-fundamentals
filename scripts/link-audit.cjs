#!/usr/bin/env node
/**
 * Outbound link audit — lists all external domains linked from docs,
 * which pages link to them, and flags common SEO concerns.
 *
 * Usage: node scripts/link-audit.js [--domain <filter>]
 *
 * Examples:
 *   node scripts/link-audit.js
 *   node scripts/link-audit.js --domain freeconvert.com
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../src/content/docs');
const filterDomain = process.argv.indexOf('--domain') !== -1
  ? process.argv[process.argv.indexOf('--domain') + 1]
  : null;

// Domains to skip (your own properties — not worth auditing)
const OWN_DOMAINS = new Set([
  'webcodecsfundamentals.org',
  'free.upscaler.video',
  'katana.video',
  'sambhattacharyya.com',
]);

// Domains that are always fine (high-authority references)
const TRUSTED_DOMAINS = new Set([
  'developer.mozilla.org',
  'en.wikipedia.org',
  'w3c.github.io',
  'www.w3.org',
  'datatracker.ietf.org',
  'gpuweb.github.io',
  'caniuse.com',
  'zenodo.org',
  'huggingface.co',
  'creativecommons.org',
  'schema.org',
  'github.com',
  'npmjs.com',
  'www.npmjs.com',
]);

// Domains flagged for SEO review
const FLAGGED_DOMAINS = new Set([
  'www.freeconvert.com',
  'handbrake.fr',
  'www.remotion.dev',
  'www.diffusion.studio',
  'www.clipchamp.com',
  'streamyard.com',
  'medium.com',
  'sunandakarunajeewa.medium.com',
  'vectorly.io',
  'twitter.com',
  'katana-misc-files.s3.us-east-1.amazonaws.com',
]);

// Only match actual markdown links: [text](url) and ![alt](url)
// Bare URLs in code blocks, inline code, HTML tags, etc. are ignored
const linkRegex = /!?\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;

function stripNonLinkContent(content) {
  // Remove fenced code blocks (``` ... ```)
  content = content.replace(/```[\s\S]*?```/g, '');
  // Remove indented code blocks (4-space / tab indented lines)
  content = content.replace(/^(    |\t).*/gm, '');
  // Remove inline code (`...`)
  content = content.replace(/`[^`]*`/g, '');
  // Remove HTML tags (catches <script>, <style>, href= etc)
  content = content.replace(/<[^>]+>/g, '');
  return content;
}

const files = execSync(`find ${DOCS_DIR} -name "*.md" -o -name "*.mdx"`)
  .toString().trim().split('\n').filter(Boolean);

const domainMap = {};

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const content = stripNonLinkContent(raw);
  const lines = content.split('\n');
  const relFile = file.replace(DOCS_DIR + '/', '');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    linkRegex.lastIndex = 0;
    while ((match = linkRegex.exec(line)) !== null) {
      const url = match[2];
      try {
        const parsed = new URL(url.replace(/[)>,"']+$/, ''));
        const domain = parsed.hostname;
        if (!domainMap[domain]) domainMap[domain] = [];
        const key = `${relFile}::${parsed.href}`;
        if (!domainMap[domain].find(e => e.key === key)) {
          domainMap[domain].push({
            key,
            file: relFile,
            line: i + 1,
            url: parsed.href,
            linkText: match[1] || '',
          });
        }
      } catch (e) {}
    }
  }
}

const sorted = Object.entries(domainMap)
  .filter(([domain]) => !filterDomain || domain.includes(filterDomain))
  .sort((a, b) => b[1].length - a[1].length);

// Categorise
const flagged = sorted.filter(([d]) => FLAGGED_DOMAINS.has(d));
const own = sorted.filter(([d]) => OWN_DOMAINS.has(d));
const trusted = sorted.filter(([d]) => TRUSTED_DOMAINS.has(d));
const other = sorted.filter(([d]) => !FLAGGED_DOMAINS.has(d) && !OWN_DOMAINS.has(d) && !TRUSTED_DOMAINS.has(d));

function printSection(title, entries) {
  if (!entries.length) return;
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log('='.repeat(60));
  for (const [domain, links] of entries) {
    const uniqueFiles = [...new Set(links.map(l => l.file))].length;
    console.log(`\n  ${domain}  (${links.length} link${links.length > 1 ? 's' : ''}, ${uniqueFiles} page${uniqueFiles > 1 ? 's' : ''})`);
    for (const l of links) {
      const label = l.linkText ? ` "${l.linkText}"` : '';
      console.log(`    ${l.file}:${l.line}${label}`);
      console.log(`      ${l.url}`);
    }
  }
}

console.log('\nOUTBOUND LINK AUDIT');
console.log(`Scanned ${files.length} files, found ${Object.keys(domainMap).length} external domains\n`);

printSection('🚩 FLAGGED — consider nofollow or removal', flagged);
printSection('❓ OTHER — review manually', other);
printSection('✅ TRUSTED — high-authority references', trusted);
printSection('🏠 OWN PROPERTIES', own);

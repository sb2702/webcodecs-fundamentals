#!/usr/bin/env node
/**
 * Internal broken link checker — finds all internal links in docs and
 * reports any that don't resolve to an existing file.
 *
 * Usage: node scripts/broken-links.cjs [--verbose]
 *
 * --verbose  Also print all valid links
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCS_DIR = path.join(__dirname, '../src/content/docs');
const PUBLIC_DIR = path.join(__dirname, '../public');
const verbose = process.argv.includes('--verbose');

// Only match actual markdown links: [text](href) and ![alt](href)
const linkRegex = /!?\[([^\]]*)\]\(([^)]+)\)/g;

// File extensions that live in /public, not /docs — check there instead
const ASSET_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|webp|mp4|webm|wasm|txt|pdf|css|js|ico|json|html)$/i;

function stripNonLinkContent(content) {
  content = content.replace(/```[\s\S]*?```/g, '');
  content = content.replace(/^(    |\t).*/gm, '');
  content = content.replace(/`[^`]*`/g, '');
  content = content.replace(/<[^>]+>/g, '');
  return content;
}

// Resolve a link href to an absolute filesystem path.
// Returns:
//   string       — the resolved file path (exists)
//   {missing}    — could not find the file
//   null         — skip (external, anchor-only, mailto)
function resolveLink(href, fromFile) {
  const [pathPart, _anchor] = href.split('#');

  if (!pathPart) return null;                                   // anchor-only
  if (/^https?:\/\/|^mailto:/.test(pathPart)) return null;     // external

  // Astro pages are served at /path/to/page/ (trailing slash).
  // So relative links are resolved from the page's virtual URL directory,
  // not the filesystem directory. e.g. ../muxing from basics/encoder.mdx
  // resolves to /basics/encoder/../muxing = /basics/muxing, not /muxing.
  let virtualPath;

  if (pathPart.startsWith('/')) {
    virtualPath = pathPart;
  } else {
    // Astro serves pages with trailing slashes: /audio/intro/
    // So ../mp3 from /audio/intro/ = /audio/mp3  (only goes up past "intro", not "audio")
    // This matches browser URL resolution from a directory URL.
    const relFile = fromFile.replace(DOCS_DIR, '').replace(/\.(mdx?)$/, '');
    const virtualDir = relFile + '/';
    virtualPath = path.posix.normalize(virtualDir + pathPart);
  }

  // Asset files live in /public, not /docs
  if (ASSET_EXTENSIONS.test(virtualPath)) {
    const fsPath = path.join(PUBLIC_DIR, virtualPath);
    try {
      fs.statSync(fsPath);
      return fsPath; // exists in public
    } catch {
      return { missing: true, tried: [fsPath] };
    }
  }

  // Page files live in DOCS_DIR
  const fsPath = path.join(DOCS_DIR, virtualPath);
  const candidates = [
    fsPath,
    fsPath + '.md',
    fsPath + '.mdx',
    path.join(fsPath, 'index.md'),
    path.join(fsPath, 'index.mdx'),
    fsPath.replace(/\/$/, '') + '.md',
    fsPath.replace(/\/$/, '') + '.mdx',
  ];

  const found = candidates.find(c => {
    try { return fs.statSync(c).isFile(); } catch { return false; }
  });

  if (found) return found;
  return { missing: true, tried: candidates };
}

const files = execSync(`find ${DOCS_DIR} -name "*.md" -o -name "*.mdx"`)
  .toString().trim().split('\n').filter(Boolean);

const broken = [];
const valid = [];

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
      const href = match[2].trim();
      const linkText = match[1];
      const result = resolveLink(href, file);

      if (result === null) continue; // skip

      const entry = { file: relFile, line: i + 1, href, linkText };

      if (result.missing) {
        broken.push({
          ...entry,
          tried: result.tried.map(t =>
            t.replace(DOCS_DIR + '/', '').replace(PUBLIC_DIR + '/', 'public/')
          ),
        });
      } else {
        valid.push({
          ...entry,
          resolvedTo: result
            .replace(DOCS_DIR + '/', '')
            .replace(PUBLIC_DIR + '/', 'public/'),
        });
      }
    }
  }
}

console.log(`\nINTERNAL LINK CHECK`);
console.log(`Scanned ${files.length} files — ${valid.length} valid, ${broken.length} broken\n`);

if (broken.length === 0) {
  console.log('✅ No broken internal links found.');
} else {
  console.log(`❌ ${broken.length} broken link${broken.length > 1 ? 's' : ''}:\n`);
  for (const b of broken) {
    const label = b.linkText ? ` "${b.linkText}"` : '';
    console.log(`  ${b.file}:${b.line}${label}`);
    console.log(`    href: ${b.href}`);
    console.log(`    tried: ${b.tried.join(', ')}`);
    console.log();
  }
}

if (verbose && valid.length) {
  console.log(`\n✅ ${valid.length} valid internal links:\n`);
  for (const v of valid) {
    const label = v.linkText ? ` "${v.linkText}"` : '';
    console.log(`  ${v.file}:${v.line}${label} → ${v.resolvedTo}`);
  }
}

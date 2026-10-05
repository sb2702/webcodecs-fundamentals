// Astro integration: LLM-friendly Markdown versions of the docs.
//
// After each build, writes:
//   /llms.md, /llms.txt   an index organized like the sidebar, linking to each page's Markdown
//   /<slug>.md            a clean Markdown copy of every page (no MDX components, absolute links)
//   /llms-full.txt        every page concatenated, in sidebar order
//
// Pages are read from src/content/docs. Code blocks are kept verbatim; MDX-only syntax, embedded
// <script>/<style>, and large HTML tables (the codec registry) are removed or replaced with a link.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOCS_DIR = 'src/content/docs';
const INDEX_SLUG = 'llms'; // the "LLM Resources" page; its URL is taken by the index itself

export default function llmsMarkdown({ site, title, description, sidebar }) {
  return {
    name: 'llms-markdown',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const pages = readPages(site);
        const sections = groupBySidebar(pages, sidebar);

        let written = 0;
        for (const page of pages.values()) {
          if (page.slug === INDEX_SLUG || page.draft) continue;
          const file = path.join(outDir, `${page.slug}.md`);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, renderPage(page));
          written++;
        }

        const index = renderIndex({ site, title, description, sections });
        fs.writeFileSync(path.join(outDir, 'llms.md'), index);
        fs.writeFileSync(path.join(outDir, 'llms.txt'), index);

        const full = sections.flatMap((s) => s.pages).map(renderPage).join('\n\n---\n\n');
        fs.writeFileSync(path.join(outDir, 'llms-full.txt'), `# ${title}\n\n> ${description}\n\n---\n\n${full}`);

        logger.info(`wrote llms.md, llms.txt, llms-full.txt and ${written} page .md files`);
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Reading pages
// ---------------------------------------------------------------------------

function readPages(site) {
  const pages = new Map();
  for (const file of walk(DOCS_DIR)) {
    const rel = path.relative(DOCS_DIR, file).replace(/\\/g, '/');
    const slug = rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '$1').replace(/\/$/, '') || 'index';
    const source = fs.readFileSync(file, 'utf8');
    const { data, body } = frontmatter(source);
    const pageUrl = new URL(slug === 'index' ? '/' : `/${slug}/`, site);

    const markdown = cleanMarkdown(body, { pageUrl, site, mdx: file.endsWith('.mdx') });
    pages.set(slug, {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      pageUrl: pageUrl.href,
      mdUrl: new URL(`/${slug}.md`, site).href,
      markdown,
      // Placeholder pages ("Coming soon") aren't worth an LLM's time
      draft: markdown.replace(/\s+/g, ' ').trim().length < 200,
    });
  }
  return pages;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.mdx?$/.test(entry.name) ? [full] : [];
  });
}

// Frontmatter here is single-line `key: value` pairs, optionally quoted
function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim();
    if (/^".*"$/.test(value)) data[kv[1]] = value.slice(1, -1).replace(/\\(["\\])/g, '$1');
    else if (/^'.*'$/.test(value)) data[kv[1]] = value.slice(1, -1).replace(/''/g, "'");
    else data[kv[1]] = value;
  }
  return { data, body: source.slice(match[0].length) };
}

// ---------------------------------------------------------------------------
// Cleaning: MDX/HTML -> plain Markdown, leaving code blocks untouched
// ---------------------------------------------------------------------------

function cleanMarkdown(body, { pageUrl, site, mdx }) {
  const out = [];
  const lines = body.split('\n');
  let fence = null; // the open fence marker, e.g. "```"
  let skipUntil = null; // closing tag of a removed multi-line block
  let tableRows = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks pass through verbatim (dedented, since MDX tabs indent fences)
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fence) {
      out.push(line);
      if (fenceMatch && trimmed.startsWith(fence) && trimmed.replace(/[`~]/g, '') === '') fence = null;
      continue;
    }
    if (fenceMatch) {
      fence = fenceMatch[1];
      out.push(trimmed);
      continue;
    }

    // Removed multi-line blocks: <script>, <style>, and HTML tables
    if (skipUntil) {
      if (skipUntil === '</table>' && /<tr[\s>]/.test(line)) tableRows++;
      if (line.includes(skipUntil)) {
        if (skipUntil === '</table>') {
          out.push(`_(Table with ${Math.max(tableRows - 1, 0)} rows omitted. See ${pageUrl.href} or the [codec support dataset](${new URL('/datasets/codec-support/', site).href}).)_`);
        }
        skipUntil = null;
      }
      continue;
    }
    const block = trimmed.match(/^<(script|style|table)[\s>]/);
    if (block) {
      skipUntil = `</${block[1]}>`;
      tableRows = 0;
      if (line.includes(skipUntil)) skipUntil = null;
      continue;
    }

    // MDX-only syntax
    if (mdx && /^import\s.+\sfrom\s+['"].+['"];?$/.test(trimmed)) continue;
    if (/^\{\/\*.*\*\/\}$/.test(trimmed)) continue;

    // Layout wrappers and components with no Markdown meaning
    if (/^<\/?(Tabs|details|div|Aside)(\s[^>]*)?>$/.test(trimmed) || trimmed === '</TabItem>') continue;

    const tab = trimmed.match(/^<TabItem\s+label\s*=\s*["']([^"']+)["']\s*>$/);
    if (tab) { out.push(`**${tab[1]}**`); continue; }

    const summary = trimmed.match(/^<summary>\s*(.*?)\s*<\/summary>$/);
    if (summary) { out.push(`**${summary[1]}**`); continue; }

    // Iframes (possibly spread over several lines) become a link to the demo
    if (/^<iframe\b/.test(trimmed)) {
      let tag = trimmed;
      while (!/>/.test(tag) && i + 1 < lines.length) tag += ' ' + lines[++i].trim();
      const src = tag.match(/\ssrc=["']([^"']+)["']/)?.[1];
      if (src) out.push(`[Interactive demo](${new URL(src, pageUrl).href})`);
      if (!/<\/iframe>/.test(tag)) skipUntil = '</iframe>';
      continue;
    }

    out.push(rewriteInline(line, { pageUrl, site }));
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// Inline fixes outside code: components and HTML -> Markdown, and absolute links (docs pages -> their .md)
function rewriteInline(line, { pageUrl, site }) {
  const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`))?.[1];

  // Leave inline code spans alone
  return line.split(/(`[^`]*`)/).map((part) => {
    if (part.startsWith('`')) return part;
    return part
      .replace(/<Badge\s[^>]*text=["']([^"']+)["'][^>]*\/>/g, '$1')
      // Media: <video>/<audio>/<source src> -> link, <img> -> image
      .replace(/<(video|audio|source)\b[^>]*>/g, (tag, kind) => {
        const src = attr(tag, 'src');
        const isAudio = kind === 'audio' || /\.(mp3|m4a|aac|opus|ogg|wav|flac)$/i.test(src ?? '');
        return src ? `[${isAudio ? 'Audio' : 'Video'}: ${path.basename(src)}](${src})` : '';
      })
      .replace(/<\/(video|audio)>/g, '')
      .replace(/<img\b[^>]*>/g, (tag) => `![${attr(tag, 'alt') ?? ''}](${attr(tag, 'src') ?? ''})`)
      // Formatting tags
      .replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<\/?(strong|b)>/g, '**')
      .replace(/<\/?(em|i)>/g, '_')
      .replace(/<br\s*\/?>/g, '')
      .replace(/<\/?(p|small|span|mark|sup|sub)(\s[^>]*)?>/g, '')
      // Embedded widgets (e.g. the newsletter form) have no Markdown equivalent
      .replace(/<div\b[^>]*>\s*<\/div>/g, '')
      .replace(/(\]\()([^)\s]+)(\))/g, (_, open, href, close) => open + absolutize(href, { pageUrl, site }) + close);
  }).join('');
}

function absolutize(href, { pageUrl, site }) {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const url = new URL(href, pageUrl);
  if (url.origin !== new URL(site).origin) return url.href;

  // Docs pages get their Markdown twin; assets, demos and anchors on other pages stay as-is
  const isAsset = /\.[a-z0-9]{2,5}$/i.test(url.pathname) || /^\/(assets|demo|codecs)\//.test(url.pathname);
  if (isAsset) return url.href;
  const slug = url.pathname.replace(/^\/|\/$/g, '') || 'index';
  return new URL(`/${slug}.md${url.hash}`, site).href;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function groupBySidebar(pages, sidebar) {
  const used = new Set([INDEX_SLUG]);
  const sections = [];

  const home = pages.get('index');
  if (home) { sections.push({ label: 'Start here', pages: [home] }); used.add('index'); }

  for (const group of sidebar) {
    const items = (group.items ?? [])
      .map((item) => pages.get(item.slug))
      .filter((page) => page && !page.draft && !used.has(page.slug));
    items.forEach((page) => used.add(page.slug));
    if (items.length) sections.push({ label: group.label, pages: items });
  }

  const rest = [...pages.values()].filter((page) => !used.has(page.slug) && !page.draft);
  if (rest.length) sections.push({ label: 'More pages', pages: rest.sort((a, b) => a.slug.localeCompare(b.slug)) });

  return sections;
}

function renderIndex({ site, title, description, sections }) {
  const lines = [
    `# ${title}`,
    '',
    `> ${description}`,
    '',
    'Each link below is a clean Markdown version of a documentation page. For any page, replace the trailing `/` in its URL with `.md` to get its Markdown.',
    '',
  ];
  for (const section of sections) {
    lines.push(`## ${section.label}`, '');
    for (const page of section.pages) {
      lines.push(`- [${page.title}](${page.mdUrl})${page.description ? `: ${page.description}` : ''}`);
    }
    lines.push('');
  }
  lines.push('## Optional', '', `- [Complete documentation](${new URL('/llms-full.txt', site).href}): every page above in a single file`, '');
  return lines.join('\n');
}

function renderPage(page) {
  const header = [`# ${page.title}`, ''];
  if (page.description) header.push(`> ${page.description}`, '');
  header.push(`Source: ${page.pageUrl}`, '');
  return header.join('\n') + '\n' + page.markdown + '\n';
}

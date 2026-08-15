const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiaoqianran.github.io/web-009-rainmorime-clone';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/web-009-rainmorime-clone';
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ''),
        title: data.title || file,
        date: data.date || '',
        excerpt: data.excerpt || '',
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function extractQuotedProps(source, key) {
  const re = new RegExp(key + ":\\s*'([^']+)'", 'g');
  const values = [];
  let match;
  while ((match = re.exec(source))) {
    if (!values.includes(match[1])) values.push(match[1]);
  }
  return values;
}

function extractExportBlock(source, exportName) {
  const marker = 'export const ' + exportName;
  const start = source.indexOf(marker);
  if (start === -1) return '';
  const from = source.slice(start);
  const next = from.slice(marker.length).search(/\nexport const /);
  return next === -1 ? from : from.slice(0, marker.length + next);
}

function parseDetailSlugs() {
  const projectsSrc = fs.readFileSync(path.join(__dirname, '..', 'data', 'projects.ts'), 'utf8');
  const lifeSrc = fs.readFileSync(path.join(__dirname, '..', 'data', 'life.ts'), 'utf8');
  return {
    webSlugs: extractQuotedProps(extractExportBlock(projectsSrc, 'webProjects'), 'slug'),
    gameSlugs: extractQuotedProps(extractExportBlock(projectsSrc, 'gameProjects'), 'slug'),
    lifeIds: extractQuotedProps(lifeSrc, 'id'),
  };
}

const posts = getPosts();
const origin = SITE_URL.replace(/\/$/, '');
const { webSlugs, gameSlugs, lifeIds } = parseDetailSlugs();

const items = posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${origin}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${origin}/blog/${post.slug}/</guid>
      <pubDate>${post.date ? new Date(post.date).toUTCString() : new Date().toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`
  )
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>RAINMORIME</title>
    <link>${origin}/</link>
    <description>森雨(RainMorime)的个人网站</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/content/', priority: '0.8', changefreq: 'weekly' },
  { path: '/friends/', priority: '0.5', changefreq: 'monthly' },
  { path: '/game/', priority: '0.4', changefreq: 'monthly' },
];

const staticEntries = staticPages
  .map(
    (page) => `  <url>
    <loc>${origin}${page.path === '/' ? '/' : page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n');

const blogEntries = posts
  .map(
    (post) => `  <url>
    <loc>${origin}/blog/${post.slug}/</loc>
    <lastmod>${post.date || ''}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n');

function detailEntries(prefix, slugs, priority) {
  return slugs
    .map(
      (slug) => `  <url>
    <loc>${origin}/${prefix}/${slug}/</loc>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('\n');
}

const webEntries = detailEntries('web', webSlugs, '0.6');
const gameEntries = detailEntries('game', gameSlugs, '0.6');
const lifeEntries = detailEntries('life', lifeIds, '0.5');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
${webEntries}
${gameEntries}
${lifeEntries}
</urlset>
`;

fs.mkdirSync(PUBLIC_DIR, { recursive: true });
fs.writeFileSync(path.join(PUBLIC_DIR, 'rss.xml'), rss);
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap);
console.log(`Wrote rss.xml (${posts.length} posts) and sitemap.xml (${webSlugs.length} web, ${gameSlugs.length} game, ${lifeIds.length} life)`);

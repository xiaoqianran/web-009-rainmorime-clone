# Build notes

## What was overlaid
- Template tree fetched via gh api from RainMorime/rainmorime-template (MIT). Skipped docs/preview.png, .env.example, stray ` -i` blob.
- Live TS/TSX/data from /workspace/rainmorime-recon/sources/ (data/*, components, pages, game engine, friendLinks).
- Recovered blog MDX from /workspace/rainmorime-recon/blog-mdx/*.recovered.mdx with meta.json frontmatter (8 posts).
- public/avatar.jpg, public/travel.svg from the live site. Template fonts kept.

## What was NOT overlaid
- All css-loader compiled SCSS (Home.module.scss 372KB, Game.module.scss 150KB, etc.). Template SCSS kept.
- Game.module.scss recovered earlier from css-loader locals (dehashed class names) because the template has no Game styles.
- ActivationLever.tsx kept as drag-down (live extraction was onClick-only; live site requires drag).
- useRealtimeStats.ts rewritten for static hosting (localStorage visits / local runtime; no /api/stats or SSE).
- pages/_app.tsx kept typed; Umami script removed from _document.tsx.
- pages/rss.xml.tsx and sitemap.xml.tsx (getServerSideProps) replaced by scripts/generate-feeds.js writing public/rss.xml and public/sitemap.xml.

## GitHub Pages adaptations
- next.config.js: output export, trailingSlash, images.unoptimized, basePath/assetPrefix /web-009-rainmorime-clone
- remotePatterns include rainmorime-1315830626.cos.ap-beijing.myqcloud.com
- CSS url() for fonts/avatar/terrain prefixed with basePath
- blog fallback: false (required for static export)
- public/.nojekyll for _next on Pages

## Remaining visual gaps
- Home.module.scss is the template SCSS, not the live compiled CSS. Friend-link / contact / about tokens should mostly match via _sections.scss, but some live-only tweaks may be missing.
- texture-noise.png referenced by the loading screen is not present (template also lacked it).
- Live /api/stats and SSE online-count are stubbed (localStorage + currentVisitors=1).
- Music tracks are COS URLs, not downloaded locally. Player should not crash if a track 404s.
- Mini-game (/game) styles come from recovered Game.module.scss; some animation names may differ from production hashes.
- No Umami. No custom Node server.js in production.
- Favicon is avatar.jpg (live favicon.ico was 404).

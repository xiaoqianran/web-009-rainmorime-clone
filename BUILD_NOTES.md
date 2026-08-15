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

## Stack upgrade (2026-08-15)

Refreshed the existing clone to the newest compatible libraries. Pages router and GitHub Pages static export kept (`output: 'export'`, `images.unoptimized`, `trailingSlash`, `basePath`/`assetPrefix` `/web-009-rainmorime-clone`). Loading-screen skip/0% patch (7fa762b) left intact.

- next 16.3.1, react/react-dom 19.2.8, typescript 7.0.2, sass 1.102.0, gsap 3.15.0
- three 0.185.1 + @types/three 0.185.4, @react-three/fiber 9.7.0, @react-three/drei 10.7.8
- next-mdx-remote 6.0.0, gray-matter 4.0.3, reading-time 1.5.0, clsx 2.1.1, react-copy-to-clipboard 5.1.1
- @next/bundle-analyzer bumped to 16.3.1 (unused in next.config.js)
- dotenv 17.4.2; engines.node set to >=20.9.0
- next.config.js: dropped removed `swcMinify`
- tsconfig: TypeScript 7 removed `target: es5` and `baseUrl`; now `target: ES2017`, relative `paths`, `jsx: react-jsx`

### Could not take to a newer major

- **@react-three/cannon** remains **6.6.0** — that is the latest published release. The package is unmaintained (peers: react>=18, fiber>=8). It still installs and the production build succeeds with fiber 9 / React 19. TesseractExperience keeps using `Physics` / `usePlane` / `useBox`. Successor would be @react-three/rapier (not swapped in this pass).
- **cannon-es** remains **0.20.0** (latest).
- **next-mdx-remote**, **gray-matter**, **reading-time**, **clsx** were already at latest.
- Sass `@import` in `styles/Home.module.scss` emits Dart Sass 3.0 deprecation warnings. Not migrated to `@use` in this pass.
- Transitive `camera-controls@3.1.2` (via drei) wants Node >=22; Next 16 only requires Node 20.9+. Warning only; CI stays on Node 20.

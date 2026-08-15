# rainmorime clone

Faithful static clone of [rainmorime.com](https://rainmorime.com) for GitHub Pages. Pages router, static export — not a rewrite and not a new fork of rainmorime-template.

**Pages:** https://xiaoqianran.github.io/web-009-rainmorime-clone/

See [BUILD_NOTES.md](./BUILD_NOTES.md) for overlay history and upgrade notes.

## Develop

```bash
npm install
npm run dev
```

Open `http://localhost:3000/web-009-rainmorime-clone/` (`basePath` / `assetPrefix` is `/web-009-rainmorime-clone`).

```bash
npm run build   # writes out/
```

Node.js 20.9+ required (Next.js 16).

## Stack (2026-08-15)

| Package | Version |
|---------|---------|
| next | 16.3.1 |
| react / react-dom | 19.2.8 |
| typescript | 7.0.2 |
| sass | 1.102.0 |
| gsap | 3.15.0 |
| three | 0.185.1 |
| @react-three/fiber | 9.7.0 |
| @react-three/drei | 10.7.8 |
| @react-three/cannon | 6.6.0 (latest; package is unmaintained) |
| cannon-es | 0.20.0 |
| next-mdx-remote | 6.0.0 |
| gray-matter | 4.0.3 |
| reading-time | 1.5.0 |
| clsx | 2.1.1 |
| react-copy-to-clipboard | 5.1.1 |
